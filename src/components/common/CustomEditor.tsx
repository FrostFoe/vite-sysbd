import React, { useRef, useState, useCallback, useEffect } from "react";
import { AlertCircle, Upload, Video } from "lucide-react";
import { adminApi } from "../../lib/api";

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
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize editor content on mount
  useEffect(() => {
    if (editorRef.current && !isInitialized && value) {
      editorRef.current.innerHTML = value;
      setIsInitialized(true);
    }
  }, [value, isInitialized]);

  // Update editor content when value prop changes externally
  useEffect(() => {
    if (editorRef.current && isInitialized) {
      // Only update if the content actually changed
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value;
      }
    }
  }, [value, isInitialized]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    onChange(e.currentTarget.innerHTML);
  };

  const handleFormat = (command: string, value?: string) => {
    // Note: document.execCommand is largely deprecated but is the simplest
    // way to enact rich-text commands in a from-scratch contentEditable editor.
    // For a more robust solution, a library that manages browser inconsistencies
    // and selection state is recommended.
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

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

    const handleVideoUpload = useCallback(
    async (videoFile: File) => {
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
        const message =
          error instanceof Error ? error.message : "Upload failed";
        setUploadError(message);
        console.error("Video upload error:", error);
        return null;
      }
    },
    [],
  );

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
            const html = `<img src="${url}" />`;
            document.execCommand("insertHTML", false, html);
          }
        });
      }
    };
    input.click();
  }, [handleImageUpload]);

  const handleVideoButtonClick = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/*";
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        handleVideoUpload(file).then(url => {
            if (url) {
                const html = `<video controls src="${url}"></video>`;
                document.execCommand("insertHTML", false, html);
            }
        });
      }
    };
    input.click();
  }, [handleVideoUpload]);

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
              const html = `<img src="${url}" />`;
              document.execCommand("insertHTML", false, html);
            }
          });
        } else if (file.type.startsWith("video/")) {
            handleVideoUpload(file).then(url => {
                if (url) {
                    const html = `<video controls src="${url}"></video>`;
                    document.execCommand("insertHTML", false, html);
                }
            });
        }
      }
    },
    [handleImageUpload, handleVideoUpload],
  );

  return (
    <div className={`custom-editor-wrapper ${className}`}>
      {/* Basic Toolbar */}
      <div className="border-b border-border-color bg-muted-bg p-2 rounded-t-lg flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => handleFormat("bold")}
          className="px-3 py-1 rounded text-sm font-medium bg-card border border-border-color hover:bg-muted-bg"
          title="Bold (Ctrl+B)"
        >
          <strong>B</strong>
        </button>

        <button
          type="button"
          onClick={() => handleFormat("italic")}
          className="px-3 py-1 rounded text-sm font-medium bg-card border border-border-color hover:bg-muted-bg"
          title="Italic (Ctrl+I)"
        >
          <em>I</em>
        </button>

        <button
          type="button"
          onClick={() => handleFormat("strikeThrough")}
          className="px-3 py-1 rounded text-sm font-medium bg-card border border-border-color hover:bg-muted-bg"
          title="Strikethrough"
        >
          <s>S</s>
        </button>

        <div className="w-px bg-border-color" />

        <button
          type="button"
          onClick={() => handleFormat("formatBlock", "<h1>")}
          className="px-3 py-1 rounded text-sm font-medium bg-card border border-border-color hover:bg-muted-bg"
          title="Heading 1"
        >
          H1
        </button>

        <button
          type="button"
          onClick={() => handleFormat("formatBlock", "<h2>")}
          className="px-3 py-1 rounded text-sm font-medium bg-card border border-border-color hover:bg-muted-bg"
          title="Heading 2"
        >
          H2
        </button>

        <button
          type="button"
          onClick={() => handleFormat("insertUnorderedList")}
          className="px-3 py-1 rounded text-sm font-medium bg-card border border-border-color hover:bg-muted-bg"
          title="Bullet List"
        >
          • List
        </button>

        <button
          type="button"
          onClick={() => handleFormat("insertOrderedList")}
          className="px-3 py-1 rounded text-sm font-medium bg-card border border-border-color hover:bg-muted-bg"
          title="Ordered List"
        >
          1. List
        </button>

        <div className="w-px bg-border-color" />

        <button
          type="button"
          onClick={() => handleFormat("formatBlock", "<blockquote>")}
          className="px-3 py-1 rounded text-sm font-medium bg-card border border-border-color hover:bg-muted-bg"
          title="Blockquote"
        >
          " Quote
        </button>

        <button
          type="button"
          onClick={() => handleFormat("insertHorizontalRule")}
          className="px-3 py-1 rounded text-sm font-medium bg-card border border-border-color hover:bg-muted-bg"
          title="Horizontal Rule"
        >
          —
        </button>

        <div className="w-px bg-border-color" />

        <button
          type="button"
          onClick={handleImageButtonClick}
          className="px-3 py-1 rounded text-sm font-medium bg-card border border-border-color hover:bg-muted-bg flex items-center gap-1"
          title="Insert Image"
        >
          <Upload size={16} /> Image
        </button>

        <button
          type="button"
          onClick={handleVideoButtonClick}
          className="px-3 py-1 rounded text-sm font-medium bg-card border border-border-color hover:bg-muted-bg flex items-center gap-1"
          title="Insert Video"
        >
          <Video size={16} /> Video
        </button>

        <div className="w-px bg-border-color" />

        <button
          type="button"
          onClick={() => handleFormat("undo")}
          className="px-3 py-1 rounded text-sm font-medium bg-card border border-border-color hover:bg-muted-bg"
          title="Undo"
        >
          ↶
        </button>

        <button
          type="button"
          onClick={() => handleFormat("redo")}
          className="px-3 py-1 rounded text-sm font-medium bg-card border border-border-color hover:bg-muted-bg"
          title="Redo"
        >
          ↷
        </button>
      </div>

      {/* Editor Content Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        suppressContentEditableWarning
        style={{ height, minHeight: height }}
        className="border border-t-0 border-border-color rounded-b-lg overflow-y-auto bg-card p-3 prose prose-sm max-w-none text-card-text focus:outline-none"
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      />

      {/* Placeholder */}
      {/* This is a simple implementation. A more robust solution would hide the placeholder as soon as the user starts typing. */}
      {(!value || value === "<p><br></p>") && (
        <div className="absolute top-12 left-4 text-muted-foreground pointer-events-none">
          {placeholder}
        </div>
      )}
      
      {/* Error Message */}
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