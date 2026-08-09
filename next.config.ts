import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["bcryptjs", "jszip", "mammoth", "pdf-parse"],
};

export default nextConfig;
