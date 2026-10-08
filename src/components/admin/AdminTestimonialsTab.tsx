import React, { useState } from "react";
import { TestimonialItem } from "../../types";
import { saveTestimonialsToCloud, db } from "../../lib/firebase";
import { safeSetLocalStorage } from "../../lib/storage";
import { doc, deleteDoc } from "firebase/firestore";
import { Plus, Edit2, Trash2, Save, X, Star, Check, AlertCircle, MessageSquare } from "lucide-react";

interface AdminTestimonialsTabProps {
  testimonials: TestimonialItem[];
  setTestimonials?: React.Dispatch<React.SetStateAction<TestimonialItem[]>>;
  pendingReviews: any[];
  setPendingReviews: React.Dispatch<React.SetStateAction<any[]>>;
  showToast: (msg: string) => void;
}

export default function AdminTestimonialsTab({
  testimonials = [],
  setTestimonials,
  pendingReviews = [],
  setPendingReviews,
  showToast,
}: AdminTestimonialsTabProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const [form, setForm] = useState<Omit<TestimonialItem, "id">>({
    name: "",
    role: "Founder & CEO",
    company: "",
    rating: 5,
    quote: "",
    metric: "+300% Reach",
    projectTitle: "",
    date: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
  });

  const handleStartAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setForm({
      name: "",
      role: "Client / Founder",
      company: "",
      rating: 5,
      quote: "",
      metric: "+340% Growth",
      projectTitle: "Social Media Strategy & Reels",
      date: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    });
  };

  const handleStartEdit = (item: TestimonialItem) => {
    setEditingId(item.id);
    setIsAdding(false);
    setForm({
      name: item.name,
      role: item.role,
      company: item.company || "",
      rating: item.rating || 5,
      quote: item.quote || item.comment || "",
      metric: item.metric || "",
      projectTitle: item.projectTitle || "",
      date: item.date || "",
    });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setTestimonials) return;

    let updated: TestimonialItem[];
    if (editingId) {
      updated = testimonials.map((t) =>
        t.id === editingId ? { ...form, id: editingId } : t
      );
      showToast("Testimonial updated!");
    } else {
      const newItem: TestimonialItem = {
        ...form,
        id: `t_${Date.now()}`,
      };
      updated = [newItem, ...testimonials];
      showToast("New testimonial published!");
    }

    setTestimonials(updated);
    safeSetLocalStorage("raf_testimonials", JSON.stringify(updated));
    try {
      await saveTestimonialsToCloud(updated);
    } catch (err) {
      console.error(err);
    }

    setIsAdding(false);
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!setTestimonials) return;
    if (!window.confirm("Delete this published testimonial?")) return;
    const updated = testimonials.filter((t) => t.id !== id);
    setTestimonials(updated);
    safeSetLocalStorage("raf_testimonials", JSON.stringify(updated));
    try {
      await saveTestimonialsToCloud(updated);
    } catch (err) {
      console.error(err);
    }
    showToast("Testimonial deleted.");
  };

  const handleApprovePending = async (review: any) => {
    if (!setTestimonials) return;
    const newTestimonial: TestimonialItem = {
      id: `t_${Date.now()}`,
      name: review.name,
      role: review.role || "Client",
      company: review.company || "",
      rating: review.rating || 5,
      quote: review.comment || review.quote || "",
      metric: review.metric || "+250% Growth",
      projectTitle: review.projectTitle || "Social Media Campaign",
      date: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    };

    const updated = [newTestimonial, ...testimonials];
    setTestimonials(updated);
    safeSetLocalStorage("raf_testimonials", JSON.stringify(updated));

    // Remove from pending list
    const remaining = pendingReviews.filter(
      (r) => r.id !== review.id && r.createdAt !== review.createdAt
    );
    setPendingReviews(remaining);
    safeSetLocalStorage("raf_pending_reviews", JSON.stringify(remaining));

    if (review.id) {
      try {
        await deleteDoc(doc(db, "pending_testimonials", review.id));
      } catch (e) {}
    }

    try {
      await saveTestimonialsToCloud(updated);
    } catch (e) {}

    showToast("Review approved and published to live website!");
  };

  const handleRejectPending = async (review: any) => {
    const remaining = pendingReviews.filter(
      (r) => r.id !== review.id && r.createdAt !== review.createdAt
    );
    setPendingReviews(remaining);
    safeSetLocalStorage("raf_pending_reviews", JSON.stringify(remaining));

    if (review.id) {
      try {
        await deleteDoc(doc(db, "pending_testimonials", review.id));
      } catch (e) {}
    }
    showToast("Review dismissed.");
  };

  return (
    <div className="space-y-8">
      {/* 1. Pending Approvals Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b-2 border-zinc-200 dark:border-zinc-800">
          <div>
            <h2 className="text-xl font-extrabold text-zinc-950 dark:text-white tracking-tight flex items-center space-x-2">
              <span>Visitor Review Submissions</span>
              {pendingReviews.length > 0 && (
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-amber-500 text-white animate-pulse">
                  {pendingReviews.length} Pending
                </span>
              )}
            </h2>
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Visitor reviews submitted via the public &quot;Write a Review&quot; modal requiring your moderation.
            </p>
          </div>
        </div>

        {pendingReviews.length === 0 ? (
          <div className="p-6 bg-zinc-50 dark:bg-[#0D1F13] border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl text-center space-y-1">
            <Star className="w-6 h-6 text-zinc-400 mx-auto" />
            <p className="text-sm font-bold text-zinc-900 dark:text-white">No pending review submissions</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              When clients leave a review on the site, they will queue here for 1-click approval.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingReviews.map((rev, idx) => (
              <div
                key={rev.id || idx}
                className="bg-amber-500/10 border-2 border-amber-500/30 dark:border-amber-500/40 rounded-2xl p-5 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-extrabold text-zinc-950 dark:text-white flex items-center space-x-2">
                      <span>{rev.name}</span>
                      <span className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold">
                        ({rev.role} {rev.company ? `• ${rev.company}` : ""})
                      </span>
                    </h4>
                    {rev.metric && (
                      <span className="inline-block mt-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                        Metric: {rev.metric}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1 text-amber-500">
                    {Array.from({ length: rev.rating || 5 }).map((_, sIdx) => (
                      <Star key={sIdx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 italic bg-white dark:bg-[#122818] p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 font-medium">
                  &quot;{rev.comment}&quot;
                </p>

                <div className="flex items-center justify-end space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleRejectPending(rev)}
                    className="px-3 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                  >
                    Dismiss
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprovePending(rev)}
                    className="inline-flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold px-4 py-1.5 rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve & Publish Live</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Published Live Testimonials */}
      <div className="space-y-4 pt-4 border-t-2 border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
              Published Testimonials ({testimonials.length})
            </h2>
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              These client reviews are live in the interactive Testimonials carousel on the homepage.
            </p>
          </div>

          {!isAdding && !editingId && (
            <button
              onClick={handleStartAdd}
              className="inline-flex items-center space-x-1.5 bg-[#2F5D3A] hover:bg-[#1E4D2B] text-white text-xs font-extrabold px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Testimonial</span>
            </button>
          )}
        </div>

        {/* Add/Edit Testimonial Form */}
        {(isAdding || editingId) && (
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-[#102416] p-6 rounded-2xl border-2 border-[#2F5D3A]/40 dark:border-[#52A368]/60 shadow-lg space-y-5 animate-in fade-in"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700 pb-3">
              <h3 className="text-base font-extrabold text-zinc-950 dark:text-white flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{editingId ? "Edit Testimonial" : "Create New Live Testimonial"}</span>
              </h3>
              <button
                type="button"
                onClick={handleCancel}
                className="text-zinc-500 hover:text-zinc-800 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-zinc-950 dark:text-zinc-100 uppercase tracking-wider mb-1.5">
                  Client Full Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Tanvir Ahmed"
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-[#142C1B] border-2 border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-950 dark:text-white focus:border-[#2F5D3A] focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-zinc-950 dark:text-zinc-100 uppercase tracking-wider mb-1.5">
                  Client Role / Title *
                </label>
                <input
                  type="text"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  placeholder="e.g. Founder & CEO"
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-[#142C1B] border-2 border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-950 dark:text-white focus:border-[#2F5D3A] focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-zinc-950 dark:text-zinc-100 uppercase tracking-wider mb-1.5">
                  Company / Organization
                </label>
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="e.g. NextGen Media"
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-[#142C1B] border-2 border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-950 dark:text-white focus:border-[#2F5D3A] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-zinc-950 dark:text-zinc-100 uppercase tracking-wider mb-1.5">
                  Star Rating (1 - 5)
                </label>
                <select
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-[#142C1B] border-2 border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-950 dark:text-white focus:border-[#2F5D3A] focus:outline-hidden"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ 5 Stars</option>
                  <option value={4}>⭐⭐⭐⭐ 4 Stars</option>
                  <option value={3}>⭐⭐⭐ 3 Stars</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-zinc-950 dark:text-zinc-100 uppercase tracking-wider mb-1.5">
                  Metric Highlight
                </label>
                <input
                  type="text"
                  value={form.metric}
                  onChange={(e) => setForm({ ...form, metric: e.target.value })}
                  placeholder="e.g. +340% Community Growth"
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-[#142C1B] border-2 border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-950 dark:text-white focus:border-[#2F5D3A] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-zinc-950 dark:text-zinc-100 uppercase tracking-wider mb-1.5">
                  Date
                </label>
                <input
                  type="text"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  placeholder="e.g. August 2026"
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-[#142C1B] border-2 border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-950 dark:text-white focus:border-[#2F5D3A] focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-zinc-950 dark:text-zinc-100 uppercase tracking-wider mb-1.5">
                Client Testimonial Quote *
              </label>
              <textarea
                rows={3}
                value={form.quote}
                onChange={(e) => setForm({ ...form, quote: e.target.value })}
                placeholder="Write the detailed client testimonial quote..."
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-[#142C1B] border-2 border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-950 dark:text-white focus:border-[#2F5D3A] focus:outline-hidden"
                required
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center space-x-1.5 bg-[#2F5D3A] hover:bg-[#1E4D2B] text-white text-xs font-extrabold px-5 py-2.5 rounded-xl shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{editingId ? "Update Testimonial" : "Publish Testimonial"}</span>
              </button>
            </div>
          </form>
        )}

        {/* List of Published Testimonials */}
        <div className="space-y-4">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-[#0D1F13] border-2 border-zinc-200 dark:border-[#386B46]/60 rounded-2xl p-5 shadow-xs hover:border-[#2F5D3A] transition-all flex flex-col md:flex-row md:items-start justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-base font-extrabold text-zinc-950 dark:text-white">
                      {item.name}
                    </h4>
                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
                      ({item.role} {item.company ? `• ${item.company}` : ""})
                    </span>
                  </div>

                  <div className="flex items-center space-x-1 text-amber-500">
                    {Array.from({ length: item.rating || 5 }).map((_, sIdx) => (
                      <Star key={sIdx} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>

                {item.metric && (
                  <span className="inline-block text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    {item.metric}
                  </span>
                )}

                <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 italic leading-relaxed font-medium">
                  &quot;{item.quote || item.comment}&quot;
                </p>

                {item.date && (
                  <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
                    Published: {item.date}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 shrink-0 self-end md:self-start">
                <button
                  onClick={() => handleStartEdit(item)}
                  className="p-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-zinc-800 dark:text-zinc-200 hover:text-emerald-700 rounded-lg transition-colors cursor-pointer"
                  title="Edit Testimonial"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-600 dark:text-red-400 rounded-lg transition-colors cursor-pointer"
                  title="Delete Testimonial"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
