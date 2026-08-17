"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toFormError, type FormState } from "@/lib/errors";
import { contactSchema } from "@/lib/validation";

function parseContactFormData(formData: FormData) {
  return contactSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    position: formData.get("position"),
    accountId: formData.get("accountId"),
  });
}

export async function createContactAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = parseContactFormData(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  let contactId: string;
  try {
    const contact = await prisma.contact.create({ data: parsed.data });
    contactId = contact.id;
  } catch (err) {
    return toFormError(err);
  }

  revalidatePath("/contacts");
  revalidatePath("/accounts");
  redirect(`/contacts/${contactId}`);
}

export async function updateContactAction(
  id: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = parseContactFormData(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await prisma.contact.update({ where: { id }, data: parsed.data });
  } catch (err) {
    return toFormError(err);
  }

  revalidatePath("/contacts");
  revalidatePath(`/contacts/${id}`);
  revalidatePath("/accounts");
  redirect(`/contacts/${id}`);
}

export async function deleteContactAction(
  id: string,
  _prevState: FormState,
  _formData: FormData
): Promise<FormState> {
  try {
    const contact = await prisma.contact.findUnique({
      where: { id },
      include: { _count: { select: { opportunities: true } } },
    });
    if (!contact) return { error: "Контакт не найден." };
    if (contact._count.opportunities > 0) {
      return {
        error: "Невозможно удалить контакт: с ним связаны сделки.",
      };
    }
    await prisma.contact.delete({ where: { id } });
  } catch (err) {
    return toFormError(err);
  }

  revalidatePath("/contacts");
  revalidatePath("/accounts");
  redirect("/contacts");
}
