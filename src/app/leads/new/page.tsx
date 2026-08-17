import { PageHeader } from "@/components/ui";
import { LeadForm } from "@/components/lead-form";
import { createLeadAction } from "@/actions/leads";

export default function NewLeadPage() {
  return (
    <div>
      <PageHeader title="Новый лид" />
      <LeadForm action={createLeadAction} submitLabel="Создать лид" />
    </div>
  );
}
