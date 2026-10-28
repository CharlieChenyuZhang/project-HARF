import type { NextConfig } from "next";

// HARF is exported as a static site: every dynamic interaction talks to the
// Amplify (AppSync + DynamoDB) backend directly from the browser.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
