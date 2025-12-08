import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLayout } from "../../context/LayoutContext";
import { t } from "../../lib/translations";
import { adminApi } from "../../lib/api";
import { Conversation, Message } from "../../types";
import { Loader, User, Send, MessageCircle, Info, Menu } from "lucide-react";
import { formatTimestamp, escapeHtml, showToastMsg } from "../../lib/utils";
import { Link } from "react-router-dom";

const AdminInbox: React.FC = () => {
  const { user } = useAuth();
  const { language, toggleSidebar } = useLayout();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string>(
    "Select a conversation",
  );
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [sortConversationsBy, setSortConversationsBy] = useState<
    "latest" | "unread" | "oldest"
  >("latest");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = useCallback(async () => {
    setIsLoadingConversations(true);
    try {
      const response =
        await adminApi.getAdminConversations(sortConversationsBy);
      if (response.success && response.conversations) {
        setConversations(response.conversations);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
      showToastMsg(t("failed_to_load_conversations", language), "error");
    } finally {
      setIsLoadingConversations(false);
    }
  }, [sortConversationsBy, language]);

  const loadMessages = useCallback(
    async (userId: number) => {
      setIsLoadingMessages(true);
      try {
        const response = await adminApi.getAdminMessages(userId);
        if (response.success && response.messages) {
          setMessages(response.messages);
        }
      } catch (error) {
        console.error("Error loading messages:", error);
        showToastMsg(t("failed_to_load_messages", language), "error");
      } finally {
        setIsLoadingMessages(false);
        scrollToBottom();
      }
    },
    [language],
  );

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 3000); // Poll for new conversations
    return () => clearInterval(interval);
  }, [loadConversations]);

  useEffect(() => {
    if (currentUserId) {
      loadMessages(currentUserId);
      const interval = setInterval(() => loadMessages(currentUserId), 2000); // Poll for new messages
      return () => clearInterval(interval);
    }
  }, [currentUserId, loadMessages]);

  const selectConversation = useCallback(
    (convUserId: number, convUserEmail: string, convUserName: string) => {
      setCurrentUserId(convUserId);
      setCurrentUserEmail(convUserEmail);
      setCurrentUserName(convUserName);
      loadMessages(convUserId);
      setMessageInput("");
      // On mobile, close sidebar after selecting conversation
      // toggleSidebar(false);
    },
    [loadMessages],
  );

  const sendMessage = useCallback(async () => {
    if (!currentUserId || !messageInput.trim()) return;

    try {
      const response = await adminApi.sendAdminMessage(
        currentUserId,
        messageInput.trim(),
      );
      if (response.success) {
        setMessageInput("");
        loadMessages(currentUserId); // Reload messages after sending
        loadConversations(); // Update conversation list (e.g., unread count)
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
  }, [currentUserId, messageInput, loadMessages, loadConversations, language]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getUnreadCount = () =>
    conversations.reduce((sum, conv) => sum + conv.unread_count, 0);

  return (
    <div className="flex flex-col h-[calc(100vh-70px)] md:h-full overflow-hidden font-sans antialiased">
      <header className="h-[70px] border-b border-border-color bg-white/90 dark:bg-card/90 backdrop-blur-md z-50 transition-colors duration-300 shadow-sm shrink-0 flex items-center px-4 lg:px-6 justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/admin"
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
          <div className="font-bold text-lg tracking-tight">
            {t("messages", language)}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            id="sort-select"
            value={sortConversationsBy}
            onChange={(e) =>
              setSortConversationsBy(
                e.target.value as typeof sortConversationsBy,
              )
            }
            className="custom-select px-3 py-2 rounded-lg border border-border-color bg-card text-card-text text-sm"
          >
            <option value="latest">{t("latest", language)}</option>
            <option value="unread">{t("unread", language)}</option>
            <option value="oldest">{t("oldest", language)}</option>
          </select>
          {getUnreadCount() > 0 && (
            <span
              id="unread-badge"
              className="bg-bbcRed text-white px-2.5 py-0.5 rounded-full text-xs font-bold"
            >
              {getUnreadCount()}
            </span>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Conversations List (Sidebar) */}
        <aside className="w-full md:w-80 bg-card border-r border-border-color md:static md:transform-none md:inset-auto transition-transform duration-300 flex flex-col h-[calc(100vh-70px)] md:h-full shadow-xl md:shadow-none overflow-y-auto">
          <div className="p-4 border-b border-border-color flex-shrink-0">
            <input
              type="text"
              placeholder={t("search_users", language)}
              className="w-full px-4 py-2.5 rounded-full border border-border-color bg-muted-bg outline-none focus:border-bbcRed transition-colors text-sm"
            />
          </div>

          <div
            id="conversations-list"
            className="flex-1 overflow-y-auto space-y-1 p-2"
          >
            {isLoadingConversations ? (
              <div className="text-center text-muted-text text-sm py-8">
                <Loader className="w-5 h-5 inline animate-spin" />{" "}
                {t("loading", language)}
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center text-muted-text text-sm py-8">
                {t("no_conversations_yet", language)}
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.user_id}
                  onClick={() =>
                    selectConversation(
                      conv.user_id,
                      conv.email,
                      conv.email.split("@")[0],
                    )
                  }
                  className={`p-3 rounded-lg hover:bg-muted-bg cursor-pointer transition-colors border border-transparent hover:border-border-color ${currentUserId === conv.user_id ? "bg-bbcRed/10 border-bbcRed" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-bbcRed to-orange-600 text-white flex items-center justify-center font-bold text-sm shadow-md flex-shrink-0">
                      {conv.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm truncate">
                        {escapeHtml(conv.email.split("@")[0])}
                      </div>
                      <div className="text-xs text-muted-text truncate">
                        {escapeHtml(conv.email)}
                      </div>
                      {conv.unread_count > 0 && (
                        <div className="text-xs text-bbcRed font-bold mt-1">
                          {conv.unread_count} {t("new_messages", language)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-page">
          <div
            id="chat-header"
            className="h-[70px] border-b border-border-color bg-card flex items-center justify-between px-4 md:px-6 flex-shrink-0"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                id="user-avatar"
                className="w-10 h-10 rounded-full bg-gradient-to-br from-bbcRed to-orange-600 text-white flex items-center justify-center font-bold text-sm shadow-md flex-shrink-0"
              >
                {currentUserName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div
                  id="chat-with-name"
                  className="font-bold text-sm leading-none"
                >
                  {currentUserName}
                </div>
                <div
                  id="chat-with-email"
                  className="text-xs text-muted-text leading-none mt-1"
                >
                  {currentUserEmail}
                </div>
              </div>
            </div>
            {/* Online indicator can be added here if backend supports presence */}
          </div>

          <div
            id="messages-container"
            className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 flex flex-col justify-start"
          >
            {isLoadingMessages ? (
              <div className="text-center text-muted-text py-12">
                <Loader className="w-8 h-8 inline animate-spin" />{" "}
                {t("loading_messages", language)}
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-muted-text py-12">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-base">
                  {t("no_messages_in_this_conversation", language)}
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isOwn = msg.sender_id === user?.id; // Assuming user.id is admin ID
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
                placeholder={t("type_a_message", language)}
                className="flex-1 px-4 py-3 rounded-full border border-border-color bg-muted-bg outline-none focus:border-bbcRed transition-colors text-sm"
                maxLength={5000}
                disabled={!currentUserId}
              />
              <button
                onClick={sendMessage}
                className="bg-bbcRed text-white px-5 py-3 rounded-full hover:bg-[var(--color-bbcRed-hover)] transition-colors font-bold shadow-md hover:shadow-lg flex-shrink-0 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title={t("send_message_enter", language)}
                disabled={!currentUserId || !messageInput.trim()}
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

export default AdminInbox;
