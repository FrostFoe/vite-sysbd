/**
 * Image Lazy Loading Utilities
 * Improves performance by deferring image loads
 */

/**
 * Generate responsive image srcset with WebP format support
 */
export function generateImageSrcSet(
  basePath: string,
  widths: number[] = [400, 800, 1200],
): string {
  return widths
    .map((width) => `${basePath}?w=${width}&q=85 ${width}w`)
    .join(", ");
}

/**
 * Get WebP image source with fallback
 */
export function getImageWithWebP(path: string): {
  src: string;
  srcSet: string;
  alt: string;
} {
  return {
    src: path,
    srcSet: `${path}?fmt=webp 1x, ${path}?fmt=webp&q=85 2x`,
    alt: "Article image",
  };
}

/**
 * Intersection Observer setup for lazy loading
 */
export function setupLazyLoading(selector: string = "img[data-lazy]") {
  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
          }
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
          }
          img.classList.add("loaded");
          observer.unobserve(img);
        }
      });
    });

    document.querySelectorAll(selector).forEach((img) => {
      imageObserver.observe(img);
    });
  }
}

/**
 * React hook for lazy loading images
 */
import { useEffect, useRef } from "react";

export function useLazyLoad() {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && imgRef.current) {
          const src = imgRef.current.dataset.src;
          if (src) {
            imgRef.current.src = src;
            imgRef.current.classList.add("loaded");
          }
          observer.unobserve(entry.target);
        }
      });
    });

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return imgRef;
}

/**
 * Calculate optimal image dimensions for responsive design
 */
export function getOptimalImageSize(containerWidth: number): {
  width: number;
  height: number;
} {
  const ratio = 16 / 9; // 16:9 aspect ratio
  return {
    width: containerWidth,
    height: Math.round(containerWidth / ratio),
  };
}

/**
 * Create image loading skeleton placeholder element
 */
export function createImageSkeleton(): HTMLDivElement {
  const skeleton = document.createElement("div");
  skeleton.className = "animate-pulse bg-muted-bg rounded-lg";
  skeleton.style.aspectRatio = "16/9";
  return skeleton;
}
