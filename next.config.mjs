/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/panel/admin",
        destination: "/gestion",
        permanent: true,
      },
      {
        source: "/panel/admin/:path*",
        destination: "/gestion/:path*",
        permanent: true,
      },
      {
        source: "/institucional/contacto",
        destination: "/contacto",
        permanent: true,
      },
      {
        source: "/registro",
        destination: "/iniciar-sesion",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
