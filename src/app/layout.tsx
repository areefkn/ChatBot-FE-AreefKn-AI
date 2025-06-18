// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // Pastikan ini diimpor sebelum ThemeProvider
import { ThemeProvider } from "next-themes";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AreefKn AI", // Or your app's title
  description: "Chatbot powered by Gemini", // Or your app's description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      {/* Pastikan tidak ada spasi atau baris baru antara tag html dan body */}
      {/* Hapus spasi ekstra dari sini */}
      {/* suppressHydrationWarning is often recommended with next-themes */}
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system" // Or "light" or "dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
