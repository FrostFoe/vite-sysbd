import { FileText, Inbox, Loader, Trash2 } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLayout } from "../../context/LayoutContext";
import { adminApi } from "../../lib/api";
import { t } from "../../lib/translations";
import { escapeHtml, formatTimestamp, showToastMsg } from "../../lib/utils";

const Submissions: React.FC = () => {
  const { language } = useLayout();
  interface Submission {
    id: number;
    article_id: string;
    user_id?: number;
    file_path: string;
    message?: string;
    created_at: string;
    title_en?: string;
    title_bn?: string;
  }

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubmissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getSubmissions();
      if (response.success && response.submissions) {
        setSubmissions(response.submissions);
      } else {
        showToastMsg(response.error || "Failed to fetch submissions", "error");
      }
    } catch (_error) {
      showToastMsg(t("server_error", language), "error");
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleDeleteSubmission = async (_id: number) => {
    try {
      // Note: The API might not have a delete submission endpoint
      // This is a placeholder - you may need to implement the backend API
      showToastMsg(
        "Delete functionality for submissions is not implemented",
        "error"
      );
      // If API endpoint exists, it would be something like:
      // await adminApi.deleteSubmission(id);
      // fetchSubmissions(); // Refresh the list
    } catch (_error) {
      showToastMsg("Failed to delete submission", "error");
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold">User Submissions</h1>
      </div>

      <div className="bg-card rounded-xl border border-border-color shadow-sm overflow-hidden">
        {submissions.length === 0 ? (
          <div className="p-8 text-center text-muted-text">
            <Inbox className="w-16 h-16 mx-auto mb-4 text-border-color" />
            <p className="text-lg font-bold mb-2">No Submissions Found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4">
            {submissions.map((s) => (
              <div
                key={s.id}
                className="bg-card p-4 rounded-lg border border-border-color group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-muted-bg flex items-center justify-center shrink-0 border border-border-color font-bold text-card-text text-xs">
                      {s.file_path ? "SUB" : "MSG"}
                    </div>
                    <div className="truncate">
                      <Link
                        to={`/admin/articles/${s.article_id}/edit`}
                        className="font-bold text-sm truncate block hover:text-bbcRed"
                      >
                        {escapeHtml(
                          s.title_en || s.title_bn || "Unknown Article"
                        )}
                      </Link>
                      <p className="text-xs text-muted-text truncate">
                        {s.article_id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    {s.file_path && (
                      <a
                        href={s.file_path} // Assuming this is accessible or proxied
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-muted-bg rounded-lg"
                      >
                        <FileText className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to delete this submission?"
                          )
                        ) {
                          handleDeleteSubmission(s.id);
                        }
                      }}
                      className="p-2 hover:bg-danger/10 text-danger rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-sm text-card-text max-h-12 overflow-hidden">
                  {escapeHtml(s.message || "-")}
                </div>
                <div className="text-xs text-muted-text mt-2">
                  {formatTimestamp(s.created_at, language)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Submissions;
