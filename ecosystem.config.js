module.exports = {
  apps: [
    {
      name: 'cirsqu-app-dev',
      script: 'npm run build && npm run start',
      watch: ['src', 'public'],
      ignore_watch: ['node_modules', 'logs', '.git'],
      exec_mode: 'fork',
      instances: 1,
    },
  ],
};
