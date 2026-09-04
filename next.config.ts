import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Framleiðslu-build í .next/standalone (sjá deploy.sh á web1) – lítill server.js + aðeins nauðsynleg node_modules
  output: "standalone",
  // Leyfa HMR/dev-tengingar frá öðrum vélum á LAN-inu (annars fellur websocket á /_next/hmr)
  allowedDevOrigins: ["192.168.1.*", "192.168.2.*", "*.local"],
  experimental: {
    serverActions: {
      // Viðhengi í samskiptaformum: allt að 5 skrár × 25 MB (sjá src/lib/helpdesk.ts)
      bodySizeLimit: "130mb",
    },
  },
};

export default nextConfig;
