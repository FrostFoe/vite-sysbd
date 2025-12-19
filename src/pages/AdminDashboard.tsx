import {
  Download,
  FileStack,
  FileText,
  Loader,
  MessageSquare,
  Users,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../api";
import { useAuth } from "../context/AuthContext";
import { showToastMsg } from "../utils";

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
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const response = await adminApi.getAdminStats();
        if (response.success && response.stats) {
          setStats(response.stats);
        } else {
        }
      } catch (_error) {
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const response = await adminApi.exportAllData();
      if (response.success && response.data) {
        const jsonString = JSON.stringify(response.data, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `breachtimes-export-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToastMsg("ডেটা সফলভাবে এক্সপোর্ট হয়েছে");
      } else {
        showToastMsg(response.error || "এক্সপোর্ট করতে ব্যর্থ", "error");
      }
    } catch (_error) {
      showToastMsg("সার্ভার ত্রুটি!", "error");
    } finally {
      setIsExporting(false);
    }
  };

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
              <FileStack className="w-6 h-6" />
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">সাম্প্রতিক কার্যকলাপ</h3>
          <button
            type="button"
            onClick={handleExportData}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-bbcRed text-white rounded-lg font-bold hover:bg-bbcRed/90 transition-colors disabled:opacity-50 text-sm"
          >
            {isExporting ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            ডেটা এক্সপোর্ট করুন
          </button>
        </div>
        <p className="text-muted-text text-sm">
          সমস্ত ডেটা (ব্যবহারকারী, নিবন্ধ, মন্তব্য, জমা) JSON ফরম্যাটে ডাউনলোড করুন।
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
