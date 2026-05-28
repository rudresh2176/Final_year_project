import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" was causing deployment failure — removed for serverless compatibility
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
