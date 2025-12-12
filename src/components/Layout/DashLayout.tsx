import type React from "react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import DashFooter from "./DashFooter";
import DashHeader from "./DashHeader";
import DashSidebar from "./DashSidebar";

interface DashLayoutProps {
  children: ReactNode;
}

const DashLayout: React.FC<DashLayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const layoutType = location.pathname.startsWith("/admin")
    ? "admin"
    : "dashboard";

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const prevPathnameRef = useRef(location.pathname);

  useEffect(() => {
    setSidebarOpen((prev) => {
      if (location.pathname !== prevPathnameRef.current && prev) {
        prevPathnameRef.current = location.pathname;
        return false;
      }
      prevPathnameRef.current = location.pathname;
      return prev;
    });
  }, [location.pathname]);

  return (
    <div className="bg-page text-page-text font-sans transition-colors duration-500 flex flex-col h-screen overflow-hidden">
      {/* Toast Container Placeholder */}
      <output
        id="toast-container"
        aria-live="polite"
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[120] pointer-events-none w-full max-w-sm flex flex-col items-center gap-2"
      />

      {/* Header is part of the main layout, not the sidebar/content flex container */}
      <DashHeader type={layoutType} toggleSidebar={toggleSidebar} />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        <DashSidebar
          type={layoutType}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />

        {/* Content Wrapper */}
        <div
          className="flex-1 flex flex-col overflow-y-auto bg-page relative w-full scroll-smooth"
          id="main-scroll"
        >
          <main className="flex-grow container mx-auto px-4 lg:px-8 max-w-[1200px] py-8">
            {children}
          </main>

          <DashFooter type={layoutType} />
        </div>
      </div>
    </div>
  );
};

export default DashLayout;
