import { useState, useEffect, useRef } from "react";
import { TestimonialItem, DEFAULT_TESTIMONIALS } from "../types";
import {
  Quote,
  Star,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Play,
  Pause,
  Award,
  Sparkles,
  Users,
  MessageSquarePlus,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useThemeLanguage } from "../context/ThemeLanguageContext";

interface TestimonialsProps {
  testimonials?: TestimonialItem[];
  onOpenReviewModal?: () => void;
}

export default function Testimonials({
  testimonials = DEFAULT_TESTIMONIALS,
  onOpenReviewModal,
}: TestimonialsProps) {
  const { t, language } = useThemeLanguage();
  const items = testimonials && testimonials.length > 0 ? testimonials : DEFAULT_TESTIMONIALS;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);

  // Auto-play interval in milliseconds
  const INTERVAL_DURATION = 5500;
  const [progress, setProgress] = useState(0);
  const progressTimerRef = useRef<number | null>(null);

  const activeTestimonial = items[currentIndex] || items[0];

  // Auto-play transition timer and progress bar
  useEffect(() => {
    if (!isAutoPlaying || isHovered) {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
      return;
    }

    const startTime = Date.now();
    const intervalStep = 50;

    progressTimerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentPct = Math.min(100, (elapsed / INTERVAL_DURATION) * 100);
      setProgress(currentPct);

      if (elapsed >= INTERVAL_DURATION) {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % items.length);
        setProgress(0);
      }
    }, intervalStep);

    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, [currentIndex, isAutoPlaying, isHovered, items.length]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % items.length);
    setProgress(0);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    setProgress(0);
  };

  const handleSelect = (idx: number) => {
    setDirection(idx > currentIndex ? 1 : -1);
    setCurrentIndex(idx);
    setProgress(0);
  };

  // Helper to generate initials from client name
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Avatar color generator based on index
  const avatarGradients = [
    "from-[#2F5D3A] to-[#1F452B]",
    "from-[#1F452B] to-[#173522]",
    "from-[#467A4A] to-[#2F5D3A]",
    "from-[#244b2f] to-[#142d1c]",
    "from-[#3b6840] to-[#1F452B]",
  ];

  return (
    <section
      id="testimonials"
      className="py-20 md:py-28 px-6 sm:px-8 border-b border-[#8FAF72]/30 relative overflow-hidden bg-gradient-to-b from-transparent via-[#8FAF72]/5 to-transparent"
    >
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
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#173522] text-[#8FAF72] border border-[#8FAF72]/30 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-[#8FAF72]" />
              <span className="uppercase tracking-wider">{t.testimonials.badge}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#172117]">
              {t.testimonials.title}
            </h2>
            <p className="text-[#4E5E4E] text-sm sm:text-base leading-relaxed">
              {t.testimonials.subtitle}
            </p>
          </div>

          {/* Action Tools: Write a Review & Carousel Controls */}
          <div className="flex items-center space-x-3 shrink-0">
            {onOpenReviewModal && (
              <button
                onClick={onOpenReviewModal}
                className="inline-flex items-center space-x-1.5 bg-[#2F5D3A] hover:bg-[#1F452B] text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer"
              >
                <MessageSquarePlus className="w-3.5 h-3.5 text-[#8FAF72]" />
                <span>{t.testimonials.writeReview}</span>
              </button>
            )}

            {/* Auto-play toggle */}
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              title={isAutoPlaying ? "Pause auto-scroll" : "Resume auto-scroll"}
              className={`p-2.5 rounded-xl border border-[#8FAF72]/30 transition-all cursor-pointer ${
                isAutoPlaying
                  ? "bg-[#2F5D3A] text-white hover:bg-[#1F452B]"
                  : "bg-white text-[#4E5E4E] hover:bg-[#F4F1E6]"
              }`}
            >
              {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            {/* Prev button */}
            <button
              onClick={handlePrev}
              title="Previous testimonial"
              className="p-2.5 rounded-xl bg-white hover:bg-[#2F5D3A] text-[#172117] hover:text-white border border-[#8FAF72]/35 shadow-xs transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Next button */}
            <button
              onClick={handleNext}
              title="Next testimonial"
              className="p-2.5 rounded-xl bg-white hover:bg-[#2F5D3A] text-[#172117] hover:text-white border border-[#8FAF72]/35 shadow-xs transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Social Proof Trust Statistics Banner */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0F2013] border border-[#8FAF72]/35 dark:border-[#8FAF72]/50 shadow-xs dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
        >
          <div className="flex items-center space-x-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-[#F4F1E6] dark:bg-[#16331E] text-[#2F5D3A] dark:text-[#A3E699] flex items-center justify-center border border-[#8FAF72]/40 dark:border-[#8FAF72]/50 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-extrabold text-[#172117] dark:text-white glow-heading">99%+</div>
              <div className="text-[11px] text-[#4E5E4E] dark:text-[#DCE8DD] font-semibold">{t.testimonials.trustScore}</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-[#F4F1E6] dark:bg-[#16331E] text-[#2F5D3A] dark:text-[#A3E699] flex items-center justify-center border border-[#8FAF72]/40 dark:border-[#8FAF72]/50 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-extrabold text-[#172117] dark:text-white glow-heading">50+</div>
              <div className="text-[11px] text-[#4E5E4E] dark:text-[#DCE8DD] font-semibold">{t.testimonials.projectsDelivered}</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-[#F4F1E6] dark:bg-[#16331E] text-[#2F5D3A] dark:text-[#A3E699] flex items-center justify-center border border-[#8FAF72]/40 dark:border-[#8FAF72]/50 shrink-0">
              <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-extrabold text-[#172117] dark:text-white glow-heading">4.9 / 5.0</div>
              <div className="text-[11px] text-[#4E5E4E] dark:text-[#DCE8DD] font-semibold">{t.testimonials.avgRating}</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-[#F4F1E6] dark:bg-[#16331E] text-[#2F5D3A] dark:text-[#A3E699] flex items-center justify-center border border-[#8FAF72]/40 dark:border-[#8FAF72]/50 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-extrabold text-[#172117] dark:text-white glow-heading">3.4x</div>
              <div className="text-[11px] text-[#4E5E4E] dark:text-[#DCE8DD] font-semibold">{t.testimonials.reachMultiplier}</div>
            </div>
          </div>
        </motion.div>

        {/* Featured Testimonial Carousel Card */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative bg-white dark:bg-[#0F2013] border border-[#8FAF72]/40 dark:border-[#8FAF72]/50 rounded-3xl shadow-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden"
        >
          {/* Top Continuous Progress Bar */}
          <div className="w-full bg-[#F4F1E6] h-1.5 overflow-hidden">
            <div
              className="bg-[#2F5D3A] h-full transition-all duration-75"
              style={{
                width: isAutoPlaying && !isHovered ? `${progress}%` : "100%",
                opacity: isAutoPlaying ? 1 : 0.4,
              }}
            />
          </div>

          {/* Decorative Giant Quote Icon in background */}
          <Quote className="absolute -top-3 right-6 w-32 h-32 text-[#8FAF72]/10 pointer-events-none" />

          {/* Animated Carousel Card Body */}
          <div className="p-7 sm:p-10 md:p-12 relative z-10 min-h-[380px] sm:min-h-[320px] flex flex-col justify-between">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={activeTestimonial.id}
                custom={direction}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -direction * 40 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-6"
              >
                {/* Top Row: Stars + Project Tag + Verified Badge */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#8FAF72]/20 pb-5">
                  {/* Star Rating */}
                  <div className="flex items-center space-x-1">
                    {[...Array(activeTestimonial.rating || 5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400 text-amber-500 drop-shadow-2xs"
                      />
                    ))}
                    <span className="text-xs font-bold text-[#172117] ml-2">
                      5.0 Out of 5.0
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Project/Campaign Tag */}
                    {activeTestimonial.projectTitle && (
                      <span className="text-[11px] font-semibold text-[#173522] dark:text-white bg-[#F4F1E6] dark:bg-[#152B1B] border border-[#8FAF72]/30 dark:border-[#8FAF72]/50 px-3 py-1 rounded-full truncate max-w-[220px]">
                        {activeTestimonial.projectTitle}
                      </span>
                    )}

                    {/* Verified Client Badge */}
                    <div className="inline-flex items-center space-x-1 text-[11px] font-bold text-[#2F5D3A] dark:text-[#A3E699] bg-[#8FAF72]/15 dark:bg-[#17351F] px-2.5 py-1 rounded-full border border-[#8FAF72]/30 dark:border-[#8FAF72]/50">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#2F5D3A] dark:text-[#A3E699]" />
                      <span>Verified Client</span>
                    </div>
                  </div>
                </div>

                {/* The Quote Statement */}
                <blockquote className="text-base sm:text-lg md:text-xl text-[#172117] dark:text-[#F0F7F1] leading-relaxed font-normal italic drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
                  "{activeTestimonial.quote}"
                </blockquote>

                {/* Client Profile / Author Details */}
                <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#8FAF72]/20 dark:border-[#8FAF72]/40">
                  <div className="flex items-center space-x-4">
                    {/* Client Avatar / Photo */}
                    {activeTestimonial.avatar ? (
                      <img
                        src={activeTestimonial.avatar}
                        alt={activeTestimonial.name}
                        className="w-13 h-13 rounded-2xl object-cover border-2 border-[#8FAF72]/50 shadow-md"
                      />
                    ) : (
                      <div
                        className={`w-13 h-13 rounded-2xl bg-gradient-to-br ${
                          avatarGradients[currentIndex % avatarGradients.length]
                        } text-[#F4F1E6] font-bold text-sm flex items-center justify-center shadow-md border border-[#8FAF72]/40`}
                      >
                        {getInitials(activeTestimonial.name)}
                      </div>
                    )}

                    <div>
                      <h4 className="font-extrabold text-base text-[#172117] dark:text-white">
                        {activeTestimonial.name}
                      </h4>
                      <p className="text-xs text-[#4E5E4E] dark:text-[#A8BFA9] font-medium">
                        {activeTestimonial.role}
                        {activeTestimonial.company && (
                          <span className="text-[#2F5D3A] dark:text-[#A3E699] font-bold">
                            {" "}• {activeTestimonial.company}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Impact Metric Badge if available */}
                  {activeTestimonial.metric && (
                    <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-[#173522] dark:bg-[#16331E] text-[#8FAF72] dark:text-[#A3E699] border border-[#8FAF72]/30 dark:border-[#8FAF72]/50 text-xs font-bold self-start sm:self-auto shadow-2xs">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{activeTestimonial.metric}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Carousel Footer Indicator Dots */}
          <div className="bg-[#F4F1E6]/80 border-t border-[#8FAF72]/25 px-6 py-3 flex items-center justify-between select-none">
            <span className="text-xs text-[#4E5E4E] font-medium">
              Review {currentIndex + 1} of {items.length}
            </span>

            {/* Pagination Pill Dots */}
            <div className="flex items-center space-x-1.5">
              {items.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  title={`Go to testimonial ${idx + 1}`}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    currentIndex === idx
                      ? "w-8 bg-[#2F5D3A]"
                      : "w-2 bg-[#8FAF72]/40 hover:bg-[#8FAF72]"
                  }`}
                />
              ))}
            </div>

            <span className="text-[11px] text-[#4E5E4E]/80 hidden sm:inline">
              Hover pauses carousel
            </span>
          </div>
        </motion.div>

        {/* Quick-Select Client Avatars Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="pt-2"
        >
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {items.map((t, idx) => {
              const isActive = currentIndex === idx;
              return (
                <button
                  key={t.id}
                  onClick={() => handleSelect(idx)}
                  className={`flex items-center space-x-2.5 px-3.5 py-2 rounded-2xl border transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#2F5D3A] text-white border-[#2F5D3A] shadow-md scale-102"
                      : "bg-white text-[#172117] border-[#8FAF72]/30 hover:border-[#8FAF72] hover:bg-[#F4F1E6]/60"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isActive
                        ? "bg-[#F4F1E6] text-[#2F5D3A]"
                        : "bg-[#2F5D3A] text-[#F4F1E6]"
                    }`}
                  >
                    {getInitials(t.name)}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-semibold leading-none">{t.name}</div>
                    <div
                      className={`text-[10px] mt-0.5 truncate max-w-[120px] ${
                        isActive ? "text-[#8FAF72]" : "text-[#4E5E4E]"
                      }`}
                    >
                      {t.company || t.role}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
