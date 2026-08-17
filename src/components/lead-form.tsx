"use client";

import { useActionState } from "react";
import type { Lead } from "@prisma/client";
import { Label, FieldError, FormErrorBanner, SubmitButton, inputClass } from "./forms";
import { LEAD_SOURCES, LEAD_SOURCE_LABELS, LEAD_STATUSES, LEAD_STATUS_LABELS } from "@/lib/constants";
import type { FormState } from "@/lib/errors";

export function LeadForm({
  action,
  lead,
  submitLabel,
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  lead?: Lead;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState(action, null);
  const fieldErrors = state?.fieldErrors ?? {};
  const isConverted = lead?.status === "CONVERTED";

  return (
    <form action={formAction} className="space-y-4 max-w-2xl">
      <FormErrorBanner message={state?.error} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Label htmlFor="title" required>
            Тема обращения
          </Label>
          <input
            id="title"
            name="title"
            defaultValue={lead?.title}
            className={inputClass}
            placeholder="Стенд 36 м² для ProdExpo 2026"
          />
          <FieldError messages={fieldErrors.title} />
        </div>

        <div>
          <Label htmlFor="name" required>
            Контактное лицо
          </Label>
          <input id="name" name="name" defaultValue={lead?.name} className={inputClass} />
          <FieldError messages={fieldErrors.name} />
        </div>

        <div>
          <Label htmlFor="company">Компания</Label>
          <input id="company" name="company" defaultValue={lead?.company ?? ""} className={inputClass} />
          <FieldError messages={fieldErrors.company} />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <input id="email" name="email" type="email" defaultValue={lead?.email ?? ""} className={inputClass} />
          <FieldError messages={fieldErrors.email} />
        </div>

        <div>
          <Label htmlFor="phone">Телефон</Label>
          <input id="phone" name="phone" defaultValue={lead?.phone ?? ""} className={inputClass} />
          <FieldError messages={fieldErrors.phone} />
        </div>

        <div>
          <Label htmlFor="source" required>
            Источник
          </Label>
          <select id="source" name="source" defaultValue={lead?.source ?? "SITE"} className={inputClass}>
            {LEAD_SOURCES.map((s) => (
              <option key={s} value={s}>
                {LEAD_SOURCE_LABELS[s]}
              </option>
            ))}
          </select>
          <FieldError messages={fieldErrors.source} />
        </div>

        {lead && (
          <div>
            <Label htmlFor="status">Статус</Label>
            <select
              id="status"
              name="status"
              defaultValue={lead.status}
              disabled={isConverted}
              className={inputClass}
            >
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {LEAD_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            {isConverted && (
              <p className="text-xs text-muted mt-1">
                Лид уже конвертирован, статус меняется только через связанные записи.
              </p>
            )}
          </div>
        )}

        <div>
          <Label htmlFor="budget">Бюджет, ₽</Label>
          <input id="budget" name="budget" type="number" min={0} defaultValue={lead?.budget ?? ""} className={inputClass} />
          <FieldError messages={fieldErrors.budget} />
        </div>

        <div>
          <Label htmlFor="venue">Площадка / выставка</Label>
          <input id="venue" name="venue" defaultValue={lead?.venue ?? ""} className={inputClass} />
          <FieldError messages={fieldErrors.venue} />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="description">Описание</Label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={lead?.description ?? ""}
            className={inputClass}
            placeholder="Формат работ, сроки, пожелания клиента…"
          />
          <FieldError messages={fieldErrors.description} />
        </div>
      </div>

      <SubmitButton pendingText="Сохранение…">{submitLabel}</SubmitButton>
    </form>
  );
}
