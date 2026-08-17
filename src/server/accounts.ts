import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type AccountListFilters = {
  search?: string;
};

export function getAccounts(filters: AccountListFilters = {}) {
  const where: Prisma.AccountWhereInput = {};

  if (filters.search) {
    const q = filters.search.trim();
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { website: { contains: q, mode: "insensitive" } },
      ];
    }
  }

  return prisma.account.findMany({
    where,
    orderBy: { name: "asc" },
    include: {
      _count: { select: { contacts: true, opportunities: true } },
    },
  });
}

export function getAllAccountsForSelect() {
  return prisma.account.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
}

export function getAccountById(id: string) {
  return prisma.account.findUnique({
    where: { id },
    include: {
      contacts: { orderBy: { lastName: "asc" } },
      opportunities: {
        orderBy: { createdAt: "desc" },
        include: { stage: true, contact: true },
      },
    },
  });
}
