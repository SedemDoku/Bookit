/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: "/api/auth.php", destination: "/api/auth" },
      { source: "/api/bookmarks.php", destination: "/api/bookmarks" },
      { source: "/api/collections.php", destination: "/api/collections" },
      { source: "/api/canvas.php", destination: "/api/canvas" },
    ];
  },
};

export default nextConfig;
