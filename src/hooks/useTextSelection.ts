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

    const range = selection.getRangeAt(0);
    const container = containerRef.current;
    if (!container || !container.contains(range.commonAncestorContainer)) {
      setToolbarVisible(false);
      return;
    }

    const rect = range.getBoundingClientRect();
    const top = rect.top + window.scrollY - 60;
    const left = rect.left + window.scrollX + rect.width / 2;

    setToolbarPosition({ top, left });
    setSelectedText(selectedTextContent);
    setSelectionData({ text: selectedTextContent, range });
    setToolbarVisible(true);
    selectionRef.current = selection;
  }, [containerRef]);

  useEffect(() => {
    const handleMouseUp = () => {
      setTimeout(updateSelection, 0);
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [updateSelection]);

  const handleCopy = useCallback(() => {
    if (selectedText) {
      navigator.clipboard
        .writeText(selectedText)
        .then(() => {
          setToolbarVisible(false);
        })
        .catch(() => {
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

  const handleHighlight = useCallback(
    (color: string) => {
      if (!selectionData.range) return;

      const range = selectionData.range;
      const span = document.createElement("span");
      span.className = `${color} rounded-sm transition-colors duration-200`;

      range.surroundContents(span);

      setToolbarVisible(false);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
      }
    },
    [selectionData.range]
  );

  const handleToolbarClose = useCallback(() => {
    setToolbarVisible(false);
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const preventDefaultContextMenu = (e: Event) => {
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
