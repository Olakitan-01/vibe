const rateLimit = require('express-rate-limit');
const express = require('express');
const app = express();  // Your app setup

// Stricter limiter for auth: 5 requests per minute per IP
const authLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 5,  // Max 5 attempts
  message: { message: 'Too many attempts, please try again in a minute.' },
  standardHeaders: true,  // Return rate limit info in headers
  legacyHeaders: false,
});

module.exports = authLimiter;