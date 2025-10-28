import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      rules: {},
    },
  },
  webpack: (config) => {
    config.resolve.symlinks = false;
    return config;
  },
  outputFileTracing: false,
};

export default nextConfig;
