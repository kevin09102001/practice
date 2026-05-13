import type { NextConfig } from "next";

const securityHeaders = [
  // Forzar HTTPS en producción (Vercel auto-añade en *.vercel.app pero por las dudas)
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Evitar que el sitio se cargue dentro de un iframe ajeno (clickjacking)
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // Evitar MIME-sniffing
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // Solo mandar referrer al mismo origen
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // Solo permitir mic (Vapi lo necesita), bloquear camera, geo, etc
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(self), geolocation=(), interest-cohort=()",
  },
  // Bloquear que esto se embeba en otros sitios
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Aplicar a todas las rutas
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  // Esconder el header X-Powered-By: Next.js (mínimo de info para atacantes)
  poweredByHeader: false,
  // React strict mode (cacha bugs en desarrollo)
  reactStrictMode: true,
};

export default nextConfig;
