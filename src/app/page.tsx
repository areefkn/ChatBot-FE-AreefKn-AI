"use client";

import React, { useState, useEffect, useRef } from "react";
// import { useTheme } from "next-themes"; // Tidak lagi digunakan langsung di sini
// import { PlusCircle, Menu, Paperclip, Send, Sun, Moon, X } from "lucide-react"; // Tidak lagi digunakan langsung di sini
// Menggunakan path alias jika dikonfigurasi, atau path relatif

import { ChatSidebar, ChatHeader } from "@/components/chat";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { WelcomeScreen } from "@/components/page/WelcomeScreen"; // Impor komponen baru
import { ActiveChatArea } from "@/components/page/ActiveChatArea"; // Impor komponen baru

interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

interface ChatSession {
  id: string;
  name: string;
  messages: ChatMessage[];
  pinnedMessageIds?: string[]; // ID pesan yang disematkan (opsional)
  createdAt: Date;
  isPinned?: boolean; // Untuk status pin sesi di sidebar
  lastMessagePreview?: string; // Untuk pratinjau pesan di sidebar
}

export default function ChatPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Ubah nilai awal menjadi false
  const [message, setMessage] = useState("");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<ChatSession | null>(
    null
  );
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false); // Untuk loading state
  const chatContainerRef = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;
  const appTitle = "AreefKn AI";

  useEffect(() => {
    // Auto-scroll ke pesan terbaru
    chatContainerRef.current?.scrollTo(
      0,
      chatContainerRef.current.scrollHeight
    );
  }, [sessions, activeSessionId]); // Bergantung pada sesi dan sesi aktif

  // --- Logika untuk memuat dan menyimpan sesi dari localStorage ---
  useEffect(() => {
    const storedSessions = localStorage.getItem("chatSessions_areefkn_v2");
    let initialSessionsLoaded = false;
    if (storedSessions) {
      try {
        const parsedSessions: ChatSession[] = JSON.parse(storedSessions).map(
          (session: any) => ({
            ...session,
            createdAt: new Date(session.createdAt),
            isPinned: session.isPinned || false, // Tambahkan default value
            messages: session.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            })),
            // Buat lastMessagePreview saat memuat
            lastMessagePreview:
              session.messages.length > 0
                ? session.messages[session.messages.length - 1].text.substring(
                    0,
                    40
                  ) +
                  (session.messages[session.messages.length - 1].text.length >
                  40
                    ? "..."
                    : "")
                : "Belum ada pesan",
          })
        );
        setSessions(parsedSessions);
        initialSessionsLoaded = true;

        if (parsedSessions.length > 0) {
          const lastActiveSessionId = localStorage.getItem(
            "lastActiveSessionId_areefkn_v2"
          );
          setActiveSessionId(
            lastActiveSessionId &&
              parsedSessions.find((s) => s.id === lastActiveSessionId)
              ? lastActiveSessionId
              : parsedSessions[parsedSessions.length - 1].id
          );
        } else {
          // Jika storedSessions ada tapi isinya kosong array, set activeSessionId ke null
          setActiveSessionId(null);
        }
      } catch (error) {
        console.error("Gagal memuat sesi dari localStorage:", error);
        // Jika parsing gagal, perlakukan seperti tidak ada sesi
        setSessions([]);
        setActiveSessionId(null);
        initialSessionsLoaded = true;
      }
    } else {
      // Jika tidak ada storedSessions sama sekali, set activeSessionId ke null
      // dan pastikan tidak ada sesi yang dibuat secara otomatis
      setSessions([]); // Pastikan sessions kosong
      setActiveSessionId(null);
      initialSessionsLoaded = true;
    }
  }, []);

  useEffect(() => {
    // Selalu simpan state sesi saat ini ke localStorage.
    // Jika sessions kosong, localStorage akan menyimpan string "[]".
    localStorage.setItem("chatSessions_areefkn_v2", JSON.stringify(sessions));

    if (activeSessionId) {
      localStorage.setItem("lastActiveSessionId_areefkn_v2", activeSessionId);
    } else {
      // Jika tidak ada sesi aktif, hapus ID sesi aktif terakhir dari localStorage.
      localStorage.removeItem("lastActiveSessionId_areefkn_v2");
    }
  }, [sessions, activeSessionId]);
  // --- Akhir logika localStorage ---

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

  // Menyiapkan data sesi untuk Sidebar dengan properti yang dibutuhkan
  const sessionsForSidebar = sessions.map((session) => ({
    id: session.id,
    name: session.name,
    createdAt: session.createdAt,
    isPinned: session.isPinned || false,
    lastMessagePreview:
      session.lastMessagePreview ||
      (session.messages.length > 0
        ? session.messages[session.messages.length - 1].text.substring(0, 40) +
          "..."
        : "Belum ada pesan"),
  }));
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* Sidebar selalu ada */}
      <ChatSidebar
        isOpen={isSidebarOpen}
        sessions={sessionsForSidebar} // Gunakan data sesi yang sudah disiapkan
        activeSessionId={activeSessionId}
        onNewChat={createNewSession}
        onSelectSession={setActiveSessionId}
        onDeleteSession={openDeleteConfirmationModal}
        onRenameSession={handleRenameSession}
        onTogglePin={handleTogglePinSession}
      />

      {/* Overlay untuk menutup sidebar di mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
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
            onNewChat={createNewSession} // Teruskan fungsi createNewSession
            onSelectTemplate={handleSelectTemplate}
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

  async function handleSendMessage() {
    if (!message.trim()) return;

    if (!activeSessionId) {
      console.error("Tidak ada sesi aktif untuk mengirim pesan.");
      // Mungkin tampilkan notifikasi ke pengguna
      return;
    }

    const newUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text: message,
      sender: "user",
      timestamp: new Date(),
    };

    setSessions((prevSessions) =>
      prevSessions.map((session) =>
        session.id === activeSessionId
          ? {
              ...session,
              messages: [...session.messages, newUserMessage],
              lastMessagePreview:
                newUserMessage.text.substring(0, 40) +
                (newUserMessage.text.length > 40 ? "..." : ""), // Update preview
            }
          : session
      )
    );
    setMessage("");
    setIsSending(true);
    // Scroll ke bawah setelah pesan pengguna ditambahkan
    requestAnimationFrame(() => {
      chatContainerRef.current?.scrollTo(
        0,
        chatContainerRef.current.scrollHeight
      );
    });

    // Mengambil beberapa pesan terakhir dari sesi aktif untuk konteks
    // Anda bisa menyesuaikan jumlah pesan yang dikirim untuk konteks
    const historyForContext = currentChatHistory
      .slice(-10) // Ambil 10 pesan terakhir
      .map((msg) => ({ sender: msg.sender, text: msg.text }));

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: newUserMessage.text,
          history: historyForContext,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.details || errorData.error || "Gagal menghubungi AI"
        );
      }

      const data = await response.json();
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        text: data.reply || "Maaf, saya tidak menerima respons yang valid.",
        sender: "ai",
        timestamp: new Date(),
      };
      setSessions((prevSessions) =>
        prevSessions.map((session) =>
          session.id === activeSessionId
            ? {
                ...session,
                messages: [...session.messages, aiMessage],
                lastMessagePreview:
                  aiMessage.text.substring(0, 40) +
                  (aiMessage.text.length > 40 ? "..." : ""), // Update preview
              }
            : session
        )
      );
    } catch (error) {
      console.error("Error saat mengirim pesan ke AI:", error);
      const errorMessageText =
        error instanceof Error && error.message
          ? error.message
          : "Maaf, terjadi kesalahan saat menghubungi AI. Silakan coba lagi.";
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        text: errorMessageText,
        sender: "ai",
        timestamp: new Date(),
      };
      setSessions((prevSessions) =>
        prevSessions.map((session) =>
          session.id === activeSessionId
            ? { ...session, messages: [...session.messages, errorMessage] } // Tidak perlu update preview untuk error message
            : session
        )
      );
    } finally {
      setIsSending(false);
      // Scroll ke bawah setelah pesan AI diterima atau error
      requestAnimationFrame(() => {
        chatContainerRef.current?.scrollTo(
          0,
          chatContainerRef.current.scrollHeight
        );
      });
    }
  }

  function createNewSession() {
    const newSessionId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newSessionId,
      name: `Percakapan ${sessions.length + 1}`,
      messages: [],
      createdAt: new Date(),
      isPinned: false,
      lastMessagePreview: "Belum ada pesan",
    };
    setSessions((prev) => [...prev, newSession]);
    setActiveSessionId(newSessionId);
  }

  function openDeleteConfirmationModal(sessionId: string) {
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      setSessionToDelete(session);
      setIsConfirmationModalOpen(true);
    }
  }

  function confirmDeleteSession() {
    if (!sessionToDelete) return;

    const sessionIdToDelete = sessionToDelete.id;

    setSessions((prevSessions) =>
      prevSessions.filter((session) => session.id !== sessionIdToDelete)
    );

    // Jika sesi yang aktif dihapus atau itu satu-satunya sesi
    if (activeSessionId === sessionIdToDelete || sessions.length === 1) {
      const remainingSessions = sessions.filter(
        (session) => session.id !== sessionIdToDelete
      );
      if (remainingSessions.length > 0) {
        // Atur sesi aktif ke sesi terbaru yang tersisa
        setActiveSessionId(
          remainingSessions.sort(
            (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
          )[0].id
        );
      } else {
        // Jika tidak ada sesi tersisa, set activeSessionId ke null
        setActiveSessionId(null); // Reset dulu
        // Tidak perlu createNewSession() di sini, biarkan halaman kosong
        // createNewSession();
      }
    }
    // localStorage akan otomatis diperbarui oleh useEffect yang sudah ada
  }

  function handleRenameSession(sessionId: string, newName: string) {
    setSessions((prevSessions) =>
      prevSessions.map((session) =>
        session.id === sessionId
          ? { ...session, name: newName.trim() }
          : session
      )
    );
    // localStorage akan otomatis diperbarui oleh useEffect yang sudah ada
  }

  function handlePinMessage(messageId: string) {
    if (!activeSessionId) return;

    setSessions((prevSessions) =>
      prevSessions.map((session) => {
        if (session.id === activeSessionId) {
          const currentPinnedIds = session.pinnedMessageIds || [];
          // Batasi jumlah pesan yang bisa disematkan, misal 3, dan yang baru disematkan muncul di atas
          const newPinnedIds = [
            messageId,
            ...currentPinnedIds.filter((id) => id !== messageId),
          ].slice(0, 3);
          return { ...session, pinnedMessageIds: newPinnedIds };
        }
        return session;
      })
    );
  }

  function handleUnpinMessage(messageIdToUnpin: string) {
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
  }

  function handleTogglePinSession(sessionId: string) {
    setSessions((prevSessions) =>
      prevSessions.map((session) =>
        session.id === sessionId
          ? { ...session, isPinned: !session.isPinned }
          : session
      )
    );
    // localStorage akan otomatis diperbarui oleh useEffect [sessions, activeSessionId]
  }

  // Tambahkan useEffect untuk menutup sidebar saat beralih dari mobile ke desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isSidebarOpen) {
        // 768px adalah breakpoint 'md' default Tailwind
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isSidebarOpen]);

  // Fungsi untuk menangani pemilihan template dari WelcomeScreen
  function handleSelectTemplate(templateString: string) {
    setMessage(templateString);
    createNewSession(); // Membuat sesi baru secara otomatis
    // Logika tambahan (misal, modal placeholder) bisa ditambahkan di sini
  }
}
