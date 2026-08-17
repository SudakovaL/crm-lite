"use client";

import { useActionState } from "react";
import { SubmitButton, FormErrorBanner } from "./forms";
import type { FormState } from "@/lib/errors";

export function QuickActionButton({
  action,
  label,
  pendingText,
  confirmMessage,
  variant = "secondary",
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  label: string;
  pendingText?: string;
  confirmMessage?: string;
  variant?: "primary" | "secondary" | "danger";
}) {
  const [state, formAction] = useActionState(action, null);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (confirmMessage && !window.confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
      className="inline-block"
    >
      <SubmitButton variant={variant} pendingText={pendingText}>
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
