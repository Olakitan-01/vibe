const {check, validationResult} = require('express-validator');
const express = require('express');
const {register, login, requestPasswordReset, resetPassword} = require('../controllers/auth.controller');
const authLimiter = require('../middleware/rateLimiter.middleware')

const router = express.Router();

// register router
router.post('/register', authLimiter, [
  check('phone', 'Phone number is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}, register);

// login route
router.post('/login', authLimiter, [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').not().isEmpty()
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}, login);

// request for password rest router
router.post('/request-reset', requestPasswordReset);

// reset password router
router.post('/reset-password', resetPassword);

module.exports = router;