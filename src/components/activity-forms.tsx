"use client";

import { useActionState, useRef } from "react";
import { FieldError, FormErrorBanner, SubmitButton, inputClass } from "./forms";
import type { FormState } from "@/lib/errors";

export function AddNoteForm({
  action,
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(async (prev: FormState, formData: FormData) => {
    const result = await action(prev, formData);
    if (!result) formRef.current?.reset();
    return result;
  }, null);
  const fieldErrors = state?.fieldErrors ?? {};

  return (
    <form ref={formRef} action={formAction} className="space-y-2">
      <FormErrorBanner message={state?.error} />
      <textarea
        name="title"
        rows={2}
        required
        className={inputClass}
        placeholder="Добавить заметку…"
      />
      <FieldError messages={fieldErrors.title} />
      <SubmitButton pendingText="Добавление…">Добавить заметку</SubmitButton>
    </form>
  );
}

export function AddTaskForm({
  action,
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(async (prev: FormState, formData: FormData) => {
    const result = await action(prev, formData);
    if (!result) formRef.current?.reset();
    return result;
  }, null);
  const fieldErrors = state?.fieldErrors ?? {};

  return (
    <form ref={formRef} action={formAction} className="space-y-2">
      <FormErrorBanner message={state?.error} />
      <input name="title" required className={inputClass} placeholder="Новая задача…" />
      <FieldError messages={fieldErrors.title} />
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label htmlFor="task-dueDate" className="block text-xs font-medium text-muted mb-1">
            Срок
          </label>
          <input id="task-dueDate" name="dueDate" type="date" className={inputClass} />
        </div>
        <SubmitButton pendingText="Добавление…">Добавить задачу</SubmitButton>
      </div>
    </form>
  );
}
