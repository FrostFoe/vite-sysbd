import { ExternalLink, Loader, MessageCircle, Trash2 } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLayout } from "../../context/LayoutContext";
import { adminApi } from "../../lib/api";
import { t } from "../../lib/translations";
import { escapeHtml, formatTimestamp, showToastMsg } from "../../lib/utils";

const Comments: React.FC = () => {
  const { language } = useLayout();
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
          <table className="w-full text-left border-collapse responsive-table">
            <thead className="bg-muted-bg text-muted-text text-xs uppercase">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Comment</th>
                <th className="p-4">Article</th>
                <th className="p-4">Time</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {comments.map((c) => (
                <tr key={c.id} className="hover:bg-muted-bg transition-colors">
                  <td className="p-4 font-bold text-sm">
                    {escapeHtml(c.user_name)}
                  </td>
                  <td className="p-4 text-sm max-w-md truncate" title={c.text}>
                    {escapeHtml(c.text)}
                  </td>
                  <td className="p-4 text-xs text-muted-text">
                    <Link
                      to={`/article/${c.article_id}`}
                      target="_blank"
                      className="hover:text-bbcRed flex items-center gap-1"
                    >
                      {escapeHtml(language === "bn" ? c.title_bn : c.title_en)}{" "}
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                  <td className="p-4 text-xs text-muted-text">
                    {formatTimestamp(c.created_at, language)}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(c.id)}
                        className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Comments;
