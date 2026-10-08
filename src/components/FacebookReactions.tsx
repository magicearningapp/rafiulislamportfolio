import { useState, useRef, useEffect, type MouseEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FB_REACTIONS, ReactionType, PhotoReactionSummary, ReactionConfig } from "../types";
import { togglePhotoReaction, getClientId } from "../lib/reactionsAndComments";

interface FacebookReactionsProps {
  photoId: string;
  summary?: PhotoReactionSummary;
  variant?: "card" | "lightbox";
  onToast?: (msg: string) => void;
  onOpenComments?: () => void;
  commentCount?: number;
}

export default function FacebookReactions({
  photoId,
  summary,
  variant = "card",
  onToast,
  onOpenComments,
  commentCount = 0,
}: FacebookReactionsProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [hoveredReaction, setHoveredReaction] = useState<ReactionConfig | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);
  
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const clientId = getClientId();

  const counts = summary?.counts || {
    like: 0,
    love: 0,
    care: 0,
    haha: 0,
    wow: 0,
    sad: 0,
    angry: 0,
  };
  const total = summary?.total || 0;
  const userReaction = summary?.userReaction;

  const currentActiveConfig = userReaction
    ? FB_REACTIONS.find((r) => r.type === userReaction)
    : null;

  // Find top reactions that have counts > 0
  const topReactions = FB_REACTIONS.filter((r) => (counts[r.type] || 0) > 0)
    .sort((a, b) => (counts[b.type] || 0) - (counts[a.type] || 0))
    .slice(0, 3);

  // Close picker when clicking outside
  useEffect(() => {
    const handleDocumentClick = (e: globalThis.MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    if (showPicker) {
      document.addEventListener("mousedown", handleDocumentClick);
      return () => document.removeEventListener("mousedown", handleDocumentClick);
    }
  }, [showPicker]);

  const handleMouseEnterButton = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setShowPicker(true);
    }, 150);
  };

  const handleMouseLeaveButton = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setShowPicker(false);
      setHoveredReaction(null);
    }, 350);
  };

  const handleSelectReaction = async (rType: ReactionType, e: MouseEvent) => {
    e.stopPropagation();
    setShowPicker(false);
    setHoveredReaction(null);

    try {
      setIsSubmitting(true);
      await togglePhotoReaction(photoId, clientId, rType);
      const conf = FB_REACTIONS.find((r) => r.type === rType);
      if (userReaction === rType) {
        onToast?.("Reaction removed");
      } else {
        onToast?.(`Reacted with ${conf?.emoji} ${conf?.label}`);
      }
    } catch {
      onToast?.("Could not update reaction. Please check connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Direct click on Like button (toggles Like or removes existing reaction)
  const handleDirectButtonClick = async (e: MouseEvent) => {
    e.stopPropagation();
    try {
      setIsSubmitting(true);
      // If user already has a reaction, toggle it off. Otherwise default to 'like'
      const targetReaction = userReaction || "like";
      await togglePhotoReaction(photoId, clientId, targetReaction);
      if (userReaction) {
        onToast?.("Reaction removed");
      } else {
        onToast?.("Reacted with 👍 Like");
      }
    } catch {
      onToast?.("Could not update reaction.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDark = variant === "lightbox";

  return (
    <div
      className={`relative select-none ${isDark ? "text-zinc-300" : "text-zinc-700"}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* 1. Reaction & Comment Statistics Bar (Facebook style header row) */}
      {(total > 0 || commentCount > 0) && (
        <div
          className={`flex items-center justify-between text-xs px-1 pb-2 mb-2 border-b ${
            isDark ? "border-white/10 text-zinc-400" : "border-zinc-100 text-zinc-500"
          }`}
        >
          {/* Reaction Icons and Count */}
          {total > 0 ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowBreakdownModal(true);
              }}
              className="flex items-center space-x-1.5 hover:opacity-85 transition-opacity group cursor-pointer"
              title="View all reactions"
            >
              <div className="flex items-center -space-x-1">
                {topReactions.map((r, i) => (
                  <span
                    key={r.type}
                    style={{ zIndex: 10 - i }}
                    className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white text-[13px] shadow-xs border border-zinc-200 group-hover:scale-110 transition-transform"
                  >
                    {r.emoji}
                  </span>
                ))}
              </div>
              <span className="font-semibold text-xs text-zinc-700 dark:text-zinc-200">
                {total}
              </span>
            </button>
          ) : (
            <div />
          )}

          {/* Comment Count on Right */}
          {commentCount > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenComments?.();
              }}
              className="hover:underline cursor-pointer text-xs"
            >
              {commentCount} {commentCount === 1 ? "Comment" : "Comments"}
            </button>
          )}
        </div>
      )}

      {/* 2. Floating Facebook Reaction Picker Bar */}
      <div
        ref={pickerRef}
        onMouseEnter={handleMouseEnterButton}
        onMouseLeave={handleMouseLeaveButton}
        className="relative inline-block w-full"
      >
        <AnimatePresence>
          {showPicker && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.85 }}
              animate={{ opacity: 1, y: -6, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.85 }}
              transition={{ type: "spring", stiffness: 450, damping: 26 }}
              className={`absolute bottom-full left-0 mb-2.5 z-50 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full shadow-2xl border backdrop-blur-md ${
                isDark
                  ? "bg-[#173522]/95 border-[#8FAF72]/30 shadow-black/80"
                  : "bg-white/95 border-[#8FAF72]/30 shadow-xl"
              }`}
            >
              {FB_REACTIONS.map((r) => (
                <div key={r.type} className="relative group/emoji">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.45, y: -8 }}
                    whileTap={{ scale: 1.1 }}
                    onClick={(e) => handleSelectReaction(r.type, e)}
                    onMouseEnter={() => setHoveredReaction(r)}
                    onMouseLeave={() => setHoveredReaction(null)}
                    className="p-1 rounded-full text-2xl transition-transform cursor-pointer focus:outline-hidden"
                    title={`${r.label} (${r.labelBn})`}
                  >
                    {r.emoji}
                  </motion.button>

                  {/* Reaction Label Tooltip */}
                  {hoveredReaction?.type === r.type && (
                    <motion.div
                      initial={{ opacity: 0, y: 4, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#173522]/90 text-white text-[10px] font-medium tracking-wide whitespace-nowrap pointer-events-none shadow-md"
                    >
                      {r.label}
                    </motion.div>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Row: [ 👍 React ] [ 💬 Comment ] */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#8FAF72]/20 dark:border-white/10">
          {/* Facebook React Button */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleDirectButtonClick}
            onMouseEnter={handleMouseEnterButton}
            onMouseLeave={handleMouseLeaveButton}
            className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-lg font-medium text-xs sm:text-sm transition-all cursor-pointer ${
              currentActiveConfig
                ? `${currentActiveConfig.color} ${isDark ? "bg-white/10" : "bg-[#8FAF72]/20"}`
                : isDark
                ? "text-[#8FAF72] hover:bg-white/10"
                : "text-[#4E5E4E] hover:bg-[#F4F1E6] hover:text-[#172117]"
            }`}
          >
            {currentActiveConfig ? (
              <span className="text-base sm:text-lg animate-bounce-once">
                {currentActiveConfig.emoji}
              </span>
            ) : (
              <span className="text-base sm:text-lg">👍</span>
            )}
            <span className="font-semibold">
              {currentActiveConfig ? currentActiveConfig.label : "Like"}
            </span>
          </button>

          {/* Comment Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenComments?.();
            }}
            className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-lg font-medium text-xs sm:text-sm transition-all cursor-pointer ${
              isDark
                ? "text-[#8FAF72] hover:bg-white/10"
                : "text-[#4E5E4E] hover:bg-[#F4F1E6] hover:text-[#172117]"
            }`}
          >
            <span className="text-base sm:text-lg">💬</span>
            <span className="font-semibold">Comment</span>
          </button>
        </div>
      </div>

      {/* 3. Reaction Breakdown Modal */}
      <AnimatePresence>
        {showBreakdownModal && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
            onClick={(e) => {
              e.stopPropagation();
              setShowBreakdownModal(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#173522] border border-[#8FAF72]/30 dark:border-[#8FAF72]/30 rounded-2xl p-5 max-w-xs w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#8FAF72]/20 dark:border-white/10 pb-3">
                <h4 className="font-bold text-base text-[#172117] dark:text-white flex items-center space-x-2">
                  <span>Photo Reactions</span>
                  <span className="text-xs bg-[#F4F1E6] dark:bg-white/10 text-[#172117] dark:text-[#8FAF72] px-2 py-0.5 rounded-full font-mono">
                    {total}
                  </span>
                </h4>
                <button
                  type="button"
                  onClick={() => setShowBreakdownModal(false)}
                  className="p-1 rounded-md text-[#4E5E4E] hover:text-[#172117] dark:hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                {FB_REACTIONS.map((r) => {
                  const count = counts[r.type] || 0;
                  if (count === 0) return null;
                  return (
                    <div
                      key={r.type}
                      className="flex items-center justify-between p-2 rounded-xl bg-[#F4F1E6] dark:bg-white/5"
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="text-xl">{r.emoji}</span>
                        <span className="font-medium text-sm text-[#172117] dark:text-[#8FAF72]">
                          {r.label} <span className="text-xs text-[#4E5E4E]">({r.labelBn})</span>
                        </span>
                      </div>
                      <span className="font-bold text-sm text-[#172117] dark:text-white font-mono">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setShowBreakdownModal(false)}
                className="w-full py-2 bg-[#2F5D3A] hover:bg-[#1F452B] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
