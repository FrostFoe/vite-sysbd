import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useLayout } from "../context/LayoutContext";
import { publicApi } from "../lib/api";
import type { Section, Category } from "../types";
import { t } from "../lib/translations";
import { Bookmark, Newspaper, ChevronRight } from "lucide-react"; // Import icons needed
import ArticleCard from "../components/common/ArticleCard";
import MiniArticle from "../components/common/MiniArticle";

const HomePage: React.FC = () => {
  const { language, currentCategory } = useLayout();
  const [homeData, setHomeData] = useState<{
    sections: Section[];
    categories: Category[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  // Load bookmarks from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("breachtimes-bookmarks");
      if (saved) {
        setBookmarks(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Toggle bookmark function
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
        JSON.stringify(newBookmarks),
      );
      return newBookmarks;
    });
  }, []);

  // Fetch home data
  useEffect(() => {
    const fetchHomeData = async () => {
      setIsLoading(true);
      try {
        const data = await publicApi.getHomeData(
          language,
          currentCategory === "saved" ? undefined : currentCategory,
        );
        setHomeData(data);
      } catch (error) {
        console.error("Failed to fetch home data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHomeData();
  }, [language, currentCategory]);

  const renderSection = (section: Section) => {
    const isSectionDark = section.style === "dark";
    const titleColor = isSectionDark ? "text-white" : "text-card-text";
    const borderColor = isSectionDark
      ? "white"
      : section.highlightColor || "var(--color-bbcRed)";

    let content = null;
    if (section.type === "hero-grid") {
      const heroArticle = section.articles[0];
      const subArticles = section.articles.slice(1);
      content = (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {heroArticle && (
            <div className="col-span-1 md:col-span-2 lg:col-span-2">
              <ArticleCard
                article={heroArticle}
                type="hero-grid"
                isSectionDark={isSectionDark}
                onBookmarkToggle={toggleBookmark}
                isBookmarked={bookmarks.includes(heroArticle.id)}
              />
            </div>
          )}
          <div className="col-span-1 md:col-span-2 lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {subArticles.map((article) => (
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
        </div>
      );
    } else if (section.type === "list") {
      content = (
        <div className="bg-card p-6 rounded-2xl shadow-soft border border-border-color h-full">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-color">
            <div
              className="w-1.5 h-6 rounded-full"
              style={{
                backgroundColor:
                  section.highlightColor || "var(--color-bbcRed)",
              }}
            ></div>
            <h3 className={`text-xl font-bold ${titleColor}`}>
              {section.title}
            </h3>
          </div>
          <ul className="space-y-4">
            {section.articles.map((article) => (
              <MiniArticle
                key={article.id}
                article={article}
                colorClass="text-bbcRed"
              />
            ))}
          </ul>
        </div>
      );
    } else if (section.type === "reel") {
      content = (
        <div className="flex overflow-x-auto no-scrollbar gap-5 pb-8 snap-x scroll-smooth px-1">
          {section.articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              type="reel"
              isSectionDark={isSectionDark}
              onBookmarkToggle={toggleBookmark}
              isBookmarked={bookmarks.includes(article.id)}
            />
          ))}
        </div>
      );
    } else if (section.type === "audio") {
      content = (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {section.articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              type="audio"
              isSectionDark={isSectionDark}
              onBookmarkToggle={toggleBookmark}
              isBookmarked={bookmarks.includes(article.id)}
            />
          ))}
        </div>
      );
    } else {
      // Default to grid layout
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
            ></span>
            {section.title}
          </h2>
          {section.type !== "hero-grid" && (
            <Link
              to={`/?category=${section.associatedCategory}`} // Fix: use section.associatedCategory
              className={`text-sm font-bold hover:text-bbcRed transition-colors flex items-center gap-1 opacity-80 hover:opacity-100 ${titleColor}`}
            >
              {t("all", language)} <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
        {content}
        {section.style === "dark" && (
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        )}
      </section>
    );
  };

  const renderHomeContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 animate-pulse">
          <div className="col-span-1 md:col-span-2 lg:col-span-2">
            <div className="bg-muted-bg w-full aspect-video mb-5 rounded-xl"></div>
            <div className="bg-muted-bg w-3/4 h-8 mb-3 rounded"></div>
            <div className="bg-muted-bg w-full h-4 mb-2 rounded"></div>
            <div className="bg-muted-bg w-2/3 h-4 rounded"></div>
          </div>
          <div className="col-span-1 md:col-span-2 lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div className="bg-muted-bg w-full aspect-video mb-3 rounded-lg"></div>
                <div className="bg-muted-bg w-full h-5 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (!homeData || !homeData.sections.length) {
      return (
        <div className="flex flex-col items-center justify-center py-32 text-center animate-fade-in">
          <div className="bg-muted-bg p-6 rounded-full mb-4">
            <Newspaper className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold mb-2 dark:text-white text-bbcDark">
            {t("no_news_in_this_category", language)}
          </h3>
        </div>
      );
    }

    let sectionsToRender = homeData.sections;

    if (currentCategory === "saved") {
      const allArticles = homeData.sections.flatMap((s) => s.articles);
      const savedArticles = allArticles.filter((a) => bookmarks.includes(a.id));

      if (savedArticles.length === 0) {
        return (
          <div className="flex flex-col items-center justify-center py-32 text-center animate-fade-in">
            <div className="bg-muted-bg p-6 rounded-full mb-4">
              <Bookmark className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold mb-2 dark:text-white text-bbcDark">
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

    // Adjust logic to match PHP's specific home page section display if currentCategory is 'home'
    if (currentCategory === "home") {
      // Find specific sections by ID as done in PHP code
      const worldNewsSection = sectionsToRender.find(
        (s) => s.id === "virginia",
      );
      const businessNewsSection = sectionsToRender.find(
        (s) => s.id === "vermont",
      );
      const collectionSection = sectionsToRender.find(
        (s) => s.id === "wyoming",
      );

      return (
        <>
          {sectionsToRender.map((section) => (
            <div key={section.id}>
              {renderSection(section)}
            </div>
          ))}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 animate-fade-in">
            {collectionSection && (
              <div className="lg:col-span-1 h-full">
                {renderSection({ ...collectionSection, type: "list" })}
              </div>
            )}
            {worldNewsSection && (
              <div className="lg:col-span-1 h-full">
                <div className="bg-card p-6 rounded-2xl shadow-soft border border-border-color h-full">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-color">
                    <div className="w-1.5 h-6 rounded-full bg-blue-500"></div>
                    <h3 className="text-xl font-bold text-card-text">
                      {t("more_world_news", language)}
                    </h3>
                  </div>
                  <ul className="space-y-4">
                    {worldNewsSection.articles.slice(0, 3).map((article) => (
                      <MiniArticle
                        key={article.id}
                        article={article}
                        colorClass="text-blue-600 dark:text-blue-400"
                      />
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {businessNewsSection && (
              <div className="lg:col-span-1 h-full">
                <div className="bg-card p-6 rounded-2xl shadow-soft border border-border-color h-full">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-color">
                    <div className="w-1.5 h-6 rounded-full bg-green-500"></div>
                    <h3 className="text-xl font-bold text-card-text">
                      {t("business_news", language)}
                    </h3>
                  </div>
                  <ul className="space-y-4">
                    {businessNewsSection.articles.slice(2, 5).map((article) => (
                      <MiniArticle
                        key={article.id}
                        article={article}
                        colorClass="text-success"
                      />
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </section>
        </>
      );
    }

    return (
      <>
        {sectionsToRender.map((section) => (
          <React.Fragment key={section.id}>
            {renderSection(section)}
          </React.Fragment>
        ))}
      </>
    );
  };

  return <>{renderHomeContent()}</>;
};

export default HomePage;
