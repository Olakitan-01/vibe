require ('dotenv').config()
const express = require('express')
const prisma = require('./config/prisma.config')


const app = express()

app.use(express.json())

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
