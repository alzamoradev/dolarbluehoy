/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Redirecciones 301 permanentes para canonicalización
  async redirects() {
    return [
      // Redirigir www a non-www (todas las rutas)
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.valordolarblue.ar',
          },
        ],
        destination: 'https://valordolarblue.ar/:path*',
        permanent: true, // 301
      },
    ];
  },

  // Headers de seguridad y SEO
  async headers() {
    return [
      {
        // Aplicar a todas las rutas
        source: '/:path*',
        headers: [
          // HSTS - Forzar HTTPS (incluye subdominios)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // Prevenir MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Protección contra clickjacking
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          // Política de referrer para SEO
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Content Security Policy básica
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Permitir indexación explícitamente
          {
            key: 'X-Robots-Tag',
            value: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

