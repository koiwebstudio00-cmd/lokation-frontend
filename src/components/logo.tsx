import { cn } from "@/lib/utils";

// Símbolo vectorial de Cubiko AI: casa y conversación.
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("size-8 shrink-0 text-[#ff5a00]", className)}
      fill="none"
      role="img"
      aria-label="Cubiko AI"
    >
      <path d="M29 82H21C13 82 8 76 8 68V47C8 43 9 40 12 37L46 7C48 5 51 5 54 7L88 37C91 40 92 43 92 47V68C92 76 86 82 78 82H47L29 95V65C29 51 40 41 53 41H71" stroke="currentColor" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M72 23V10H81V31" fill="currentColor" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
      <g fill="currentColor">
        <circle cx="48" cy="63" r="4.5" />
        <circle cx="62" cy="63" r="4.5" />
        <circle cx="76" cy="63" r="4.5" />
      </g>
    </svg>
  );
}
