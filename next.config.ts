import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['@prisma/client', 'prisma'],
  // Ensure API routes are not pre-rendered
  experimental: {
    outputFileTracingIncludes: {
      '/api/**/*': ['./node_modules/**/*'],
    },
  },
};

export default nextConfig;
