"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { AppError, toFormError, type FormState } from "@/lib/errors";
import { noteSchema, taskSchema } from "@/lib/validation";

export async function addNoteAction(
  opportunityId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = noteSchema.safeParse({ title: formData.get("title") });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await prisma.activity.create({
      data: {
        type: "NOTE",
        title: parsed.data.title,
        opportunityId,
      },
    });
  } catch (err) {
    return toFormError(err);
  }

  revalidatePath(`/opportunities/${opportunityId}`);
  revalidatePath("/dashboard");
  return null;
}

export async function addTaskAction(
  opportunityId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = taskSchema.safeParse({
    title: formData.get("title"),
    dueDate: formData.get("dueDate"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await prisma.activity.create({
      data: {
        type: "TASK",
        title: parsed.data.title,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
        done: false,
        opportunityId,
      },
    });
  } catch (err) {
    return toFormError(err);
  }

  revalidatePath(`/opportunities/${opportunityId}`);
  revalidatePath("/dashboard");
  return null;
}

export async function completeTaskAction(
  activityId: string,
  _prevState: FormState,
  _formData: FormData
): Promise<FormState> {
  try {
    const activity = await prisma.activity.findUnique({ where: { id: activityId } });
    if (!activity) throw new AppError("Задача не найдена.");
    if (activity.type !== "TASK") throw new AppError("Это не задача.");

    await prisma.activity.update({
      where: { id: activityId },
      data: { done: true },
    });

    revalidatePath(`/opportunities/${activity.opportunityId}`);
    revalidatePath("/dashboard");
  } catch (err) {
    return toFormError(err);
  }
  return null;
}
