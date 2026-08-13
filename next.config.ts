import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @huggingface/transformers hanya dipakai di Web Worker (browser),
  // tidak perlu di-bundle oleh server — exclude agar tidak error saat SSR.
  serverExternalPackages: ["@huggingface/transformers"],
};

export default nextConfig;
