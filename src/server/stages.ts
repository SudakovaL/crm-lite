import { prisma } from "@/lib/prisma";

export function getStages() {
  return prisma.stage.findMany({ orderBy: { order: "asc" } });
}
