import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/favicon.ico", destination: "/favicon.svg" }];
  },
  async headers() {
    const noStore = {
      key: "Cache-Control",
      value: "private, no-cache, no-store, max-age=0, must-revalidate",
    };
    return [
      { source: "/", headers: [noStore] },
      { source: "/login", headers: [noStore] },
      { source: "/login/:path*", headers: [noStore] },
      { source: "/select-academia", headers: [noStore] },
      { source: "/manutencao", headers: [noStore] },
      { source: "/manutencao-unidade", headers: [noStore] },
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
