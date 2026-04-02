const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const validateEnv = () => {
  const required = ['MONGO_URI', 'JWT_SECRET'];
  const missing = required.filter((key) => !process.env[key]?.trim());

  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (process.env.JWT_SECRET.trim().length < 16) {
    throw new Error('JWT_SECRET must be at least 16 characters long.');
  }

  const rateLimitMax = parsePositiveInt(process.env.RATE_LIMIT_MAX, 250);
  const authRateLimitMax = parsePositiveInt(process.env.AUTH_RATE_LIMIT_MAX, 20);

  return {
    port: parsePositiveInt(process.env.PORT, 5000),
    clientUrl: process.env.CLIENT_URL || 'http://localhost:4200',
    rateLimitMax,
    authRateLimitMax
  };
};

module.exports = {
  validateEnv
};
