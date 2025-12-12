import { Maximize, Pause, Play, Volume2, VolumeX } from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";

interface CustomVideoProps {
  src: string;
  alt?: string;
  title?: string;
  className?: string;
  width?: string | number;
  height?: string | number;
  poster?: string;
  caption?: string;
  showCaption?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
}

/**
 * Custom Video Component for Article Content
 * Provides enhanced video player with custom controls and accessibility features
 */
const CustomVideo: React.FC<CustomVideoProps> = ({
  src,
  alt = "",
  title,
  className = "",
  width = "100%",
  height = "auto",
  poster,
  caption,
  showCaption = true,
  loop = false,
  muted = false,
  controls = true,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleLoadStart = () => {
    setIsLoading(true);
  };

  const handleCanPlay = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      if (
        videoRef.current.currentTime >= videoRef.current.duration - 0.1 &&
        !loop
      ) {
        setIsPlaying(false);
      }
    }
  };

  const handleVideoEnd = () => {
    if (!loop) {
      setIsPlaying(false);
    }
  };

  if (hasError) {
    return (
      <div
        className={`relative w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center ${className}`}
      >
        <div className="p-4 text-center">
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto flex items-center justify-center">
            <Play className="w-6 h-6 text-gray-500" />
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Video failed to load
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">{src}</p>
        </div>
      </div>
    );
  }

  return (
    <figure className={`relative ${className}`}>
      <div className="relative bg-black rounded-lg overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white" />
          </div>
        )}
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          loop={loop}
          muted={isMuted}
          controls={controls}
          width={width}
          height={height}
          title={title}
          className={`w-full h-auto ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={handleVideoEnd}
          onTimeUpdate={handleTimeUpdate}
          onLoadStart={handleLoadStart}
          onCanPlay={handleCanPlay}
          onError={handleError}
          aria-label={alt || "Video content"}
        />
        {!controls && (
          <>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={handlePlayPause}
                className="bg-black/50 hover:bg-black/70 text-white p-4 rounded-full transition-all"
                aria-label={isPlaying ? "Pause video" : "Play video"}
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8" />
                ) : (
                  <Play className="w-8 h-8" />
                )}
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 hover:opacity-100 transition-opacity flex justify-between items-center">
              <button
                type="button"
                onClick={handleMuteToggle}
                className="text-white hover:text-gray-300"
                aria-label={isMuted ? "Unmute video" : "Mute video"}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.requestFullscreen?.();
                  }
                }}
                className="text-white hover:text-gray-300"
                aria-label="Enter fullscreen"
              >
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
      </div>
      {showCaption && caption && (
        <figcaption className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};

export default CustomVideo;
