import Link from "next/link";
import { getDashboardData } from "@/server/dashboard";
import { PageHeader, Card, CardHeader, StatTile, Badge, EmptyState } from "@/components/ui";
import { LeadStatusChart } from "@/components/charts/lead-status-chart";
import { OpportunityFunnelChart } from "@/components/charts/opportunity-funnel-chart";
import {
  LEAD_SOURCE_LABELS,
  LEAD_STATUS_COLORS,
  LEAD_STATUS_LABELS,
} from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const totalBySource = data.leadsBySource.reduce((sum, s) => sum + s.count, 0);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Актуальное состояние продаж агентства выставочных стендов"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatTile label="Всего лидов" value={data.totalLeads} />
        <StatTile label="Открытых сделок" value={data.openOpportunities} />
        <StatTile
          label="Сумма открытого пайплайна"
          value={formatCurrency(data.openPipelineValue)}
        />
        <StatTile
          label="Просроченные задачи"
          value={data.overdueTasksCount}
          hint={data.overdueTasksCount > 0 ? "Требуют внимания" : undefined}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader>Воронка сделок по стадиям</CardHeader>
          <div className="p-4 h-72">
            {data.opportunitiesByStage.some((s) => s.count > 0) ? (
              <OpportunityFunnelChart data={data.opportunitiesByStage} />
            ) : (
              <EmptyState title="Нет открытых сделок" />
            )}
          </div>
        </Card>
        <Card>
          <CardHeader>Лиды по статусам</CardHeader>
          <div className="p-4 h-72">
            <LeadStatusChart data={data.leadsByStatus} />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>Источники лидов</CardHeader>
          <ul className="divide-y divide-border">
            {data.leadsBySource.map((s) => (
              <li key={s.source} className="px-4 py-2.5 flex items-center justify-between text-sm">
                <span>{LEAD_SOURCE_LABELS[s.source]}</span>
                <span className="text-muted">
                  {s.count}
                  {totalBySource > 0 && (
                    <span className="ml-1">
                      ({Math.round((s.count / totalBySource) * 100)}%)
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>Последние лиды</CardHeader>
          {data.recentLeads.length === 0 ? (
            <EmptyState title="Пока нет лидов" />
          ) : (
            <ul className="divide-y divide-border">
              {data.recentLeads.map((lead) => (
                <li key={lead.id} className="px-4 py-2.5 flex items-center justify-between gap-3 text-sm">
                  <Link href={`/leads/${lead.id}`} className="hover:underline font-medium truncate">
                    {lead.title}
                  </Link>
                  <span className="flex items-center gap-2 shrink-0">
                    <Badge color="gray">{formatDate(lead.createdAt)}</Badge>
                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-medium"
                      style={{ color: LEAD_STATUS_COLORS[lead.status] }}
                    >
                      ● {LEAD_STATUS_LABELS[lead.status]}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>Просроченные задачи</CardHeader>
          {data.overdueTasks.length === 0 ? (
            <EmptyState title="Просроченных задач нет" description="Отличная работа!" />
          ) : (
            <ul className="divide-y divide-border">
              {data.overdueTasks.map((task) => (
                <li key={task.id} className="px-4 py-2.5 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium truncate">{task.title}</span>
                    <Badge color="red">{formatDate(task.dueDate)}</Badge>
                  </div>
                  <Link
                    href={`/opportunities/${task.opportunityId}`}
                    className="text-muted hover:underline text-xs"
                  >
                    {task.opportunity.name} · {task.opportunity.account.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader>Зависшие сделки (без изменений 14+ дней)</CardHeader>
          {data.stuckDeals.length === 0 ? (
            <EmptyState title="Зависших сделок нет" />
          ) : (
            <ul className="divide-y divide-border">
              {data.stuckDeals.map((deal) => (
                <li key={deal.id} className="px-4 py-2.5 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <Link href={`/opportunities/${deal.id}`} className="font-medium hover:underline truncate">
                      {deal.name}
                    </Link>
                    <Badge color="amber">{deal.stage.name}</Badge>
                  </div>
                  <p className="text-muted text-xs">
                    {deal.account.name} · обновлено {formatDate(deal.updatedAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
