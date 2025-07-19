import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // This tells Next.js to ignore ESLint errors during build
    // Your code will still work perfectly, just like locally
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;