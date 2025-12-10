import { Eye, EyeOff } from "lucide-react";
import type React from "react";
import { useState } from "react";

interface CustomImageProps {
  src: string;
  alt?: string;
  title?: string;
  className?: string;
  width?: string | number;
  height?: string | number;
  caption?: string;
  showCaption?: boolean;
}

/**
 * Custom Image Component for Article Content
 * Provides enhanced image display with lazy loading, error handling,
 * and accessibility features
 */
const CustomImage: React.FC<CustomImageProps> = ({
  src,
  alt = "",
  title,
  className = "",
  width,
  height,
  caption,
  showCaption = true,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showImage, setShowImage] = useState(true);

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
        className={`relative w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center cursor-pointer ${className}`}
        onClick={toggleVisibility}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            toggleVisibility();
          }
        }}
        aria-label={showImage ? "Hide image" : "Show image"}
      >
        <div className="text-center p-4">
          <EyeOff className="w-8 h-8 mx-auto text-gray-500" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Image hidden
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Click to show
          </p>
        </div>
      </button>
    );
  }

  if (hasError) {
    return (
      <div
        className={`relative w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center ${className}`}
      >
        <div className="text-center p-4">
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Image failed to load
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">{src}</p>
        </div>
      </div>
    );
  }

  return (
    <figure className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg flex items-center justify-center">
          <span className="text-sm text-gray-500">Loading...</span>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        title={title}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-auto rounded-lg ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
      />
      {showCaption && caption && (
        <figcaption className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400 italic">
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
