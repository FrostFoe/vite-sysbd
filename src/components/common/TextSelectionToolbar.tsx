import {
  Bot,
  Copy,
  MessageSquareQuote,
  Palette,
  Search,
  Square,
  Type,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface TextSelectionToolbarProps {
  onHighlight: (color: string) => void;
  onCopy: () => void;
  onSelectAll: () => void;
  onSearch: () => void;
  onAskAI: () => void;
  onAddComment: () => void;
  onClose: () => void;
  visible: boolean;
  position: { top: number; left: number };
}

const TextSelectionToolbar: React.FC<TextSelectionToolbarProps> = ({
  onHighlight,
  onCopy,
  onSelectAll,
  onSearch,
  onAskAI,
  onAddComment,
  onClose,
  visible,
  position,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Consolidated click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If toolbar is not visible, do nothing
      if (!visible) return;

      // Check if click is inside the toolbar
      if (toolbarRef.current?.contains(event.target as Node)) {
        return;
      }

      // If click is outside, close everything
      setShowColorPicker(false);
      onClose();
    };

    if (visible) {
      // Use 'mousedown' instead of 'click' for better responsiveness on selection clear
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [visible, onClose]);

  const colorOptions = [
    { name: "Yellow", value: "bg-yellow-200", displayColor: "bg-yellow-400" },
    { name: "Green", value: "bg-green-200", displayColor: "bg-green-400" },
    { name: "Blue", value: "bg-blue-200", displayColor: "bg-blue-400" },
    { name: "Pink", value: "bg-pink-200", displayColor: "bg-pink-400" },
    { name: "Purple", value: "bg-purple-200", displayColor: "bg-purple-400" },
  ];

  if (!visible) return null;

  // Prevent off-screen positioning (Simple boundary check)
  const calculatedTop = Math.max(10, position.top - 50);

  return (
    <div
      ref={toolbarRef}
      role="toolbar"
      className="absolute z-[1000] flex items-center gap-1 bg-card text-card-text shadow-xl rounded-lg p-2 border border-border-color animate-in fade-in zoom-in-95 duration-200 max-w-[95vw] overflow-x-auto"
      style={{
        top: calculatedTop,
        left: position.left,
        transform: "translateX(-50%)",
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onCopy();
        }}
        className="p-2 rounded-md hover:bg-muted-bg transition-colors"
        title="Copy text"
      >
        <Copy className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSearch();
        }}
        className="p-2 rounded-md hover:bg-muted-bg transition-colors"
        title="Search Web"
      >
        <Search className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onAskAI();
        }}
        className="p-2 rounded-md hover:bg-muted-bg transition-colors"
        title="Ask AI"
      >
        <Bot className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onAddComment();
        }}
        className="p-2 rounded-md hover:bg-muted-bg transition-colors"
        title="Quote Reply"
      >
        <MessageSquareQuote className="w-4 h-4" />
      </button>

      <div className="w-px h-4 bg-border-color mx-1" />

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSelectAll();
        }}
        className="p-2 rounded-md hover:bg-muted-bg transition-colors"
        title="Select all"
      >
        <Square className="w-4 h-4" />
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowColorPicker(!showColorPicker);
          }}
          className={`p-2 rounded-md hover:bg-muted-bg transition-colors flex items-center gap-1 ${
            showColorPicker ? "bg-muted-bg" : ""
          }`}
          title="Highlight text"
        >
          <Palette className="w-4 h-4" />
        </button>

        {showColorPicker && (
          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-card border border-border-color rounded-lg shadow-xl p-2 flex flex-wrap gap-2 w-32 z-20">
            {colorOptions.map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onHighlight(color.value);
                  setShowColorPicker(false);
                }}
                className={`w-6 h-6 rounded-full ${color.displayColor} hover:scale-110 transition-transform ring-1 ring-border-color`}
                title={`Highlight with ${color.name}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="w-px h-4 bg-border-color mx-1" />

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="p-1 rounded-md hover:bg-red-100 hover:text-red-600 transition-colors ml-1"
        title="Close toolbar"
      >
        <Type className="w-4 h-4" />
      </button>
    </div>
  );
};

export default TextSelectionToolbar;
