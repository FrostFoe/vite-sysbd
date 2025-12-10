import {
  Bookmark,
  Download,
  FileText,
  Folder,
  Layers,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageCircle,
  Shield,
} from "lucide-react";
import type React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface DashSidebarProps {
  type: "admin" | "dashboard";
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const adminNavItems = [
  { name: "Dashboard", to: "/admin", icon: LayoutDashboard, disabled: false },
  { name: "Articles", to: "/admin/articles", icon: FileText, disabled: false },
  {
    name: "Comments",
    to: "/admin/comments",
    icon: MessageCircle,
    disabled: false,
  },
  { name: "Messages", to: "/admin/inbox", icon: Mail, disabled: false },
  {
    name: "Categories",
    to: "/admin/categories",
    icon: Folder,
    disabled: false,
  },
  { name: "Sections", to: "/admin/sections", icon: Layers, disabled: false },
  {
    name: "Documents",
    to: "/admin/documents",
    icon: Download,
    disabled: false,
  },
  { name: "Users", to: "/admin/users", icon: Shield, disabled: false },
  {
    name: "Submissions",
    to: "/admin/submissions",
    icon: Download,
    disabled: false,
  },
];

const userNavItems = [
  {
    name: "Overview",
    to: "/dashboard",
    icon: LayoutDashboard,
    disabled: false,
  },
  { name: "Messages", to: "/dashboard/inbox", icon: Mail, disabled: false },
  {
    name: "Saved Articles",
    to: "/?category=saved",
    icon: Bookmark,
    disabled: false,
  },
];

const NavItem: React.FC<{
  to: string;
  icon: React.ElementType;
  children: React.ReactNode;
  disabled?: boolean;
}> = ({ to, icon: Icon, children, disabled }) => {
  const baseClasses =
    "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 group";
  const activeClasses = "bg-bbcRed text-white shadow-md shadow-red-900/20";
  const inactiveClasses =
    "text-muted-text hover:bg-muted-bg hover:text-card-text";
  const disabledClasses = "opacity-50 cursor-not-allowed";

  const content = (
    <>
      <Icon className="w-5 h-5 text-muted-text group-hover:text-bbcRed transition-colors" />
      {children}
    </>
  );

  if (disabled) {
    return (
      <div className={`${baseClasses} ${inactiveClasses} ${disabledClasses}`}>
        {content}
      </div>
    );
  }

  // Handle external link for saved articles
  if (to.startsWith("/?")) {
    return (
      <a href={to} className={`${baseClasses} ${inactiveClasses}`}>
        {content}
      </a>
    );
  }

  return (
    <NavLink
      to={to}
      end // Use 'end' to prevent parent routes from staying active
      className={({ isActive }) =>
        `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={`w-5 h-5 transition-colors ${
              isActive
                ? "text-white"
                : "text-muted-text group-hover:text-bbcRed"
            }`}
          />
          {children}
        </>
      )}
    </NavLink>
  );
};

const DashSidebar: React.FC<DashSidebarProps> = ({
  type,
  isSidebarOpen,
  toggleSidebar,
}) => {
  const { user, logout } = useAuth();
  const navItems = type === "admin" ? adminNavItems : userNavItems;
  const userName = user?.email.split("@")[0] || "User";
  const userInitial = userName ? userName[0].toUpperCase() : "U";

  return (
    <>
      {/* Sidebar Overlay (Mobile) */}
      <button
        type="button"
        id="sidebar-overlay"
        onClick={toggleSidebar}
        className={`fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm transition-opacity duration-300 ${
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Sidebar */}
      <aside
        id="sidebar"
        className={`w-64 bg-card border-r border-border-color fixed inset-y-0 left-0 top-0 md:top-[70px] z-40 transform transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:inset-auto md:transform-none flex flex-col h-full md:h-[calc(100vh-70px)] shadow-xl md:shadow-none overflow-y-auto`}
      >
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => (
            <NavItem
              key={item.name}
              to={item.to}
              icon={item.icon}
              disabled={item.disabled}
            >
              {item.name}
            </NavItem>
          ))}
        </nav>

        <div className="mt-auto p-4 border-t border-border-color">
          {/* Profile Section (Mobile) */}
          <div className="md:hidden mb-4 pb-4 border-b border-border-color">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-bbcRed to-orange-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                {userInitial}
              </div>
              <div className="text-left leading-tight flex-1 overflow-hidden">
                <div className="font-bold text-sm truncate">{userName}</div>
                <div className="text-[10px] text-muted-text truncate">
                  {user?.email}
                </div>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-danger hover:bg-danger/10 dark:hover:bg-danger/20 hover:text-danger transition-all duration-200 w-full"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default DashSidebar;
