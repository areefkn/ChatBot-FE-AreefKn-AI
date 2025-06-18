// src/components/chat/ChatMessageItem.tsx
"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import { Pin, PinOff } from "lucide-react"; // Tambahkan PinOff jika perlu untuk unpin langsung dari item

interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

// Ekspor interface ini agar bisa diimpor di page.tsx jika diperlukan
export interface ChatMessageItemProps {
  message: ChatMessage;
  onPinMessage?: (messageId: string) => void; // Fungsi untuk menyematkan
  isPinned?: boolean; // Untuk menandai apakah pesan ini sedang disematkan
  onUnpinMessage?: (messageId: string) => void; // Fungsi untuk melepaskan sematan
}

export function ChatMessageItem({
  message,
  onPinMessage,
  isPinned,
  onUnpinMessage,
}: ChatMessageItemProps) {
  const isUser = message.sender === "user";

  return (
    <div
      className={`group relative flex ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        // Tambahkan sedikit indikasi visual jika pesan disematkan
        className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-2xl px-4 py-2.5 rounded-xl shadow-md transition-all duration-200 ${
          isPinned
            ? isUser
              ? "ring-2 ring-amber-300"
              : "ring-2 ring-amber-400 dark:ring-amber-500"
            : ""
        } ${
          isUser
            ? "bg-indigo-500 text-white"
            : "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
        }`}
      >
        <ReactMarkdown
          className={"prose prose-sm dark:prose-invert max-w-none break-words"}
          components={{
            // Contoh kustomisasi untuk paragraf jika diperlukan
            p: ({ node, ...props }) => (
              <p className="mb-1 last:mb-0" {...props} />
            ),
          }}
        >
          {message.text}
        </ReactMarkdown>
        <p
          className={`text-xs mt-1 ${
            isUser
              ? "text-indigo-100 text-right"
              : "text-slate-400 dark:text-slate-500 text-left"
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
      {/* Tombol Aksi Pesan (Sematkan/Lepas Sematan) */}
      {/* Wrapper untuk tombol aksi, hanya muncul di desktop (md ke atas) */}
      <div className="absolute top-1 right-2 hidden md:flex flex-col items-end space-y-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
        {onPinMessage && !isPinned && message.sender === "ai" && (
          <button
            onClick={() => onPinMessage(message.id)}
            className="p-1.5 bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm rounded-md text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 shadow"
            title="Sematkan Pesan"
            aria-label="Sematkan Pesan"
          >
            <Pin size={14} />
          </button>
        )}
        {onUnpinMessage && isPinned && (
          <button
            onClick={() => onUnpinMessage(message.id)}
            className="p-1.5 bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm rounded-md text-amber-500 dark:text-amber-400 hover:text-red-500 dark:hover:text-red-400 shadow"
            title="Lepas Sematan Pesan"
            aria-label="Lepas Sematan Pesan"
          >
            <PinOff size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
