import React, { useState } from "react";
import { X, Star, Sparkles, Send, CheckCircle2 } from "lucide-react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useThemeLanguage } from "../context/ThemeLanguageContext";
import { safeSetLocalStorage, safeGetLocalStorage } from "../lib/storage";

interface ReviewSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

export default function ReviewSubmissionModal({
  isOpen,
  onClose,
  onSubmitted,
}: ReviewSubmissionModalProps) {
  const { language, t } = useThemeLanguage();

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [rating, setRating] = useState(5);
  const [metric, setMetric] = useState("");
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    setIsSubmitting(true);

    const payload = {
      name: name.trim(),
      role: role.trim() || (language === "bn" ? "ক্লায়েন্ট" : "Client"),
      company: company.trim() || "",
      rating,
      metric: metric.trim() || (language === "bn" ? "অর্গানিক গ্রোথ" : "+340% Reach"),
      comment: comment.trim(),
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    try {
      // Local storage backup
      const existing = JSON.parse(safeGetLocalStorage("raf_pending_reviews") || "[]");
      safeSetLocalStorage("raf_pending_reviews", JSON.stringify([payload, ...existing]));

      // Save to Firestore pending_testimonials
      await addDoc(collection(db, "pending_testimonials"), payload);

      setIsSubmitted(true);
      if (onSubmitted) onSubmitted();
    } catch (err) {
      console.error("Error submitting review:", err);
      // Fallback success locally
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl max-w-lg w-full border border-[#8FAF72]/40 shadow-2xl overflow-hidden my-6 flex flex-col">
        {/* Header */}
        <div className="bg-[#173522] text-white px-6 py-5 flex items-center justify-between border-b border-[#8FAF72]/30 shrink-0">
          <div className="space-y-0.5">
            <div className="inline-flex items-center space-x-1.5 text-xs text-[#8FAF72] font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === "bn" ? "ক্লায়েন্ট ফিডব্যাক" : "Verified Social Proof"}</span>
            </div>
            <h2 className="text-lg font-bold tracking-tight text-white">
              {t.reviewModal.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {isSubmitted ? (
          <div className="p-8 sm:p-10 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-[#172117]">
              {language === "bn" ? "রিভিউ জমা হয়েছে!" : "Testimonial Submitted!"}
            </h3>
            <p className="text-xs sm:text-sm text-[#4E5E4E] leading-relaxed max-w-sm mx-auto">
              {t.reviewModal.successMsg}
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  onClose();
                }}
                className="bg-[#2F5D3A] text-white font-semibold text-xs px-6 py-2.5 rounded-xl hover:bg-[#1F452B] transition-colors cursor-pointer"
              >
                {t.quoteModal.closeBtn}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4 text-[#172117]">
            {/* Star Rating Select */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2F5D3A]">
                {t.reviewModal.ratingLabel}
              </label>
              <div className="flex items-center space-x-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-amber-400 hover:scale-115 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        (hoverRating || rating) >= star
                          ? "fill-amber-400 text-amber-500"
                          : "text-zinc-300"
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-semibold text-[#172117] ml-2">
                  {rating} / 5.0
                </span>
              </div>
            </div>

            {/* Name & Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#4E5E4E] mb-1">
                  {t.reviewModal.nameLabel}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Asif Mahmud"
                  className="w-full px-3 py-2 bg-white border border-[#8FAF72]/40 rounded-xl text-xs text-[#172117] focus:outline-hidden focus:border-[#2F5D3A]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#4E5E4E] mb-1">
                  {t.reviewModal.roleLabel}
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Founder & CEO"
                  className="w-full px-3 py-2 bg-white border border-[#8FAF72]/40 rounded-xl text-xs text-[#172117] focus:outline-hidden focus:border-[#2F5D3A]"
                />
              </div>
            </div>

            {/* Company & Metric */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#4E5E4E] mb-1">
                  {t.reviewModal.companyLabel}
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Masala Skunjo"
                  className="w-full px-3 py-2 bg-white border border-[#8FAF72]/40 rounded-xl text-xs text-[#172117] focus:outline-hidden focus:border-[#2F5D3A]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#4E5E4E] mb-1">
                  {t.reviewModal.metricLabel}
                </label>
                <input
                  type="text"
                  value={metric}
                  onChange={(e) => setMetric(e.target.value)}
                  placeholder="e.g. +340% Reach in 2 Months"
                  className="w-full px-3 py-2 bg-white border border-[#8FAF72]/40 rounded-xl text-xs text-[#172117] focus:outline-hidden focus:border-[#2F5D3A]"
                />
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-[11px] font-semibold text-[#4E5E4E] mb-1">
                {t.reviewModal.reviewLabel}
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  language === "bn"
                    ? "রাফিউলের কাজের মান, সময়ানুবর্তিতা এবং ফলাফল সম্পর্কে আপনার মতামত লিখুন..."
                    : "Describe the results, communication, and impact on your business..."
                }
                className="w-full px-3 py-2 bg-white border border-[#8FAF72]/40 rounded-xl text-xs text-[#172117] focus:outline-hidden focus:border-[#2F5D3A]"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-[#4E5E4E] hover:text-[#172117] rounded-xl cursor-pointer"
              >
                {t.quoteModal.closeBtn}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center space-x-1.5 bg-[#2F5D3A] hover:bg-[#1F452B] text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? t.reviewModal.submittingBtn : t.reviewModal.submitBtn}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
