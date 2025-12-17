import { ArrowLeft, Loader } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLayout } from "../../context/LayoutContext";
import { adminApi } from "../../lib/api";
import { t } from "../../lib/translations";
import { showToastMsg } from "../../lib/utils";

interface AdminUser {
  id: number;
  email: string;
  role: "admin" | "user";
  is_muted: number | null;
  reason: string | null;
  muted_at: string | null;
  created_at: string;
}

const UserDetail: React.FC = () => {
  const { userId: userIdParam } = useParams<{ userId: string }>();
  const userId = userIdParam ? parseInt(userIdParam, 10) : null;
  const { language } = useLayout();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const response = await adminApi.getUsers();
        if (response.success && response.users) {
          const foundUser = (response.users as unknown as AdminUser[]).find(
            (u) => u.id === userId
          );
          if (foundUser) {
            setUser(foundUser);
          } else {
            showToastMsg(t("user_not_found", language), "error");
          }
        }
      } catch (_error) {
        showToastMsg(t("server_error", language), "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [userId, language]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-8 h-8 animate-spin text-bbcRed" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-text">{t("invalid_user", language)}</p>
      </div>
    );
  }

  const isMuted = !!user.is_muted;

  return (
    <div className="max-w-2xl mx-auto p-3 sm:p-4 md:p-6">
      <Link
        to="/admin/users"
        className="flex items-center gap-2 text-bbcRed hover:opacity-80 mb-4 sm:mb-6 text-sm"
      >
        <ArrowLeft className="w-4 sm:w-5 h-4 sm:h-5" />
        {t("back", language)}
      </Link>

      <div className="bg-card rounded-xl border border-border-color p-4 sm:p-6 shadow-sm">
        <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-gradient-to-br from-bbcRed to-orange-600 flex items-center justify-center text-white text-base sm:text-2xl font-bold flex-shrink-0">
            {user.email.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold truncate">
              {user.email}
            </h1>
            <p className="text-muted-text text-xs sm:text-sm">ID: {user.id}</p>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div>
            <div className="text-[10px] sm:text-xs font-bold text-muted-text uppercase">
              {t("role", language)}
            </div>
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold mt-1 ${user.role === "admin" ? "bg-danger/10 dark:bg-danger/20 text-danger" : "bg-muted-bg text-card-text"}`}
            >
              {user.role}
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-muted-text uppercase">
              {t("status", language)}
            </div>
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold mt-1 ${isMuted ? "bg-danger/10 dark:bg-danger/20 text-danger" : "bg-success/10 dark:bg-success/20 text-success"}`}
            >
              {isMuted ? t("muted", language) : t("active", language)}
            </div>
          </div>

          {isMuted && user.reason && (
            <div className="bg-danger/5 dark:bg-danger/10 p-3 rounded-lg">
              <div className="text-xs font-bold text-danger block mb-1">
                {t("mute_reason", language)}
              </div>
              <p className="text-sm text-card-text">{user.reason}</p>
            </div>
          )}

          <div>
            <div className="text-xs font-bold text-muted-text uppercase">
              {t("created", language)}
            </div>
            <p className="text-sm text-card-text mt-1">
              {new Date(user.created_at).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
