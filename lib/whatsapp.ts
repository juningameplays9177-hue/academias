/** Número completo sem +: 55 + DDD 21 + 974121849 */
export const WHATSAPP_NUMBER_DIGITS = "5521974121849";

/** Texto amigável (ex.: rodapé / contato) */
export const WHATSAPP_DISPLAY = "(21) 97412-1849";

export function whatsappChatUrl(prefillText?: string) {
  const base = `https://wa.me/${WHATSAPP_NUMBER_DIGITS}`;
  const t = prefillText?.trim();
  if (!t) return base;
  return `${base}?text=${encodeURIComponent(t)}`;
}
