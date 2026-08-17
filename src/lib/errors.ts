import { Prisma } from "@prisma/client";

/** A business-rule violation that should be shown to the user as-is. */
export class AppError extends Error {}

export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
} | null;

export function toFormError(err: unknown, fallback = "Не удалось выполнить операцию."): FormState {
  if (err instanceof AppError) {
    return { error: err.message };
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2003") {
      return {
        error:
          "Невозможно выполнить операцию: запись используется в других связанных данных.",
      };
    }
    if (err.code === "P2025") {
      return { error: "Запись не найдена. Возможно, она уже была удалена." };
    }
    if (err.code === "P2002") {
      return { error: "Запись с такими данными уже существует." };
    }
  }

  // Next.js redirect()/notFound() throw special errors that must propagate.
  if (err && typeof err === "object" && "digest" in err) {
    throw err;
  }

  console.error(err);
  return { error: fallback };
}
