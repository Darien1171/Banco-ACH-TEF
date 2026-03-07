import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Evita que Vercel/webpack intente bundlear paquetes pesados con
  // módulos nativos. Se cargan como require() nativo en el servidor.
  serverExternalPackages: ['twilio', 'resend'],
}

export default nextConfig
