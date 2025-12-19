import React, { useState } from "react";
import { Loader, Copy, Check, Globe } from "lucide-react";
import { adminApi } from "../../api";

interface TranslationWidgetProps {
  text: string;
  onTranslate: (translation: string, targetLang: "bn" | "en") => void;
  currentLang?: "bn" | "en";
  disabled?: boolean;
  buttonLabel?: string;
}

export const TranslationWidget: React.FC<TranslationWidgetProps> = ({
  text,
  onTranslate,
  currentLang = "bn",
  disabled = false,
  buttonLabel = "Translate",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const targetLang = currentLang === "bn" ? "en" : "bn";
  const langLabel = {
    bn: "Bengali",
    en: "English",
  };

  const handleTranslate = async () => {
    if (!text.trim()) {
      setError("Please enter text to translate");
      return;
    }

    setIsLoading(true);
    setError(null);
    setTranslatedText(null);

    try {
      const result = await adminApi.translateText(text, currentLang, targetLang);

      if (result.success && result.translation) {
        setTranslatedText(result.translation);
        setIsExpanded(true);
      } else {
        setError(result.error || "Translation failed. Please try again.");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseTranslation = () => {
    if (translatedText) {
      onTranslate(translatedText, targetLang);
      setTranslatedText(null);
      setIsExpanded(false);
    }
  };

  const handleCopyTranslation = () => {
    if (translatedText) {
      navigator.clipboard.writeText(translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleTranslate}
        disabled={disabled || isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
      >
        {isLoading ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            <span>Translating...</span>
          </>
        ) : (
          <>
            <Globe className="w-4 h-4" />
            <span>
              {buttonLabel} to {langLabel[targetLang]}
            </span>
          </>
        )}
      </button>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {translatedText && isExpanded && (
        <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-lg space-y-3">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Translation ({langLabel[targetLang]})
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed break-words">
              {translatedText}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleUseTranslation}
              className="flex-1 px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-all duration-200 text-sm font-medium"
            >
              Use Translation
            </button>
            <button
              onClick={handleCopyTranslation}
              className="px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-all duration-200"
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
