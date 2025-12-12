import { ArrowLeft, Inbox as InboxIcon, Info, Menu } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLayout } from "../../context/LayoutContext";
import { useMessage } from "../../context/messages/MessageContext";
import { t } from "../../lib/translations";
import { showToastMsg } from "../../lib/utils";
import MessageBubble from "../../components/messages/MessageBubble";
import MessageInput from "../../components/messages/MessageInput";

const UserInbox: React.FC = () => {
  const { user } = useAuth();
  const { language, toggleSidebar } = useLayout();
  const { state: messageState, sendMessage, markMessagesAsRead } = useMessage();
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const adminId = 1; // Assuming admin user ID is 1 as per database seed

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    // Load messages for admin conversation
    if (user?.id) {
      // Set active conversation to admin
      // Note: We'll handle this in a parent component or context
    }
  }, [user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  useEffect(() => {
    // Mark messages as read when they become visible
    if (
      messageState.messages[adminId] &&
      messageState.messages[adminId].length > 0
    ) {
      markMessagesAsRead(adminId);
    }
  }, [messageState.messages[adminId], markMessagesAsRead]);

  const handleSendMessage = useCallback(async () => {
    if (!user?.id || !messageInput.trim()) return;

    try {
      await sendMessage(adminId, messageInput.trim(), "text");
      setMessageInput("");
    } catch (_error) {
      showToastMsg(t("server_error", language), "error");
    }
  }, [user?.id, messageInput, sendMessage, language]);

  const handleFileSelect = useCallback(
    (file: File) => {
      // Handle file upload
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        // For now, we'll send the file as a base64 string
        // In a real implementation, we'd upload the file to a server and send the URL
        sendMessage(
          adminId,
          content,
          file.type.startsWith("image/") ? "image" : "file"
        );
      };
      reader.readAsDataURL(file);
    },
    [sendMessage]
  );

  const currentMessages = messageState.messages[adminId] || [];

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
            type="button"
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
        <button
          type="button"
          className="p-2 hover:bg-muted-bg rounded-lg text-muted-text transition-colors flex-shrink-0"
        >
          <Info className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 flex flex-col overflow-hidden bg-page">
          <div
            id="messages-container"
            className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 flex flex-col justify-start"
          >
            {currentMessages.length === 0 ? (
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
              currentMessages.map((msg) => {
                const isOwn = msg.sender_id === user?.id;
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
              placeholder={t("type_your_message", language)}
              disabled={messageState.loading.messages[adminId]}
              maxChars={5000}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInbox;
