import Link from "next/link";
import { Star } from "lucide-react";
import type { Software } from "@/lib/catalog-data";

const licenseStyles: Record<string, string> = {
  "Open Source": "bg-accent/20 text-accent border-accent/40",
  Commercial: "bg-primary/20 text-primary border-primary/40",
  Free: "bg-chart-4/20 text-chart-4 border-chart-4/40",
};

export function SoftwareCard({ s }: { s: Software }) {
  return (
    <Link
      href={`/catalog/${s.id}`}
      className="group block rounded-xl border border-border bg-gradient-card p-5 hover:border-primary/50 hover:shadow-glow transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className="h-11 w-11 rounded-lg grid place-items-center font-bold text-lg"
          style={{ background: `${s.color}22`, color: s.color, border: `1px solid ${s.color}44` }}
        >
          {s.name[0]}
        </div>
        <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-md border ${licenseStyles[s.license]}`}>
          {s.license}
        </span>
      </div>
      <h3 className="mt-4 font-semibold text-foreground group-hover:text-primary transition-colors">{s.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{s.objective}</p>
      <div className="mt-4 flex items-center justify-between text-xs">
        <span className="px-2 py-1 rounded-md bg-secondary text-secondary-foreground">{s.category}</span>
        <div className="flex items-center gap-3 text-muted-foreground">
          <span>{s.year}</span>
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-chart-4 text-chart-4" />
            {s.rating.toFixed(1)}
          </span>
        </div>
      </div>
    </Link>
  );
}

