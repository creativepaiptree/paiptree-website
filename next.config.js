/** @type {import('next').NextConfig} */
const useStaticExport = process.env.PAIPTREE_STATIC_EXPORT === '1';
const useRuntimeServer = process.env.PAIPTREE_RUNTIME_SERVER === '1' || !useStaticExport;

const nextConfig = {
  ...(process.env.NODE_ENV === 'production'
    ? useStaticExport && !useRuntimeServer
      ? {
          output: 'export',
        }
      : useRuntimeServer
        ? {
            output: 'standalone',
          }
        : {}
    : {}),
  trailingSlash: true,
  images: {
    unoptimized: true,
    domains: ['images.unsplash.com'],
  },
};

module.exports = nextConfig;
