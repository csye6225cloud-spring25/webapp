import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const resetDb = async () => {
  // Wrap all database operations inside a single transaction
  await prisma.$transaction([prisma.healthCheck.deleteMany()]);
};

export const disconnectDb = async () => {
  // Disconnect from Prisma after the tests
  await prisma.$disconnect();
};
