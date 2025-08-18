import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*", // match any call to /api/*
        destination: "http://localhost:5000/api/:path*", // forward to Flask
      },
    ];
  },
};

export default nextConfig;
