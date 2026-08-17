import Link from "next/link";
import { getLeads } from "@/server/leads";
import { PageHeader, Card, EmptyState, LinkButton } from "@/components/ui";
import { ListFilters } from "@/components/list-filters";
import {
  LEAD_SOURCES,
  LEAD_SOURCE_LABELS,
  LEAD_STATUSES,
  LEAD_STATUS_COLORS,
  LEAD_STATUS_LABELS,
} from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { LeadSource, LeadStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; source?: string; status?: string }>;
}) {
  const params = await searchParams;
  const leads = await getLeads({
    search: params.search,
    source: params.source as LeadSource | undefined,
    status: params.status as LeadStatus | undefined,
  });

  return (
    <div>
      <PageHeader
        title="Leads"
        subtitle="Входящие обращения по выставочным стендам и бренд-зонам"
        actions={<LinkButton href="/leads/new">+ Новый лид</LinkButton>}
      />

      <ListFilters
        searchPlaceholder="Поиск по теме, имени, компании, email…"
        filters={[
          {
            name: "source",
            label: "Источник",
            options: LEAD_SOURCES.map((s) => ({ value: s, label: LEAD_SOURCE_LABELS[s] })),
          },
          {
            name: "status",
            label: "Статус",
            options: LEAD_STATUSES.map((s) => ({ value: s, label: LEAD_STATUS_LABELS[s] })),
          },
        ]}
      />

      <Card>
        {leads.length === 0 ? (
          <EmptyState
            title="Лиды не найдены"
            description="Измените фильтры или создайте новый лид."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-muted border-b border-border">
                  <th className="px-4 py-2.5 font-medium">Тема</th>
                  <th className="px-4 py-2.5 font-medium">Контакт</th>
                  <th className="px-4 py-2.5 font-medium">Источник</th>
                  <th className="px-4 py-2.5 font-medium">Статус</th>
                  <th className="px-4 py-2.5 font-medium">Создан</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-background/60">
                    <td className="px-4 py-2.5">
                      <Link href={`/leads/${lead.id}`} className="font-medium hover:underline">
                        {lead.title}
                      </Link>
                      {lead.company && <p className="text-xs text-muted">{lead.company}</p>}
                    </td>
                    <td className="px-4 py-2.5">
                      <p>{lead.name}</p>
                      <p className="text-xs text-muted">{lead.email || lead.phone || "—"}</p>
                    </td>
                    <td className="px-4 py-2.5">{LEAD_SOURCE_LABELS[lead.source]}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-medium"
                        style={{ color: LEAD_STATUS_COLORS[lead.status] }}
                      >
                        ● {LEAD_STATUS_LABELS[lead.status]}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-muted">{formatDate(lead.createdAt)}</td>
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
