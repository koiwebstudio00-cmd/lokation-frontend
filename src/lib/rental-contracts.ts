export type RentalContract = {
  id: string;
  status: "borrador" | "vigente" | "finalizado";
  startDate: string;
  endDate: string;
  monthlyRent: string;
  terms?: { commissionRate: string; commissionBasis: string; adjustmentMethod: string; frequencyMonths: number | null; fixedPercent: string | null }[];
  currentRent?: string;
  currentRentSince?: string;
  currency: "ARS" | "USD";
  dueDay: number;
  createdAt: string;
  closedAt: string | null;
  events?: { id: string; action: "edited" | "activated" | "finished" | "terms_changed";
    details: { note?: string }; actorId: string; createdAt: string }[];
  property: { id: string; titulo: string; slug: string };
  owner: { id: string; nombre: string };
  tenantPerson: { id: string; nombre: string };
};

export function contractDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

export function contractAmount(value: string) {
  const [whole, cents = ""] = value.split(".");
  return `${new Intl.NumberFormat("es-AR").format(BigInt(whole))},${cents.padEnd(2, "0").slice(0, 2)}`;
}
