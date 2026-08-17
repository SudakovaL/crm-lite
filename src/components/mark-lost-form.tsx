"use client";

import { useActionState, useState } from "react";
import { FieldError, FormErrorBanner, SubmitButton, inputClass } from "./forms";
import type { FormState } from "@/lib/errors";

export function MarkLostForm({
  action,
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction] = useActionState(action, null);
  const [open, setOpen] = useState(false);
  const fieldErrors = state?.fieldErrors ?? {};

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium border border-danger text-danger hover:bg-red-50 dark:hover:bg-red-950/40"
      >
        Отметить как проигранную
      </button>
    );
  }

  return (
    <form action={formAction} className="border border-border rounded-md p-3 space-y-2">
      <FormErrorBanner message={state?.error} />
      <label htmlFor="lostReason" className="block text-xs font-medium text-muted">
        Причина отказа
      </label>
      <textarea
        id="lostReason"
        name="lostReason"
        rows={2}
        required
        className={inputClass}
        placeholder="Например: клиент выбрал другого подрядчика по бюджету"
      />
      <FieldError messages={fieldErrors.lostReason} />
      <div className="flex gap-2">
        <SubmitButton variant="danger" pendingText="Сохранение…">
          Подтвердить отказ
        </SubmitButton>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-3 py-1.5 rounded-md text-sm font-medium border border-border hover:bg-background"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}
