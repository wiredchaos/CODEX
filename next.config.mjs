/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
  reactStrictMode: true,
  experimental: {
    typedRoutes: true
  }
};

export default nextConfig;
