// src/components/chat/ChatHeader.tsx
"use client";
import React from "react";
import { Menu, Sun, Moon, X } from "lucide-react";

interface ChatHeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  title: string;
}

export function ChatHeader({
  isSidebarOpen,
  onToggleSidebar,
  title,
}: ChatHeaderProps) {
  return (
    <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
      <button
        onClick={onToggleSidebar}
        className="md:hidden p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        aria-label={isSidebarOpen ? "Tutup bilah sisi" : "Buka bilah sisi"}
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      <h1 className="text-lg font-semibold">{title}</h1>
      <div className="w-10 h-10"></div>{" "}
      {/* Placeholder to maintain balance if needed, or remove if title should center */}
    </header>
  );
}
