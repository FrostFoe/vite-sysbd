import DOMPurify from "dompurify";
import type React from "react";
import { createElement } from "react";
import CustomImage from "./CustomImage";
import CustomVideo from "./CustomVideo";

interface ContentRendererProps {
  content: string;
  className?: string;
}

const ContentRenderer: React.FC<ContentRendererProps> = ({
  content,
  className = "",
}) => {
  const safeContent = DOMPurify.sanitize(content);

  const renderProcessedContent = () => {
    let processedContent = safeContent;

    const customComponents: React.ReactElement[] = [];

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
          // Create a temporary element to parse the HTML
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = sanitizedPart;

          // Convert the HTML elements to React elements recursively
          const convertNodeToReactElement = (
            node: Node,
            nodeKey: string
          ): React.ReactNode => {
            if (node.nodeType === Node.TEXT_NODE) {
              return node.textContent;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              const props: Record<string, unknown> = {
                key: nodeKey,
              };

              // Copy attributes
              for (let i = 0; i < element.attributes.length; i++) {
                const attr = element.attributes[i];
                // Convert HTML attributes to React equivalents (e.g. class to className)
                const propName =
                  attr.name === "class" ? "className" : attr.name;
                props[propName] = attr.value;
              }

              // Process child nodes recursively
              const children = Array.from(element.childNodes).map(
                (childNode, childIndex) =>
                  convertNodeToReactElement(
                    childNode,
                    `${nodeKey}-child-${childIndex}`
                  )
              );

              return createElement(
                element.tagName.toLowerCase(),
                props,
                ...children
              );
            }
            return null;
          };

          return Array.from(tempDiv.childNodes).map((node, nodeIndex) =>
            convertNodeToReactElement(node, `part-${partIndex}-node-${nodeIndex}`)
          );
        }
        return null;
      })
      .filter(Boolean);
  };

  return (
    <div className={`prose max-w-none ${className}`}>
      {renderProcessedContent()}
    </div>
  );
};

export default ContentRenderer;
