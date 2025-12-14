import { FileText, Inbox, Loader, Trash2 } from "lucide-react";
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
  showToastMsg,
} from "../../lib/utils";

const Submissions: React.FC = () => {
  const { language } = useLayout();
  const navigate = useNavigate();
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
      showToastMsg(
        t("delete_functionality_not_implemented", language),
        "error"
      );
    } catch (_error) {
      showToastMsg(t("failed_to_delete_submission", language), "error");
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
    <div className="space-y-4 sm:space-y-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">
          {t("user_submissions", language)}
        </h1>
      </div>

      <div className="bg-card rounded-xl border border-border-color shadow-sm overflow-hidden">
        {submissions.length === 0 ? (
          <div className="p-6 sm:p-8 text-center text-muted-text">
            <Inbox className="w-16 h-16 mx-auto mb-4 text-border-color" />
            <p className="text-base sm:text-lg font-bold mb-2">
              {t("no_submissions_found", language)}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:gap-4 p-3 sm:p-4">
            {submissions.map((s) => (
              <button
                key={s.id}
                onClick={() =>
                  handleItemSelect(
                    window.innerWidth < 768,
                    navigate,
                    `/admin/submissions/${s.id}`
                  )
                }
                type="button"
                className="bg-card p-3 sm:p-4 rounded-lg border border-border-color group cursor-pointer hover:bg-muted-bg transition-colors w-full text-left"
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
                        href={s.file_path}
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
                            t("confirm_delete_submission", language)
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
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Submissions;
