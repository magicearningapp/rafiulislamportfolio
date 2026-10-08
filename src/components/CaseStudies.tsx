import { useState } from "react";
import { TrendingUp, Users, Eye, ArrowUpRight, Sparkles, CheckCircle2, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { useThemeLanguage } from "../context/ThemeLanguageContext";
import { CaseStudyItem, DEFAULT_CASE_STUDIES } from "../types";

interface CaseStudiesProps {
  items?: CaseStudyItem[];
}

export default function CaseStudies({ items }: CaseStudiesProps) {
  const { language, t } = useThemeLanguage();

  const defaultCases: CaseStudyItem[] = [
    {
      id: "masala",
      brand: "Masala Skunjo Restaurant",
      industry: "Dining & Hospitality",
      industryBn: "ডাইনিং ও হসপিটালিটি",
      summary: "Restructured organic social presence using food-prep reels, customer reviews, and local geo-targeting.",
      summaryBn: "ফুড প্রিপারেশন রিলস, কাস্টমার রিভিউ এবং জিও-টার্গেটিং ব্যবহারের মাধ্যমে পেজের সার্বিক রূপান্তর।",
      metricBadge: "+340% Reach Multiplier",
      before: {
        reach: "3.2k / mo",
        engagement: "1.4%",
        videoViews: "4.5k",
        followers: "4,200",
        challenges: [
          "Static low-resolution food photos",
          "Irregular posting schedule",
          "Low direct message reservation rate",
        ],
        challengesBn: [
          "কম রেজোলিউশনের সাধারণ ছবি",
          "অনিয়মিত পোস্ট সিডিউল",
          "টেবিল বুকিং বা মেসেজের স্বল্পতা",
        ],
      },
      after: {
        reach: "145k+ / mo",
        engagement: "7.8%",
        videoViews: "380k+",
        followers: "18,400+",
        results: [
          "High-retention cinematic food reels",
          "Consistent 4x weekly storytelling",
          "Weekend table reservations quadrupled",
        ],
        resultsBn: [
          "উচ্চ রিটেনশনের সিনেমাটিক ফুড রিলস",
          "সপ্তাহে ৪টি ধারাবাহিক স্টোরিটেলিং পোস্ট",
          "উইকেন্ডে টেবিল বুকিং ৪ গুণ বৃদ্ধি",
        ],
      },
      quote: "Rafiul completely changed the face of our online marketing. Customers now visit us showing reels he edited!",
      quoteAuthor: "Founder, Masala Skunjo",
    },
    {
      id: "amago",
      brand: "Amago Pabna Community",
      industry: "Culture & Regional Media",
      industryBn: "সংস্কৃতি ও রিজিওনাল মিডিয়া",
      summary: "Turned a stagnant regional page into one of the largest active organic community hubs in Northern Bengal.",
      summaryBn: "পাবনার সংস্কৃতি ও ইতিবাচক ঘটনা তুলে ধরে উত্তরবঙ্গের অন্যতম সক্রিয় কমিউনিটি পেজে রূপান্তর।",
      metricBadge: "1.2M+ Monthly Views",
      before: {
        reach: "18k / mo",
        engagement: "2.1%",
        videoViews: "25k",
        followers: "12,000",
        challenges: [
          "Copy-pasted news snippets with high drop-off",
          "Lack of visual identity & original video",
        ],
        challengesBn: [
          "সাধারণ নিউজ কপি-পেস্ট ও কম এনগেজমেন্ট",
          "নিজস্ব ভিডিও ও ব্র্যান্ড আইডেন্টিটির অভাব",
        ],
      },
      after: {
        reach: "650k+ / mo",
        engagement: "9.2%",
        videoViews: "1.2M+",
        followers: "68,000+",
        results: [
          "Original photo documentary & cultural reels",
          "3,000+ average comments & active shares per week",
          "Recognized as trusted regional community media",
        ],
        resultsBn: [
          "অরিজিনাল ফটো ডকুমেন্টারি ও কালচারাল রিলস",
          "সপ্তাহে গড়ে ৩,০০০+ সক্রিয় কমেন্ট ও শেয়ার",
          "বিশ্বস্ত স্থানীয় কমিউনিটি প্ল্যাটফর্ম হিসেবে স্বীকৃতি",
        ],
      },
      quote: "The engagement numbers speak for themselves. The page gained tremendous respect and organic love.",
      quoteAuthor: "Community Coordinator",
    },
    {
      id: "garena",
      brand: "Digital Community Platform",
      industry: "Gaming & E-Commerce",
      industryBn: "গেমিং ও ই-কমার্স",
      summary: "Built automated customer response funnels, weekly interactive community contests, and instant trust proof.",
      summaryBn: "কমিউনিটি কনটেস্ট, ইনস্ট্যান্ট রেসপন্স ফানেল এবং সিকিউর সার্ভিস প্রুফিংয়ের মাধ্যমে আস্থার উন্নয়ন।",
      metricBadge: "+420% Customer Loyalty",
      before: {
        reach: "9.5k / mo",
        engagement: "1.8%",
        videoViews: "12k",
        followers: "8,500",
        challenges: [
          "High skepticism regarding online transactions",
          "Slow inquiry response times",
        ],
        challengesBn: [
          "অনলাইন লেনদেন নিয়ে ক্রেতাদের দ্বিধা",
          "মেসেজের ধীরগতির উত্তর",
        ],
      },
      after: {
        reach: "88k+ / mo",
        engagement: "8.4%",
        videoViews: "210k+",
        followers: "24,000+",
        results: [
          "Instant social proof testimonials & trust badge",
          "98% positive sentiment rating in community",
          "Daily recurring customer retention increased by 3.2x",
        ],
        resultsBn: [
          "স্বচ্ছ সোশ্যাল প্রুফ ও ক্লায়েন্ট রিভিউ শোকেস",
          "কমিউনিটিতে ৯৮% ইতিবাচক রেটিং ও রিভিউ",
          "পুনরায় সার্ভিস নেওয়ার হার ৩.২ গুণ বৃদ্ধি",
        ],
      },
      quote: "Transactions became so smooth once Rafiul structured our customer proof stories and social campaigns.",
      quoteAuthor: "Operations Head",
    },
  ];

  const caseStudies = (items && items.length > 0) ? items : defaultCases;
  const [activeTabId, setActiveTabId] = useState<string>(() => caseStudies[0]?.id || "masala");
  const [viewMode, setViewMode] = useState<"after" | "before">("after");

  const currentCase = caseStudies.find((c) => c.id === activeTabId) || caseStudies[0] || DEFAULT_CASE_STUDIES[0];

  return (
    <section id="case-studies" className="py-20 md:py-28 px-6 sm:px-8 border-b border-[#8FAF72]/30 relative">
      <motion.div
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px", amount: 0.1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-5xl mx-auto space-y-12"
      >
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#173522] dark:bg-[#183820] text-[#8FAF72] dark:text-[#A3E699] border border-[#8FAF72]/30 dark:border-[#8FAF72]/50 text-xs font-semibold tracking-wide">
              <TrendingUp className="w-3.5 h-3.5 text-[#8FAF72] dark:text-[#A3E699]" />
              <span className="uppercase tracking-wider">{t.caseStudies.badge}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#172117] dark:text-white glow-heading">
              {t.caseStudies.title}
            </h2>
            <p className="text-[#4E5E4E] dark:text-[#DCE8DD] text-sm sm:text-base leading-relaxed font-medium">
              {t.caseStudies.subtitle}
            </p>
          </div>

          {/* Quick Tab Switcher */}
          <div className="flex flex-wrap gap-2 p-1.5 bg-[#8FAF72]/20 dark:bg-[#122617] rounded-2xl max-w-fit border border-[#8FAF72]/30 dark:border-[#8FAF72]/50">
            {caseStudies.map((cs) => (
              <button
                key={cs.id}
                onClick={() => setActiveTabId(cs.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTabId === cs.id
                    ? "bg-[#2F5D3A] dark:bg-emerald-600 text-white shadow-xs dark:shadow-[0_0_12px_rgba(34,197,94,0.4)]"
                    : "text-[#4E5E4E] dark:text-zinc-300 hover:text-[#172117] dark:hover:text-white"
                }`}
              >
                {cs.brand}
              </button>
            ))}
          </div>
        </div>

        {/* Case Study Card */}
        <div className="bg-white/95 dark:bg-[#0F2013] backdrop-blur-md border border-[#8FAF72]/35 dark:border-[#8FAF72]/50 rounded-3xl p-6 sm:p-10 shadow-lg dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] space-y-8">
          {/* Top Brand Banner & Before/After Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#8FAF72]/30 dark:border-[#8FAF72]/45">
            <div>
              <div className="inline-block px-2.5 py-0.5 rounded-md bg-[#2F5D3A]/10 dark:bg-[#16331E] text-[#2F5D3A] dark:text-[#A3E699] text-[11px] font-bold tracking-wide mb-1 border border-[#8FAF72]/30 dark:border-[#8FAF72]/40">
                {language === "bn" ? currentCase.industryBn : currentCase.industry}
              </div>
              <h3 className="text-2xl font-extrabold text-[#172117] dark:text-white tracking-tight">
                {currentCase.brand}
              </h3>
              <p className="text-xs sm:text-sm text-[#4E5E4E] dark:text-[#DCE8DD] mt-1 max-w-xl font-normal">
                {language === "bn" ? currentCase.summaryBn : currentCase.summary}
              </p>
            </div>

            {/* Interactive Before vs After Pill Toggle */}
            <div className="flex items-center p-1 bg-[#F4F1E6] dark:bg-[#152B1B] rounded-xl border border-[#8FAF72]/40 dark:border-[#8FAF72]/60 self-start sm:self-auto shrink-0 shadow-2xs">
              <button
                onClick={() => setViewMode("before")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "before"
                    ? "bg-rose-500 text-white shadow-xs"
                    : "text-[#4E5E4E] dark:text-zinc-300 hover:text-[#172117] dark:hover:text-white"
                }`}
              >
                {language === "bn" ? "পূর্বে (Before)" : "Before SMM"}
              </button>
              <button
                onClick={() => setViewMode("after")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "after"
                    ? "bg-emerald-600 text-white shadow-xs dark:shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                    : "text-[#4E5E4E] dark:text-zinc-300 hover:text-[#172117] dark:hover:text-white"
                }`}
              >
                {language === "bn" ? "পরে (After)" : "After Management"}
              </button>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div
              className={`p-4 rounded-2xl border transition-all ${
                viewMode === "after"
                  ? "bg-[#2F5D3A]/10 dark:bg-[#16331E] border-[#2F5D3A]/30 dark:border-[#8FAF72]/50 text-[#172117] dark:text-white"
                  : "bg-rose-50/70 dark:bg-[#281517] border-rose-200 dark:border-rose-900/60 text-zinc-900 dark:text-white"
              }`}
            >
              <div className="text-[11px] font-bold text-[#4E5E4E] dark:text-[#A8BFA9] uppercase tracking-wider">
                {language === "bn" ? "মাসিক রিচ" : "Monthly Reach"}
              </div>
              <div className="text-2xl font-extrabold mt-1 text-[#172117] dark:text-white glow-heading">
                {viewMode === "after" ? currentCase.after.reach : currentCase.before.reach}
              </div>
              <div
                className={`text-[11px] font-bold mt-1 ${
                  viewMode === "after" ? "text-emerald-700 dark:text-[#A3E699] glow-mint" : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {viewMode === "after" ? "+340% increase" : "Stagnant baseline"}
              </div>
            </div>

            <div
              className={`p-4 rounded-2xl border transition-all ${
                viewMode === "after"
                  ? "bg-[#2F5D3A]/10 dark:bg-[#16331E] border-[#2F5D3A]/30 dark:border-[#8FAF72]/50 text-[#172117] dark:text-white"
                  : "bg-rose-50/70 dark:bg-[#281517] border-rose-200 dark:border-rose-900/60 text-zinc-900 dark:text-white"
              }`}
            >
              <div className="text-[11px] font-bold text-[#4E5E4E] dark:text-[#A8BFA9] uppercase tracking-wider">
                {language === "bn" ? "এনগেজমেন্ট রেট" : "Engagement Rate"}
              </div>
              <div className="text-2xl font-extrabold mt-1 text-[#172117] dark:text-white glow-heading">
                {viewMode === "after" ? currentCase.after.engagement : currentCase.before.engagement}
              </div>
              <div
                className={`text-[11px] font-bold mt-1 ${
                  viewMode === "after" ? "text-emerald-700 dark:text-[#A3E699] glow-mint" : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {viewMode === "after" ? "5.5x higher" : "Low audience response"}
              </div>
            </div>

            <div
              className={`p-4 rounded-2xl border transition-all ${
                viewMode === "after"
                  ? "bg-[#2F5D3A]/10 dark:bg-[#16331E] border-[#2F5D3A]/30 dark:border-[#8FAF72]/50 text-[#172117] dark:text-white"
                  : "bg-rose-50/70 dark:bg-[#281517] border-rose-200 dark:border-rose-900/60 text-zinc-900 dark:text-white"
              }`}
            >
              <div className="text-[11px] font-bold text-[#4E5E4E] dark:text-[#A8BFA9] uppercase tracking-wider">
                {language === "bn" ? "ভিডিও ভিউস" : "Monthly Video Views"}
              </div>
              <div className="text-2xl font-extrabold mt-1 text-[#172117] dark:text-white glow-heading">
                {viewMode === "after" ? currentCase.after.videoViews : currentCase.before.videoViews}
              </div>
              <div
                className={`text-[11px] font-bold mt-1 ${
                  viewMode === "after" ? "text-emerald-700 dark:text-[#A3E699] glow-mint" : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {viewMode === "after" ? "Viral food hooks" : "Quick audience drop"}
              </div>
            </div>

            <div
              className={`p-4 rounded-2xl border transition-all ${
                viewMode === "after"
                  ? "bg-[#2F5D3A]/10 dark:bg-[#16331E] border-[#2F5D3A]/30 dark:border-[#8FAF72]/50 text-[#172117] dark:text-white"
                  : "bg-rose-50/70 dark:bg-[#281517] border-rose-200 dark:border-rose-900/60 text-zinc-900 dark:text-white"
              }`}
            >
              <div className="text-[11px] font-bold text-[#4E5E4E] dark:text-[#A8BFA9] uppercase tracking-wider">
                {language === "bn" ? "অডিয়েন্স ফলোয়ার" : "Audience Scale"}
              </div>
              <div className="text-2xl font-extrabold mt-1 text-[#172117] dark:text-white glow-heading">
                {viewMode === "after" ? currentCase.after.followers : currentCase.before.followers}
              </div>
              <div
                className={`text-[11px] font-bold mt-1 ${
                  viewMode === "after" ? "text-emerald-700 dark:text-[#A3E699] glow-mint" : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {viewMode === "after" ? "Organic local followers" : "Growth stalled"}
              </div>
            </div>
          </div>

          {/* Action Points / Key Highlights */}
          <div className="p-6 rounded-2xl bg-[#F4F1E6]/80 dark:bg-[#122617] border border-[#8FAF72]/35 dark:border-[#8FAF72]/50 space-y-3.5">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#172117] dark:text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#2F5D3A] dark:text-[#A3E699]" />
              <span>
                {viewMode === "after"
                  ? language === "bn"
                    ? "সফল স্ট্র্যাটেজি ও অর্জিত ফলাফল"
                    : "Implemented Strategies & Breakthroughs"
                  : language === "bn"
                  ? "পূর্বে বিদ্যমান সমস্যা ও দুর্বলতাসমূহ"
                  : "Previous Challenges & Bottlenecks"}
              </span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(viewMode === "after"
                ? language === "bn"
                  ? currentCase.after.resultsBn
                  : currentCase.after.results
                : language === "bn"
                ? currentCase.before.challengesBn
                : currentCase.before.challenges
              ).map((point, pIdx) => (
                <div key={pIdx} className="flex items-start space-x-2 text-xs text-[#304230] dark:text-[#E2EDE2] font-medium leading-relaxed">
                  <CheckCircle2
                    className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                      viewMode === "after" ? "text-emerald-600 dark:text-[#A3E699]" : "text-rose-500"
                    }`}
                  />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Client Mini Quote */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#4E5E4E] dark:text-[#DCE8DD] italic">
            <p>"{currentCase.quote}" — <span className="font-bold not-italic text-[#172117] dark:text-white">{currentCase.quoteAuthor}</span></p>
            <span className="inline-flex items-center text-[11px] font-bold text-[#2F5D3A] dark:text-[#A3E699] bg-[#2F5D3A]/10 dark:bg-[#17351F] border border-[#8FAF72]/30 dark:border-[#8FAF72]/50 px-3 py-1 rounded-full not-italic shadow-2xs">
              {currentCase.metricBadge}
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
