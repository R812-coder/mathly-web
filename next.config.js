/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: { ignoreDuringBuilds: true },
    // This stops Next from wandering up to parent folders with other lockfiles
    
  };
  
  module.exports = nextConfig; // ← CommonJS export
  
