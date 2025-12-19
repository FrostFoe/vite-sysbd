import DOMPurify from "dompurify";
import type React from "react";
import { createElement, useMemo } from "react";

import CustomImage from "./CustomImage";
import CustomVideo from "./CustomVideo";

interface ContentRendererProps {
  content: string;
  className?: string;
  fontSizeClass?: string; // Added fontSizeClass prop
}

const ContentRenderer: React.FC<ContentRendererProps> = ({
  content,
  className = "",
  fontSizeClass = "", // Added fontSizeClass with default
}) => {
  const safeContent = DOMPurify.sanitize(content);

  const processedContent = useMemo(() => {
    let processedContent = safeContent;
    const customComponents: React.ReactElement[] = [];

    // Replace images with placeholders
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

    // Replace videos with placeholders
    processedContent = processedContent.replace(
      /<video\s+([^>]*?)\s*\/?>.*?<\/video>|<video\s+([^>]*?)\s*>/gi,
      (fullMatch) => {
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

    const parts = processedContent.split(
      /(__CUSTOM_COMPONENT_PLACEHOLDER_\d+__)/
    );

    // Convert parts to React elements
    const convertNodeToReactElement = (
      node: Node,
      nodeKey: string
    ): React.ReactNode => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        return text?.trim() ? text : null;
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const props: Record<string, unknown> = {
          key: nodeKey,
        };

        // Copy attributes
        for (let i = 0; i < element.attributes.length; i++) {
          const attr = element.attributes[i];
          // Convert HTML attributes to React equivalents
          const propName = attr.name === "class" ? "className" : attr.name;
          props[propName] = attr.value;
        }

        // Process child nodes
        const children = Array.from(element.childNodes)
          .map((childNode, childIndex) =>
            convertNodeToReactElement(
              childNode,
              `${nodeKey}-child-${childIndex}`
            )
          )
          .filter((child) => child !== null && child !== undefined);

        return createElement(element.tagName.toLowerCase(), props, ...children);
      }
      return null;
    };

    return parts
      .map((part, partIndex) => {
        if (part.startsWith("__CUSTOM_COMPONENT_PLACEHOLDER_")) {
          const matchResult = part.match(
            /__CUSTOM_COMPONENT_PLACEHOLDER_(\d+)__/
          );
          if (matchResult) {
            const componentIndex = parseInt(matchResult[1], 10);
            return customComponents[componentIndex];
          }
        } else if (part.trim()) {
          const sanitizedPart = DOMPurify.sanitize(part);
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = sanitizedPart;

          return Array.from(tempDiv.childNodes)
            .map((node, nodeIndex) =>
              convertNodeToReactElement(
                node,
                `part-${partIndex}-node-${nodeIndex}`
              )
            )
            .filter((item) => item !== null);
        }
        return null;
      })
      .filter(Boolean)
      .flat();
  }, [safeContent]);

  return (
    <div className={`prose max-w-none ${fontSizeClass} ${className} transition-all duration-300 ease-in-out`} style={{ fontSize: 'inherit' }}>{processedContent}</div>
  );
};

export default ContentRenderer;
