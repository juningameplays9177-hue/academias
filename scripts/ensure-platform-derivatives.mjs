/**
 * Antes do `next build`: gera arquivos derivados pequenos a partir de `data/platform.json`.
 * - proxy-platform.json — só flags (proxy)
 * - platform-public.json — registro completo sem logos data:/gigantes (APIs quentes)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const platformPath = path.join(root, "data", "platform.json");
const proxyLitePath = path.join(root, "data", "proxy-platform.json");
const publicPath = path.join(root, "data", "platform-public.json");

function buildProxyLite(platform) {
  return {
    version: platform.version ?? 1,
    platformSettings: platform.platformSettings,
    academias: (platform.academias ?? []).map((a) => ({
      id: a.id,
      slug: a.slug,
      status: a.status,
      plataformaDesligada: a.plataformaDesligada === true,
    })),
  };
}

function stripLogo(logoUrl) {
  if (logoUrl == null || typeof logoUrl !== "string") return null;
  const u = logoUrl.trim();
  if (!u) return null;
  if (u.startsWith("data:")) return null;
  if (u.length > 6000) return null;
  return u;
}

function buildPublic(platform) {
  return {
    ...platform,
    academias: (platform.academias ?? []).map((a) => ({
      ...a,
      logoUrl: stripLogo(a.logoUrl),
    })),
  };
}

try {
  if (!fs.existsSync(platformPath)) {
    process.exit(0);
  }
  const raw = fs.readFileSync(platformPath, "utf-8");
  const platform = JSON.parse(raw);
  fs.mkdirSync(path.dirname(proxyLitePath), { recursive: true });
  fs.writeFileSync(
    proxyLitePath,
    JSON.stringify(buildProxyLite(platform), null, 2),
    "utf-8",
  );
  fs.writeFileSync(
    publicPath,
    JSON.stringify(buildPublic(platform), null, 2),
    "utf-8",
  );
} catch (e) {
  console.warn("[ensure-platform-derivatives]", e?.message ?? e);
  process.exit(0);
}
