/** @type {import('next').NextConfig} */
const nextConfig = {
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
    ];
  },
};

export default nextConfig;
