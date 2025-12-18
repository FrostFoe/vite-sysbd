import {
  Bitcoin,
  ChevronUp,
  Coins,
  Copy,
  Facebook,
  Twitter,
  Youtube,
} from "lucide-react";
import React, { useEffect } from "react";
import { useLayout } from "../../context/LayoutContext";
import { t } from "../../lib/translations";
import { showToastMsg } from "../../lib/utils";

const Footer: React.FC = () => {
  const { language, theme } = useLayout();

  const copyToClipboard = (text: string, successMsg: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showToastMsg(successMsg, "success");
      })
      .catch(() => {
        showToastMsg("Failed to copy", "error");
      });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [showScrollButton, setShowScrollButton] = React.useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <footer className="pt-12 sm:pt-16 pb-6 sm:pb-8 bg-card text-card-text transition-colors border-t border-border-color mt-auto">
      <div className="container mx-auto px-4 lg:px-8 max-w-[1380px]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 sm:mb-12 border-b border-border-color pb-8 sm:pb-12 gap-4 sm:gap-8">
          <div className="flex items-center select-none gap-0 group">
            <span
              className={`font-bold text-lg md:text-xl transition-all duration-300 ${
                theme === "dark" ? "text-green-500" : "text-red-500"
              }`}
            >
              Breach
            </span>
            <span
              className={`font-bold text-lg md:text-2xl tracking-tighter leading-none transition-all duration-300 ${
                theme === "dark" ? "text-red-400" : "text-green-600"
              }`}
            >
              Times
            </span>
          </div>
          <div className="flex gap-4 sm:gap-6">
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-muted-bg rounded-full hover:bg-bbcRed transition-colors"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="https://twitter.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-muted-bg rounded-full hover:bg-bbcRed transition-colors"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="https://www.youtube.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-muted-bg rounded-full hover:bg-bbcRed transition-colors"
            >
              <Youtube className="w-5 h-5" />
            </a>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8 md:gap-12 mb-8 sm:mb-12">
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-bold text-base sm:text-lg mb-4 sm:mb-6 flex items-center gap-2">
              <Coins className="w-5 h-5 text-bbcRed" />{" "}
              {t("newsletter", language)}
            </h3>
            <p className="text-muted-text text-xs sm:text-sm mb-4 max-w-sm">
              {t("subscribe_newsletter", language)}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 max-w-md">
              <input
                type="email"
                placeholder={t("your_email", language)}
                className="p-2.5 sm:p-3 text-sm bg-muted-bg text-card-text rounded-lg border border-border-color focus:outline-none focus:border-bbcRed flex-grow"
              />
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    "subscribed",
                    t("subscribed_successfully", language)
                  )
                }
                className="bg-bbcRed text-white font-bold px-4 sm:px-6 py-2.5 sm:py-3 text-sm rounded-lg hover:bg-opacity-90 hover:shadow-md transition-all"
              >
                {t("subscribe", language)}
              </button>
            </div>
          </div>
          <div className="col-span-1 md:col-span-2 space-y-4">
            <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
              <Coins className="w-5 h-5 text-bbcRed" />{" "}
              {t("support_work", language)}
            </h3>
            <p className="text-muted-text text-xs sm:text-sm max-w-sm">
              {t("support_text", language)}
            </p>

            <div className="space-y-3 mt-4">
              {/* USDT Section */}
              <div className="bg-muted-bg p-2.5 sm:p-3 rounded-lg border border-border-color hover:border-success/50 transition-colors duration-300">
                <div className="flex items-center gap-2 mb-1">
                  <Coins className="w-4 h-4 text-success" />
                  <span className="font-bold text-xs text-card-text uppercase tracking-wide">
                    USDT (TRC-20)
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 bg-card p-2 rounded border border-border-color">
                  <code className="text-[9px] sm:text-[10px] text-muted-text break-all font-mono">
                    TNztLXjP7zYWotPRpzdtPCNVu8JB3DG5jV
                  </code>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        "TNztLXjP7zYWotPRpzdtPCNVu8JB3DG5jV",
                        t("link_copied", language)
                      )
                    }
                    className="text-success hover:text-success/70 p-1 transition-colors flex-shrink-0 active:scale-95"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Bitcoin Section */}
              <div className="bg-muted-bg p-3 rounded-lg border border-border-color hover:border-warning/50 transition-colors duration-300">
                <div className="flex items-center gap-2 mb-1">
                  <Bitcoin className="w-4 h-4 text-warning" />
                  <span className="font-bold text-xs text-card-text uppercase tracking-wide">
                    Bitcoin (BTC)
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 bg-card p-2 rounded border border-border-color">
                  <code className="text-[9px] sm:text-[10px] text-muted-text break-all font-mono">
                    18kgAYsUMVF51MNUeMt6vr1WhfgHtzcWai
                  </code>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        "18kgAYsUMVF51MNUeMt6vr1WhfgHtzcWai",
                        t("link_copied", language)
                      )
                    }
                    className="text-warning hover:text-warning/70 p-1 transition-colors flex-shrink-0 active:scale-95"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border-color text-xs text-muted-text">
          <p>{t("copyright", language)}</p>
        </div>
      </div>

      <button
        type="button"
        id="back-to-top"
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 p-3 rounded-full shadow-xl z-50 transition-all duration-300 bg-bbcRed text-white hover:bg-bbcRed/90 hover:scale-110 ${
          showScrollButton
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10 pointer-events-none"
        }`}
      >
        <ChevronUp className="w-5 h-5" />
      </button>
    </footer>
  );
};

export default Footer;
