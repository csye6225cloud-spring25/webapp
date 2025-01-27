import express, { Request, Response } from "express";
import { prismaClient } from "./db";

const app = express();
const port = 3000;

app.use(express.json());

// Health check endpoint
app.get("/healthz", async (req: Request, res: Response): Promise<any> => {
  console.log("Health check endpoint hit");

  // Reject request with payload (400 Bad Request)
  if (Object.keys(req.body).length > 0) {
    return res.status(400).send();
  }

  try {
    // Insert record into the health check table
    await prismaClient.healthCheck.create({
      data: {
        datetime: new Date(),
      },
    });

    // Set required headers
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("X-Content-Type-Options", "nosniff");

    // Return success response
    return res.status(200).send();
  } catch (error) {
    // Set required headers for error response
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("X-Content-Type-Options", "nosniff");

    return res.status(503).send();
  }
});

// Handle unsupported methods
app.use("/healthz", (req: Request, res: Response): any => {
  if (req.method !== "GET") {
    return res.status(405).send();
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
