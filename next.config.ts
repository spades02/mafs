import type { NextConfig } from "next";

// Vercel sets VERCEL=1 automatically. Everywhere else (Appflow, local iOS builds)
// defaults to static export so Capacitor gets its `out/` directory.
const isVercelBuild = process.env.VERCEL === "1";
const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  ...(isVercelBuild || isDev ? {} : { output: "export" as const }),
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vlpjyojbujvxfsdazycc.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
