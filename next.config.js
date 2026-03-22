/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_APP_NAME: 'Crypto Tax Reporter',
  },
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  // API route timeout (increase for large wallet sets)
  serverRuntimeConfig: {
    apiTimeout: 60000, // 60 seconds
  },
}

module.exports = nextConfig
