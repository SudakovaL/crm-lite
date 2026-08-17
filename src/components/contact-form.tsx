"use client";

import { useActionState } from "react";
import type { Contact } from "@prisma/client";
import { Label, FieldError, FormErrorBanner, SubmitButton, inputClass } from "./forms";
import type { FormState } from "@/lib/errors";

export function ContactForm({
  action,
  contact,
  accounts,
  submitLabel,
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  contact?: Contact;
  accounts: { id: string; name: string }[];
  submitLabel: string;
}) {
  const [state, formAction] = useActionState(action, null);
  const fieldErrors = state?.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-4 max-w-2xl">
      <FormErrorBanner message={state?.error} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName" required>
            Имя
          </Label>
          <input id="firstName" name="firstName" defaultValue={contact?.firstName} className={inputClass} />
          <FieldError messages={fieldErrors.firstName} />
        </div>
        <div>
          <Label htmlFor="lastName" required>
            Фамилия
          </Label>
          <input id="lastName" name="lastName" defaultValue={contact?.lastName} className={inputClass} />
          <FieldError messages={fieldErrors.lastName} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <input id="email" name="email" type="email" defaultValue={contact?.email ?? ""} className={inputClass} />
          <FieldError messages={fieldErrors.email} />
        </div>
        <div>
          <Label htmlFor="phone">Телефон</Label>
          <input id="phone" name="phone" defaultValue={contact?.phone ?? ""} className={inputClass} />
        </div>
        <div>
          <Label htmlFor="position">Должность</Label>
          <input id="position" name="position" defaultValue={contact?.position ?? ""} className={inputClass} />
        </div>
        <div>
          <Label htmlFor="accountId" required>
            Компания
          </Label>
          <select id="accountId" name="accountId" defaultValue={contact?.accountId ?? ""} className={inputClass}>
            <option value="" disabled>
              Выберите компанию
            </option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <FieldError messages={fieldErrors.accountId} />
        </div>
      </div>

      <SubmitButton pendingText="Сохранение…">{submitLabel}</SubmitButton>
    </form>
  );
}
