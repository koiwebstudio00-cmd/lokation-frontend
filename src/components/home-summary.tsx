import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

/** Shared, flat overview for the different staff home pages. */
export function HomeSummary({ items }: { items: { label: string; value: number; href: string; description: string }[] }) {
  return (
    <section className={`grid border-y sm:flex sm:divide-x ${items.length === 3 ? "grid-cols-3" : "grid-cols-2"}`} aria-label="Resumen de actividad">
      {items.map((item) => (
        <div key={item.label} className="min-w-0 flex-1">
          <Link href={item.href} className="group block px-3 py-5 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-6">
            <p className="flex items-center justify-between gap-2 text-sm text-muted-foreground">{item.label}<ArrowUpRight aria-hidden="true" className="hidden size-4 sm:block opacity-50 group-hover:opacity-100" /></p>
            <p className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums">{item.value}</p>
            <p className="mt-1 hidden sm:block text-xs text-muted-foreground">{item.description}</p>
          </Link>
        </div>
      ))}
    </section>
  );
}
