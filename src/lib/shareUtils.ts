/**
 * Helper utility for copying section and gallery sublinks to clipboard,
 * and handling browser URL hash navigation with feedback.
 */

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall back to document.execCommand
  }

  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}

export function getShareUrl(section: string, query?: Record<string, string>): string {
  if (typeof window === "undefined") return "";
  const origin = window.location.origin;
  const cleanSection = section.replace(/^#/, "");
  
  if (query && Object.keys(query).length > 0) {
    const params = new URLSearchParams(query).toString();
    return `${origin}/#${cleanSection}?${params}`;
  }
  
  return `${origin}/#${cleanSection}`;
}
