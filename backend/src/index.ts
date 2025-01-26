import express, { Request, Response } from "express";
import { prismaClient } from "./db";

const app = express();
const port = 3000;

app.use(express.json());

// Health check endpoint
app.get("/healthz", async (req: Request, res: Response): Promise<any> => {
  console.log("Health check endpoint hit");

  // Reject request with payload
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

    // Set cache-control header
    res.setHeader("Cache-Control", "no-cache");

    // Return success response
    return res.status(200).send();
  } catch (error) {
    // Set cache-control header in case of error
    res.setHeader("Cache-Control", "no-cache");

    return res.status(503).send();
  }
});

// Handle unsupported methods
app.all("/healthz", (req: Request, res: Response) => {
  res.status(405).send();
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
