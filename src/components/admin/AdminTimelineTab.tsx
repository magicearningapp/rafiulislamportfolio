import React, { useState } from "react";
import { TimelineItem } from "../../types";
import { saveTimelineToCloud } from "../../lib/firebase";
import { safeSetLocalStorage } from "../../lib/storage";
import { Plus, Edit2, Trash2, Save, X, Calendar, Briefcase, GraduationCap, Award, MapPin, CheckCircle2 } from "lucide-react";

interface AdminTimelineTabProps {
  timeline: TimelineItem[];
  setTimeline: React.Dispatch<React.SetStateAction<TimelineItem[]>>;
  showToast: (msg: string) => void;
}

export default function AdminTimelineTab({
  timeline = [],
  setTimeline,
  showToast,
}: AdminTimelineTabProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<Omit<TimelineItem, "id">>({
    period: "",
    role: "",
    company: "",
    location: "",
    type: "work",
    description: "",
    skills: [],
  });
  const [skillsInput, setSkillsInput] = useState("");

  const handleStartAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setForm({
      period: "2025 — Present",
      role: "",
      company: "",
      location: "Bangladesh & Remote",
      type: "work",
      description: "",
      skills: [],
    });
    setSkillsInput("");
  };

  const handleStartEdit = (item: TimelineItem) => {
    setEditingId(item.id);
    setIsAdding(false);
    setForm({
      period: item.period,
      role: item.role,
      company: item.company,
      location: item.location,
      type: item.type,
      description: item.description,
      skills: item.skills,
    });
    setSkillsInput(item.skills.join(", "));
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const skillsArray = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    let updated: TimelineItem[];
    if (editingId) {
      updated = timeline.map((t) =>
        t.id === editingId ? { ...form, id: editingId, skills: skillsArray } : t
      );
      showToast("Career milestone updated successfully!");
    } else {
      const newItem: TimelineItem = {
        ...form,
        id: `tl_${Date.now()}`,
        skills: skillsArray,
      };
      updated = [newItem, ...timeline];
      showToast("New career milestone added!");
    }

    setTimeline(updated);
    safeSetLocalStorage("raf_timeline", JSON.stringify(updated));
    try {
      await saveTimelineToCloud(updated);
    } catch (err) {
      console.error(err);
    }

    setIsAdding(false);
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this career milestone?")) return;
    const updated = timeline.filter((t) => t.id !== id);
    setTimeline(updated);
    safeSetLocalStorage("raf_timeline", JSON.stringify(updated));
    try {
      await saveTimelineToCloud(updated);
    } catch (err) {
      console.error(err);
    }
    showToast("Milestone deleted.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="text-xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
            Career Milestones & Experience Timeline
          </h2>
          <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mt-0.5">
            Manage your career progression, education, and achievements displayed in the About section.
          </p>
        </div>

        {!isAdding && !editingId && (
          <button
            onClick={handleStartAdd}
            className="inline-flex items-center space-x-1.5 bg-[#2F5D3A] hover:bg-[#1E4D2B] text-white text-xs font-extrabold px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Milestone</span>
          </button>
        )}
      </div>

      {/* Add or Edit Form */}
      {(isAdding || editingId) && (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-[#102416] p-6 rounded-2xl border-2 border-[#2F5D3A]/40 dark:border-[#52A368]/60 shadow-lg space-y-5 animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700 pb-3">
            <h3 className="text-base font-extrabold text-zinc-950 dark:text-white flex items-center space-x-2">
              <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{editingId ? "Edit Career Milestone" : "Add New Career Milestone"}</span>
            </h3>
            <button
              type="button"
              onClick={handleCancel}
              className="text-zinc-500 hover:text-zinc-800 dark:hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-zinc-950 dark:text-zinc-100 uppercase tracking-wider mb-1.5">
                Role / Title *
              </label>
              <input
                type="text"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="e.g. Senior Social Media Strategist"
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-[#142C1B] border-2 border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-950 dark:text-white focus:border-[#2F5D3A] focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-zinc-950 dark:text-zinc-100 uppercase tracking-wider mb-1.5">
                Company / Institution *
              </label>
              <input
                type="text"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="e.g. Freelance & Agency Partnerships"
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-[#142C1B] border-2 border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-950 dark:text-white focus:border-[#2F5D3A] focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-zinc-950 dark:text-zinc-100 uppercase tracking-wider mb-1.5">
                Period / Timeline *
              </label>
              <input
                type="text"
                value={form.period}
                onChange={(e) => setForm({ ...form, period: e.target.value })}
                placeholder="e.g. 2024 — Present or 2022 — 2024"
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-[#142C1B] border-2 border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-950 dark:text-white focus:border-[#2F5D3A] focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-zinc-950 dark:text-zinc-100 uppercase tracking-wider mb-1.5">
                Location
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Pabna, Bangladesh or Remote"
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-[#142C1B] border-2 border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-950 dark:text-white focus:border-[#2F5D3A] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-zinc-950 dark:text-zinc-100 uppercase tracking-wider mb-1.5">
                Milestone Type
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as "work" | "education" | "award" })}
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-[#142C1B] border-2 border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-950 dark:text-white focus:border-[#2F5D3A] focus:outline-hidden"
              >
                <option value="work">💼 Work Experience</option>
                <option value="education">🎓 Education & Certification</option>
                <option value="award">🏆 Achievement / Award</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-zinc-950 dark:text-zinc-100 uppercase tracking-wider mb-1.5">
                Key Skills / Tools (Comma-separated)
              </label>
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="e.g. Meta Suite, Reels Strategy, Growth"
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-[#142C1B] border-2 border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-950 dark:text-white focus:border-[#2F5D3A] focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-zinc-950 dark:text-zinc-100 uppercase tracking-wider mb-1.5">
              Description / Responsibilities & Achievements *
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe your role, impact, key metrics achieved, and responsibilities..."
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
              <span>{editingId ? "Update Milestone" : "Save Milestone"}</span>
            </button>
          </div>
        </form>
      )}

      {/* List of Milestones */}
      <div className="space-y-4">
        {timeline.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-6">
            <Briefcase className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-zinc-900 dark:text-white">No career milestones yet.</p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              Click &quot;Add Milestone&quot; above to add your work experience and education history.
            </p>
          </div>
        ) : (
          timeline.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-[#0D1F13] border-2 border-zinc-200 dark:border-[#386B46]/60 rounded-2xl p-5 shadow-xs hover:border-[#2F5D3A] transition-all flex flex-col md:flex-row md:items-start justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center space-x-1 text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    <Calendar className="w-3 h-3" />
                    <span>{item.period}</span>
                  </span>

                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                    {item.type === "work" ? "💼 Work" : item.type === "education" ? "🎓 Education" : "🏆 Award"}
                  </span>

                  {item.location && (
                    <span className="inline-flex items-center space-x-1 text-xs text-zinc-600 dark:text-zinc-400 font-semibold">
                      <MapPin className="w-3 h-3" />
                      <span>{item.location}</span>
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-base font-extrabold text-zinc-950 dark:text-white">
                    {item.role}
                  </h4>
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    {item.company}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium">
                  {item.description}
                </p>

                {item.skills && item.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-[#142C1B] text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700"
                      >
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{s}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 shrink-0 self-end md:self-start">
                <button
                  onClick={() => handleStartEdit(item)}
                  className="p-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-zinc-800 dark:text-zinc-200 hover:text-emerald-700 rounded-lg transition-colors cursor-pointer"
                  title="Edit Milestone"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-600 dark:text-red-400 rounded-lg transition-colors cursor-pointer"
                  title="Delete Milestone"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
