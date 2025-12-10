import { Bookmark, ChevronRight, Clock } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { useLayout } from "../../context/LayoutContext";
import { t } from "../../lib/translations";
import {
  escapeHtml,
  formatTimestamp,
  PLACEHOLDER_IMAGE,
} from "../../lib/utils";
import type { Article } from "../../types";

interface ArticleCardProps {
  article: Article;
  type: "hero-grid" | "grid";
  isSectionDark?: boolean;
  onBookmarkToggle: (id: string) => void;
  isBookmarked: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  type,
  isSectionDark,
  onBookmarkToggle,
  isBookmarked,
}) => {
  const { language, theme } = useLayout();
  const isDark = theme === "dark" || isSectionDark;
  const textColor = isSectionDark ? "text-white" : "text-card-text";
  const subTextColor = isSectionDark ? "text-gray-300" : "text-gray-600";
  const metaColor = isSectionDark ? "text-gray-400" : "text-muted-text";
  const borderClass = isSectionDark ? "border-gray-800" : "border-border-color";
  const bgClass = "bg-card-elevated";

  const bookmarkFill = isBookmarked ? (isDark ? "white" : "black") : "none";
  const timeAgo = formatTimestamp(article.published_at, language);

  return (
    <article
      className={`group cursor-pointer flex flex-col h-full relative ${bgClass} rounded-2xl overflow-hidden shadow-soft hover:shadow-soft-hover transition-all duration-300 hover:-translate-y-1 border ${borderClass}`}
    >
      <Link
        to={`/article/${article.id}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <div className="overflow-hidden aspect-video relative">
          <img
            src={article.image || PLACEHOLDER_IMAGE}
            alt={article.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onBookmarkToggle(article.id);
              }}
              className="bg-white/90 dark:bg-black/50 backdrop-blur p-2.5 rounded-full hover:bg-white dark:hover:bg-gray-800 text-black dark:text-white shadow-md z-10 hover:scale-110 active:scale-95 transition-all"
            >
              <Bookmark className="w-4 h-4" fill={bookmarkFill} />
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent opacity-60" />
        </div>
        <div className="flex flex-col flex-grow p-5">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-bbcRed bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded">
              {escapeHtml(article.category)}
            </span>
            <span className="text-[10px] text-muted-text">• {timeAgo}</span>
          </div>
          <h3
            className={`text-lg md:text-xl font-bold mb-3 leading-tight group-hover:text-bbcRed transition-colors ${textColor}`}
          >
            {escapeHtml(article.title)}
          </h3>
          {(type === "hero-grid" || type === "grid") && article.summary && (
            <p
              className={`${subTextColor} text-sm leading-relaxed mb-4 line-clamp-3`}
            >
              {escapeHtml(article.summary)}
            </p>
          )}
          <div
            className={`mt-auto pt-3 border-t ${borderClass} flex items-center justify-between text-xs ${metaColor}`}
          >
            <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              {t("read_more", language)} <ChevronRight className="w-3 h-3" />
            </span>
            {article.readTime && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {escapeHtml(article.readTime)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
};

export default React.memo(ArticleCard);
