import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/s/:salon", destination: "/" },
      { source: "/s/:salon/:path*", destination: "/:path*" },
    ];
  },
};

export default nextConfig;
