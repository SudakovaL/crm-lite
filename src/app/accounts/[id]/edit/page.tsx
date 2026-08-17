import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { AccountForm } from "@/components/account-form";
import { updateAccountAction } from "@/actions/accounts";

export const dynamic = "force-dynamic";

export default async function EditAccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const account = await prisma.account.findUnique({ where: { id } });
  if (!account) notFound();

  return (
    <div>
      <PageHeader title="Редактировать компанию" />
      <AccountForm action={updateAccountAction.bind(null, id)} account={account} submitLabel="Сохранить" />
    </div>
  );
}
