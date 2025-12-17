import { AlertCircle, Upload, Video } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { adminApi } from "../../lib/api";
import { cn } from "../../lib/utils";
import { CustomDropdown } from "./CustomDropdown";

interface CustomEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: string;
  className?: string;
  id?: string;
}

const CustomEditor: React.FC<CustomEditorProps> = ({
  value,
  onChange,
  placeholder = "Start typing...",
  height = "400px",
  className = "",
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [uploadError, setUploadError] = useState<string>("");
  const [activeStyles, setActiveStyles] = useState({
    bold: false,
    italic: false,
    strikeThrough: false,
    formatBlock: "p",
  });

  const checkActiveStyles = useCallback(() => {
    try {
      const isBold = document.queryCommandState("bold");

      const isItalic = document.queryCommandState("italic");

      const isStrikeThrough = document.queryCommandState("strikeThrough");

      let block = document.queryCommandValue("formatBlock").toLowerCase();

      if (block === "div" || block === "") {
        block = "p";
      }

      setActiveStyles({
        bold: isBold,

        italic: isItalic,

        strikeThrough: isStrikeThrough,

        formatBlock: block,
      });
    } catch (e) {
      // This can throw an error in some browsers when the editor is not focused.

      console.warn("Could not check active styles", e);
    }
  }, []);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    onChange(e.currentTarget.innerHTML);

    checkActiveStyles();
  };

  const handleFormat = useCallback(
    (command: string, value?: string) => {
      document.execCommand(command, false, value);

      if (editorRef.current) {
        editorRef.current.focus();
      }

      checkActiveStyles();
    },
    [checkActiveStyles]
  );

  useEffect(() => {
    // Set initial styles when the editor is focused
    const editor = editorRef.current;
    if (editor) {
      const handleFocus = () => checkActiveStyles();
      editor.addEventListener("focus", handleFocus);
      return () => editor.removeEventListener("focus", handleFocus);
    }
  }, [checkActiveStyles]);

  const handleImageUpload = useCallback(async (file: File) => {
    try {
      setUploadError("");
      if (!file.type.startsWith("image/")) {
        throw new Error("Please upload a valid image file");
      }
      const maxSize = 20 * 1024 * 1024; // 20MB
      if (file.size > maxSize) {
        throw new Error("Image size must be less than 20MB");
      }
      const formData = new FormData();
      formData.append("image", file);
      const response = await adminApi.uploadImage(formData);
      if (!response.success) {
        throw new Error(response.error || "Upload failed");
      }
      return response.url;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      setUploadError(message);
      console.error("Image upload error:", error);
      return null;
    }
  }, []);

  const handleVideoUpload = useCallback(async (videoFile: File) => {
    try {
      setUploadError("");
      if (!videoFile.type.startsWith("video/")) {
        throw new Error("Please upload a valid video file");
      }
      const maxSize = 500 * 1024 * 1024; // 500MB
      if (videoFile.size > maxSize) {
        throw new Error("Video size must be less than 500MB");
      }
      const formData = new FormData();
      formData.append("video", videoFile);
      const data = await adminApi.uploadVideo(formData);
      if (!data.success || !data.url) {
        throw new Error(data.error || "Upload failed");
      }
      return data.url;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      setUploadError(message);
      console.error("Video upload error:", error);
      return null;
    }
  }, []);

  const handleImageButtonClick = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        handleImageUpload(file).then((url) => {
          if (url) {
            handleFormat(
              "insertHTML",
              `<img src="${url}" style="max-width: 100%; height: auto;" />`
            );
          }
        });
      }
    };
    input.click();
  }, [handleImageUpload, handleFormat]);

  const handleVideoButtonClick = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/*";
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        handleVideoUpload(file).then((url) => {
          if (url) {
            handleFormat(
              "insertHTML",
              `<video controls src="${url}" style="max-width: 100%;"></video>`
            );
          }
        });
      }
    };
    input.click();
  }, [handleVideoUpload, handleFormat]);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.type.startsWith("image/")) {
          handleImageUpload(file).then((url) => {
            if (url) {
              handleFormat(
                "insertHTML",
                `<img src="${url}" style="max-width: 100%; height: auto;" />`
              );
            }
          });
        } else if (file.type.startsWith("video/")) {
          handleVideoUpload(file).then((url) => {
            if (url) {
              handleFormat(
                "insertHTML",
                `<video controls src="${url}" style="max-width: 100%;"></video>`
              );
            }
          });
        }
      }
    },
    [handleImageUpload, handleVideoUpload, handleFormat]
  );

  return (
    <div className={cn("custom-editor-wrapper", className)}>
      <div className="border-b border-border-color bg-muted-bg p-1 rounded-t-lg flex flex-nowrap items-center gap-1 overflow-x-auto">
        <CustomDropdown
          options={[
            { value: "p", label: "Paragraph" },
            { value: "h1", label: "Heading 1" },
            { value: "h2", label: "Heading 2" },
            { value: "blockquote", label: "Quote" },
          ]}
          value={activeStyles.formatBlock}
          onChange={(value) => handleFormat("formatBlock", value)}
          className="w-32 flex-shrink-0"
        />
        <div className="w-px bg-border-color h-6" />
        <button
          type="button"
          onClick={() => handleFormat("bold")}
          className={cn(
            "p-2 rounded hover:bg-hover-bg",
            activeStyles.bold && "bg-bbcRed text-white",
            !activeStyles.bold && "bg-card"
          )}
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => handleFormat("italic")}
          className={cn(
            "p-2 rounded hover:bg-hover-bg",
            activeStyles.italic && "bg-bbcRed text-white",
            !activeStyles.italic && "bg-card"
          )}
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => handleFormat("strikeThrough")}
          className={cn(
            "p-2 rounded hover:bg-hover-bg",
            activeStyles.strikeThrough && "bg-bbcRed text-white",
            !activeStyles.strikeThrough && "bg-card"
          )}
          title="Strikethrough"
        >
          <s>S</s>
        </button>
        <div className="w-px bg-border-color h-6" />
        <button
          type="button"
          onClick={() => handleFormat("insertUnorderedList")}
          className="p-2 rounded hover:bg-hover-bg"
          title="Bullet List"
        >
          {" "}
          • List{" "}
        </button>
        <button
          type="button"
          onClick={() => handleFormat("insertOrderedList")}
          className="p-2 rounded hover:bg-hover-bg"
          title="Ordered List"
        >
          {" "}
          1. List{" "}
        </button>
        <button
          type="button"
          onClick={() => handleFormat("insertHorizontalRule")}
          className="p-2 rounded hover:bg-hover-bg"
          title="Horizontal Rule"
        >
          {" "}
          —{" "}
        </button>
        <div className="w-px bg-border-color h-6" />
        <button
          type="button"
          onClick={handleImageButtonClick}
          className="p-2 rounded hover:bg-hover-bg flex items-center gap-1"
          title="Insert Image"
        >
          <Upload size={16} />
        </button>
        <button
          type="button"
          onClick={handleVideoButtonClick}
          className="p-2 rounded hover:bg-hover-bg flex items-center gap-1"
          title="Insert Video"
        >
          <Video size={16} />
        </button>
        <div className="w-px bg-border-color h-6" />
        <button
          type="button"
          onClick={() => handleFormat("undo")}
          className="p-2 rounded hover:bg-hover-bg"
          title="Undo"
        >
          {" "}
          ↶{" "}
        </button>
        <button
          type="button"
          onClick={() => handleFormat("redo")}
          className="p-2 rounded hover:bg-hover-bg"
          title="Redo"
        >
          {" "}
          ↷{" "}
        </button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onMouseUp={checkActiveStyles}
        onKeyUp={checkActiveStyles}
        style={{ height, minHeight: height }}
        className="border border-t-0 border-border-color rounded-b-lg overflow-y-auto bg-card p-3 prose prose-sm max-w-none text-card-text focus:outline-none"
        dangerouslySetInnerHTML={{ __html: value }}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      />

      {(!value || value === "<p><br></p>") && (
        <div className="absolute top-12 left-4 text-muted-foreground pointer-events-none">
          {placeholder}
        </div>
      )}

      {uploadError && (
        <div className="mt-2 p-3 bg-danger/10 border border-danger/30 rounded-lg flex items-center gap-2 text-danger">
          <AlertCircle size={18} />
          <span>{uploadError}</span>
        </div>
      )}
    </div>
  );
};

export default CustomEditor;
