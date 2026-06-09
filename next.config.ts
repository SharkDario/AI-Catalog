import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    allowedDevOrigins: ['172.26.16.1'],
  }
};

export default nextConfig;
