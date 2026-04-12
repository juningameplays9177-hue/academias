/** Aceita link compartilhado do Google Maps (maps, goo.gl, maps.app.goo.gl). Vazio = válido (opcional). */
export function isValidGoogleMapsUrl(raw: string): boolean {
  const s = raw.trim();
  if (!s) return true;
  try {
    const withProto =
      s.startsWith("http://") || s.startsWith("https://") ? s : `https://${s}`;
    const u = new URL(withProto);
    const h = u.hostname.replace(/^www\./, "").toLowerCase();
    if (h === "maps.app.goo.gl" || h === "goo.gl") return true;
    if (h.startsWith("maps.") && h.includes("google.")) return true;
    if (h.includes("google.") && u.pathname.includes("/maps")) return true;
    return false;
  } catch {
    return false;
  }
}

export function normalizeGoogleMapsUrl(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  return s.startsWith("http://") || s.startsWith("https://") ? s : `https://${s}`;
}
