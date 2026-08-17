"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppError, toFormError, type FormState } from "@/lib/errors";
import { convertLeadSchema, leadSchema } from "@/lib/validation";
import type { LeadStatus } from "@prisma/client";

function parseLeadFormData(formData: FormData) {
  return leadSchema.safeParse({
    title: formData.get("title"),
    name: formData.get("name"),
    company: formData.get("company"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    source: formData.get("source"),
    status: formData.get("status") || undefined,
    budget: formData.get("budget"),
    venue: formData.get("venue"),
    description: formData.get("description"),
  });
}

export async function createLeadAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = parseLeadFormData(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  let leadId: string;
  try {
    const lead = await prisma.lead.create({
      data: {
        title: parsed.data.title,
        name: parsed.data.name,
        company: parsed.data.company,
        email: parsed.data.email,
        phone: parsed.data.phone,
        source: parsed.data.source,
        status: parsed.data.status as LeadStatus | undefined,
        budget: parsed.data.budget,
        venue: parsed.data.venue,
        description: parsed.data.description,
      },
    });
    leadId = lead.id;
  } catch (err) {
    return toFormError(err);
  }

  revalidatePath("/leads");
  revalidatePath("/dashboard");
  redirect(`/leads/${leadId}`);
}

export async function updateLeadAction(
  id: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = parseLeadFormData(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) throw new AppError("Лид не найден.");

    await prisma.lead.update({
      where: { id },
      data: {
        title: parsed.data.title,
        name: parsed.data.name,
        company: parsed.data.company,
        email: parsed.data.email,
        phone: parsed.data.phone,
        source: parsed.data.source,
        // A converted lead's status is a system fact, not user-editable.
        status: existing.status === "CONVERTED" ? undefined : (parsed.data.status as LeadStatus | undefined),
        budget: parsed.data.budget,
        venue: parsed.data.venue,
        description: parsed.data.description,
      },
    });
  } catch (err) {
    return toFormError(err);
  }

  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
  revalidatePath("/dashboard");
  redirect(`/leads/${id}`);
}

export async function deleteLeadAction(
  id: string,
  _prevState: FormState,
  _formData: FormData
): Promise<FormState> {
  try {
    await prisma.lead.delete({ where: { id } });
  } catch (err) {
    return toFormError(err);
  }

  revalidatePath("/leads");
  revalidatePath("/dashboard");
  redirect("/leads");
}

export async function convertLeadAction(
  id: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = convertLeadSchema.safeParse({
    accountName: formData.get("accountName"),
    accountWebsite: formData.get("accountWebsite"),
    contactFirstName: formData.get("contactFirstName"),
    contactLastName: formData.get("contactLastName"),
    contactEmail: formData.get("contactEmail"),
    contactPhone: formData.get("contactPhone"),
    contactPosition: formData.get("contactPosition"),
    createOpportunity: formData.get("createOpportunity"),
    opportunityName: formData.get("opportunityName"),
    opportunityAmount: formData.get("opportunityAmount"),
    opportunityStageId: formData.get("opportunityStageId"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const lead = await tx.lead.findUnique({ where: { id } });
      if (!lead) throw new AppError("Лид не найден.");
      if (lead.status === "CONVERTED") {
        throw new AppError("Этот лид уже конвертирован. Повторная конвертация невозможна.");
      }

      let stageId = data.opportunityStageId;
      if (data.createOpportunity && !stageId) {
        const firstStage = await tx.stage.findFirst({ orderBy: { order: "asc" } });
        if (!firstStage) throw new AppError("В системе не настроены стадии сделок.");
        stageId = firstStage.id;
      }

      const account = await tx.account.create({
        data: {
          name: data.accountName,
          website: data.accountWebsite,
        },
      });

      const contact = await tx.contact.create({
        data: {
          firstName: data.contactFirstName,
          lastName: data.contactLastName,
          email: data.contactEmail,
          phone: data.contactPhone,
          position: data.contactPosition,
          accountId: account.id,
        },
      });

      let opportunityId: string | undefined;
      if (data.createOpportunity) {
        const opportunity = await tx.opportunity.create({
          data: {
            name: data.opportunityName || lead.title,
            amount: data.opportunityAmount ?? lead.budget ?? undefined,
            stageId: stageId!,
            accountId: account.id,
            contactId: contact.id,
            description: lead.description,
            expectedCloseDate: null,
          },
        });
        opportunityId = opportunity.id;
      }

      await tx.lead.update({
        where: { id },
        data: {
          status: "CONVERTED",
          convertedAccountId: account.id,
          convertedContactId: contact.id,
          convertedOpportunityId: opportunityId,
        },
      });
    });
  } catch (err) {
    return toFormError(err);
  }

  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
  revalidatePath("/accounts");
  revalidatePath("/contacts");
  revalidatePath("/opportunities");
  revalidatePath("/dashboard");
  redirect(`/leads/${id}`);
}
