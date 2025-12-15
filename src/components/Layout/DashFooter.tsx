import type React from "react";
import { useLayout } from "../../context/LayoutContext";

interface DashFooterProps {
  type: "admin" | "dashboard";
}

const DashFooter: React.FC<DashFooterProps> = ({ type }) => {
  const { theme } = useLayout();
  const year = new Date().getFullYear();
  const text = type === "admin" ? " অ্যাডমিন প্যানেল। সর্বস্বত্ব সংরক্ষিত।" : " ড্যাশবোর্ড। সর্বস্বত্ব সংরক্ষিত।";

  return (
    <footer className="border-t border-border-color bg-card py-6 mt-auto shrink-0">
      <div className="container mx-auto px-4 text-center text-muted-text text-xs">
        <span>© {year} </span>
        <span className={`font-bold ${
          theme === 'dark'
            ? 'text-green-500'
            : 'text-red-500'
        }`}>
          Breach
        </span>
        <span className={`font-bold ${
          theme === 'dark'
            ? 'text-red-400'
            : 'text-green-600'
        }`}>
          Times
        </span>
        <span>{text}</span>
      </div>
    </footer>
  );
};

export default DashFooter;
