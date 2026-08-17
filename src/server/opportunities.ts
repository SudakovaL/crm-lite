import { prisma } from "@/lib/prisma";
import type { OpportunityStatus, Prisma } from "@prisma/client";

export type OpportunityListFilters = {
  search?: string;
  stageId?: string;
  status?: OpportunityStatus;
};

export function getOpportunities(filters: OpportunityListFilters = {}) {
  const where: Prisma.OpportunityWhereInput = {};

  if (filters.stageId) where.stageId = filters.stageId;
  if (filters.status) where.status = filters.status;

  if (filters.search) {
    const q = filters.search.trim();
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { account: { name: { contains: q, mode: "insensitive" } } },
        { contact: { firstName: { contains: q, mode: "insensitive" } } },
        { contact: { lastName: { contains: q, mode: "insensitive" } } },
      ];
    }
  }

  return prisma.opportunity.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { stage: true, account: true, contact: true },
  });
}

export function getOpportunityById(id: string) {
  return prisma.opportunity.findUnique({
    where: { id },
    include: {
      stage: true,
      account: true,
      contact: true,
      convertedFromLead: true,
      activities: { orderBy: { createdAt: "desc" } },
    },
  });
}
