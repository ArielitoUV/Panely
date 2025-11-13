import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

export default prisma; // ← CAMBIO AQUÍ

// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient({
//   log: ["query", "info", "warn", "error"],
// });

// export { prisma }; // ← CAMBIA A ESTO