import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@nestiq/chat-ui",
    "@nestiq/chat-engine",
    "@nestiq/shared",
    "@nestiq/db",
  ],
};

export default nextConfig;
