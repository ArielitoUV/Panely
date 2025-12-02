import { PrismaClient } from '@prisma/client';

// Usamos export const para obligar a usar { prisma } en los imports
export const prisma = new PrismaClient();