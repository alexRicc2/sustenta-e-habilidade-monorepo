import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@mercadopago/sdk-react"],
  async rewrites() {
    return [{ source: "/favicon.ico", destination: "/favicon-sustenta.png" }]
  },
};

export default nextConfig;
