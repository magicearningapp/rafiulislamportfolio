import React, { useState } from "react";
import { Check, Share2, Link2 } from "lucide-react";
import { copyToClipboard, getShareUrl } from "../lib/shareUtils";

interface ShareButtonProps {
  section: string;
  query?: Record<string, string>;
  label?: string;
  title?: string;
  className?: string;
  onToast?: (msg: string) => void;
  variant?: "pill" | "icon" | "darkPill";
}

export default function ShareButton({
  section,
  query,
  label = "Share Link",
  title = "Share Link",
  className = "",
  onToast,
  variant = "pill",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const url = getShareUrl(section, query);

    // Update browser URL silently without page reload
    if (typeof window !== "undefined") {
      const cleanSection = section.replace(/^#/, "");
      const params = query && Object.keys(query).length > 0 ? `?${new URLSearchParams(query).toString()}` : "";
      window.history.pushState(null, "", `/#${cleanSection}${params}`);
    }

    // Try Web Share API on mobile devices
    if (typeof navigator !== "undefined" && navigator.share && /mobile|android|iphone/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title: title || `${section} • Md. Rafiul Islam`,
          url,
        });
        return;
      } catch {
        // Fall back to clipboard
      }
    }

    const ok = await copyToClipboard(url);
    if (ok) {
      setCopied(true);
      const sectionName = section.replace(/^#/, "");
      const labelText = query?.photo
        ? "Direct photo link copied!"
        : `${sectionName.charAt(0).toUpperCase() + sectionName.slice(1)} sublink copied!`;
      onToast?.(labelText);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleShare}
        className={`p-1.5 rounded-lg text-[#4E5E4E] hover:text-[#172117] hover:bg-[#8FAF72]/20 transition-colors cursor-pointer inline-flex items-center justify-center ${className}`}
        title={`Copy ${section} sublink`}
        aria-label={`Copy ${section} sublink`}
      >
        {copied ? <Check className="w-4 h-4 text-[#2F5D3A]" /> : <Link2 className="w-4 h-4" />}
      </button>
    );
  }

  if (variant === "darkPill") {
    return (
      <button
        type="button"
        onClick={handleShare}
        className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer ${className}`}
        title="Share photo link"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-[#8FAF72]" />
            <span className="text-[#F4F1E6] font-semibold">Copied!</span>
          </>
        ) : (
          <>
            <Share2 className="w-3.5 h-3.5 text-[#8FAF72]" />
            <span>{label}</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-white hover:bg-white text-[#172117] hover:text-[#2F5D3A] border border-[#8FAF72]/35 shadow-2xs hover:shadow-xs transition-all cursor-pointer ${className}`}
      title={`Copy ${section} sublink`}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-[#2F5D3A]" />
          <span className="text-[#2F5D3A] font-semibold">Link Copied!</span>
        </>
      ) : (
        <>
          <Share2 className="w-3.5 h-3.5 text-[#4E5E4E]" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
