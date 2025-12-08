import React from "react";
import { Link } from "react-router-dom";
import type { Article } from "../../types";
import { useLayout } from "../../context/LayoutContext";
import {
  escapeHtml,
  formatTimestamp,
  PLACEHOLDER_IMAGE,
} from "../../lib/utils";
import { t } from "../../lib/translations";
import {
  Bookmark,
  PlayCircle,
  Play,
  Headset,
  Clock,
  ChevronRight,
} from "lucide-react";

interface ArticleCardProps {
  article: Article;
  type: "reel" | "audio" | "hero-grid" | "grid";
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

  if (type === "reel") {
    return (
      <div className="flex-shrink-0 w-[280px] group cursor-pointer snap-start transform transition-all duration-300 hover:-translate-y-1">
        <Link
          to={`/article/${article.id}`}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <div className="aspect-[9/16] overflow-hidden relative rounded-2xl shadow-lg border border-border-color">
            <img
              src={article.image || PLACEHOLDER_IMAGE}
              alt={article.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-90"></div>
            <div className="absolute bottom-5 left-5 right-5 text-white">
              <span className="bg-bbcRed text-white text-[10px] px-2 py-0.5 rounded font-bold mb-2 inline-block">
                {escapeHtml(article.category)}
              </span>
              <h3 className="font-bold text-lg leading-tight mb-1 group-hover:text-gray-200 transition-colors">
                {escapeHtml(article.title)}
              </h3>
            </div>
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
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
            <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md p-2 rounded-full">
              <PlayCircle className="w-5 h-5 text-white" />
            </div>
          </div>
        </Link>
      </div>
    );
  }

  if (type === "audio") {
    return (
      <div className="group cursor-pointer relative transform transition-all duration-300 hover:-translate-y-1">
        <Link
          to={`/article/${article.id}`}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <div className="relative aspect-square mb-3 overflow-hidden rounded-2xl shadow-md group-hover:shadow-lg border border-border-color">
            <img
              src={article.image || PLACEHOLDER_IMAGE}
              alt={article.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur text-bbcDark rounded-full p-2 shadow-sm group-hover:scale-110 transition-transform">
              <Headset className="w-4 h-4 fill-current" />
            </div>
            <div className="absolute top-4 right-4 flex gap-2">
              <button
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
          </div>
          <h3
            className={`text-base font-bold leading-snug group-hover:text-bbcRed transition-colors ${textColor}`}
          >
            {escapeHtml(article.title)}
          </h3>
          <div className="flex justify-between items-center mt-2 text-xs font-medium">
            <span className="bg-muted-bg px-2 py-0.5 rounded text-gray-700 dark:text-gray-300">
              {escapeHtml(article.category)}
            </span>
            {article.readTime && (
              <span>
                <Clock className="w-3 h-3 inline" />{" "}
                {escapeHtml(article.readTime)}
              </span>
            )}
          </div>
        </Link>
      </div>
    );
  }

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
          {article.is_video && (
            <div className="absolute bottom-3 left-3 bg-black/60 text-white px-2 py-1 rounded-full backdrop-blur-sm text-xs flex items-center gap-1">
              <Play className="w-3 h-3 fill-white" /> {t("video", language)}
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
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
