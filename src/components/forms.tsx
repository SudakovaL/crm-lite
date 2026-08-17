"use client";

import { useFormStatus } from "react-dom";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export function SubmitButton({
  children,
  pendingText,
  variant = "primary",
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  pendingText?: string;
  variant?: "primary" | "secondary" | "danger";
}) {
  const { pending } = useFormStatus();
  const base = "inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed";
  const styles =
    variant === "primary"
      ? "bg-accent text-accent-foreground hover:opacity-90"
      : variant === "danger"
        ? "bg-danger text-white hover:opacity-90"
        : "border border-border hover:bg-background";

  return (
    <button type="submit" disabled={pending} className={`${base} ${styles} ${className}`} {...rest}>
      {pending ? pendingText ?? "Сохранение…" : children}
    </button>
  );
}

export function FieldError({ messages }: { messages?: string[] }) {
  if (!messages || messages.length === 0) return null;
  return <p className="text-xs text-danger mt-1">{messages[0]}</p>;
}

export function FormErrorBanner({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div className="rounded-md border border-danger/30 bg-red-50 dark:bg-red-950/40 text-danger text-sm px-3 py-2 mb-4">
      {message}
    </div>
  );
}

export function Label({ children, htmlFor, required }: { children: ReactNode; htmlFor: string; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium mb-1">
      {children} {required && <span className="text-danger">*</span>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent";
