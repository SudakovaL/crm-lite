import { PageHeader } from "@/components/ui";
import { ContactForm } from "@/components/contact-form";
import { createContactAction } from "@/actions/contacts";
import { getAllAccountsForSelect } from "@/server/accounts";

export const dynamic = "force-dynamic";

export default async function NewContactPage() {
  const accounts = await getAllAccountsForSelect();

  return (
    <div>
      <PageHeader title="Новый контакт" />
      <ContactForm action={createContactAction} accounts={accounts} submitLabel="Создать контакт" />
    </div>
  );
}
