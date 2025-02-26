import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { app } from "../index";
import { resetDb, disconnectDb } from "./helpers/reset-db";
import request from "supertest";
import { prismaClient } from "../../src/db";

beforeAll(async () => {
  await resetDb(); // Clean the database before the tests
});

afterAll(async () => {
  await disconnectDb(); // Disconnect the database after tests
});

describe("Health Check Endpoint", () => {
  it("should return 200 on GET /healthz with no payload", async () => {
    const response = await request(app).get("/healthz");
    expect(response.status).toBe(200);
    expect(response.headers["cache-control"]).toBe(
      "no-cache, no-store, must-revalidate"
    );
    expect(response.headers["pragma"]).toBe("no-cache");
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
  });

  it("should return 400 on GET /healthz with a payload", async () => {
    const response = await request(app).get("/healthz").send({ key: "value" });
    expect(response.status).toBe(400);
  });

  it("should return 405 for non-GET methods on /healthz", async () => {
    const postResponse = await request(app).post("/healthz");
    expect(postResponse.status).toBe(405);

    const putResponse = await request(app).put("/healthz");
    expect(putResponse.status).toBe(405);
  });

  it("should return 503 if Prisma database operation fails", async () => {
    // Save the original method to restore after the test
    const originalCreate = prismaClient.healthCheck.create;

    // Mock the method with vi.fn()
    prismaClient.healthCheck.create = vi
      .fn()
      .mockRejectedValue(new Error("DB Error"));

    const response = await request(app).get("/healthz");

    expect(response.status).toBe(503);

    // Restore the original method after the test so that it does not interfere with the other mocks
    prismaClient.healthCheck.create = originalCreate;
  });
});
