import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css"; // Import Quill styles
import { useLayout } from "../../context/LayoutContext";
import type { AdminArticle, Category, Section } from "../../types";
import { adminApi, publicApi } from "../../lib/api";
import { t } from "../../lib/translations";
import { Loader, Save, ExternalLink } from "lucide-react";
import { CustomDropdown } from "../../components/common/CustomDropdown";
import { showToastMsg } from "../../lib/utils"; // Assuming showToastMsg handles toasts

const ArticleEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Article ID for editing, undefined for new
  const navigate = useNavigate();
  const { language } = useLayout();

  const [article, setArticle] = useState<Partial<AdminArticle>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [restoreAlert, setRestoreAlert] = useState(false);

  const quillBnRef = useRef<ReactQuill>(null);
  const quillEnRef = useRef<ReactQuill>(null);

  const storageKey = `article-draft-${id || "new"}`;

  // Fetch initial data (article, categories, sections)
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch categories and sections
        const [categoriesRes, sectionsRes] = await Promise.all([
          adminApi.getCategories(),
          adminApi.getSections(),
        ]);

        if (categoriesRes.success && categoriesRes.data) {
          setCategories(categoriesRes.data);
        }
        if (sectionsRes.success && sectionsRes.data) {
          // Sections type in API returns Section[], but here we only need id and title
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

        // Fetch article if editing
        if (id) {
          const articleRes = await publicApi.getArticle(id, language); // Use publicApi.getArticle for full article data
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
            });
          } else {
            showToastMsg(
              articleRes.error || t("failed_to_load_article", language),
              "error",
            );
            // navigate('/admin/articles'); // Redirect if article not found
          }
        } else {
          // Default values for new article
          setArticle({
            id: `art_${Date.now()}`,
            status: "draft",
            allow_submissions: false,
            image: "",
            category_id: "",
            section_id: "",
          });
        }
      } catch (error) {
        showToastMsg(t("server_error", language), "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, language, navigate]);

  // Autosave Logic
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved && !id) {
      // Only show restore for new articles without an ID yet
      const draft = JSON.parse(saved);
      if (draft.content_bn || draft.content_en) {
        // Check if there's actual content
        setRestoreAlert(true);
      }
    }
  }, [storageKey, id]);

  const autosaveArticle = useCallback(() => {
    const currentArticleData = {
      ...article,
      content_bn: quillBnRef.current?.getEditor?.().root?.innerHTML || "",
      content_en: quillEnRef.current?.getEditor?.().root?.innerHTML || "",
    };
    localStorage.setItem(storageKey, JSON.stringify(currentArticleData));
    // Show toast message instead of using state for display
    // If we implement UI display, we would use the state
  }, [article, storageKey]);

  // Debounced autosave
  useEffect(() => {
    const handler = setTimeout(() => {
      autosaveArticle();
    }, 2000); // Autosave every 2 seconds after last change

    return () => {
      clearTimeout(handler);
    };
  }, [article, autosaveArticle]);

  const restoreDraft = useCallback(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const draft = JSON.parse(saved);
      setArticle((prev) => ({ ...prev, ...draft }));
      showToastMsg(t("draft_restored", language));
      setRestoreAlert(false);
    }
  }, [storageKey, language]);

  // Handle Image Upload for featured image
  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 2 * 1024 * 1024) {
        // Max 2MB
        showToastMsg(t("file_too_large", language), "error");
        return;
      }

      const formData = new FormData();
      formData.append("image", file);

      try {
        // Assuming an uploadImage API exists that returns {success: true, url: string}
        const response = await adminApi.uploadImage(formData); // This API needs to be implemented on PHP side
        if (response.success && response.url) {
          setArticle((prev) => ({ ...prev, image: response.url }));
          showToastMsg(t("image_uploaded_successfully", language));
        } else {
          showToastMsg(
            response.error || t("image_upload_failed", language),
            "error",
          );
        }
      } catch (error) {
        showToastMsg(t("server_error", language), "error");
      }
    },
    [language],
  );

  // Handle form submission
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
      formData.append(
        "content_bn",
        quillBnRef.current?.getEditor?.().root?.innerHTML || "",
      );
      formData.append(
        "content_en",
        quillEnRef.current?.getEditor?.().root?.innerHTML || "",
      );
      formData.append("image", article.image || "");
      formData.append("category_id", article.category_id || "");
      formData.append("sectionId", article.section_id || "");
      formData.append("status", article.status || "draft");
      formData.append(
        "allow_submissions",
        article.allow_submissions ? "1" : "0",
      );

      try {
        const response = await adminApi.saveArticle(formData);
        if (response.success) {
          showToastMsg(t("article_saved_successfully", language));
          localStorage.removeItem(storageKey); // Clear autosave
          if (!id) {
            navigate(`/admin/articles/${response.id}/edit`); // Redirect to edit page for new article
          }
        } else {
          showToastMsg(
            response.error || t("failed_to_save_article", language),
            "error",
          );
        }
      } catch (error) {
        showToastMsg(t("server_error", language), "error");
      } finally {
        setIsSaving(false);
      }
    },
    [article, id, language, navigate, storageKey],
  );

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Loader className="w-10 h-10 animate-spin text-bbcRed" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {id
            ? t("edit_article", language)
            : t("create_new_article_unified", language)}
        </h1>
        {id && (
          <div className="flex gap-2">
            <Link
              to={`/article/${id}?lang=bn`}
              target="_blank"
              className="text-blue-600 hover:underline text-sm flex items-center gap-1"
            >
              {t("view_bn", language)} <ExternalLink className="w-3 h-3" />
            </Link>
            <Link
              to={`/article/${id}?lang=en`}
              target="_blank"
              className="text-blue-600 hover:underline text-sm flex items-center gap-1"
            >
              {t("view_en", language)} <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8 bg-card p-6 rounded-xl border border-border-color shadow-sm">
            <h3 className="font-bold text-lg mb-4 border-b border-border-color pb-2">
              {t("content_unified", language)}
            </h3>

            {/* Title fields */}
            <div>
              <label className="block text-sm font-bold mb-2">
                {t("title_bn", language)}
              </label>
              <input
                name="title_bn"
                value={article.title_bn || ""}
                onChange={(e) =>
                  setArticle((prev) => ({ ...prev, title_bn: e.target.value }))
                }
                required
                className="w-full p-3 rounded-lg border border-border-color bg-card focus:border-bbcRed outline-none font-hind"
                placeholder={t("enter_article_title_bn", language)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                {t("title_en", language)}
              </label>
              <input
                name="title_en"
                value={article.title_en || ""}
                onChange={(e) =>
                  setArticle((prev) => ({ ...prev, title_en: e.target.value }))
                }
                className="w-full p-3 rounded-lg border border-border-color bg-card focus:border-bbcRed outline-none"
                placeholder={t("enter_article_title_en", language)}
              />
            </div>

            {/* Summary fields */}
            <div>
              <label className="block text-sm font-bold mb-2">
                {t("summary_bn", language)}
              </label>
              <textarea
                name="summary_bn"
                rows={3}
                value={article.summary_bn || ""}
                onChange={(e) =>
                  setArticle((prev) => ({
                    ...prev,
                    summary_bn: e.target.value,
                  }))
                }
                className="w-full p-3 rounded-lg border border-border-color bg-card focus:border-bbcRed outline-none font-hind"
                placeholder={t("brief_summary_bn", language)}
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                {t("summary_en", language)}
              </label>
              <textarea
                name="summary_en"
                rows={3}
                value={article.summary_en || ""}
                onChange={(e) =>
                  setArticle((prev) => ({
                    ...prev,
                    summary_en: e.target.value,
                  }))
                }
                className="w-full p-3 rounded-lg border border-border-color bg-card focus:border-bbcRed outline-none"
                placeholder={t("brief_summary_en", language)}
              ></textarea>
            </div>

            {/* Content fields (Quill) */}
            <div>
              <label className="block text-sm font-bold mb-2">
                {t("content_bn", language)}
              </label>
              <ReactQuill
                ref={quillBnRef}
                theme="snow"
                value={article.content_bn || ""}
                onChange={(content) =>
                  setArticle((prev) => ({ ...prev, content_bn: content }))
                }
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ["bold", "italic", "underline", "strike"],
                    ["blockquote", "code-block"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["link", "image"],
                    ["clean"],
                  ],
                }}
                placeholder={t("write_in_bengali", language)}
                className="bg-card h-96 rounded-lg border border-border-color"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                {t("content_en", language)}
              </label>
              <ReactQuill
                ref={quillEnRef}
                theme="snow"
                value={article.content_en || ""}
                onChange={(content) =>
                  setArticle((prev) => ({ ...prev, content_en: content }))
                }
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ["bold", "italic", "underline", "strike"],
                    ["blockquote", "code-block"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["link", "image"],
                    ["clean"],
                  ],
                }}
                placeholder={t("write_in_english", language)}
                className="bg-card h-96 rounded-lg border border-border-color"
              />
            </div>
          </div>

          {/* Sidebar Settings */}
          <div className="space-y-6">
            {restoreAlert && (
              <div
                id="restore-alert"
                className="bg-blue-50 border border-blue-200 rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <Save className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-blue-800">
                      {t("unsaved_draft_found", language)}
                    </h4>
                    <p className="text-xs text-blue-600 mt-1">
                      {t("newer_version_found_in_browser", language)}
                    </p>
                    <button
                      type="button"
                      onClick={restoreDraft}
                      className="mt-2 text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-colors font-bold"
                    >
                      {t("restore_draft", language)}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-card p-5 rounded-xl border border-border-color shadow-sm">
              <h3 className="font-bold mb-4 text-sm uppercase text-muted-text">
                {t("publishing", language)}
              </h3>

              <div className="mb-4">
                <label className="block text-xs font-bold mb-2">
                  {t("status", language)}
                </label>
                <CustomDropdown
                  value={article.status || "draft"}
                  onChange={(value) =>
                    setArticle((prev) => ({
                      ...prev,
                      status: value as AdminArticle["status"],
                    }))
                  }
                  options={[
                    { value: "draft", label: t("draft", language) },
                    { value: "published", label: t("published", language) },
                    { value: "archived", label: t("archived", language) },
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
                    className="form-checkbox text-bbcRed rounded"
                  />
                  <span className="text-sm font-bold text-card-text">
                    {t("allow_user_submissions", language)}
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
                  t("update_all_versions", language)
                ) : (
                  t("publish_article", language)
                )}
              </button>
            </div>

            <div className="bg-card p-5 rounded-xl border border-border-color shadow-sm">
              <h3 className="font-bold mb-4 text-sm uppercase text-muted-text">
                {t("organization", language)}
              </h3>

              <div className="mb-4">
                <label className="block text-xs font-bold mb-2">
                  {t("category", language)}
                </label>
                <select
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
                  <option value="">{t("select_category", language)}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {language === "bn" ? cat.title_bn : cat.title_en}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-bold mb-2">
                  {t("section_homepage", language)}
                </label>
                <CustomDropdown
                  value={article.section_id || ""}
                  onChange={(value) =>
                    setArticle((prev) => ({
                      ...prev,
                      section_id: value,
                    }))
                  }
                  options={[
                    { value: "", label: t("none", language) },
                    ...sections.map((sec) => ({
                      value: sec.id,
                      label:
                        language === "bn"
                          ? sec.title || sec.title
                          : sec.title || sec.title,
                    })),
                  ]}
                />
              </div>
            </div>

            <div className="bg-card p-5 rounded-xl border border-border-color shadow-sm">
              <h3 className="font-bold mb-4 text-sm uppercase text-muted-text">
                {t("media", language)}
              </h3>

              <div className="mb-4">
                <label className="block text-xs font-bold mb-1">
                  {t("featured_image_url", language)}
                </label>
                <input
                  name="image"
                  value={article.image || ""}
                  onChange={(e) =>
                    setArticle((prev) => ({ ...prev, image: e.target.value }))
                  }
                  className="w-full p-2 rounded border border-border-color bg-muted-bg text-sm"
                />
              </div>

              <div className="mb-4">
                <label className="block text-xs font-bold mb-1">
                  {t("or_upload", language)}
                </label>
                <input
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
          </div>
        </div>
      </form>
    </div>
  );
};

export default ArticleEdit;
