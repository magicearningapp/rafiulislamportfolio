import { motion } from "motion/react";
import { FileText } from "lucide-react";
import CareerTimeline from "./CareerTimeline";
import { useThemeLanguage } from "../context/ThemeLanguageContext";
import { TimelineItem } from "../types";

interface AboutProps {
  aboutText: string;
  onOpenResumeModal?: () => void;
  timeline?: TimelineItem[];
}

export default function About({ aboutText, onOpenResumeModal, timeline }: AboutProps) {
  const { t, language } = useThemeLanguage();
  const paragraphs = aboutText.split("\n\n").filter(Boolean);

  return (
    <section id="about" className="py-20 md:py-28 px-6 sm:px-8 border-b border-[#8FAF72]/30 relative">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px", amount: 0.15 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white/95 dark:bg-[#0F2013] border border-[#8FAF72]/35 dark:border-[#8FAF72]/50 rounded-3xl p-8 sm:p-10 shadow-sm dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest text-[#467A4A] dark:text-[#A3E699]">
                {t.about.badge}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#172117] dark:text-white glow-heading">
                {t.about.title}
              </h2>
            </div>

            {onOpenResumeModal && (
              <button
                onClick={onOpenResumeModal}
                className="inline-flex items-center space-x-2 self-start sm:self-auto bg-[#F4F1E6] dark:bg-[#162E1D] hover:bg-[#8FAF72]/20 dark:hover:bg-[#1E3F27] text-[#2F5D3A] dark:text-[#A3E699] border border-[#8FAF72]/45 dark:border-[#8FAF72]/60 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs hover:shadow-sm cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-[#2F5D3A] dark:text-[#A3E699]" />
                <span>{t.about.downloadResume}</span>
              </button>
            )}
          </div>

          <div className="space-y-4 text-base sm:text-lg text-[#324532] dark:text-[#E2EDE2] leading-relaxed font-normal">
            {paragraphs.length > 0 ? (
              paragraphs.map((p, idx) => <p key={idx}>{p}</p>)
            ) : (
              <p>{aboutText}</p>
            )}
          </div>

          {/* Interactive Experience Timeline Component */}
          <CareerTimeline items={timeline} />
        </motion.div>
      </div>
    </section>
  );
}
