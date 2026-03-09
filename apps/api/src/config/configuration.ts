export default () => ({
  port: parseInt(process.env.PORT, 10) || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  database: {
    url: process.env.DATABASE_URL,
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD,
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'change_me_in_production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'change_refresh_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET,
    mode: process.env.PAYPAL_MODE || 'sandbox',
  },

  puppeteer: {
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '',
    headless: process.env.PUPPETEER_HEADLESS !== 'false',
  },

  storage: {
    reportsDir: process.env.REPORTS_DIR || './reports',
    uploadsDir: process.env.UPLOADS_DIR || './uploads',
  },

  mail: {
    host:   process.env.MAIL_HOST   || 'smtp.gmail.com',
    port:   parseInt(process.env.MAIL_PORT, 10) || 587,
    secure: process.env.MAIL_SECURE === 'true',
    user:   process.env.MAIL_USER   || '',
    pass:   process.env.MAIL_PASS   || '',
    from:   process.env.MAIL_FROM   || 'noreply@dlmetrix.com',
  },
});
