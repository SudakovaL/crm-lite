import { PageHeader } from "@/components/ui";
import { AccountForm } from "@/components/account-form";
import { createAccountAction } from "@/actions/accounts";

export default function NewAccountPage() {
  return (
    <div>
      <PageHeader title="Новая компания" />
      <AccountForm action={createAccountAction} submitLabel="Создать компанию" />
    </div>
  );
}
