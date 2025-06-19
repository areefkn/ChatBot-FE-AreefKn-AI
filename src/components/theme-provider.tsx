// components/theme-provider

"use client";

import * as React from "react";
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system" // perreferensi
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
