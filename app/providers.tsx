"use client";

import { AuthSessionProvider } from "@/contexts/auth-session-context";
import { ThemeProvider } from "@/contexts/theme-context";
import { ToastProvider } from "@/contexts/toast-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
