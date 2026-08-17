import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type ContactListFilters = {
  search?: string;
};

export function getContacts(filters: ContactListFilters = {}) {
  const where: Prisma.ContactWhereInput = {};

  if (filters.search) {
    const q = filters.search.trim();
    if (q) {
      where.OR = [
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
        { account: { name: { contains: q, mode: "insensitive" } } },
      ];
    }
  }

  return prisma.contact.findMany({
    where,
    orderBy: { lastName: "asc" },
    include: { account: true, _count: { select: { opportunities: true } } },
  });
}

export function getAllContactsForSelect(accountId?: string) {
  return prisma.contact.findMany({
    where: accountId ? { accountId } : undefined,
    orderBy: { lastName: "asc" },
    select: { id: true, firstName: true, lastName: true, accountId: true },
  });
}

export function getContactById(id: string) {
  return prisma.contact.findUnique({
    where: { id },
    include: {
      account: true,
      opportunities: { orderBy: { createdAt: "desc" }, include: { stage: true } },
    },
  });
}
