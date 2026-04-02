const express = require('express');
const path = require('path');
const crypto = require('crypto');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const packageInfo = require('./package.json');

const authRoutes = require('./routes/authRoutes');
const recipeRoutes = require('./routes/recipeRoutes');

const createApp = (runtimeConfig = {}) => {
  const app = express();
  const isProduction = process.env.NODE_ENV === 'production';
  const startedAt = new Date().toISOString();
  const allowedOrigins = (runtimeConfig.clientUrl || 'http://localhost:4200')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const generalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: runtimeConfig.rateLimitMax || 250,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests. Please try again in a few minutes.' }
  });
  const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: runtimeConfig.authRateLimitMax || 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many authentication attempts. Please try again later.' }
  });

  if (isProduction) {
    app.set('trust proxy', 1);
  }

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }
    })
  );
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        return callback(new Error(`Origin ${origin} is not allowed by CORS.`));
      },
      credentials: true
    })
  );
  app.use((req, res, next) => {
    req.requestId = crypto.randomUUID();
    res.setHeader('X-Request-Id', req.requestId);
    next();
  });
  app.use(generalRateLimiter);
  app.use('/api/auth', authRateLimiter);
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  if (!isProduction) {
    app.use(morgan('dev'));
  }
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  app.get('/api/health', (_req, res) => {
    const dbStateMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    res.json({
      message: 'RecipeHub API is running.',
      database: dbStateMap[mongoose.connection.readyState] || 'unknown',
      version: packageInfo.version,
      uptimeSeconds: Math.round(process.uptime()),
      startedAt
    });
  });

  app.get('/api/ready', (_req, res) => {
    const isReady = mongoose.connection.readyState === 1;

    res.status(isReady ? 200 : 503).json({
      ready: isReady,
      database: isReady ? 'connected' : 'not-ready',
      version: packageInfo.version
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/recipes', recipeRoutes);

  app.use((err, _req, res, _next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      message: err.message || 'Server error.',
      requestId: _req.requestId
    });
  });

  return app;
};

module.exports = createApp;
