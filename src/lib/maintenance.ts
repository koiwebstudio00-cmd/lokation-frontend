export type MaintenanceRequest = {
  id: string; propertyId: string; contractId: string | null;
  title: string; description: string; priority: "baja" | "normal" | "alta" | "urgente";
  status: "abierta" | "en_gestion" | "resuelta" | "cancelada";
  createdAt: string; resolvedAt: string | null;
  property: { id?: string; titulo: string };
  events?: { id: string; fromState: string | null; toState: string; note: string; createdAt: string }[];
};
