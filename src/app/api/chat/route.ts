// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError } from "axios";

// URL backend kustom Anda, diambil dari environment variable server-side
const ENV_VAR_NAME_FOR_BACKEND_URL = "NEXT_PUBLIC_CHAT_BACKEND_BASE_URL";

export async function POST(req: NextRequest) {
  const customBackendUrl = process.env[ENV_VAR_NAME_FOR_BACKEND_URL];

  if (!customBackendUrl) {
    console.error(
      `${ENV_VAR_NAME_FOR_BACKEND_URL} is not set in environment variables. Please check your .env.local file.`
    );
    return NextResponse.json(
      {
        error: `Server configuration error: The backend API URL is not set.`,
      },
      { status: 500 }
    );
  }
  // At this point, TypeScript knows customBackendUrl is a string.

  // Deklarasikan fullBackendChatUrl di sini agar bisa diakses di blok catch
  let fullBackendChatUrl = "";

  try {
    const { message, history, sessionId } = await req.json(); // Ambil sessionId

    if (!message) {
      return NextResponse.json(
        { error: "Pesan diperlukan dalam request body" },
        { status: 400 }
      );
    }

    // Asumsikan customBackendUrl adalah base URL (misalnya, "http://localhost:5055")
    // Tambahkan path spesifik untuk endpoint chat di sini
    fullBackendChatUrl = `${customBackendUrl.replace(/\/$/, "")}/api/chat`;

    // Meneruskan request ke backend kustom Anda
    const backendResponse = await axios.post(
      fullBackendChatUrl,
      {
        message,
        history, // Asumsikan backend kustom Anda mengharapkan format yang sama
        sessionId, // Teruskan sessionId ke backend kustom
      },
      {
        headers: {
          "Content-Type": "application/json",
          // Anda mungkin perlu meneruskan header lain jika backend kustom Anda memerlukannya
        },
      }
    );

    // Mengembalikan respons dari backend kustom ke frontend
    return NextResponse.json(backendResponse.data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error(
      `Error saat memproxy request ke custom backend URL: ${fullBackendChatUrl}. Error:`,
      error
    );

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      // Jika error berasal dari respons backend kustom
      if (axiosError.response) {
        return NextResponse.json(
          axiosError.response.data || {
            error: "Gagal berkomunikasi dengan layanan chat backend.",
          },
          { status: axiosError.response.status || 500 }
        );
      }
      // Jika error terjadi sebelum respons diterima (misalnya, masalah jaringan ke backend kustom)
      return NextResponse.json(
        { error: "Tidak dapat terhubung ke layanan chat backend." },
        { status: 503 } // Service Unavailable
      );
    }

    // Error lainnya
    return NextResponse.json(
      { error: "Terjadi kesalahan internal pada server proxy." },
      { status: 500 }
    );
  }
}
