import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@nestiq/chat-ui", "@nestiq/shared"],
};

export default nextConfig;
