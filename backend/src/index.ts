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

dotenv.config();

export const app = express();

if (!process.env.AWS_REGION || !process.env.AWS_S3_BUCKET) {
  throw new Error("Missing AWS environment variables");
}

// AWS S3 Configuration
const s3 = new S3Client({ region: process.env.AWS_REGION });

// Multer Setup for File Uploads
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());

// ---------------- HEALTH CHECK ENDPOINT ----------------
app.get("/healthz", async (req: Request, res: Response): Promise<any> => {
  console.log("Health check endpoint hit");

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
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("X-Content-Type-Options", "nosniff");

    return res.status(503).end();
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

      // Upload file to S3
      await s3.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: fileKey,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        })
      );

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

      return res.status(201).json(fileRecord);
    } catch (error) {
      console.error("File upload failed:", error);
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
    console.error("Error retrieving file:", error);
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

      // Delete file from S3
      await s3.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: fileKey,
        })
      );

      // Delete metadata from the database
      await prismaClient.file.delete({ where: { id: fileId } });

      return res.status(204).end();
    } catch (error) {
      console.error("File deletion failed:", error);
      return res.status(500).json({ error: "File deletion failed" });
    }
  }
);

// ---------------- HANDLE UNSUPPORTED METHODS ----------------
app.all("/v1/file", (req: Request, res: Response): any => {
  if (!["POST", "GET", "DELETE"].includes(req.method)) {
    return res.status(405).end();
  }
});
