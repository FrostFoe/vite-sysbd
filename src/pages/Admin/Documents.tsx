import {
  AlertCircle,
  Edit2,
  FileText,
  Inbox,
  List,
  Plus,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { adminApi } from "../../lib/api";
import type { ArticleWithDocCount, Document as DocType } from "../../types";

const Documents: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedArticleId = searchParams.get("article_id");

  const [articles, setArticles] = useState<ArticleWithDocCount[]>([]);
  const [documents, setDocuments] = useState<DocType[]>([]);
  const [selectedArticleTitle, setSelectedArticleTitle] = useState("");

  const [isLoadingArticles, setIsLoadingArticles] = useState(true);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);

  const [isModalOpen, setModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocType | null>(null);

  const fetchArticles = useCallback(async () => {
    setIsLoadingArticles(true);
    try {
      const res = await adminApi.getArticlesForDocs();
      if (res.success) {
        setArticles(res.data || []);
      }
    } catch (_error) {
    } finally {
      setIsLoadingArticles(false);
    }
  }, []);

  const fetchDocuments = useCallback(
    async (articleId: string) => {
      setIsLoadingDocuments(true);
      try {
        const res = await adminApi.getArticleDocuments(articleId);
        if (res.success) {
          setDocuments(res.documents || []);
          const selected = articles.find((a) => a.id === articleId);
          setSelectedArticleTitle(
            selected?.title_en || selected?.title_bn || ""
          );
        }
      } catch (_error) {
      } finally {
        setIsLoadingDocuments(false);
      }
    },
    [articles]
  );

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  useEffect(() => {
    if (selectedArticleId) {
      if (articles.length > 0) {
        fetchDocuments(selectedArticleId);
      }
    } else {
      setDocuments([]);
      setSelectedArticleTitle("");
    }
  }, [selectedArticleId, articles, fetchDocuments]);

  const handleSelectArticle = (articleId: string) => {
    setSearchParams({ article_id: articleId });
  };

  const handleOpenModal = async (doc: DocType | null) => {
    if (!selectedArticleId) return;
    if (doc) {
      const res = await adminApi.getDocument(doc.id);
      if (res.success && res.document) {
        setEditingDoc(res.document);
      } else {
        return;
      }
    } else {
      setEditingDoc(null);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingDoc(null);
  };

  const handleSave = async () => {
    if (selectedArticleId) {
      await fetchDocuments(selectedArticleId);
    }
    await fetchArticles();
    handleCloseModal();
  };

  const handleDelete = async (docId: string) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        await adminApi.deleteDocument(docId);
        if (selectedArticleId) {
          fetchDocuments(selectedArticleId);
        }
        fetchArticles();
      } catch (_error) {}
    }
  };

  return (
    <div>
      {isModalOpen && selectedArticleId && (
        <DocumentModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSave}
          articleId={selectedArticleId}
          doc={editingDoc}
        />
      )}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <FileText className="w-8 h-8 text-bbcRed" />
          Documents Manager
        </h1>
        <p className="text-muted-text mt-2">
          Manage downloadable files for your articles
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Articles Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-card p-4 rounded-xl shadow-sm border border-border-color h-fit lg:sticky top-24">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <List className="w-5 h-5 text-bbcRed" />
              Articles
            </h3>
            <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
              {isLoadingArticles ? (
                <p>Loading articles...</p>
              ) : (
                articles.map((article) => (
                  <button
                    type="button"
                    key={article.id}
                    onClick={() => handleSelectArticle(article.id)}
                    className={`w-full text-left p-3 rounded-lg hover:bg-muted-bg transition-all border-2 ${selectedArticleId === article.id ? "border-bbcRed bg-danger/5" : "border-transparent"}`}
                  >
                    <div className="font-bold text-sm truncate">
                      {article.title_en || article.title_bn}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-text font-mono">
                        {article.id.substring(0, 10)}
                      </span>
                      <span className="text-xs bg-bbcRed/20 text-bbcRed px-2 py-0.5 rounded font-bold">
                        {article.doc_count} docs
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Documents Content */}
        <div className="lg:col-span-3">
          {!selectedArticleId ? (
            <div className="bg-card p-12 rounded-xl shadow-sm border border-border-color text-center">
              <Inbox className="w-16 h-16 mx-auto text-border-color opacity-40 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Select an Article</h2>
              <p className="text-muted-text">
                Choose an article from the left to manage its documents.
              </p>
            </div>
          ) : isLoadingDocuments ? (
            <div className="bg-card p-12 rounded-xl text-center">
              Loading documents...
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-card p-6 rounded-xl shadow-sm border flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold break-words">
                    {selectedArticleTitle}
                  </h2>
                  <p className="text-muted-text text-sm mt-1">
                    ID: <span className="font-mono">{selectedArticleId}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenModal(null)}
                  className="bg-bbcRed text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Document
                </button>
              </div>
              {documents.length === 0 ? (
                <div className="bg-card p-12 rounded-xl text-center border">
                  <h3 className="text-lg font-bold mb-2">No documents yet</h3>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-card p-4 rounded-xl border border-border-color group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-muted-bg flex items-center justify-center shrink-0 border border-border-color font-bold text-card-text text-xs">
                            {doc.file_type
                              .split("/")[1]
                              ?.substring(0, 3)
                              .toUpperCase() || "FILE"}
                          </div>
                          <div className="truncate">
                            <h4 className="font-bold text-sm truncate">
                              {doc.display_name_en || doc.display_name_bn}
                            </h4>
                            <p className="text-xs text-muted-text">
                              {doc.file_type}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <button
                            type="button"
                            onClick={() => handleOpenModal(doc)}
                            className="p-2 hover:bg-muted-bg rounded-lg"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(doc.id)}
                            className="p-2 hover:bg-danger/10 text-danger rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-muted-text">
                        Size:{" "}
                        {doc.file_size
                          ? `${(doc.file_size / 1024).toFixed(1)} KB`
                          : "N/A"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DocumentModal: React.FC<{
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

export default Documents;
