import DOMPurify from "dompurify";
import { ArrowLeft, Loader } from "lucide-react";
import type React from "react";
import { createElement, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { adminApi } from "../../api";
import { useLayout } from "../../context/LayoutContext";
import { t } from "../../translations";
import { formatTimestamp, showToastMsg } from "../../utils";

interface AdminComment {
  id: number;
  text: string;
  created_at: string;
  user_name: string;
  title_en?: string;
  title_bn?: string;
  article_id: string;
}

const CommentDetail: React.FC = () => {
  const { commentId: commentIdParam } = useParams<{ commentId: string }>();
  const commentId = commentIdParam ? parseInt(commentIdParam, 10) : null;
  const { language } = useLayout();
  const [comment, setComment] = useState<AdminComment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchComment = async () => {
      if (!commentId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const response = await adminApi.getAllComments();
        if (response.success && response.comments) {
          const foundComment = (response.comments as AdminComment[]).find(
            (c) => c.id === commentId
          );
          if (foundComment) {
            setComment(foundComment);
          } else {
            showToastMsg("Comment not found", "error");
          }
        }
      } catch (_error) {
        showToastMsg(t("server_error", language), "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchComment();
  }, [commentId, language]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-8 h-8 animate-spin text-bbcRed" />
      </div>
    );
  }

  if (!comment) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-text">{t("invalid_comment", language)}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-3 sm:p-4 md:p-6">
      <Link
        to="/admin/comments"
        className="flex items-center gap-2 text-bbcRed hover:opacity-80 mb-4 sm:mb-6 text-sm"
      >
        <ArrowLeft className="w-4 sm:w-5 h-4 sm:h-5" />
        {t("back", language)}
      </Link>

      <div className="bg-card rounded-xl border border-border-color p-4 sm:p-6 shadow-sm">
        <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-gradient-to-br from-bbcRed to-orange-600 flex items-center justify-center text-white text-sm sm:text-lg font-bold flex-shrink-0">
            {comment.user_name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-bold truncate">
              {comment.user_name}
            </h1>
            <p className="text-muted-text text-xs sm:text-sm">
              {formatTimestamp(comment.created_at, language)}
            </p>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div>
            <div className="text-[10px] sm:text-xs font-bold text-muted-text uppercase">
              {t("article", language)}
            </div>
            <Link
              to={`/admin/articles/${comment.article_id}/edit`}
              className="text-bbcRed hover:opacity-80 text-xs sm:text-sm mt-1 block truncate"
            >
              {language === "bn"
                ? comment.title_bn
                : comment.title_en || "Unknown Article"}
            </Link>
          </div>

          <div>
            <div className="text-[10px] sm:text-xs font-bold text-muted-text uppercase">
              {t("comment_text", language)}
            </div>
            <div className="prose prose-sm dark:prose-invert mt-2 text-card-text">
              {(() => {
                const sanitizedText = DOMPurify.sanitize(comment.text);
                const tempDiv = document.createElement("div");
                tempDiv.innerHTML = sanitizedText;

                const convertNodeToReactElement = (
                  node: Node
                ): React.ReactNode => {
                  if (node.nodeType === Node.TEXT_NODE) {
                    return node.textContent;
                  } else if (node.nodeType === Node.ELEMENT_NODE) {
                    const element = node as HTMLElement;
                    const props: Record<string, unknown> = {};

                    // Copy attributes (converting class to className)
                    for (let i = 0; i < element.attributes.length; i++) {
                      const attr = element.attributes[i];
                      const propName =
                        attr.name === "class" ? "className" : attr.name;
                      props[propName] = attr.value;
                    }

                    // Process child nodes
                    const children = Array.from(element.childNodes).map(
                      convertNodeToReactElement
                    );

                    return createElement(
                      element.tagName.toLowerCase(),
                      props,
                      ...children
                    );
                  }
                  return null;
                };

                return Array.from(tempDiv.childNodes).map((node, _index) =>
                  convertNodeToReactElement(node)
                );
              })()}
            </div>
          </div>

          <div className="text-xs text-muted-text pt-4 border-t border-border-color">
            {t("id", language)}: {comment.id}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentDetail;
