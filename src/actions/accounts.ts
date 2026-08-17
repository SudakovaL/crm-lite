"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toFormError, type FormState } from "@/lib/errors";
import { accountSchema } from "@/lib/validation";

function parseAccountFormData(formData: FormData) {
  return accountSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    website: formData.get("website"),
    description: formData.get("description"),
  });
}

export async function createAccountAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = parseAccountFormData(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  let accountId: string;
  try {
    const account = await prisma.account.create({ data: parsed.data });
    accountId = account.id;
  } catch (err) {
    return toFormError(err);
  }

  revalidatePath("/accounts");
  redirect(`/accounts/${accountId}`);
}

export async function updateAccountAction(
  id: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = parseAccountFormData(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await prisma.account.update({ where: { id }, data: parsed.data });
  } catch (err) {
    return toFormError(err);
  }

  revalidatePath("/accounts");
  revalidatePath(`/accounts/${id}`);
  redirect(`/accounts/${id}`);
}

export async function deleteAccountAction(
  id: string,
  _prevState: FormState,
  _formData: FormData
): Promise<FormState> {
  try {
    const account = await prisma.account.findUnique({
      where: { id },
      include: { _count: { select: { contacts: true, opportunities: true } } },
    });
    if (!account) return { error: "Компания не найдена." };
    if (account._count.contacts > 0 || account._count.opportunities > 0) {
      return {
        error:
          "Невозможно удалить компанию: с ней связаны контакты или сделки. Сначала удалите или перенесите их.",
      };
    }
    await prisma.account.delete({ where: { id } });
  } catch (err) {
    return toFormError(err);
  }

  revalidatePath("/accounts");
  revalidatePath("/dashboard");
  redirect("/accounts");
}
