import type { NextConfig } from "next";

const apiTarget = (
  process.env.API_REWRITE_TARGET ??
  process.env.API_INTERNAL_URL ??
  "http://127.0.0.1:8787"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Single public origin: browser calls /api/* → Fastify
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiTarget}/api/:path*`,
      },
      {
        source: "/openapi.json",
        destination: `${apiTarget}/openapi.json`,
      },
    ];
  },
};

export default nextConfig;
