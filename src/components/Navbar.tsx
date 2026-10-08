import React, { useState, useEffect } from "react";
import { Menu, X, Lock, Sun, Moon, Globe, Sparkles, Send, Briefcase, Award, FolderGit2, Star, Camera, Mail, FileText } from "lucide-react";
import { useThemeLanguage } from "../context/ThemeLanguageContext";

interface NavbarProps {
  onNavigateAdmin: () => void;
  brandName?: string;
  onOpenQuoteModal: () => void;
  onOpenResumeModal?: () => void;
}

export default function Navbar({
  onNavigateAdmin,
  brandName = "Md. Rafiul Islam",
  onOpenQuoteModal,
  onOpenResumeModal,
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, toggleTheme, language, toggleLanguage, t } = useThemeLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: t.nav.about, href: "#about", icon: Briefcase },
    { name: t.nav.skills, href: "#skills", icon: Award },
    { name: t.nav.works, href: "#works", icon: FolderGit2 },
    { name: t.nav.caseStudies, href: "#case-studies", icon: Sparkles },
    { name: t.nav.reviews, href: "#testimonials", icon: Star },
    { name: t.nav.gallery, href: "#gallery", icon: Camera },
    { name: t.nav.contact, href: "#contact", icon: Mail },
  ];

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      id="navbar"
      className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
        isScrolled
          ? "bg-[#F4F1E6]/95 dark:bg-[#071309]/95 backdrop-blur-2xl border-b-2 border-[#2F5D3A]/25 dark:border-[#52A368]/45 shadow-lg py-2.5"
          : "bg-[#F4F1E6]/90 dark:bg-[#071309]/90 backdrop-blur-xl border-b border-[#2F5D3A]/15 dark:border-[#52A368]/30 py-3.5"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-2">
        {/* Brand Name with Pulse Emerald Glow */}
        <a
          href="#home"
          onClick={(e) => handleScrollTo(e, "#home")}
          className="text-base sm:text-lg md:text-xl font-extrabold tracking-tight text-[#0A180E] dark:text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_0_12px_rgba(110,231,183,0.5)] hover:text-[#2F5D3A] dark:hover:text-[#4ADE80] transition-all flex items-center space-x-2 shrink-0 group"
        >
          <span className="w-3 h-3 rounded-full bg-emerald-600 dark:bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse shrink-0" />
          <span className="truncate max-w-[170px] sm:max-w-none">{brandName}</span>
        </a>

        {/* Desktop & Tablet Navigation Menu — High Contrast, Vivid Pill Container */}
        <nav className="hidden md:flex items-center space-x-1 p-1.5 rounded-full bg-white/90 dark:bg-[#0E2214]/90 border-2 border-[#2F5D3A]/25 dark:border-[#52A368]/45 shadow-md backdrop-blur-md">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleScrollTo(e, link.href)}
              className="px-3 py-1.5 rounded-full text-xs font-bold text-[#0A180E] dark:text-white hover:text-white hover:bg-[#2F5D3A] dark:hover:bg-[#1E4D2B] dark:hover:text-[#86EFAC] dark:hover:shadow-[0_0_12px_rgba(74,222,128,0.45)] transition-all duration-150"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Right Action Tools: Language, Theme, Quote CTA, Admin */}
        <div className="flex items-center space-x-2 sm:space-x-2.5">
          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="inline-flex items-center space-x-1 text-xs font-extrabold px-2.5 sm:px-3 py-1.5 rounded-xl border-2 border-[#2F5D3A]/30 dark:border-[#52A368]/50 bg-white dark:bg-[#0E2214] hover:bg-[#2F5D3A]/10 dark:hover:bg-[#1E4D2B] text-[#0A180E] dark:text-white transition-all cursor-pointer shadow-sm"
            title={language === "en" ? "বাংলা ভাষায় দেখুন" : "Switch to English"}
            aria-label="Toggle Language"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>{language === "en" ? "বাং" : "EN"}</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 rounded-xl border-2 border-[#2F5D3A]/30 dark:border-[#52A368]/50 bg-white dark:bg-[#0E2214] hover:bg-[#2F5D3A]/10 dark:hover:bg-[#1E4D2B] text-[#0A180E] dark:text-amber-300 transition-all cursor-pointer shadow-sm"
            title={theme === "light" ? "Switch to Kolapata Night (Dark Mode)" : "Switch to Kolapata Day (Light Mode)"}
            aria-label="Toggle Theme Mode"
          >
            {theme === "light" ? (
              <Moon className="w-4 h-4 text-emerald-800" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
            )}
          </button>

          {/* Executive CV Button */}
          {onOpenResumeModal && (
            <button
              onClick={onOpenResumeModal}
              className="inline-flex items-center space-x-1 text-xs font-extrabold text-[#0A180E] dark:text-zinc-100 hover:text-white hover:bg-[#2F5D3A] bg-white dark:bg-[#0E2214] border-2 border-[#2F5D3A]/30 dark:border-[#52A368]/50 px-2.5 sm:px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs"
              title="View Official Executive CV"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>{language === "bn" ? "সিভি" : "CV"}</span>
            </button>
          )}

          {/* Get a Quote / Hire CTA Button with Glowing Gradient */}
          <button
            onClick={onOpenQuoteModal}
            className="hidden sm:inline-flex items-center space-x-1.5 bg-gradient-to-r from-emerald-600 to-[#1F452B] hover:from-emerald-500 hover:to-[#275936] text-white text-xs font-extrabold px-3.5 sm:px-4 py-2 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] dark:shadow-[0_0_20px_rgba(52,211,153,0.5)] hover:shadow-[0_0_25px_rgba(52,211,153,0.7)] hover:scale-105 cursor-pointer shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-200 animate-pulse" />
            <span>{t.nav.hireMe}</span>
          </button>

          {/* Admin Login Button */}
          <button
            onClick={onNavigateAdmin}
            className="hidden md:inline-flex items-center space-x-1 text-xs font-bold text-[#0A180E] dark:text-zinc-100 hover:text-white hover:bg-[#2F5D3A] bg-white dark:bg-[#0E2214] border-2 border-[#2F5D3A]/25 dark:border-[#52A368]/40 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs"
            title="Admin Login"
            aria-label="Admin Login"
          >
            <Lock className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
            <span>{t.nav.admin}</span>
          </button>

          {/* Mobile Menu Hamburger Button — High-Contrast Styled Button with Clear Label */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border-2 border-[#2F5D3A]/40 dark:border-[#52A368]/60 bg-white dark:bg-[#0E2214] text-[#0A180E] dark:text-white shadow-sm focus:outline-hidden hover:bg-[#2F5D3A]/10"
            aria-label="Toggle Navigation Menu"
          >
            {isOpen ? <X className="w-5 h-5 text-emerald-700 dark:text-emerald-400" /> : <Menu className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />}
            <span className="text-xs font-extrabold uppercase tracking-wide">Menu</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer — Highly Legible, Full Contrast */}
      {isOpen && (
        <div className="md:hidden bg-[#F4F1E6] dark:bg-[#071309] border-b-2 border-[#2F5D3A]/40 dark:border-[#52A368]/60 px-6 py-5 space-y-3 shadow-2xl animate-in fade-in slide-in-from-top-2">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 pb-1 border-b border-[#2F5D3A]/20">
            Navigation Menu
          </div>
          {navLinks.map((link) => {
            const IconComponent = link.icon;
            return (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleScrollTo(e, link.href)}
                className="flex items-center space-x-3 py-2.5 px-3 rounded-lg text-sm font-bold text-[#0A180E] dark:text-white hover:bg-white dark:hover:bg-[#122818] hover:text-[#2F5D3A] dark:hover:text-[#4ADE80] transition-colors"
              >
                <IconComponent className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span>{link.name}</span>
              </a>
            );
          })}

          <div className="pt-3 border-t border-[#2F5D3A]/20 dark:border-[#52A368]/40 space-y-2">
            {onOpenResumeModal && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenResumeModal();
                }}
                className="w-full text-center py-2.5 bg-white dark:bg-[#122617] text-[#0A180E] dark:text-emerald-200 border-2 border-emerald-600/40 rounded-xl text-xs font-black flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
              >
                <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{language === "bn" ? "এক্সিকিউটিভ জীবনবৃত্তান্ত (CV)" : "View Executive CV"}</span>
              </button>
            )}

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenQuoteModal();
              }}
              className="w-full text-center py-3 bg-gradient-to-r from-emerald-600 to-[#1F452B] text-white rounded-xl text-xs font-extrabold flex items-center justify-center space-x-2 shadow-md cursor-pointer"
            >
              <Send className="w-4 h-4 text-emerald-300" />
              <span>{t.nav.hireMe}</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onNavigateAdmin();
              }}
              className="w-full text-center py-2.5 bg-white dark:bg-[#0E2214] text-[#0A180E] dark:text-white border border-[#2F5D3A]/30 dark:border-[#52A368]/50 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>{t.nav.admin}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
