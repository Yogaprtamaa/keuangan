import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Force server-only packages to stay on server
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
    root: './keuangan',
  },
};

export default nextConfig;
