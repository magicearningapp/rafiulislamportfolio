import React, { useState, useEffect, ChangeEvent } from "react";
import { ProfileData, SkillItem, ProjectItem, PhotoItem, ContactData, TestimonialItem, TimelineItem, CaseStudyItem, CANDIDATE_IMAGE_OPTIONS } from "../types";
import { savePortfolioToCloud, resetCloudPortfolioToDefaults, db } from "../lib/firebase";
import { collection, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { compressImageFile, processUniversalPhoto } from "../lib/imageUtils";
import { safeSetLocalStorage, safeGetLocalStorage } from "../lib/storage";
import { resolveProjectImage } from "../lib/projectImages";
import { useThemeLanguage } from "../context/ThemeLanguageContext";
import AdminTimelineTab from "./admin/AdminTimelineTab";
import AdminCaseStudiesTab from "./admin/AdminCaseStudiesTab";
import AdminTestimonialsTab from "./admin/AdminTestimonialsTab";
import {
  User,
  Sparkles,
  FolderGit2,
  Camera,
  PhoneCall,
  Lock,
  LogOut,
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  Save,
  Check,
  Upload,
  AlertCircle,
  Eye,
  Key,
  RotateCcw,
  ShieldCheck,
  MapPin,
  Calendar,
  Wand2,
  Tag,
  Loader2,
  Layers,
  X,
  FileImage,
  Star,
  Inbox,
  MessageSquare,
  Briefcase,
  TrendingUp,
  Sun,
  Moon,
} from "lucide-react";

interface AdminPanelProps {
  profile: ProfileData;
  setProfile: React.Dispatch<React.SetStateAction<ProfileData>>;
  skills: SkillItem[];
  setSkills: React.Dispatch<React.SetStateAction<SkillItem[]>>;
  projects: ProjectItem[];
  setProjects: React.Dispatch<React.SetStateAction<ProjectItem[]>>;
  photos: PhotoItem[];
  setPhotos: React.Dispatch<React.SetStateAction<PhotoItem[]>>;
  contact: ContactData;
  setContact: React.Dispatch<React.SetStateAction<ContactData>>;
  testimonials?: TestimonialItem[];
  setTestimonials?: React.Dispatch<React.SetStateAction<TestimonialItem[]>>;
  timeline?: TimelineItem[];
  setTimeline?: React.Dispatch<React.SetStateAction<TimelineItem[]>>;
  caseStudies?: CaseStudyItem[];
  setCaseStudies?: React.Dispatch<React.SetStateAction<CaseStudyItem[]>>;
  onClose: () => void;
  onResetDefaults: () => void;
}

export default function AdminPanel({
  profile,
  setProfile,
  skills,
  setSkills,
  projects,
  setProjects,
  photos,
  setPhotos,
  contact,
  setContact,
  testimonials = [],
  setTestimonials,
  timeline = [],
  setTimeline,
  caseStudies = [],
  setCaseStudies,
  onClose,
  onResetDefaults,
}: AdminPanelProps) {
  const { theme, toggleTheme } = useThemeLanguage();
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("raf_admin_auth") === "true";
  });
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    "profile" | "timeline" | "skills" | "projects" | "caseStudies" | "gallery" | "reviews" | "inquiries" | "contact" | "security"
  >("profile");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Reviews & Inquiries state
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);

  useEffect(() => {
    const fetchPendingData = async () => {
      try {
        // 1. Pending reviews
        const localRev = JSON.parse(safeGetLocalStorage("raf_pending_reviews") || "[]");
        const revSnap = await getDocs(collection(db, "pending_testimonials"));
        const cloudRev = revSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const allRev = [...cloudRev, ...localRev];
        const uniqueRev = Array.from(
          new Map(allRev.map((item) => [item.id || item.createdAt, item])).values()
        );
        setPendingReviews(uniqueRev);

        // 2. Inquiries
        const localInq = JSON.parse(safeGetLocalStorage("raf_inquiries") || "[]");
        const inqSnap = await getDocs(collection(db, "project_inquiries"));
        const cloudInq = inqSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const allInq = [...cloudInq, ...localInq];
        const uniqueInq = Array.from(
          new Map(allInq.map((item) => [item.id || item.createdAt, item])).values()
        );
        setInquiries(uniqueInq);
      } catch (e) {
        console.error("Error fetching admin moderation data:", e);
      }
    };
    if (isAuthenticated) {
      fetchPendingData();
    }
  }, [isAuthenticated, activeTab]);

  const handleApproveReview = async (review: any) => {
    if (!setTestimonials) return;
    const newTestimonial: TestimonialItem = {
      id: `t_${Date.now()}`,
      name: review.name,
      role: review.role || "Client",
      company: review.company || "",
      rating: review.rating || 5,
      quote: review.comment || review.quote || "",
      comment: review.comment || review.quote || "",
      metric: review.metric || "+340% Reach",
      date: "2026",
    };

    const updated = [newTestimonial, ...testimonials];
    setTestimonials(updated);
    safeSetLocalStorage("raf_testimonials", JSON.stringify(updated));

    // Remove from pending
    const remaining = pendingReviews.filter((r) => r.id !== review.id && r.createdAt !== review.createdAt);
    setPendingReviews(remaining);
    safeSetLocalStorage("raf_pending_reviews", JSON.stringify(remaining));

    if (review.id) {
      try {
        await deleteDoc(doc(db, "pending_testimonials", review.id));
      } catch (e) {}
    }

    try {
      await savePortfolioToCloud({ testimonials: updated });
    } catch (e) {}

    showToast("Review approved and published to live Testimonials!");
  };

  const handleRejectReview = async (review: any) => {
    const remaining = pendingReviews.filter((r) => r.id !== review.id && r.createdAt !== review.createdAt);
    setPendingReviews(remaining);
    safeSetLocalStorage("raf_pending_reviews", JSON.stringify(remaining));

    if (review.id) {
      try {
        await deleteDoc(doc(db, "pending_testimonials", review.id));
      } catch (e) {}
    }
    showToast("Review dismissed.");
  };

  const handleDeleteInquiry = async (inq: any) => {
    const remaining = inquiries.filter((i) => i.id !== inq.id && i.createdAt !== inq.createdAt);
    setInquiries(remaining);
    safeSetLocalStorage("raf_inquiries", JSON.stringify(remaining));

    if (inq.id) {
      try {
        await deleteDoc(doc(db, "project_inquiries", inq.id));
      } catch (e) {}
    }
    showToast("Inquiry removed.");
  };

  // Profile Form state
  const [formProfile, setFormProfile] = useState<ProfileData>(profile);

  // Contact Form state
  const [formContact, setFormContact] = useState<ContactData>(contact);

  // Skill Add/Edit State
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [skillForm, setSkillForm] = useState({ name: "", description: "" });
  const [isAddingSkill, setIsAddingSkill] = useState(false);

  // Project Add/Edit State
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState<Omit<ProjectItem, "id">>({
    title: "",
    description: "",
    image: "",
    link: "",
    category: "",
  });
  const [isAddingProject, setIsAddingProject] = useState(false);

  // Photography / Gallery Add/Edit State
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [photoForm, setPhotoForm] = useState<Omit<PhotoItem, "id">>({
    title: "",
    caption: "",
    image: "",
    images: [],
    category: "Nature",
    location: "",
    date: "",
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");
  const [isAddingPhoto, setIsAddingPhoto] = useState(false);
  const [isPhotoConverting, setIsPhotoConverting] = useState(false);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [autoAiOnUpload, setAutoAiOnUpload] = useState(true);

  // Bulk Upload & Multi-Image / Album State
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number } | null>(null);
  const [pendingBulkFiles, setPendingBulkFiles] = useState<File[] | null>(null);
  const [showBulkChoiceModal, setShowBulkChoiceModal] = useState(false);

  // Security Form
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    let storedPass = localStorage.getItem("raf_admin_password");
    if (!storedPass || storedPass === "admin123") {
      storedPass = "Rafiul@SMM#2026";
      localStorage.setItem("raf_admin_password", "Rafiul@SMM#2026");
    }
    if (passwordInput === storedPass) {
      setIsAuthenticated(true);
      sessionStorage.setItem("raf_admin_auth", "true");
      setLoginError("");
      setPasswordInput("");
    } else {
      setLoginError("Invalid password.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("raf_admin_auth");
  };

  // Profile Photo file upload (Supports PNG, JPG, JPEG, DNG, HEIC)
  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const processed = await processUniversalPhoto(file);
        setFormProfile((prev) => ({ ...prev, photo: processed.base64 }));
        showToast(`Profile photo updated (${processed.format.toUpperCase()})`);
      } catch (err: any) {
        console.error("Error processing photo:", err);
        showToast(err.message || "Failed to process photo. Please try JPG or PNG.");
      } finally {
        e.target.value = "";
      }
    }
  };

  // Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(formProfile);
    safeSetLocalStorage("raf_profile", JSON.stringify(formProfile));
    try {
      await savePortfolioToCloud({ profile: formProfile });
      showToast("Profile & Hero details saved and published globally!");
    } catch (err) {
      console.error(err);
      showToast("Saved locally. Publishing to cloud...");
    }
  };

  // Save Contact
  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setContact(formContact);
    safeSetLocalStorage("raf_contact", JSON.stringify(formContact));
    try {
      await savePortfolioToCloud({ contact: formContact });
      showToast("Contact links updated and published globally!");
    } catch (err) {
      console.error(err);
      showToast("Saved locally. Publishing to cloud...");
    }
  };

  // Skill Handlers
  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillForm.name.trim()) return;

    let updated: SkillItem[];
    if (editingSkillId) {
      updated = skills.map((s) =>
        s.id === editingSkillId ? { ...s, name: skillForm.name, description: skillForm.description } : s
      );
      setSkills(updated);
      safeSetLocalStorage("raf_skills", JSON.stringify(updated));
      setEditingSkillId(null);
      showToast("Skill updated successfully!");
    } else {
      const newSkill: SkillItem = {
        id: `s_${Date.now()}`,
        name: skillForm.name,
        description: skillForm.description,
      };
      updated = [...skills, newSkill];
      setSkills(updated);
      safeSetLocalStorage("raf_skills", JSON.stringify(updated));
      setIsAddingSkill(false);
      showToast("New skill added!");
    }
    setSkillForm({ name: "", description: "" });
    try {
      await savePortfolioToCloud({ skills: updated });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSkill = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this skill?")) {
      const updated = skills.filter((s) => s.id !== id);
      setSkills(updated);
      safeSetLocalStorage("raf_skills", JSON.stringify(updated));
      showToast("Skill deleted.");
      try {
        await savePortfolioToCloud({ skills: updated });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleStartEditSkill = (skill: SkillItem) => {
    setEditingSkillId(skill.id);
    setSkillForm({ name: skill.name, description: skill.description || "" });
    setIsAddingSkill(false);
  };

  // Project Image file upload (Supports PNG, JPG, JPEG, DNG, HEIC)
  const handleProjectImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const processed = await processUniversalPhoto(file);
        setProjectForm((prev) => ({ ...prev, image: processed.base64 }));
        showToast(`Project cover updated (${processed.format.toUpperCase()})`);
      } catch (err: any) {
        console.error("Error processing project image:", err);
        showToast(err.message || "Failed to process project image");
      }
    }
  };

  // Project Handlers
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.title.trim()) return;

    let updated: ProjectItem[];
    if (editingProjectId) {
      updated = projects.map((p) =>
        p.id === editingProjectId ? { ...p, ...projectForm } : p
      );
      setProjects(updated);
      safeSetLocalStorage("raf_projects_v4", JSON.stringify(updated));
      setEditingProjectId(null);
      showToast("Project updated successfully!");
    } else {
      const newProj: ProjectItem = {
        id: `p_${Date.now()}`,
        ...projectForm,
      };
      updated = [newProj, ...projects];
      setProjects(updated);
      safeSetLocalStorage("raf_projects_v4", JSON.stringify(updated));
      setIsAddingProject(false);
      showToast("New project added!");
    }
    setProjectForm({ title: "", description: "", image: "", link: "", category: "" });
    try {
      await savePortfolioToCloud({ projects: updated });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      const updated = projects.filter((p) => p.id !== id);
      setProjects(updated);
      safeSetLocalStorage("raf_projects_v4", JSON.stringify(updated));
      showToast("Project removed.");
      try {
        await savePortfolioToCloud({ projects: updated });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleStartEditProject = (p: ProjectItem) => {
    setEditingProjectId(p.id);
    setProjectForm({
      title: p.title,
      description: p.description,
      image: p.image || resolveProjectImage(p),
      link: p.link,
      category: p.category || "",
    });
    setIsAddingProject(false);
  };

  // Analyze Photo with Gemini AI Server-Side
  const analyzePhotoWithAi = async (
    imageBase64: string,
    fileName?: string,
    isAlbum = false,
    albumPhotoCount = 1
  ) => {
    if (!imageBase64) {
      showToast("Please upload or select an image first.");
      return;
    }
    setIsAiAnalyzing(true);
    try {
      const res = await fetch("/api/gemini/analyze-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, fileName, isAlbum, albumPhotoCount }),
      });
      const json = await res.json();
      if (json.data) {
        const d = json.data;
        setPhotoForm((prev) => ({
          ...prev,
          title: d.title || prev.title,
          caption: d.caption || prev.caption,
          category: d.category || prev.category,
          location: d.location || prev.location,
          date: d.date || prev.date || new Date().getFullYear().toString(),
          tags: Array.isArray(d.tags) && d.tags.length > 0 ? d.tags : prev.tags,
        }));
        if (json.success) {
          showToast(
            isAlbum
              ? "✨ Gemini AI generated album series story & tags!"
              : "✨ Gemini AI analyzed image & generated details!"
          );
        } else {
          showToast("Starter details generated. You can customize them.");
        }
      }
    } catch (err) {
      console.error("Gemini AI Analysis Error:", err);
      showToast("Could not run AI analysis. You can enter details manually.");
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  // Photo Handlers (Gallery) - Supports PNG, JPG, JPEG, DNG, HEIC, HEIF
  // Supports single image OR multiple images to form an album post
  const handlePhotoFilesUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsPhotoConverting(true);
    try {
      const newImages: string[] = [];
      let firstFileName = "";
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!firstFileName) firstFileName = file.name;
        const processed = await processUniversalPhoto(file, { maxWidth: 1200, maxHeight: 900, quality: 0.72 });
        newImages.push(processed.base64);
      }

      setPhotoForm((prev) => {
        const currentImages = prev.images && prev.images.length > 0 ? prev.images : prev.image ? [prev.image] : [];
        const mergedImages = [...currentImages, ...newImages];
        const cover = prev.image || mergedImages[0] || "";
        const cleanTitle = prev.title || firstFileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        return {
          ...prev,
          images: mergedImages,
          image: cover,
          title: cleanTitle,
        };
      });

      showToast(`Added ${newImages.length} photo(s) to this post`);

      if (autoAiOnUpload && newImages.length > 0) {
        const totalCount = (photoForm.images?.length || 0) + newImages.length;
        const isAlbum = totalCount > 1;
        await analyzePhotoWithAi(newImages[0], firstFileName, isAlbum, totalCount);
      }
    } catch (err: any) {
      console.error("Error processing gallery photos:", err);
      showToast(err.message || "Error processing image file");
    } finally {
      setIsPhotoConverting(false);
      e.target.value = "";
    }
  };

  const handleRemoveAlbumPhoto = (index: number) => {
    setPhotoForm((prev) => {
      const current = prev.images && prev.images.length > 0 ? prev.images : prev.image ? [prev.image] : [];
      const updated = current.filter((_, idx) => idx !== index);
      let newCover = prev.image;
      if (current[index] === prev.image) {
        newCover = updated[0] || "";
      }
      return {
        ...prev,
        images: updated,
        image: newCover,
      };
    });
  };

  const handleSetCoverPhoto = (imgUrl: string) => {
    setPhotoForm((prev) => ({
      ...prev,
      image: imgUrl,
    }));
    showToast("Cover photo selected for album!");
  };

  // Bulk / Multiple Photo Upload Handler
  // Opens choice modal if 2+ files selected: 1 Album Post vs Separate Posts
  const handleBulkPhotoSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList: File[] = Array.from(files);
    if (fileList.length === 1) {
      executeBulkUpload([fileList[0]], "individual");
    } else {
      setPendingBulkFiles(fileList);
      setShowBulkChoiceModal(true);
    }
    e.target.value = "";
  };

  const executeBulkUpload = async (fileList: File[], mode: "album" | "individual") => {
    setShowBulkChoiceModal(false);
    setPendingBulkFiles(null);
    setIsBulkUploading(true);
    setBulkProgress({ current: 0, total: fileList.length });

    if (mode === "album") {
      // MODE 1: Create 1 single post containing an array of images (album/carousel)
      try {
        const albumImages: string[] = [];
        const firstFile = fileList[0];

        for (let i = 0; i < fileList.length; i++) {
          const file = fileList[i];
          setBulkProgress({ current: i + 1, total: fileList.length });
          const processed = await processUniversalPhoto(file, { maxWidth: 1200, maxHeight: 900, quality: 0.72 });
          albumImages.push(processed.base64);
        }

        const baseTitle = firstFile.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        let albumTitle = `${baseTitle} Series`;
        let albumCaption = `A curated photographic series featuring ${fileList.length} captured moments.`;
        let albumCategory = "Photography";
        let albumLocation = "Bangladesh";
        let albumDate = new Date().getFullYear().toString();
        let albumTags = ["album", "series", "photography"];

        // AI analysis on cover photo with album flag
        try {
          const res = await fetch("/api/gemini/analyze-photo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageBase64: albumImages[0],
              fileName: firstFile.name,
              isAlbum: true,
              albumPhotoCount: albumImages.length,
            }),
          });
          const json = await res.json();
          if (json.data) {
            albumTitle = json.data.title || albumTitle;
            albumCaption = json.data.caption || albumCaption;
            albumCategory = json.data.category || albumCategory;
            albumLocation = json.data.location || albumLocation;
            albumDate = json.data.date || albumDate;
            albumTags = Array.isArray(json.data.tags) ? json.data.tags : albumTags;
          }
        } catch {
          // fallback gracefully
        }

        const newAlbumItem: PhotoItem = {
          id: `ph_album_${Date.now()}`,
          title: albumTitle,
          caption: albumCaption,
          image: albumImages[0],
          images: albumImages,
          category: albumCategory,
          location: albumLocation,
          date: albumDate,
          tags: albumTags,
        };

        const updated = [newAlbumItem, ...photos];
        setPhotos(updated);
        safeSetLocalStorage("raf_photos", JSON.stringify(updated));
        showToast(`✨ Created 1 Album post with ${albumImages.length} photos!`);
        await savePortfolioToCloud({ photos: updated });
      } catch (err: any) {
        console.error("Error creating album post:", err);
        showToast("Error processing album files.");
      }
    } else {
      // MODE 2: Create separate individual posts for each photo
      const newPhotos: PhotoItem[] = [];

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        setBulkProgress({ current: i + 1, total: fileList.length });
        try {
          const processed = await processUniversalPhoto(file, { maxWidth: 1280, maxHeight: 960, quality: 0.74 });
          const baseTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
          let itemTitle = baseTitle;
          let itemCaption = `Photographic capture in ${processed.format.toUpperCase()} format.`;
          let itemCategory = "Photography";
          let itemLocation = "Bangladesh";
          let itemDate = new Date().getFullYear().toString();
          let itemTags = ["photography", processed.format];

          // For small batches (up to 4), auto-analyze with Gemini
          if (fileList.length <= 4) {
            try {
              const res = await fetch("/api/gemini/analyze-photo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imageBase64: processed.base64, fileName: file.name }),
              });
              const json = await res.json();
              if (json.data) {
                itemTitle = json.data.title || itemTitle;
                itemCaption = json.data.caption || itemCaption;
                itemCategory = json.data.category || itemCategory;
                itemLocation = json.data.location || itemLocation;
                itemDate = json.data.date || itemDate;
                itemTags = Array.isArray(json.data.tags) ? json.data.tags : itemTags;
              }
            } catch {
              // fallback
            }
          }

          newPhotos.push({
            id: `ph_${Date.now()}_${i}`,
            title: itemTitle,
            caption: itemCaption,
            image: processed.base64,
            images: [processed.base64],
            category: itemCategory,
            location: itemLocation,
            date: itemDate,
            tags: itemTags,
          });
        } catch (err: any) {
          console.error(`Error processing bulk file ${file.name}:`, err);
        }
      }

      if (newPhotos.length > 0) {
        const updated = [...newPhotos, ...photos];
        setPhotos(updated);
        safeSetLocalStorage("raf_photos", JSON.stringify(updated));
        showToast(`✨ Published ${newPhotos.length} separate photo posts in your gallery!`);
        try {
          await savePortfolioToCloud({ photos: updated });
        } catch (err) {
          console.error(err);
        }
      }
    }

    setIsBulkUploading(false);
    setBulkProgress(null);
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, "").toLowerCase();
    if (!trimmed) return;
    const currentTags = photoForm.tags || [];
    if (!currentTags.includes(trimmed)) {
      setPhotoForm({ ...photoForm, tags: [...currentTags, trimmed] });
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = photoForm.tags || [];
    setPhotoForm({
      ...photoForm,
      tags: currentTags.filter((t) => t !== tagToRemove),
    });
  };

  const handleSavePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalImages =
      photoForm.images && photoForm.images.length > 0
        ? photoForm.images
        : photoForm.image
        ? [photoForm.image]
        : [];
    const finalCover = photoForm.image || finalImages[0] || "";

    if (!photoForm.title.trim() || !finalCover) {
      showToast("Please provide a photo title and at least one image.");
      return;
    }

    let updated: PhotoItem[];
    if (editingPhotoId) {
      updated = photos.map((p) =>
        p.id === editingPhotoId
          ? {
              ...p,
              ...photoForm,
              image: finalCover,
              images: finalImages,
            }
          : p
      );
      setPhotos(updated);
      safeSetLocalStorage("raf_photos", JSON.stringify(updated));
      setEditingPhotoId(null);
      showToast(finalImages.length > 1 ? "Album post updated!" : "Photo updated!");
    } else {
      const newPhoto: PhotoItem = {
        id: `ph_${Date.now()}`,
        ...photoForm,
        image: finalCover,
        images: finalImages,
      };
      updated = [newPhoto, ...photos];
      setPhotos(updated);
      safeSetLocalStorage("raf_photos", JSON.stringify(updated));
      setIsAddingPhoto(false);
      showToast(finalImages.length > 1 ? "New Album added to gallery!" : "New photo added to gallery!");
    }
    setPhotoForm({
      title: "",
      caption: "",
      image: "",
      images: [],
      category: "Nature",
      location: "",
      date: "",
      tags: [],
    });
    setTagInput("");
    try {
      await savePortfolioToCloud({ photos: updated });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePhoto = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this photo from your gallery?")) {
      const updated = photos.filter((p) => p.id !== id);
      setPhotos(updated);
      safeSetLocalStorage("raf_photos", JSON.stringify(updated));
      showToast("Photo removed from gallery.");
      try {
        await savePortfolioToCloud({ photos: updated });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleStartEditPhoto = (p: PhotoItem) => {
    setEditingPhotoId(p.id);
    const existingImages =
      p.images && p.images.length > 0 ? p.images : p.image ? [p.image] : [];
    setPhotoForm({
      title: p.title,
      caption: p.caption,
      image: p.image,
      images: existingImages,
      category: p.category,
      location: p.location || "",
      date: p.date || "",
      tags: p.tags || [],
    });
    setTagInput("");
    setIsAddingPhoto(false);
  };

  // Password Change Handler
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      showToast("Password must be at least 4 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match!");
      return;
    }
    localStorage.setItem("raf_admin_password", newPassword);
    setNewPassword("");
    setConfirmPassword("");
    showToast("Admin password changed successfully!");
  };

  // If not logged in, show Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F4F1E6] dark:bg-[#071309] flex items-center justify-center p-6 transition-colors">
        <div className="max-w-md w-full bg-white dark:bg-[#0E2014] border-2 border-[#2F5D3A]/30 dark:border-[#52A368]/50 rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-[#173522] text-[#8FAF72] rounded-2xl mx-auto flex items-center justify-center shadow-md">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
              Admin Portal
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Enter your master password to edit and manage all portfolio sectors.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-zinc-950 dark:text-zinc-100 uppercase tracking-wider mb-1.5">
                Admin Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-[#132A1B] border-2 border-zinc-300 dark:border-[#386B46] rounded-xl text-sm font-bold text-zinc-950 dark:text-white placeholder:text-zinc-400 focus:outline-hidden focus:border-[#2F5D3A] focus:ring-2 focus:ring-[#2F5D3A]/20"
                autoFocus
              />
              {loginError && (
                <p className="text-xs font-bold text-red-600 dark:text-red-400 mt-2 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-600 to-[#1F452B] hover:from-emerald-500 hover:to-[#2F5D3A] text-white font-extrabold text-sm py-3 rounded-xl transition-all cursor-pointer shadow-md hover:scale-[1.01]"
            >
              Sign In to Admin
            </button>
          </form>

          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
            <button
              onClick={onClose}
              className="text-zinc-800 dark:text-zinc-200 hover:text-emerald-700 font-bold flex items-center space-x-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Public Website</span>
            </button>
            <span className="text-zinc-500 dark:text-zinc-400 text-[11px] font-semibold">Protected Access</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F1E6] dark:bg-[#071309] text-zinc-950 dark:text-white flex flex-col font-sans transition-colors">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#173522] text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-2 border border-emerald-400/30">
          <Check className="w-4 h-4 text-[#8FAF72]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="bg-white dark:bg-[#0A160E] border-b-2 border-zinc-200 dark:border-[#386B46]/60 sticky top-0 z-30 px-6 sm:px-8 py-3 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-2 text-zinc-800 dark:text-zinc-200 hover:text-black dark:hover:text-white rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Back to Public Site"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-zinc-950 dark:text-white tracking-tight flex items-center space-x-2">
                <span>Portfolio Control Center</span>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300">Live</span>
              </h1>
              <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
                All 10 website sectors are fully editable and synced in real-time
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            {/* Theme Toggle in Admin Panel */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border-2 border-zinc-300 dark:border-[#386B46] bg-zinc-50 dark:bg-[#122818] text-zinc-900 dark:text-amber-300 hover:bg-zinc-100 transition-all cursor-pointer shadow-xs"
              title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {theme === "light" ? <Moon className="w-4 h-4 text-emerald-800" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>

            <button
              onClick={onClose}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-zinc-900 dark:text-white hover:text-emerald-700 border-2 border-zinc-300 dark:border-[#386B46] bg-white dark:bg-[#122818] px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>View Site</span>
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-red-700 dark:text-red-400 border-2 border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Content Area */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col md:flex-row gap-6 lg:gap-8">
        {/* Left Sidebar / Tabs */}
        <aside className="w-full md:w-60 shrink-0 space-y-1 bg-white/70 dark:bg-[#0A160E]/70 p-3 rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 shadow-xs self-start">
          <div className="text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-3 py-1">
            Website Sectors
          </div>

          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "profile"
                ? "bg-[#2F5D3A] text-white shadow-md"
                : "text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-[#1E4D2B]/50"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Hero</span>
          </button>

          <button
            onClick={() => setActiveTab("timeline")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "timeline"
                ? "bg-[#2F5D3A] text-white shadow-md"
                : "text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-[#1E4D2B]/50"
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Briefcase className="w-4 h-4" />
              <span>Career Timeline</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
              {timeline.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("skills")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "skills"
                ? "bg-[#2F5D3A] text-white shadow-md"
                : "text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-[#1E4D2B]/50"
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Sparkles className="w-4 h-4" />
              <span>Skills & Expertise</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
              {skills.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("projects")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "projects"
                ? "bg-[#2F5D3A] text-white shadow-md"
                : "text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-[#1E4D2B]/50"
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <FolderGit2 className="w-4 h-4" />
              <span>Works & Projects</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
              {projects.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("caseStudies")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "caseStudies"
                ? "bg-[#2F5D3A] text-white shadow-md"
                : "text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-[#1E4D2B]/50"
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <TrendingUp className="w-4 h-4" />
              <span>Growth Case Studies</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
              {caseStudies.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("gallery")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "gallery"
                ? "bg-[#2F5D3A] text-white shadow-md"
                : "text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-[#1E4D2B]/50"
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Camera className="w-4 h-4" />
              <span>Photo Gallery</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
              {photos.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("reviews")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "reviews"
                ? "bg-[#2F5D3A] text-white shadow-md"
                : "text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-[#1E4D2B]/50"
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <MessageSquare className="w-4 h-4" />
              <span>Testimonials & Reviews</span>
            </div>
            {pendingReviews.length > 0 && (
              <span className="text-[10px] bg-amber-500 text-white font-extrabold px-1.5 py-0.5 rounded-full animate-pulse">
                {pendingReviews.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("inquiries")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "inquiries"
                ? "bg-[#2F5D3A] text-white shadow-md"
                : "text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-[#1E4D2B]/50"
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Inbox className="w-4 h-4" />
              <span>Project Inquiries</span>
            </div>
            {inquiries.length > 0 && (
              <span className="text-[10px] bg-emerald-600 text-white font-extrabold px-1.5 py-0.5 rounded-full">
                {inquiries.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("contact")}
            className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "contact"
                ? "bg-[#2F5D3A] text-white shadow-md"
                : "text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-[#1E4D2B]/50"
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            <span>Contact & Socials</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "security"
                ? "bg-[#2F5D3A] text-white shadow-md"
                : "text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-[#1E4D2B]/50"
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Admin Password</span>
          </button>

          <div className="pt-4 mt-2 border-t border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => {
                if (window.confirm("Reset all content back to factory default values?")) {
                  onResetDefaults();
                  setFormProfile(profile);
                  setFormContact(contact);
                  showToast("Portfolio reset to default template.");
                }
              }}
              className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-[#4E5E4E] hover:text-[#172117] hover:bg-[#8FAF72]/20 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>
          </div>
        </aside>

        {/* Right Main Form Container */}
        <main className="flex-1 bg-white border border-[#8FAF72]/30 rounded-2xl p-6 sm:p-8">
          {/* TAB 1: PROFILE & HERO */}
          {activeTab === "profile" && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">Profile & Hero Section</h2>
                <p className="text-xs text-zinc-500">Edit your core biographical information and introduction.</p>
              </div>

              {/* Photo Preview & Upload */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-200 border border-zinc-300 shrink-0">
                  {formProfile.photo ? (
                    <img src={formProfile.photo} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400 font-bold">Photo</div>
                  )}
                </div>
                <div className="space-y-2 flex-1">
                  <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                    Profile Photo
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <label className="inline-flex items-center space-x-1.5 bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-800 px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer shadow-2xs">
                      <Upload className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Upload Image</span>
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                    <input
                      type="text"
                      value={formProfile.photo}
                      onChange={(e) => setFormProfile({ ...formProfile, photo: e.target.value })}
                      placeholder="Or enter Image URL"
                      className="flex-1 min-w-[200px] px-3 py-1.5 bg-white border border-zinc-200 rounded-md text-xs text-zinc-800"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                    <span className="text-[11px] font-bold text-zinc-500">Pick from Rafiul's Photos:</span>
                    {CANDIDATE_IMAGE_OPTIONS.map((img) => (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => setFormProfile((prev) => ({ ...prev, photo: img.url }))}
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                          formProfile.photo === img.url
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                            : "bg-white text-zinc-700 border-zinc-200 hover:border-emerald-500 hover:text-emerald-700"
                        }`}
                      >
                        {img.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formProfile.name}
                    onChange={(e) => setFormProfile({ ...formProfile, name: e.target.value })}
                    className="w-full px-3.5 py-2 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-hidden focus:border-zinc-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formProfile.location}
                    onChange={(e) => setFormProfile({ ...formProfile, location: e.target.value })}
                    className="w-full px-3.5 py-2 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-hidden focus:border-zinc-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Hero Title / Subheading
                </label>
                <input
                  type="text"
                  value={formProfile.title}
                  onChange={(e) => setFormProfile({ ...formProfile, title: e.target.value })}
                  placeholder="e.g. Social Media Manager & Content Creator"
                  className="w-full px-3.5 py-2 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-hidden focus:border-zinc-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Hero Short Introduction
                </label>
                <textarea
                  rows={2}
                  value={formProfile.shortIntro}
                  onChange={(e) => setFormProfile({ ...formProfile, shortIntro: e.target.value })}
                  className="w-full px-3.5 py-2 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-hidden focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  About Me (Full Biography)
                </label>
                <textarea
                  rows={5}
                  value={formProfile.about}
                  onChange={(e) => setFormProfile({ ...formProfile, about: e.target.value })}
                  className="w-full px-3.5 py-2 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-hidden focus:border-zinc-900"
                />
                <p className="text-[11px] text-zinc-400 mt-1">Tip: Double line-breaks create clean separate paragraphs.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Footer Copyright Text
                </label>
                <input
                  type="text"
                  value={formProfile.footerText}
                  onChange={(e) => setFormProfile({ ...formProfile, footerText: e.target.value })}
                  className="w-full px-3.5 py-2 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-hidden focus:border-zinc-900"
                />
              </div>

              {/* Social Media Profile Links (Facebook, Instagram, LinkedIn) */}
              <div className="pt-4 border-t border-zinc-100 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Social Media Profile Links</h3>
                  <p className="text-xs text-zinc-500">
                    URLs mapped and displayed in the Contact component's Socials section.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                      Facebook URL
                    </label>
                    <input
                      type="text"
                      value={formProfile.socials?.facebook || formProfile.facebook || ""}
                      onChange={(e) =>
                        setFormProfile({
                          ...formProfile,
                          facebook: e.target.value,
                          socials: {
                            ...formProfile.socials,
                            facebook: e.target.value,
                          },
                        })
                      }
                      placeholder="https://facebook.com/yourprofile"
                      className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-hidden focus:border-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                      Instagram URL
                    </label>
                    <input
                      type="text"
                      value={formProfile.socials?.instagram || formProfile.instagram || ""}
                      onChange={(e) =>
                        setFormProfile({
                          ...formProfile,
                          instagram: e.target.value,
                          socials: {
                            ...formProfile.socials,
                            instagram: e.target.value,
                          },
                        })
                      }
                      placeholder="https://instagram.com/yourprofile"
                      className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-hidden focus:border-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                      LinkedIn URL
                    </label>
                    <input
                      type="text"
                      value={formProfile.socials?.linkedin || formProfile.linkedin || ""}
                      onChange={(e) =>
                        setFormProfile({
                          ...formProfile,
                          linkedin: e.target.value,
                          socials: {
                            ...formProfile.socials,
                            linkedin: e.target.value,
                          },
                        })
                      }
                      placeholder="https://linkedin.com/in/yourprofile"
                      className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-hidden focus:border-zinc-900"
                    />
                  </div>
                </div>
              </div>

              {/* Custom CV File (.docx / .pdf) & Personal Details Section */}
              <div className="pt-4 border-t border-zinc-100 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Custom CV File & Bio-Data (MS Word Support)</h3>
                  <p className="text-xs text-zinc-500">
                    Upload your own MS Word (.docx) or PDF document, or edit formal bio-data details for the CV.
                  </p>
                </div>

                {/* Upload File Box */}
                <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
                  <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wider">
                    Upload Original CV File (.docx / .doc / .pdf)
                  </label>
                  {formProfile.customCvFile ? (
                    <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-emerald-300">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-emerald-800 text-xs">Attached:</span>
                        <span className="text-xs font-bold text-zinc-800">{formProfile.customCvFile.name}</span>
                        <span className="text-[11px] text-zinc-500">({formProfile.customCvFile.size})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormProfile({ ...formProfile, customCvFile: undefined })}
                        className="text-xs text-rose-600 font-bold hover:underline"
                      >
                        Remove File
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center space-x-1.5 bg-white border border-zinc-300 hover:border-zinc-400 text-zinc-800 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs">
                        <Upload className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Select Word (.docx) or PDF File</span>
                        <input
                          type="file"
                          accept=".docx,.doc,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              setFormProfile({
                                ...formProfile,
                                customCvFile: {
                                  name: file.name,
                                  type: file.name.endsWith(".docx") ? "docx" : "pdf",
                                  dataUrl: ev.target?.result as string,
                                  size: (file.size / 1024).toFixed(1) + " KB",
                                  uploadedAt: new Date().toLocaleDateString("en-GB"),
                                },
                              });
                            };
                            reader.readAsDataURL(file);
                          }}
                          className="hidden"
                        />
                      </label>
                      <span className="text-xs text-zinc-500">Optional: overrides default generated document.</span>
                    </div>
                  )}
                </div>

                {/* Personal Details / Bio-Data */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                      Father's Name
                    </label>
                    <input
                      type="text"
                      value={formProfile.cvPersonalDetails?.fatherName || ""}
                      onChange={(e) =>
                        setFormProfile({
                          ...formProfile,
                          cvPersonalDetails: {
                            ...formProfile.cvPersonalDetails,
                            fatherName: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. Late Md. Abdul Kader"
                      className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-xs text-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                      Mother's Name
                    </label>
                    <input
                      type="text"
                      value={formProfile.cvPersonalDetails?.motherName || ""}
                      onChange={(e) =>
                        setFormProfile({
                          ...formProfile,
                          cvPersonalDetails: {
                            ...formProfile.cvPersonalDetails,
                            motherName: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. Mrs. Rehana Begum"
                      className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-xs text-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="text"
                      value={formProfile.cvPersonalDetails?.dateOfBirth || ""}
                      onChange={(e) =>
                        setFormProfile({
                          ...formProfile,
                          cvPersonalDetails: {
                            ...formProfile.cvPersonalDetails,
                            dateOfBirth: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. 15 October 1999"
                      className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-xs text-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                      Blood Group
                    </label>
                    <input
                      type="text"
                      value={formProfile.cvPersonalDetails?.bloodGroup || ""}
                      onChange={(e) =>
                        setFormProfile({
                          ...formProfile,
                          cvPersonalDetails: {
                            ...formProfile.cvPersonalDetails,
                            bloodGroup: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. B+ (Positive)"
                      className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-xs text-zinc-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                      Permanent Address
                    </label>
                    <input
                      type="text"
                      value={formProfile.cvPersonalDetails?.permanentAddress || ""}
                      onChange={(e) =>
                        setFormProfile({
                          ...formProfile,
                          cvPersonalDetails: {
                            ...formProfile.cvPersonalDetails,
                            permanentAddress: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. Pabna Sadar, Pabna, Rajshahi Division, Bangladesh"
                      className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-xs text-zinc-900"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-100 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center space-x-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB: TIMELINE & EXPERIENCE */}
          {activeTab === "timeline" && setTimeline && (
            <AdminTimelineTab
              timeline={timeline}
              setTimeline={setTimeline}
              showToast={showToast}
            />
          )}

          {/* TAB 2: SKILLS MANAGEMENT */}
          {activeTab === "skills" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-zinc-900">Skills Management</h2>
                  <p className="text-xs text-zinc-500">Add, edit, or delete skills shown in the Skills section.</p>
                </div>
                {!isAddingSkill && !editingSkillId && (
                  <button
                    onClick={() => {
                      setIsAddingSkill(true);
                      setSkillForm({ name: "", description: "" });
                    }}
                    className="inline-flex items-center space-x-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Skill</span>
                  </button>
                )}
              </div>

              {/* Add/Edit Skill Form */}
              {(isAddingSkill || editingSkillId) && (
                <form onSubmit={handleSaveSkill} className="p-5 bg-zinc-50 rounded-xl border border-zinc-200 space-y-4">
                  <h3 className="text-sm font-bold text-zinc-900">
                    {editingSkillId ? "Edit Skill" : "Add New Skill"}
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                      Skill Name
                    </label>
                    <input
                      type="text"
                      value={skillForm.name}
                      onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                      placeholder="e.g. Social Media Management"
                      className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-hidden focus:border-zinc-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                      Short Description
                    </label>
                    <textarea
                      rows={2}
                      value={skillForm.description}
                      onChange={(e) => setSkillForm({ ...skillForm, description: e.target.value })}
                      placeholder="Brief details about what you do in this area"
                      className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-hidden focus:border-zinc-900"
                    />
                  </div>

                  <div className="flex items-center space-x-2 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingSkill(false);
                        setEditingSkillId(null);
                        setSkillForm({ name: "", description: "" });
                      }}
                      className="px-3.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center space-x-1 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium px-4 py-1.5 rounded-lg"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{editingSkillId ? "Update Skill" : "Save Skill"}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Skills List */}
              <div className="space-y-3">
                {skills.map((skill) => (
                  <div
                    key={skill.id}
                    className="flex items-start justify-between p-4 bg-white border border-zinc-200 rounded-xl hover:border-zinc-300 transition-colors"
                  >
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-zinc-900">{skill.name}</h4>
                      {skill.description && (
                        <p className="text-xs text-zinc-500">{skill.description}</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-1 shrink-0 ml-4">
                      <button
                        onClick={() => handleStartEditSkill(skill)}
                        className="p-1.5 text-zinc-500 hover:text-zinc-900 rounded-md hover:bg-zinc-100"
                        title="Edit Skill"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSkill(skill.id)}
                        className="p-1.5 text-red-500 hover:text-red-700 rounded-md hover:bg-red-50"
                        title="Delete Skill"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PROJECTS / WORKS MANAGEMENT */}
          {activeTab === "projects" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-zinc-900">Works & Projects</h2>
                  <p className="text-xs text-zinc-500">Manage all project cards displayed in your portfolio.</p>
                </div>
                {!isAddingProject && !editingProjectId && (
                  <button
                    onClick={() => {
                      setIsAddingProject(true);
                      setProjectForm({ title: "", description: "", image: "", link: "", category: "" });
                    }}
                    className="inline-flex items-center space-x-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Project</span>
                  </button>
                )}
              </div>

              {/* Add/Edit Project Form */}
              {(isAddingProject || editingProjectId) && (
                <form onSubmit={handleSaveProject} className="p-5 bg-zinc-50 rounded-xl border border-zinc-200 space-y-4">
                  <h3 className="text-sm font-bold text-zinc-900">
                    {editingProjectId ? "Edit Project" : "Add New Project"}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                        Project Title
                      </label>
                      <input
                        type="text"
                        value={projectForm.title}
                        onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                        placeholder="e.g. Social Media Growth Strategy"
                        className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-hidden focus:border-zinc-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                        Category Tag
                      </label>
                      <input
                        type="text"
                        value={projectForm.category}
                        onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                        placeholder="e.g. Social Media, Video Editing"
                        className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-hidden focus:border-zinc-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                      Project Description
                    </label>
                    <textarea
                      rows={3}
                      value={projectForm.description}
                      onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                      placeholder="Summary of what was achieved and deliverables created"
                      className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-hidden focus:border-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                      Project Link (URL)
                    </label>
                    <input
                      type="text"
                      value={projectForm.link}
                      onChange={(e) => setProjectForm({ ...projectForm, link: e.target.value })}
                      placeholder="e.g. https://facebook.com/yourproject or https://youtube.com"
                      className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-hidden focus:border-zinc-900"
                    />
                  </div>

                  {/* Project Image Selection */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                      Project Cover Image
                    </label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      {projectForm.image && (
                        <div className="w-16 h-12 rounded-lg overflow-hidden bg-zinc-200 border border-zinc-300 shrink-0">
                          <img src={projectForm.image} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <label className="inline-flex items-center space-x-1.5 bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-800 px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer shadow-2xs">
                        <Upload className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Upload Image</span>
                        <input type="file" accept="image/*" onChange={handleProjectImageUpload} className="hidden" />
                      </label>
                      <input
                        type="text"
                        value={projectForm.image}
                        onChange={(e) => setProjectForm({ ...projectForm, image: e.target.value })}
                        placeholder="Or enter Image URL"
                        className="flex-1 w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-md text-xs text-zinc-800"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingProject(false);
                        setEditingProjectId(null);
                        setProjectForm({ title: "", description: "", image: "", link: "", category: "" });
                      }}
                      className="px-3.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center space-x-1 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium px-4 py-1.5 rounded-lg"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{editingProjectId ? "Update Project" : "Save Project"}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Projects List */}
              <div className="space-y-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white border border-zinc-200 rounded-xl hover:border-zinc-300 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-12 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0">
                        {resolveProjectImage(project) ? (
                          <img src={resolveProjectImage(project)} alt={project.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-300">
                            <FolderGit2 className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-bold text-zinc-900">{project.title}</h4>
                          {project.category && (
                            <span className="text-[10px] bg-zinc-100 text-zinc-600 font-semibold px-2 py-0.5 rounded">
                              {project.category}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 line-clamp-1">{project.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-end sm:self-center">
                      <button
                        onClick={() => handleStartEditProject(project)}
                        className="p-1.5 text-zinc-500 hover:text-zinc-900 rounded-md hover:bg-zinc-100"
                        title="Edit Project"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="p-1.5 text-red-500 hover:text-red-700 rounded-md hover:bg-red-50"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: GROWTH CASE STUDIES */}
          {activeTab === "caseStudies" && setCaseStudies && (
            <AdminCaseStudiesTab
              caseStudies={caseStudies}
              setCaseStudies={setCaseStudies}
              showToast={showToast}
            />
          )}

          {/* TAB: PHOTOGRAPHY / GALLERY MANAGEMENT */}
          {activeTab === "gallery" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-zinc-900">Personal Photo Gallery</h2>
                  <p className="text-xs text-zinc-500">
                    Upload your photography shots, write captions, assign categories and capture locations.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex items-center space-x-1.5 bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-800 text-xs font-medium px-3.5 py-2 rounded-lg transition-colors cursor-pointer shadow-2xs">
                    <Layers className="w-3.5 h-3.5 text-zinc-600" />
                    <span>Bulk Upload Photos / অ্যালবাম</span>
                    <input
                      type="file"
                      multiple
                      accept=".png,.jpg,.jpeg,.dng,.heic,.heif,image/png,image/jpeg,image/heic,image/heif,image/x-adobe-dng"
                      onChange={handleBulkPhotoSelect}
                      disabled={isBulkUploading}
                      className="hidden"
                    />
                  </label>

                  {!isAddingPhoto && !editingPhotoId && (
                    <button
                      onClick={() => {
                        setIsAddingPhoto(true);
                        setPhotoForm({
                          title: "",
                          caption: "",
                          image: "",
                          images: [],
                          category: "Nature",
                          location: "",
                          date: new Date().getFullYear().toString(),
                          tags: [],
                        });
                        setTagInput("");
                      }}
                      className="inline-flex items-center space-x-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Photo / Album</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Supported Format Badges */}
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-600 bg-white border border-zinc-200/80 p-2.5 rounded-xl">
                <span className="font-semibold text-zinc-800 flex items-center space-x-1">
                  <FileImage className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Supported Formats:</span>
                </span>
                <span className="bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded border border-emerald-200">
                  PNG
                </span>
                <span className="bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded border border-emerald-200">
                  JPG / JPEG
                </span>
                <span className="bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded border border-blue-200">
                  DNG (Adobe / RAW)
                </span>
                <span className="bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded border border-purple-200">
                  HEIC / HEIF (Apple iPhone)
                </span>
                <span className="ml-auto text-[10px] text-zinc-400">
                  Auto-converted & optimized for fast cloud storage
                </span>
              </div>

              {/* Bulk Upload Progress Notification */}
              {isBulkUploading && bulkProgress && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs text-blue-900 font-medium">
                    <span className="inline-flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span>Processing & uploading photos...</span>
                    </span>
                    <span className="font-bold">
                      {bulkProgress.current} of {bulkProgress.total}
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full transition-all duration-300"
                      style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Protection Notice Badge in Admin */}
              <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-start space-x-3 text-xs text-amber-900">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-amber-950">Download Protection Active</p>
                  <p className="text-amber-800/90 leading-relaxed text-[11px]">
                    All photos in your gallery are automatically secured against direct downloading, right-clicking, and drag-and-drop on the public website.
                  </p>
                </div>
              </div>

              {/* Add/Edit Photo Form */}
              {(isAddingPhoto || editingPhotoId) && (
                <form onSubmit={handleSavePhoto} className="p-5 bg-zinc-50 rounded-xl border border-zinc-200 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-200">
                    <h3 className="text-sm font-bold text-zinc-900">
                      {editingPhotoId ? "Edit Photo Information" : "Upload New Photography / Album Post"}
                    </h3>

                    <div className="flex items-center space-x-3">
                      <label className="inline-flex items-center space-x-2 text-xs text-zinc-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={autoAiOnUpload}
                          onChange={(e) => setAutoAiOnUpload(e.target.checked)}
                          className="rounded border-zinc-300 text-zinc-900 focus:ring-0"
                        />
                        <span>Auto-fill details with AI on upload</span>
                      </label>

                      {photoForm.image && (
                        <button
                          type="button"
                          onClick={() => {
                            const isAlb = (photoForm.images?.length || 0) > 1;
                            analyzePhotoWithAi(
                              photoForm.image,
                              undefined,
                              isAlb,
                              photoForm.images?.length || 1
                            );
                          }}
                          disabled={isAiAnalyzing}
                          className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer disabled:opacity-50"
                        >
                          {isAiAnalyzing ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>AI Analyzing...</span>
                            </>
                          ) : (
                            <>
                              <Wand2 className="w-3.5 h-3.5" />
                              <span>Auto-Generate with AI</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* AI Status Banner */}
                  {isAiAnalyzing && (
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center space-x-2.5 text-xs text-purple-900 animate-pulse">
                      <Loader2 className="w-4 h-4 text-purple-600 animate-spin shrink-0" />
                      <span>
                        Gemini AI is examining image composition, mood, color palette, and generating professional titles, caption story, and tags...
                      </span>
                    </div>
                  )}

                  {/* Converting status */}
                  {isPhotoConverting && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center space-x-2.5 text-xs text-blue-900">
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                      <span>Decoding and converting image format (HEIC/DNG/PNG/JPEG)...</span>
                    </div>
                  )}

                  {/* Photo / Album Media Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                        Photo Files & Album Collection *
                      </label>
                      <span className="text-[11px] text-zinc-500 font-medium">
                        {photoForm.images && photoForm.images.length > 1
                          ? `Album / Carousel (${photoForm.images.length} photos selected)`
                          : "Upload 1 or multiple photos for an album"}
                      </span>
                    </div>

                    {/* Album Thumbnails Grid */}
                    {photoForm.images && photoForm.images.length > 0 && (
                      <div className="p-3 bg-zinc-100/70 border border-zinc-200 rounded-xl space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-zinc-500">
                          <span>Click a photo or &apos;Cover&apos; button to choose the primary cover image</span>
                          <span className="font-semibold text-zinc-700">
                            {photoForm.images.length} photo{photoForm.images.length > 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                          {photoForm.images.map((imgUrl, idx) => {
                            const isCover =
                              photoForm.image === imgUrl ||
                              (!photoForm.image && idx === 0);
                            return (
                              <div
                                key={idx}
                                onClick={() => handleSetCoverPhoto(imgUrl)}
                                className={`relative group rounded-lg overflow-hidden border-2 aspect-[4/3] bg-zinc-200 cursor-pointer transition-all ${
                                  isCover
                                    ? "border-indigo-600 ring-2 ring-indigo-500/30"
                                    : "border-zinc-300 hover:border-zinc-400"
                                }`}
                              >
                                <img
                                  src={imgUrl}
                                  alt={`Album item ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                {isCover && (
                                  <span className="absolute top-1 left-1 z-10 bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                                    Cover
                                  </span>
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-1 p-1">
                                  {!isCover && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSetCoverPhoto(imgUrl);
                                      }}
                                      className="bg-white text-zinc-900 text-[10px] font-medium px-2 py-0.5 rounded shadow-xs"
                                    >
                                      Cover
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveAlbumPhoto(idx);
                                    }}
                                    className="bg-red-600 text-white p-1 rounded hover:bg-red-700 shadow-xs"
                                    title="Remove this photo"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Image Upload / File Select Controls */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <label className="inline-flex items-center space-x-1.5 bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-800 px-3.5 py-2 rounded-lg text-xs font-medium cursor-pointer shadow-2xs">
                        <Upload className="w-4 h-4 text-zinc-500" />
                        <span>
                          {photoForm.images && photoForm.images.length > 0
                            ? "+ Add More Photos to Album"
                            : "Select Photo(s) / Album (Multi-Select)"}
                        </span>
                        <input
                          type="file"
                          multiple
                          accept=".png,.jpg,.jpeg,.dng,.heic,.heif,image/png,image/jpeg,image/heic,image/heif,image/x-adobe-dng"
                          onChange={handlePhotoFilesUpload}
                          className="hidden"
                        />
                      </label>
                      <input
                        type="text"
                        value={photoForm.image}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPhotoForm((prev) => ({
                            ...prev,
                            image: val,
                            images:
                              prev.images && prev.images.length > 0
                                ? prev.images
                                : val
                                ? [val]
                                : [],
                          }));
                        }}
                        placeholder="Or paste cover image URL or base64"
                        className="flex-1 w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-800"
                      />
                    </div>
                  </div>

                  {/* Photo Title & Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                        Photo Title *
                      </label>
                      <input
                        type="text"
                        value={photoForm.title}
                        onChange={(e) => setPhotoForm({ ...photoForm, title: e.target.value })}
                        placeholder="e.g. Sunset Over Padma River"
                        className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-hidden focus:border-zinc-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                        Category Tag
                      </label>
                      <input
                        type="text"
                        value={photoForm.category}
                        onChange={(e) => setPhotoForm({ ...photoForm, category: e.target.value })}
                        placeholder="e.g. Landscape, Nature, Architecture, Street, Portrait"
                        className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-hidden focus:border-zinc-900"
                      />
                    </div>
                  </div>

                  {/* Photo Caption */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                      Photo Caption / Narrative Story
                    </label>
                    <textarea
                      rows={3}
                      value={photoForm.caption}
                      onChange={(e) => setPhotoForm({ ...photoForm, caption: e.target.value })}
                      placeholder="Write or auto-generate a narrative describing the lighting, mood, atmosphere, and photographic moment..."
                      className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-hidden focus:border-zinc-900"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                      Keywords & Tags
                    </label>
                    <div className="flex flex-wrap items-center gap-1.5 p-2 bg-white border border-zinc-200 rounded-lg min-h-[42px]">
                      {photoForm.tags &&
                        photoForm.tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="inline-flex items-center space-x-1 text-xs bg-zinc-100 text-zinc-700 px-2.5 py-1 rounded-md"
                          >
                            <span>#{tag}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="text-zinc-400 hover:text-red-600 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      <div className="flex-1 flex items-center min-w-[140px]">
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === ",") {
                              e.preventDefault();
                              handleAddTag();
                            }
                          }}
                          placeholder="Type tag & press Enter..."
                          className="w-full text-xs text-zinc-800 outline-hidden px-1"
                        />
                        <button
                          type="button"
                          onClick={handleAddTag}
                          className="text-xs text-zinc-500 hover:text-zinc-900 px-2 py-0.5 rounded cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Location & Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                        Location / Place
                      </label>
                      <input
                        type="text"
                        value={photoForm.location}
                        onChange={(e) => setPhotoForm({ ...photoForm, location: e.target.value })}
                        placeholder="e.g. Pabna, Bangladesh"
                        className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-hidden focus:border-zinc-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                        Capture Year / Date
                      </label>
                      <input
                        type="text"
                        value={photoForm.date}
                        onChange={(e) => setPhotoForm({ ...photoForm, date: e.target.value })}
                        placeholder="e.g. 2026 or Aug 2026"
                        className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-hidden focus:border-zinc-900"
                      />
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center space-x-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingPhoto(false);
                        setEditingPhotoId(null);
                        setPhotoForm({
                          title: "",
                          caption: "",
                          image: "",
                          images: [],
                          category: "Nature",
                          location: "",
                          date: "",
                          tags: [],
                        });
                        setTagInput("");
                      }}
                      className="px-3.5 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center space-x-1 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium px-4 py-2 rounded-lg cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{editingPhotoId ? "Update Photo" : "Save Photo"}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Photo List */}
              <div className="space-y-3">
                {photos.length === 0 ? (
                  <div className="text-center py-12 bg-white border border-dashed border-zinc-200 rounded-xl">
                    <p className="text-zinc-500 text-xs">No photos in gallery. Click "Add Photo / Album" or "Bulk Upload Photos" above.</p>
                  </div>
                ) : (
                  photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-zinc-200 rounded-xl hover:border-zinc-300 transition-colors gap-3"
                    >
                      <div className="flex items-center space-x-3.5 min-w-0">
                        <div className="w-16 h-14 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0 shadow-2xs">
                          {photo.image ? (
                            <img src={photo.image} alt={photo.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-300">
                              <Camera className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-bold text-zinc-900 truncate">{photo.title}</h4>
                            {photo.images && photo.images.length > 1 && (
                              <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold px-2 py-0.5 rounded flex items-center space-x-1 shrink-0">
                                <Layers className="w-2.5 h-2.5" />
                                <span>Album ({photo.images.length})</span>
                              </span>
                            )}
                            {photo.category && (
                              <span className="text-[10px] bg-zinc-100 text-zinc-600 font-semibold px-2 py-0.5 rounded shrink-0">
                                {photo.category}
                              </span>
                            )}
                          </div>
                          {photo.caption && (
                            <p className="text-xs text-zinc-500 line-clamp-1">{photo.caption}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-3 text-[10px] text-zinc-400">
                            {photo.location && (
                              <span className="flex items-center space-x-1">
                                <MapPin className="w-3 h-3" />
                                <span>{photo.location}</span>
                              </span>
                            )}
                            {photo.date && (
                              <span className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>{photo.date}</span>
                              </span>
                            )}
                            {photo.tags && photo.tags.length > 0 && (
                              <span className="text-zinc-500">
                                #{photo.tags.slice(0, 2).join(" #")}
                                {photo.tags.length > 2 && ` +${photo.tags.length - 2}`}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
                        <button
                          onClick={() => handleStartEditPhoto(photo)}
                          className="p-1.5 text-zinc-500 hover:text-zinc-900 rounded-md hover:bg-zinc-100 cursor-pointer"
                          title="Edit Photo"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="p-1.5 text-red-500 hover:text-red-700 rounded-md hover:bg-red-50 cursor-pointer"
                          title="Delete Photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* BULK UPLOAD MODE CHOICE MODAL (Single Album vs Separate Posts) */}
              {showBulkChoiceModal && pendingBulkFiles && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 space-y-5">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <Layers className="w-3.5 h-3.5" />
                          <span>{pendingBulkFiles.length} Photos Selected</span>
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900">
                          Choose Upload Format / আপলোড ফরম্যাট বেছে নিন
                        </h3>
                        <p className="text-xs text-zinc-500">
                          How would you like to publish these {pendingBulkFiles.length} photos in your portfolio?
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setShowBulkChoiceModal(false);
                          setPendingBulkFiles(null);
                        }}
                        className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-3 pt-1">
                      {/* Option 1: Single Album */}
                      <button
                        type="button"
                        onClick={() => executeBulkUpload(pendingBulkFiles, "album")}
                        className="w-full text-left p-4 rounded-xl border-2 border-indigo-200 hover:border-indigo-600 bg-indigo-50/40 hover:bg-indigo-50 transition-all cursor-pointer group shadow-xs"
                      >
                        <div className="flex items-center space-x-3 mb-1.5">
                          <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                            <Layers className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-zinc-900 group-hover:text-indigo-950 flex items-center space-x-1.5">
                              <span>Create 1 Multi-Image Album / Carousel</span>
                              <span className="text-[10px] bg-indigo-600 text-white font-bold px-1.5 py-0.2 rounded">Recommended</span>
                            </h4>
                            <p className="text-xs text-indigo-900 font-medium">
                              এক পোস্টে অ্যালবাম / স্লাইডার
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-zinc-600 pl-12 leading-relaxed">
                          All {pendingBulkFiles.length} photos will be bundled inside a single interactive gallery card with a carousel slider and thumbnail viewer. Gemini AI will write an overarching series story.
                        </p>
                      </button>

                      {/* Option 2: Separate Posts */}
                      <button
                        type="button"
                        onClick={() => executeBulkUpload(pendingBulkFiles, "individual")}
                        className="w-full text-left p-4 rounded-xl border-2 border-zinc-200 hover:border-zinc-900 bg-zinc-50 hover:bg-zinc-100 transition-all cursor-pointer group shadow-xs"
                      >
                        <div className="flex items-center space-x-3 mb-1.5">
                          <div className="w-9 h-9 rounded-lg bg-zinc-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                            <Camera className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-zinc-900 group-hover:text-black">
                              Create {pendingBulkFiles.length} Separate Posts
                            </h4>
                            <p className="text-xs text-zinc-600 font-medium">
                              প্রতিটি ছবির জন্য আলাদা আলাদা পোস্ট
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-zinc-600 pl-12 leading-relaxed">
                          Each photo will be published as its own individual post card in the gallery grid with distinct AI titles and descriptions.
                        </p>
                      </button>
                    </div>

                    <div className="flex items-center justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowBulkChoiceModal(false);
                          setPendingBulkFiles(null);
                        }}
                        className="px-4 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CONTACT LINKS */}
          {activeTab === "contact" && (
            <form onSubmit={handleSaveContact} className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">Contact & Social Links</h2>
                <p className="text-xs text-zinc-500">Update your email, WhatsApp, Facebook, and YouTube links.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formContact.email}
                  onChange={(e) => setFormContact({ ...formContact, email: e.target.value })}
                  placeholder="e.g. rafiulislam125@gmail.com"
                  className="w-full px-3.5 py-2 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-hidden focus:border-zinc-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  WhatsApp Number or Link
                </label>
                <input
                  type="text"
                  value={formContact.whatsapp}
                  onChange={(e) => setFormContact({ ...formContact, whatsapp: e.target.value })}
                  placeholder="e.g. +8801700000000 or https://wa.me/8801700000000"
                  className="w-full px-3.5 py-2 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-hidden focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Facebook Profile Link
                </label>
                <input
                  type="text"
                  value={formContact.facebook}
                  onChange={(e) => setFormContact({ ...formContact, facebook: e.target.value })}
                  placeholder="e.g. https://facebook.com/yourprofile"
                  className="w-full px-3.5 py-2 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-hidden focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  YouTube Channel Link
                </label>
                <input
                  type="text"
                  value={formContact.youtube}
                  onChange={(e) => setFormContact({ ...formContact, youtube: e.target.value })}
                  placeholder="e.g. https://youtube.com/@yourchannel"
                  className="w-full px-3.5 py-2 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-hidden focus:border-zinc-900"
                />
              </div>

              <div className="pt-4 border-t border-zinc-100 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center space-x-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Contact Links</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB: REVIEW APPROVALS & TESTIMONIALS */}
          {activeTab === "reviews" && (
            <AdminTestimonialsTab
              testimonials={testimonials}
              setTestimonials={setTestimonials}
              pendingReviews={pendingReviews}
              setPendingReviews={setPendingReviews}
              showToast={showToast}
            />
          )}

          {/* TAB: PROJECT INQUIRIES & LEADS */}
          {activeTab === "inquiries" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">Client Project Inquiries & Leads</h2>
                <p className="text-xs text-zinc-500">
                  Prospective clients and project briefs submitted through the interactive Quote Estimator.
                </p>
              </div>

              {inquiries.length === 0 ? (
                <div className="text-center py-16 bg-zinc-50 border border-dashed border-zinc-200 rounded-2xl space-y-2">
                  <Inbox className="w-8 h-8 text-zinc-300 mx-auto" />
                  <h3 className="text-sm font-semibold text-zinc-700">No Inquiries Yet</h3>
                  <p className="text-xs text-zinc-400">
                    Client requests and quote submissions will show up here automatically.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {inquiries.map((inq, idx) => (
                    <div
                      key={inq.id || idx}
                      className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-zinc-900 flex items-center space-x-2">
                            <span>{inq.clientName || "Prospective Client"}</span>
                            {inq.brandName && (
                              <span className="text-xs text-zinc-500">({inq.brandName})</span>
                            )}
                          </h4>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-600 mt-1">
                            {inq.email && <span>✉️ {inq.email}</span>}
                            {inq.phone && <span>📱 {inq.phone}</span>}
                            {inq.createdAt && (
                              <span className="text-[11px] text-zinc-400">
                                {new Date(inq.createdAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {inq.budget && (
                            <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                              Budget: {inq.budget}
                            </span>
                          )}
                          {inq.timeline && (
                            <span className="text-[11px] font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                              Timeline: {inq.timeline}
                            </span>
                          )}
                        </div>
                      </div>

                      {inq.services && inq.services.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {inq.services.map((srv: string, sIdx: number) => (
                            <span
                              key={sIdx}
                              className="text-[11px] bg-white border border-zinc-200 text-zinc-700 px-2 py-0.5 rounded-md font-medium"
                            >
                              ✓ {srv}
                            </span>
                          ))}
                        </div>
                      )}

                      {inq.brief && (
                        <div className="bg-white p-3.5 rounded-xl border border-zinc-200 text-xs sm:text-sm text-zinc-700">
                          <p className="font-semibold text-zinc-900 text-xs mb-1">Project Brief:</p>
                          <p className="leading-relaxed">{inq.brief}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-end space-x-3 pt-1">
                        {inq.phone && (
                          <a
                            href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                          >
                            <span>WhatsApp Client</span>
                          </a>
                        )}
                        {inq.email && (
                          <a
                            href={`mailto:${inq.email}?subject=Project Proposal Response`}
                            className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-700 hover:text-blue-800"
                          >
                            <span>Reply via Email</span>
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteInquiry(inq)}
                          className="text-xs text-red-600 hover:text-red-700 px-2 py-1 rounded cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SECURITY & ADMIN PASSWORD */}
          {activeTab === "security" && (
            <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">Change Admin Password</h2>
                <p className="text-xs text-zinc-500">Update your security password for accessing the admin panel.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3.5 py-2 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-hidden focus:border-zinc-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-3.5 py-2 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-hidden focus:border-zinc-900"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center space-x-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}
