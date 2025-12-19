import React, { useState } from "react";
import { Loader, Copy, Check, Globe, Info, ArrowRight } from "lucide-react";
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
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const targetLang = currentLang === "bn" ? "en" : "bn";
  const langLabel = {
    bn: "বাংলা",
    en: "English",
  };

  const langFullName = {
    bn: "Bengali",
    en: "English",
  };

  const handleTranslate = async () => {
    if (!text.trim()) {
      setError("অনুগ্রহ করে অনুবাদ করার জন্য পাঠ্য প্রবেশ করুন");
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
        setError(result.error || "অনুবাদ ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "একটি অপ্রত্যাশিত ত্রুটি ঘটেছে";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseTranslation = () => {
    if (translatedText) {
      let finalTranslation = translatedText;
      
      if (finalTranslation.includes('<')) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = finalTranslation;
        finalTranslation = tempDiv.textContent || tempDiv.innerText || finalTranslation;
      }
      
      onTranslate(finalTranslation.trim(), targetLang);
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
    <div className="space-y-3 mt-4 p-4 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900/40 dark:to-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800/40 shadow-sm">
      
      <div className="flex items-start gap-2 pb-3">
        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
          <span className="font-semibold text-gray-700 dark:text-gray-200">টিপ:</span> আপনার লেখাটি স্বয়ংক্রিয়ভাবে {langFullName[targetLang]} এ অনুবাদ করা হবে এবং সমস্ত ছবি ও ভিডিও সংরক্ষিত থাকবে।
        </p>
      </div>

      <button
        onClick={handleTranslate}
        disabled={disabled || isLoading || !text.trim()}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-sm shadow-md hover:shadow-lg"
      >
        {isLoading ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            <span>অনুবাদ করছি...</span>
          </>
        ) : (
          <>
            <Globe className="w-4 h-4" />
            <span>{langLabel[currentLang]}</span>
            <ArrowRight className="w-3 h-3" />
            <span>{langLabel[targetLang]}</span>
          </>
        )}
      </button>

      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm flex items-start gap-2">
          <span className="text-lg flex-shrink-0">⚠️</span>
          <div>
            <p className="font-medium">অনুবাদ ব্যর্থ</p>
            <p className="text-xs mt-1">{error}</p>
          </div>
        </div>
      )}

      {translatedText && isExpanded && (
        <div className="space-y-3 pt-2 border-t border-blue-200 dark:border-blue-800/40">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                ✓ অনুবাদ সফল ({langFullName[targetLang]})
              </p>
              <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full font-medium">
                প্রস্তুত
              </span>
            </div>
            <div className="max-h-48 overflow-y-auto p-3 bg-white dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed break-words">
                {translatedText}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleUseTranslation}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-all duration-200 font-medium text-sm shadow-md hover:shadow-lg"
            >
              <Check className="w-4 h-4" />
              এটি ব্যবহার করুন
            </button>
            <button
              onClick={handleCopyTranslation}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-all duration-200 font-medium text-sm"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-green-600 dark:text-green-400">কপি করা হয়েছে</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  কপি করুন
                </>
              )}
            </button>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 p-2 bg-gray-100 dark:bg-gray-800/50 rounded italic">
            💡 "এটি ব্যবহার করুন" বাটনে ক্লিক করলে অনুবাদটি স্বয়ংক্রিয়ভাবে {langLabel[targetLang]} ক্ষেত্রে যুক্ত হবে।
          </div>
        </div>
      )}
    </div>
  );
};
