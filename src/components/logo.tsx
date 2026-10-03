import { cn } from "@/lib/utils";

// Marca provisional de Lokation hasta definir el sistema visual del producto.
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("size-8 text-primary", className)}
      fill="currentColor"
      aria-label="Lokation"
    >
      <path d="M20 15h20v65h45v20H20Z" />
    </svg>
  );
}
