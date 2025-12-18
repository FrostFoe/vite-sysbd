import type React from "react";
import { Link } from "react-router-dom";
import { useLayout } from "../../context/LayoutContext";
import type { Article } from "../../types";
import { PLACEHOLDER_IMAGE } from "../../utils";

interface MiniArticleProps {
  article: Article;
  colorClass?: string;
}

const MiniArticle: React.FC<MiniArticleProps> = ({
  article,
  colorClass = "text-bbcRed",
}) => {
  useLayout();
  const titleColor = "text-card-text";

  return (
    <li className="group cursor-pointer p-2 rounded-xl hover:bg-muted-bg transition-colors">
      <Link
        to={`/article/${article.id}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <div className="flex gap-4">
          {article.image && (
            <div className="w-20 h-20 flex-shrink-0 aspect-square overflow-hidden rounded-lg relative">
              <img
                src={article.image || PLACEHOLDER_IMAGE}
                alt={article.title}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-grow">
            <h4
              className={`text-sm font-bold leading-snug group-hover:${colorClass} transition-colors ${titleColor} line-clamp-2`}
            >
              {article.title}
            </h4>
          </div>
        </div>
      </Link>
    </li>
  );
};

export default MiniArticle;
