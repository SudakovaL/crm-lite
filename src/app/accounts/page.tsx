import Link from "next/link";
import { getAccounts } from "@/server/accounts";
import { PageHeader, Card, EmptyState, LinkButton } from "@/components/ui";
import { ListFilters } from "@/components/list-filters";

export const dynamic = "force-dynamic";

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const params = await searchParams;
  const accounts = await getAccounts({ search: params.search });

  return (
    <div>
      <PageHeader
        title="Accounts"
        subtitle="Компании-клиенты агентства"
        actions={<LinkButton href="/accounts/new">+ Новая компания</LinkButton>}
      />

      <ListFilters searchPlaceholder="Поиск по названию, email, сайту…" />

      <Card>
        {accounts.length === 0 ? (
          <EmptyState title="Компании не найдены" description="Измените поиск или создайте новую компанию." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-muted border-b border-border">
                  <th className="px-4 py-2.5 font-medium">Название</th>
                  <th className="px-4 py-2.5 font-medium">Контакты</th>
                  <th className="px-4 py-2.5 font-medium">Сделки</th>
                  <th className="px-4 py-2.5 font-medium">Сайт</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {accounts.map((account) => (
                  <tr key={account.id} className="hover:bg-background/60">
                    <td className="px-4 py-2.5">
                      <Link href={`/accounts/${account.id}`} className="font-medium hover:underline">
                        {account.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-muted">{account._count.contacts}</td>
                    <td className="px-4 py-2.5 text-muted">{account._count.opportunities}</td>
                    <td className="px-4 py-2.5 text-muted">{account.website || "—"}</td>
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
