import type { NextConfig } from "next";
import path from "path";
import { readFileSync } from "fs";

const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));

const nextConfig: NextConfig = {
  transpilePackages: ["@trakr/schemas"],
  turbopack: {
    root: path.join(__dirname, "../.."),
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: pkg.version,
    NEXT_PUBLIC_NODE_VERSION: process.version,
  },
};

export default nextConfig;