/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@kairo/shared'],
  images: {
    domains: ['localhost', 'avatars.githubusercontent.com'],
  },
  // Stability improvements
  reactStrictMode: true,
  // Webpack optimizations for stability
  webpack: (config, { dev, isServer }) => {
    // Reduce memory usage in development
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        poll: 1000, // Check for changes every second
        aggregateTimeout: 300, // Delay rebuild after first change
        ignored: ['**/node_modules', '**/.git', '**/.next'],
      };
    }
    return config;
  },
  // Increase static generation timeout
  staticPageGenerationTimeout: 120,
  // Output standalone build for better stability
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
};

module.exports = nextConfig;
