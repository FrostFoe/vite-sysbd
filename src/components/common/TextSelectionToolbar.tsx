import { Copy, Palette, Square, Type } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface TextSelectionToolbarProps {
  onHighlight: (color: string) => void;
  onCopy: () => void;
  onSelectAll: () => void;
  onClose: () => void;
  visible: boolean;
  position: { top: number; left: number };
}

const TextSelectionToolbar: React.FC<TextSelectionToolbarProps> = ({
  onHighlight,
  onCopy,
  onSelectAll,
  onClose,
  visible,
  position,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Close color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Hide toolbar when clicking outside
  useEffect(() => {
    const handleClick = () => {
      onClose();
    };

    if (visible) {
      document.addEventListener("click", handleClick);
      return () => {
        document.removeEventListener("click", handleClick);
      };
    }
  }, [visible, onClose]);

  const colorOptions = [
    { name: "Yellow", value: "bg-yellow-200", displayColor: "bg-yellow-400" },
    { name: "Green", value: "bg-green-200", displayColor: "bg-green-400" },
    { name: "Blue", value: "bg-blue-200", displayColor: "bg-blue-400" },
    { name: "Pink", value: "bg-pink-200", displayColor: "bg-pink-400" },
    { name: "Purple", value: "bg-purple-200", displayColor: "bg-purple-400" },
  ];

  if (!visible) return null;

  return (
    <div
      ref={toolbarRef}
      className="fixed z-[100] flex items-center gap-1 bg-card text-card-text shadow-soft rounded-lg p-2 border border-border-color"
      style={{ top: position.top - 50, left: position.left - 60 }}
    >
      <button
        type="button"
        onClick={onCopy}
        className="p-2 rounded-md hover:bg-muted-bg transition-colors"
        title="Copy text"
      >
        <Copy className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={onSelectAll}
        className="p-2 rounded-md hover:bg-muted-bg transition-colors"
        title="Select all"
      >
        <Square className="w-4 h-4" />
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="p-2 rounded-md hover:bg-muted-bg transition-colors flex items-center gap-1"
          title="Highlight text"
        >
          <Palette className="w-4 h-4" />
        </button>

        {showColorPicker && (
          <div className="absolute bottom-full mb-2 left-0 bg-card border border-border-color rounded-lg shadow-soft p-2 flex flex-wrap gap-1 w-24 z-10">
            {colorOptions.map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={() => {
                  onHighlight(color.value);
                  setShowColorPicker(false);
                }}
                className={`w-5 h-5 rounded-full ${color.displayColor} hover:scale-110 transition-transform`}
                title={`Highlight with ${color.name}`}
              />
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="p-1 rounded-md hover:bg-muted-bg transition-colors ml-1"
      >
        <Type className="w-4 h-4" />
      </button>
    </div>
  );
};

export default TextSelectionToolbar;