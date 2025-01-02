/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production';
const repoName = 'ocpn-visualizer';

const nextConfig = {
    output: 'export',
    basePath: isProd ? `/${repoName}` : '',
    assetPrefix: isProd ? `/${repoName}/` : '',
    trailingSlash: true,
};

export default nextConfig;