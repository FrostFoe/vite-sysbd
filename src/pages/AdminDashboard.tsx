import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLayout } from "../context/LayoutContext";
import { t } from "../lib/translations";
import { Link } from "react-router-dom";
import { FileText, MessageSquare, Edit3, Users, Loader } from "lucide-react";
import { adminApi } from "../lib/api";

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
          console.error(response.error || "Failed to fetch admin stats");
        }
      } catch (error) {
        console.error("API Error:", error);
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
      <div className="text-center py-8 text-red-500">
        {t("failed_to_load_stats", language)}
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card p-6 rounded-xl border border-border-color shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-muted-text text-sm font-bold uppercase tracking-wider">
                {t("total_articles", language)}
              </p>
              <h3 className="text-3xl font-bold text-card-text mt-1">
                {stats.articles}
              </h3>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
              <FileText className="w-6 h-6" />
            </div>
          </div>
          <Link
            to="/admin/articles"
            className="text-sm text-blue-600 font-bold hover:underline"
          >
            {t("view_details", language)} &rarr;
          </Link>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border-color shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-muted-text text-sm font-bold uppercase tracking-wider">
                {t("total_comments", language)}
              </p>
              <h3 className="text-3xl font-bold text-card-text mt-1">
                {stats.comments}
              </h3>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg">
              <MessageSquare className="w-6 h-6" />
            </div>
          </div>
          <Link
            to="/admin/comments"
            className="text-sm text-green-600 font-bold hover:underline"
          >
            {t("moderation", language)} &rarr;
          </Link>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border-color shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-muted-text text-sm font-bold uppercase tracking-wider">
                {t("drafts", language)}
              </p>
              <h3 className="text-3xl font-bold text-card-text mt-1">
                {stats.drafts}
              </h3>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 rounded-lg">
              <Edit3 className="w-6 h-6" />
            </div>
          </div>
          <Link
            to="/admin/articles?status=draft"
            className="text-sm text-yellow-600 font-bold hover:underline"
          >
            {t("manage_drafts", language)} &rarr;
          </Link>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border-color shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-muted-text text-sm font-bold uppercase tracking-wider">
                {t("users", language)}
              </p>
              <h3 className="text-3xl font-bold text-card-text mt-1">
                {stats.users}
              </h3>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <Link to="/admin/users" className="text-sm text-muted-text">
            {t("system_users", language)}
          </Link>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border-color shadow-sm p-6">
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
