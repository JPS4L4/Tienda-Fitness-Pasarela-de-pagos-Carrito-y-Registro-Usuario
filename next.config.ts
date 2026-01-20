import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      // Agrega otros dominios que uses (ej: imgur, cloudinary, etc.)
      {
        protocol: 'https',
        hostname: '**.tu-dominio.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
