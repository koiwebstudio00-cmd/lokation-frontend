import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PAGE_SIZE } from "@/lib/queries";

function visiblePages(page: number, total: number, neighbors: number): (number | "…")[] {
  const width = neighbors * 2 + 1;
  let start = Math.max(1, page - neighbors);
  let end = Math.min(total, page + neighbors);
  if (end - start + 1 < width) {
    if (start === 1) end = Math.min(total, width);
    else start = Math.max(1, total - width + 1);
  }

  const pages = [...new Set([1, total, ...Array.from(
    { length: end - start + 1 },
    (_, index) => start + index
  )])].sort((a, b) => a - b);
  const result: (number | "…")[] = [];
  for (const current of pages) {
    const previous = result[result.length - 1];
    if (typeof previous === "number" && current - previous === 2) result.push(previous + 1);
    else if (typeof previous === "number" && current - previous > 2) result.push("…");
    result.push(current);
  }
  return result;
}

function PageLinks({
  page,
  total,
  neighbors,
  href,
  className,
}: {
  page: number;
  total: number;
  neighbors: number;
  href: (page: number) => string;
  className: string;
}) {
  const arrowClass = "size-8 sm:size-9";
  return (
    <ul className={`items-center justify-center gap-0.5 sm:gap-1 ${className}`}>
      <li>
        {page > 1 ? (
          <Button asChild variant="outline" size="icon" className={arrowClass}>
            <Link href={href(page - 1)} prefetch={false} aria-label="Página anterior">
              <ChevronLeft />
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="icon" className={arrowClass} disabled aria-label="Página anterior">
            <ChevronLeft />
          </Button>
        )}
      </li>
      {visiblePages(page, total, neighbors).map((item, index) => item === "…" ? (
        <li key={`gap-${index}`} aria-hidden="true" className="w-4 text-center text-sm text-muted-foreground">
          …
        </li>
      ) : (
        <li key={item}>
          <Button
            asChild
            variant={item === page ? "default" : "outline"}
            size="sm"
            className="h-8 min-w-8 px-1 tabular-nums sm:h-9 sm:min-w-9 sm:px-2"
          >
            <Link
              href={href(item)}
              prefetch={false}
              aria-label={`Página ${item}`}
              aria-current={item === page ? "page" : undefined}
            >
              {item}
            </Link>
          </Button>
        </li>
      ))}
      <li>
        {page < total ? (
          <Button asChild variant="outline" size="icon" className={arrowClass}>
            <Link href={href(page + 1)} prefetch={false} aria-label="Página siguiente">
              <ChevronRight />
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="icon" className={arrowClass} disabled aria-label="Página siguiente">
            <ChevronRight />
          </Button>
        )}
      </li>
    </ul>
  );
}

export function Pagination({
  page,
  count,
  basePath,
  searchParams,
}: {
  page: number;
  count: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}) {
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  if (totalPages <= 1) return null;

  function href(target: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value && key !== "pagina") params.set(key, value);
    }
    if (target > 1) params.set("pagina", String(target));
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  }

  return (
    <nav aria-label="Paginación" className="flex flex-col items-center gap-2">
      <PageLinks page={page} total={totalPages} neighbors={1} href={href} className="flex sm:hidden" />
      <PageLinks page={page} total={totalPages} neighbors={2} href={href} className="hidden sm:flex" />
      <p className="text-xs text-muted-foreground">
        Página {page} de {totalPages} · {count} en total
      </p>
    </nav>
  );
}
