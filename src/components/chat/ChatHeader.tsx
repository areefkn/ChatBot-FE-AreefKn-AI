// src/components/chat/ChatHeader.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
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
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggleTheme = () => {
    if (!mounted) return;
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const renderToggleIcon = () => {
    if (!mounted) {
      return (
        <Sun
          size={20}
          className="text-slate-400 dark:text-slate-500 opacity-50"
        />
      );
    }
    return theme === "dark" ? (
      <Sun size={20} className="text-yellow-500" />
    ) : (
      <Moon size={20} className="text-slate-700 dark:text-slate-300" />
    );
  };

  return (
    <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
      <button
        onClick={() => {
          if (
            typeof window !== "undefined" &&
            window.innerWidth < 768 &&
            isSidebarOpen
          ) {
            return;
          }
          onToggleSidebar();
        }}
        className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 md:hidden"
        aria-label={
          isSidebarOpen &&
          typeof window !== "undefined" &&
          window.innerWidth >= 768
            ? "Tutup bilah sisi"
            : "Buka bilah sisi"
        }
      >
        {isSidebarOpen &&
        typeof window !== "undefined" &&
        window.innerWidth >= 768 ? (
          <X size={24} />
        ) : (
          <Menu size={24} />
        )}
      </button>

      <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h1>

      <button
        onClick={handleToggleTheme}
        className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        aria-label="Ganti Tema"
        disabled={!mounted}
      >
        {renderToggleIcon()}
      </button>
    </header>
  );
}
