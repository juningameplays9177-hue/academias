/**
 * Gera `data/proxy-platform.json` a partir de `data/platform.json` antes do `next build`.
 * Evita o proxy parsear JSON enorme (ex.: logo base64) na primeira requisição (503 em serverless).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const platformPath = path.join(root, "data", "platform.json");
const litePath = path.join(root, "data", "proxy-platform.json");

function buildLite(platform) {
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

try {
  if (!fs.existsSync(platformPath)) {
    process.exit(0);
  }
  const raw = fs.readFileSync(platformPath, "utf-8");
  const platform = JSON.parse(raw);
  const lite = buildLite(platform);
  fs.mkdirSync(path.dirname(litePath), { recursive: true });
  fs.writeFileSync(litePath, JSON.stringify(lite, null, 2), "utf-8");
} catch (e) {
  console.warn("[ensure-proxy-platform]", e?.message ?? e);
  process.exit(0);
}
