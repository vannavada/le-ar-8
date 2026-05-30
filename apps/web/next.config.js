/** @type {import('next').NextConfig} */

// In this Turborepo monorepo the root .env is not auto-loaded by Next.js
// (Next.js looks in apps/web/, not the repo root). Load it explicitly so
// DATABASE_URL, NEXTAUTH_SECRET etc. are available to server-side code.
require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });

const nextConfig = {
  transpilePackages: ["@content-platform/database"],
  reactStrictMode: true,
};

module.exports = nextConfig;
