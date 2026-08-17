"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { inputClass } from "./forms";

export function ListFilters({
  searchPlaceholder,
  filters = [],
}: {
  searchPlaceholder: string;
  filters?: {
    name: string;
    label: string;
    options: { value: string; label: string }[];
  }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(name: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(name, value);
    else params.delete(name);
    router.push(`${pathname}?${params.toString()}`);
  }

  const hasActiveFilters =
    Boolean(searchParams.get("search")) || filters.some((f) => Boolean(searchParams.get(f.name)));

  return (
    <form
      className="flex flex-wrap items-center gap-2 mb-4"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        updateParam("search", String(formData.get("search") ?? ""));
      }}
    >
      <input
        type="search"
        name="search"
        defaultValue={searchParams.get("search") ?? ""}
        placeholder={searchPlaceholder}
        className={`${inputClass} max-w-xs`}
      />
      <button type="submit" className="px-3 py-1.5 rounded-md text-sm font-medium border border-border hover:bg-background">
        Найти
      </button>
      {filters.map((f) => (
        <select
          key={f.name}
          defaultValue={searchParams.get(f.name) ?? ""}
          onChange={(e) => updateParam(f.name, e.target.value)}
          className={`${inputClass} w-auto`}
        >
          <option value="">{f.label}: все</option>
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ))}
      {hasActiveFilters && (
        <Link href={pathname} className="text-sm text-muted hover:underline">
          Сбросить фильтры
        </Link>
      )}
    </form>
  );
}
