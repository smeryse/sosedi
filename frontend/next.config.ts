import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, "."),
  transpilePackages: ["maplibre-gl"],
};

export default nextConfig;
