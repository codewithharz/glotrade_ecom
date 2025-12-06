import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during builds (run separately in CI/CD)
    ignoreDuringBuilds: true,
  },
  // typescript: {
  //   // Warning: This allows production builds to successfully complete even if
  //   // your project has type errors.
  //   ignoreBuildErrors: true,
  // },
  output: 'standalone',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  async redirects() {
    return [
      {
        source: '/vendor/coupons',
        destination: '/admin/coupons',
        permanent: true,
      },
      {
        source: '/vendor/store',
        destination: '/admin/store',
        permanent: true,
      },
      {
        source: '/vendor/products',
        destination: '/admin/products',
        permanent: true,
      },
      {
        source: '/vendor',
        destination: '/admin',
        permanent: true,
      },
      {
        source: '/vendor/:path*',
        destination: '/admin',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
