import Link from "next/link";
import { getOpportunities } from "@/server/opportunities";
import { getStages } from "@/server/stages";
import { PageHeader, Card, EmptyState, LinkButton, Badge } from "@/components/ui";
import { ListFilters } from "@/components/list-filters";
import { OPPORTUNITY_STATUSES, OPPORTUNITY_STATUS_LABELS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/format";
import type { OpportunityStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const STATUS_COLOR = { OPEN: "blue", WON: "green", LOST: "red" } as const;

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; stageId?: string; status?: string }>;
}) {
  const params = await searchParams;
  const [opportunities, stages] = await Promise.all([
    getOpportunities({
      search: params.search,
      stageId: params.stageId,
      status: params.status as OpportunityStatus | undefined,
    }),
    getStages(),
  ]);

  return (
    <div>
      <PageHeader
        title="Opportunities"
        subtitle="Сделки на выставочные стенды, пространства и бренд-зоны"
        actions={<LinkButton href="/opportunities/new">+ Новая сделка</LinkButton>}
      />

      <ListFilters
        searchPlaceholder="Поиск по названию, компании, контакту…"
        filters={[
          {
            name: "stageId",
            label: "Стадия",
            options: stages.map((s) => ({ value: s.id, label: s.name })),
          },
          {
            name: "status",
            label: "Статус",
            options: OPPORTUNITY_STATUSES.map((s) => ({ value: s, label: OPPORTUNITY_STATUS_LABELS[s] })),
          },
        ]}
      />

      <Card>
        {opportunities.length === 0 ? (
          <EmptyState title="Сделки не найдены" description="Измените фильтры или создайте новую сделку." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-muted border-b border-border">
                  <th className="px-4 py-2.5 font-medium">Сделка</th>
                  <th className="px-4 py-2.5 font-medium">Компания</th>
                  <th className="px-4 py-2.5 font-medium">Стадия</th>
                  <th className="px-4 py-2.5 font-medium">Статус</th>
                  <th className="px-4 py-2.5 font-medium">Сумма</th>
                  <th className="px-4 py-2.5 font-medium">Создана</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {opportunities.map((opp) => (
                  <tr key={opp.id} className="hover:bg-background/60">
                    <td className="px-4 py-2.5">
                      <Link href={`/opportunities/${opp.id}`} className="font-medium hover:underline">
                        {opp.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5">
                      <Link href={`/accounts/${opp.account.id}`} className="hover:underline">
                        {opp.account.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-muted">{opp.stage.name}</td>
                    <td className="px-4 py-2.5">
                      <Badge color={STATUS_COLOR[opp.status]}>{OPPORTUNITY_STATUS_LABELS[opp.status]}</Badge>
                    </td>
                    <td className="px-4 py-2.5">{formatCurrency(opp.amount)}</td>
                    <td className="px-4 py-2.5 text-muted">{formatDate(opp.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
