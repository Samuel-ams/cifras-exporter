import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production'

const nextConfig: NextConfig = {
  /* config options here */
  basePath: isProd ? '/cifras-exporter' : undefined,
  assetPrefix: isProd ? '/cifras-exporter/' : undefined,

  output: 'export',

  images: {
    unoptimized: true,
  }
};

export default nextConfig;
