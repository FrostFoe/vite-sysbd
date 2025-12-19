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
  fontSizeClass?: string; // Added fontSizeClass prop
  containerRef?: React.RefObject<HTMLDivElement>; // Optional ref for text selection
  enableTextSelectionToolbar?: boolean; // Whether to enable the floating toolbar
  onTextSelected?: (text: string) => void; // Callback when text is selected
  onAddComment?: (text: string) => void; // Callback when "Quote Reply" is clicked
}

const ContentRenderer: React.FC<ContentRendererProps> = ({
  content,
  className = "",
  fontSizeClass = "", // Added fontSizeClass with default
  containerRef,
  enableTextSelectionToolbar = false,
  onTextSelected,
  onAddComment,
}) => {
  const [toolbarVisible, setToolbarVisible] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState("");

  // Close color picker when clicking outside

  const processedContent = useMemo(() => {
    let processedContent = content;
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
  }, [content]);

  // Handle text selection
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

      // Check if selection is within the content container
      const range = selection.getRangeAt(0);
      const container = containerRef?.current;
      if (!container || !container.contains(range.commonAncestorContainer)) {
        setToolbarVisible(false);
        return;
      }

      // Position the toolbar right next to the end of the selection
      const endRange = document.createRange();
      endRange.setStart(range.endContainer, range.endOffset);
      endRange.collapse(true); // Collapse to end position
      const endRect = endRange.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      // Calculate position relative to the container
      const top = endRect.top - containerRect.top - 50; // Position just above the end of selection
      let left = endRect.left - containerRect.left + endRect.width / 2; // Position at the end of selection

      // Adjust for toolbar width to keep it visible
      const toolbarWidth = 150; // Approximate toolbar width
      if (left + toolbarWidth > containerRect.width) {
        // If toolbar would go off-screen (right), position it to the left of selection
        left = Math.max(10, containerRect.width - toolbarWidth - 10);
      }

      // Ensure it doesn't go off the left side
      left = Math.max(left, 10);

      setToolbarPosition({ top, left });
      setSelectedText(selectedTextContent);
      setToolbarVisible(true);

      // Call the callback if provided
      if (onTextSelected) {
        onTextSelected(selectedTextContent);
      }
    };

    const handleMouseUp = () => {
      // Use setTimeout to ensure selection is completed
      setTimeout(handleSelection, 0);
    };

    // Add the event listener to the document
    document.addEventListener("mouseup", handleMouseUp);

    // Also add a selectionchange listener for better detection
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
          // Fallback if clipboard API fails
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
      // Copy to clipboard first as a convenience
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

    // Wrap the selected content in the span
    range.surroundContents(span);

    // Deselect after highlighting
    selection.removeAllRanges();
    setToolbarVisible(false);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    // Check if there's a text selection
    const selection = window.getSelection();
    if (selection && selection.toString().trim() !== "") {
      e.preventDefault(); // Suppress default context menu if text is selected
      // Show the toolbar if text is selected and right-clicked
      const selectedTextContent = selection.toString().trim();
      if (selectedTextContent && containerRef?.current) {
        const range = selection.getRangeAt(0);
        if (containerRef.current.contains(range.commonAncestorContainer)) {
          // Position the toolbar right next to the end of the selection
          const endRange = document.createRange();
          endRange.setStart(range.endContainer, range.endOffset);
          endRange.collapse(true); // Collapse to end position
          const endRect = endRange.getBoundingClientRect();
          const containerRect = containerRef.current.getBoundingClientRect();

          // Calculate position relative to the container
          const top = endRect.top - containerRect.top - 50; // Position just above the end of selection
          let left = endRect.left - containerRect.left + endRect.width / 2; // Position at the end of selection

          // Adjust for toolbar width to keep it visible
          const toolbarWidth = 150; // Approximate toolbar width
          if (left + toolbarWidth > containerRect.width) {
            // If toolbar would go off-screen, position it to the left of selection
            left = Math.max(10, containerRect.width - toolbarWidth - 10);
          }

          // Ensure it doesn't go off the left side
          left = Math.max(left, 10);

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
