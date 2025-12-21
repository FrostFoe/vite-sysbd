import { ArrowRight, Check, Copy, Globe, Info, Loader } from "lucide-react";
import type React from "react";
import { useState } from "react";
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
      const result = await adminApi.translateText(
        text,
        currentLang,
        targetLang,
      );

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
      onTranslate(translatedText.trim(), targetLang);
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
    <div className="space-y-3 mt-4 p-4 bg-muted-bg border border-border-color rounded-xl shadow-soft">
      <div className="flex items-start gap-2 pb-3">
        <Info className="w-4 h-4 text-tech flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-text leading-relaxed">
          <span className="font-semibold text-card-text">টিপ:</span> আপনার
          লেখাটি স্বয়ংক্রিয়ভাবে {langFullName[targetLang]} এ অনুবাদ করা হবে
          এবং সমস্ত ছবি ও ভিডিও সংরক্ষিত থাকবে।
        </p>
      </div>

      <button
        type="button"
        onClick={handleTranslate}
        disabled={disabled || isLoading || !text.trim()}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-tech hover:bg-tech/90 text-white rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-sm shadow-soft hover:shadow-soft-hover"
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
        <div className="p-3 bg-danger/10 border border-danger rounded-lg text-danger text-sm flex items-start gap-2">
          <span className="text-lg flex-shrink-0">⚠️</span>
          <div>
            <p className="font-medium">অনুবাদ ব্যর্থ</p>
            <p className="text-xs mt-1">{error}</p>
          </div>
        </div>
      )}

      {translatedText && isExpanded && (
        <div className="space-y-3 pt-2 border-t border-border-color">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-muted-text uppercase tracking-wider">
                ✓ অনুবাদ সফল ({langFullName[targetLang]})
              </p>
              <span className="text-xs bg-success/20 text-success px-2 py-1 rounded-full font-medium">
                প্রস্তুত
              </span>
            </div>
            <div className="max-h-48 overflow-y-auto p-3 bg-card border border-border-color rounded-lg">
              <p className="text-sm text-card-text leading-relaxed break-words">
                {translatedText}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={handleUseTranslation}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-success hover:bg-success/90 text-white rounded-lg transition-all duration-200 font-medium text-sm shadow-soft hover:shadow-soft-hover"
            >
              <Check className="w-4 h-4" />
              এটি ব্যবহার করুন
            </button>
            <button
              type="button"
              onClick={handleCopyTranslation}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-border-color hover:bg-border-color/80 text-card-text rounded-lg transition-all duration-200 font-medium text-sm"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-success" />
                  <span className="text-success">কপি করা হয়েছে</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  কপি করুন
                </>
              )}
            </button>
          </div>

          <div className="text-xs text-muted-text p-2 bg-muted-bg rounded italic border border-border-color">
            💡 "এটি ব্যবহার করুন" বাটনে ক্লিক করলে অনুবাদটি স্বয়ংক্রিয়ভাবে{" "}
            {langLabel[targetLang]} ক্ষেত্রে যুক্ত হবে।
          </div>
        </div>
      )}
    </div>
  );
};
