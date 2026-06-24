/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev }) => {
    if (dev) {
      // Disable webpack filesystem caching in dev mode to prevent cache locking / compaction 500 errors
      config.cache = false;
    }
    return config;
  }
};

export default nextConfig;
