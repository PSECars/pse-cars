import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // ignore ts errors during build
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    
    // Configure external images
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: '*.unsplash.com',
                pathname: '/**',
            },
        ],
        // Add image optimization settings
        formats: ['image/webp', 'image/avif'],
        minimumCacheTTL: 60,
        dangerouslyAllowSVG: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },
    
    // Add API proxy for development to handle CORS better
    async rewrites() {
        const merchUrl = process.env.NEXT_PUBLIC_MERCH_URL || 'http://localhost:8083';
        
        return [
            // API endpoints (categories, products, etc.)
            {
                source: '/api/merch/api/:path*',
                destination: `${merchUrl}/merch/api/:path*`,
            },
            // Actuator endpoints (health, info, etc.)
            {
                source: '/api/merch/actuator/:path*',
                destination: `${merchUrl}/merch/actuator/:path*`,
            },
            // Fallback for other merch endpoints
            {
                source: '/api/merch/:path*',
                destination: `${merchUrl}/merch/:path*`,
            },
        ];
    },
    
    // Alternative: Add headers for CORS (if not using proxy)
    async headers() {
        return [
            {
                source: '/api/:path*',
                headers: [
                    { key: 'Access-Control-Allow-Credentials', value: 'true' },
                    { key: 'Access-Control-Allow-Origin', value: '*' },
                    { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
                    { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS' },
                ],
            },
        ];
    },
};

export default nextConfig;