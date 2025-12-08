import React, { useState, useEffect } from "react";
import { useLayout } from "../../context/LayoutContext";
import { t } from "../../lib/translations";
import {
  Facebook,
  Twitter,
  Youtube,
  Coins,
  Bitcoin,
  Copy,
  ChevronUp,
} from "lucide-react";

interface FooterProps {
  // Add any specific props if needed
}

const Footer: React.FC<FooterProps> = () => {
  const { language } = useLayout();

  const copyToClipboard = (text: string, successMsg: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        // In a real app, you'd use a toast notification system here
        alert(successMsg);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // State for scroll button visibility
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
    <footer className="pt-16 pb-8 bg-card text-card-text transition-colors border-t border-border-color mt-auto">
      <div className="container mx-auto px-4 lg:px-8 max-w-[1380px]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-border-color pb-12 gap-8">
          <div className="flex items-center select-none gap-2">
            <span className="bg-bbcRed text-white px-3 py-1 font-bold text-2xl rounded shadow">
              B
            </span>
            <span className="font-bold text-3xl tracking-tighter leading-none">
              BT
            </span>
          </div>
          <div className="flex gap-6">
            <a
              href="#"
              className="p-2 bg-muted-bg rounded-full hover:bg-bbcRed transition-colors"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="p-2 bg-muted-bg rounded-full hover:bg-bbcRed transition-colors"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="p-2 bg-muted-bg rounded-full hover:bg-bbcRed transition-colors"
            >
              <Youtube className="w-5 h-5" />
            </a>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Coins className="w-5 h-5 text-bbcRed" />{" "}
              {t("newsletter", language)}
            </h3>
            <p className="text-muted-text text-sm mb-4 max-w-sm">
              {t("subscribe_newsletter", language)}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 max-w-md">
              <input
                type="email"
                placeholder={t("your_email", language)}
                className="p-3 bg-muted-bg text-card-text rounded-lg border border-border-color focus:outline-none focus:border-bbcRed flex-grow"
              />
              <button
                onClick={() =>
                  copyToClipboard(
                    "subscribed",
                    t("subscribed_successfully", language),
                  )
                }
                className="bg-bbcDark text-white dark:bg-white dark:text-black font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-colors"
              >
                {t("subscribe", language)}
              </button>
            </div>
          </div>
          <div className="col-span-1 md:col-span-2 space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Coins className="w-5 h-5 text-bbcRed" />{" "}
              {t("support_work", language)}
            </h3>
            <p className="text-muted-text text-sm max-w-sm">
              {t("support_text", language)}
            </p>

            <div className="space-y-3 mt-4">
              <div className="bg-muted-bg p-3 rounded-lg border border-border-color">
                <div className="flex items-center gap-2 mb-1">
                  <Coins className="w-4 h-4 text-success" />
                  <span className="font-bold text-xs text-card-text">
                    USDT (TRC-20)
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 bg-card p-2 rounded border border-border-color">
                  <code className="text-[10px] text-muted-text break-all">
                    TNztLXjP7zYWotPRpzdtPCNVu8JB3DG5jV
                  </code>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        "TNztLXjP7zYWotPRpzdtPCNVu8JB3DG5jV",
                        t("link_copied", language),
                      )
                    }
                    className="text-bbcRed hover:text-red-700 p-1"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="bg-muted-bg p-3 rounded-lg border border-border-color">
                <div className="flex items-center gap-2 mb-1">
                  <Bitcoin className="w-4 h-4 text-warning" />
                  <span className="font-bold text-xs text-card-text">
                    Bitcoin (BTC)
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 bg-card p-2 rounded border border-border-color">
                  <code className="text-[10px] text-muted-text break-all">
                    18kgAYsUMVF51MNUeMt6vr1WhfgHtzcWai
                  </code>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        "18kgAYsUMVF51MNUeMt6vr1WhfgHtzcWai",
                        t("link_copied", language),
                      )
                    }
                    className="text-bbcRed hover:text-red-700 p-1"
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
        id="back-to-top"
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 p-3 rounded-full shadow-xl z-50 transition-all duration-300 bg-black/80 backdrop-blur text-white hover:bg-black dark:bg-white/90 dark:text-black dark:hover:bg-white hover:scale-110 ${
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
