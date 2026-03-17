import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  allowedDevOrigins: ["127.0.0.1"],
  serverExternalPackages: ["firebase-admin"],
};

export default nextConfig;
