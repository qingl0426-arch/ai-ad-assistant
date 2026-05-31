// ============================================================
// AI Ad Assistant — PM2 生产环境配置
// 使用：pm2 start scripts/ecosystem.config.js
// ============================================================

module.exports = {
  apps: [
    {
      name: "ai-ad-assistant",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "/opt/ai-ad-assistant",
      instances: 2,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
      max_memory_restart: "1G",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "/var/log/ai-ad-assistant/error.log",
      out_file: "/var/log/ai-ad-assistant/out.log",
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 4000,
      watch: false,
      kill_timeout: 5000,
      listen_timeout: 30000,
      shutdown_with_message: true,
    },
  ],
};
