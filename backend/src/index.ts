import express, { Request, Response } from "express";
import multer from "multer";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { prismaClient } from "./db";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import winston from "winston";
import StatsD from "node-statsd";

dotenv.config();

export const app = express();

// Initialize logger with Winston
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "/var/log/webapp.log" }),
  ],
});

// Initialize StatsD client for CloudWatch metrics
export const statsd = new (StatsD as any)({ host: "localhost", port: 8125 });

if (!process.env.AWS_REGION || !process.env.AWS_S3_BUCKET) {
  throw new Error("Missing AWS environment variables");
}

// AWS S3 Configuration
const s3 = new S3Client({ region: process.env.AWS_REGION });

// Multer Setup for File Uploads
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());

// Middleware to log requests and measure API metrics
app.use((req: Request, res: Response, next: Function) => {
  const start = Date.now();
  logger.info(`Received ${req.method} request to ${req.path}`, {
    method: req.method,
    path: req.path,
  });
  res.on("finish", () => {
    const duration = Date.now() - start;
    const routeName = `${req.method}_${req.path.replace(/\//g, "_")}`;
    statsd.increment(`api.${routeName}.count`); // Count API calls
    statsd.timing(`api.${routeName}.duration`, duration); // Time API calls
  });
  next();
});

// ---------------- S3 WRAPPER FUNCTION ----------------
// Wrapper function to measure S3 call duration
async function timedS3Call(operation: any, params: any) {
  const start = Date.now();
  const result = await s3.send(new operation(params));
  const duration = Date.now() - start;
  statsd.timing("s3.call.duration", duration); // Time S3 calls
  return result;
}

// ---------------- HEALTH CHECK ENDPOINT ----------------
app.get("/healthz", async (req: Request, res: Response): Promise<any> => {
  logger.info("Health check endpoint hit");

  if (Object.keys(req.query).length > 0 || Object.keys(req.body).length > 0) {
    return res.status(400).end();
  }

  try {
    await prismaClient.healthCheck.create({ data: { datetime: new Date() } });

    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("X-Content-Type-Options", "nosniff");

    return res.status(200).end();
  } catch (error) {
    // Type guard for error
    if (error instanceof Error) {
      logger.error("File upload failed", { error: error.stack });
    } else {
      logger.error("File upload failed", { error: String(error) });
    }
    return res.status(500).json({ error: "File upload failed" });
  }
});
app.use("/healthz", (req: Request, res: Response): any => {
  if (req.method !== "GET") {
    return res.status(405).end();
  }
});

// ---------------- FILE UPLOAD ENDPOINT ----------------
app.post(
  "/v1/file",
  upload.single("file"),
  async (req: Request, res: Response): Promise<any> => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file provided" });
      }

      const fileId = uuidv4();
      const fileName = req.file.originalname;
      const bucketName = process.env.AWS_S3_BUCKET!;
      const fileKey = `uploads/${fileId}-${fileName}`;

      // Upload file to S3 with timing
      await timedS3Call(PutObjectCommand, {
        Bucket: bucketName,
        Key: fileKey,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      });

      // Store metadata in the database
      const fileRecord = await prismaClient.file.create({
        data: {
          id: fileId,
          file_name: fileName,
          url: `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`,
          upload_date: new Date(),
          user_id: "some-user-id", // Replace with actual user logic if needed
        },
      });
      logger.info("File uploaded successfully", { fileId });
      return res.status(201).json(fileRecord);
    } catch (error) {
      // Type guard for error
      if (error instanceof Error) {
        logger.error("File upload failed", { error: error.stack });
      } else {
        logger.error("File upload failed", { error: String(error) });
      }
      return res.status(500).json({ error: "File upload failed" });
    }
  }
);

// ---------------- GET FILE METADATA ENDPOINT ----------------

app.get("/v1/file", async (req: Request, res: Response): Promise<any> => {
  const id = req.query.id as string;

  if (!id) {
    return res.status(400).json({ error: "File ID is required" });
  }

  try {
    const file = await prismaClient.file.findUnique({
      where: { id },
    });

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    return res.status(200).json(file); // Returning the entire file object
  } catch (error) {
    // Type guard for error
    if (error instanceof Error) {
      logger.error("Error retrieving file", { error: error.stack });
    } else {
      logger.error("Error retrieving file", { error: String(error) });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------- DELETE FILE ENDPOINT ----------------
app.delete(
  "/v1/file/:id",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const fileId = req.params.id;

      // Check if file exists in the database
      const file = await prismaClient.file.findUnique({
        where: { id: fileId },
      });
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }

      const bucketName = process.env.AWS_S3_BUCKET!;
      const fileKey = file.url.split(
        `${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/`
      )[1];

      // Delete file from S3 with timing
      await timedS3Call(DeleteObjectCommand, {
        Bucket: bucketName,
        Key: fileKey,
      });

      // Delete metadata from the database
      await prismaClient.file.delete({ where: { id: fileId } });

      logger.info("File deleted successfully", { fileId });
      return res.status(204).end();
    } catch (error) {
      // Type guard for error
      if (error instanceof Error) {
        logger.error("File deletion failed", { error: error.stack });
      } else {
        logger.error("File deletion failed", { error: String(error) });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);
// ---------------- HANDLE UNSUPPORTED METHODS ----------------
app.all("/v1/file", (req: Request, res: Response): any => {
  if (!["POST", "GET", "DELETE"].includes(req.method)) {
    return res.status(405).end();
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: Function) => {
  logger.error("Application error", { error: err.stack });
  res.status(500).send("Something broke!");
});
