import { Edit3, FileText, Loader, MessageSquare, Users } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLayout } from "../context/LayoutContext";
import { adminApi } from "../lib/api";
import { t } from "../lib/translations";

interface AdminStats {
  articles: string;
  comments: string;
  drafts: string;
  users: string;
}

const AdminDashboard: React.FC = () => {
  useAuth();
  const { language } = useLayout();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const response = await adminApi.getAdminStats();
        if (response.success && response.stats) {
          setStats(response.stats);
        } else {
          // Failed to fetch admin stats
        }
      } catch (_error) {
        // API error occurred
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Loader className="w-10 h-10 animate-spin text-bbcRed" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8 text-danger">
        {t("failed_to_load_stats", language)}
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
        <div className="bg-card p-4 sm:p-6 rounded-xl border border-border-color shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-muted-text text-sm font-bold uppercase tracking-wider">
                {t("total_articles", language)}
              </p>
              <h3 className="text-3xl font-bold text-card-text mt-1">
                {stats.articles}
              </h3>
            </div>
            <div className="p-3 bg-muted-bg text-card-text rounded-lg">
              <FileText className="w-6 h-6" />
            </div>
          </div>
          <Link
            to="/admin/articles"
            className="text-sm text-card-text font-bold hover:underline hover:text-card-text/80"
          >
            {t("view_details", language)} &rarr;
          </Link>
        </div>

        <div className="bg-card p-4 sm:p-6 rounded-xl border border-border-color shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-muted-text text-sm font-bold uppercase tracking-wider">
                {t("total_comments", language)}
              </p>
              <h3 className="text-3xl font-bold text-card-text mt-1">
                {stats.comments}
              </h3>
            </div>
            <div className="p-3 bg-muted-bg text-card-text rounded-lg">
              <MessageSquare className="w-6 h-6" />
            </div>
          </div>
          <Link
            to="/admin/comments"
            className="text-sm text-card-text font-bold hover:underline hover:text-card-text/80"
          >
            {t("moderation", language)} &rarr;
          </Link>
        </div>

        <div className="bg-card p-4 sm:p-6 rounded-xl border border-border-color shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-muted-text text-sm font-bold uppercase tracking-wider">
                {t("drafts", language)}
              </p>
              <h3 className="text-3xl font-bold text-card-text mt-1">
                {stats.drafts}
              </h3>
            </div>
            <div className="p-3 bg-muted-bg text-card-text rounded-lg">
              <Edit3 className="w-6 h-6" />
            </div>
          </div>
          <Link
            to="/admin/articles?status=draft"
            className="text-sm text-card-text font-bold hover:underline hover:text-card-text/80"
          >
            {t("manage_drafts", language)} &rarr;
          </Link>
        </div>

        <div className="bg-card p-4 sm:p-6 rounded-xl border border-border-color shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-muted-text text-sm font-bold uppercase tracking-wider">
                {t("users", language)}
              </p>
              <h3 className="text-3xl font-bold text-card-text mt-1">
                {stats.users}
              </h3>
            </div>
            <div className="p-3 bg-muted-bg text-card-text rounded-lg">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <Link
            to="/admin/users"
            className="text-sm text-card-text font-bold hover:underline hover:text-card-text/80"
          >
            {t("system_users", language)}
          </Link>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border-color shadow-sm p-4 sm:p-6">
        <h3 className="text-lg font-bold mb-4">
          {t("recent_activity", language)}
        </h3>
        <p className="text-muted-text text-sm">
          {t("activity_logs_coming_soon", language)}
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
