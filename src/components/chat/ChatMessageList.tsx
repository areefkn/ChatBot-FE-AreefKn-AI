// src/components/chat/ChatMessageList.tsx
"use client";

import { X, Pin } from "lucide-react"; // Tambahkan Pin
import React, { LegacyRef } from "react";
import { ChatMessageItem } from "./ChatMessageItem"; // Asumsi ChatMessageItem.tsx ada di direktori yang sama

interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

interface ChatMessageListProps {
  messages: ChatMessage[];
  isSending: boolean;
  chatContainerRef: LegacyRef<HTMLDivElement> | undefined;
  activeSessionName?: string; // Opsional, untuk pesan placeholder
  pinnedMessages?: ChatMessage[];
  onUnpinMessage?: (messageId: string) => void;
  onPinMessage?: (messageId: string) => void; // Tambahkan prop ini
}

export function ChatMessageList({
  messages,
  isSending,
  chatContainerRef,
  activeSessionName,
  pinnedMessages = [],
  onUnpinMessage,
  onPinMessage,
}: ChatMessageListProps) {
  return (
    <div
      ref={chatContainerRef}
      className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto no-scrollbar"
    >
      {/* Area untuk Pesan Disematkan (Contoh Struktur) */}
      {pinnedMessages.length > 0 && (
        <div className="mb-4 border-b border-slate-300 dark:border-slate-600 pb-3">
          <h4 className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 px-1">
            <Pin size={14} className="text-slate-400 dark:text-slate-500" />
            Pesan Disematkan
          </h4>
          <div className="space-y-1.5">
            {pinnedMessages.map((pinnedMsg) => (
              <div
                key={`pinned-${pinnedMsg.id}`}
                className="bg-cyan-50 dark:bg-cyan-900/40 p-2.5 rounded-lg text-xs relative group shadow-sm border border-cyan-200 dark:border-cyan-700/50"
              >
                <div className="flex items-start justify-between">
                  <p className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap break-words mr-2 text-sm leading-snug">
                    {" "}
                    {/* slate/white combination for text is fine */}
                    {/* Tampilkan sedikit teks, atau buat komponen preview khusus */}
                    {pinnedMsg.text.length > 120
                      ? `${pinnedMsg.text.substring(0, 120)}...`
                      : pinnedMsg.text}
                  </p>
                  {onUnpinMessage && (
                    <button
                      onClick={() => onUnpinMessage(pinnedMsg.id)}
                      className="p-1 rounded-md text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 flex-shrink-0 focus:outline-none"
                      title="Lepas Sematan"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {new Date(pinnedMsg.timestamp).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daftar Pesan Utama */}
      <div className="space-y-4 flex-grow">
        {messages.length === 0 && !isSending ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-slate-400 dark:text-slate-500">
              {activeSessionName
                ? `Kirim pesan untuk memulai percakapan di "${activeSessionName}".`
                : "Buat atau pilih sesi chat untuk memulai."}
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessageItem
              key={msg.id}
              message={msg}
              onPinMessage={onPinMessage} // Teruskan fungsi pin
              isPinned={pinnedMessages.some((pm) => pm.id === msg.id)} // Cek apakah pesan ini disematkan
              onUnpinMessage={onUnpinMessage} // Teruskan fungsi unpin
            />
          ))
        )}
        {isSending && (
          <div className="flex justify-start">
            <div className="max-w-xs md:max-w-md lg:max-w-lg xl:max-w-2xl px-4 py-2.5 rounded-xl shadow-md bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-75"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-150"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-300"></div>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  AI sedang berpikir...
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
