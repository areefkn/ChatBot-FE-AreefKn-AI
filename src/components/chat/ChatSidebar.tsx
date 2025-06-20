// src/components/chat/ChatSidebar.tsx
"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale"; // Untuk format bahasa Indonesia
import {
  PlusCircle,
  Trash2,
  FilePenLine,
  Check,
  X,
  Pin,
  PinOff, // Impor ikon PinOff
  MessageSquare,
  MoreVertical, // Ikon untuk menu konteks
} from "lucide-react";

export interface ChatSession {
  // Tambahkan 'export'
  id: string;
  name: string;
  createdAt: Date;
  isPinned?: boolean; // Properti baru untuk status pin
  lastMessagePreview?: string; // Properti baru untuk pratinjau pesan
}

interface ChatSidebarProps {
  isOpen: boolean;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, newName: string) => void; // Prop baru
  onTogglePin: (sessionId: string) => void; // Prop baru untuk pin/unpin sesi
  onCloseSidebarMobile?: () => void; // Prop untuk menutup sidebar dari dalam (khusus mobile)
}

const ChatSidebarComponent = React.forwardRef<HTMLElement, ChatSidebarProps>(
  (
    {
      isOpen,
      sessions,
      activeSessionId,
      onNewChat,
      onSelectSession,
      onDeleteSession,
      onRenameSession,
      onTogglePin,
      onCloseSidebarMobile,
    },
    ref
  ) => {
    const [editingSessionId, setEditingSessionId] = useState<string | null>(
      null
    );
    const [editingName, setEditingName] = useState<string>("");
    const [contextMenuSessionId, setContextMenuSessionId] = useState<
      string | null
    >(null); // State untuk menu konteks
    const contextMenuRef = useRef<HTMLDivElement>(null); // Ref untuk menu konteks
    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
      if (editingSessionId && inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, [editingSessionId]);

    // Efek untuk menutup menu konteks jika diklik di luar
    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (
          contextMenuRef.current &&
          !contextMenuRef.current.contains(event.target as Node)
        ) {
          setContextMenuSessionId(null);
        }
      }
      if (contextMenuSessionId) {
        document.addEventListener("mousedown", handleClickOutside);
      }
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [contextMenuSessionId]);

    const sortedPinnedSessions = useMemo(
      () =>
        sessions
          .filter((session) => session.isPinned)
          .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
      [sessions]
    );

    const sortedUnpinnedSessions = useMemo(
      () =>
        sessions
          .filter((session) => !session.isPinned)
          .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
      [sessions]
    );

    return (
      <aside
        ref={ref} // Gunakan ref yang diteruskan
        className={`fixed inset-y-0 left-0 z-30 dark:bg-slate-800 shadow-xl transition-transform duration-300 ease-in-out 
                 md:relative md:translate-x-0 md:w-80 md:p-4 md:flex-shrink-0 
                 ${
                   isOpen
                     ? "translate-x-0 w-full p-4"
                     : "-translate-x-full w-full p-4 md:w-0 md:p-0"
                 } 
                 overflow-hidden flex flex-col`} // Shadow sedikit lebih tebal
        onClick={(e) => {
          // console.log("Aside (ChatSidebar) clicked, stopping propagation."); // Untuk debugging jika perlu
          e.stopPropagation();
        }}
      >
        <div className="flex flex-col h-full relative">
          {/* Tambahkan relative jika tombol close absolut di dalam sini */}
          <div className="flex items-center justify-between mb-4 pr-1">
            {" "}
            {/* Tambah pr-1 untuk ruang tombol X */}
            <button
              onClick={onNewChat}
              className="flex items-center justify-center gap-2 flex-grow mr-2 px-4 py-2.5 text-sm font-medium border rounded-lg border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <PlusCircle size={18} />
              Chat Baru
            </button>
            {/* Tombol Tutup Sidebar Khusus Mobile (di dalam sidebar) */}
            {isOpen && onCloseSidebarMobile && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Penting agar tidak memicu klik lain
                  onCloseSidebarMobile();
                }}
                className="md:hidden p-2 ml-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 dark:focus:ring-offset-slate-800"
                aria-label="Tutup bilah sisi"
              >
                <X size={20} />
              </button>
            )}
          </div>
          <div className="flex-grow overflow-y-auto no-scrollbar">
            {/* Pinned Sessions */}
            {sortedPinnedSessions.length > 0 && (
              <div className="mb-3">
                <div className="sticky top-0 bg-slate-100 dark:bg-slate-700/50 z-10 px-2 py-2 mb-1 rounded-t-md">
                  <h3 className="text-xs font-bold tracking-wider uppercase text-cyan-600 dark:text-cyan-400 flex items-center">
                    <Pin
                      size={12}
                      className="mr-1.5" // Warna sudah diatur di parent
                    />
                    TERSEMAT
                  </h3>
                </div>
                <div className="space-y-1.5 bg-slate-50 dark:bg-slate-700 p-2 rounded-b-md">
                  {" "}
                  {/* Konsistenkan BG dengan unpinned */}
                  {sortedPinnedSessions.map(renderSessionItem)}
                </div>
              </div>
            )}

            {/* Unpinned Sessions */}
            {sortedUnpinnedSessions.length > 0 && (
              <div className="mb-3">
                {" "}
                {/* Pastikan div ini TIDAK memiliki bg-gray-50, p-2, rounded-lg */}
                <div
                  className={`sticky top-0 rounded-t-md bg-slate-100 dark:bg-slate-700/50 z-10 px-2 py-2 mb-1 ${
                    /* Disesuaikan dengan header pinned */
                    sortedPinnedSessions.length > 0 ? "pt-2" : ""
                  }`}
                >
                  <h3 className="text-xs font-bold tracking-wider uppercase text-indigo-600 dark:text-indigo-400 flex items-center">
                    {" "}
                    {/* Warna berbeda untuk unpinned header */}
                    <MessageSquare size={12} className="mr-1.5" />
                    PERCAKAPAN
                  </h3>
                </div>
                {/* Tambahkan kelas background di sini untuk area daftar sesi TIDAK TERSEMAT */}
                {/* Contoh: bg-gray-50 untuk light mode, dark:bg-slate-600 untuk dark mode */}
                <div className="space-y-1.5 bg-slate-50 dark:bg-slate-700 p-2 rounded-b-md">
                  {" "}
                  {/* BG konsisten, padding dan radius diterapkan di sini */}{" "}
                  {/* BG, padding, dan radius diterapkan di sini */}
                  {sortedUnpinnedSessions.map(renderSessionItem)}
                </div>
              </div>
            )}

            {sessions.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400 dark:text-slate-500 text-center px-2">
                <MessageSquare className="h-10 w-10 mb-2 opacity-50" />
                <p className="font-medium">Belum ada percakapan</p>
                <p className="text-sm">Mulai percakapan baru</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    );

    function renderSessionItem(session: ChatSession) {
      const isActive = activeSessionId === session.id;
      const previewText = session.lastMessagePreview || "Belum ada pesan";

      if (editingSessionId === session.id) {
        return (
          <div key={session.id} className="flex items-center w-full p-2">
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
        );
      }

      return (
        <div
          key={session.id}
          className={`group p-2.5 rounded-lg cursor-pointer flex flex-col transition-all duration-200 ease-in-out ${
            /* Tambah transisi all */
            isActive
              ? "bg-gradient-to-r from-cyan-100 via-sky-100 to-indigo-100 dark:from-cyan-700/50 dark:via-sky-700/50 dark:to-indigo-700/50 border-l-4 border-cyan-500 dark:border-cyan-400 shadow-lg ring-1 ring-cyan-500/20 dark:ring-cyan-400/20"
              : "bg-white dark:bg-slate-800 border-l-4 border-transparent hover:bg-slate-200/70 dark:hover:bg-slate-600/50 hover:border-slate-300 dark:hover:border-slate-500"
          }`}
          onClick={() => onSelectSession(session.id)}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              {" "}
              {/* min-w-0 untuk truncate */}
              <h3
                className={`truncate text-sm ${
                  isActive
                    ? "font-semibold text-cyan-700 dark:text-cyan-300"
                    : "font-medium text-slate-700 dark:text-slate-200 group-hover:text-slate-800 dark:group-hover:text-slate-100"
                }`}
              >
                {session.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate group-hover:text-slate-600 dark:group-hover:text-slate-300">
                {previewText}
              </p>
            </div>
            {/* Tombol Aksi untuk Desktop (Hover) */}
            <div className="hidden md:flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
              {renderActionButtons(session, false)}
            </div>

            {/* Tombol Menu Konteks untuk Mobile */}
            <div className="md:hidden relative">
              <button
                title="Opsi Lain"
                className="p-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                onClick={(e) => {
                  e.stopPropagation();
                  setContextMenuSessionId(
                    contextMenuSessionId === session.id ? null : session.id
                  );
                }}
              >
                <MoreVertical size={16} />
              </button>
              {contextMenuSessionId === session.id && (
                <div
                  ref={contextMenuRef}
                  className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-700 rounded-md shadow-lg z-20 border border-slate-200 dark:border-slate-600"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ul className="py-1">
                    {renderActionButtons(session, true).map((button) => (
                      <li key={button.key} className="px-1">
                        {" "}
                        {/* Menggunakan button.key */}
                        {React.cloneElement(button as React.ReactElement<any>, {
                          // Type assertion
                          className: `${
                            button.props.className || ""
                          } w-full justify-start text-sm px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-md`,
                          onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
                            button.props.onClick(e);
                            setContextMenuSessionId(null); // Tutup menu setelah aksi
                          },
                        })}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-1 self-start">
            {formatDistanceToNow(new Date(session.createdAt), {
              addSuffix: true,
              locale: id,
            })}
          </div>
        </div>
      );
    }

    // Fungsi helper untuk merender tombol aksi, agar tidak duplikasi kode
    function renderActionButtons(session: ChatSession, isContextMenu: boolean) {
      const commonButtonClass = isContextMenu
        ? "flex items-center" // Untuk menu konteks, pastikan ikon dan teks sejajar
        : "p-1.5 rounded-md";

      const iconSize = isContextMenu ? 16 : 14;

      return [
        <button
          key="pin"
          title={session.isPinned ? "Lepas Sematan" : "Sematkan Sesi"}
          className={`${commonButtonClass} ${
            session.isPinned
              ? "text-cyan-600 dark:text-cyan-400" // Warna pin lebih kuat
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          } ${
            !isContextMenu && "hover:bg-slate-200/70 dark:hover:bg-slate-600/70"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin(session.id);
          }}
        >
          {session.isPinned ? (
            <PinOff size={iconSize} />
          ) : (
            <Pin size={iconSize} />
          )}
          {isContextMenu && (
            <span className="ml-2 text-slate-700 dark:text-slate-200">
              {session.isPinned ? "Lepas Sematan" : "Sematkan"}
            </span>
          )}
        </button>,
        <button
          key="rename"
          title="Ubah Nama"
          className={`${commonButtonClass} text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 ${
            !isContextMenu && "hover:bg-slate-200/70 dark:hover:bg-slate-600/70"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            setEditingSessionId(session.id);
            setEditingName(session.name);
          }}
        >
          <FilePenLine size={iconSize} />
          {isContextMenu && (
            <span className="ml-2 text-slate-700 dark:text-slate-200">
              Ubah Nama
            </span>
          )}
        </button>,
        <button
          key="delete"
          title="Hapus Sesi"
          className={`${commonButtonClass} text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 ${
            // Warna hover lebih jelas
            !isContextMenu && "hover:bg-red-100/70 dark:hover:bg-red-700/40"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onDeleteSession(session.id);
          }}
        >
          <Trash2 size={iconSize} />
          {isContextMenu && (
            <span className="ml-2 text-slate-700 dark:text-slate-200">
              Hapus
            </span>
          )}
        </button>,
      ];
    }
  }
);

export { ChatSidebarComponent as ChatSidebar };
