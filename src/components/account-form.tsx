"use client";

import { useActionState } from "react";
import type { Account } from "@prisma/client";
import { Label, FieldError, FormErrorBanner, SubmitButton, inputClass } from "./forms";
import type { FormState } from "@/lib/errors";

export function AccountForm({
  action,
  account,
  submitLabel,
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  account?: Account;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState(action, null);
  const fieldErrors = state?.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-4 max-w-2xl">
      <FormErrorBanner message={state?.error} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Label htmlFor="name" required>
            Название компании
          </Label>
          <input id="name" name="name" defaultValue={account?.name} className={inputClass} />
          <FieldError messages={fieldErrors.name} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <input id="email" name="email" type="email" defaultValue={account?.email ?? ""} className={inputClass} />
          <FieldError messages={fieldErrors.email} />
        </div>
        <div>
          <Label htmlFor="phone">Телефон</Label>
          <input id="phone" name="phone" defaultValue={account?.phone ?? ""} className={inputClass} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="website">Сайт</Label>
          <input id="website" name="website" defaultValue={account?.website ?? ""} className={inputClass} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="description">Описание</Label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={account?.description ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <SubmitButton pendingText="Сохранение…">{submitLabel}</SubmitButton>
    </form>
  );
}
