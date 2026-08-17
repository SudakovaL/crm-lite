"use client";

import { useActionState, useState } from "react";
import type { Lead, Stage } from "@prisma/client";
import { Label, FieldError, FormErrorBanner, SubmitButton, inputClass } from "./forms";
import type { FormState } from "@/lib/errors";

function splitName(name: string): [string, string] {
  const trimmed = name.trim();
  const idx = trimmed.indexOf(" ");
  if (idx === -1) return [trimmed, ""];
  return [trimmed.slice(0, idx), trimmed.slice(idx + 1)];
}

export function ConvertLeadForm({
  action,
  lead,
  stages,
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  lead: Lead;
  stages: Stage[];
}) {
  const [state, formAction] = useActionState(action, null);
  const [createOpportunity, setCreateOpportunity] = useState(true);
  const [firstName, lastName] = splitName(lead.name);
  const fieldErrors = state?.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-6">
      <FormErrorBanner message={state?.error} />

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold mb-1">Новая компания (Account)</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="accountName" required>
              Название компании
            </Label>
            <input
              id="accountName"
              name="accountName"
              defaultValue={lead.company || lead.name}
              className={inputClass}
            />
            <FieldError messages={fieldErrors.accountName} />
          </div>
          <div>
            <Label htmlFor="accountWebsite">Сайт</Label>
            <input id="accountWebsite" name="accountWebsite" className={inputClass} />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold mb-1">Контактное лицо (Contact)</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contactFirstName" required>
              Имя
            </Label>
            <input
              id="contactFirstName"
              name="contactFirstName"
              defaultValue={firstName}
              className={inputClass}
            />
            <FieldError messages={fieldErrors.contactFirstName} />
          </div>
          <div>
            <Label htmlFor="contactLastName" required>
              Фамилия
            </Label>
            <input
              id="contactLastName"
              name="contactLastName"
              defaultValue={lastName}
              className={inputClass}
            />
            <FieldError messages={fieldErrors.contactLastName} />
          </div>
          <div>
            <Label htmlFor="contactEmail">Email</Label>
            <input
              id="contactEmail"
              name="contactEmail"
              type="email"
              defaultValue={lead.email ?? ""}
              className={inputClass}
            />
            <FieldError messages={fieldErrors.contactEmail} />
          </div>
          <div>
            <Label htmlFor="contactPhone">Телефон</Label>
            <input
              id="contactPhone"
              name="contactPhone"
              defaultValue={lead.phone ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <Label htmlFor="contactPosition">Должность</Label>
            <input id="contactPosition" name="contactPosition" className={inputClass} />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold mb-1 flex items-center gap-2">
          <input
            type="checkbox"
            name="createOpportunity"
            checked={createOpportunity}
            onChange={(e) => setCreateOpportunity(e.target.checked)}
            className="rounded border-border"
          />
          Создать сделку (Opportunity)
        </legend>
        {createOpportunity && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Label htmlFor="opportunityName">Название сделки</Label>
              <input
                id="opportunityName"
                name="opportunityName"
                defaultValue={lead.title}
                className={inputClass}
              />
            </div>
            <div>
              <Label htmlFor="opportunityAmount">Сумма, ₽</Label>
              <input
                id="opportunityAmount"
                name="opportunityAmount"
                type="number"
                min={0}
                defaultValue={lead.budget ?? ""}
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-3">
              <Label htmlFor="opportunityStageId">Стадия</Label>
              <select id="opportunityStageId" name="opportunityStageId" className={inputClass} defaultValue={stages[0]?.id}>
                {stages.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </fieldset>

      <SubmitButton pendingText="Конвертация…">Конвертировать лид</SubmitButton>
    </form>
  );
}
