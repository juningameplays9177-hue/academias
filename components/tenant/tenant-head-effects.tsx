"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { defaultMetaDescription } from "@/lib/tenant/branding";
import { tenantTheme } from "@/lib/tenant/theme";

/** Atualiza título, meta description, favicon e cor CSS global da unidade. */
export function TenantHeadEffects() {
  const pathname = usePathname();
  const { tenant: academia, user, loading } = useAuth();

  useEffect(() => {
    const th = tenantTheme(academia);
    const { primary, secondary, soft } = th;
    document.documentElement.style.setProperty("--tenant-primary", primary);
    document.documentElement.style.setProperty("--tenant-secondary", secondary);
    document.documentElement.style.setProperty("--tenant-soft", soft);
    document.documentElement.style.setProperty("--tenant-shell-bg", th.shellBackground);
    document.documentElement.style.setProperty("--tenant-shell-fg", th.shellForeground);
    document.documentElement.style.setProperty("--tenant-shell-border", th.shellBorder);
    document.documentElement.style.setProperty("--tenant-shell-card", th.shellCard);
    document.documentElement.style.setProperty("--primary", primary);
    document.documentElement.style.setProperty("--secondary", secondary);
    document.documentElement.style.setProperty("--theme-background", th.shellBackground);
    document.documentElement.style.setProperty("--theme-foreground", th.shellForeground);
    document.documentElement.style.setProperty("--accent", primary);
    document.documentElement.style.setProperty(
      "--accent-soft",
      `color-mix(in srgb, ${primary} 14%, transparent)`,
    );
    return () => {
      const keys = [
        "--tenant-primary",
        "--tenant-secondary",
        "--tenant-soft",
        "--tenant-shell-bg",
        "--tenant-shell-fg",
        "--tenant-shell-border",
        "--tenant-shell-card",
        "--primary",
        "--secondary",
        "--theme-background",
        "--theme-foreground",
        "--accent",
        "--accent-soft",
      ] as const;
      keys.forEach((k) => document.documentElement.style.removeProperty(k));
    };
  }, [academia]);

  useEffect(() => {
    if (loading) return;
    const base = "PowerFit";
    const onLogin = pathname === "/login";

    if (onLogin && !user) {
      document.title = academia?.nome?.trim()
        ? `${academia.nome.trim()} · Login e cadastro`
        : "Login e cadastro · PowerFit";
    } else if (academia?.nome) {
      const suffix = user?.role ? ` · ${labelRole(user.role)}` : "";
      document.title = `${academia.nome}${suffix}`;
    } else {
      document.title = `${base} · Academias`;
    }

    const desc = academia ? defaultMetaDescription(academia) : `${base} — rede de academias com dados isolados por unidade.`;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);

    let link = document.querySelector("link[data-tenant-favicon]");
    if (
      academia?.logoUrl &&
      (academia.logoUrl.startsWith("http") ||
        academia.logoUrl.startsWith("data:") ||
        academia.logoUrl.startsWith("/"))
    ) {
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "icon");
        link.setAttribute("data-tenant-favicon", "1");
        document.head.appendChild(link);
      }
      link.setAttribute("href", academia.logoUrl);
    } else if (link) {
      link.remove();
    }
  }, [academia, user?.role, user, loading, pathname]);

  return null;
}

function labelRole(role: string): string {
  if (role === "ultra_admin") return "Ultra Admin";
  if (role === "admin") return "Admin";
  if (role === "professor") return "Professor";
  if (role === "aluno") return "Aluno";
  return role;
}
