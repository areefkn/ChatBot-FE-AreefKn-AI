// src/components/chat/ChatInputBar.tsx
"use client";
import React, { useRef, useEffect } from "react";
import { Paperclip, Send } from "lucide-react";

interface ChatInputBarProps {
  message: string;
  onMessageChange: (value: string) => void;
  onSendMessage: () => Promise<void>;
  isSending: boolean;
}

export function ChatInputBar({
  message,
  onMessageChange,
  onSendMessage,
  isSending,
}: ChatInputBarProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset tinggi untuk mendapatkan scrollHeight yang benar
      textarea.style.height = "auto";
      // Atur tinggi baru berdasarkan scrollHeight, dengan batas maksimum.
      // Nilai 128px (sekitar 5-6 baris) bisa disesuaikan.
      const maxHeight = 128; // dalam piksel
      const newHeight = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.height = `${newHeight}px`;
    }
  }, [message]); // Atur ulang tinggi setiap kali pesan berubah

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && message.trim() && !isSending) {
      e.preventDefault();
      await onSendMessage();
    }
  };

  return (
    <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
      <div className="flex items-end gap-2">
        {/* Wrapper untuk textarea dan tombol lampirkan. 
            flex-grow agar mengambil sisa ruang horizontal. */}
        <div className="relative flex-grow">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            className="w-full flex justify-between py-2.5 pl-4 pr-12 text-sm bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 focus:border-cyan-500 dark:focus:border-cyan-400 resize-none placeholder-slate-400 dark:placeholder-slate-500 overflow-y-hidden no-scrollbar"
            placeholder="tanyakan sesuatu ke AreefKn."
            rows={1} // rows={1} penting untuk perhitungan awal scrollHeight
            style={{
              lineHeight: "1.625rem",
              minHeight: "calc(1.625rem + 1.25rem)",
            }} // minHeight = lineHeight + (paddingY * 2)
            disabled={isSending}
            onKeyDown={handleKeyDown}
          />
          <button
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 text-slate-400 hover:text-indigo-500 dark:text-slate-300 dark:hover:text-indigo-400 focus:outline-none"
            aria-label="Lampirkan file"
            disabled={isSending}
          >
            <Paperclip size={20} />
          </button>
        </div>
        <button
          className="h-[calc(1.625rem+1.25rem)] px-4 bg-indigo-500 text-white rounded-lg font-semibold hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-1 dark:focus:ring-offset-slate-800 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center" // Tinggi tombol disamakan dengan textarea 1 baris
          disabled={!message.trim() || isSending}
          onClick={onSendMessage}
        >
          {isSending ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Send size={18} />
          )}
        </button>
      </div>
    </div>
  );
}
