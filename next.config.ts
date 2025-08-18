import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ignore optional dependencies for snoowrap
      config.externals = config.externals || [];
      config.externals.push({
        'bufferutil': 'bufferutil',
        'utf-8-validate': 'utf-8-validate',
      });
    }
    return config;
  },
  serverExternalPackages: ['snoowrap'],
};

export default nextConfig;
