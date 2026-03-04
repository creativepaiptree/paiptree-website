/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(process.env.NODE_ENV === 'production' && process.env.I18N_STATIC_EXPORT !== '0'
    ? {
        output: 'export',
      }
    : {}),
  trailingSlash: true,
  images: {
    unoptimized: true,
    domains: ['images.unsplash.com']
  }
}

module.exports = nextConfig
