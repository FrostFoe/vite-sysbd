import { Edit2, FileText, Loader, Plus, Search, Trash2 } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CustomDropdown } from "../../components/common/CustomDropdown";
import { useLayout } from "../../context/LayoutContext";
import { adminApi } from "../../lib/api";
import { t } from "../../lib/translations";
import {
  escapeHtml,
  formatTimestamp,
  PLACEHOLDER_IMAGE,
  showToastMsg,
} from "../../lib/utils";
import type { AdminArticle, Category } from "../../types";

const ArticleList: React.FC = () => {
  const { language } = useLayout();
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const currentStatus = searchParams.get("status") || "all";
  const currentSearch = searchParams.get("search") || "";
  const currentCategoryFilter = searchParams.get("cat") || "";

  const fetchArticles = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getArticles({
        status: currentStatus,
        search: currentSearch,
        cat: currentCategoryFilter,
        lang: language,
      });
      if (response.success && response.articles) {
        setArticles(response.articles);
      }
    } catch (error) {
      console.error("Failed to fetch articles:", error);
      showToastMsg(t("server_error", language), "error");
    } finally {
      setIsLoading(false);
    }
  }, [currentStatus, currentSearch, currentCategoryFilter, language]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await adminApi.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      showToastMsg(t("server_error", language), "error");
    }
  }, [language]);

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, [fetchArticles, fetchCategories]);

  const handleDeleteArticle = useCallback(
    async (id: string) => {
      if (!window.confirm(t("confirm_delete_article", language))) return;
      try {
        const response = await adminApi.deleteArticle(id);
        if (response.success) {
          showToastMsg(t("article_deleted_successfully", language));
          setArticles((prev) => prev.filter((article) => article.id !== id));
        } else {
          showToastMsg(
            response.error || t("failed_to_delete_article", language),
            "error",
          );
        }
      } catch (error) {
        console.error("Delete article error:", error);
        showToastMsg(t("server_error", language), "error");
      }
    },
    [language],
  );

  const handleFilterChange = (
    type: "search" | "cat" | "status",
    value: string,
  ) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (value) {
      newParams.set(type, value);
    } else {
      newParams.delete(type);
    }
    setSearchParams(newParams);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Loader className="w-10 h-10 animate-spin text-bbcRed" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">{t("manage_articles", language)}</h1>

        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          {/* Filter Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // Filters are already applied via handleFilterChange
            }}
            className="flex gap-2 w-full md:w-auto"
          >
            <input
              type="text"
              name="search"
              placeholder={t("search_articles", language)}
              value={currentSearch}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="p-2.5 sm:p-2 rounded border border-border-color bg-card text-sm w-full md:w-48 focus:border-bbcRed outline-none"
            />

            <CustomDropdown
              value={currentCategoryFilter}
              onChange={(value) => handleFilterChange("cat", value)}
              options={[
                { value: "", label: t("all_categories", language) },
                ...categories.map((c) => ({
                  value: c.id,
                  label: language === "bn" ? c.title_bn : c.title_en,
                })),
              ]}
              className="w-32 md:w-40"
            />

            <button
              type="submit"
              className="bg-muted-bg p-2 rounded hover:bg-bbcRed hover:text-white transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          <Link
            to="/admin/articles/new"
            className="bg-bbcRed text-white px-4 py-2 rounded-lg font-bold hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap justify-center"
          >
            <Plus className="w-4 h-4" />{" "}
            <span className="hidden sm:inline">{t("new", language)}</span>
          </Link>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border-color shadow-sm overflow-hidden">
        {articles.length === 0 ? (
          <div className="p-8 text-center text-muted-text">
            <FileText className="w-16 h-16 mx-auto mb-4 text-border-color" />
            <p className="text-lg font-bold mb-2">
              {t("no_articles_found", language)}
            </p>
            <p className="text-sm mb-4">
              {t("no_articles_matching_criteria", language)}
            </p>
            <Link
              to="/admin/articles/new"
              className="bg-bbcRed text-white px-4 py-2 rounded-lg font-bold hover:opacity-90 transition-opacity flex items-center gap-2 w-fit mx-auto"
            >
              <Plus className="w-4 h-4" /> {t("create_new_article", language)}
            </Link>
          </div>
        ) : (
          <table className="w-full text-left border-collapse responsive-table">
            <thead className="bg-muted-bg text-muted-text text-xs uppercase">
              <tr>
                <th className="p-3 sm:p-4">{t("article", language)}</th>
                <th className="hidden md:table-cell p-3 sm:p-4">
                  {t("status", language)}
                </th>
                <th className="hidden md:table-cell p-3 sm:p-4">
                  {t("category", language)}
                </th>
                <th className="hidden md:table-cell p-3 sm:p-4">
                  {t("date", language)}
                </th>
                <th className="p-3 sm:p-4 text-right">
                  {t("actions", language)}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {articles.map((a) => {
                const statusColors: { [key: string]: string } = {
                  published: "bg-green-100 text-green-700 border-green-200",
                  draft: "bg-yellow-100 text-yellow-700 border-yellow-200",
                  archived: "bg-gray-100 text-gray-700 border-gray-200",
                };
                const colorClass = statusColors[a.status] || statusColors.draft;
                const pubDate = formatTimestamp(a.published_at, language);
                const createdDate = formatTimestamp(a.created_at, language);

                return (
                  <tr
                    key={a.id}
                    className="hover:bg-muted-bg transition-colors"
                  >
                    <td className="p-3 sm:p-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={a.image || PLACEHOLDER_IMAGE}
                          alt=""
                          className="w-12 h-12 rounded object-cover bg-gray-200"
                        />
                        <div className="max-w-[120px] sm:max-w-md">
                          {a.title_bn && (
                            <Link
                              to={`/admin/articles/${a.id}/edit`}
                              className="font-bold text-sm block hover:text-bbcRed line-clamp-1 font-hind mb-0.5 truncate"
                            >
                              {escapeHtml(a.title_bn)}
                            </Link>
                          )}
                          {a.title_en && (
                            <span className="text-xs text-muted-text block line-clamp-1 truncate">
                              {escapeHtml(a.title_en)}
                            </span>
                          )}
                          {!a.title_bn && !a.title_en && (
                            <span className="text-xs italic text-muted-text">
                              ({t("no_title", language)})
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell p-3 sm:p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold border ${colorClass}`}
                      >
                        {escapeHtml(a.status)}
                      </span>
                    </td>
                    <td className="hidden md:table-cell p-3 sm:p-4 text-sm">
                      <div className="flex flex-col max-w-[120px] truncate">
                        <span className="font-hind truncate">
                          {a.category || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="hidden md:table-cell p-3 sm:p-4 text-xs text-muted-text">
                      <div className="flex flex-col">
                        <span>
                          {t("pub", language)}: {pubDate}
                        </span>
                        <span className="opacity-70">
                          {t("cr", language)}: {createdDate}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 sm:p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/articles/${a.id}/edit`}
                          className="p-2 text-card-text hover:bg-muted-bg rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteArticle(a.id)}
                          className="p-2 text-danger hover:bg-danger/10 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default ArticleList;
