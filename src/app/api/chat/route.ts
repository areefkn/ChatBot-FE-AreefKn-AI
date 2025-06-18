// src/app/api/chat/route.ts
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const MODEL_NAME = "gemini-1.5-flash-latest"; // Coba model ini, atau "gemini-1.5-pro-latest"
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("GEMINI_API_KEY is not set in environment variables.");
  // Melempar error di sini akan menghentikan aplikasi saat build jika variabel tidak ada.
  // Pertimbangkan untuk menangani ini dengan cara yang berbeda di produksi jika diperlukan.
  throw new Error(
    "GEMINI_API_KEY is not set. Please add it to your .env.local file."
  );
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

const generationConfig = {
  temperature: 0.7, // Sesuaikan untuk kreativitas (0.0 - 1.0)
  topK: 1,
  topP: 1,
  maxOutputTokens: 2048, // Batas token output
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Pesan diperlukan" }, { status: 400 });
    }

    const chatHistoryForGemini = history
      ? history.map((msg: { sender: string; text: string }) => ({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        }))
      : [];

    const chat = model.startChat({
      generationConfig,
      safetySettings,
      history: chatHistoryForGemini,
    });

    const result = await chat.sendMessage(message);
    const response = result.response;
    const aiReply = response.text();

    return NextResponse.json({ reply: aiReply });
  } catch (error) {
    console.error("Error saat memanggil Gemini API:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Gagal mendapatkan respons dari AI";
    // Periksa apakah error terkait safety settings
    if (errorMessage.includes("SAFETY")) {
      return NextResponse.json(
        {
          error: "Respons diblokir karena pengaturan keamanan.",
          details: errorMessage,
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Gagal mendapatkan respons dari AI", details: errorMessage },
      { status: 500 }
    );
  }
}
