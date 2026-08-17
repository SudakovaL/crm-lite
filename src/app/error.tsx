"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
      <h1 className="text-lg font-semibold">Что-то пошло не так</h1>
      <p className="text-sm text-muted max-w-md">
        Произошла непредвиденная ошибка при обработке запроса. Попробуйте повторить действие.
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-accent text-accent-foreground hover:opacity-90"
      >
        Попробовать снова
      </button>
    </div>
  );
}
