import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useLayout } from "../../context/LayoutContext";
import { adminApi } from "../../lib/api";
import { t } from "../../lib/translations";
import { Inbox, FileText, Download, Loader } from "lucide-react";
import { showToastMsg, formatTimestamp, escapeHtml } from "../../lib/utils";

const Submissions: React.FC = () => {
  const { language } = useLayout();
  const [submissions, setSubmissions] = useState<any[]>([]); // TODO: Define Submission type
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
    } catch (error) {
      console.error("Fetch submissions error:", error);
      showToastMsg(t("server_error", language), "error");
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

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
          <table className="w-full text-left border-collapse responsive-table">
            <thead className="bg-muted-bg text-muted-text text-xs uppercase">
              <tr>
                <th className="p-4">Article</th>
                <th className="p-4">Message</th>
                <th className="p-4">File</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {submissions.map((s) => (
                <tr key={s.id} className="hover:bg-muted-bg transition-colors">
                  <td className="p-4">
                    <Link
                      to={`/admin/articles/${s.article_id}/edit`}
                      className="font-bold text-sm block hover:text-bbcRed"
                    >
                      {escapeHtml(
                        s.title_en || s.title_bn || "Unknown Article",
                      )}
                    </Link>
                    <span className="text-xs text-muted-text">
                      {s.article_id}
                    </span>
                  </td>
                  <td
                    className="p-4 text-sm max-w-xs truncate"
                    title={s.message}
                  >
                    {escapeHtml(s.message || "-")}
                  </td>
                  <td className="p-4">
                    <a
                      href={s.file_path} // Assuming this is accessible or proxied
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm font-bold flex items-center gap-1"
                    >
                      <FileText className="w-4 h-4" /> Download
                    </a>
                  </td>
                  <td className="p-4 text-xs text-muted-text">
                    {formatTimestamp(s.created_at, language)}
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

export default Submissions;
