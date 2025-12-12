import React from "react";
import { formatTimestamp } from "../../lib/utils";
import type { Message } from "../../types";
import { Check, CheckCheck } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  language: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  language,
}) => {
  const renderStatusIcon = () => {
    if (!isOwn) return null;

    if (message.status === "read") {
      return <CheckCheck className="w-4 h-4 text-blue-500" />;
    } else if (message.status === "delivered") {
      return <CheckCheck className="w-4 h-4 text-gray-400" />;
    } else {
      return <Check className="w-4 h-4 text-gray-400" />;
    }
  };

  const renderMessageContent = () => {
    if (message.type === "image") {
      return (
        <div className="mb-2">
          <img
            src={message.content}
            alt="Shared content"
            className="max-w-xs max-h-48 rounded-lg object-cover"
          />
        </div>
      );
    } else if (message.type === "file") {
      return (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                role="img"
                aria-label="File icon"
              >
                <title>File</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium">File shared</p>
              <p className="text-xs text-muted-text">Click to download</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <p className="text-sm break-words leading-relaxed">{message.content}</p>
    );
  };

  return (
    <div
      className={`flex ${isOwn ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2`}
    >
      <div
        className={`max-w-xs md:max-w-sm lg:max-w-md relative ${isOwn ? "bg-bbcRed text-white rounded-3xl rounded-tr-sm shadow-md" : "bg-muted-bg text-card-text rounded-3xl rounded-tl-sm shadow-sm"} px-5 py-3`}
      >
        {renderMessageContent()}
        <div className="flex items-center justify-between mt-2">
          <p
            className={`text-xs ${isOwn ? "text-white/70" : "text-muted-text"}`}
          >
            {formatTimestamp(message.created_at, language as "bn" | "en")}
          </p>
          {isOwn && (
            <div className="flex items-center gap-1 ml-2">
              {renderStatusIcon()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
