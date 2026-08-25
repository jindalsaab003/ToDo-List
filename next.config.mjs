/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    // Keep Turbopack inside this project when another package-lock exists above it.
    root: import.meta.dirname,
  },
};

export default nextConfig;
