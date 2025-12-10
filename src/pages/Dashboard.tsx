import { Bookmark, Mail } from "lucide-react";
import type React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLayout } from "../context/LayoutContext";
import { t } from "../lib/translations";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLayout();

  if (!user) {
    return <div>{t("not_logged_in", language)}</div>; // Should be handled by ProtectedRoute
  }

  return (
    <div className="bg-card p-8 rounded-2xl shadow-soft border border-border-color">
      <div className="flex items-center gap-3 mb-8">
        <span className="w-2 h-8 rounded-full bg-bbcRed" />
        <h2 className="text-2xl font-bold">
          {t("dashboard_overview", language)}
        </h2>
      </div>
      <div className="text-lg text-muted-text">
        <p>
          {t("welcome", language)},{" "}
          <span className="font-bold">{user.email}</span>!{" "}
          {t("this_is_your_personal_dashboard", language)}
        </p>
        <p className="mt-4">
          {t("your_role", language)}:{" "}
          <span className="font-bold uppercase">{user.role}</span>
        </p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-muted-bg p-6 rounded-xl shadow-sm border border-border-color">
            <h3 className="font-bold text-xl mb-3 text-card-text">
              {t("quick_links", language)}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to={`/?category=saved`}
                  className="text-bbcRed hover:underline flex items-center gap-2"
                >
                  <Bookmark className="w-4 h-4" />{" "}
                  {t("saved_articles", language)}
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard/inbox"
                  className="text-bbcRed hover:underline flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" /> {t("messages", language)}
                </Link>
              </li>
            </ul>
          </div>
          <div className="bg-muted-bg p-6 rounded-xl shadow-sm border border-border-color">
            <h3 className="font-bold text-xl mb-3 text-card-text">
              {t("your_activity", language)}
            </h3>
            <p className="text-muted-text">
              {t("activity_placeholder", language)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
