import { PageHeader } from "@/components/ui";
import { OpportunityForm } from "@/components/opportunity-form";
import { createOpportunityAction } from "@/actions/opportunities";
import { getStages } from "@/server/stages";
import { getAllAccountsForSelect } from "@/server/accounts";
import { getAllContactsForSelect } from "@/server/contacts";

export const dynamic = "force-dynamic";

export default async function NewOpportunityPage() {
  const [stages, accounts, contacts] = await Promise.all([
    getStages(),
    getAllAccountsForSelect(),
    getAllContactsForSelect(),
  ]);

  return (
    <div>
      <PageHeader title="Новая сделка" />
      <OpportunityForm
        action={createOpportunityAction}
        stages={stages}
        accounts={accounts}
        contacts={contacts}
        submitLabel="Создать сделку"
      />
    </div>
  );
}
