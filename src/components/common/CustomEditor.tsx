import {
  AlertCircle,
  Bold,
  Image,
  Italic,
  List,
  ListOrdered,
  Video,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { adminApi } from "../../api";

interface CustomEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: string;
  className?: string;
}

const CustomEditor: React.FC<CustomEditorProps> = ({
  value,
  onChange,
  height = "400px",
  className = "",
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [uploadError, setUploadError] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (editorRef.current && !isInitialized) {
      editorRef.current.innerHTML = value || "";
      setIsInitialized(true);
    }
  }, [isInitialized, value]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    onChange(e.currentTarget.innerHTML);
  };

  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const handleImageUpload = useCallback(async (file: File) => {
    try {
      setUploadError("");

      if (!file.type.startsWith("image/")) {
        throw new Error("অনুগ্রহ করে একটি বৈধ ছবি ফাইল আপলোড করুন");
      }

      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error("ছবির আকার 10MB এর চেয়ে কম হতে হবে");
      }

      const formData = new FormData();
      formData.append("image", file);

      const response = await adminApi.uploadImage(formData);
      if (!response.success) {
        throw new Error(response.error || "ছবি আপলোড ব্যর্থ");
      }

      return response.url;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "আপলোড ব্যর্থ হয়েছে";
      setUploadError(message);
      return null;
    }
  }, []);

  const handleVideoUpload = useCallback(async (videoFile: File) => {
    try {
      setUploadError("");

      if (!videoFile.type.startsWith("video/")) {
        throw new Error("অনুগ্রহ করে একটি বৈধ ভিডিও ফাইল আপলোড করুন");
      }

      const maxSize = 100 * 1024 * 1024;
      if (videoFile.size > maxSize) {
        throw new Error("ভিডিওর আকার 100MB এর চেয়ে কম হতে হবে");
      }

      const formData = new FormData();
      formData.append("video", videoFile);

      const data = await adminApi.uploadVideo(formData);
      if (!data.success || !data.url) {
        throw new Error(data.error || "ভিডিও আপলোড ব্যর্থ");
      }

      return data.url;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "আপলোড ব্যর্থ হয়েছে";
      setUploadError(message);
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
        handleVideoUpload(file).then((url) => {
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
          handleVideoUpload(file).then((url) => {
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
    <div className={`flex flex-col gap-3 ${className}`}>
      {}
      <div className="flex flex-wrap gap-2 items-center p-3 bg-muted-bg rounded-lg border border-border-color">
        {}
        <button
          type="button"
          onClick={() => handleFormat("bold")}
          className="p-2 rounded hover:bg-hover-bg transition-colors text-muted-text hover:text-card-text"
          title="Bold (Ctrl+B)"
          aria-label="Bold"
        >
          <Bold size={18} />
        </button>

        <button
          type="button"
          onClick={() => handleFormat("italic")}
          className="p-2 rounded hover:bg-hover-bg transition-colors text-muted-text hover:text-card-text"
          title="Italic (Ctrl+I)"
          aria-label="Italic"
        >
          <Italic size={18} />
        </button>

        <div className="w-px h-6 bg-border-color" />

        {}
        <button
          type="button"
          onClick={() => handleFormat("insertUnorderedList")}
          className="p-2 rounded hover:bg-hover-bg transition-colors text-muted-text hover:text-card-text"
          title="Bullet List"
          aria-label="Bullet List"
        >
          <List size={18} />
        </button>

        <button
          type="button"
          onClick={() => handleFormat("insertOrderedList")}
          className="p-2 rounded hover:bg-hover-bg transition-colors text-muted-text hover:text-card-text"
          title="Ordered List"
          aria-label="Ordered List"
        >
          <ListOrdered size={18} />
        </button>

        <div className="w-px h-6 bg-border-color" />

        {}
        <button
          type="button"
          onClick={handleImageButtonClick}
          className="p-2 rounded hover:bg-hover-bg transition-colors text-muted-text hover:text-card-text"
          title="Insert Image"
          aria-label="Insert Image"
        >
          <Image size={18} />
        </button>

        <button
          type="button"
          onClick={handleVideoButtonClick}
          className="p-2 rounded hover:bg-hover-bg transition-colors text-muted-text hover:text-card-text"
          title="Insert Video"
          aria-label="Insert Video"
        >
          <Video size={18} />
        </button>

        <div className="w-px h-6 bg-border-color" />

        {}
        <button
          type="button"
          onClick={() => handleFormat("undo")}
          className="p-2 rounded hover:bg-hover-bg transition-colors text-muted-text hover:text-card-text"
          title="Undo"
          aria-label="Undo"
        >
          ↶
        </button>

        <button
          type="button"
          onClick={() => handleFormat("redo")}
          className="p-2 rounded hover:bg-hover-bg transition-colors text-muted-text hover:text-card-text"
          title="Redo"
          aria-label="Redo"
        >
          ↷
        </button>
      </div>

      {}
      {}
      <div
        ref={editorRef}
        contentEditable
        role="textbox"
        tabIndex={0}
        onInput={handleInput}
        suppressContentEditableWarning
        style={{ height, minHeight: height }}
        className="relative p-4 bg-card border border-border-color rounded-lg overflow-y-auto focus:outline-none focus:ring-2 focus:ring-bbcRed focus:border-transparent"
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      />

      {}
      {uploadError && (
        <div className="flex items-center gap-2 p-3 bg-danger/10 border border-danger/30 rounded-lg text-danger animate-in fade-in duration-300">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span className="text-sm">{uploadError}</span>
        </div>
      )}
    </div>
  );
};

export default CustomEditor;
