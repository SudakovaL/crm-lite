"use client";

import { useActionState } from "react";
import type { Stage } from "@prisma/client";
import { FormErrorBanner, SubmitButton, inputClass } from "./forms";
import type { FormState } from "@/lib/errors";

export function StageChangeForm({
  action,
  stages,
  currentStageId,
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  stages: Stage[];
  currentStageId: string;
}) {
  const [state, formAction] = useActionState(action, null);

  return (
    <form action={formAction} className="flex items-end gap-2">
      <div className="flex-1">
        <label htmlFor="stageId" className="block text-xs font-medium text-muted mb-1">
          Стадия сделки
        </label>
        {/* Keyed by currentStageId: after a successful change, React resets
            uncontrolled fields to their original mount-time defaultValue, so
            without a fresh key this would visually revert to the old stage
            even though the update was saved correctly. */}
        <select
          key={currentStageId}
          id="stageId"
          name="stageId"
          defaultValue={currentStageId}
          className={inputClass}
        >
          {stages.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <SubmitButton variant="secondary" pendingText="Сохранение…">
        Изменить стадию
      </SubmitButton>
      {state?.error && (
        <div className="basis-full">
          <FormErrorBanner message={state.error} />
        </div>
      )}
    </form>
  );
}
