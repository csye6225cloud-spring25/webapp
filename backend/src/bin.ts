import { app } from "./index.js";
import { prismaClient } from "./db"; // Import Prisma client

const port = process.env.PORT || 3000;

async function startServer() {
  try {
    await prismaClient.$connect(); // Ensure Prisma is connected before starting the server
    console.log("Connected to the database successfully");

    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1); // Exit if the database connection fails
  }
}

startServer();
