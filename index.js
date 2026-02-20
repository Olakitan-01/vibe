require ('dotenv').config()
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger.config');
const express = require('express')
const prisma = require('./config/prisma.config')
const authRoutes = require('./routes/auth.route')
const profileRoutes = require('./routes/profile.route')


const app = express()

app.use(express.json())
// Documentation Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

//path to access all authentications
app.use('/auth', authRoutes);


// path to access full profiles
app.use('/api/profile', profileRoutes);


app.get('/', (req, res) => {
  res.send('Hello ladies and Gentlemen of the vibes club!!!!')
})


app.listen(3000, async() => {
  console.log('Server is running on http://localhost:3000')
 try {
    await prisma.$connect();
    console.log('Database is connected (Prisma).');
  } catch (err) {
    console.error('Database connection error:', err.message);
    process.exit(1); // Stop the app if the database isn't working
  }
});


// Add this at the bottom of index.js
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ status: "fail", message: "Invalid JSON format" });
  }
  next();
});