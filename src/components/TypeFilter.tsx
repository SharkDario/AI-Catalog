"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function TypeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentType = searchParams.get("type") || "";

  return (
    <select
      value={currentType}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        if (e.target.value) {
          params.set("type", e.target.value);
        } else {
          params.delete("type");
        }
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      }}
      className="bg-background border border-border rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
    >
      <option value="">Todos los Tipos</option>
      <option value="App">App</option>
      <option value="Librería">Librería</option>
      <option value="Modelo">Modelo</option>
    </select>
  );
}
