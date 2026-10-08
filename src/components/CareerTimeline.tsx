import { Briefcase, GraduationCap, Award, Calendar, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { useThemeLanguage } from "../context/ThemeLanguageContext";
import { TimelineItem } from "../types";

interface CareerTimelineProps {
  items?: TimelineItem[];
}

export default function CareerTimeline({ items }: CareerTimelineProps) {
  const { language } = useThemeLanguage();

  const defaultBn: TimelineItem[] = [
    {
      id: "tl1",
      period: "২০২৪ — বর্তমান",
      role: "সিনিয়র সোশ্যাল মিডিয়া স্ট্র্যাটেজিস্ট ও কনসালট্যান্ট",
      company: "ফ্রিল্যান্স ও ব্র্যান্ড পার্টনারশিপ",
      location: "বাংলাদেশ ও রিমোট",
      type: "work",
      description: "৫০+ ক্লায়েন্টের পেজ ম্যানেজমেন্ট, ডেটা-ড্রিভেন কন্টেন্ট ক্যালেন্ডার প্রণয়ন, শর্ট-ফর্ম ভাইরাল রিলস স্ট্র্যাটেজি এবং ৩.৪ গুণ গড় রিচ বৃদ্ধি।",
      skills: ["Meta Business Suite", "Reels & TikTok Growth", "Content Funnels", "Brand Positioning"],
    },
    {
      id: "tl2",
      period: "২০২২ — ২০২৪",
      role: "লিড কন্টেন্ট ক্রিয়েটর ও ভিডিও এডিটর",
      company: "ডিজিটাল মিডিয়া এজেন্সি",
      location: "পাবনা, বাংলাদেশ",
      type: "work",
      description: "ফুড অ্যান্ড হসপিটালিটি, ই-কমার্স এবং কমিউনিটি পেজগুলোর জন্য হাই-রিটেনশন শর্ট ও লং ফর্ম ভিডিও এডিটিং এবং ভিজ্যুয়াল ব্র্যান্ডিং।",
      skills: ["Adobe Premiere Pro", "CapCut Pro", "Copywriting", "Storytelling"],
    },
    {
      id: "tl3",
      period: "২০২০ — ২০২২",
      role: "ডিজিটাল মার্কেটিং স্পেশালিস্ট",
      company: "রিজিওনাল মিডিয়া ইনিশিয়েটিভস",
      location: "বাংলাদেশ",
      type: "work",
      description: "স্থানীয় ব্র্যান্ড ও পাবনা কমিউনিটির জন্য অর্গানিক অডিয়েন্স বিল্ডিং, সোশ্যাল ইভেন্ট কাভারেজ ও ফটোগ্রাফি ডকুমেন্টেশন।",
      skills: ["Audience Growth", "Community Engagement", "Digital PR", "Photography"],
    },
    {
      id: "tl4",
      period: "২০১৯ — ২০২০",
      role: "ডিজিটাল কন্টেন্ট ও মিডিয়া স্টাডিজ",
      company: "প্রফেশনাল সার্টিফিকেশন ও স্কিল ডেভেলপমেন্ট",
      location: "বাংলাদেশ",
      type: "education",
      description: "সোশ্যাল মিডিয়া অ্যালগরিদম, ডিজিটাল ফটোগ্রাফি, ভিজ্যুয়াল কম্পোজিশন এবং ব্র্যান্ডিং স্ট্র্যাটেজিতে নিবিড় প্রশিক্ষণ।",
      skills: ["Visual Composition", "Color Grading", "Social Algorithms"],
    },
  ];

  const defaultEn: TimelineItem[] = [
    {
      id: "tl1",
      period: "2024 — Present",
      role: "Senior Social Media Strategist & Brand Consultant",
      company: "Independent & Brand Partnerships",
      location: "Bangladesh & Global Remote",
      type: "work",
      description: "Managing full-funnel digital presence for 50+ clients, high-retention video strategies, paid/organic convergence, and generating 3.4x average reach multiplier.",
      skills: ["Meta Business Suite", "Reels & TikTok Strategy", "Audience Funnels", "Brand Positioning"],
    },
    {
      id: "tl2",
      period: "2022 — 2024",
      role: "Lead Content Creator & Video Editor",
      company: "Digital Media Agency",
      location: "Pabna, Bangladesh",
      type: "work",
      description: "Produced cinematic food reels, e-commerce product videos, and community narratives with high retention metrics across Facebook, YouTube, and TikTok.",
      skills: ["Adobe Premiere Pro", "CapCut Pro", "Copywriting", "Storytelling"],
    },
    {
      id: "tl3",
      period: "2020 — 2022",
      role: "Digital Marketing Specialist & Community Builder",
      company: "Regional Brand Initiatives",
      location: "Bangladesh",
      type: "work",
      description: "Scaled local community platforms to 68k+ members, organized digital marketing campaigns, and managed photo documentary series.",
      skills: ["Audience Growth", "Community Engagement", "Digital PR", "Photography"],
    },
    {
      id: "tl4",
      period: "2019 — 2020",
      role: "Digital Media & Content Production Certification",
      company: "Professional Skill Development",
      location: "Bangladesh",
      type: "education",
      description: "Focused training in social media algorithms, digital landscape photography, audience psychology, and viral narrative construction.",
      skills: ["Visual Composition", "Color Grading", "Social Algorithms"],
    },
  ];

  const timelineData: TimelineItem[] = (items && items.length > 0)
    ? items
    : (language === "bn" ? defaultBn : defaultEn);

  return (
    <div className="space-y-6 pt-6 border-t border-[#8FAF72]/25">
      <div className="flex items-center space-x-2">
        <div className="p-1.5 rounded-lg bg-[#1F452B] text-[#8FAF72] shrink-0">
          <Briefcase className="w-4 h-4" />
        </div>
        <h3 className="text-xl font-bold tracking-tight text-[#172117]">
          {language === "bn" ? "কর্মজীবনের মাইলফলক ও অভিজ্ঞতা" : "Career Milestones & Experience"}
        </h3>
      </div>

      <div className="relative pl-6 sm:pl-8 border-l-2 border-[#8FAF72]/40 space-y-8 my-4">
        {timelineData.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative group"
          >
            {/* Timeline Dot Indicator */}
            <div className="absolute -left-[31px] sm:-left-[39px] top-1 w-4 h-4 rounded-full bg-white dark:bg-[#0A140D] border-2 border-[#2F5D3A] dark:border-[#A3E699] group-hover:scale-125 group-hover:bg-[#2F5D3A] dark:group-hover:bg-[#A3E699] transition-all duration-200 shadow-xs dark:shadow-[0_0_8px_#A3E699]" />

            <div className="bg-white/90 dark:bg-[#0F2013] border border-[#8FAF72]/35 dark:border-[#8FAF72]/50 rounded-2xl p-5 hover:border-[#8FAF72] hover:shadow-md transition-all duration-300 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center space-x-1.5 text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#2F5D3A]/10 dark:bg-[#17351F] text-[#2F5D3A] dark:text-[#A3E699] border border-[#8FAF72]/30 dark:border-[#8FAF72]/50">
                  <Calendar className="w-3 h-3" />
                  <span>{item.period}</span>
                </span>
                <span className="text-[11px] text-[#4E5E4E] dark:text-[#A8BFA9] font-medium">{item.location}</span>
              </div>

              <div>
                <h4 className="text-base font-bold text-[#172117] dark:text-white group-hover:text-[#2F5D3A] dark:group-hover:text-[#A3E699] transition-colors">
                  {item.role}
                </h4>
                <p className="text-xs font-semibold text-[#467A4A] dark:text-[#8FAF72]">{item.company}</p>
              </div>

              <p className="text-xs sm:text-sm text-[#4E5E4E] dark:text-[#DCE8DD] leading-relaxed">
                {item.description}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {item.skills.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="inline-flex items-center space-x-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#F4F1E6] dark:bg-[#162D1D] text-[#172117] dark:text-white border border-[#8FAF72]/35 dark:border-[#8FAF72]/50"
                  >
                    <CheckCircle2 className="w-2.5 h-2.5 text-[#2F5D3A] dark:text-[#A3E699]" />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
