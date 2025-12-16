import { ArrowLeft, Loader } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLayout } from "../../context/LayoutContext";
import { adminApi } from "../../lib/api";
import { t } from "../../lib/translations";
import { escapeHtml, formatTimestamp, showToastMsg } from "../../lib/utils";

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

const SubmissionDetail: React.FC = () => {
  const { submissionId: submissionIdParam } = useParams<{
    submissionId: string;
  }>();
  const submissionId = submissionIdParam
    ? parseInt(submissionIdParam, 10)
    : null;
  const { language } = useLayout();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubmission = async () => {
      if (!submissionId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const response = await adminApi.getSubmissions();
        if (response.success && response.submissions) {
          const foundSubmission = (response.submissions as Submission[]).find(
            (s) => s.id === submissionId,
          );
          if (foundSubmission) {
            setSubmission(foundSubmission);
          } else {
            showToastMsg("Submission not found", "error");
          }
        }
      } catch (_error) {
        showToastMsg(t("server_error", language), "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmission();
  }, [submissionId, language]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-8 h-8 animate-spin text-bbcRed" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-text">{t("invalid_submission", language)}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-3 sm:p-4 md:p-6">
      <Link
        to="/admin/submissions"
        className="flex items-center gap-2 text-bbcRed hover:opacity-80 mb-4 sm:mb-6 text-sm"
      >
        <ArrowLeft className="w-4 sm:w-5 h-4 sm:h-5" />
        {t("back", language)}
      </Link>

      <div className="bg-card rounded-xl border border-border-color p-4 sm:p-6 shadow-sm space-y-3 sm:space-y-4">
        <div>
          <div className="text-[10px] sm:text-xs font-bold text-muted-text uppercase">
            {t("article", language)}
          </div>
          <Link
            to={`/admin/articles/${submission.article_id}/edit`}
            className="text-bbcRed hover:opacity-80 text-xs sm:text-sm mt-1 block font-bold truncate"
          >
            {escapeHtml(
              submission.title_en || submission.title_bn || "Unknown Article",
            )}
          </Link>
        </div>

        {submission.message && (
          <div>
            <div className="text-xs font-bold text-muted-text uppercase">
              {t("message", language)}
            </div>
            <p className="text-sm text-card-text mt-1">
              {escapeHtml(submission.message)}
            </p>
          </div>
        )}

        {submission.file_path && (
          <div>
            <div className="text-xs font-bold text-muted-text uppercase">
              {t("file", language)}
            </div>
            <a
              href={submission.file_path}
              target="_blank"
              rel="noopener noreferrer"
              className="text-bbcRed hover:opacity-80 text-sm mt-1 block break-all"
            >
              {submission.file_path}
            </a>
          </div>
        )}

        <div>
          <div className="text-xs font-bold text-muted-text uppercase">
            {t("submitted", language)}
          </div>
          <p className="text-sm text-card-text mt-1">
            {formatTimestamp(submission.created_at, language)}
          </p>
        </div>

        <div className="text-xs text-muted-text pt-4 border-t border-border-color">
          {t("id", language)}: {submission.id}
        </div>
      </div>
    </div>
  );
};

export default SubmissionDetail;
