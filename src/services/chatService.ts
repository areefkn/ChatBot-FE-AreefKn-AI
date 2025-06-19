// SEMENTARA

import axios, { AxiosError } from "axios";
import { ChatSession } from "@/hooks/useChatSessions"; // Import ChatSession type
// src/services/chatService.ts

interface ChatMessageForContext {
  sender: "user" | "ai";
  text: string;
}

// Tipe untuk pesan yang diterima dari backend (detail pesan dalam sesi)
export interface MessageFromBackend {
  id: string;
  sender: "USER" | "AI"; // Sesuaikan dengan enum MessageSenderType di backend
  contentType: "TEXT" | "IMAGE" | string; // Sesuaikan dengan enum MessageContentType di backend
  textContent: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  timestamp: string; // ISO string, akan diubah ke Date di frontend jika perlu
}

interface AIResponse {
  reply: string;
  sessionId?: string; // Jika backend mengembalikan ini
  timestamp?: string; // Atau Date, jika backend mengembalikan ini
}

export async function sendMessageToAI(
  message: string,
  history: ChatMessageForContext[],
  sessionId?: string | null // Tambahkan sessionId sebagai argumen
): Promise<AIResponse> {
  try {
    const response = await axios.post<AIResponse>(
      "/api/chat", // Mengarah ke API Route Next.js internal
      {
        message: message,
        history: history,
        sessionId: sessionId, // Kirim sessionId dalam payload
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data; // Axios meletakkan data respons di properti `data`
  } catch (error) {
    let errorMessage = "Gagal menghubungi layanan AI."; // Pesan default yang lebih umum
    // Log error asli untuk debugging lebih detail di konsol browser
    console.error("sendMessageToAI error details:", error);

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>; // Tipenya bisa lebih spesifik jika Anda tahu struktur error API Anda
      if (axiosError.response) {
        // Server merespons dengan status code di luar rentang 2xx
        const errorData = axiosError.response.data;
        const status = axiosError.response.status;

        if (
          status === 404 &&
          axiosError.config &&
          axiosError.config.url === "/api/chat"
        ) {
          // Specific error for Next.js API route itself not being found
          errorMessage = `Error: The API endpoint '/api/chat' was not found on the server. Please ensure the API route is correctly set up in 'src/app/api/chat/route.ts' and the Next.js server has been restarted. (Status: ${status})`;
        } else if (errorData && typeof errorData === "object") {
          // Coba dapatkan pesan yang lebih spesifik dari body respons JSON
          errorMessage =
            errorData.details ||
            errorData.error ||
            errorData.message || // Coba juga 'message' jika ada
            `Layanan AI merespons dengan kesalahan (status ${status}).`;
        } else if (typeof errorData === "string" && errorData.trim() !== "") {
          // Jika data respons adalah string (misalnya, halaman error HTML dari Next.js)
          // Hindari menampilkan HTML penuh di pesan error UI.
          errorMessage = `Terjadi kesalahan pada server (status ${status}). Pastikan endpoint /api/chat dapat diakses.`;
        } else {
          // Tidak ada data error spesifik atau format tidak dikenal
          errorMessage = `Layanan AI tidak dapat dijangkau atau merespons dengan kesalahan (status ${status}).`;
        }
      } else if (axiosError.request) {
        // Request dibuat tapi tidak ada respons diterima (mis. masalah jaringan)
        errorMessage = "Tidak ada respons dari server. Periksa koneksi Anda.";
      } else {
        // Sesuatu terjadi saat menyiapkan request yang memicu Error
        errorMessage =
          axiosError.message || "Terjadi kesalahan saat mengirim permintaan.";
      }
    } else if (error instanceof Error) {
      // Tangani error JavaScript generik
      errorMessage = error.message || "Terjadi kesalahan yang tidak diketahui.";
    }
    throw new Error(errorMessage);
  }
}

// Tipe data mentah yang diharapkan dari API backend untuk satu sesi
interface SessionDataFromApi {
  id: string;
  name?: string | null; // Nama bisa null atau tidak ada
  createdAt: string; // Biasanya string ISO 8601
  updatedAt?: string | null; // Bisa null atau tidak ada
  lastMessagePreview?: string | null; // Bisa null atau tidak ada
  isPinned?: boolean | null; // Bisa null atau tidak ada
  // Tambahkan field lain yang mungkin dikirim backend untuk ringkasan sesi
}

// Fungsi untuk mengambil daftar sesi chat langsung dari backend Express.js
export async function fetchChatSessionsFromBackend(): Promise<ChatSession[]> {
  const backendBaseUrl = process.env.NEXT_PUBLIC_CHAT_BACKEND_BASE_URL; // Ini yang perlu dipastikan ada nilainya
  const SESSIONS_LIST_BACKEND_PATH = "/api/chat/sessions"; // Tambahkan /api

  if (!backendBaseUrl) {
    // Error akan muncul di sini jika backendBaseUrl undefined
    const errorMessage =
      "Konfigurasi error: URL base backend untuk sesi chat tidak diatur (NEXT_PUBLIC_CHAT_BACKEND_BASE_URL).";
    console.error(`fetchChatSessionsFromBackend: ${errorMessage}`);
    throw new Error(errorMessage);
  }

  const fullBackendUrl = `${backendBaseUrl.replace(
    /\/$/,
    ""
  )}${SESSIONS_LIST_BACKEND_PATH}`;

  try {
    console.log(
      `fetchChatSessionsFromBackend: Attempting to GET sessions from: ${fullBackendUrl}`
    );
    // Memanggil backend Express.js secara langsung
    // Pastikan backend Anda mengizinkan CORS dari origin frontend (misalnya http://localhost:3000)
    const response = await axios.get<SessionDataFromApi[]>(fullBackendUrl, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log(
      "fetchChatSessionsFromBackend: Data received from backend:",
      JSON.stringify(response.data, null, 2)
    );
    // console.log(
    //   "fetchChatSessionsFromBackend: Number of sessions received:",
    //   response.data?.length
    // ); // Komentar: Log ini mungkin terlalu verbose, aktifkan jika perlu debugging

    if (!Array.isArray(response.data)) {
      console.error(
        "Error fetching chat sessions: API did not return an array.",
        response
      );
      throw new Error(
        "Failed to load chat sessions: Invalid data format from server."
      );
    }

    return response.data.map((sessionDataFromApi) => ({
      id: sessionDataFromApi.id,
      name: sessionDataFromApi.name || `Sesi Tanpa Nama`, // Ambil nama dari backend, atau default
      createdAt: new Date(sessionDataFromApi.createdAt), // Pastikan createdAt adalah objek Date
      updatedAt: sessionDataFromApi.updatedAt
        ? new Date(sessionDataFromApi.updatedAt)
        : undefined, // Pastikan updatedAt adalah objek Date jika ada
      lastMessagePreview:
        sessionDataFromApi.lastMessagePreview || "Belum ada pesan", // Ambil preview dari backend, atau default
      isPinned: sessionDataFromApi.isPinned || false, // Ambil status pin dari backend, atau default false
      messages: [], // Untuk daftar sesi, array messages biasanya kosong. Pesan penuh dimuat saat sesi aktif.
    }));
  } catch (error) {
    let errorMessage = "Gagal memuat daftar sesi chat.";
    console.error("fetchChatSessionsFromBackend error details:", error);

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      if (axiosError.response) {
        const errorData = axiosError.response.data;
        const status = axiosError.response.status;

        if (status === 404 && axiosError.config?.url === fullBackendUrl) {
          errorMessage = `Error: Endpoint sesi chat '${SESSIONS_LIST_BACKEND_PATH}' tidak ditemukan di server backend '${backendBaseUrl}'. (Status: ${status})`;
        } else if (errorData && typeof errorData === "object") {
          errorMessage =
            errorData.details ||
            errorData.error ||
            errorData.message ||
            `Server backend merespons dengan kesalahan (status ${status}).`;
        } else if (typeof errorData === "string" && errorData.trim() !== "") {
          errorMessage = `Terjadi kesalahan pada server backend (status ${status}).`;
        } else {
          errorMessage = `Server backend tidak dapat dijangkau atau merespons dengan kesalahan (status ${status}).`;
        }
      } else if (axiosError.request) {
        errorMessage =
          "Tidak ada respons dari server backend. Periksa koneksi dan URL backend.";
      } else {
        errorMessage =
          axiosError.message ||
          "Terjadi kesalahan saat mengirim permintaan ke backend.";
      }
    } else if (error instanceof Error) {
      errorMessage = error.message.startsWith("Failed to load chat sessions:")
        ? error.message
        : `Terjadi kesalahan yang tidak diketahui: ${error.message}`;
    }
    throw new Error(errorMessage);
  }
}

// Fungsi untuk mengambil riwayat pesan untuk sesi chat tertentu dari backend Express.js
export async function fetchMessagesForSession(
  sessionId: string
): Promise<MessageFromBackend[]> {
  const backendBaseUrl = process.env.NEXT_PUBLIC_CHAT_BACKEND_BASE_URL;
  const MESSAGES_FOR_SESSION_PATH = `/api/chat/history/${sessionId}`; // Tambahkan /api

  if (!backendBaseUrl) {
    const errorMessage =
      "Konfigurasi error: URL base backend untuk sesi chat tidak diatur (NEXT_PUBLIC_CHAT_BACKEND_BASE_URL).";
    console.error(`fetchMessagesForSession: ${errorMessage}`);
    throw new Error(errorMessage);
  }

  if (!sessionId) {
    const errorMessage = "Session ID diperlukan untuk mengambil riwayat pesan.";
    console.error(`fetchMessagesForSession: ${errorMessage}`);
    throw new Error(errorMessage);
  }

  const fullBackendUrl = `${backendBaseUrl.replace(
    /\/$/,
    ""
  )}${MESSAGES_FOR_SESSION_PATH}`;

  try {
    console.log(
      `fetchMessagesForSession: Attempting to GET messages from: ${fullBackendUrl}`
    );
    const response = await axios.get<{ messages: MessageFromBackend[] }>( // Backend mengembalikan objek dengan properti 'messages'
      fullBackendUrl
    );
    console.log(
      "fetchMessagesForSession: Data received from backend:",
      JSON.stringify(response.data, null, 2)
    );

    // Backend Anda di getChatHistory mengembalikan seluruh objek session, termasuk array messages.
    // Kita hanya tertarik pada array messages.
    if (!response.data || !Array.isArray(response.data.messages)) {
      console.error(
        "Error fetching messages for session: API did not return an array of messages.",
        response.data
      );
      throw new Error(
        "Failed to load messages: Invalid data format from server."
      );
    }

    return response.data.messages; // Kembalikan array pesan
  } catch (error) {
    let errorMessage = `Gagal memuat pesan untuk sesi ${sessionId}.`;
    console.error(
      `fetchMessagesForSession (sessionId: ${sessionId}) error details:`,
      error
    );

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      if (axiosError.response) {
        const errorData = axiosError.response.data;
        const status = axiosError.response.status;
        errorMessage =
          errorData?.details ||
          errorData?.error ||
          errorData?.message ||
          `Server backend merespons dengan kesalahan (status ${status}) saat mengambil pesan.`;
      } else if (axiosError.request) {
        errorMessage =
          "Tidak ada respons dari server backend saat mengambil pesan. Periksa koneksi dan URL backend.";
      } else {
        errorMessage = `Terjadi kesalahan saat mengirim permintaan ke backend untuk mengambil pesan: ${axiosError.message}`;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    throw new Error(errorMessage);
  }
}

export async function deleteSessionFromBackend(
  sessionId: string
): Promise<{ message: string }> {
  const backendBaseUrl = process.env.NEXT_PUBLIC_CHAT_BACKEND_BASE_URL;
  const DELETE_SESSION_PATH = `/api/chat/sessions/${sessionId}`;

  if (!backendBaseUrl) {
    const errorMessage =
      "Konfigurasi error: URL base backend untuk operasi sesi tidak diatur (NEXT_PUBLIC_CHAT_BACKEND_BASE_URL).";
    console.error(`deleteSessionFromBackend: ${errorMessage}`);
    throw new Error(errorMessage);
  }

  if (!sessionId) {
    const errorMessage = "Session ID diperlukan untuk menghapus sesi.";
    console.error(`deleteSessionFromBackend: ${errorMessage}`);
    throw new Error(errorMessage);
  }

  const fullBackendUrl = `${backendBaseUrl.replace(
    /\/$/,
    ""
  )}${DELETE_SESSION_PATH}`;

  try {
    console.log(
      `deleteSessionFromBackend: Attempting to DELETE session from: ${fullBackendUrl}`
    ); // Log URL yang akan di-DELETE
    const response = await axios.delete<{ message: string }>(fullBackendUrl);
    console.log(
      "deleteSessionFromBackend: Response from backend:",
      response.data
    );
    return response.data;
  } catch (error: any) {
    let errorMessage = `Gagal menghapus sesi ${sessionId}.`;
    console.error(
      `[FRONTEND_SERVICE] deleteSessionFromBackend (sessionId: ${sessionId}, URL: ${fullBackendUrl}) error details:`, // Log URL juga saat error
      error
    );
    // Implementasi penanganan error Axios yang detail seperti di fungsi lain
    // ... (copy paste error handling from fetchMessagesForSession or similar)
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      if (axiosError.response) {
        const errorData = axiosError.response.data;
        const status = axiosError.response.status;
        if (status === 404) {
          errorMessage = `Sesi dengan ID ${sessionId} tidak ditemukan di server untuk dihapus.`;
        } else {
          errorMessage =
            errorData?.details ||
            errorData?.error ||
            errorData?.message ||
            `Server backend merespons dengan kesalahan (status ${status}) saat menghapus sesi.`;
        }
      } else if (axiosError.request) {
        errorMessage =
          "Tidak ada respons dari server backend saat menghapus sesi. Periksa koneksi dan URL backend.";
      } else {
        errorMessage = `Terjadi kesalahan saat mengirim permintaan ke backend untuk menghapus sesi: ${axiosError.message}`;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    throw new Error(errorMessage);
  }
}
