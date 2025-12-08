import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLayout } from "../../context/LayoutContext";
import { t } from "../../lib/translations";
import { publicApi } from "../../lib/api";
import type { Message } from "../../types";
import {
  ArrowLeft,
  Menu,
  Send,
  Inbox as InboxIcon,
  Loader,
  Info,
} from "lucide-react";
import { Link } from "react-router-dom";
import { escapeHtml, formatTimestamp, showToastMsg } from "../../lib/utils";

const UserInbox: React.FC = () => {
  const { user } = useAuth();
  const { language, toggleSidebar } = useLayout();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const adminId = 1; // Assuming admin user ID is 1 as per database seed

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const response = await publicApi.getMessagesWithAdmin(adminId); // This API call needs to be created/modified
      if (response.success && response.messages) {
        setMessages(response.messages);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, adminId]);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 2000); // Poll for new messages
    return () => clearInterval(interval);
  }, [loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!user?.id || !messageInput.trim()) return;

    try {
      // publicApi.sendMessage needs to be created/modified to allow user to send to admin
      const response = await publicApi.sendMessageToAdmin(messageInput.trim());
      if (response.success) {
        setMessageInput("");
        loadMessages(); // Reload messages after sending
      } else {
        showToastMsg(
          response.error || t("failed_to_send_message", language),
          "error",
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      showToastMsg(t("server_error", language), "error");
    }
  }, [user?.id, messageInput, loadMessages, language]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Loader className="w-10 h-10 animate-spin text-bbcRed" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-70px)] md:h-full overflow-hidden font-sans">
      <header className="h-[70px] border-b border-border-color bg-white/90 dark:bg-card/90 backdrop-blur-md z-50 transition-colors duration-300 shadow-sm flex items-center px-4 lg:px-6 justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="p-2 -ml-2 rounded-lg hover:bg-muted-bg text-muted-text hover:text-card-text transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <button
            onClick={() => toggleSidebar(true)}
            className="md:hidden p-2 -ml-2 rounded-lg hover:bg-muted-bg text-muted-text hover:text-card-text transition-colors flex-shrink-0"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-bbcRed to-orange-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
              A
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm leading-none">
                BreachTimes Support
              </div>
              <div className="text-xs text-muted-text leading-none">Online</div>
            </div>
          </div>
        </div>
        <button className="p-2 hover:bg-muted-bg rounded-lg text-muted-text transition-colors flex-shrink-0">
          <Info className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 flex flex-col overflow-hidden bg-page">
          <div
            id="messages-container"
            className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 flex flex-col justify-start"
          >
            {messages.length === 0 ? (
              <div className="text-center text-muted-text py-12">
                <InboxIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-base">
                  {t("no_messages_in_conversation", language)}
                </p>
                <p className="text-sm mt-1">
                  {t("start_conversation", language)}
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isOwn = msg.sender_id === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2`}
                  >
                    <div
                      className={`max-w-xs md:max-w-sm lg:max-w-md ${isOwn ? "bg-bbcRed text-white rounded-3xl rounded-tr-sm shadow-md" : "bg-muted-bg text-card-text rounded-3xl rounded-tl-sm shadow-sm"} px-5 py-3`}
                    >
                      <p className="text-sm break-words leading-relaxed">
                        {escapeHtml(msg.content)}
                      </p>
                      <p
                        className={`text-xs ${isOwn ? "text-white/70" : "text-muted-text"} mt-2 text-right`}
                      >
                        {formatTimestamp(msg.created_at, language)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-border-color bg-card p-4 md:p-6 flex-shrink-0">
            <div className="flex gap-3">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t("type_your_message", language)}
                className="flex-1 px-4 py-3 rounded-full border border-border-color bg-muted-bg outline-none focus:border-bbcRed transition-colors text-sm"
                maxLength={5000}
              />
              <button
                onClick={sendMessage}
                className="bg-bbcRed text-white px-5 py-3 rounded-full hover:bg-[var(--color-bbcRed-hover)] transition-colors font-bold shadow-md hover:shadow-lg flex-shrink-0 flex items-center gap-2"
                title={t("send_message_enter", language)}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs text-muted-text mt-2 px-1">
              <span>{messageInput.length}</span>/5000
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInbox;
