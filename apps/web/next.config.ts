import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile the source-only workspace package (ships raw TS).
  transpilePackages: ["@composed/domain"],
};

export default nextConfig;
