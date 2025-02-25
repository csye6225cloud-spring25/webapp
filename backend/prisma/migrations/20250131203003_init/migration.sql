-- CreateTable
CREATE TABLE "HealthCheck" (
    "checkId" SERIAL NOT NULL,
    "datetime" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HealthCheck_pkey" PRIMARY KEY ("checkId")
);
