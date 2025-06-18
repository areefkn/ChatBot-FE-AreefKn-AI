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

  // useEffect hanya berjalan di sisi klien, setelah komponen di-mount
  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
      {/* Tombol Menu untuk membuka sidebar */}
      {/* Di mobile, tombol ini hanya untuk membuka. Di desktop, bisa untuk toggle. */}
      <button
        onClick={() => {
          // Untuk mobile, hanya buka jika belum terbuka.
          // Untuk desktop, ini akan menjadi toggle.
          if (
            typeof window !== "undefined" &&
            window.innerWidth < 768 &&
            isSidebarOpen
          ) {
            // 768px adalah breakpoint md Tailwind
            return; // Jangan lakukan apa-apa jika di mobile dan sidebar sudah terbuka (tutup via tombol X di dalam)
          }
          onToggleSidebar();
        }} // Tambahkan md:hidden untuk menyembunyikan di desktop
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
      <h1 className="text-lg font-semibold">{title}</h1>
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        aria-label="Ganti Tema"
        disabled={!mounted} // Nonaktifkan tombol sampai komponen di-mount
      >
        {mounted &&
          (theme === "dark" ? (
            <Sun size={20} className="text-yellow-500" />
          ) : (
            <Moon size={20} className="text-slate-700 dark:text-slate-300" />
          ))}
        {
          !mounted && (
            <div className="w-5 h-5" />
          ) /* Placeholder saat belum mounted */
        }
      </button>
    </header>
  );
}
