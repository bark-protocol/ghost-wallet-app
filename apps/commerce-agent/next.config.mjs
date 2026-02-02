/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@ghost-wallet/commerce-agent'],
  experimental: {
    turbo: {
      resolveExtensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
  },
};

export default nextConfig;
