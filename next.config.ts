import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Viðhengi í samskiptaformum: allt að 5 skrár × 25 MB (sjá src/lib/helpdesk.ts)
      bodySizeLimit: "130mb",
    },
  },
};

export default nextConfig;
