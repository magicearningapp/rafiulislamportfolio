import { useState, type FormEvent, type KeyboardEvent } from "react";
import { PhotoCommentItem } from "../types";
import {
  addPhotoComment,
  deletePhotoComment,
  getClientId,
  getStoredCommenterName,
  setStoredCommenterName,
} from "../lib/reactionsAndComments";
import { Send, Trash2, MessageCircle, User, Sparkles, Clock } from "lucide-react";

interface PhotoCommentsSectionProps {
  photoId: string;
  comments: PhotoCommentItem[];
  variant?: "inline" | "lightbox";
  onToast?: (msg: string) => void;
  isAdmin?: boolean;
}

function formatRelativeTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return "Just now";
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "Recently";
  }
}

// Generate an avatar color based on name
function getAvatarGradient(name: string): string {
  const colors = [
    "from-blue-500 to-indigo-600",
    "from-emerald-500 to-teal-600",
    "from-rose-500 to-pink-600",
    "from-amber-500 to-orange-600",
    "from-purple-500 to-violet-600",
    "from-cyan-500 to-blue-600",
  ];
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return colors[sum % colors.length];
}

export default function PhotoCommentsSection({
  photoId,
  comments = [],
  variant = "inline",
  onToast,
  isAdmin = false,
}: PhotoCommentsSectionProps) {
  const [authorName, setAuthorName] = useState(() => getStoredCommenterName());
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const clientId = getClientId();
  const isDark = variant === "lightbox";

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!commentText.trim()) return;

    const trimmedName = authorName.trim();
    if (!trimmedName) {
      onToast?.("অনুগ্রহ করে আপনার নাম লিখুন (Please enter your name)");
      return;
    }

    try {
      setIsSubmitting(true);
      setStoredCommenterName(trimmedName);
      await addPhotoComment(photoId, trimmedName, commentText.trim(), clientId);
      setCommentText("");
      onToast?.("✨ মন্তব্য পোস্ট করা হয়েছে! (Comment posted!)");
    } catch {
      onToast?.("Could not post comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleDelete = async (comment: PhotoCommentItem) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      setDeletingId(comment.id);
      await deletePhotoComment(comment.id);
      onToast?.("Comment deleted.");
    } catch {
      onToast?.("Could not delete comment.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div
      className={`space-y-4 ${
        isDark ? "text-zinc-200" : "text-zinc-800"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-2.5 border-[#8FAF72]/20">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-4 h-4 text-[#2F5D3A]" />
          <h4 className="font-bold text-sm tracking-tight">
            Comments{" "}
            <span className="text-xs font-normal text-[#4E5E4E] dark:text-[#8FAF72]/70">
              ({comments.length})
            </span>
          </h4>
        </div>
        <span className="text-[11px] text-[#4E5E4E] dark:text-[#8FAF72]/70">
          Leave your feedback
        </span>
      </div>

      {/* Input Box: Name + Comment */}
      <form onSubmit={handleSubmit} className="space-y-2.5">
        {/* Name Input Field */}
        <div className="relative flex items-center">
          <div className="absolute left-3 text-[#4E5E4E] dark:text-[#8FAF72]/70 pointer-events-none">
            <User className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="আপনার নাম লিখুন / Your Name"
            maxLength={40}
            required
            className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border outline-hidden transition-all ${
              isDark
                ? "bg-[#173522]/80 border-[#8FAF72]/30 text-white placeholder-[#8FAF72]/60 focus:border-[#8FAF72]"
                : "bg-[#F4F1E6] border-[#8FAF72]/35 text-[#172117] placeholder-[#4E5E4E]/70 focus:bg-white focus:border-[#2F5D3A] shadow-2xs"
            }`}
          />
        </div>

        {/* Comment Textarea & Submit */}
        <div className="relative">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="একটি চমৎকার মন্তব্য লিখুন... / Write a comment..."
            rows={2}
            maxLength={600}
            required
            className={`w-full p-2.5 text-xs rounded-lg border outline-hidden resize-none transition-all ${
              isDark
                ? "bg-[#173522]/80 border-[#8FAF72]/30 text-white placeholder-[#8FAF72]/60 focus:border-[#8FAF72]"
                : "bg-[#F4F1E6] border-[#8FAF72]/35 text-[#172117] placeholder-[#4E5E4E]/70 focus:bg-white focus:border-[#2F5D3A] shadow-2xs"
            }`}
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-[#4E5E4E]">
              Press <kbd className="px-1 py-0.5 rounded bg-[#8FAF72]/30 dark:bg-white/10 text-[9px] text-[#172117] dark:text-white">Enter ↵</kbd> to send
            </span>

            <button
              type="submit"
              disabled={isSubmitting || !commentText.trim()}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#2F5D3A] hover:bg-[#1F452B] disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-3 h-3" />
              )}
              <span>Post</span>
            </button>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div
        className={`space-y-2.5 ${
          isDark ? "pr-1" : "max-h-60 overflow-y-auto pr-1"
        }`}
      >
        {comments.length === 0 ? (
          <div
            className={`text-center py-6 px-3 rounded-xl border border-dashed ${
              isDark
                ? "border-[#8FAF72]/20 bg-white/5 text-[#8FAF72]/90"
                : "border-[#8FAF72]/35 bg-[#F4F1E6]/70 text-[#4E5E4E]"
            }`}
          >
            <Sparkles className="w-5 h-5 mx-auto mb-1.5 text-[#8FAF72]" />
            <p className="text-xs font-medium">প্রথম মন্তব্যটি আপনিই করুন!</p>
            <p className="text-[11px] opacity-75">Be the first to share your thoughts on this photo.</p>
          </div>
        ) : (
          comments.map((comment) => {
            const isMyComment = comment.clientKey === clientId || isAdmin;
            const initials = comment.authorName.slice(0, 2).toUpperCase() || "U";
            const gradient = getAvatarGradient(comment.authorName);

            return (
              <div
                key={comment.id}
                className={`p-2.5 rounded-xl transition-colors ${
                  isDark ? "bg-white/5 hover:bg-white/10" : "bg-[#F4F1E6]/70 hover:bg-[#F4F1E6]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start space-x-2 min-w-0">
                    {/* Avatar Initials Badge */}
                    <div
                      className={`w-6 h-6 rounded-full bg-gradient-to-br ${gradient} text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-xs`}
                    >
                      {initials}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-[#172117] dark:text-white truncate">
                          {comment.authorName}
                        </span>
                        <span className="inline-flex items-center space-x-0.5 text-[10px] text-[#4E5E4E]">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{formatRelativeTime(comment.createdAt)}</span>
                        </span>
                      </div>
                      <p className="text-xs text-[#172117] dark:text-[#F4F1E6] mt-1 whitespace-pre-wrap break-words leading-relaxed">
                        {comment.text}
                      </p>
                    </div>
                  </div>

                  {/* Delete button if user or admin */}
                  {isMyComment && (
                    <button
                      type="button"
                      disabled={deletingId === comment.id}
                      onClick={() => handleDelete(comment)}
                      className="text-zinc-400 hover:text-red-500 p-1 rounded transition-colors shrink-0 cursor-pointer"
                      title="Delete comment"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
