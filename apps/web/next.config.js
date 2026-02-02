/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['@dashin/ui', '@dashin/shared-types', '@dashin/supabase', '@dashin/auth', '@dashin/rbac'],
  experimental: {
    typedRoutes: true,
  },
  poweredByHeader: false,
  compress: true,
};

module.exports = nextConfig;
