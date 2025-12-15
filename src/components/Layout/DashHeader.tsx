import { Menu, Moon, Plus, Sun } from "lucide-react";
import type React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLayout } from "../../context/LayoutContext";

interface DashHeaderProps {
  type: "admin" | "dashboard";
  toggleSidebar: () => void;
}

const DashHeader: React.FC<DashHeaderProps> = ({ type, toggleSidebar }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useLayout();
  const isAdmin = type === "admin";

  const userName = user?.email.split("@")[0] || "User";
  const userInitial = userName ? userName[0].toUpperCase() : "U";

  return (
    <header className="h-[70px] border-b border-border-color bg-white/90 dark:bg-card/90 backdrop-blur-md z-50 transition-colors duration-300 shadow-sm shrink-0 flex items-center px-4 lg:px-8 justify-between relative min-w-0 animate-in slide-in-from-top duration-300">
      <div className="flex items-center gap-3 md:gap-4 min-w-0">
        <button
          type="button"
          onClick={toggleSidebar}
          className="md:hidden p-2 -ml-2 rounded-lg hover:bg-muted-bg text-muted-text hover:text-card-text transition-colors flex-shrink-0"
        >
          <Menu className="w-6 h-6" />
        </button>
        <Link
          to={isAdmin ? "/admin" : "/dashboard"}
          className="flex items-center select-none gap-0 group min-w-0"
        >
          <span className={`font-bold text-lg md:text-xl transition-all duration-300 flex-shrink-0 ${
            theme === 'dark'
              ? 'text-green-500'
              : 'text-red-500'
          }`}>
            Breach
          </span>
          <span className={`font-bold text-lg md:text-2xl tracking-tighter leading-none transition-all duration-300 whitespace-nowrap ${
            theme === 'dark'
              ? 'text-red-400'
              : 'text-green-600'
          }`}>
            Times{" "}
            <span className="text-xs text-muted-text font-normal ml-2 uppercase tracking-widest hidden sm:inline-block">
              {isAdmin ? "অ্যাডমিন প্যানেল" : "ড্যাশবোর্ড"}
            </span>
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
        {/* Theme Toggle Button */}
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

        {isAdmin ? (
          <Link
            to="/admin/articles/new"
            className="hidden sm:flex items-center gap-2 bg-bbcRed text-white px-2 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-colors shadow-sm hover:shadow-md flex-shrink-0"
          >
            <Plus className="w-4 h-4 flex-shrink-0" />
            <span className="hidden md:inline">নতুন</span>
            <span className="hidden lg:inline"> নিবন্ধ</span>
          </Link>
        ) : null}

        <div className="hidden md:flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l border-border-color flex-shrink-0">
          <div className="text-right hidden lg:block leading-tight flex-shrink-0">
            <div className="font-bold text-sm truncate">
              {isAdmin ? "প্রশাসক" : userName}
            </div>
            <div className="text-[10px] text-muted-text truncate">
              {user?.email}
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-bbcRed to-orange-600 text-white flex items-center justify-center font-bold text-sm shadow-md flex-shrink-0">
            {isAdmin ? "A" : userInitial}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashHeader;
