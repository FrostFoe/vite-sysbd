import React, { useRef, useEffect } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { useLayout } from '../../context/LayoutContext';
import { t } from '../../lib/translations';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSendMessage: () => void;
  onFileSelect?: (file: File) => void;
  placeholder?: string;
  disabled?: boolean;
  maxChars?: number;
}

const MessageInput: React.FC<MessageInputProps> = ({
  value,
  onChange,
  onSendMessage,
  onFileSelect,
  placeholder,
  disabled = false,
  maxChars = 5000,
}) => {
  const { language } = useLayout();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      // Auto-resize textarea
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onSendMessage();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleSendClick = () => {
    if (value.trim() && !disabled) {
      onSendMessage();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file && onFileSelect) {
          onFileSelect(file);
        }
        return;
      }
    }
  };

  return (
    <div className="relative">
      <div className="flex gap-3 items-end">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={placeholder || t('type_a_message', language)}
            className="w-full px-4 py-3 pr-12 rounded-2xl border border-border-color bg-muted-bg outline-none focus:border-bbcRed transition-colors text-sm resize-none max-h-40"
            maxLength={maxChars}
            disabled={disabled}
            rows={1}
          />
          <div className="absolute right-3 bottom-3 flex gap-1">
            <span className="text-xs text-muted-text">
              {value.length}/{maxChars}
            </span>
          </div>
        </div>
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-3 rounded-full bg-muted-bg hover:bg-border-color transition-colors text-muted-text disabled:opacity-50 disabled:cursor-not-allowed"
          title={t('attach_file', language)}
          disabled={disabled}
        >
          <Paperclip className="w-5 h-5" />
        </button>
        
        <button
          type="button"
          onClick={handleSendClick}
          className="bg-bbcRed text-white p-3 rounded-full hover:bg-[var(--color-bbcRed-hover)] transition-colors font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          title={t('send_message_enter', language)}
          disabled={disabled || !value.trim()}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
      
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,.pdf,.doc,.docx"
      />
    </div>
  );
};

export default MessageInput;