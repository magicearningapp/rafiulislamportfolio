import React from "react";
import { MapPin, ArrowRight, Mail, FileText, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { ProfileData } from "../types";
import { useThemeLanguage } from "../context/ThemeLanguageContext";

interface HeroProps {
  profile: ProfileData;
  onOpenResumeModal: () => void;
  onOpenQuoteModal: () => void;
}

export default function Hero({ profile, onOpenResumeModal, onOpenQuoteModal }: HeroProps) {
  const { t } = useThemeLanguage();

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="home" className="pt-32 pb-20 md:pt-40 md:pb-28 px-6 sm:px-8 border-b border-[#8FAF72]/30 dark:border-[#8FAF72]/40 relative overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col-reverse md:flex-row items-start md:items-center justify-between gap-12 lg:gap-16">
          {/* Left Column: Text Information */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 space-y-6"
          >
            {/* Availability & Location Tags */}
            <div className="flex flex-wrap items-center gap-2.5">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#172117] dark:text-white bg-white/95 dark:bg-[#122617] px-4 py-2 rounded-full border border-[#8FAF72]/50 dark:border-[#8FAF72]/70 shadow-xs dark:shadow-[0_0_12px_rgba(143,175,114,0.3)]"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981] animate-pulse" />
                <MapPin className="w-3.5 h-3.5 text-[#2F5D3A] dark:text-[#A3E699]" />
                <span>{profile.location || "Bangladesh"}</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#1F452B] dark:text-[#A3E699] bg-[#8FAF72]/20 dark:bg-[#17331D] px-3.5 py-2 rounded-full border border-[#2F5D3A]/30 dark:border-[#8FAF72]/70 dark:shadow-[0_0_14px_rgba(163,230,153,0.35)]"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#2F5D3A] dark:text-[#A3E699]" />
                <span>{t.hero.availabilityBadge}</span>
              </motion.div>
            </div>

            {/* Name & Title with Luminous Contrast */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="space-y-2.5"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#172117] dark:text-white leading-[1.12] drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] glow-heading">
                {profile.name}
              </h1>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#2F5D3A] dark:text-[#A3E699] glow-mint tracking-tight">
                {profile.title}
              </p>
            </motion.div>

            {/* Short Introduction with Razor-Sharp Readability */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="text-base sm:text-lg text-[#2A3B2A] dark:text-[#E4EFE4] leading-relaxed max-w-xl font-medium drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
            >
              {profile.shortIntro}
            </motion.p>

            {/* Action Buttons: Contact, View Work, Download CV, Get Quote */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="flex flex-wrap items-center gap-3 pt-3"
            >
              {/* Primary Contact Button */}
              <a
                href="#contact"
                onClick={(e) => handleScrollTo(e, "#contact")}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-[#2F5D3A] hover:from-emerald-500 hover:to-[#387046] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl transition-all shadow-[0_4px_20px_rgba(16,185,129,0.4)] dark:shadow-[0_0_22px_rgba(34,197,94,0.55)] hover:shadow-[0_0_28px_rgba(34,197,94,0.75)] hover:-translate-y-0.5 cursor-pointer"
              >
                <span>{t.hero.contactBtn}</span>
                <Mail className="w-4 h-4" />
              </a>

              {/* View Works */}
              <a
                href="#works"
                onClick={(e) => handleScrollTo(e, "#works")}
                className="inline-flex items-center space-x-2 bg-white dark:bg-[#122617] hover:bg-[#8FAF72]/15 dark:hover:bg-[#1A3822] text-[#172117] dark:text-white font-bold text-xs sm:text-sm px-5 py-3.5 rounded-xl border border-[#8FAF72]/50 dark:border-[#8FAF72]/70 transition-all shadow-sm dark:shadow-[0_0_12px_rgba(143,175,114,0.25)] hover:-translate-y-0.5 cursor-pointer"
              >
                <span>{t.hero.viewWorkBtn}</span>
                <ArrowRight className="w-4 h-4 text-[#2F5D3A] dark:text-[#A3E699]" />
              </a>

              {/* Download CV Modal Trigger */}
              <button
                type="button"
                onClick={onOpenResumeModal}
                className="inline-flex items-center space-x-2 bg-white dark:bg-[#122617] hover:bg-[#8FAF72]/20 dark:hover:bg-[#1A3822] text-[#2F5D3A] dark:text-[#A3E699] font-bold text-xs sm:text-sm px-5 py-3.5 rounded-xl border border-[#2F5D3A]/40 dark:border-[#8FAF72]/70 transition-all shadow-sm dark:shadow-[0_0_14px_rgba(163,230,153,0.3)] hover:-translate-y-0.5 cursor-pointer"
                title="View and download full professional resume"
              >
                <FileText className="w-4 h-4 text-[#2F5D3A] dark:text-[#A3E699]" />
                <span>{t.hero.downloadCvBtn}</span>
              </button>

              {/* Free Quote Modal Trigger */}
              <button
                type="button"
                onClick={onOpenQuoteModal}
                className="inline-flex items-center space-x-1.5 bg-[#8FAF72]/25 dark:bg-[#17351F] hover:bg-[#8FAF72]/40 dark:hover:bg-[#20492B] text-[#172117] dark:text-white font-bold text-xs sm:text-sm px-5 py-3.5 rounded-xl border border-[#8FAF72]/50 dark:border-[#8FAF72]/80 transition-all shadow-sm dark:shadow-[0_0_14px_rgba(143,175,114,0.35)] hover:-translate-y-0.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#2F5D3A] dark:text-[#A3E699]" />
                <span>{t.hero.getQuoteBtn}</span>
              </button>
            </motion.div>
          </motion.div>

          {/* Right Column: Profile Photo with Glowing Halo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="shrink-0 self-center md:self-auto relative group"
          >
            {/* Multi-layered Luminous Ambient Halo */}
            <div className="absolute -inset-3 bg-gradient-to-r from-emerald-500/60 via-[#8FAF72]/60 to-[#A3E699]/70 rounded-3xl blur-2xl opacity-90 group-hover:opacity-100 transition duration-500 shadow-[0_0_35px_rgba(143,175,114,0.45)]" />
            <div className="relative w-48 h-48 sm:w-60 sm:h-60 md:w-64 md:h-64 rounded-3xl overflow-hidden bg-white dark:bg-[#0F2013] border-2 border-[#8FAF72]/50 dark:border-[#A3E699]/60 shadow-2xl">
              {profile.photo ? (
                <img
                  src={profile.photo}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#8FAF72] font-semibold text-2xl">
                  {profile.name.charAt(0)}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
