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
        domains: ['picsum.photos', 'media1.tenor.com'], // Add the domain of your image URLs
    }
};

export default nextConfig;

