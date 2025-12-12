import { ExternalLink, Loader, MessageCircle, Trash2 } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLayout } from "../../context/LayoutContext";
import { adminApi } from "../../lib/api";
import { t } from "../../lib/translations";
import {
  escapeHtml,
  formatTimestamp,
  handleItemSelect,
  sanitizeHtml,
  showToastMsg,
} from "../../lib/utils";

const Comments: React.FC = () => {
  const { language } = useLayout();
  const navigate = useNavigate();
  interface AdminComment {
    id: number;
    text: string;
    created_at: string;
    user_name: string;
    title_en?: string;
    title_bn?: string;
    article_id: string;
  }

  const [comments, setComments] = useState<AdminComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getAllComments();
      if (response.success && response.comments) {
        setComments(response.comments);
      } else {
        showToastMsg(response.error || "Failed to fetch comments", "error");
      }
    } catch (_error) {
      showToastMsg(t("server_error", language), "error");
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleDeleteComment = async (id: number) => {
    if (!window.confirm(t("confirm_delete_comment", language))) return;
    try {
      const response = await adminApi.deleteComment(id);
      if (response.success) {
        showToastMsg(t("comment_deleted", language));
        setComments((prev) => prev.filter((c) => c.id !== id));
      } else {
        showToastMsg(
          response.error || t("failed_to_delete_comment", language),
          "error"
        );
      }
    } catch (_error) {
      showToastMsg(t("server_error", language), "error");
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Loader className="w-10 h-10 animate-spin text-bbcRed" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("moderation", language)}</h1>
      </div>

      <div className="bg-card rounded-xl border border-border-color shadow-sm overflow-hidden">
        {comments.length === 0 ? (
          <div className="p-8 text-center text-muted-text">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-border-color" />
            <p className="text-lg font-bold mb-2">No Comments Found</p>
            <p className="text-sm">
              There are currently no comments to moderate.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4">
            {comments.map((c) => (
              <button
                key={c.id}
                onClick={() =>
                  handleItemSelect(
                    window.innerWidth < 768,
                    navigate,
                    `/admin/comments/${c.id}`
                  )
                }
                type="button"
                className="bg-card p-4 rounded-lg border border-border-color group hover:bg-muted-bg transition-colors cursor-pointer w-full text-left"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-bbcRed to-orange-600 flex items-center justify-center text-white text-sm font-bold">
                      {c.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-sm truncate">
                        {escapeHtml(c.user_name)}
                      </div>
                      <div className="text-xs text-muted-text truncate">
                        {escapeHtml(
                          language === "bn" ? c.title_bn : c.title_en
                        ) || "Unknown Article"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <div className="text-xs text-muted-text hidden sm:block whitespace-nowrap">
                      {formatTimestamp(c.created_at, language)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Link
                        to={`/article/${c.article_id}`}
                        target="_blank"
                        title="View Article"
                        className="text-muted-text hover:text-bbcRed hover:bg-bbcRed/10 p-2 rounded transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(c.id)}
                        className="text-danger hover:text-danger/80 hover:bg-danger/10 dark:hover:bg-danger/20 p-2 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div
                  className="text-sm text-card-text max-h-16 overflow-hidden prose prose-sm dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(c.text) }}
                />
                <div className="text-xs text-muted-text mt-2 sm:hidden">
                  {formatTimestamp(c.created_at, language)}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Comments;
