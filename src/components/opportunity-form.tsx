"use client";

import { useActionState, useState } from "react";
import type { Opportunity, Stage } from "@prisma/client";
import { Label, FieldError, FormErrorBanner, SubmitButton, inputClass } from "./forms";
import { formatDateInput } from "@/lib/format";
import type { FormState } from "@/lib/errors";

type ContactOption = { id: string; firstName: string; lastName: string; accountId: string };
type AccountOption = { id: string; name: string };

export function OpportunityForm({
  action,
  opportunity,
  stages,
  accounts,
  contacts,
  submitLabel,
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  opportunity?: Opportunity;
  stages: Stage[];
  accounts: AccountOption[];
  contacts: ContactOption[];
  submitLabel: string;
}) {
  const [state, formAction] = useActionState(action, null);
  const [accountId, setAccountId] = useState(opportunity?.accountId ?? accounts[0]?.id ?? "");
  const fieldErrors = state?.fieldErrors ?? {};
  const availableContacts = contacts.filter((c) => c.accountId === accountId);

  return (
    <form action={formAction} className="space-y-4 max-w-2xl">
      <FormErrorBanner message={state?.error} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Label htmlFor="name" required>
            Название сделки
          </Label>
          <input
            id="name"
            name="name"
            defaultValue={opportunity?.name}
            className={inputClass}
            placeholder="Стенд для ExpoBuild 2026, 48 м²"
          />
          <FieldError messages={fieldErrors.name} />
        </div>

        <div>
          <Label htmlFor="accountId" required>
            Компания
          </Label>
          <select
            id="accountId"
            name="accountId"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className={inputClass}
          >
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

        <div>
          <Label htmlFor="contactId">Контакт</Label>
          <select
            id="contactId"
            name="contactId"
            defaultValue={opportunity?.contactId ?? ""}
            className={inputClass}
          >
            <option value="">Без контакта</option>
            {availableContacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName}
              </option>
            ))}
          </select>
          {availableContacts.length === 0 && (
            <p className="text-xs text-muted mt-1">У выбранной компании ещё нет контактов.</p>
          )}
        </div>

        <div>
          <Label htmlFor="amount">Сумма, ₽</Label>
          <input
            id="amount"
            name="amount"
            type="number"
            min={0}
            defaultValue={opportunity?.amount ?? ""}
            className={inputClass}
          />
          <FieldError messages={fieldErrors.amount} />
        </div>

        <div>
          <Label htmlFor="stageId" required>
            Стадия
          </Label>
          <select
            id="stageId"
            name="stageId"
            defaultValue={opportunity?.stageId ?? stages[0]?.id}
            className={inputClass}
          >
            {stages.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <FieldError messages={fieldErrors.stageId} />
        </div>

        <div>
          <Label htmlFor="expectedCloseDate">Ожидаемая дата закрытия</Label>
          <input
            id="expectedCloseDate"
            name="expectedCloseDate"
            type="date"
            defaultValue={formatDateInput(opportunity?.expectedCloseDate)}
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="description">Описание</Label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={opportunity?.description ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <SubmitButton pendingText="Сохранение…">{submitLabel}</SubmitButton>
    </form>
  );
}
