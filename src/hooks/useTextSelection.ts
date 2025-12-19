import { useCallback, useEffect, useRef, useState } from "react";

interface SelectionData {
  text: string;
  range: Range | null;
}

interface UseTextSelectionReturn {
  toolbarVisible: boolean;
  toolbarPosition: { top: number; left: number };
  selectedText: string;
  handleCopy: () => void;
  handleSelectAll: () => void;
  handleHighlight: (color: string) => void;
  handleToolbarClose: () => void;
}

export const useTextSelection = (
  containerRef: React.RefObject<HTMLElement | null>
): UseTextSelectionReturn => {
  const [toolbarVisible, setToolbarVisible] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState("");
  const [selectionData, setSelectionData] = useState<SelectionData>({
    text: "",
    range: null,
  });
  const selectionRef = useRef<Selection | null>(null);

  // Track current selection
  const updateSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.toString().trim() === "") {
      setToolbarVisible(false);
      setSelectedText("");
      setSelectionData({ text: "", range: null });
      return;
    }

    const selectedTextContent = selection.toString().trim();
    if (!selectedTextContent) {
      setToolbarVisible(false);
      return;
    }

    // Check if selection is within the container
    const range = selection.getRangeAt(0);
    const container = containerRef.current;
    if (!container || !container.contains(range.commonAncestorContainer)) {
      setToolbarVisible(false);
      return;
    }

    // Position the toolbar above the selection
    const rect = range.getBoundingClientRect();
    const top = rect.top + window.scrollY - 60; // Position above the selection
    const left = rect.left + window.scrollX + rect.width / 2;

    setToolbarPosition({ top, left });
    setSelectedText(selectedTextContent);
    setSelectionData({ text: selectedTextContent, range });
    setToolbarVisible(true);
    selectionRef.current = selection;
  }, [containerRef]);

  // Handle mouse up to show toolbar
  useEffect(() => {
    const handleMouseUp = () => {
      setTimeout(updateSelection, 0); // Use timeout to ensure selection is completed
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [updateSelection]);

  // Handle copy
  const handleCopy = useCallback(() => {
    if (selectedText) {
      navigator.clipboard
        .writeText(selectedText)
        .then(() => {
          // Show a notification or feedback
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
          setToolbarVisible(false);
        });
    }
  }, [selectedText]);

  // Handle select all
  const handleSelectAll = useCallback(() => {
    const container = containerRef.current;
    if (container) {
      const selection = window.getSelection();
      if (selection) {
        const range = document.createRange();
        range.selectNodeContents(container);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }, [containerRef]);

  // Handle highlight
  const handleHighlight = useCallback(
    (color: string) => {
      if (!selectionData.range) return;

      const range = selectionData.range;
      const span = document.createElement("span");
      span.className = `${color} rounded-sm transition-colors duration-200`;

      // Wrap the selected content in the span
      range.surroundContents(span);

      // Deselect after highlighting
      setToolbarVisible(false);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
      }
    },
    [selectionData.range]
  );

  // Handle closing toolbar
  const handleToolbarClose = useCallback(() => {
    setToolbarVisible(false);
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }
  }, []);

  // Suppress default context menu on selections
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const preventDefaultContextMenu = (e: Event) => {
      // If we have a selection and the context menu is being opened on selected text
      const selection = window.getSelection();
      if (selection && selection.toString().trim() !== "") {
        e.preventDefault();
      }
    };

    container.addEventListener("contextmenu", preventDefaultContextMenu);
    return () => {
      container.removeEventListener("contextmenu", preventDefaultContextMenu);
    };
  }, [containerRef]);

  return {
    toolbarVisible,
    toolbarPosition,
    selectedText,
    handleCopy,
    handleSelectAll,
    handleHighlight,
    handleToolbarClose,
  };
};
