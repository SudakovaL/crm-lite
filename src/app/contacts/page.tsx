import Link from "next/link";
import { getContacts } from "@/server/contacts";
import { PageHeader, Card, EmptyState, LinkButton } from "@/components/ui";
import { ListFilters } from "@/components/list-filters";

export const dynamic = "force-dynamic";

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const params = await searchParams;
  const contacts = await getContacts({ search: params.search });

  return (
    <div>
      <PageHeader
        title="Contacts"
        subtitle="Контактные лица в компаниях-клиентах"
        actions={<LinkButton href="/contacts/new">+ Новый контакт</LinkButton>}
      />

      <ListFilters searchPlaceholder="Поиск по имени, email, телефону, компании…" />

      <Card>
        {contacts.length === 0 ? (
          <EmptyState title="Контакты не найдены" description="Измените поиск или создайте новый контакт." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-muted border-b border-border">
                  <th className="px-4 py-2.5 font-medium">Имя</th>
                  <th className="px-4 py-2.5 font-medium">Компания</th>
                  <th className="px-4 py-2.5 font-medium">Контакты</th>
                  <th className="px-4 py-2.5 font-medium">Сделки</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-background/60">
                    <td className="px-4 py-2.5">
                      <Link href={`/contacts/${contact.id}`} className="font-medium hover:underline">
                        {contact.firstName} {contact.lastName}
                      </Link>
                      {contact.position && <p className="text-xs text-muted">{contact.position}</p>}
                    </td>
                    <td className="px-4 py-2.5">
                      <Link href={`/accounts/${contact.account.id}`} className="hover:underline">
                        {contact.account.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-muted">{contact.email || contact.phone || "—"}</td>
                    <td className="px-4 py-2.5 text-muted">{contact._count.opportunities}</td>
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
