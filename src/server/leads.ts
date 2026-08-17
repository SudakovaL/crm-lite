import { prisma } from "@/lib/prisma";
import type { LeadSource, LeadStatus, Prisma } from "@prisma/client";

export type LeadListFilters = {
  search?: string;
  source?: LeadSource;
  status?: LeadStatus;
};

export function getLeads(filters: LeadListFilters = {}) {
  const where: Prisma.LeadWhereInput = {};

  if (filters.source) where.source = filters.source;
  if (filters.status) where.status = filters.status;

  if (filters.search) {
    const q = filters.search.trim();
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { name: { contains: q, mode: "insensitive" } },
        { company: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
      ];
    }
  }

  return prisma.lead.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

export function getLeadById(id: string) {
  return prisma.lead.findUnique({
    where: { id },
    include: {
      convertedAccount: true,
      convertedContact: { include: { account: true } },
      convertedOpportunity: { include: { stage: true } },
    },
  });
}
