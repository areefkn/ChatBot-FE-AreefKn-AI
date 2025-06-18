// src/components/chat/ChatSidebar.tsx
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  PlusCircle,
  Trash2,
  FilePenLine,
  Check,
  X,
  MoreVertical,
} from "lucide-react";

interface ChatSession {
  id: string;
  name: string;
  createdAt: Date;
  // messages: ChatMessage[]; // Tidak perlu messages di sini untuk display sidebar
}

interface ChatSidebarProps {
  isOpen: boolean;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, newName: string) => void; // Prop baru
}

export function ChatSidebar({
  isOpen,
  sessions,
  activeSessionId,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onRenameSession,
}: ChatSidebarProps) {
  const [hoveredSessionId, setHoveredSessionId] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>("");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingSessionId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingSessionId]);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdownId(null);
      }
    },
    [setOpenDropdownId]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    }; // Dependency array should include handleClickOutside
  }, [editingSessionId, handleClickOutside]);

  return (
    <aside
      className={`bg-white dark:bg-slate-800 shadow-lg transition-all duration-300 ease-in-out ${
        isOpen ? "w-64 p-4" : "w-0"
      } md:w-80 md:p-4 flex-shrink-0 overflow-hidden`}
    >
      <div className="flex flex-col h-full">
        <button
          onClick={onNewChat}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 mb-4 text-sm font-medium border rounded-lg border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <PlusCircle size={18} />
          Chat Baru
        </button>
        <div className="flex-grow overflow-y-auto space-y-2 pr-1">
          {sessions
            .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
            .map((session) => (
              <div
                key={session.id}
                className="relative flex items-center group w-full"
                onMouseEnter={() => setHoveredSessionId(session.id)}
                onMouseLeave={() => setHoveredSessionId(null)}
              >
                {editingSessionId === session.id ? (
                  <div className="flex items-center w-full">
                    <input
                      ref={inputRef}
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          if (editingName.trim()) {
                            onRenameSession(session.id, editingName.trim());
                          }
                          setEditingSessionId(null);
                        } else if (e.key === "Escape") {
                          setEditingSessionId(null);
                        }
                      }}
                      className="flex-grow p-2 mr-1 text-sm bg-slate-100 dark:bg-slate-700 border border-indigo-500 rounded-md focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                    <button
                      onClick={() => {
                        if (editingName.trim()) {
                          onRenameSession(session.id, editingName.trim());
                        }
                        setEditingSessionId(null);
                      }}
                      className="p-1.5 rounded-md text-green-600 hover:bg-green-100 dark:hover:bg-green-700"
                      title="Simpan Nama"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => setEditingSessionId(null)}
                      className="p-1.5 rounded-md text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700"
                      title="Batal"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => onSelectSession(session.id)}
                      className={`w-full text-left pl-3 pr-8 py-2 rounded-md text-sm truncate ${
                        activeSessionId === session.id
                          ? "bg-indigo-100 dark:bg-indigo-700 text-indigo-700 dark:text-indigo-100 font-medium"
                          : "hover:bg-slate-100 dark:hover:bg-slate-700 "
                      }`}
                      title={session.name}
                    >
                      {session.name}
                    </button>
                    <div className="absolute right-1 flex items-center">
                      {/* Tombol Titik Tiga */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdownId(
                            openDropdownId === session.id ? null : session.id
                          );
                        }}
                        className={`p-1.5 rounded-md text-slate-500 dark:text-slate-400  ${
                          openDropdownId === session.id
                            ? "bg-slate-200 dark:bg-slate-700"
                            : "hover:bg-slate-200 dark:hover:bg-slate-700"
                        } ${
                          hoveredSessionId === session.id ||
                          activeSessionId === session.id ||
                          openDropdownId === session.id
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100"
                        } focus:opacity-100 transition-opacity`}
                        title="Opsi Lainnya"
                        aria-haspopup="true"
                        aria-expanded={openDropdownId === session.id}
                      >
                        <MoreVertical size={16} />
                      </button>

                      {/* Dropdown Menu */}
                      {openDropdownId === session.id && (
                        <div
                          ref={dropdownRef}
                          className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-700 rounded-md shadow-lg ring-1 ring-black/5 dark:ring-white/10 z-20 py-1"
                          role="menu"
                          aria-orientation="vertical"
                          aria-labelledby={`options-menu-${session.id}`}
                        >
                          <button
                            onClick={() => {
                              setEditingSessionId(session.id);
                              setEditingName(session.name);
                              setOpenDropdownId(null); // Tutup dropdown setelah memilih
                            }}
                            className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600"
                            role="menuitem"
                          >
                            <FilePenLine size={15} className="mr-2" />
                            Ubah Nama
                          </button>
                          <button
                            onClick={() => {
                              onDeleteSession(session.id);
                              setOpenDropdownId(null); // Tutup dropdown setelah memilih
                            }}
                            className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50"
                            role="menuitem"
                          >
                            <Trash2 size={15} className="mr-2" />
                            Hapus
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
                {/* Div untuk menutup dropdown saat klik di luar, hanya aktif jika dropdown terbuka */}
                {editingSessionId !== session.id &&
                  openDropdownId === session.id && (
                    <div
                      className="fixed inset-0 z-0"
                      onClick={() => setOpenDropdownId(null)}
                    />
                  )}
              </div>
            ))}
          {sessions.length === 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-400 px-2 text-center">
              Belum ada sesi chat.
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
