import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Find the hero section element
      const heroEl = document.getElementById("home");
      const heroHeight = heroEl ? heroEl.offsetHeight : 500;
      
      const currentScrollY = window.scrollY;
      
      // Show button only after scrolling past the hero section
      if (currentScrollY > heroHeight - 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      // Calculate total page scroll percentage
      const totalDocHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalDocHeight > 0) {
        const progress = Math.min(100, Math.max(0, (currentScrollY / totalDocHeight) * 100));
        setScrollProgress(progress);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Run once on mount in case the page is loaded scrolled
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // SVG circular progress dimensions
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 group"
        >
          {/* Back to Top Button */}
          <button
            onClick={scrollToTop}
            aria-label="Back to Top"
            className="relative flex items-center justify-center w-12 h-12 rounded-full bg-[#1F452B] hover:bg-[#173522] text-[#F4F1E6] hover:text-white shadow-xl hover:shadow-2xl border border-[#8FAF72]/40 transition-all duration-300 focus:outline-hidden focus:ring-2 focus:ring-[#8FAF72] focus:ring-offset-2 focus:ring-offset-[#F4F1E6] cursor-pointer group-hover:scale-105 active:scale-95"
          >
            {/* Circular Scroll Progress Ring */}
            <svg
              className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
              viewBox="0 0 48 48"
            >
              <circle
                cx="24"
                cy="24"
                r={radius}
                className="stroke-[#8FAF72]/20"
                strokeWidth="2.5"
                fill="none"
              />
              <circle
                cx="24"
                cy="24"
                r={radius}
                className="stroke-[#8FAF72] transition-all duration-150 ease-out"
                strokeWidth="2.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            {/* Up Arrow with smooth upward micro-movement on hover */}
            <ArrowUp className="w-5 h-5 relative z-10 transition-transform duration-300 group-hover:-translate-y-0.5" />
          </button>

          {/* Floating Tooltip Label */}
          <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-2.5 py-1 rounded-lg bg-[#173522]/90 backdrop-blur-md text-[#F4F1E6] text-[11px] font-medium tracking-wide whitespace-nowrap shadow-lg border border-[#8FAF72]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none hidden sm:block">
            Back to Top
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
