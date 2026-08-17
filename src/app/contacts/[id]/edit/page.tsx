import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { ContactForm } from "@/components/contact-form";
import { updateContactAction } from "@/actions/contacts";
import { getAllAccountsForSelect } from "@/server/accounts";

export const dynamic = "force-dynamic";

export default async function EditContactPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [contact, accounts] = await Promise.all([
    prisma.contact.findUnique({ where: { id } }),
    getAllAccountsForSelect(),
  ]);
  if (!contact) notFound();

  return (
    <div>
      <PageHeader title="Редактировать контакт" />
      <ContactForm
        action={updateContactAction.bind(null, id)}
        contact={contact}
        accounts={accounts}
        submitLabel="Сохранить"
      />
    </div>
  );
}
