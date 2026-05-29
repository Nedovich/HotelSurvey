import { PrismaClient } from "@/generated/prisma";

declare global {
  var __hotelsurveyPrisma__: PrismaClient | undefined;
}

export const prisma =
  globalThis.__hotelsurveyPrisma__ ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__hotelsurveyPrisma__ = prisma;
}
