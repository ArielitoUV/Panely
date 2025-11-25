// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient({
//   log: ["query", "info", "warn", "error"],
// });

// export default prisma; // ← CAMBIO AQUÍ

// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient({
//   log: ["query", "info", "warn", "error"],
// });

// export { prisma }; // ← CAMBIA A ESTO

// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient({
//   log: ["query", "error", "warn"],
// });

// export { prisma }; // ← CON LLAVES, NO default

// backend/services/auth-service/src/database.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "error", "warn"],
});

export { prisma };