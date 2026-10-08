import React, { useState } from "react";
import { CaseStudyItem } from "../../types";
import { saveCaseStudiesToCloud } from "../../lib/firebase";
import { safeSetLocalStorage } from "../../lib/storage";
import { Plus, Edit2, Trash2, Save, X, TrendingUp, Sparkles, Quote, CheckCircle2, AlertCircle } from "lucide-react";

interface AdminCaseStudiesTabProps {
  caseStudies: CaseStudyItem[];
  setCaseStudies: React.Dispatch<React.SetStateAction<CaseStudyItem[]>>;
  showToast: (msg: string) => void;
}

export default function AdminCaseStudiesTab({
  caseStudies = [],
  setCaseStudies,
  showToast,
}: AdminCaseStudiesTabProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const [form, setForm] = useState<CaseStudyItem>({
    id: "",
    brand: "",
    industry: "",
    summary: "",
    metricBadge: "+250% Growth",
    before: { reach: "", engagement: "", videoViews: "", followers: "", challenges: [] },
    after: { reach: "", engagement: "", videoViews: "", followers: "", results: [] },
    quote: "",
    quoteAuthor: "",
  });

  const [challengesInput, setChallengesInput] = useState("");
  const [resultsInput, setResultsInput] = useState("");

  const handleStartAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setForm({
      id: `case_${Date.now()}`,
      brand: "",
      industry: "Hospitality & Dining",
      summary: "",
      metricBadge: "+350% Growth",
      before: { reach: "5k / mo", engagement: "1.5%", videoViews: "10k", followers: "3,000", challenges: [] },
      after: { reach: "120k / mo", engagement: "8.2%", videoViews: "350k+", followers: "15,000+", results: [] },
      quote: "",
      quoteAuthor: "Client Lead",
    });
    setChallengesInput("Low engagement rate\nIrregular posting\nLack of high quality video assets");
    setResultsInput("High retention reels\nConsistent weekly schedule\nQuadrupled client inquiries");
  };

  const handleStartEdit = (item: CaseStudyItem) => {
    setEditingId(item.id);
    setIsAdding(false);
    setForm(item);
    setChallengesInput(item.before?.challenges ? item.before.challenges.join("\n") : "");
    setResultsInput(item.after?.results ? item.after.results.join("\n") : "");
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const challengesArray = challengesInput.split("\n").map((s) => s.trim()).filter(Boolean);
    const resultsArray = resultsInput.split("\n").map((s) => s.trim()).filter(Boolean);

    const fullItem: CaseStudyItem = {
      ...form,
      id: editingId || form.id || `case_${Date.now()}`,
      before: { ...form.before, challenges: challengesArray },
      after: { ...form.after, results: resultsArray },
    };

    let updated: CaseStudyItem[];
    if (editingId) {
      updated = caseStudies.map((c) => (c.id === editingId ? fullItem : c));
      showToast("Case study updated successfully!");
    } else {
      updated = [...caseStudies, fullItem];
      showToast("New case study added!");
    }

    setCaseStudies(updated);
    safeSetLocalStorage("raf_case_studies", JSON.stringify(updated));
    try {
      await saveCaseStudiesToCloud(updated);
    } catch (err) {
      console.error(err);
    }

    setIsAdding(false);
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this case study?")) return;
    const updated = caseStudies.filter((c) => c.id !== id);
    setCaseStudies(updated);
    safeSetLocalStorage("raf_case_studies", JSON.stringify(updated));
    try {
      await saveCaseStudiesToCloud(updated);
    } catch (err) {
      console.error(err);
    }
    showToast("Case study deleted.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="text-xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
            Growth Case Studies (Before vs After)
          </h2>
          <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mt-0.5">
            Showcase data-driven client growth transformations with reach, engagement, and follower metrics.
          </p>
        </div>

        {!isAdding && !editingId && (
          <button
            onClick={handleStartAdd}
            className="inline-flex items-center space-x-1.5 bg-[#2F5D3A] hover:bg-[#1E4D2B] text-white text-xs font-extrabold px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Case Study</span>
          </button>
        )}
      </div>

      {/* Add / Edit Form */}
      {(isAdding || editingId) && (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-[#102416] p-6 rounded-2xl border-2 border-[#2F5D3A]/40 dark:border-[#52A368]/60 shadow-lg space-y-6 animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700 pb-3">
            <h3 className="text-base font-extrabold text-zinc-950 dark:text-white flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{editingId ? "Edit Case Study" : "Add New Case Study"}</span>
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
                Brand / Client Name *
              </label>
              <input
                type="text"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                placeholder="e.g. Masala Skunjo Restaurant"
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-[#142C1B] border-2 border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-950 dark:text-white focus:border-[#2F5D3A] focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-zinc-950 dark:text-zinc-100 uppercase tracking-wider mb-1.5">
                Industry / Niche *
              </label>
              <input
                type="text"
                value={form.industry}
                onChange={(e) => setForm({ ...form, industry: e.target.value })}
                placeholder="e.g. Dining & Hospitality"
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-[#142C1B] border-2 border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-950 dark:text-white focus:border-[#2F5D3A] focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-zinc-950 dark:text-zinc-100 uppercase tracking-wider mb-1.5">
                Metric Badge *
              </label>
              <input
                type="text"
                value={form.metricBadge}
                onChange={(e) => setForm({ ...form, metricBadge: e.target.value })}
                placeholder="e.g. +340% Reach Multiplier"
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-[#142C1B] border-2 border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-950 dark:text-white focus:border-[#2F5D3A] focus:outline-hidden"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-zinc-950 dark:text-zinc-100 uppercase tracking-wider mb-1.5">
              Summary / Strategy Description *
            </label>
            <textarea
              rows={2}
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              placeholder="Overview of the core growth strategy applied to the client's channels..."
              className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-[#142C1B] border-2 border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-950 dark:text-white focus:border-[#2F5D3A] focus:outline-hidden"
              required
            />
          </div>

          {/* Before vs After Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* BEFORE */}
            <div className="p-4 bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl space-y-3">
              <h4 className="text-sm font-extrabold text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>BEFORE (Initial Baseline)</span>
              </h4>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-800 dark:text-zinc-200">Monthly Reach</label>
                  <input
                    type="text"
                    value={form.before.reach}
                    onChange={(e) => setForm({ ...form, before: { ...form.before, reach: e.target.value } })}
                    placeholder="e.g. 3.2k / mo"
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-[#142C1B] border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-bold text-zinc-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-800 dark:text-zinc-200">Engagement</label>
                  <input
                    type="text"
                    value={form.before.engagement}
                    onChange={(e) => setForm({ ...form, before: { ...form.before, engagement: e.target.value } })}
                    placeholder="e.g. 1.4%"
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-[#142C1B] border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-bold text-zinc-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-800 dark:text-zinc-200">Video Views</label>
                  <input
                    type="text"
                    value={form.before.videoViews}
                    onChange={(e) => setForm({ ...form, before: { ...form.before, videoViews: e.target.value } })}
                    placeholder="e.g. 4.5k"
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-[#142C1B] border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-bold text-zinc-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-800 dark:text-zinc-200">Followers</label>
                  <input
                    type="text"
                    value={form.before.followers}
                    onChange={(e) => setForm({ ...form, before: { ...form.before, followers: e.target.value } })}
                    placeholder="e.g. 4,200"
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-[#142C1B] border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-bold text-zinc-950 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                  Key Challenges (One per line)
                </label>
                <textarea
                  rows={3}
                  value={challengesInput}
                  onChange={(e) => setChallengesInput(e.target.value)}
                  placeholder="Low engagement&#10;Static photos&#10;Irregular posting"
                  className="w-full px-2.5 py-2 bg-white dark:bg-[#142C1B] border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-medium text-zinc-950 dark:text-white"
                />
              </div>
            </div>

            {/* AFTER */}
            <div className="p-4 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-2xl space-y-3">
              <h4 className="text-sm font-extrabold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>AFTER (Optimized Results)</span>
              </h4>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-800 dark:text-zinc-200">Monthly Reach</label>
                  <input
                    type="text"
                    value={form.after.reach}
                    onChange={(e) => setForm({ ...form, after: { ...form.after, reach: e.target.value } })}
                    placeholder="e.g. 145k+ / mo"
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-[#142C1B] border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-bold text-zinc-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-800 dark:text-zinc-200">Engagement</label>
                  <input
                    type="text"
                    value={form.after.engagement}
                    onChange={(e) => setForm({ ...form, after: { ...form.after, engagement: e.target.value } })}
                    placeholder="e.g. 7.8%"
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-[#142C1B] border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-bold text-zinc-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-800 dark:text-zinc-200">Video Views</label>
                  <input
                    type="text"
                    value={form.after.videoViews}
                    onChange={(e) => setForm({ ...form, after: { ...form.after, videoViews: e.target.value } })}
                    placeholder="e.g. 380k+"
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-[#142C1B] border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-bold text-zinc-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-800 dark:text-zinc-200">Followers</label>
                  <input
                    type="text"
                    value={form.after.followers}
                    onChange={(e) => setForm({ ...form, after: { ...form.after, followers: e.target.value } })}
                    placeholder="e.g. 18,400+"
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-[#142C1B] border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-bold text-zinc-950 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                  Key Outcomes & Solutions (One per line)
                </label>
                <textarea
                  rows={3}
                  value={resultsInput}
                  onChange={(e) => setResultsInput(e.target.value)}
                  placeholder="High retention reels&#10;Consistent 4x weekly storytelling&#10;Inquiries quadrupled"
                  className="w-full px-2.5 py-2 bg-white dark:bg-[#142C1B] border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-medium text-zinc-950 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-extrabold text-zinc-950 dark:text-zinc-100 uppercase tracking-wider mb-1.5">
                Client Testimonial Quote
              </label>
              <input
                type="text"
                value={form.quote}
                onChange={(e) => setForm({ ...form, quote: e.target.value })}
                placeholder="e.g. Rafiul completely transformed our social presence..."
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-[#142C1B] border-2 border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-950 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-zinc-950 dark:text-zinc-100 uppercase tracking-wider mb-1.5">
                Quote Author / Stakeholder
              </label>
              <input
                type="text"
                value={form.quoteAuthor}
                onChange={(e) => setForm({ ...form, quoteAuthor: e.target.value })}
                placeholder="e.g. Founder, Masala Skunjo"
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-[#142C1B] border-2 border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-950 dark:text-white"
              />
            </div>
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
              <span>{editingId ? "Update Case Study" : "Save Case Study"}</span>
            </button>
          </div>
        </form>
      )}

      {/* List of Case Studies */}
      <div className="space-y-4">
        {caseStudies.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-6">
            <TrendingUp className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-zinc-900 dark:text-white">No case studies yet.</p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              Click &quot;Add Case Study&quot; above to showcase your client success stories.
            </p>
          </div>
        ) : (
          caseStudies.map((study) => (
            <div
              key={study.id}
              className="bg-white dark:bg-[#0D1F13] border-2 border-zinc-200 dark:border-[#386B46]/60 rounded-2xl p-5 shadow-xs hover:border-[#2F5D3A] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    {study.metricBadge}
                  </span>
                  <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
                    {study.industry}
                  </span>
                </div>

                <h4 className="text-base font-extrabold text-zinc-950 dark:text-white">
                  {study.brand}
                </h4>

                <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 line-clamp-2 font-medium">
                  {study.summary}
                </p>

                <div className="flex flex-wrap gap-4 pt-1 text-xs text-zinc-600 dark:text-zinc-300 font-bold">
                  <span>Reach: <strong className="text-emerald-700 dark:text-emerald-400">{study.after.reach}</strong></span>
                  <span>Engagement: <strong className="text-emerald-700 dark:text-emerald-400">{study.after.engagement}</strong></span>
                  <span>Followers: <strong className="text-emerald-700 dark:text-emerald-400">{study.after.followers}</strong></span>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                <button
                  onClick={() => handleStartEdit(study)}
                  className="p-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-zinc-800 dark:text-zinc-200 hover:text-emerald-700 rounded-lg transition-colors cursor-pointer"
                  title="Edit Case Study"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(study.id)}
                  className="p-2 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-600 dark:text-red-400 rounded-lg transition-colors cursor-pointer"
                  title="Delete Case Study"
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
