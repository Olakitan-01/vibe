const prisma = require('../utils/prisma.util')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const register = async (req, res) => {
  const { full_name, phone, email, password, date_of_birth, gender, bio, address, profile_pic} = req.body
    try {
        const existingUser = await prisma.user.findUnique({ where: { OR: [{ email: email }, { phone: phone }] } })
        if (existingUser) {
          return res.status(400).json({ message: 'User with this email or phone already exists' })
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = await prisma.user.create({
          data: {
            full_name: full_name,
            phone: phone,
            email: email,
            password: hashedPassword,
            date_of_birth: new Date(date_of_birth),
            gender: gender,
            bio: bio,
            address: address,
            profile_pic: profile_pic
          }
        });

        const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ message: 'User registered successfully', token, user: {id: newUser.id , email: newUser.email} })

    }catch (error) {
      res.status(500).json({ message: 'Registeration fialed ' });
    }
};

module.exports = {register};