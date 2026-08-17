import Link from "next/link";
import { notFound } from "next/navigation";
import { getContactById } from "@/server/contacts";
import { Card, CardHeader, PageHeader, Badge, LinkButton, EmptyState } from "@/components/ui";
import { DeleteButton } from "@/components/delete-button";
import { deleteContactAction } from "@/actions/contacts";
import { OPPORTUNITY_STATUS_LABELS } from "@/lib/constants";
import { formatCurrency, formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_COLOR = { OPEN: "blue", WON: "green", LOST: "red" } as const;

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contact = await getContactById(id);
  if (!contact) notFound();

  return (
    <div>
      <PageHeader
        title={`${contact.firstName} ${contact.lastName}`}
        subtitle={contact.position || undefined}
        actions={
          <>
            <LinkButton href={`/contacts/${contact.id}/edit`} variant="secondary">
              Редактировать
            </LinkButton>
            <DeleteButton
              action={deleteContactAction.bind(null, contact.id)}
              confirmMessage={`Удалить контакт «${contact.firstName} ${contact.lastName}»? Это возможно только если нет связанных сделок.`}
            />
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="h-fit">
          <CardHeader>Контактная информация</CardHeader>
          <dl className="p-4 space-y-3 text-sm">
            <div>
              <dt className="text-muted text-xs uppercase">Компания</dt>
              <dd>
                <Link href={`/accounts/${contact.account.id}`} className="hover:underline">
                  {contact.account.name}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-muted text-xs uppercase">Email</dt>
              <dd>{contact.email || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted text-xs uppercase">Телефон</dt>
              <dd>{contact.phone || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted text-xs uppercase">Создан</dt>
              <dd>{formatDateTime(contact.createdAt)}</dd>
            </div>
          </dl>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>Сделки ({contact.opportunities.length})</CardHeader>
          {contact.opportunities.length === 0 ? (
            <EmptyState title="Пока нет сделок" />
          ) : (
            <ul className="divide-y divide-border">
              {contact.opportunities.map((opp) => (
                <li key={opp.id} className="px-4 py-2.5 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <Link href={`/opportunities/${opp.id}`} className="font-medium hover:underline truncate">
                      {opp.name}
                    </Link>
                    <Badge color={STATUS_COLOR[opp.status]}>{OPPORTUNITY_STATUS_LABELS[opp.status]}</Badge>
                  </div>
                  <p className="text-xs text-muted">
                    {opp.stage.name} · {formatCurrency(opp.amount)}
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
