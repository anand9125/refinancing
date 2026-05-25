import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@kamino-finance/klend-sdk",
    "@kamino-finance/farms-sdk",
    "@mrgnlabs/marginfi-client-v2",
    "@mrgnlabs/mrgn-common",
    "@coral-xyz/anchor",
    "@solana/web3.js",
  ],
  turbopack: {
    resolveAlias: {
      // Stub Node.js built-ins that DeFi SDKs import but can't run in browsers
      fs: { browser: "./src/lib/empty-module.ts" },
      path: { browser: "./src/lib/empty-module.ts" },
      os: { browser: "./src/lib/empty-module.ts" },
      crypto: { browser: "./src/lib/empty-module.ts" },
      net: { browser: "./src/lib/empty-module.ts" },
      tls: { browser: "./src/lib/empty-module.ts" },
      child_process: { browser: "./src/lib/empty-module.ts" },
      perf_hooks: { browser: "./src/lib/empty-module.ts" },
    },
  },
};

export default nextConfig;
