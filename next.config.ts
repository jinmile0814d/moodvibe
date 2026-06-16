import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    '@neteasecloudmusicapienhanced/api',
    '@neteasecloudmusicapienhanced/unblockmusic-utils',
    'sharp',
  ],
};

export default nextConfig;
