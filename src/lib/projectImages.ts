import garenaBanner from "../assets/images/garena_topup_banner_1788077708358.jpg";
import discoverPabnaBanner from "../assets/images/discover_pabna_landmarks_1788077693665.jpg";
import masalaSkunjoBanner from "../assets/images/masala_skunjo_food_1788077679212.jpg";
import amagoPabnaBanner from "../assets/images/pabna_heritage_culture_1788077650318.jpg";
import convoMeetBanner from "../assets/images/convomeet_platform_1788077665261.jpg";
import { ProjectItem } from "../types";

// Default known banner mappings
const KNOWN_PROJECT_BANNERS: Record<string, string> = {
  p1: garenaBanner,
  p2: discoverPabnaBanner,
  p3: masalaSkunjoBanner,
  p4: amagoPabnaBanner,
  p5: convoMeetBanner,
};

const LINK_BANNER_MAP: { match: string; banner: string }[] = [
  { match: "garenatopupbd", banner: garenaBanner },
  { match: "discoverpabna", banner: discoverPabnaBanner },
  { match: "masalaskunjo", banner: masalaSkunjoBanner },
  { match: "amagopabnar", banner: amagoPabnaBanner },
  { match: "convomeet", banner: convoMeetBanner },
];

/**
 * Generate a high quality real-time website screenshot preview URL using free public screenshot CDN
 */
export function getWebsiteScreenshotUrl(url: string): string {
  if (!url || !url.startsWith("http")) return "";
  // Thum.io free tier or microlink preview
  return `https://image.thum.io/get/width/1000/crop/650/noanimate/${url}`;
}

/**
 * Returns a guaranteed valid image URL for a project,
 * preventing broken images caused by stale compiled Vite hashes in Firestore.
 */
export function resolveProjectImage(project: ProjectItem): string {
  const currentImg = project.image?.trim() || "";

  // 1. If it's a valid fresh data URI or direct external http(s) image, use it
  if (currentImg.startsWith("data:image/") || currentImg.startsWith("http://") || currentImg.startsWith("https://")) {
    return currentImg;
  }

  // 2. If it's a known project ID with a bundled banner
  if (project.id && KNOWN_PROJECT_BANNERS[project.id]) {
    return KNOWN_PROJECT_BANNERS[project.id];
  }

  // 3. Match by website link keyword
  if (project.link) {
    const matched = LINK_BANNER_MAP.find((m) => project.link.toLowerCase().includes(m.match));
    if (matched) return matched.banner;
  }

  // 4. If it's a public path
  if (currentImg.startsWith("/projects/")) {
    return currentImg;
  }

  // 5. If it's a stale /assets/...-hash.jpg from a previous production build, map to default or screenshot
  if (currentImg.startsWith("/assets/") && project.link) {
    return getWebsiteScreenshotUrl(project.link);
  }

  // 6. If none matched but has link, generate live website preview
  if (project.link && project.link.startsWith("http")) {
    return getWebsiteScreenshotUrl(project.link);
  }

  return currentImg;
}
