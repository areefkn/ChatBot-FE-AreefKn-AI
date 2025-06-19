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
        className={`fixed inset-y-0 left-0 z-30 bg-slate-100 dark:bg-slate-800 shadow-lg transition-transform duration-300 ease-in-out 
                 md:relative md:translate-x-0 md:w-80 md:p-4 md:flex-shrink-0 
                 ${
                   isOpen
                     ? "translate-x-0 w-full p-4"
                     : "-translate-x-full w-full p-4 md:w-0 md:p-0"
                 } 
                 overflow-hidden flex flex-col`}
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
                <div className="sticky top-0 bg-white dark:bg-slate-800 z-10 px-1 py-1.5 mb-1">
                  <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center">
                    <Pin
                      size={12}
                      className="mr-1.5 text-cyan-600 dark:text-cyan-400"
                    />
                    TERSEMAT
                  </h3>
                </div>
                <div className="space-y-1.5">
                  {sortedPinnedSessions.map(renderSessionItem)}
                </div>
              </div>
            )}

            {/* Unpinned Sessions */}
            {sortedUnpinnedSessions.length > 0 && (
              <div className="mb-3">
                <div
                  className={`sticky top-0 rounded-2xl bg-white dark:bg-slate-800 z-10 px-1 py-1.5 mb-1 ${
                    sortedPinnedSessions.length > 0 ? "pt-2" : ""
                  }`}
                >
                  <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center">
                    <MessageSquare size={12} className="mr-1.5 " />
                    PERCAKAPAN
                  </h3>
                </div>
                <div className="space-y-1.5">
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
          className={`group p-2.5 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 flex flex-col transition-colors ${
            isActive
              ? "bg-gradient-to-r from-cyan-50 via-violet-50 to-indigo-50 dark:from-cyan-900/30 dark:via-violet-900/30 dark:to-indigo-900/30 border-l-4 border-cyan-500 dark:border-cyan-400"
              : "border-l-4 border-transparent"
          }`}
          onClick={() => onSelectSession(session.id)}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              {" "}
              {/* min-w-0 untuk truncate */}
              <h3
                className={`font-medium truncate text-sm ${
                  isActive
                    ? "text-cyan-700 dark:text-cyan-200"
                    : "text-slate-800 dark:text-slate-100"
                }`}
              >
                {session.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
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
                        {React.cloneElement(button, {
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
      const commonButtonClass = isContextMenu ? "" : "p-1.5 rounded-md";
      const iconSize = isContextMenu ? 16 : 14;

      return [
        <button
          key="pin"
          title={session.isPinned ? "Lepas Sematan" : "Sematkan Sesi"}
          className={`${commonButtonClass} ${
            session.isPinned
              ? "text-cyan-500 dark:text-cyan-400"
              : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
          } ${!isContextMenu && "hover:bg-slate-200 dark:hover:bg-slate-600"}`}
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
            <span className="ml-2">
              {session.isPinned ? "Lepas Sematan" : "Sematkan"}
            </span>
          )}
        </button>,
        <button
          key="rename"
          title="Ubah Nama"
          className={`${commonButtonClass} text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 ${
            !isContextMenu && "hover:bg-slate-200 dark:hover:bg-slate-600"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            setEditingSessionId(session.id);
            setEditingName(session.name);
          }}
        >
          <FilePenLine size={iconSize} />
          {isContextMenu && <span className="ml-2">Ubah Nama</span>}
        </button>,
        <button
          key="delete"
          title="Hapus Sesi"
          className={`${commonButtonClass} text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 ${
            !isContextMenu && "hover:bg-red-100 dark:hover:bg-red-700/50"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onDeleteSession(session.id);
          }}
        >
          <Trash2 size={iconSize} />
          {isContextMenu && <span className="ml-2">Hapus</span>}
        </button>,
      ];
    }
  }
);

export { ChatSidebarComponent as ChatSidebar };
