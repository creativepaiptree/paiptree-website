/** @type {import('next').NextConfig} */
const isRuntimeServer = process.env.PAIPTREE_RUNTIME_SERVER === '1';

const nextConfig = {
  ...(process.env.NODE_ENV === 'production'
    ? {
        output: isRuntimeServer ? 'standalone' : 'export',
      }
    : {}),
  trailingSlash: true,
  images: {
    unoptimized: true,
    domains: ['images.unsplash.com']
  }
}

module.exports = nextConfig
