import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ─── Security Headers ─────────────────────────────────────────────────────
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/(.*)",
        headers: [
          // Prevent the site from being embedded in an iframe (clickjacking)
          { key: "X-Frame-Options", value: "DENY" },
          // Prevent MIME-type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Strict referrer policy
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Permissions policy — disable unnecessary browser features
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Content Security Policy
          // NOTE: unsafe-inline/unsafe-eval are required by Next.js App Router without
          // a nonce setup. Tighten with middleware-based nonces before launch if needed.
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self'",
              "connect-src 'self'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
      {
        // Account/checkout pages — no caching, always fresh
        source: "/(account|login|onboarding|fit)(.*)",
        headers: [
          { key: "Cache-Control", value: "private, no-store, must-revalidate" },
        ],
      },
      {
        // Public marketing pages — cache for 5 minutes at edge
        source: "/(about|brands|new-in|experience|help|contact)(.*)",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=300, stale-while-revalidate=600" },
        ],
      },
      {
        // Static assets — cache aggressively (Vercel adds content hash to filenames)
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },

  // ─── Image Config ─────────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      // Vercel Blob storage
      { protocol: "https", hostname: "**.vercel-storage.com" },
      // Cloudflare R2 (add your actual bucket domain when configured)
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
    ],
  },

  // ─── Redirects ────────────────────────────────────────────────────────────
  async redirects() {
    return [
      // Redirect /home to / if anyone links to it
      { source: "/home", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
