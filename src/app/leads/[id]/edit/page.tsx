import { notFound } from "next/navigation";
import { getLeadById } from "@/server/leads";
import { PageHeader } from "@/components/ui";
import { LeadForm } from "@/components/lead-form";
import { updateLeadAction } from "@/actions/leads";

export const dynamic = "force-dynamic";

export default async function EditLeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = await getLeadById(id);
  if (!lead) notFound();

  return (
    <div>
      <PageHeader title="Редактировать лид" />
      <LeadForm action={updateLeadAction.bind(null, id)} lead={lead} submitLabel="Сохранить" />
    </div>
  );
}
