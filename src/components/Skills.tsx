import { SkillItem } from "../types";
import { CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { useThemeLanguage } from "../context/ThemeLanguageContext";

interface SkillsProps {
  skills: SkillItem[];
}

export default function Skills({ skills }: SkillsProps) {
  const { t } = useThemeLanguage();

  return (
    <section id="skills" className="py-20 md:py-28 px-6 sm:px-8 border-b border-[#8FAF72]/30 bg-[#8FAF72]/10 backdrop-blur-xs relative">
      <motion.div
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px", amount: 0.12 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-5xl mx-auto space-y-12"
      >
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#467A4A] dark:text-[#A3E699]">
            {t.skills.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#172117] dark:text-white glow-heading">
            {t.skills.title}
          </h2>
          <p className="text-[#4E5E4E] dark:text-[#DCE8DD] text-sm sm:text-base font-medium">
            {t.skills.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {skills.map((skill, index) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: (index % 2) * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white/95 dark:bg-[#0F2013] border border-[#8FAF72]/35 dark:border-[#8FAF72]/50 rounded-2xl p-6 transition-all duration-300 hover:border-[#8FAF72] hover:shadow-md dark:hover:shadow-[0_0_20px_rgba(143,175,114,0.25)] hover:-translate-y-1 space-y-2.5"
            >
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 rounded-lg bg-[#1F452B] dark:bg-[#1A3822] text-[#8FAF72] dark:text-[#A3E699] border border-[#8FAF72]/30 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-[#172117] dark:text-white tracking-tight">
                  {skill.name}
                </h3>
              </div>
              {skill.description && (
                <p className="text-sm text-[#4E5E4E] dark:text-[#DCE8DD] leading-relaxed pl-9">
                  {skill.description}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
