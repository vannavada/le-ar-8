/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@content-platform/database", "@content-platform/api"],
  reactStrictMode: true,
};

module.exports = nextConfig;
