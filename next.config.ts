import type { NextConfig } from "next";

/**
 * Supabase Storage public bucket host is added to `remotePatterns` so
 * `next/image` can optimize product images once real photos are uploaded.
 * The host is derived from NEXT_PUBLIC_SUPABASE_URL when present.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      ...(supabaseHost
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHost,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
    // Seed/placeholder artwork ships as inline SVGs in /public. These are
    // first-party assets the owner replaces with real photos via the admin.
    dangerouslyAllowSVG: true,
    contentSecurityPolicy:
      "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    // Keep the public bundle lean; trees-shake icon imports.
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
