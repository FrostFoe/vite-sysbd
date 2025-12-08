import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLayout } from "../../context/LayoutContext";
import { t } from "../../lib/translations";
import { Menu, Sun, Moon, Search, Shield, LayoutDashboard } from "lucide-react";
import type { Category } from "../../types";
import { publicApi } from "../../lib/api"; // Import publicApi for categories

interface HeaderProps {
  // Add any specific props if needed
}

const Header: React.FC<HeaderProps> = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const {
    theme,
    toggleTheme,
    language,
    toggleLanguage,
    toggleSidebar,
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
  }, [language]); // Refetch categories if language changes

  useEffect(() => {
    // Update current category from URL search params
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      setCurrentCategory(categoryParam);
    } else {
      setCurrentCategory("home");
    }
  }, [searchParams, setCurrentCategory]);

  const handleLogout = async () => {
    await logout();
    // Clear local storage items as in PHP version
    localStorage.removeItem("breachtimes-bookmarks");
    localStorage.removeItem("breachtimes-theme");
    localStorage.removeItem("breachtimes-lang");
    // Optionally redirect
  };

  const isAdmin = user?.role === "admin";

  return (
    <header className="border-b border-border-color sticky top-0 bg-white/90 dark:bg-card/90 backdrop-blur-md z-50 transition-colors duration-300 shadow-sm">
      <div className="container mx-auto px-4 lg:px-8 max-w-[1380px]">
        <div className="h-[70px] flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-6">
            <button
              onClick={() => toggleSidebar(true)}
              className="p-2 md:p-2.5 hover:bg-muted-bg rounded-full text-muted-text dark:text-card-text transition-colors active:scale-95"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link
              to="/"
              className="block text-card-text transition-transform hover:scale-[1.02] active:scale-95 duration-300"
            >
              <div className="flex items-center select-none gap-2 group">
                <span className="bg-bbcRed text-white px-2.5 py-0.5 font-bold text-lg md:text-xl rounded shadow-md group-hover:bg-[var(--color-bbcRed-hover)] transition-colors duration-300">
                  B
                </span>
                <span className="font-bold text-lg md:text-2xl tracking-tight leading-none text-card-text group-hover:text-muted-text dark:group-hover:text-muted-text transition-colors">
                  BT
                </span>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={toggleLanguage}
              className="p-2 md:p-2.5 rounded-full hover:bg-muted-bg text-muted-text dark:text-green-400 transition-all active:scale-90"
            >
              <span className="text-sm font-bold">
                {language === "bn" ? "EN" : "BN"}
              </span>
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 md:p-2.5 rounded-full hover:bg-muted-bg text-muted-text dark:text-yellow-400 transition-all active:scale-90 theme-toggle-btn"
            >
              {theme === "dark" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => toggleSearch(true)}
              className="p-2 md:p-2.5 hover:bg-muted-bg rounded-full text-muted-text dark:text-white transition-all active:scale-95"
            >
              <Search className="w-5 h-5" />
            </button>
            <div className="hidden md:flex gap-3 items-center">
              {isAuthenticated ? (
                <>
                  {isAdmin ? (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 px-4 py-2 bg-bbcRed text-white rounded-full text-sm font-bold shadow-lg shadow-bbcRed/30 hover:bg-red-700 hover:scale-105 transition-all mr-2 active:scale-95"
                    >
                      <Shield className="w-4 h-4" />{" "}
                      {t("admin_panel", language)}
                    </Link>
                  ) : (
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 bg-bbcRed text-white rounded-full text-sm font-bold shadow-lg shadow-bbcRed/30 hover:bg-red-700 hover:scale-105 transition-all mr-2 active:scale-95"
                    >
                      <LayoutDashboard className="w-4 h-4" />{" "}
                      {t("dashboard", language)}
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-sm font-bold px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-bbcRed rounded-full transition-all flex items-center gap-2 active:scale-95"
                  >
                    <div className="w-4 h-4 bg-bbcRed rounded-full text-white flex items-center justify-center text-[10px]">
                      {user?.email[0].toUpperCase()}
                    </div>{" "}
                    {t("sign_out", language)}
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="text-sm font-bold px-5 py-2.5 bg-bbcDark dark:bg-white text-white dark:text-black rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95"
                >
                  {t("sign_in", language)}
                </Link>
              )}
            </div>
          </div>
        </div>
        <div className="relative group">
          <nav className="flex overflow-x-auto no-scrollbar gap-8 mt-2 text-gray-700 dark:text-gray-300 pb-2 mask-linear-gradient scroll-smooth">
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
