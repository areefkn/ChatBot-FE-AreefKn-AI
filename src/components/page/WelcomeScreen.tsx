// src/components/page/WelcomeScreen.tsx
"use client";

import { MessageSquare, PlusCircle } from "lucide-react"; // Impor PlusCircle
import { PromptCard } from "./PromptCard";

interface WelcomeScreenProps {
  appTitle: string;
  onSelectTemplate: (template: string) => void; // Prop baru untuk memilih template
  onNewChat: () => void; // Tambahkan prop untuk memulai chat baru (kosong)
}

export function WelcomeScreen({
  appTitle,
  onSelectTemplate,
  onNewChat, // Tambahkan onNewChat di sini
}: WelcomeScreenProps) {
  const templates = [
    {
      name: "Rangkum Teks",
      prompt: "Tolong rangkum teks berikut:\n\n",
    },
    {
      name: "Buat Draf Email",
      prompt: "Buat draf email profesional tentang topik berikut:\n\n",
    },
    {
      name: "Jelaskan Konsep",
      prompt: "Jelaskan konsep berikut dengan istilah sederhana:\n\n",
    },
    {
      name: "Hasilkan Ide",
      prompt: "Hasilkan 5 ide kreatif untuk:\n\n",
    },
    {
      name: "Terjemahkan Teks",
      prompt: "Terjemahkan teks berikut ke [bahasa]:\n\n",
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
      <MessageSquare className="h-16 w-16 md:h-20 md:w-20 text-slate-400 dark:text-slate-500 mb-6 animate-pulse" />{" "}
      {/* Tambahkan animasi pulse sederhana */}
      <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
        Selamat Datang di {appTitle}
      </h2>
      <p className="text-slate-500 dark:text-slate-400 mb-6">
        Siap untuk berdiskusi? Pilih percakapan yang ada atau mulai yang baru.
      </p>
      {/* Tombol Mulai Percakapan Baru (Kosong) */}
      <button
        onClick={onNewChat}
        className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium rounded-lg bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-500 text-white hover:from-cyan-600 hover:via-indigo-600 hover:to-violet-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-colors duration-150 mb-8" // Tambahkan margin bawah dan ganti bg solid dengan gradien
      >
        <PlusCircle size={18} />
        Mulai Percakapan Baru
      </button>
      {/* Daftar Template */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-3xl">
        {templates.map((template) => (
          <PromptCard
            key={template.name}
            name={template.name}
            onClick={() => onSelectTemplate(template.prompt)}
          />
        ))}
      </div>
    </div>
  );
}
