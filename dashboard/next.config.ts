import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["he-claw", "100.101.249.4"],
  devIndicators: false,
  experimental: {
    externalDir: true,
  },
};

export default nextConfig;
