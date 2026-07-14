import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This repository intentionally keeps a lockfile per app. Pinning the root
  // prevents Turbopack from selecting the repository-level lockfile and then
  // resolving web-only packages from the wrong node_modules directory.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
