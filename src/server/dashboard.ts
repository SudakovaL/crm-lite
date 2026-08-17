import { prisma } from "@/lib/prisma";
import { LEAD_SOURCES, LEAD_STATUSES } from "@/lib/constants";

const STUCK_DEAL_DAYS = 14;

export async function getDashboardData() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const stuckDealCutoff = new Date(Date.now() - STUCK_DEAL_DAYS * 24 * 60 * 60 * 1000);

  const [
    totalLeads,
    openOpportunities,
    openPipelineAgg,
    overdueTasksCount,
    leadsByStatusRaw,
    leadsBySourceRaw,
    opportunitiesByStageRaw,
    recentLeads,
    overdueTasks,
    stuckDeals,
    stages,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.opportunity.count({ where: { status: "OPEN" } }),
    prisma.opportunity.aggregate({ where: { status: "OPEN" }, _sum: { amount: true } }),
    prisma.activity.count({
      where: { type: "TASK", done: false, dueDate: { lt: startOfToday } },
    }),
    prisma.lead.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.lead.groupBy({ by: ["source"], _count: { _all: true } }),
    prisma.opportunity.groupBy({
      by: ["stageId"],
      where: { status: "OPEN" },
      _count: { _all: true },
    }),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.activity.findMany({
      where: { type: "TASK", done: false, dueDate: { lt: startOfToday } },
      orderBy: { dueDate: "asc" },
      include: { opportunity: { include: { account: true } } },
      take: 10,
    }),
    prisma.opportunity.findMany({
      where: { status: "OPEN", updatedAt: { lt: stuckDealCutoff } },
      orderBy: { updatedAt: "asc" },
      include: { account: true, stage: true },
      take: 10,
    }),
    prisma.stage.findMany({ orderBy: { order: "asc" } }),
  ]);

  const leadsByStatus = LEAD_STATUSES.map((status) => ({
    status,
    count: leadsByStatusRaw.find((r) => r.status === status)?._count._all ?? 0,
  }));

  const leadsBySource = LEAD_SOURCES.map((source) => ({
    source,
    count: leadsBySourceRaw.find((r) => r.source === source)?._count._all ?? 0,
  }));

  const opportunitiesByStage = stages.map((stage) => ({
    stageId: stage.id,
    stageName: stage.name,
    order: stage.order,
    count: opportunitiesByStageRaw.find((r) => r.stageId === stage.id)?._count._all ?? 0,
  }));

  return {
    totalLeads,
    openOpportunities,
    openPipelineValue: openPipelineAgg._sum.amount ?? 0,
    overdueTasksCount,
    leadsByStatus,
    leadsBySource,
    opportunitiesByStage,
    recentLeads,
    overdueTasks,
    stuckDeals,
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;
