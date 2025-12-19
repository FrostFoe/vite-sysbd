import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface LayoutContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
  language: "en" | "bn";
  toggleLanguage: () => void;
  isSearchOpen: boolean;
  toggleSearch: (open?: boolean) => void;
  currentCategory: string;
  setCurrentCategory: (category: string) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const savedTheme = localStorage.getItem("breachtimes-theme");
    return savedTheme === "dark" ? "dark" : "light";
  });

  const [language, setLanguage] = useState<"en" | "bn">(() => {
    const savedLang = localStorage.getItem("breachtimes-lang");
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get("lang");
    return langParam === "en" || langParam === "bn"
      ? langParam
      : savedLang === "en" || savedLang === "bn"
        ? savedLang
        : "en";
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<string>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("category") || "home";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("breachtimes-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("breachtimes-lang", language);
    document.documentElement.lang = language;
    // Update URL parameter without reload
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("lang", language);
    window.history.replaceState({}, "", `?${urlParams.toString()}`);
  }, [language]);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage((prevLang) => (prevLang === "bn" ? "en" : "bn"));
  }, []);

  const toggleSearch = useCallback((open?: boolean) => {
    setIsSearchOpen((prev) => (open !== undefined ? open : !prev));
  }, []);

  return (
    <LayoutContext.Provider
      value={{
        theme,
        toggleTheme,
        language,
        toggleLanguage,
        isSearchOpen,
        toggleSearch,
        currentCategory,
        setCurrentCategory,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

// Allow both components and hooks in context files
// eslint-disable-next-line react-refresh/only-export-components
export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
};
