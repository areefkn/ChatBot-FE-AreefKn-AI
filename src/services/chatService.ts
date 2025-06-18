// SEMENTARA

import axios, { AxiosError } from "axios";
// src/services/chatService.ts

interface ChatMessageForContext {
  sender: "user" | "ai";
  text: string;
}

interface AIResponse {
  reply: string;
  // Mungkin ada properti lain yang dikembalikan API Anda
}

export async function sendMessageToAI(
  message: string,
  history: ChatMessageForContext[]
): Promise<AIResponse> {
  try {
    const response = await axios.post<AIResponse>(
      "/api/chat", // Mengarah ke API Route Next.js internal
      {
        message: message,
        history: history,
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

// Di masa depan, Anda bisa menambahkan fungsi lain di sini, misalnya:
// export async function getChatSessionsFromBackend() { /* ... */ }
// export async function saveChatSessionToBackend(sessionData) { /* ... */ }
