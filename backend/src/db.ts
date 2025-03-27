import { PrismaClient } from "@prisma/client";
import { statsd } from "./index"; // Import statsd from a separate config file
// Extend the Prisma client with query timing

const extendedPrismaClient = new PrismaClient().$extends({
  query: {
    // Apply to all models and all operations
    $allModels: {
      async $allOperations({ args, query }) {
        const start = Date.now();
        const result = await query(args); // Use query instead of next
        const duration = Date.now() - start;
        statsd.timing("db.query.duration", duration); // Send timing metric
        return result;
      },
    },
  },
});

// Export the extended client
export const prismaClient = extendedPrismaClient;
