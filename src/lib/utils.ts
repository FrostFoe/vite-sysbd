import { t } from "./translations";

declare global {
  interface Window {
    lucide?: {
      createIcons: () => void;
    };
  }
}

export const PLACEHOLDER_IMAGE =
  "https://placehold.co/600x400/1a1a1a/FFF?text=BreachTimes";

export function formatTimestamp(
  timestampString: string | null | undefined,
  lang: "en" | "bn"
): string {
  if (!timestampString) return "";
  let date = new Date(timestampString);
  if (Number.isNaN(date.getTime())) {
    const parts = timestampString.match(
      /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/
    );
    if (parts)
      date = new Date(
        parseInt(parts[1], 10),
        parseInt(parts[2], 10) - 1,
        parseInt(parts[3], 10),
        parseInt(parts[4], 10),
        parseInt(parts[5], 10),
        parseInt(parts[6], 10)
      );
    else return timestampString;
  }

  const now = new Date();
  const secondsPast = (now.getTime() - date.getTime()) / 1000;

  if (secondsPast < 60) return t("just_now", lang);
  if (secondsPast < 3600) {
    const m = Math.floor(secondsPast / 60);
    return `${m} ${t(m === 1 ? "minute" : "minutes", lang)}`;
  }
  if (secondsPast < 86400) {
    const h = Math.floor(secondsPast / 3600);
    return `${h} ${t(h === 1 ? "hour" : "hours", lang)}`;
  }
  if (secondsPast < 2592000) {
    const d = Math.floor(secondsPast / 86400);
    return `${d} ${t(d === 1 ? "day" : "days", lang)}`;
  }

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: lang === "bn" ? "long" : "short",
    day: "numeric",
  };
  const locale = lang === "bn" ? "bn-BD" : "en-US";
  return date.toLocaleDateString(locale, options);
}

export function showToastMsg(
  msg: string,
  type: "success" | "error" = "success"
) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  const icon = type === "error" ? "alert-circle" : "check-circle";
  const color = type === "error" ? "text-danger" : "text-success";

  toast.className =
    "animate-[slide-up_0.4s_cubic-bezier(0.16,1,0.3,1)_forwards] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 dark:bg-white/90 backdrop-blur text-white dark:text-black px-6 py-3 rounded-full shadow-lg font-bold flex items-center gap-2 mb-2 text-sm w-auto";
  toast.innerHTML = `<i data-lucide="${icon}" class="w-4 h-4 ${color}"></i> ${msg}`;
  container.appendChild(toast);
  if (
    typeof window !== "undefined" &&
    window.lucide &&
    typeof window.lucide.createIcons === "function"
  ) {
    window.lucide.createIcons();
  }
  setTimeout(() => toast.remove(), 3000);
}

/**
 * Navigate to detail page on mobile, set active item on desktop
 * @param isMobile - Is current screen mobile
 * @param navigate - React Router navigate function
 * @param detailPath - Path to navigate to on mobile (e.g., `/admin/users/${id}`)
 * @param onDesktop - Callback to execute on desktop (e.g., setActiveItem)
 */
export function handleItemSelect(
  isMobile: boolean,
  navigate: (path: string) => void,
  detailPath: string,
  onDesktop?: () => void
) {
  if (isMobile) {
    navigate(detailPath);
  } else {
    onDesktop?.();
  }
}
/**
 * Normalize media URLs to ensure they work from both editor and article detail pages
 * Handles relative paths returned from upload APIs
 * @param url - The media URL from API response
 * @returns Normalized URL accessible from frontend
 */
export function normalizeMediaUrl(url: string | null | undefined): string {
  if (!url) return "";

  // If URL is already absolute (starts with http/https), return as-is
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // If URL is root-relative (starts with /), it already maps to domain root (dist/)
  // so return as-is
  if (url.startsWith("/")) {
    return url;
  }

  // Return other URLs as-is
  return url;
}

export function cn(...inputs: (string | boolean | undefined | null)[]): string {
  return inputs.filter(Boolean).join(" ");
}
