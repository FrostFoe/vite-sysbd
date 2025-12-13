import { ChevronRight, LayoutDashboard, LogOut, Shield, X } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLayout } from "../../context/LayoutContext";
import { publicApi } from "../../lib/api";
import { t } from "../../lib/translations";
import type { Category } from "../../types";

const MobileSidebar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { language, isSidebarOpen, toggleSidebar, setCurrentCategory } =
    useLayout();
  const [categories, setCategories] = React.useState<Category[]>([]);

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await publicApi.getHomeData(language);
        if (response.categories) {
          setCategories(response.categories);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, [language]);

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem("breachtimes-bookmarks");
    localStorage.removeItem("breachtimes-theme");
    localStorage.removeItem("breachtimes-lang");
    toggleSidebar(false);
  };

  const isAdmin = user?.role === "admin";

  return (
    <>
      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm transition-opacity duration-300 opacity-100"
          onClick={() => toggleSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 bottom-0 z-[60] w-full sm:w-2/3 md:w-1/2 lg:w-1/4 bg-white/95 dark:bg-black/95 backdrop-blur-xl transition-all duration-300 shadow-2xl ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-6 border-b border-border-color">
          <div className="font-bold text-2xl dark:text-white tracking-tight">
            {t("menu", language)}
          </div>
          <button
            type="button"
            onClick={() => toggleSidebar(false)}
            className="p-2 hover:bg-muted-bg rounded-full transition-transform hover:rotate-90 dark:text-white active:scale-95"
          >
            <X className="w-8 h-8" />
          </button>
        </div>
        <div className="p-6 h-full overflow-y-auto pb-20 no-scrollbar">
          <div className="mb-8 space-y-4">
            {isAuthenticated ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 px-2 mb-2">
                  <div className="w-10 h-10 rounded-full bg-bbcRed text-white flex items-center justify-center font-bold text-lg">
                    {user?.email[0].toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-bbcDark dark:text-white text-sm">
                      {t("welcome", language)}
                    </span>
                    <span className="text-xs text-muted-text truncate max-w-[200px]">
                      {user?.email}
                    </span>
                  </div>
                </div>
                {isAdmin ? (
                  <Link
                    to="/admin"
                    onClick={() => toggleSidebar(false)}
                    className="w-full py-3 bg-bbcRed text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-bbcRed/20 hover:shadow-lg hover:shadow-bbcRed/40 hover:bg-opacity-90 hover:-translate-y-0.5 transition-all active:scale-95"
                  >
                    <Shield className="w-5 h-5" /> {t("admin_panel", language)}
                  </Link>
                ) : (
                  <Link
                    to="/dashboard"
                    onClick={() => toggleSidebar(false)}
                    className="w-full py-3 bg-bbcRed text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-bbcRed/20 hover:shadow-lg hover:shadow-bbcRed/40 hover:bg-opacity-90 hover:-translate-y-0.5 transition-all active:scale-95"
                  >
                    <LayoutDashboard className="w-5 h-5" />{" "}
                    {t("dashboard", language)}
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-3 bg-muted-bg text-bbcDark dark:text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-danger/10 dark:hover:bg-danger/20 hover:text-danger hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-95"
                >
                  <LogOut className="w-5 h-5" /> {t("sign_out", language)}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Link
                  to="/login"
                  onClick={() => toggleSidebar(false)}
                  className="w-full py-3 bg-bbcDark dark:bg-white text-white dark:text-black rounded-xl font-bold shadow-lg hover:shadow-lg hover:bg-opacity-90 dark:hover:bg-opacity-90 hover:-translate-y-0.5 transition-all active:scale-95 text-center"
                >
                  {t("sign_in", language)}
                </Link>
                <Link
                  to="/register"
                  onClick={() => toggleSidebar(false)}
                  className="w-full py-3 border border-bbcDark dark:border-white text-bbcDark dark:text-white rounded-xl font-bold hover:bg-muted-bg dark:hover:bg-gray-800/50 hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-95 text-center"
                >
                  {t("register", language)}
                </Link>
              </div>
            )}
          </div>
          <ul className="space-y-2 font-bold text-xl text-bbcDark dark:text-gray-200">
            <li className="border-b border-gray-100 dark:border-gray-800/50 pb-2 last:border-0">
              <Link
                to="/?category=home"
                onClick={() => {
                  setCurrentCategory("home");
                  toggleSidebar(false);
                }}
                className="w-full text-left py-4 flex justify-between items-center hover:text-bbcRed hover:pl-3 transition-all duration-300 group"
              >
                <span>{t("home", language)}</span>
                <ChevronRight className="w-5 h-5 text-black dark:text-gray-400 group-hover:text-bbcRed transition-colors" />
              </Link>
            </li>
            {categories.map((cat) => (
              <li
                key={cat.id}
                className="border-b border-gray-100 dark:border-gray-800/50 pb-2 last:border-0"
              >
                <Link
                  to={`/?category=${cat.id}`}
                  onClick={() => {
                    setCurrentCategory(cat.id);
                    toggleSidebar(false);
                  }}
                  className="w-full text-left py-4 flex justify-between items-center hover:text-bbcRed hover:pl-3 transition-all duration-300 group"
                >
                  <span>{language === "bn" ? cat.title_bn : cat.title_en}</span>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-bbcRed transition-colors" />
                </Link>
              </li>
            ))}
            <li className="border-b border-gray-100 dark:border-gray-800/50 pb-2 last:border-0">
              <Link
                to="/?category=saved"
                onClick={() => {
                  setCurrentCategory("saved");
                  toggleSidebar(false);
                }}
                className="w-full text-left py-4 flex justify-between items-center hover:text-bbcRed hover:pl-3 transition-all duration-300 group"
              >
                <span>{t("saved", language)}</span>
                <ChevronRight className="w-5 h-5 text-black dark:text-gray-400 group-hover:text-bbcRed transition-colors" />
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default MobileSidebar;
