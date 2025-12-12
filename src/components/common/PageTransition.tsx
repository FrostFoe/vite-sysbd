import type React from "react";
import type { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

/**
 * Page Transition Wrapper Component
 * Applies smooth fade-in and up animation to pages on mount
 */
export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {children}
    </div>
  );
};

export default PageTransition;
