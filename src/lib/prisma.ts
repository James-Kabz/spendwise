import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const prismaBase = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
});
const prisma = prismaBase.$extends(withAccelerate());

export { prismaBase };
export default prisma;
