// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/sitemap.xml",
        headers: [
          { key: "Content-Type", value: "application/xml" },
          {
            key: "CDN-Cache-Control",
            value: "public, s-maxage=86400, must-revalidate",
          },
        ],
      },
      {
        source: "/drug/(.*)",
        headers: [{ key: "X-Robots-Tag", value: "index, follow" }],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/drug/:path*",
        has: [{ type: "query", key: "name" }],
        destination: "/drug/:name",
        permanent: true,
      },
      {
        source: "/drug/:name%20:another",
        destination: "/drug/:name-:another",
        permanent: true,
      },
    ];
  },
  env: {
    SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "https://www.drugbit.info",
  },
  trailingSlash: true,
  productionBrowserSourceMaps: false,
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["react-icons"],
  },
  allowedDevOrigins: ["http://10.232.205.150:3000"],
};

export default nextConfig;
