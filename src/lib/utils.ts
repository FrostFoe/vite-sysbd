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

export function escapeHtml(unsafe: string | null | undefined): string {
  if (typeof unsafe !== "string") return String(unsafe || "");
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(unsafe));
  return div.innerHTML;
}

/**
 * Sanitize HTML content to prevent XSS attacks
 * Allows safe tags like p, br, strong, em, a, ul, li, etc.
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return "";

  const div = document.createElement("div");
  div.innerHTML = html;

  // List of allowed tags
  const allowedTags = [
    "p",
    "br",
    "strong",
    "em",
    "b",
    "i",
    "u",
    "a",
    "ul",
    "li",
    "ol",
    "h1",
    "h2",
    "h3",
    "blockquote",
    "img",
    "video",
    "source",
    "div",
    "span",
  ];

  // Recursive function to remove disallowed tags
  const sanitize = (node: Node): void => {
    const nodesToRemove: Node[] = [];

    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === 1) {
        // Element node
        const element = child as Element;
        const tagName = element.tagName.toLowerCase();

        if (!allowedTags.includes(tagName)) {
          // Replace element with its content
          while (element.firstChild) {
            node.insertBefore(element.firstChild, element);
          }
          nodesToRemove.push(element);
        } else {
          // Remove dangerous attributes from allowed tags
          Array.from(element.attributes).forEach((attr) => {
            const attrName = attr.name.toLowerCase();
            if (
              attrName.startsWith("on") ||
              attrName.startsWith("javascript")
            ) {
              element.removeAttribute(attr.name);
            }
          });
          sanitize(child);
        }
      } else if (child.nodeType === 8) {
        // Comment node
        nodesToRemove.push(child);
      }
    });

    nodesToRemove.forEach((node) => {
      node.parentNode?.removeChild(node);
    });
  };

  sanitize(div);
  return div.innerHTML;
}

export function formatTimestamp(
  timestampString: string | null | undefined,
  lang: "en" | "bn",
): string {
  if (!timestampString) return "";
  let date = new Date(timestampString);
  if (Number.isNaN(date.getTime())) {
    // Try parsing MySQL format
    const parts = timestampString.match(
      /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/,
    );
    if (parts)
      date = new Date(
        parseInt(parts[1], 10),
        parseInt(parts[2], 10) - 1,
        parseInt(parts[3], 10),
        parseInt(parts[4], 10),
        parseInt(parts[5], 10),
        parseInt(parts[6], 10),
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
  type: "success" | "error" = "success",
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
  // Re-render lucide icons if the library is available globally
  if (
    typeof window !== "undefined" &&
    window.lucide &&
    typeof window.lucide.createIcons === "function"
  ) {
    window.lucide.createIcons();
  }
  setTimeout(() => toast.remove(), 3000);
}
