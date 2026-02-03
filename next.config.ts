import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Force server-only packages to stay on server
  experimental: {
    serverComponentsExternalPackages: [
      '@prisma/client', 
      'prisma', 
      '@prisma/engines',
      '@prisma/engines-version'
    ],
  },
  serverExternalPackages: [
    '@prisma/client', 
    'prisma',
    '@prisma/engines', 
    'framer-motion',
    'lucide-react'
  ],
  outputFileTracingIncludes: {
    '/api/**/*': ['./prisma/**/*'],
  },
  // Use Turbopack config instead of webpack
  turbopack: {
    resolveExtensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
};

export default nextConfig;
