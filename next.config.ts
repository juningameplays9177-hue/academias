import type { NextConfig } from "next";

/**
 * HTML cacheado na CDN com shell antigo + deploy novo = referências a chunks que viram 404.
 * Força no-store em todas as entradas de documento conhecidas (exceto `/_next/static`, que segue com cache longo padrão do Next).
 */
const HTML_NO_STORE_SOURCES = [
  "/",
  "/login",
  "/login/:path*",
  "/select-academia",
  "/select-academia/:path*",
  "/manutencao",
  "/manutencao-unidade",
  "/ultra-admin",
  "/ultra-admin/:path*",
  "/admin",
  "/admin/:path*",
  "/aluno",
  "/aluno/:path*",
  "/professor",
  "/professor/:path*",
  "/mensalidade",
  "/mensalidade/:path*",
  "/site",
  "/site/:path*",
  "/a/:path*",
] as const;

const nextConfig: NextConfig = {
  async headers() {
    const noStore = {
      key: "Cache-Control",
      value: "private, no-cache, no-store, max-age=0, must-revalidate",
    };
    const faviconCache = {
      key: "Cache-Control",
      value: "public, max-age=604800, stale-while-revalidate=86400",
    };
    const htmlHeaders = HTML_NO_STORE_SOURCES.map((source) => ({
      source,
      headers: [noStore],
    }));
    return [
      { source: "/favicon.ico", headers: [faviconCache] },
      { source: "/favicon.svg", headers: [faviconCache] },
      ...htmlHeaders,
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
