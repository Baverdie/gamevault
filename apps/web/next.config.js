const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['media.rawg.io'],
  },
  webpack: (config) => {
    // Force resolution depuis la racine du monorepo
    config.resolve.modules.push(path.resolve(__dirname, '../../node_modules'));
    return config;
  },
};

module.exports = nextConfig;