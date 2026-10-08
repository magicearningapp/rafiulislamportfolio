import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  ReactionType,
  PhotoReactionSummary,
  PhotoCommentItem,
} from "../types";

export const REACTIONS_COLLECTION = "photo_reactions";
export const COMMENTS_COLLECTION = "photo_comments";

// Generate or retrieve persistent visitor client ID
export function getClientId(): string {
  if (typeof window === "undefined") return "server_client";
  let id = localStorage.getItem("raf_visitor_id");
  if (!id) {
    id = "vis_" + Math.random().toString(36).slice(2, 10) + "_" + Date.now().toString(36);
    try {
      localStorage.setItem("raf_visitor_id", id);
    } catch {
      // ignore
    }
  }
  return id;
}

// Remember visitor's commenter name
export function getStoredCommenterName(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem("raf_commenter_name") || "";
  } catch {
    return "";
  }
}

export function setStoredCommenterName(name: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("raf_commenter_name", name);
  } catch {
    // ignore
  }
}

// Initial empty counts helper
export function createEmptyReactionCounts(): Record<ReactionType, number> {
  return {
    like: 0,
    love: 0,
    care: 0,
    haha: 0,
    wow: 0,
    sad: 0,
    angry: 0,
  };
}

/**
 * Subscribe to all reactions across the gallery in real-time
 */
export function subscribeToAllReactions(
  clientId: string,
  callback: (reactionsMap: Record<string, PhotoReactionSummary>) => void
): () => void {
  try {
    const unsub = onSnapshot(
      collection(db, REACTIONS_COLLECTION),
      (snapshot) => {
        const result: Record<string, PhotoReactionSummary> = {};
        snapshot.forEach((d) => {
          const data = d.data();
          const photoId = d.id;
          const counts: Record<ReactionType, number> = {
            ...createEmptyReactionCounts(),
            ...(data.counts || {}),
          };
          const users: Record<string, ReactionType> = (data.users || {}) as Record<string, ReactionType>;
          const userReaction: ReactionType | null = users[clientId] || null;
          const total: number = (Object.values(counts) as number[]).reduce<number>(
            (acc, val) => acc + (Number(val) || 0),
            0
          );

          result[photoId] = {
            photoId,
            counts,
            total,
            userReaction,
          };
        });
        callback(result);
      },
      (error) => {
        console.warn("Firestore reactions subscribe warning:", error);
      }
    );
    return unsub;
  } catch (err) {
    console.warn("Could not subscribe to reactions:", err);
    return () => {};
  }
}

/**
 * Toggle or update a user's Facebook reaction on a photo
 */
export async function togglePhotoReaction(
  photoId: string,
  clientId: string,
  reaction: ReactionType
): Promise<void> {
  const docRef = doc(db, REACTIONS_COLLECTION, photoId);
  try {
    const snap = await getDoc(docRef);
    let counts = createEmptyReactionCounts();
    let users: Record<string, ReactionType> = {};

    if (snap.exists()) {
      const data = snap.data();
      counts = { ...counts, ...(data.counts || {}) };
      users = { ...(data.users || {}) };
    }

    const currentReaction = users[clientId];

    if (currentReaction === reaction) {
      // Toggle off / remove reaction
      counts[reaction] = Math.max(0, (counts[reaction] || 0) - 1);
      delete users[clientId];
    } else {
      // Remove previous reaction if any
      if (currentReaction && counts[currentReaction]) {
        counts[currentReaction] = Math.max(0, counts[currentReaction] - 1);
      }
      // Add new reaction
      counts[reaction] = (counts[reaction] || 0) + 1;
      users[clientId] = reaction;
    }

    const total = Object.values(counts).reduce((acc, val) => acc + (Number(val) || 0), 0);

    await setDoc(
      docRef,
      {
        photoId,
        counts,
        users,
        total,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Failed to toggle reaction:", error);
    throw error;
  }
}

/**
 * Subscribe to all photo comments across the gallery in real-time
 */
export function subscribeToAllComments(
  callback: (commentsMap: Record<string, PhotoCommentItem[]>) => void
): () => void {
  try {
    const unsub = onSnapshot(
      collection(db, COMMENTS_COLLECTION),
      (snapshot) => {
        const commentsByPhoto: Record<string, PhotoCommentItem[]> = {};

        snapshot.forEach((d) => {
          const data = d.data();
          const item: PhotoCommentItem = {
            id: d.id,
            photoId: data.photoId || "",
            authorName: data.authorName || "Anonymous",
            text: data.text || "",
            createdAt: data.createdAt || new Date().toISOString(),
            clientKey: data.clientKey || "",
          };

          if (!commentsByPhoto[item.photoId]) {
            commentsByPhoto[item.photoId] = [];
          }
          commentsByPhoto[item.photoId].push(item);
        });

        // Sort comments chronological (oldest to newest or newest first)
        Object.keys(commentsByPhoto).forEach((photoId) => {
          commentsByPhoto[photoId].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });

        callback(commentsByPhoto);
      },
      (error) => {
        console.warn("Firestore comments subscribe warning:", error);
      }
    );
    return unsub;
  } catch (err) {
    console.warn("Could not subscribe to comments:", err);
    return () => {};
  }
}

/**
 * Add a new comment with author name to a photo
 */
export async function addPhotoComment(
  photoId: string,
  authorName: string,
  text: string,
  clientKey: string
): Promise<PhotoCommentItem> {
  const trimmedName = authorName.trim() || "Guest Visitor";
  const trimmedText = text.trim();

  if (!trimmedText) {
    throw new Error("Comment text cannot be empty");
  }

  // Save commenter name for future comments
  setStoredCommenterName(trimmedName);

  const commentId = "cmt_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
  const newComment: PhotoCommentItem = {
    id: commentId,
    photoId,
    authorName: trimmedName,
    text: trimmedText,
    createdAt: new Date().toISOString(),
    clientKey,
  };

  const docRef = doc(db, COMMENTS_COLLECTION, commentId);
  await setDoc(docRef, newComment);

  return newComment;
}

/**
 * Delete a comment by ID
 */
export async function deletePhotoComment(commentId: string): Promise<void> {
  const docRef = doc(db, COMMENTS_COLLECTION, commentId);
  await deleteDoc(docRef);
}
