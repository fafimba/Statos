/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    }
    return config
  },
  // Configuración optimizada para Hot Reloading
  webpackDevMiddleware: config => {
    config.watchOptions = {
      poll: 300, // Reducir el tiempo de polling
      aggregateTimeout: 200, // Reducir el tiempo de agregación
      ignored: ['**/node_modules', '**/.git'], // Ignorar directorios innecesarios
    }
    return config
  },
  // Habilitar Fast Refresh explícitamente
  experimental: {
    fastRefresh: true
  }
}

module.exports = nextConfig 