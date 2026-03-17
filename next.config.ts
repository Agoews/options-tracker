import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  allowedDevOrigins: ["127.0.0.1"],
  serverExternalPackages: ["firebase-admin"],
  async headers() {
    return [
      {
        // Allow Firebase popup auth to communicate back to the opener
        source: "/sign-in",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
