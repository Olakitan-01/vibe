const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Vibe Dating API',
      version: '1.0.0',
      description: 'Backend API for the Vibe Dating App. Built with Express and Prisma.',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development Server',
      },
    ],
  },
  // This tells swagger to look into your routes folder for documentation comments
  apis: [path.join(__dirname, '../routes/*.js')], 
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;