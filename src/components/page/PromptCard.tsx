// src/components/page/PromptCard.tsx
"use client";

import React from "react";

interface PromptCardProps {
  name: string;
  onClick: () => void;
}

export function PromptCard({ name, onClick }: PromptCardProps) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer p-4 rounded-lg bg-white dark:bg-slate-700 shadow-md hover:shadow-lg transition-shadow duration-200"
    >
      <h3 className="font-medium text-slate-800 dark:text-slate-200">{name}</h3>
      {/* Anda bisa menambahkan deskripsi singkat atau ikon di sini jika diinginkan */}
    </div>
  );
}
