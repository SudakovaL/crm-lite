import Link from "next/link";
import { notFound } from "next/navigation";
import { getAccountById } from "@/server/accounts";
import { Card, CardHeader, PageHeader, Badge, LinkButton, EmptyState } from "@/components/ui";
import { DeleteButton } from "@/components/delete-button";
import { deleteAccountAction } from "@/actions/accounts";
import { OPPORTUNITY_STATUS_LABELS } from "@/lib/constants";
import { formatCurrency, formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_COLOR = { OPEN: "blue", WON: "green", LOST: "red" } as const;

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const account = await getAccountById(id);
  if (!account) notFound();

  return (
    <div>
      <PageHeader
        title={account.name}
        subtitle={account.website || undefined}
        actions={
          <>
            <LinkButton href={`/accounts/${account.id}/edit`} variant="secondary">
              Редактировать
            </LinkButton>
            <DeleteButton
              action={deleteAccountAction.bind(null, account.id)}
              confirmMessage={`Удалить компанию «${account.name}»? Это возможно только если нет связанных контактов и сделок.`}
            />
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="h-fit">
          <CardHeader>Информация о компании</CardHeader>
          <dl className="p-4 space-y-3 text-sm">
            <div>
              <dt className="text-muted text-xs uppercase">Email</dt>
              <dd>{account.email || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted text-xs uppercase">Телефон</dt>
              <dd>{account.phone || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted text-xs uppercase">Сайт</dt>
              <dd>{account.website || "—"}</dd>
            </div>
            {account.description && (
              <div>
                <dt className="text-muted text-xs uppercase">Описание</dt>
                <dd className="whitespace-pre-wrap">{account.description}</dd>
              </div>
            )}
            <div>
              <dt className="text-muted text-xs uppercase">Создана</dt>
              <dd>{formatDateTime(account.createdAt)}</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <CardHeader>Контакты ({account.contacts.length})</CardHeader>
          {account.contacts.length === 0 ? (
            <EmptyState title="Пока нет контактов" />
          ) : (
            <ul className="divide-y divide-border">
              {account.contacts.map((contact) => (
                <li key={contact.id} className="px-4 py-2.5 text-sm">
                  <Link href={`/contacts/${contact.id}`} className="font-medium hover:underline">
                    {contact.firstName} {contact.lastName}
                  </Link>
                  <p className="text-xs text-muted">{contact.email || contact.phone || "—"}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader>Сделки ({account.opportunities.length})</CardHeader>
          {account.opportunities.length === 0 ? (
            <EmptyState title="Пока нет сделок" />
          ) : (
            <ul className="divide-y divide-border">
              {account.opportunities.map((opp) => (
                <li key={opp.id} className="px-4 py-2.5 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <Link href={`/opportunities/${opp.id}`} className="font-medium hover:underline truncate">
                      {opp.name}
                    </Link>
                    <Badge color={STATUS_COLOR[opp.status]}>{OPPORTUNITY_STATUS_LABELS[opp.status]}</Badge>
                  </div>
                  <p className="text-xs text-muted">
                    {opp.stage.name} · {formatCurrency(opp.amount)}
                    {opp.contact ? ` · ${opp.contact.firstName} ${opp.contact.lastName}` : ""}
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
