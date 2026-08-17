import Link from "next/link";
import { notFound } from "next/navigation";
import { getLeadById } from "@/server/leads";
import { getStages } from "@/server/stages";
import { Card, CardHeader, PageHeader, Badge, LinkButton } from "@/components/ui";
import { DeleteButton } from "@/components/delete-button";
import { ConvertLeadForm } from "@/components/convert-lead-form";
import { deleteLeadAction, convertLeadAction } from "@/actions/leads";
import {
  LEAD_SOURCE_LABELS,
  LEAD_STATUS_COLORS,
  LEAD_STATUS_LABELS,
} from "@/lib/constants";
import { formatCurrency, formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = await getLeadById(id);
  if (!lead) notFound();

  const isConverted = lead.status === "CONVERTED";
  const stages = isConverted ? [] : await getStages();

  return (
    <div>
      <PageHeader
        title={lead.title}
        subtitle={
          <span
            className="inline-flex items-center gap-1.5 font-medium"
            style={{ color: LEAD_STATUS_COLORS[lead.status] }}
          >
            ● {LEAD_STATUS_LABELS[lead.status]}
          </span>
        }
        actions={
          <>
            <LinkButton href={`/leads/${lead.id}/edit`} variant="secondary">
              Редактировать
            </LinkButton>
            <DeleteButton
              action={deleteLeadAction.bind(null, lead.id)}
              confirmMessage={`Удалить лид «${lead.title}»? Это действие необратимо.`}
            />
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>Данные лида</CardHeader>
          <dl className="p-4 space-y-3 text-sm">
            <div>
              <dt className="text-muted text-xs uppercase">Контактное лицо</dt>
              <dd>{lead.name}</dd>
            </div>
            {lead.company && (
              <div>
                <dt className="text-muted text-xs uppercase">Компания</dt>
                <dd>{lead.company}</dd>
              </div>
            )}
            <div>
              <dt className="text-muted text-xs uppercase">Email</dt>
              <dd>{lead.email || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted text-xs uppercase">Телефон</dt>
              <dd>{lead.phone || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted text-xs uppercase">Источник</dt>
              <dd>{LEAD_SOURCE_LABELS[lead.source]}</dd>
            </div>
            {lead.budget != null && (
              <div>
                <dt className="text-muted text-xs uppercase">Бюджет</dt>
                <dd>{formatCurrency(lead.budget)}</dd>
              </div>
            )}
            {lead.venue && (
              <div>
                <dt className="text-muted text-xs uppercase">Площадка</dt>
                <dd>{lead.venue}</dd>
              </div>
            )}
            {lead.description && (
              <div>
                <dt className="text-muted text-xs uppercase">Описание</dt>
                <dd className="whitespace-pre-wrap">{lead.description}</dd>
              </div>
            )}
            <div>
              <dt className="text-muted text-xs uppercase">Создан</dt>
              <dd>{formatDateTime(lead.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-muted text-xs uppercase">Обновлён</dt>
              <dd>{formatDateTime(lead.updatedAt)}</dd>
            </div>
          </dl>
        </Card>

        <div className="lg:col-span-2">
          {isConverted ? (
            <Card>
              <CardHeader>Лид конвертирован</CardHeader>
              <div className="p-4 space-y-3 text-sm">
                <p className="text-muted">
                  Этот лид уже конвертирован в рабочие записи. Повторная конвертация недоступна.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {lead.convertedAccount && (
                    <Link
                      href={`/accounts/${lead.convertedAccount.id}`}
                      className="block border border-border rounded-md p-3 hover:border-accent transition-colors"
                    >
                      <p className="text-xs text-muted uppercase mb-1">Компания</p>
                      <p className="font-medium">{lead.convertedAccount.name}</p>
                    </Link>
                  )}
                  {lead.convertedContact && (
                    <Link
                      href={`/contacts/${lead.convertedContact.id}`}
                      className="block border border-border rounded-md p-3 hover:border-accent transition-colors"
                    >
                      <p className="text-xs text-muted uppercase mb-1">Контакт</p>
                      <p className="font-medium">
                        {lead.convertedContact.firstName} {lead.convertedContact.lastName}
                      </p>
                    </Link>
                  )}
                  {lead.convertedOpportunity && (
                    <Link
                      href={`/opportunities/${lead.convertedOpportunity.id}`}
                      className="block border border-border rounded-md p-3 hover:border-accent transition-colors"
                    >
                      <p className="text-xs text-muted uppercase mb-1">Сделка</p>
                      <p className="font-medium">{lead.convertedOpportunity.name}</p>
                      <Badge color="blue">{lead.convertedOpportunity.stage.name}</Badge>
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <CardHeader>Конвертация лида</CardHeader>
              <div className="p-4">
                <ConvertLeadForm
                  action={convertLeadAction.bind(null, lead.id)}
                  lead={lead}
                  stages={stages}
                />
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
