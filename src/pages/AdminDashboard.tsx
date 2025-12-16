import { Edit3, FileText, Loader, MessageSquare, Users } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { adminApi } from "../lib/api";

interface AdminStats {
  articles: string;
  comments: string;
  drafts: string;
  users: string;
}

const AdminDashboard: React.FC = () => {
  useAuth();
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
        পরিসংখ্যান লোড করতে ব্যর্থ হয়েছে।
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
                মোট নিবন্ধ
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
            বিস্তারিত দেখুন &rarr;
          </Link>
        </div>

        <div className="bg-card p-4 sm:p-6 rounded-xl border border-border-color shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-muted-text text-sm font-bold uppercase tracking-wider">
                মোট মন্তব্য
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
            পর্যবেক্ষণ &rarr;
          </Link>
        </div>

        <div className="bg-card p-4 sm:p-6 rounded-xl border border-border-color shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-muted-text text-sm font-bold uppercase tracking-wider">
                খসড়া
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
            খসড়া পরিচালনা করুন &rarr;
          </Link>
        </div>

        <div className="bg-card p-4 sm:p-6 rounded-xl border border-border-color shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-muted-text text-sm font-bold uppercase tracking-wider">
                ব্যবহারকারী
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
            সিস্টেম ব্যবহারকারী
          </Link>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border-color shadow-sm p-4 sm:p-6">
        <h3 className="text-lg font-bold mb-4">সাম্প্রতিক কার্যকলাপ</h3>
        <p className="text-muted-text text-sm">ক্রিয়াকলাপ লগ শীঘ্রই আসছে...</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
