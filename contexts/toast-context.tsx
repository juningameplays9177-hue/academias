"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils/cn";

type ToastType = "success" | "error" | "info";

export type ToastInput = {
  title: string;
  description?: string;
  type?: ToastType;
};

type Toast = ToastInput & { id: string };

type ToastContextValue = {
  pushToast: (t: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const ids = useRef(0);

  const pushToast = useCallback((t: ToastInput) => {
    const id = `toast-${ids.current++}`;
    const toast: Toast = { id, type: t.type ?? "info", ...t };
    setToasts((prev) => [...prev, toast]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 4200);
  }, []);

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex max-w-sm flex-col gap-2"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex gap-3 rounded-xl border border-border bg-card/95 p-3 shadow-lg backdrop-blur animate-fade-up",
              t.type === "success" && "border-orange-500/35",
              t.type === "error" && "border-orange-700/50",
            )}
            role="status"
          >
            <div className="mt-0.5 text-accent">
              {t.type === "success" ? (
                <FontAwesomeIcon icon={faCircleCheck} className="text-orange-500 dark:text-orange-400" />
              ) : t.type === "error" ? (
                <FontAwesomeIcon icon={faTriangleExclamation} className="text-orange-600 dark:text-orange-400" />
              ) : (
                <span className="block h-2 w-2 rounded-full bg-accent" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{t.title}</p>
              {t.description ? (
                <p className="text-xs text-muted">{t.description}</p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
