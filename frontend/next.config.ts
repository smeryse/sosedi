import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["maplibre-gl"],
  outputFileTracingRoot: path.join(__dirname, "../"),
};

export default nextConfig;
