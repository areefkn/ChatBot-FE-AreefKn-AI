// d:\Areefkn Dev\chatbot-gemini\src\components\ui\ConfirmationModal.tsx
"use client";

import React, { useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode; // Bisa string atau JSX untuk pesan yang lebih kaya
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Hapus",
  cancelText = "Batal",
}: ConfirmationModalProps) {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose} // Tutup modal jika klik di luar area konten
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-md transform transition-all"
        onClick={(e) => e.stopPropagation()} // Mencegah penutupan modal saat klik di dalam konten
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
              <AlertTriangle
                className="h-6 w-6 text-red-600 dark:text-red-400"
                aria-hidden="true"
              />
            </div>
            <h3
              className="text-lg font-semibold leading-6 text-slate-900 dark:text-slate-100"
              id="modal-title"
            >
              {title}
            </h3>
          </div>
          <button
            type="button"
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
            onClick={onClose} // Tetap onClose untuk fungsionalitas
            aria-label="Tutup"
          >
            <X size={20} />
          </button>
        </div>

        <div className="text-sm text-slate-600 dark:text-slate-300 mb-6">
          {message}
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3">
          <button
            type="button"
            className="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-slate-700 px-3 py-2 text-sm font-semibold text-slate-900 dark:text-slate-100 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 sm:mt-0 sm:w-auto"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:w-auto"
            onClick={() => {
              onConfirm();
              onClose(); // Tutup modal setelah konfirmasi
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
