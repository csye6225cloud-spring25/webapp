import { PrismaClient } from "@prisma/client";
import { statsd } from "./metrics"; // Import StatsD from a separate file

const prisma = new PrismaClient();

const extendedPrismaClient = prisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ args, query }) {
        const start = Date.now();
        const result = await query(args); // Correct function usage
        const duration = Date.now() - start;
        statsd.timing("db.query.duration", duration); // Send metric to CloudWatch
        return result;
      },
    },
  },
});

export const prismaClient = extendedPrismaClient;
