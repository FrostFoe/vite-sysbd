import DOMPurify from "dompurify";
import type React from "react";
import { createElement, useEffect, useMemo, useState } from "react";
import { showToastMsg } from "../../utils";

import CustomImage from "./CustomImage";
import CustomVideo from "./CustomVideo";
import TextSelectionToolbar from "./TextSelectionToolbar";

interface ContentRendererProps {
  content: string;
  className?: string;
  fontSizeClass?: string;
  containerRef?: React.RefObject<HTMLDivElement>;
  enableTextSelectionToolbar?: boolean;
  onTextSelected?: (text: string) => void;
  onAddComment?: (text: string) => void;
}

const ContentRenderer: React.FC<ContentRendererProps> = ({
  content,
  className = "",
  fontSizeClass = "",
  containerRef,
  enableTextSelectionToolbar = false,
  onTextSelected,
  onAddComment,
}) => {
  const [toolbarVisible, setToolbarVisible] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState("");

  const processedContent = useMemo(() => {
    let processedContent = content;
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

        for (let i = 0; i < element.attributes.length; i++) {
          const attr = element.attributes[i];

          const propName = attr.name === "class" ? "className" : attr.name;
          props[propName] = attr.value;
        }

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
  }, [content]);

  useEffect(() => {
    if (!enableTextSelectionToolbar) return;

    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.toString().trim() === "") {
        setToolbarVisible(false);
        setSelectedText("");
        return;
      }

      const selectedTextContent = selection.toString().trim();
      if (!selectedTextContent) {
        setToolbarVisible(false);
        return;
      }

      const range = selection.getRangeAt(0);
      const container = containerRef?.current;
      if (!container || !container.contains(range.commonAncestorContainer)) {
        setToolbarVisible(false);
        return;
      }

      const endRange = document.createRange();
      endRange.setStart(range.endContainer, range.endOffset);
      endRange.collapse(true);
      const endRect = endRange.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      const top = endRect.top - containerRect.top - 50;
      let left = endRect.left - containerRect.left + endRect.width / 2;

      const toolbarHalfWidth = 160;

      left = Math.max(
        toolbarHalfWidth,
        Math.min(left, containerRect.width - toolbarHalfWidth)
      );

      if (containerRect.width < 320) {
        left = containerRect.width / 2;
      }

      setToolbarPosition({ top, left });
      setSelectedText(selectedTextContent);
      setToolbarVisible(true);

      if (onTextSelected) {
        onTextSelected(selectedTextContent);
      }
    };

    const handleMouseUp = () => {
      setTimeout(handleSelection, 0);
    };

    document.addEventListener("mouseup", handleMouseUp);

    document.addEventListener("selectionchange", handleSelection);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("selectionchange", handleSelection);
    };
  }, [enableTextSelectionToolbar, containerRef, onTextSelected]);

  const handleCopy = () => {
    if (selectedText) {
      navigator.clipboard
        .writeText(selectedText)
        .then(() => {
          showToastMsg("Text copied to clipboard");
          setToolbarVisible(false);
        })
        .catch(() => {
          const textArea = document.createElement("textarea");
          textArea.value = selectedText;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);
          showToastMsg("Text copied to clipboard");
          setToolbarVisible(false);
        });
    }
  };

  const handleSearch = () => {
    if (selectedText) {
      window.open(
        `https://www.google.com/search?q=${encodeURIComponent(selectedText)}`,
        "_blank"
      );
      setToolbarVisible(false);
    }
  };

  const handleAskAI = () => {
    if (selectedText) {
      navigator.clipboard.writeText(selectedText).catch(() => {});
      window.open("https://chat.openai.com", "_blank");
      showToastMsg("Text copied! Paste it in ChatGPT.");
      setToolbarVisible(false);
    }
  };

  const handleAddComment = () => {
    if (selectedText && onAddComment) {
      onAddComment(selectedText);
      setToolbarVisible(false);
    }
  };

  const handleSelectAll = () => {
    const container = containerRef?.current;
    if (container) {
      const selection = window.getSelection();
      if (selection) {
        const range = document.createRange();
        range.selectNodeContents(container);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  };

  const handleHighlight = (color: string) => {
    const selection = window.getSelection();
    if (!selection || selection.toString().trim() === "") return;

    const range = selection.getRangeAt(0);
    const span = document.createElement("span");
    span.className = `${color} rounded-sm transition-colors duration-200`;

    range.surroundContents(span);

    selection.removeAllRanges();
    setToolbarVisible(false);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim() !== "") {
      e.preventDefault();

      const selectedTextContent = selection.toString().trim();
      if (selectedTextContent && containerRef?.current) {
        const range = selection.getRangeAt(0);
        if (containerRef.current.contains(range.commonAncestorContainer)) {
          const endRange = document.createRange();
          endRange.setStart(range.endContainer, range.endOffset);
          endRange.collapse(true);
          const endRect = endRange.getBoundingClientRect();
          const containerRect = containerRef.current.getBoundingClientRect();

          const top = endRect.top - containerRect.top - 50;
          let left = endRect.left - containerRect.left + endRect.width / 2;

          const toolbarHalfWidth = 160;

          left = Math.max(
            toolbarHalfWidth,
            Math.min(left, containerRect.width - toolbarHalfWidth)
          );

          if (containerRect.width < 320) {
            left = containerRect.width / 2;
          }

          setToolbarPosition({ top, left });
          setSelectedText(selectedTextContent);
          setToolbarVisible(true);
        }
      }
    }
  };

  return (
    <article
      ref={containerRef}
      tabIndex={-1}
      className={`relative prose max-w-none ${fontSizeClass} ${className} transition-all duration-300 ease-in-out`}
      style={{ fontSize: "inherit" }}
      onContextMenu={handleContextMenu}
    >
      {processedContent}

      <TextSelectionToolbar
        visible={enableTextSelectionToolbar && toolbarVisible}
        position={toolbarPosition}
        onHighlight={handleHighlight}
        onCopy={handleCopy}
        onSelectAll={handleSelectAll}
        onSearch={handleSearch}
        onAskAI={handleAskAI}
        onAddComment={handleAddComment}
        onClose={() => setToolbarVisible(false)}
      />
    </article>
  );
};

export default ContentRenderer;
