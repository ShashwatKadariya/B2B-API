import { PrismaClient } from "@prisma/client";
import { config } from "./config";

// global variable prisma, you can user prisma anywhere in the code
// but keeping it global in production is a bad habit
declare global {
  var prisma: PrismaClient | undefined;
}

const prismaClient: PrismaClient = new PrismaClient();

// while not in production access prisma client globally for easy access
if (config.NODE_ENV !== "production") globalThis.prisma = prismaClient;

export default prismaClient;
