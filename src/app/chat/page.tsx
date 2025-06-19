// d:\Areefkn Dev\chatBot-AreefKnByGemini\fe-chatbot-gemini\src\app\chat\page.tsx (Contoh Path)
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ChatSidebar } from "@/components/chat"; // Impor dari index.ts di components/chat
import {
  fetchChatSessionsFromBackend,
  deleteSessionFromBackend, // Pastikan ini diimpor
  // ... impor service lain seperti fetchMessagesForSession, sendMessageToAI
} from "@/services/chatService";
import { ChatSession } from "@/components/chat/ChatSidebar"; // Tipe dari ChatSidebar

export default function ChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Atau false, tergantung default
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [errorLoadingSessions, setErrorLoadingSessions] = useState<
    string | null
  >(null);
  // State untuk pesan, loading pesan, dll. bisa ditambahkan di sini

  const loadChatSessions = useCallback(
    async (selectFirstSessionIfNoneActive = false) => {
      setIsLoadingSessions(true);
      setErrorLoadingSessions(null);
      try {
        const fetchedSessions = await fetchChatSessionsFromBackend();
        setSessions(fetchedSessions);
        // console.log(
        //   "[PAGE_COMPONENT] Sessions set in state after loadChatSessions:",
        //   JSON.stringify(fetchedSessions, null, 2)
        // ); // Komentar: Log ini mungkin terlalu verbose, aktifkan jika perlu debugging

        if (
          selectFirstSessionIfNoneActive &&
          fetchedSessions.length > 0 &&
          !activeSessionId
        ) {
          // Logika untuk memilih sesi pertama jika tidak ada yang aktif
          // setActiveSessionId(fetchedSessions[0].id);
          // Anda mungkin ingin memanggil handleSelectSession(fetchedSessions[0].id) di sini
        } else if (fetchedSessions.length === 0) {
          setActiveSessionId(null); // Jika tidak ada sesi, tidak ada yang aktif
        }
        // Jika activeSessionId ada tapi tidak ditemukan lagi di fetchedSessions (misalnya setelah delete), reset
        else if (
          activeSessionId &&
          !fetchedSessions.find((s) => s.id === activeSessionId)
        ) {
          setActiveSessionId(null);
        }
      } catch (error: any) {
        console.error("Gagal memuat sesi chat:", error);
        setErrorLoadingSessions(error.message || "Gagal memuat daftar sesi.");
      } finally {
        setIsLoadingSessions(false);
      }
    },
    [activeSessionId]
  ); // activeSessionId sebagai dependency

  useEffect(() => {
    loadChatSessions(true); // Muat sesi saat komponen dimuat, coba pilih sesi pertama
  }, [loadChatSessions]);

  const handleNewChat = () => {
    console.log("Buat chat baru");
    setActiveSessionId(null); // Ini akan membersihkan area chat
    // Sesi baru akan dibuat oleh backend saat pesan pertama dikirim tanpa sessionId.
    // Setelah itu, loadChatSessions() akan mengambilnya.
  };

  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    console.log(`Sesi dipilih: ${sessionId}`);
    // Di sini Anda akan memanggil fetchMessagesForSession(sessionId)
    // untuk memuat pesan-pesan dari sesi yang dipilih.
    if (isSidebarOpen && window.innerWidth < 768) {
      // Contoh: tutup sidebar di mobile setelah pilih
      setIsSidebarOpen(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (
      !window.confirm(
        `Apakah Anda yakin ingin menghapus sesi ini? Tindakan ini tidak dapat diurungkan.`
      )
    ) {
      return;
    }

    try {
      // setDeletingState(true); // Opsional: untuk UI loading
      await deleteSessionFromBackend(sessionId); // Panggil service untuk menghapus di BE

      // Setelah berhasil dihapus dari backend, muat ulang daftar sesi dari BE
      // Ini memastikan UI sinkron dengan database.
      await loadChatSessions();

      // Tampilkan notifikasi sukses jika perlu
      console.log(`Sesi ${sessionId} berhasil dihapus dari FE dan BE.`);
      // alert(`Sesi berhasil dihapus.`); // Atau gunakan toast notification
    } catch (error: any) {
      console.error(`Gagal menghapus sesi ${sessionId}:`, error);
      // Tampilkan pesan error ke pengguna
      alert(`Error: ${error.message || "Gagal menghapus sesi."}`);
    } finally {
      // setDeletingState(false);
    }
  };

  const handleRenameSession = async (sessionId: string, newName: string) => {
    console.log("Ubah nama sesi:", sessionId, "ke", newName);
    // TODO: Implementasikan panggilan API ke backend untuk mengubah nama sesi
    // Setelah berhasil, panggil await loadChatSessions();
  };

  const handleTogglePin = async (sessionId: string) => {
    console.log("Toggle pin sesi:", sessionId);
    // TODO: Implementasikan panggilan API ke backend untuk toggle pin
    // Setelah berhasil, panggil await loadChatSessions();
  };

  return (
    <div className="flex h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50">
      <ChatSidebar
        isOpen={isSidebarOpen}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession} // Teruskan fungsi handler yang benar
        onRenameSession={handleRenameSession}
        onTogglePin={handleTogglePin}
        onCloseSidebarMobile={() => setIsSidebarOpen(false)}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Konten Area Chat Utama */}
        {isLoadingSessions && (
          <div className="p-4 flex-1 flex items-center justify-center">
            Memuat sesi...
          </div>
        )}
        {errorLoadingSessions && !isLoadingSessions && (
          <div className="p-4 flex-1 flex items-center justify-center text-red-500">
            Error: {errorLoadingSessions}
          </div>
        )}
        {!isLoadingSessions &&
          !errorLoadingSessions &&
          !activeSessionId &&
          sessions.length > 0 && (
            <div className="p-4 flex-1 flex items-center justify-center">
              Pilih sesi untuk memulai percakapan.
            </div>
          )}
        {!isLoadingSessions &&
          !errorLoadingSessions &&
          !activeSessionId &&
          sessions.length === 0 && (
            <div className="p-4 flex-1 flex items-center justify-center">
              Belum ada sesi. Buat chat baru untuk memulai.
            </div>
          )}
        {activeSessionId && (
          <div className="p-4 flex-1">
            {/* Di sini Anda akan merender ChatMessageList dengan pesan untuk activeSessionId */}
            Konten untuk sesi: {activeSessionId}
          </div>
        )}
        {/* <ChatInputBar onSendMessage={...} /> */}
      </main>
    </div>
  );
}
