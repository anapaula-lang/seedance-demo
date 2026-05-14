import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/**/*": [".claude/**/*"],
  },
};

export default nextConfig;
