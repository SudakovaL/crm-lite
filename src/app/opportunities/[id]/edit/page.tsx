import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { OpportunityForm } from "@/components/opportunity-form";
import { updateOpportunityAction } from "@/actions/opportunities";
import { getStages } from "@/server/stages";
import { getAllAccountsForSelect } from "@/server/accounts";
import { getAllContactsForSelect } from "@/server/contacts";

export const dynamic = "force-dynamic";

export default async function EditOpportunityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [opportunity, stages, accounts, contacts] = await Promise.all([
    prisma.opportunity.findUnique({ where: { id } }),
    getStages(),
    getAllAccountsForSelect(),
    getAllContactsForSelect(),
  ]);
  if (!opportunity) notFound();

  return (
    <div>
      <PageHeader title="Редактировать сделку" />
      <OpportunityForm
        action={updateOpportunityAction.bind(null, id)}
        opportunity={opportunity}
        stages={stages}
        accounts={accounts}
        contacts={contacts}
        submitLabel="Сохранить"
      />
    </div>
  );
}
