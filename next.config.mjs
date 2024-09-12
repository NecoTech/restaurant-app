/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'picsum.photos',
                port: '',
                pathname: '/200/**',
            },
        ],
    }, reactStrictMode: true,
    images: {
        domains: ['picsum.photos'], // Add the domain of your image URLs
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:5000/api/:path*', // Proxy API requests to your local server
            },
        ]
    },
};

export default nextConfig;


