import { Bookmark, ChevronRight, Clock, Newspaper } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ArticleCard from "../components/common/ArticleCard";
import { useLayout } from "../context/LayoutContext";
import { publicApi } from "../lib/api";
import { t } from "../lib/translations";
import { formatTimestamp, PLACEHOLDER_IMAGE } from "../lib/utils";
import type { Article, Category, Section } from "../types";

const HomePage: React.FC = () => {
  const { language, currentCategory } = useLayout();
  const [homeData, setHomeData] = useState<{
    sections: Section[];
    categories: Category[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("breachtimes-bookmarks");
      if (saved) {
        setBookmarks(JSON.parse(saved));
      }
    } catch (_e) {
      // Silently fail if bookmarks are corrupted
    }
  }, []);

  const toggleBookmark = useCallback((id: string) => {
    setBookmarks((prevBookmarks) => {
      const index = prevBookmarks.indexOf(id);
      let newBookmarks: string[];
      if (index > -1) {
        newBookmarks = prevBookmarks.filter((bookmarkId) => bookmarkId !== id);
      } else {
        newBookmarks = [...prevBookmarks, id];
      }
      localStorage.setItem(
        "breachtimes-bookmarks",
        JSON.stringify(newBookmarks)
      );
      return newBookmarks;
    });
  }, []);

  useEffect(() => {
    const fetchHomeData = async () => {
      setIsLoading(true);
      try {
        const data = await publicApi.getHomeData(
          language,
          currentCategory === "saved" ? undefined : currentCategory
        );
        setHomeData(data);
      } catch (_error) {
        // Failed to fetch home data
      } finally {
        setIsLoading(false);
      }
    };
    fetchHomeData();
  }, [language, currentCategory]);

  const renderArticleListItem = (article: Article, isSectionDark?: boolean) => {
    const textColor = isSectionDark ? "text-white" : "text-card-text";
    const metaColor = isSectionDark ? "text-white/60" : "text-muted-text";
    const timeAgo = formatTimestamp(article.published_at, language);

    return (
      <Link
        key={article.id}
        to={`/article/${article.id}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="group flex gap-4 p-4 rounded-xl hover:bg-muted-bg transition-colors duration-200 border border-transparent hover:border-border-color"
      >
        <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden">
          <img
            src={article.image || PLACEHOLDER_IMAGE}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <h3
              className={`font-semibold text-sm leading-tight group-hover:text-bbcRed transition-colors line-clamp-2 ${textColor}`}
            >
              {article.title}
            </h3>
            <p className={`text-xs mt-1 line-clamp-2 ${metaColor}`}>
              {article.summary}
            </p>
          </div>
          <div className={`flex items-center gap-2 text-xs ${metaColor}`}>
            <Clock className="w-3 h-3" />
            <span>{timeAgo}</span>
          </div>
        </div>
      </Link>
    );
  };

  const renderSection = (section: Section) => {
    const isSectionDark = section.style === "dark";
    const titleColor = isSectionDark ? "text-white" : "text-card-text";
    const borderColor = isSectionDark
      ? "white"
      : section.highlightColor || "var(--text-page)";

    let content = null;
    if (section.type === "hero-grid") {
      const heroArticle = section.articles[0];
      const subArticles = section.articles.slice(1);
      content = (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main featured news */}
          {heroArticle && (
            <div className="lg:col-span-2">
              <ArticleCard
                article={heroArticle}
                type="hero-grid"
                isSectionDark={isSectionDark}
                onBookmarkToggle={toggleBookmark}
                isBookmarked={bookmarks.includes(heroArticle.id)}
              />
            </div>
          )}
          {/* Other news as list */}
          {subArticles.length > 0 && (
            <div className="lg:col-span-1">
              <div
                className={`${isSectionDark ? "bg-card-elevated" : "bg-card"} p-6 rounded-2xl shadow-soft border border-border-color h-full`}
              >
                <h3
                  className={`font-bold text-lg mb-4 flex items-center gap-2 ${titleColor}`}
                >
                  <span
                    className="w-1 h-6 rounded-full"
                    style={{ backgroundColor: borderColor }}
                  />
                  আরও খবর
                </h3>
                <div className="space-y-2">
                  {subArticles
                    .slice(0, 5)
                    .map((article) =>
                      renderArticleListItem(article, isSectionDark)
                    )}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    } else if (section.type === "list") {
      content = (
        <div className="space-y-2">
          {section.articles.map((article) =>
            renderArticleListItem(article, isSectionDark)
          )}
        </div>
      );
    } else {
      content = (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {section.articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              type="grid"
              isSectionDark={isSectionDark}
              onBookmarkToggle={toggleBookmark}
              isBookmarked={bookmarks.includes(article.id)}
            />
          ))}
        </div>
      );
    }

    return (
      <section
        className={`animate-fade-in-up relative z-10 ${section.style === "dark" ? "bg-card-elevated text-white p-8 md:p-10 rounded-3xl mb-12 shadow-2xl relative overflow-hidden" : "mb-12"}`}
      >
        <div className="flex justify-between items-center mb-8">
          <h2
            className={`text-2xl font-bold flex items-center gap-3 ${titleColor}`}
          >
            <span
              className="w-2 h-8 rounded-full"
              style={{ backgroundColor: borderColor }}
            />
            {section.title}
          </h2>
          {section.type !== "hero-grid" && (
            <Link
              to={`/?category=${section.associatedCategory}`}
              className={`text-sm font-bold hover:text-bbcRed transition-colors flex items-center gap-1 opacity-80 hover:opacity-100 ${titleColor}`}
            >
              {t("all", language)} <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
        {content}
        {section.style === "dark" && (
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        )}
      </section>
    );
  };
  const renderHomeContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 animate-pulse">
          <div className="col-span-1 md:col-span-2 lg:col-span-2">
            <div className="bg-muted-bg w-full aspect-video mb-5 rounded-xl" />
            <div className="bg-muted-bg w-3/4 h-8 mb-3 rounded" />
            <div className="bg-muted-bg w-full h-4 mb-2 rounded" />
            <div className="bg-muted-bg w-2/3 h-4 rounded" />
          </div>
          <div className="col-span-1 md:col-span-2 lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div className="bg-muted-bg w-full aspect-video mb-3 rounded-lg" />
                <div className="bg-muted-bg w-full h-5 rounded" />
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (!homeData || !homeData.sections || homeData.sections.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-32 text-center animate-fade-in">
          <div className="bg-muted-bg p-6 rounded-full mb-4">
            <Newspaper className="w-12 h-12 text-muted-text" />
          </div>
          <h3 className="text-2xl font-bold mb-2 text-card-text">
            {t("no_news_in_this_category", language)}
          </h3>
        </div>
      );
    }

    let sectionsToRender = homeData.sections;

    if (currentCategory === "saved") {
      const allArticles = homeData.sections?.flatMap((s) => s.articles) || [];
      const savedArticles = allArticles.filter((a) => bookmarks.includes(a.id));

      if (savedArticles.length === 0) {
        return (
          <div className="flex flex-col items-center justify-center py-32 text-center animate-fade-in">
            <div className="bg-muted-bg p-6 rounded-full mb-4">
              <Bookmark className="w-12 h-12 text-muted-text" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-card-text">
              {t("no_saved_articles", language)}
            </h3>
            <p className="text-muted-text">
              {t("bookmark_your_favorites", language)}
            </p>
          </div>
        );
      }
      sectionsToRender = [
        {
          id: "saved",
          title: t("saved", language),
          type: "grid",
          highlightColor: "var(--color-bbcRed)",
          associatedCategory: null,
          style: null,
          articles: savedArticles,
        },
      ];
    }

    if (currentCategory === "home" || currentCategory === null) {
      const heroStoriesSection = homeData?.sections?.find(
        (s) => s.id === "hero-stories"
      );

      if (heroStoriesSection) {
        // Render hero section first, then remaining articles in a single grid
        const heroArticle = heroStoriesSection.articles[0];
        const moreNewsArticles = heroStoriesSection.articles.slice(1, 6); // First 5 after hero
        const excludedIds = new Set(
          [heroArticle?.id, ...moreNewsArticles.map((a) => a.id)].filter(
            Boolean
          )
        );
        const allArticles =
          homeData?.sections?.flatMap((section) => section.articles) || [];
        const remainingArticles = allArticles.filter(
          (article) => !excludedIds.has(article.id)
        );

        return (
          <>
            {renderSection({
              ...heroStoriesSection,
              type: "hero-grid",
              articles: heroStoriesSection.articles,
            })}
            {/* Render remaining articles in a single grid without section headers */}
            {remainingArticles.length > 0 && (
              <section className="animate-fade-in-up relative z-10 mb-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {remainingArticles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      type="grid"
                      onBookmarkToggle={toggleBookmark}
                      isBookmarked={bookmarks.includes(article.id)}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        );
      }
    }

    return (
      <>
        {/* Render all articles from all sections in a single grid without section headers */}
        <section className="animate-fade-in-up relative z-10 mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sectionsToRender
              .flatMap((section) => section.articles)
              .map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  type="grid"
                  onBookmarkToggle={toggleBookmark}
                  isBookmarked={bookmarks.includes(article.id)}
                />
              ))}
          </div>
        </section>
      </>
    );
  };

  return <>{renderHomeContent()}</>;
};

export default HomePage;
