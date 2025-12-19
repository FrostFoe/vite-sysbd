import {
  Edit,
  ExternalLink,
  FileText,
  Loader,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { adminApi, publicApi } from "../../api";
import { DocumentModal } from "../../components/admin/DocumentModal";
import { CustomEditor } from "../../components/common";
import { CustomDropdown } from "../../components/common/CustomDropdown";
import { DANGEROUS_FILE_EXTENSIONS } from "../../config";
import { useLayout } from "../../context/LayoutContext";
import type {
  AdminArticle,
  Category,
  Document as DocType,
  Section,
} from "../../types";
import { showToastMsg } from "../../utils";

const ArticleEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLayout();

  const [article, setArticle] = useState<Partial<AdminArticle>>({});
  const [documents, setDocuments] = useState<DocType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [restoreAlert, setRestoreAlert] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocType | null>(null);

  const contentBnRef = useRef<string>("");
  const contentEnRef = useRef<string>("");

  const storageKey = `article-draft-${id || "new"}`;

  const fetchDocuments = useCallback(async () => {
    if (!id) return;
    try {
      const res = await adminApi.getArticleDocuments(id);
      if (res.success) {
        setDocuments(res.documents || []);
      }
    } catch (_error) {
      showToastMsg("Failed to load documents", "error");
    }
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [categoriesRes, sectionsRes] = await Promise.all([
          adminApi.getCategories(),
          adminApi.getSections(),
        ]);

        if (categoriesRes.success && categoriesRes.data) {
          setCategories(categoriesRes.data);
        }
        if (sectionsRes.success && sectionsRes.data) {
          setSections(
            sectionsRes.data.map(
              (s) =>
                ({
                  ...s,
                  title: s.title || "Untitled Section",
                }) as unknown as Section,
            ),
          );
        }

        if (id) {
          await fetchDocuments();
          const articleRes = await publicApi.getArticle(id, language);
          if (articleRes.success && articleRes.article) {
            setArticle({
              id: articleRes.article.id,
              title_bn: articleRes.article.title_bn || "",
              title_en: articleRes.article.title_en || "",
              summary_bn: articleRes.article.summary_bn || "",
              summary_en: articleRes.article.summary_en || "",
              content_bn: articleRes.article.content_bn || "",
              content_en: articleRes.article.content_en || "",
              image: articleRes.article.image || "",
              category_id: articleRes.article.category_id || "",
              section_id: articleRes.article.section_id || "",
              status: articleRes.article.status,
              allow_submissions: articleRes.article.allow_submissions,
              meta_title: articleRes.article.meta_title || "",
              meta_description: articleRes.article.meta_description || "",
              meta_keywords: articleRes.article.meta_keywords || "",
            });
          } else {
            showToastMsg(
              articleRes.error || "নিবন্ধ লোড করতে ব্যর্থ হয়েছে।",
              "error",
            );
          }
        } else {
          setArticle({
            id: `art_${Date.now()}`,
            status: "draft",
            allow_submissions: false,
            image: "",
            category_id: "",
            section_id: "",
          });
        }
      } catch (_error) {
        showToastMsg("সার্ভার ত্রুটি!", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, fetchDocuments, language]);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved && !id) {
      const draft = JSON.parse(saved);
      if (draft.content_bn || draft.content_en) {
        setRestoreAlert(true);
      }
    }
  }, [storageKey, id]);

  const autosaveArticle = useCallback(() => {
    const currentArticleData = {
      ...article,
      content_bn: contentBnRef.current,
      content_en: contentEnRef.current,
    };
    localStorage.setItem(storageKey, JSON.stringify(currentArticleData));
  }, [article, storageKey]);

  useEffect(() => {
    const handler = setTimeout(() => {
      autosaveArticle();
    }, 2000);

    return () => {
      clearTimeout(handler);
    };
  }, [autosaveArticle]);

  const restoreDraft = useCallback(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const draft = JSON.parse(saved);
      setArticle((prev) => ({ ...prev, ...draft }));
      showToastMsg("খসড়া সফলভাবে পুনরুদ্ধার করা হয়েছে!");
      setRestoreAlert(false);
    }
  }, [storageKey]);

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
      if (DANGEROUS_FILE_EXTENSIONS.includes(fileExtension)) {
        showToastMsg(
          `File type not allowed (potentially dangerous): .${fileExtension}`,
          "error",
        );
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        showToastMsg("ফাইল খুব বড়! সর্বোচ্চ ২এমবি।", "error");
        return;
      }

      const formData = new FormData();
      formData.append("image", file);

      try {
        const response = await adminApi.uploadImage(formData);
        if (response.success && response.url) {
          setArticle((prev) => ({ ...prev, image: response.url }));
          showToastMsg("ছবি সফলভাবে আপলোড করা হয়েছে!");
        } else {
          showToastMsg(response.error || "ছবি আপলোডে ব্যর্থ!", "error");
        }
      } catch (_error) {
        showToastMsg("সার্ভার ত্রুটি!", "error");
      }
    },
    [],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSaving(true);

      const formData = new FormData();
      const articleId = article.id || `art_${Date.now()}`;
      formData.append("id", articleId);
      formData.append("title_bn", article.title_bn || "");
      formData.append("title_en", article.title_en || "");
      formData.append("summary_bn", article.summary_bn || "");
      formData.append("summary_en", article.summary_en || "");
      formData.append("content_bn", contentBnRef.current);
      formData.append("content_en", contentEnRef.current);
      formData.append("image", article.image || "");
      formData.append("category_id", article.category_id || "");
      formData.append("sectionId", article.section_id || "");
      formData.append("status", article.status || "draft");
      formData.append("meta_title", article.meta_title || "");
      formData.append("meta_description", article.meta_description || "");
      formData.append("meta_keywords", article.meta_keywords || "");
      formData.append(
        "allow_submissions",
        article.allow_submissions ? "1" : "0",
      );

      try {
        const response = await adminApi.saveArticle(formData);
        if (response.success) {
          showToastMsg("নিবন্ধ সফলভাবে সংরক্ষিত হয়েছে!");
          localStorage.removeItem(storageKey);
          if (!id) {
            navigate(`/admin/articles/${response.id}/edit`);
          }
        } else {
          showToastMsg(
            response.error || "নিবন্ধ সংরক্ষণ করতে ব্যর্থ হয়েছে!",
            "error",
          );
        }
      } catch (_error) {
        showToastMsg("সার্ভার ত্রুটি!", "error");
      } finally {
        setIsSaving(false);
      }
    },
    [article, id, navigate, storageKey],
  );

  const handleOpenModal = async (doc: DocType | null) => {
    if (!id) return;
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
    await fetchDocuments();
    handleCloseModal();
  };

  const handleDelete = async (docId: string) => {
    if (window.confirm("আপনি কি নিশ্চিত যে আপনি এই নথিটি মুছে ফেলতে চান?")) {
      try {
        await adminApi.deleteDocument(docId);
        await fetchDocuments();
      } catch (_error) {}
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Loader className="w-10 h-10 animate-spin text-bbcRed" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-2xl font-bold">
          {id ? "নিবন্ধ সম্পাদনা করুন" : "নতুন নিবন্ধ তৈরি করুন (একত্রিত)"}
        </h1>
        {id && (
          <div className="flex gap-2 text-xs sm:text-sm">
            <Link
              to={`/article/${id}?lang=bn`}
              target="_blank"
              className="text-card-text hover:underline flex items-center gap-1 whitespace-nowrap"
            >
              (BN) দেখুন <ExternalLink className="w-3 h-3" />
            </Link>
            <Link
              to={`/article/${id}?lang=en`}
              target="_blank"
              className="text-card-text hover:underline flex items-center gap-1 whitespace-nowrap"
            >
              (EN) দেখুন <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 bg-card p-3 sm:p-4 md:p-6 rounded-xl border border-border-color shadow-sm">
            <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 border-b border-border-color pb-2">
              বিষয়বস্তু (একত্রিত)
            </h3>

            {}
            <div>
              <label
                htmlFor="title-bn"
                className="block text-sm font-bold mb-2"
              >
                শিরোনাম (বাংলা)
              </label>
              <input
                id="title-bn"
                name="title_bn"
                value={article.title_bn || ""}
                onChange={(e) =>
                  setArticle((prev) => ({ ...prev, title_bn: e.target.value }))
                }
                required
                className="w-full p-3 sm:p-2.5 rounded-lg border border-border-color bg-card focus:border-bbcRed outline-none font-hind text-sm sm:text-base"
                placeholder="নিবন্ধের শিরোনাম লিখুন..."
              />
            </div>

            <div>
              <label
                htmlFor="title-en"
                className="block text-sm font-bold mb-2"
              >
                শিরোনাম (ইংরেজি)
              </label>
              <input
                id="title-en"
                name="title_en"
                value={article.title_en || ""}
                onChange={(e) =>
                  setArticle((prev) => ({ ...prev, title_en: e.target.value }))
                }
                className="w-full p-3 sm:p-2.5 rounded-lg border border-border-color bg-card focus:border-bbcRed outline-none font-hind text-sm sm:text-base"
                placeholder="Enter article title..."
              />
            </div>

            {}
            <div>
              <label
                htmlFor="summary-bn"
                className="block text-sm font-bold mb-2"
              >
                সংক্ষিপ্ত সারসংক্ষেপ (বাংলা)
              </label>
              <textarea
                id="summary-bn"
                name="summary_bn"
                rows={3}
                value={article.summary_bn || ""}
                onChange={(e) =>
                  setArticle((prev) => ({
                    ...prev,
                    summary_bn: e.target.value,
                  }))
                }
                className="w-full p-3 sm:p-2.5 rounded-lg border border-border-color bg-card focus:border-bbcRed outline-none font-hind text-sm sm:text-base"
                placeholder="সংক্ষিপ্ত সারসংক্ষেপ..."
              />
            </div>

            <div>
              <label
                htmlFor="summary-en"
                className="block text-sm font-bold mb-2"
              >
                সংক্ষিপ্ত সারসংক্ষেপ (ইংরেজি)
              </label>
              <textarea
                id="summary-en"
                name="summary_en"
                rows={3}
                value={article.summary_en || ""}
                onChange={(e) =>
                  setArticle((prev) => ({
                    ...prev,
                    summary_en: e.target.value,
                  }))
                }
                className="w-full p-3 sm:p-2.5 rounded-lg border border-border-color bg-card focus:border-bbcRed outline-none font-hind text-sm sm:text-base"
                placeholder="Brief summary..."
              />
            </div>

            {}
            <div>
              <label
                htmlFor="content-bn"
                className="block text-sm font-bold mb-2"
              >
                বিষয়বস্তু (বাংলা)
              </label>
              <CustomEditor
                value={article.content_bn || ""}
                onChange={(content: string) => {
                  contentBnRef.current = content;
                  setArticle((prev) => ({ ...prev, content_bn: content }));
                }}
                placeholder="বাংলায় লিখুন..."
                height="400px"
                className="w-full rounded-lg border border-border-color bg-card focus:border-bbcRed"
              />
            </div>

            <div>
              <label
                htmlFor="content-en"
                className="block text-sm font-bold mb-2"
              >
                বিষয়বস্তু (ইংরেজি)
              </label>
              <CustomEditor
                value={article.content_en || ""}
                onChange={(content: string) => {
                  contentEnRef.current = content;
                  setArticle((prev) => ({ ...prev, content_en: content }));
                }}
                placeholder="Write in English..."
                height="400px"
                className="w-full rounded-lg border border-border-color bg-card focus:border-bbcRed"
              />
            </div>
          </div>

          {}
          <div className="space-y-6">
            {restoreAlert && (
              <div
                id="restore-alert"
                className="bg-muted-bg border border-border-color rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <Save className="w-5 h-5 text-card-text mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-card-text">
                      অসংরক্ষিত খসড়া পাওয়া গেছে
                    </h4>
                    <p className="text-xs text-card-text mt-1">
                      আপনার ব্রাউজারে এই নিবন্ধটির একটি নতুন সংস্করণ পাওয়া
                      গেছে।
                    </p>
                    <button
                      type="button"
                      onClick={restoreDraft}
                      className="mt-2 text-xs bg-card text-card-text px-3 py-1.5 rounded hover:bg-card/90 transition-colors font-bold"
                    >
                      খসড়া পুনরুদ্ধার করুন
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-card p-4 rounded-xl border border-border-color shadow-sm">
              <h3 className="font-bold mb-3 text-sm uppercase text-muted-text">
                SEO Metadata (এসইও মেটাডেটা)
              </h3>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold">
                    Meta Title (মেটা শিরোনাম)
                  </label>
                  <span
                    className={`text-[10px] font-bold ${
                      (article.meta_title?.length || 0) > 60
                        ? "text-danger"
                        : "text-muted-text"
                    }`}
                  >
                    {article.meta_title?.length || 0}/60
                  </span>
                </div>
                <input
                  name="meta_title"
                  value={article.meta_title || ""}
                  onChange={(e) =>
                    setArticle((prev) => ({
                      ...prev,
                      meta_title: e.target.value,
                    }))
                  }
                  className="w-full p-2 rounded border border-border-color bg-muted-bg text-sm focus:border-bbcRed outline-none"
                  placeholder="SEO Title (Google Search)"
                />
              </div>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold">
                    Meta Description (মেটা বর্ণনা)
                  </label>
                  <span
                    className={`text-[10px] font-bold ${
                      (article.meta_description?.length || 0) > 160
                        ? "text-danger"
                        : "text-muted-text"
                    }`}
                  >
                    {article.meta_description?.length || 0}/160
                  </span>
                </div>
                <textarea
                  name="meta_description"
                  value={article.meta_description || ""}
                  onChange={(e) =>
                    setArticle((prev) => ({
                      ...prev,
                      meta_description: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full p-2 rounded border border-border-color bg-muted-bg text-sm focus:border-bbcRed outline-none"
                  placeholder="Short description for search results..."
                />
              </div>
              <div className="mb-4">
                <label className="block text-xs font-bold mb-1">
                  Meta Keywords (কিওয়ার্ড)
                </label>
                <input
                  name="meta_keywords"
                  value={article.meta_keywords || ""}
                  onChange={(e) =>
                    setArticle((prev) => ({
                      ...prev,
                      meta_keywords: e.target.value,
                    }))
                  }
                  className="w-full p-2 rounded border border-border-color bg-muted-bg text-sm focus:border-bbcRed outline-none"
                  placeholder="news, bangladesh, politics (comma separated)"
                />
              </div>
            </div>

            <div className="bg-card p-4 rounded-xl border border-border-color shadow-sm">
              <h3 className="font-bold mb-3 text-sm uppercase text-muted-text">
                প্রকাশনা
              </h3>

              <div className="mb-4">
                <label
                  htmlFor="status-dropdown"
                  className="block text-xs font-bold mb-2"
                >
                  স্থিতি
                </label>
                <CustomDropdown
                  id="status-dropdown"
                  value={article.status || "draft"}
                  onChange={(value) =>
                    setArticle((prev) => ({
                      ...prev,
                      status: value as AdminArticle["status"],
                    }))
                  }
                  options={[
                    { value: "draft", label: "খসড়া" },
                    { value: "published", label: "প্রকাশিত" },
                    { value: "archived", label: "আর্কাইভ করা হয়েছে" },
                  ]}
                />
              </div>

              <div className="mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="allow_submissions"
                    checked={article.allow_submissions || false}
                    onChange={(e) =>
                      setArticle((prev) => ({
                        ...prev,
                        allow_submissions: e.target.checked,
                      }))
                    }
                    className="form-checkbox h-5 w-5 text-bbcRed rounded"
                  />
                  <span className="text-sm font-bold text-card-text">
                    ব্যবহারকারী জমা দেওয়ার অনুমতি দিন
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-bbcRed text-white py-3 rounded-lg font-bold hover:opacity-90 transition-opacity text-sm uppercase tracking-wide"
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader className="w-4 h-4 inline animate-spin" />
                ) : id ? (
                  "সমস্ত সংস্করণ আপডেট করুন"
                ) : (
                  "নিবন্ধ প্রকাশ করুন"
                )}
              </button>
            </div>

            <div className="bg-card p-4 rounded-xl border border-border-color shadow-sm">
              <h3 className="font-bold mb-3 text-sm uppercase text-muted-text">
                সংগঠন
              </h3>

              <div className="mb-4">
                <label
                  htmlFor="category-dropdown"
                  className="block text-xs font-bold mb-2"
                >
                  বিভাগ
                </label>
                <select
                  id="category-dropdown"
                  name="category_id"
                  value={article.category_id || ""}
                  onChange={(e) =>
                    setArticle((prev) => ({
                      ...prev,
                      category_id: e.target.value,
                    }))
                  }
                  className="custom-select w-full p-2.5 rounded-lg border border-border-color bg-card text-card-text text-sm"
                >
                  <option value="">বিভাগ নির্বাচন করুন</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.title_bn}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="section-dropdown"
                  className="block text-xs font-bold mb-2"
                >
                  অনুচ্ছেদ (হোমপেজ)
                </label>
                <CustomDropdown
                  id="section-dropdown"
                  value={article.section_id || ""}
                  onChange={(value) =>
                    setArticle((prev) => ({
                      ...prev,
                      section_id: value,
                    }))
                  }
                  options={[
                    { value: "", label: "কিছুই না" },
                    ...sections.map((sec) => ({
                      value: sec.id,
                      label: sec.title || sec.title,
                    })),
                  ]}
                />
              </div>
            </div>

            <div className="bg-card p-4 rounded-xl border border-border-color shadow-sm">
              <h3 className="font-bold mb-3 text-sm uppercase text-muted-text">
                মিডিয়া
              </h3>

              <div className="mb-4">
                <label
                  htmlFor="featured-image-url"
                  className="block text-xs font-bold mb-1"
                >
                  বৈশিষ্ট্যযুক্ত ছবির URL
                </label>
                <input
                  id="featured-image-url"
                  name="image"
                  value={article.image || ""}
                  onChange={(e) =>
                    setArticle((prev) => ({ ...prev, image: e.target.value }))
                  }
                  className="w-full p-2 rounded border border-border-color bg-muted-bg text-sm"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="image-upload"
                  className="block text-xs font-bold mb-1"
                >
                  অথবা আপলোড করুন
                </label>
                <input
                  id="image-upload"
                  type="file"
                  onChange={handleImageUpload}
                  className="w-full text-xs"
                />
              </div>

              <div className="aspect-video bg-muted-bg rounded overflow-hidden">
                <img
                  id="image-preview"
                  src={article.image || ""}
                  alt="Preview"
                  className={`w-full h-full object-cover ${!article.image ? "opacity-50" : ""}`}
                />
              </div>
            </div>
            {id && (
              <div className="bg-card p-4 rounded-xl border border-border-color shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-sm uppercase text-muted-text">
                    ডাউনলোডযোগ্য নথি
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleOpenModal(null)}
                    className="text-bbcRed hover:underline text-sm font-bold flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    নথি যোগ করুন
                  </button>
                </div>
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between bg-muted-bg p-2 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-muted-text" />
                        <span className="text-sm font-medium">
                          {doc.display_name_en || doc.display_name_bn}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenModal(doc)}
                          className="p-1.5 hover:bg-black/10 rounded-md"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(doc.id)}
                          className="p-1.5 hover:bg-danger/10 text-danger rounded-md"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {documents.length === 0 && (
                    <p className="text-sm text-muted-text text-center py-4">
                      কোনো নথি সংযুক্ত করা হয়নি।
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
      {isModalOpen && id && (
        <DocumentModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSave}
          articleId={id}
          doc={editingDoc}
        />
      )}
    </div>
  );
};

export default ArticleEdit;
