import { ArrowUp, Lock } from "lucide-react";
import { motion } from "motion/react";
import { useThemeLanguage } from "../context/ThemeLanguageContext";

interface FooterProps {
  footerText: string;
  onNavigateAdmin: () => void;
}

export default function Footer({ footerText, onNavigateAdmin }: FooterProps) {
  const { t } = useThemeLanguage();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="py-10 px-6 sm:px-8 bg-white border-t border-[#8FAF72]/30"
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#4E5E4E]">
        <div>
          <p>{footerText}</p>
        </div>

        <div className="flex items-center space-x-6">
          <button
            onClick={onNavigateAdmin}
            className="hover:text-[#172117] transition-colors inline-flex items-center space-x-1 cursor-pointer"
          >
            <Lock className="w-3 h-3 text-[#2F5D3A]" />
            <span>Admin</span>
          </button>

          <button
            onClick={scrollToTop}
            className="hover:text-[#172117] transition-colors inline-flex items-center space-x-1 cursor-pointer"
          >
            <span>{t.footer.backToTop}</span>
            <ArrowUp className="w-3.5 h-3.5 text-[#2F5D3A]" />
          </button>
        </div>
      </div>
    </motion.footer>
  );
}
