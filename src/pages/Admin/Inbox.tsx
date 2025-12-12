import { ArrowLeft, Loader, Menu, MessageCircle } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CustomDropdown } from "../../components/common/CustomDropdown";
import { useAuth } from "../../context/AuthContext";
import { useLayout } from "../../context/LayoutContext";
import { useMessage } from "../../context/messages/MessageContext";
import { t } from "../../lib/translations";
import { escapeHtml, showToastMsg } from "../../lib/utils";
import type { Conversation } from "../../types";
import MessageBubble from "../../components/messages/MessageBubble";
import MessageInput from "../../components/messages/MessageInput";

const AdminInbox: React.FC = () => {
  const { user } = useAuth();
  const { language, toggleSidebar } = useLayout();
  const {
    state: messageState,
    loadConversations,
    loadMessages,
    sendMessage,
    setActiveConversation,
    markMessagesAsRead,
  } = useMessage();
  const [messageInput, setMessageInput] = useState("");
  const [sortConversationsBy, setSortConversationsBy] = useState<
    "latest" | "unread" | "oldest"
  >("latest");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    loadConversations(sortConversationsBy);
  }, [loadConversations, sortConversationsBy]);

  useEffect(() => {
    if (messageState.activeConversation?.user_id) {
      loadMessages(messageState.activeConversation.user_id);
    }
  }, [messageState.activeConversation?.user_id, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  useEffect(() => {
    // Mark messages as read when they become visible
    if (
      messageState.activeConversation?.user_id &&
      messageState.messages[messageState.activeConversation.user_id]
    ) {
      markMessagesAsRead(messageState.activeConversation.user_id);
    }
  }, [
    messageState.messages[messageState.activeConversation?.user_id || 0],
    markMessagesAsRead,
    messageState.activeConversation?.user_id,
  ]);

  const handleSendMessage = useCallback(async () => {
    if (!messageState.activeConversation?.user_id || !messageInput.trim())
      return;

    try {
      await sendMessage(
        messageState.activeConversation.user_id,
        messageInput.trim(),
        "text"
      );
      setMessageInput("");
    } catch (_error) {
      showToastMsg(t("server_error", language), "error");
    }
  }, [
    messageState.activeConversation?.user_id,
    messageInput,
    sendMessage,
    language,
  ]);

  const handleFileSelect = useCallback(
    (file: File) => {
      // Handle file upload
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        // For now, we'll send the file as a base64 string
        // In a real implementation, we'd upload the file to a server and send the URL
        if (messageState.activeConversation?.user_id) {
          sendMessage(
            messageState.activeConversation.user_id,
            content,
            file.type.startsWith("image/") ? "image" : "file"
          );
        }
      };
      reader.readAsDataURL(file);
    },
    [sendMessage, messageState.activeConversation?.user_id]
  );

  const selectConversation = useCallback(
    (conversation: Conversation) => {
      setActiveConversation(conversation);
      setMessageInput("");
    },
    [setActiveConversation]
  );

  const getUnreadCount = () =>
    messageState.conversations.reduce(
      (sum, conv) => sum + conv.unread_count,
      0
    );

  const currentMessages = messageState.activeConversation?.user_id
    ? messageState.messages[messageState.activeConversation.user_id] || []
    : [];

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
            type="button"
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
          <CustomDropdown
            id="sort-select"
            value={sortConversationsBy}
            onChange={(value) =>
              setSortConversationsBy(value as typeof sortConversationsBy)
            }
            options={[
              { value: "latest", label: t("latest", language) },
              { value: "unread", label: t("unread", language) },
              { value: "oldest", label: t("oldest", language) },
            ]}
          />
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
            {messageState.loading.conversations ? (
              <div className="text-center text-muted-text text-sm py-8">
                <Loader className="w-5 h-5 inline animate-spin" />{" "}
                {t("loading", language)}
              </div>
            ) : messageState.conversations.length === 0 ? (
              <div className="text-center text-muted-text text-sm py-8">
                {t("no_conversations_yet", language)}
              </div>
            ) : (
              messageState.conversations.map((conv) => (
                <button
                  type="button"
                  key={conv.user_id}
                  onClick={() => selectConversation(conv)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      selectConversation(conv);
                    }
                  }}
                  className={`w-full text-left p-3 rounded-lg hover:bg-muted-bg cursor-pointer transition-colors border border-transparent hover:border-border-color ${messageState.activeConversation?.user_id === conv.user_id ? "bg-bbcRed/10 border-bbcRed" : ""}`}
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
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Chat Area */}
        {messageState.activeConversation ? (
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
                  {messageState.activeConversation.email
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    id="chat-with-name"
                    className="font-bold text-sm leading-none"
                  >
                    {messageState.activeConversation.email.split("@")[0]}
                  </div>
                  <div
                    id="chat-with-email"
                    className="text-xs text-muted-text leading-none mt-1"
                  >
                    {messageState.activeConversation.email}
                  </div>
                </div>
              </div>
              {/* Online indicator can be added here if backend supports presence */}
            </div>

            <div
              id="messages-container"
              className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 flex flex-col justify-start"
            >
              {messageState.loading.messages[
                messageState.activeConversation.user_id
              ] ? (
                <div className="text-center text-muted-text py-12">
                  <Loader className="w-8 h-8 inline animate-spin" />{" "}
                  {t("loading_messages", language)}
                </div>
              ) : currentMessages.length === 0 ? (
                <div className="text-center text-muted-text py-12">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-base">
                    {t("no_messages_in_this_conversation", language)}
                  </p>
                </div>
              ) : (
                currentMessages.map((msg) => {
                  const isOwn = msg.sender_id === user?.id; // Assuming user.id is admin ID
                  return (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      isOwn={isOwn}
                      language={language}
                    />
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-border-color bg-card p-4 md:p-6 flex-shrink-0">
              <MessageInput
                value={messageInput}
                onChange={setMessageInput}
                onSendMessage={handleSendMessage}
                onFileSelect={handleFileSelect}
                placeholder={t("type_a_message", language)}
                disabled={
                  !messageState.activeConversation ||
                  messageState.loading.messages[
                    messageState.activeConversation.user_id
                  ]
                }
                maxChars={5000}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-page text-center p-8">
            <MessageCircle className="w-16 h-16 text-muted-text mb-4" />
            <h3 className="text-xl font-bold mb-2">
              {t("select_conversation", language)}
            </h3>
            <p className="text-muted-text">
              {t("choose_conversation_to_start_messaging", language)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInbox;
