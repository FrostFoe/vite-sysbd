import {
  AlertCircle,
  UploadCloud,
  X,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { adminApi } from "../../lib/api";
import type { Document as DocType } from "../../types";

export const DocumentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  articleId: string;
  doc: DocType | null;
}> = ({ isOpen, onClose, onSave, articleId, doc }) => {
  const [formData, setFormData] = useState<Partial<DocType>>({ sort_order: 0 });
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (doc) {
      setFormData(doc);
    } else {
      setFormData({
        display_name_bn: "",
        display_name_en: "",
        description_bn: "",
        description_en: "",
        download_url: "",
        sort_order: 0,
      });
    }
    setFile(null);
    setError("");
  }, [doc]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    const formPayload = new FormData();
    formPayload.append("article_id", articleId);
    if (doc?.id) formPayload.append("id", doc.id);
    if (file) formPayload.append("file", file);

    for (const key in formData) {
      if (
        key !== "id" &&
        key !== "file_path" &&
        key !== "file_name" &&
        key !== "file_size" &&
        key !== "file_type"
      ) {
        const value = formData[key as keyof typeof formData];
        if (value !== null && value !== undefined) {
          formPayload.append(key, String(value));
        }
      }
    }

    try {
      const res = await adminApi.saveDocument(formPayload);
      if (res.success) {
        onSave();
      } else {
        setError(res.error || "Failed to save document.");
      }
    } catch (_error) {
      setError("An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={doc ? "Edit Document" : "Add Document"}
      className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          onClose();
        }
      }}
      tabIndex={-1}
    >
      <div
        role="document"
        aria-label={doc ? "Edit Document Form" : "Add Document Form"}
        className="bg-card rounded-xl shadow-2xl border max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-card/80 backdrop-blur-md border-b p-4 flex items-center justify-between z-10">
          <h3 className="text-xl font-bold">
            {doc ? "Edit Document" : "Add Document"}
          </h3>
          <button type="button" onClick={onClose}>
            <X />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <button
            type="button"
            onClick={() => document.getElementById("file-input")?.click()}
            onKeyDown={(e) => {
              if (e.key === "Space" || e.key === "Enter") {
                document.getElementById("file-input")?.click();
              }
            }}
            className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer w-full text-left"
          >
            <UploadCloud className="w-12 h-12 mx-auto text-muted-text" />
            <p className="mt-2 text-sm">Click to upload or drag & drop</p>
            <input
              type="file"
              id="file-input"
              onChange={handleFileChange}
              className="hidden"
            />
            {file && <p className="text-success text-sm mt-2">{file.name}</p>}
            {!file && doc?.file_name && (
              <p className="text-card-text text-sm mt-2">{doc.file_name}</p>
            )}
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="display_name_bn"
              value={formData.display_name_bn || ""}
              onChange={(e) =>
                setFormData({ ...formData, display_name_bn: e.target.value })
              }
              placeholder="Name (BN)"
              required
              className="w-full p-2.5 sm:p-3 rounded border bg-muted-bg text-sm sm:text-base"
            />
            <input
              name="display_name_en"
              value={formData.display_name_en || ""}
              onChange={(e) =>
                setFormData({ ...formData, display_name_en: e.target.value })
              }
              placeholder="Name (EN)"
              required
              className="w-full p-2.5 sm:p-3 rounded border bg-muted-bg text-sm sm:text-base"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <textarea
              name="description_bn"
              value={formData.description_bn || ""}
              onChange={(e) =>
                setFormData({ ...formData, description_bn: e.target.value })
              }
              placeholder="Description (BN)"
              rows={3}
              className="w-full p-2.5 sm:p-3 rounded border bg-muted-bg text-sm sm:text-base"
            />
            <textarea
              name="description_en"
              value={formData.description_en || ""}
              onChange={(e) =>
                setFormData({ ...formData, description_en: e.target.value })
              }
              placeholder="Description (EN)"
              rows={3}
              className="w-full p-2.5 sm:p-3 rounded border bg-muted-bg text-sm sm:text-base"
            />
          </div>
          <input
            type="url"
            name="download_url"
            value={formData.download_url || ""}
            onChange={(e) =>
              setFormData({ ...formData, download_url: e.target.value })
            }
            placeholder="External URL (optional)"
            className="w-full p-2.5 sm:p-3 rounded border bg-muted-bg text-sm sm:text-base"
          />
          <input
            type="number"
            name="sort_order"
            value={formData.sort_order || 0}
            onChange={(e) =>
              setFormData({
                ...formData,
                sort_order: parseInt(e.target.value, 10),
              })
            }
            placeholder="Sort Order"
            className="w-full p-2.5 sm:p-3 rounded border bg-muted-bg text-sm sm:text-base"
          />

          {error && (
            <div className="text-danger text-sm p-2 bg-danger/10 rounded">
              <AlertCircle className="inline w-4 h-4 mr-2" />
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-bbcRed text-white rounded-lg font-bold text-sm disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
