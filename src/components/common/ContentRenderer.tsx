import DOMPurify from "dompurify";
import type React from "react";
import { sanitizeHtml } from "../../lib/utils";
import CustomImage from "./CustomImage";
import CustomVideo from "./CustomVideo";

interface ContentRendererProps {
  content: string;
  className?: string;
}

/**
 * ContentRenderer Component
 * Renders HTML content with custom image and video components while maintaining
 * security by sanitizing the HTML content first
 */
const ContentRenderer: React.FC<ContentRendererProps> = ({
  content,
  className = "",
}) => {
  // Sanitize the HTML content for security
  const safeContent = sanitizeHtml(content);

  // Process HTML string to replace img and video tags with React components
  const renderProcessedContent = () => {
    // Use a more robust approach to replace img and video tags with placeholders
    // then convert those placeholders back to React components
    let processedContent = safeContent;

    // Array to store our custom components
    const customComponents: React.ReactElement[] = [];

    // Replace img tags with placeholders and store components
    processedContent = processedContent.replace(
      /<img\s+([^>]*?)\s*>/gi,
      (_, attributes) => {
        const srcMatch = attributes.match(/src\s*=\s*["']([^"']*)["']/i);
        const altMatch = attributes.match(/alt\s*=\s*["']([^"']*)["']/i);
        const titleMatch = attributes.match(/title\s*=\s*["']([^"']*)["']/i);
        const widthMatch = attributes.match(/width\s*=\s*["']([^"']*)["']/i);
        const heightMatch = attributes.match(/height\s*=\s*["']([^"']*)["']/i);

        const componentIndex = customComponents.length;
        customComponents.push(
          <CustomImage
            key={`img-${componentIndex}`}
            src={srcMatch ? srcMatch[1] : ""}
            alt={altMatch ? altMatch[1] : ""}
            title={titleMatch ? titleMatch[1] : ""}
            width={widthMatch ? widthMatch[1] : undefined}
            height={heightMatch ? heightMatch[1] : undefined}
            className="my-4"
          />
        );

        return `__CUSTOM_COMPONENT_PLACEHOLDER_${componentIndex}__`;
      }
    );

    // Replace video tags with placeholders and store components (handles both self-closing and closing tags)
    processedContent = processedContent.replace(
      /<video\s+([^>]*?)\s*\/?>.*?<\/video>|<video\s+([^>]*?)\s*>/gi,
      (fullMatch) => {
        // Extract attributes from the video tag
        const srcMatch = fullMatch.match(/src\s*=\s*["']([^"']*)["']/i);
        const posterMatch = fullMatch.match(/poster\s*=\s*["']([^"']*)["']/i);
        const altMatch = fullMatch.match(/alt\s*=\s*["']([^"']*)["']/i);
        const titleMatch = fullMatch.match(/title\s*=\s*["']([^"']*)["']/i);
        const widthMatch = fullMatch.match(/width\s*=\s*["']([^"']*)["']/i);
        const heightMatch = fullMatch.match(/height\s*=\s*["']([^"']*)["']/i);
        const loop = fullMatch.includes("loop");
        const muted = fullMatch.includes("muted");
        const controls = fullMatch.includes("controls");

        const componentIndex = customComponents.length;
        customComponents.push(
          <CustomVideo
            key={`video-${componentIndex}`}
            src={srcMatch ? srcMatch[1] : ""}
            poster={posterMatch ? posterMatch[1] : ""}
            alt={altMatch ? altMatch[1] : ""}
            title={titleMatch ? titleMatch[1] : ""}
            width={widthMatch ? widthMatch[1] : undefined}
            height={heightMatch ? heightMatch[1] : undefined}
            loop={loop}
            muted={muted}
            controls={controls}
            className="my-4"
          />
        );

        return `__CUSTOM_COMPONENT_PLACEHOLDER_${componentIndex}__`;
      }
    );

    // Now split the processed content by placeholders and reconstruct with components
    const parts = processedContent.split(
      /(__CUSTOM_COMPONENT_PLACEHOLDER_\d+__)/
    );

    let keyCounter = 0;
    return parts
      .map((part) => {
        keyCounter++;
        if (part.startsWith("__CUSTOM_COMPONENT_PLACEHOLDER_")) {
          const matchResult = part.match(
            /__CUSTOM_COMPONENT_PLACEHOLDER_(\d+)__/
          );
          if (matchResult) {
            const componentIndex = parseInt(matchResult[1], 10);
            // Return the component directly from our array
            return customComponents[componentIndex];
          }
        } else if (part.trim()) {
          // Sanitize the remaining HTML content
          const sanitizedPart = DOMPurify.sanitize(part);
          return (
            <span
              key={`html-${Date.now()}-${keyCounter}`}
              // biome-ignore lint/security/noDangerouslySetInnerHtml: Content is properly sanitized with DOMPurify and our own sanitizeHtml function to prevent XSS
              dangerouslySetInnerHTML={{ __html: sanitizedPart }}
            />
          );
        }
        return null;
      })
      .filter(Boolean); // Remove any null entries
  };

  return (
    <div className={`prose max-w-none ${className}`}>
      {renderProcessedContent()}
    </div>
  );
};

export default ContentRenderer;
