import { Moon, Search, Sun, User as UserIcon } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { publicApi } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { useLayout } from "../../context/LayoutContext";
import { t } from "../../translations";
import type { Category } from "../../types";

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const {
    theme,
    toggleTheme,
    language,
    toggleLanguage,
    toggleSearch,
    currentCategory,
    setCurrentCategory,
  } = useLayout();
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchParams] = useSearchParams();

  useEffect(() => {
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

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      setCurrentCategory(categoryParam);
    } else {
      setCurrentCategory("home");
    }
  }, [searchParams, setCurrentCategory]);

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem("breachtimes-bookmarks");
    localStorage.removeItem("breachtimes-theme");
    localStorage.removeItem("breachtimes-lang");
  };

  const isAdmin = user?.role === "admin";

  return (
    <header className="border-b border-border-color sticky top-0 bg-white/90 dark:bg-card/90 backdrop-blur-md z-50 transition-colors duration-300 shadow-sm">
      <div className="container mx-auto px-4 lg:px-8 max-w-[1380px]">
        <div className="h-[70px] flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-6">
            <Link
              to="/"
              className="block text-card-text transition-transform hover:scale-[1.02] active:scale-95 duration-300"
            >
              <div className="flex items-center select-none gap-0 group">
                <span
                  className={`font-bold text-lg md:text-xl transition-all duration-300 ${
                    theme === "dark" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  Breach
                </span>
                <span
                  className={`font-bold text-lg md:text-2xl tracking-tighter leading-none transition-all duration-300 ${
                    theme === "dark" ? "text-red-400" : "text-green-600"
                  }`}
                >
                  Times
                </span>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button
              type="button"
              onClick={toggleLanguage}
              className="p-2 md:p-2.5 rounded-full hover:bg-muted-bg text-muted-text transition-all active:scale-90"
            >
              <span className="text-sm font-bold">
                {language === "bn" ? "EN" : "BN"}
              </span>
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 md:p-2.5 rounded-full hover:bg-muted-bg text-muted-text dark:text-card-text transition-all active:scale-90 theme-toggle-btn"
            >
              {theme === "dark" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>
            <button
              type="button"
              onClick={() => toggleSearch(true)}
              className="p-2 md:p-2.5 hover:bg-muted-bg rounded-full text-muted-text transition-all active:scale-95"
            >
              <Search className="w-5 h-5" />
            </button>
            {isAuthenticated && (
              <Link
                to={isAdmin ? "/admin" : "/dashboard"}
                className="p-2 md:p-2.5 hover:bg-muted-bg rounded-full text-muted-text transition-all active:scale-95"
              >
                <UserIcon className="w-5 h-5" />
              </Link>
            )}
            <div className="hidden md:flex gap-3 items-center">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-sm font-bold px-4 py-2 hover:bg-danger/10 dark:hover:bg-danger/20 text-bbcRed rounded-full transition-all flex items-center gap-2 active:scale-95"
                >
                  <div className="w-4 h-4 bg-bbcRed rounded-full text-white flex items-center justify-center text-[10px]">
                    {user?.email[0].toUpperCase()}
                  </div>{" "}
                  {t("sign_out", language)}
                </button>
              ) : (
                <Link
                  to="/login"
                  className="text-sm font-bold px-5 py-2.5 bg-card text-card-text rounded-full hover:bg-card/90 hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95"
                >
                  {t("sign_in", language)}
                </Link>
              )}
            </div>
          </div>
        </div>
        <div className="relative group">
          <nav className="flex overflow-x-auto no-scrollbar gap-8 mt-2 text-muted-text pb-2 mask-linear-gradient scroll-smooth">
            <Link
              to="/?category=home"
              onClick={() => setCurrentCategory("home")}
              className={`relative text-muted-text transition-colors duration-200 ease-out hover:text-bbcRed ${
                currentCategory === "home"
                  ? "active text-bbcRed font-semibold opacity-100"
                  : ""
              } flex-shrink-0 py-2.5 px-1 text-sm font-bold whitespace-nowrap after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:w-0 after:h-[2px] after:bg-bbcRed after:transition-all after:duration-300 after:ease-out after:-translate-x-1/2 [&.active]:after:w-full`}
            >
              {t("home", language)}
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/?category=${cat.id}`}
                onClick={() => setCurrentCategory(cat.id)}
                className={`relative text-muted-text transition-colors duration-200 ease-out hover:text-bbcRed ${
                  currentCategory === cat.id
                    ? "active text-bbcRed font-semibold opacity-100"
                    : ""
                } flex-shrink-0 py-2.5 px-1 text-sm font-bold whitespace-nowrap after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:w-0 after:h-[2px] after:bg-bbcRed after:transition-all after:duration-300 after:ease-out after:-translate-x-1/2 [&.active]:after:w-full`}
              >
                {language === "bn" ? cat.title_bn : cat.title_en}
              </Link>
            ))}
            <Link
              to="/?category=saved"
              onClick={() => setCurrentCategory("saved")}
              className={`relative text-muted-text transition-colors duration-200 ease-out hover:text-bbcRed ${
                currentCategory === "saved"
                  ? "active text-bbcRed font-semibold opacity-100"
                  : ""
              } flex-shrink-0 py-2.5 px-1 text-sm font-bold whitespace-nowrap after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:w-0 after:h-[2px] after:bg-bbcRed after:transition-all after:duration-300 after:ease-out after:-translate-x-1/2 [&.active]:after:w-full`}
            >
              {t("saved", language)}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
