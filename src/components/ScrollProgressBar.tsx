import { motion, useScroll, useSpring } from "motion/react";

export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  
  // Smooth spring interpolation for natural fluid scroll-following physics
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none h-[3px]">
      {/* Background track (semi-transparent subtle guide) */}
      <div className="w-full h-full bg-[#173522]/10" />

      {/* Dynamic Animated Filling Progress Bar */}
      <motion.div
        className="absolute top-0 left-0 right-0 bottom-0 h-full bg-gradient-to-r from-[#2F5D3A] via-[#467A4A] to-[#8FAF72] origin-left shadow-[0_0_8px_rgba(143,175,114,0.65)]"
        style={{ scaleX }}
      />
    </div>
  );
}
