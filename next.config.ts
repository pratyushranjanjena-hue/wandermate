import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.2"],
  images: {
    domains: ["images.unsplash.com"],
  },
};

export default nextConfig;
