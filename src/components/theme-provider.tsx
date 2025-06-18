"use client";

import * as React from "react";
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class" // Penting untuk integrasi mode gelap Tailwind CSS
      defaultTheme="system" // Menggunakan tema sistem (terang/gelap) pengguna secara default
      enableSystem // Memastikan deteksi tema sistem diaktifkan (biasanya default true)
      disableTransitionOnChange // Mencegah kedipan/transisi saat tema berubah, terutama saat memuat awal
      {...props} // Memungkinkan props ini ditimpa dan props lain diteruskan
    >
      {children}
    </NextThemesProvider>
  );
}
