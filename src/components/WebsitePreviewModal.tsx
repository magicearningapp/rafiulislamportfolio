import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ProjectItem } from "../types";
import {
  ExternalLink,
  RotateCw,
  X,
  Laptop,
  Tablet,
  Smartphone,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Globe,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface WebsitePreviewModalProps {
  project: ProjectItem | null;
  isOpen: boolean;
  onClose: () => void;
}

type DeviceMode = "desktop" | "tablet" | "mobile";

export default function WebsitePreviewModal({
  project,
  isOpen,
  onClose,
}: WebsitePreviewModalProps) {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const [isLoading, setIsLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Lock background scroll when modal is open to keep preview strictly contained
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Reset loading state when opening modal or changing project
  useEffect(() => {
    if (isOpen && project) {
      setIsLoading(true);
      setIframeKey((prev) => prev + 1);
    }
  }, [isOpen, project]);

  const handleRestart = () => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  if (!isOpen || !project) return null;
  if (typeof document === "undefined") return null;

  // Extract clean domain
  let displayDomain = "";
  try {
    if (project.link) {
      const parsed = new URL(project.link);
      displayDomain = parsed.hostname.replace(/^www\./, "");
    }
  } catch {
    displayDomain = project.link || "Website Preview";
  }

  // Device dimension styling preserving the responsive aspect ratio
  const getDeviceContainerClass = () => {
    switch (deviceMode) {
      case "mobile":
        return "w-full max-w-[390px] h-full mx-auto border-x-4 border-t-8 border-b-8 border-[#173522] rounded-[32px] shadow-2xl overflow-hidden bg-white my-auto relative";
      case "tablet":
        return "w-full max-w-[768px] h-full mx-auto border-4 border-[#173522] rounded-[24px] shadow-2xl overflow-hidden bg-white my-auto relative";
      case "desktop":
      default:
        return "w-full h-full rounded-b-xl overflow-hidden bg-white relative";
    }
  };

  const modalContent = (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-3 sm:p-5 md:p-8 pt-8 sm:pt-12 md:pt-14 pb-4 sm:pb-6 bg-[#173522]/90 backdrop-blur-md transition-opacity overflow-y-auto"
        style={{ overscrollBehavior: "contain" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className={`relative flex flex-col bg-[#F4F1E6] border border-[#8FAF72]/45 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 my-auto shrink-0 ${
            isFullscreen
              ? "w-full h-full max-w-none rounded-none inset-0 m-0"
              : "w-full max-w-6xl h-[86vh] max-h-[860px]"
          }`}
          style={{ overscrollBehavior: "contain" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Browser Chrome Bar */}
          <div className="bg-[#1F452B] text-[#F4F1E6] border-b border-[#8FAF72]/30 px-3 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between gap-2 select-none shrink-0 shadow-sm">
            {/* Left: Window Controls + Project Details */}
            <div className="flex items-center space-x-3 min-w-0">
              {/* macOS style dots */}
              <div className="flex items-center space-x-1.5 shrink-0">
                <button
                  onClick={onClose}
                  title="Close preview (Esc)"
                  className="w-3.5 h-3.5 rounded-full bg-rose-400 hover:bg-rose-500 transition-colors cursor-pointer"
                />
                <button
                  onClick={handleRestart}
                  title="Reload preview"
                  className="w-3.5 h-3.5 rounded-full bg-amber-400 hover:bg-amber-500 transition-colors cursor-pointer"
                />
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Preview"}
                  className="w-3.5 h-3.5 rounded-full bg-[#8FAF72] hover:bg-[#8FAF72]/80 transition-colors cursor-pointer"
                />
              </div>

              {/* Title & Category Badge */}
              <div className="flex items-center space-x-2 min-w-0">
                <span className="font-bold text-xs sm:text-sm text-[#F4F1E6] truncate max-w-[140px] sm:max-w-[200px] md:max-w-[260px]">
                  {project.title}
                </span>
                {project.category && (
                  <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-[#173522] text-[#8FAF72] border border-[#8FAF72]/30 shrink-0">
                    {project.category}
                  </span>
                )}
              </div>
            </div>

            {/* Center: URL Bar with SSL indicator */}
            <div className="flex-1 max-w-sm lg:max-w-md mx-2 hidden md:flex items-center space-x-2 bg-[#173522] border border-[#8FAF72]/30 rounded-lg px-3 py-1.5 text-xs font-mono text-[#8FAF72]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#8FAF72] shrink-0" />
              <span className="text-[#8FAF72]/70 shrink-0 text-[11px]">https://</span>
              <span className="text-[#F4F1E6] truncate flex-1">{displayDomain}</span>
              <button
                onClick={handleRestart}
                title="Reload preview"
                className="text-[#8FAF72] hover:text-white transition-colors p-0.5 rounded cursor-pointer shrink-0"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Right: Device Aspect Ratio & Action Controls */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
              {/* Device Mode Switcher (Desktop / Tablet / Mobile) */}
              <div className="bg-[#173522] p-0.5 rounded-lg border border-[#8FAF72]/30 flex items-center space-x-0.5">
                <button
                  onClick={() => setDeviceMode("desktop")}
                  title="Desktop View"
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    deviceMode === "desktop"
                      ? "bg-[#2F5D3A] text-white shadow-xs"
                      : "text-[#8FAF72] hover:text-white hover:bg-[#2F5D3A]/50"
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeviceMode("tablet")}
                  title="Tablet View"
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    deviceMode === "tablet"
                      ? "bg-[#2F5D3A] text-white shadow-xs"
                      : "text-[#8FAF72] hover:text-white hover:bg-[#2F5D3A]/50"
                  }`}
                >
                  <Tablet className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeviceMode("mobile")}
                  title="Mobile View"
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    deviceMode === "mobile"
                      ? "bg-[#2F5D3A] text-white shadow-xs"
                      : "text-[#8FAF72] hover:text-white hover:bg-[#2F5D3A]/50"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Live Site Badge */}
              <div className="bg-[#173522] px-2.5 py-1 rounded-lg border border-[#8FAF72]/30 flex items-center space-x-1.5 text-xs text-[#F4F1E6]">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-medium hidden sm:inline">Live Site</span>
              </div>

              {/* Open in New Window */}
              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open live website in new tab"
                  className="p-1.5 rounded-lg text-[#8FAF72] hover:text-white hover:bg-[#2F5D3A] border border-[#8FAF72]/30 transition-colors inline-flex items-center cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              {/* Fullscreen Toggle */}
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Preview"}
                className="hidden sm:inline-flex p-1.5 rounded-lg text-[#8FAF72] hover:text-white hover:bg-[#2F5D3A] border border-[#8FAF72]/30 transition-colors cursor-pointer"
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              {/* High-Visibility Close Button */}
              <button
                onClick={onClose}
                title="Close Preview (Esc)"
                className="px-2.5 py-1.5 rounded-lg bg-rose-500/25 hover:bg-rose-500 text-rose-200 hover:text-white transition-all cursor-pointer flex items-center space-x-1 shadow-xs ml-1 border border-rose-400/30"
              >
                <X className="w-4 h-4" />
                <span className="text-xs font-bold hidden sm:inline">Close</span>
              </button>
            </div>
          </div>

          {/* Sub-Header: Clean guidance notice */}
          <div className="bg-[#173522] border-b border-[#8FAF72]/20 px-3 py-1.5 sm:px-4 sm:py-2 flex items-center justify-between text-xs text-[#8FAF72] select-none shrink-0">
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center space-x-1.5 text-[11px] font-mono text-[#F4F1E6]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-[#F4F1E6]">
                  Interactive Live View — Scroll naturally to see entire site & footer
                </span>
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-[#8FAF72] hidden sm:inline font-mono">
                Full mouse wheel & touch scrolling enabled
              </span>
            </div>
          </div>

          {/* Main Website Viewport Area */}
          <div
            className="flex-1 w-full relative overflow-hidden bg-[#EAE6D8] flex items-center justify-center p-0 sm:p-2"
            style={{ overscrollBehavior: "contain" }}
          >
            {/* Device Frame */}
            <div className={getDeviceContainerClass()}>
              <div className="relative w-full h-full bg-white flex flex-col">
                {/* Loading Spinner */}
                {isLoading && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#F4F1E6]/95 backdrop-blur-xs space-y-3">
                    <div className="w-9 h-9 border-3 border-[#8FAF72]/30 border-t-[#2F5D3A] rounded-full animate-spin" />
                    <p className="text-xs font-semibold text-[#172117]">
                      Loading complete website for {project.title}...
                    </p>
                    <p className="text-[11px] text-[#4E5E4E]">
                      Scroll anywhere inside to explore all sections down to the footer
                    </p>
                  </div>
                )}

                {/* Fully Interactive Embedded Webpage */}
                <iframe
                  key={iframeKey}
                  src={project.link}
                  title={`${project.title} Complete Live Website`}
                  className="w-full h-full border-0 bg-white pointer-events-auto"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                  onLoad={() => setIsLoading(false)}
                />

                {/* Floating Subtle Footer Jump Assistant */}
                <div className="absolute bottom-3 right-3 z-10 opacity-90 hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-[#173522]/95 backdrop-blur-md border border-[#8FAF72]/40 rounded-xl px-3 py-1.5 text-[11px] text-[#F4F1E6] shadow-xl flex items-center space-x-2">
                    <Globe className="w-3.5 h-3.5 text-[#8FAF72]" />
                    <span>Live site: scroll top to bottom</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
