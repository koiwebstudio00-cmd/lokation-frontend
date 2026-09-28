import { cn } from "@/lib/utils";

// Marca provisional de Ubikka hasta definir el sistema visual del producto.
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("size-8 text-primary", className)}
      fill="currentColor"
      aria-label="Ubikka"
    >
      <path d="M15 17h18v47c0 12 7 19 17 19s17-7 17-19V17h18v48c0 22-14 35-35 35S15 87 15 65V17Z" />
    </svg>
  );
}
