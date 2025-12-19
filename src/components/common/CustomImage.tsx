import { Eye, EyeOff } from "lucide-react";
import type React from "react";
import { useState, useEffect, useRef } from "react";
import { normalizeMediaUrl } from "../../utils";

interface CustomImageProps {
  src: string;
  alt?: string;
  title?: string;
  className?: string;
  width?: string | number;
  height?: string | number;
  caption?: string;
  showCaption?: boolean;
  priority?: boolean;
}

const CustomImage: React.FC<CustomImageProps> = ({
  src,
  alt = "",
  title,
  className = "",
  width,
  height,
  caption,
  showCaption = true,
  priority = false,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showImage, setShowImage] = useState(true);
  const [shouldLoad, setShouldLoad] = useState(priority);
  const imageRef = useRef<HTMLImageElement>(null);

  const normalizedSrc = normalizeMediaUrl(src);

  useEffect(() => {
    if (priority) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          if (imageRef.current) {
            observer.unobserve(imageRef.current);
          }
        }
      },
      {
        root: null,
        rootMargin: "100px",
        threshold: 0.01,
      },
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => {
      if (imageRef.current) {
        observer.unobserve(imageRef.current);
      }
    };
  }, [priority]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const toggleVisibility = () => {
    setShowImage(!showImage);
  };

  if (!showImage) {
    return (
      <button
        type="button"
        className={`relative w-full bg-muted-bg border border-border-color rounded-lg flex items-center justify-center cursor-pointer ${className}`}
        onClick={toggleVisibility}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            toggleVisibility();
          }
        }}
        aria-label={showImage ? "Hide image" : "Show image"}
      >
        <div className="text-center p-4">
          <EyeOff className="w-8 h-8 mx-auto text-muted-text" />
          <p className="mt-2 text-sm text-muted-text">Image hidden</p>
          <p className="text-xs text-muted-text">Click to show</p>
        </div>
      </button>
    );
  }

  if (hasError) {
    return (
      <div
        className={`relative w-full bg-muted-bg border border-border-color rounded-lg flex items-center justify-center ${className}`}
      >
        <div className="text-center p-4">
          <div className="bg-muted-bg border-2 border-dashed border-border-color rounded-xl w-16 h-16 mx-auto" />
          <p className="mt-2 text-sm text-muted-text">Image failed to load</p>
          <p className="text-xs text-muted-text">{normalizedSrc}</p>
        </div>
      </div>
    );
  }

  return (
    <figure className={`relative ${className}`} ref={imageRef}>
      {isLoading && (
        <div className="absolute inset-0 bg-muted-bg animate-pulse rounded-lg flex items-center justify-center"
>
          <span className="text-sm text-muted-text">Loading...</span>
        </div>
      )}
      <img
        ref={imageRef}
        src={shouldLoad ? normalizedSrc : ""}
        alt={alt}
        title={title}
        width={width}
        height={height}
        crossOrigin="anonymous"
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-auto rounded-lg ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
      {showCaption && caption && (
        <figcaption className="mt-2 text-sm text-center text-muted-text italic">
          {caption}
        </figcaption>
      )}
      <button
        type="button"
        onClick={toggleVisibility}
        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all opacity-0 hover:opacity-100 group-hover:opacity-100"
        aria-label={showImage ? "Hide image" : "Show image"}
      >
        {showImage ? (
          <EyeOff className="w-4 h-4" />
        ) : (
          <Eye className="w-4 h-4" />
        )}
      </button>
    </figure>
  );
};

export default CustomImage;
