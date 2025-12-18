import { ChevronRight, Clock } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import type { Article } from "../../types";
import { normalizeMediaUrl, PLACEHOLDER_IMAGE } from "../../utils";

interface RelatedArticlesProps {
  currentArticle: Article;
  allArticles: Article[];
}

export const RelatedArticles: React.FC<RelatedArticlesProps> = ({
  currentArticle,
  allArticles,
}) => {
  const relatedArticles = useMemo(() => {
    // Get related articles based on category and section
    const related = allArticles
      .filter((article) => {
        // Exclude current article
        if (article.id === currentArticle.id) return false;

        // Must be published
        if (article.status !== "published") return false;

        // Match by category or section
        return (
          article.category_id === currentArticle.category_id ||
          article.section_id === currentArticle.section_id
        );
      })
      .slice(0, 4); // Limit to 4 articles

    return related;
  }, [currentArticle, allArticles]);

  if (relatedArticles.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-bbcRed rounded-full" />
        <h3 className="text-xl sm:text-2xl font-bold">সম্পর্কিত নিবন্ধ</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {relatedArticles.map((article) => (
          <Link
            key={article.id}
            to={`/article/${article.id}`}
            className="bg-card rounded-lg border border-border-color overflow-hidden hover:shadow-lg transition-all group"
          >
            <div className="aspect-video bg-muted-bg overflow-hidden">
              <img
                src={normalizeMediaUrl(article.image) || PLACEHOLDER_IMAGE}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="p-3">
              <h4 className="font-bold text-sm line-clamp-2 group-hover:text-bbcRed transition-colors">
                {article.title}
              </h4>
              {article.readTime && (
                <div className="flex items-center gap-1 text-xs text-muted-text mt-2">
                  <Clock className="w-3 h-3" />
                  {article.readTime}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      <Link
        to={
          currentArticle.category_id
            ? `/?category=${currentArticle.category_id}`
            : "/"
        }
        className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-lg bg-card border border-border-color hover:bg-muted-bg transition-colors font-bold text-sm group"
      >
        আরও নিবন্ধ দেখুন
        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    </section>
  );
};
