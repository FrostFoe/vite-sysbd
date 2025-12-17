import { Edit2, FileText, Loader, Plus, Search, Trash2 } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CustomDropdown } from "../../components/common/CustomDropdown";
import { useLayout } from "../../context/LayoutContext";
import { adminApi } from "../../lib/api";
import {
  formatTimestamp,
  handleItemSelect,
  PLACEHOLDER_IMAGE,
  showToastMsg,
} from "../../lib/utils";
import type { AdminArticle, Category } from "../../types";

const ArticleList: React.FC = () => {
  const { language } = useLayout();
  const navigate = useNavigate();
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
        lang: "bn",
      });
      if (response.success && response.articles) {
        setArticles(response.articles);
      }
    } catch (_error) {
      // Failed to fetch articles
      showToastMsg("সার্ভার ত্রুটি!", "error");
    } finally {
      setIsLoading(false);
    }
  }, [currentStatus, currentSearch, currentCategoryFilter]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await adminApi.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (_error) {
      // Failed to fetch categories
      showToastMsg("সার্ভার ত্রুটি!", "error");
    }
  }, []);

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, [fetchArticles, fetchCategories]);

  const handleDeleteArticle = useCallback(async (id: string) => {
    if (
      !window.confirm(
        "আপনি কি নিশ্চিত এই নিবন্ধটি মুছে ফেলতে চান? এটি উভয় ভাষার সংস্করণ মুছে দেবে।"
      )
    )
      return;
    try {
      const response = await adminApi.deleteArticle(id);
      if (response.success) {
        showToastMsg("নিবন্ধ সফলভাবে মুছে ফেলা হয়েছে");
        setArticles((prev) => prev.filter((article) => article.id !== id));
      } else {
        showToastMsg(response.error || "নিবন্ধ মোছতে ব্যর্থ!", "error");
      }
    } catch (_error) {
      // Delete article error occurred
      showToastMsg("সার্ভার ত্রুটি!", "error");
    }
  }, []);

  const handleFilterChange = (
    type: "search" | "cat" | "status",
    value: string
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">নিবন্ধ পরিচালনা করুন</h1>

        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          {/* Filter Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            className="flex gap-2 w-full md:w-auto flex-wrap sm:flex-nowrap"
          >
            <input
              type="text"
              name="search"
              placeholder="নিবন্ধ খুঁজুন..."
              value={currentSearch}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="p-2 sm:p-2.5 rounded border border-border-color bg-card text-xs sm:text-sm w-full sm:w-auto md:w-48 focus:border-bbcRed outline-none"
            />

            <CustomDropdown
              value={currentCategoryFilter}
              onChange={(value) => handleFilterChange("cat", value)}
              options={[
                { value: "", label: "সকল বিভাগ" },
                ...categories.map((c) => ({
                  value: c.id,
                  label: c.title_bn,
                })),
              ]}
              className="w-full sm:w-32 md:w-40"
            />

            <button
              type="submit"
              className="bg-muted-bg p-2 rounded hover:bg-bbcRed hover:text-white transition-colors flex-shrink-0"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          <Link
            to="/admin/articles/new"
            className="bg-bbcRed text-white px-4 py-2 rounded-lg font-bold hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap justify-center"
          >
            <Plus className="w-4 h-4" />{" "}
            <span className="hidden sm:inline">নতুন</span>
          </Link>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border-color shadow-sm overflow-hidden">
        {articles.length === 0 ? (
          <div className="p-8 text-center text-muted-text">
            <FileText className="w-16 h-16 mx-auto mb-4 text-border-color" />
            <p className="text-lg font-bold mb-2">কোনো নিবন্ধ পাওয়া যায়নি</p>
            <p className="text-sm mb-4">
              আপনার মানদণ্ডের সাথে মেলে এমন কোনো নিবন্ধ নেই।
            </p>
            <Link
              to="/admin/articles/new"
              className="bg-bbcRed text-white px-4 py-2 rounded-lg font-bold hover:opacity-90 transition-opacity flex items-center gap-2 w-fit mx-auto"
            >
              <Plus className="w-4 h-4" /> নতুন নিবন্ধ তৈরি করুন
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4">
            {articles.map((a) => {
              const statusColors: { [key: string]: string } = {
                published:
                  "bg-success/10 dark:bg-success/20 text-success border-success/30 dark:border-success/50",
                draft:
                  "bg-warning/10 dark:bg-warning/20 text-warning border-warning/30 dark:border-warning/50",
                archived:
                  "bg-danger/10 dark:bg-danger/20 text-danger border-danger/30 dark:border-danger/50",
              };
              const colorClass = statusColors[a.status] || statusColors.draft;
              const pubDate = formatTimestamp(a.published_at, language);
              const createdDate = formatTimestamp(a.created_at, language);

              return (
                <button
                  key={a.id}
                  onClick={() =>
                    handleItemSelect(
                      window.innerWidth < 768,
                      navigate,
                      `/admin/articles/${a.id}/edit`
                    )
                  }
                  type="button"
                  className="bg-card p-4 rounded-lg border border-border-color group hover:bg-muted-bg transition-colors cursor-pointer w-full text-left"
                >
                  <div className="flex items-start justify-between mb-3 gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <img
                        src={a.image || PLACEHOLDER_IMAGE}
                        alt=""
                        className="w-12 h-12 rounded object-cover bg-muted-bg shrink-0"
                      />
                      <div className="truncate flex-1">
                        <Link
                          to={`/admin/articles/${a.id}/edit`}
                          className="font-bold text-sm block hover:text-bbcRed truncate font-hind"
                        >
                          {a.title_bn || a.title_en || "(শিরোনাম নেই)"}
                        </Link>
                        {a.title_bn && a.title_en && (
                          <p className="text-xs text-muted-text truncate">
                            {a.title_en}
                          </p>
                        )}
                        <div className="flex gap-2 items-center mt-2 flex-wrap">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold border ${colorClass}`}
                          >
                            {a.status}
                          </span>
                          {a.category && (
                            <span className="text-xs bg-muted-bg text-card-text px-2 py-1 rounded-full border border-border-color">
                              {a.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <Link
                        to={`/admin/articles/${a.id}/edit`}
                        className="p-2 text-card-text hover:bg-muted-bg hover:text-bbcRed rounded transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteArticle(a.id)}
                        className="p-2 text-danger hover:bg-danger/10 dark:hover:bg-danger/20 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-muted-text space-y-1">
                    <div>
                      <span className="font-bold">প্রকাশিত:</span> {pubDate}
                    </div>
                    <div>
                      <span className="font-bold">তৈরি:</span> {createdDate}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default ArticleList;
