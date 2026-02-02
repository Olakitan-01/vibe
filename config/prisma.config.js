const { PrismaClient } = require('@prisma/client');

// This starts the connection to your Vibe database
const prisma = new PrismaClient();

module.exports = prisma;



// import "dotenv/config";
// import { defineConfig, env } from "prisma/config";

// export default defineConfig({
//   schema: "prisma/schema.prisma",
//   migrations: {
//     path: "prisma/migrations",
//   },
//   engine: "classic",
//   datasource: {
//     url: env("DATABASE_URL"),
//   },
// });
