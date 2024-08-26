module.exports = {
  apps: [
    {
      name: 'vite-app',
      script: 'serve',
      args: '-s',
      env: {
        PM2_SERVE_PATH: './dist',
        PM2_SERVE_PORT: 5173,
        PM2_SERVE_SPA: 'true',
        NODE_ENV: 'production',
      },
      cwd: '/home/a2859236246/Repos/start-from-scratch/frontend',
    },
  ],
};

