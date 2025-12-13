import { Search as SearchIcon, X } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useLayout } from "../../context/LayoutContext";
import { publicApi } from "../../lib/api";
import { t } from "../../lib/translations";
import type { Article } from "../../types";

const SearchOverlay: React.FC = () => {
  const { language, isSearchOpen, toggleSearch } = useLayout();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Article[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(async () => {
      if (query.length > 1) {
        try {
          const results = await publicApi.searchArticles(query, language);
          setSearchResults(results);
        } catch (error) {
          console.error("Search failed:", error);
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);
  };

  return (
    <div
      className={`fixed inset-0 z-[70] bg-white/98 dark:bg-card/98 backdrop-blur-md overflow-y-auto transition-all duration-300 no-scrollbar ${
        isSearchOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
    >
      <div className="max-w-[1000px] mx-auto p-6 pt-12">
        <div className="flex justify-end mb-12">
          <button
            type="button"
            onClick={() => toggleSearch(false)}
            className="p-3 bg-muted-bg rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-black dark:text-white transition-all hover:rotate-90"
          >
            <X className="w-8 h-8" />
          </button>
        </div>
        <div className="relative mb-16 group">
          <SearchIcon className="absolute left-0 top-1/2 transform -translate-y-1/2 text-muted-text w-6 h-6 md:w-10 md:h-10 group-focus-within:text-bbcRed transition-colors" />
          <input
            type="text"
            placeholder={t("search_placeholder", language)}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            ref={searchInputRef}
            className="w-full py-4 pl-10 md:pl-14 text-2xl md:text-4xl font-bold border-b-2 border-border-color focus:border-bbcRed dark:focus:border-bbcRed outline-none bg-transparent text-bbcDark dark:text-white placeholder-gray-300 dark:placeholder-gray-700 transition-colors"
          />
        </div>
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          id="search-results-container"
        >
          {searchResults.length > 0
            ? searchResults.map((article) => (
                <Link
                  key={article.id}
                  to={`/article/${article.id}`}
                  onClick={() => toggleSearch(false)}
                  className="group cursor-pointer flex flex-col h-full bg-card-elevated rounded-2xl overflow-hidden shadow-soft hover:shadow-soft-hover transition-all duration-300 hover:-translate-y-1 border border-border-color"
                >
                  <div className="overflow-hidden aspect-video relative">
                    <img
                      src={
                        article.image ||
                        "https://placehold.co/600x400/1a1a1a/FFF?text=BreachTimes"
                      }
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-col flex-grow p-5">
                    <h3 className="text-lg md:text-xl font-bold mb-3 leading-tight group-hover:text-bbcRed transition-colors text-card-text">
                      {article.title}
                    </h3>
                    <p className="text-muted-text text-sm leading-relaxed mb-4 line-clamp-3">
                      {article.summary}
                    </p>
                  </div>
                </Link>
              ))
            : searchQuery.length > 1 && (
                <p className="text-muted-text">
                  No results found for "{searchQuery}"
                </p>
              )}
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
