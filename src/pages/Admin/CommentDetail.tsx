import { ArrowLeft, Loader } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLayout } from "../../context/LayoutContext";
import { adminApi } from "../../lib/api";
import { t } from "../../lib/translations";
import {
  escapeHtml,
  formatTimestamp,
  sanitizeHtml,
  showToastMsg,
} from "../../lib/utils";

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
    <div className="max-w-2xl mx-auto p-6">
      <Link
        to="/admin/comments"
        className="flex items-center gap-2 text-bbcRed hover:opacity-80 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        {t("back", language)}
      </Link>

      <div className="bg-card rounded-xl border border-border-color p-6 shadow-sm">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-bbcRed to-orange-600 flex items-center justify-center text-white text-lg font-bold">
            {comment.user_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold">
              {escapeHtml(comment.user_name)}
            </h1>
            <p className="text-muted-text text-sm">
              {formatTimestamp(comment.created_at, language)}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-muted-text uppercase">
              {t("article", language)}
            </label>
            <Link
              to={`/admin/articles/${comment.article_id}/edit`}
              className="text-bbcRed hover:opacity-80 text-sm mt-1 block"
            >
              {escapeHtml(
                language === "bn"
                  ? comment.title_bn
                  : comment.title_en || "Unknown Article"
              )}
            </Link>
          </div>

          <div>
            <label className="text-xs font-bold text-muted-text uppercase">
              {t("comment_text", language)}
            </label>
            <div
              className="prose prose-sm dark:prose-invert mt-2 text-card-text"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(comment.text) }}
            />
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
