import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { AlertCircle, Upload, Video } from "lucide-react";
import type React from "react";
import { useCallback, useState } from "react";
import { adminApi } from "../../lib/api";
import VideoNode from "./VideoNode";

interface CustomEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: string;
  className?: string;
  id?: string;
}

/**
 * CustomEditor Component - TipTap based rich text editor
 * Handles basic text formatting, images, and videos
 */
const CustomEditor: React.FC<CustomEditorProps> = ({
  value,
  onChange,
  placeholder = "Start typing...",
  height = "400px",
  className = "",
}) => {
  const [uploadError, setUploadError] = useState<string>("");

  const handleImageUpload = useCallback(async (file: File) => {
    try {
      setUploadError("");

      if (!file.type.startsWith("image/")) {
        throw new Error("Please upload a valid image file");
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error("Image size must be less than 5MB");
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

  const editor = useEditor({
    extensions: [
      StarterKit.configure({}),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      VideoNode,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-full p-3",
      },
    },
  });

  const handleVideoUpload = useCallback(
    async (videoFile: File) => {
      if (!editor) return;

      try {
        setUploadError("");

        if (!videoFile.type.startsWith("video/")) {
          throw new Error("Please upload a valid video file");
        }

        const maxSize = 100 * 1024 * 1024; // 100MB
        if (videoFile.size > maxSize) {
          throw new Error("Video size must be less than 100MB");
        }

        const formData = new FormData();
        formData.append("video", videoFile);

        const data = await adminApi.uploadVideo(formData);

        if (!data.success || !data.url) {
          throw new Error(data.error || "Upload failed");
        }

        editor.chain().focus().setVideo({ src: data.url }).run();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Upload failed";
        setUploadError(message);
        console.error("Video upload error:", error);
      }
    },
    [editor],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.type.startsWith("image/")) {
          handleImageUpload(file).then((url) => {
            if (url && editor) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          });
        } else if (file.type.startsWith("video/")) {
          handleVideoUpload(file);
        }
      }
    },
    [editor, handleImageUpload, handleVideoUpload],
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
          if (url && editor) {
            editor.chain().focus().setImage({ src: url }).run();
          }
        });
      }
    };
    input.click();
  }, [editor, handleImageUpload]);

  const handleVideoButtonClick = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/*";
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        handleVideoUpload(file);
      }
    };
    input.click();
  }, [handleVideoUpload]);

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className={`custom-editor-wrapper ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-border-color bg-muted-bg p-2 rounded-t-lg flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-3 py-1 rounded text-sm font-medium ${
            editor.isActive("bold")
              ? "bg-bbcRed text-white"
              : "bg-card border border-border-color hover:bg-muted-bg"
          }`}
          title="Bold (Ctrl+B)"
        >
          <strong>B</strong>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-3 py-1 rounded text-sm font-medium ${
            editor.isActive("italic")
              ? "bg-bbcRed text-white"
              : "bg-card border border-border-color hover:bg-muted-bg"
          }`}
          title="Italic (Ctrl+I)"
        >
          <em>I</em>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`px-3 py-1 rounded text-sm font-medium ${
            editor.isActive("strike")
              ? "bg-bbcRed text-white"
              : "bg-card border border-border-color hover:bg-muted-bg"
          }`}
          title="Strikethrough"
        >
          <s>S</s>
        </button>

        <div className="w-px bg-border-color" />

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={`px-3 py-1 rounded text-sm font-medium ${
            editor.isActive("heading", { level: 1 })
              ? "bg-bbcRed text-white"
              : "bg-card border border-border-color hover:bg-muted-bg"
          }`}
          title="Heading 1"
        >
          H1
        </button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`px-3 py-1 rounded text-sm font-medium ${
            editor.isActive("heading", { level: 2 })
              ? "bg-bbcRed text-white"
              : "bg-card border border-border-color hover:bg-muted-bg"
          }`}
          title="Heading 2"
        >
          H2
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1 rounded text-sm font-medium ${
            editor.isActive("bulletList")
              ? "bg-bbcRed text-white"
              : "bg-card border border-border-color hover:bg-muted-bg"
          }`}
          title="Bullet List"
        >
          • List
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-3 py-1 rounded text-sm font-medium ${
            editor.isActive("orderedList")
              ? "bg-bbcRed text-white"
              : "bg-card border border-border-color hover:bg-muted-bg"
          }`}
          title="Ordered List"
        >
          1. List
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

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-3 py-1 rounded text-sm font-medium ${
            editor.isActive("blockquote")
              ? "bg-bbcRed text-white"
              : "bg-card border border-border-color hover:bg-muted-bg"
          }`}
          title="Blockquote"
        >
          " Quote
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="px-3 py-1 rounded text-sm font-medium bg-card border border-border-color hover:bg-muted-bg"
          title="Horizontal Rule"
        >
          —
        </button>

        <div className="w-px bg-border-color" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className="px-3 py-1 rounded text-sm font-medium bg-card border border-border-color hover:bg-muted-bg"
          title="Undo"
        >
          ↶
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className="px-3 py-1 rounded text-sm font-medium bg-card border border-border-color hover:bg-muted-bg"
          title="Redo"
        >
          ↷
        </button>
      </div>

      {/* Editor Content Area */}
      <div
        role="application"
        tabIndex={-1}
        style={{ height, minHeight: height }}
        className="border border-t-0 border-border-color rounded-b-lg overflow-y-auto bg-card p-3 prose prose-sm max-w-none text-card-text"
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <EditorContent editor={editor} aria-label="Editor content area" />
      </div>

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
