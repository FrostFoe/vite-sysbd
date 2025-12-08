import React from "react";
import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import MobileSidebar from "./MobileSidebar";
import SearchOverlay from "./SearchOverlay";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="bg-page text-page-text font-sans transition-colors duration-500 antialiased selection:bg-bbcRed selection:text-white flex flex-col min-h-screen">
      {/* Progress Bar Placeholder (will be implemented with state later if needed) */}
      <div
        id="progress-bar"
        className="fixed top-0 left-0 h-1 bg-bbcRed z-[100] shadow-[0_0_10px_var(--color-bbcRed)]"
        style={{ width: "0%" }}
        aria-hidden="true"
      ></div>

      <Header />
      <MobileSidebar />
      <SearchOverlay />

      <main className="flex-grow container mx-auto px-4 lg:px-8 max-w-[1380px] py-4">
        {children}
      </main>

      {/* Toast Container Placeholder (will be implemented with state later if needed) */}
      <div
        id="toast-container"
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[110] pointer-events-none w-full max-w-sm flex flex-col items-center gap-2"
      ></div>

      <Footer />
    </div>
  );
};

export default MainLayout;
