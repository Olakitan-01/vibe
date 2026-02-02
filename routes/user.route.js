const {check, validationResult} = require('express-validator');
const express = require('express');
const {register} = require('../controllers/auth.controller');


const router = express.Router();
router.post('/register', [
  check('phone', 'Phone number is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
], (req, res, next) => {
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
    }, register
);


module.exports = router;