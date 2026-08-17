"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppError, toFormError, type FormState } from "@/lib/errors";
import {
  opportunityLostSchema,
  opportunitySchema,
  opportunityStageChangeSchema,
} from "@/lib/validation";

function parseOpportunityFormData(formData: FormData) {
  return opportunitySchema.safeParse({
    name: formData.get("name"),
    amount: formData.get("amount"),
    stageId: formData.get("stageId"),
    accountId: formData.get("accountId"),
    contactId: formData.get("contactId"),
    description: formData.get("description"),
    expectedCloseDate: formData.get("expectedCloseDate"),
  });
}

async function assertContactBelongsToAccount(contactId: string | undefined, accountId: string) {
  if (!contactId) return;
  const contact = await prisma.contact.findUnique({ where: { id: contactId } });
  if (!contact || contact.accountId !== accountId) {
    throw new AppError("Выбранный контакт не принадлежит выбранной компании.");
  }
}

export async function createOpportunityAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = parseOpportunityFormData(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  let opportunityId: string;
  try {
    await assertContactBelongsToAccount(parsed.data.contactId, parsed.data.accountId);
    const opportunity = await prisma.opportunity.create({
      data: {
        name: parsed.data.name,
        amount: parsed.data.amount,
        stageId: parsed.data.stageId,
        accountId: parsed.data.accountId,
        contactId: parsed.data.contactId,
        description: parsed.data.description,
        expectedCloseDate: parsed.data.expectedCloseDate
          ? new Date(parsed.data.expectedCloseDate)
          : null,
      },
    });
    opportunityId = opportunity.id;
  } catch (err) {
    return toFormError(err);
  }

  revalidatePath("/opportunities");
  revalidatePath("/dashboard");
  revalidatePath("/accounts");
  redirect(`/opportunities/${opportunityId}`);
}

export async function updateOpportunityAction(
  id: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = parseOpportunityFormData(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await assertContactBelongsToAccount(parsed.data.contactId, parsed.data.accountId);
    await prisma.opportunity.update({
      where: { id },
      data: {
        name: parsed.data.name,
        amount: parsed.data.amount,
        stageId: parsed.data.stageId,
        accountId: parsed.data.accountId,
        contactId: parsed.data.contactId,
        description: parsed.data.description,
        expectedCloseDate: parsed.data.expectedCloseDate
          ? new Date(parsed.data.expectedCloseDate)
          : null,
      },
    });
  } catch (err) {
    return toFormError(err);
  }

  revalidatePath("/opportunities");
  revalidatePath(`/opportunities/${id}`);
  revalidatePath("/dashboard");
  revalidatePath("/accounts");
  redirect(`/opportunities/${id}`);
}

export async function deleteOpportunityAction(
  id: string,
  _prevState: FormState,
  _formData: FormData
): Promise<FormState> {
  try {
    await prisma.opportunity.delete({ where: { id } });
  } catch (err) {
    return toFormError(err);
  }

  revalidatePath("/opportunities");
  revalidatePath("/dashboard");
  revalidatePath("/accounts");
  redirect("/opportunities");
}

export async function changeStageAction(
  id: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = opportunityStageChangeSchema.safeParse({
    stageId: formData.get("stageId"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    const opportunity = await prisma.opportunity.findUnique({ where: { id } });
    if (!opportunity) throw new AppError("Сделка не найдена.");
    if (opportunity.status !== "OPEN") {
      throw new AppError("Нельзя изменить стадию закрытой сделки.");
    }
    await prisma.opportunity.update({
      where: { id },
      data: { stageId: parsed.data.stageId },
    });
  } catch (err) {
    return toFormError(err);
  }

  revalidatePath("/opportunities");
  revalidatePath(`/opportunities/${id}`);
  revalidatePath("/dashboard");
  return null;
}

export async function markOpportunityWonAction(
  id: string,
  _prevState: FormState,
  _formData: FormData
): Promise<FormState> {
  try {
    const opportunity = await prisma.opportunity.findUnique({ where: { id } });
    if (!opportunity) throw new AppError("Сделка не найдена.");
    if (opportunity.status !== "OPEN") {
      throw new AppError("Сделка уже закрыта.");
    }
    if (!opportunity.amount || opportunity.amount <= 0) {
      throw new AppError("Нельзя закрыть сделку как выигранную: не указана сумма (amount).");
    }
    if (!opportunity.contactId) {
      throw new AppError("Нельзя закрыть сделку как выигранную: не указан контакт.");
    }
    await prisma.opportunity.update({
      where: { id },
      data: { status: "WON", lostReason: null },
    });
  } catch (err) {
    return toFormError(err);
  }

  revalidatePath("/opportunities");
  revalidatePath(`/opportunities/${id}`);
  revalidatePath("/dashboard");
  revalidatePath("/accounts");
  return null;
}

export async function markOpportunityLostAction(
  id: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = opportunityLostSchema.safeParse({
    lostReason: formData.get("lostReason"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    const opportunity = await prisma.opportunity.findUnique({ where: { id } });
    if (!opportunity) throw new AppError("Сделка не найдена.");
    if (opportunity.status !== "OPEN") {
      throw new AppError("Сделка уже закрыта.");
    }
    await prisma.opportunity.update({
      where: { id },
      data: { status: "LOST", lostReason: parsed.data.lostReason },
    });
  } catch (err) {
    return toFormError(err);
  }

  revalidatePath("/opportunities");
  revalidatePath(`/opportunities/${id}`);
  revalidatePath("/dashboard");
  revalidatePath("/accounts");
  return null;
}
