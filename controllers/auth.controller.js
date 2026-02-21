const prisma = require('../config/prisma.config');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const phoneUtil = require('libphonenumber-js');  // For phone handling
const crypto = require('crypto')
const sendEmail = require('../utils/email.utils')

const register = async (req, res) => {
  const { firstName, lastName, username, gender, email, phone, password } = req.body;
  try {
    // Phone validation and normalization
    let normalizedPhone;
    try {
      const parsedPhone = phoneUtil.parsePhoneNumber(phone);  // Input can be '+234...' or '0993...' (assumes default country if needed; add req.body.country for global)
      if (!parsedPhone.isValid()) {
        return res.status(400).json({ message: 'Invalid phone number' });
      }
      normalizedPhone = parsedPhone.format('E.164');  // Standard international format
    } catch (err) {
      return res.status(400).json({ message: 'Phone number parsing failed' });
    }

    // Check existing user (with normalized phone and username)
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone: normalizedPhone }, { username }] },
    });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email, phone, or username already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        username,
        gender,
        email,
        phone: normalizedPhone,  // Store normalized for consistency
        password: hashedPassword,
      },
    });

    try {
      await sendEmail({
        to: newUser.email,
        subject: 'Welcome to Vibe! 🚀',
        message: `Hi ${newUser.username},\n\nWelcome to Vibe! We're excited to have you on board. Start exploring and find your vibe!\n\nBest,\nThe Vibe Team`,
      });
    } catch (mailErr) {
      console.error("Welcome email failed to send:", mailErr);
    }

    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ message: 'User registered successfully', token, user: { id: newUser.id, email: newUser.email } });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await prisma.user.findUnique({ where: { email: email } })
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ message: 'Login successful', token, user: {id: user.id , email: user.email} })
  }catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

const requestPasswordReset = async (req, res) => {
  const {email} = req.body
  try {
    const user = await prisma.user.findUnique({ where: { email: email } })
    if (!user) {
      return res.status(400).json({ message: 'User with this email does not exist' })
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

    await prisma.user.update({
      where: { email: email },
      data: {
        passwordResetToken: hashedOTP,
        resetTokenExpiry: new Date(Date.now() + 10 * 60 * 1000) // 10 min from now
      }
    });

    try{
      await sendEmail({
        to: email,
        subject: 'Vibe app Password Reset OTP',
        message: `Your password reset OTP is ${otp}. It will expire in 10 minutes.`
      });
      res.status(200).json({ message: 'Password reset token sent to email' })
    }catch(mailerror){
      return res.status(500).json({ message: 'Failed to send email. Pls try again later' });
    }
  }catch (error) {
    res.status(500).json({ message: 'Password reset request failed', error: error.message });
  }
}


const resetPassword = async (req, res) => {
  const {email, otp, newPassword} = req.body
  try {
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

    const user = await prisma.user.findUnique({
      where: {
        email: email,
        passwordResetToken: hashedOTP,
        resetTokenExpiry: { gt: new Date() }
      }
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    await prisma.user.update({
      where: { email: email },
      data: { password: hashedPassword, passwordResetToken: null, resetTokenExpiry: null }
    });
    res.status(200).json({ status: 'success', message: 'Password has been reset successfully' })

  }catch (error) {
    res.status(500).json({ message: 'Password reset failed', error: error.message });
  }
};

module.exports = {register, login, requestPasswordReset, resetPassword};