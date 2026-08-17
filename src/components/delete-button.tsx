"use client";

import { useActionState } from "react";
import { FormErrorBanner, SubmitButton } from "./forms";
import type { FormState } from "@/lib/errors";

export function DeleteButton({
  action,
  confirmMessage,
  label = "Удалить",
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  confirmMessage: string;
  label?: string;
}) {
  const [state, formAction] = useActionState(action, null);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!window.confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
      className="inline-block"
    >
      <SubmitButton variant="danger" pendingText="Удаление…">
        {label}
      </SubmitButton>
      {state?.error && (
        <div className="mt-2">
          <FormErrorBanner message={state.error} />
        </div>
      )}
    </form>
  );
}
