import type { NextConfig } from "next";

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
    return [
      { source: "/favicon.ico", headers: [faviconCache] },
      { source: "/favicon.svg", headers: [faviconCache] },
      { source: "/", headers: [noStore] },
      { source: "/login", headers: [noStore] },
      { source: "/login/:path*", headers: [noStore] },
      { source: "/select-academia", headers: [noStore] },
      { source: "/manutencao", headers: [noStore] },
      { source: "/manutencao-unidade", headers: [noStore] },
      { source: "/ultra-admin", headers: [noStore] },
      {
        source: "/ultra-admin/:path*",
        headers: [noStore],
      },
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
