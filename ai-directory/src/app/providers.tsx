"use client";

import { ReactNode } from "react";
import { FavoritesProvider } from "@/components/contexts/FavoritesContext";
import { ThemeProvider } from "@/components/contexts/ThemeContext";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <FavoritesProvider>{children}</FavoritesProvider>
    </ThemeProvider>
  );
}

