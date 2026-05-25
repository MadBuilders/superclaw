import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["kanban.bartomolina.io", "100.101.249.4"],
  devIndicators: false,
};

export default nextConfig;
