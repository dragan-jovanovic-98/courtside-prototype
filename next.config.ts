import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/courtside-prototype',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
