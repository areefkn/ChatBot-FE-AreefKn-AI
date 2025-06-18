"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
// import { useTheme } from "next-themes"; // Tidak lagi digunakan langsung di sini
// import { PlusCircle, Menu, Paperclip, Send, Sun, Moon, X } from "lucide-react"; // Tidak lagi digunakan langsung di sini
// Menggunakan path alias jika dikonfigurasi, atau path relatif

import { ChatSidebar, ChatHeader } from "@/components/chat";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { WelcomeScreen } from "@/components/page/WelcomeScreen"; // Impor komponen baru
import { ActiveChatArea } from "@/components/page/ActiveChatArea"; // Impor komponen baru
import { sendMessageToAI } from "@/services/chatService";
import {
  useChatSessions,
  ChatMessage,
  ChatSession,
} from "@/hooks/useChatSessions"; // Impor hook dan tipe

export default function ChatPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Ubah nilai awal menjadi false
  const [message, setMessage] = useState("");
  const {
    sessions,
    setSessions, // Digunakan untuk operasi pin/unpin pesan langsung
    createNewSessionHook,
    deleteSessionHook,
    renameSessionHook,
    togglePinSessionHook,
    addMessageToSessionHook,
  } = useChatSessions();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<ChatSession | null>(
    null
  );
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false); // State baru
  const [isSending, setIsSending] = useState(false); // Untuk loading state
  const chatContainerRef = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;
  const appTitle = "AreefKn AI";

  // useEffect(() => {
  //   // Auto-scroll ke pesan terbaru
  //   // Dipertimbangkan untuk dihapus karena scroll sudah ditangani di handleSendMessage
  //   // Jika dipertahankan, pastikan tidak konflik dengan scroll di handleSendMessage
  //   chatContainerRef.current?.scrollTo(
  //     0,
  //     chatContainerRef.current.scrollHeight
  //   );
  // }, [sessions, activeSessionId]); // Bergantung pada sesi dan sesi aktif

  // --- Logika untuk memuat ID sesi aktif terakhir ---
  // Dijalankan setelah `useChatSessions` memuat `sessions`
  useEffect(() => {
    // Hanya coba muat sesi terakhir jika pengguna sudah berinteraksi
    // atau jika Anda ingin logika lain untuk "melanjutkan sesi terakhir" secara otomatis
    // Untuk UX yang diminta (selalu WelcomeScreen di awal jika belum ada interaksi),
    // kita bisa menunda pemuatan sesi aktif.
    // Namun, jika ingin tetap ada opsi "lanjutkan sesi terakhir", ini perlu penyesuaian.
    // Untuk saat ini, kita akan fokus pada menampilkan WelcomeScreen.
    // Jika `hasUserInteracted` adalah false, `activeSessionId` akan tetap null.

    if (hasUserInteracted && sessions.length > 0) {
      const lastActiveSessionIdFromStorage = localStorage.getItem(
        "lastActiveSessionId_areefkn_v2"
      );
      if (
        lastActiveSessionIdFromStorage &&
        sessions.find((s) => s.id === lastActiveSessionIdFromStorage)
      ) {
        setActiveSessionId(lastActiveSessionIdFromStorage);
      } else if (sessions.length > 0) {
        // Jika tidak ada di storage, tapi ada sesi, jangan auto-select
        // setActiveSessionId(sessions[sessions.length - 1].id); // Hapus auto-select ini
      }
    }
  }, [sessions, hasUserInteracted]); // Tambahkan hasUserInteracted sebagai dependensi

  // --- Logika untuk menyimpan ID sesi aktif terakhir ---
  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem("lastActiveSessionId_areefkn_v2", activeSessionId);
    } else {
      localStorage.removeItem("lastActiveSessionId_areefkn_v2");
    }
  }, [activeSessionId]);
  // --- Akhir logika localStorage untuk activeSessionId ---

  const currentChatHistory =
    sessions.find((s) => s.id === activeSessionId)?.messages || [];
  const activeSessionName = sessions.find(
    (s) => s.id === activeSessionId
  )?.name;
  const activeSession = sessions.find((s) => s.id === activeSessionId);

  const pinnedMessages =
    (activeSession?.pinnedMessageIds
      ?.map((pinId) => currentChatHistory.find((msg) => msg.id === pinId))
      .filter(Boolean) as ChatMessage[]) || [];

  // Menyiapkan data sesi untuk Sidebar
  // lastMessagePreview sekarang seharusnya sudah dikelola oleh useChatSessions
  const sessionsForSidebar = sessions.map((session) => ({
    id: session.id,
    name: session.name,
    createdAt: session.createdAt,
    isPinned: session.isPinned || false,
    lastMessagePreview: session.lastMessagePreview || "Belum ada pesan",
  }));

  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || !activeSessionId) {
      if (!activeSessionId) {
        console.error("Tidak ada sesi aktif untuk mengirim pesan.");
      }
      return;
    }

    const userMessageText = message; // Simpan sebelum di-reset
    const newUserMessage: ChatMessage = {
      id: `user-${uuidv4()}`,
      text: userMessageText,
      sender: "user",
      timestamp: new Date(),
    };

    addMessageToSessionHook(activeSessionId, newUserMessage);
    setMessage("");
    setIsSending(true);

    requestAnimationFrame(() => {
      chatContainerRef.current?.scrollTo(
        0,
        chatContainerRef.current.scrollHeight
      );
    });

    const historyForContext = (
      sessions.find((s) => s.id === activeSessionId)?.messages || []
    )
      .slice(-11, -1) // Ambil 10 pesan SEBELUM pesan pengguna baru
      .map((msg) => ({ sender: msg.sender, text: msg.text }));

    try {
      const data = await sendMessageToAI(
        userMessageText,
        historyForContext,
        activeSessionId // Kirim activeSessionId
      );
      const aiMessage: ChatMessage = {
        id: `ai-${uuidv4()}`, // Atau gunakan ID dari backend jika ada
        text: data.reply || "Maaf, saya tidak menerima respons yang valid.",
        sender: "ai",
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(), // Gunakan timestamp dari backend jika ada
      };
      addMessageToSessionHook(activeSessionId, aiMessage);

      // Opsional: Jika backend mengembalikan sessionId yang berbeda (misalnya untuk sesi baru yang dibuat oleh backend)
      // if (data.sessionId && data.sessionId !== activeSessionId) {
      //   setActiveSessionId(data.sessionId);
      //   // Anda mungkin juga perlu memperbarui ID sesi di dalam state 'sessions' melalui fungsi dari useChatSessions
      // }
    } catch (error) {
      console.error("Error saat mengirim pesan ke AI:", error);
      let errorMessageText =
        "Maaf, terjadi kesalahan saat menghubungi AI. Silakan coba lagi.";
      if (error instanceof Error) {
        errorMessageText = error.message;
      }
      const errorMessage: ChatMessage = {
        id: `err-${uuidv4()}`,
        text: errorMessageText,
        sender: "ai",
        timestamp: new Date(),
      };
      addMessageToSessionHook(activeSessionId, errorMessage);
    } finally {
      setIsSending(false);
      requestAnimationFrame(() => {
        chatContainerRef.current?.scrollTo(
          0,
          chatContainerRef.current.scrollHeight
        );
      });
    }
  }, [
    message,
    activeSessionId,
    addMessageToSessionHook,
    sessions, // Untuk mengambil historyForContext. setMessage dan setIsSending adalah setter, jadi opsional.
  ]);

  const createNewSession = useCallback(() => {
    const newSession = createNewSessionHook();
    setActiveSessionId(newSession.id);
    setHasUserInteracted(true); // Pengguna telah berinteraksi
  }, [createNewSessionHook, setActiveSessionId]);

  const openDeleteConfirmationModal = useCallback(
    (sessionId: string) => {
      const session = sessions.find((s) => s.id === sessionId);
      if (session) {
        setSessionToDelete(session);
        setIsConfirmationModalOpen(true);
      }
    },
    [sessions] // Tidak mengubah hasUserInteracted
  );

  const confirmDeleteSession = useCallback(() => {
    if (!sessionToDelete) return;
    const sessionIdToDelete = sessionToDelete.id;
    deleteSessionHook(sessionIdToDelete);

    if (activeSessionId === sessionIdToDelete) {
      const remainingSessions = sessions.filter(
        (s) => s.id !== sessionIdToDelete
      );
      if (remainingSessions.length > 0) {
        setActiveSessionId(
          remainingSessions.sort(
            (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
          )[0].id
        );
      } else {
        setActiveSessionId(null);
      }
    }
    setSessionToDelete(null);
    setIsConfirmationModalOpen(false);
  }, [
    sessionToDelete,
    deleteSessionHook,
    activeSessionId,
    sessions,
    setActiveSessionId, // Tidak mengubah hasUserInteracted secara langsung di sini
  ]);

  const handleRenameSession = useCallback(
    (sessionId: string, newName: string) => {
      renameSessionHook(sessionId, newName);
    },
    [renameSessionHook] // Tidak mengubah hasUserInteracted
  );

  const handleTogglePinSession = useCallback(
    (sessionId: string) => {
      togglePinSessionHook(sessionId);
    },
    [togglePinSessionHook] // Tidak mengubah hasUserInteracted
  );

  // Fungsi pin/unpin pesan tetap di sini karena `setSessions` masih diekspos oleh hook
  // Atau bisa juga dipindahkan ke dalam hook jika diinginkan
  const handlePinMessage = useCallback(
    (messageId: string) => {
      if (!activeSessionId) return;
      setSessions((prevSessions) =>
        prevSessions.map((session) => {
          if (session.id === activeSessionId) {
            const currentPinnedIds = session.pinnedMessageIds || [];
            const newPinnedIds = [
              messageId,
              ...currentPinnedIds.filter((id) => id !== messageId),
            ].slice(0, 3); // Batas 3 pesan disematkan
            return { ...session, pinnedMessageIds: newPinnedIds };
          }
          return session;
        })
      );
    },
    [activeSessionId, setSessions] // Tidak mengubah hasUserInteracted
  );

  const handleUnpinMessage = useCallback(
    (messageIdToUnpin: string) => {
      if (!activeSessionId) return;
      setSessions((prevSessions) =>
        prevSessions.map((session) => {
          if (session.id === activeSessionId) {
            const updatedPinnedIds = (session.pinnedMessageIds || []).filter(
              (id) => id !== messageIdToUnpin
            );
            return { ...session, pinnedMessageIds: updatedPinnedIds };
          }
          return session;
        })
      );
    },
    [activeSessionId, setSessions] // Tidak mengubah hasUserInteracted
  );

  // Fungsi untuk menangani pemilihan template dari WelcomeScreen
  const handleSelectTemplate = useCallback(
    (templateString: string) => {
      setMessage(templateString);
      // createNewSession akan dipanggil di sini, yang sudah di-memoize
      const newSession = createNewSessionHook();
      setActiveSessionId(newSession.id);
      setHasUserInteracted(true); // Pengguna telah berinteraksi
      // Fokus ke input setelah template dipilih dan sesi baru dibuat
      // Ini mungkin memerlukan ref ke textarea di ChatInputBar yang diteruskan ke ActiveChatArea
    },
    [createNewSessionHook, setActiveSessionId, setMessage]
  );

  // Tambahkan useEffect untuk menutup sidebar saat beralih dari mobile ke desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isSidebarOpen]);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* Sidebar selalu ada */}
      <ChatSidebar
        isOpen={isSidebarOpen}
        sessions={sessionsForSidebar} // Gunakan data sesi yang sudah disiapkan
        activeSessionId={activeSessionId}
        onNewChat={() => {
          createNewSession(); // createNewSession sudah mengatur hasUserInteracted
        }}
        onSelectSession={(sessionId) => {
          setActiveSessionId(sessionId);
          setHasUserInteracted(true); // Pengguna telah berinteraksi
          // Khusus mobile, tutup sidebar setelah memilih sesi
          if (typeof window !== "undefined" && window.innerWidth < 768) {
            // 768px adalah breakpoint md Tailwind
            setIsSidebarOpen(false);
          }
        }}
        onDeleteSession={openDeleteConfirmationModal} // Tetap gunakan ini untuk memicu modal
        onRenameSession={handleRenameSession}
        onTogglePin={handleTogglePinSession}
        onCloseSidebarMobile={() => setIsSidebarOpen(false)} // Ganti nama prop menjadi onCloseSidebarMobile
      />

      {/* Overlay untuk menutup sidebar di mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => {
            // Periksa apakah elemen yang diklik adalah bagian dari sidebar.
            // Ini memerlukan cara untuk mengidentifikasi elemen sidebar, misalnya dengan ref atau ID.
            // Namun, pendekatan ini bisa menjadi rumit.
            // Kita akan tetap mengandalkan e.stopPropagation() dari sidebar.
            // Jika e.stopPropagation() benar-benar gagal, ini adalah fallback terakhir.
            // console.log("Overlay clicked. Target:", e.target, "CurrentTarget:", e.currentTarget);
            // if (e.target === e.currentTarget) { // Ini adalah pemeriksaan yang lebih aman
            setIsSidebarOpen(false);
            // }
          }}
        ></div>
      )}

      {/* Main Content Area */}
      <main className="flex flex-col flex-1 w-full h-screen min-w-0 relative z-10">
        {" "}
        {/* Tambahkan min-w-0 dan relative z-10 */}
        <ChatHeader
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          title={appTitle}
        />
        {activeSessionId ? (
          // Tampilkan UI chat jika ada sesi aktif
          <>
            <ActiveChatArea
              messages={currentChatHistory} // sebelumnya messages
              isSending={isSending}
              chatContainerRef={chatContainerRef}
              activeSessionName={activeSessionName}
              pinnedMessages={pinnedMessages}
              onUnpinMessage={handleUnpinMessage}
              onPinMessage={handlePinMessage}
              inputMessage={message} // sebelumnya message
              onInputMessageChange={setMessage} // sebelumnya onMessageChange
              onSendMessage={handleSendMessage}
              onSelectTemplate={handleSelectTemplate} // Tambahkan prop ini
            />
          </>
        ) : (
          // Tampilkan pesan selamat datang jika tidak ada sesi aktif
          <WelcomeScreen
            appTitle={appTitle}
            onNewChat={() => {
              createNewSession(); // createNewSession sudah mengatur hasUserInteracted
            }}
            onSelectTemplate={handleSelectTemplate} // handleSelectTemplate sudah mengatur hasUserInteracted
          />
        )}
      </main>

      {/* Confirmation Modal tetap di luar conditional rendering */}
      {sessionToDelete && (
        <ConfirmationModal
          isOpen={isConfirmationModalOpen}
          onClose={() => {
            setIsConfirmationModalOpen(false);
            setSessionToDelete(null);
          }}
          onConfirm={confirmDeleteSession}
          title="Hapus Sesi Chat"
          message={
            <p>
              Apakah Anda yakin ingin menghapus chat "
              <strong>{sessionToDelete.name}</strong>"? Tindakan ini tidak dapat
              dibatalkan.
            </p>
          }
        />
      )}
    </div>
  );
}
