export const clientRoles = ["inquilino", "propietario", "comprador", "vendedor", "garante", "contacto"] as const;
export type ClientRole = typeof clientRoles[number];
export const clientRoleLabels: Record<ClientRole, string> = { inquilino: "Inquilino", propietario: "Propietario", comprador: "Comprador", vendedor: "Vendedor", garante: "Garante", contacto: "Contacto" };
export type Client = { id: string; nombre: string; email: string | null; telefono: string | null; roles: ClientRole[] };
export type ClientContract = { id: string; status: string; startDate: string; endDate: string; monthlyRent: string; currency: string; property: { id: string; titulo: string } };
export type ClientDetail = Client & { ownedContracts: ClientContract[]; occupiedContracts: ClientContract[];
  commercialLinks: { leadId: string; createdAt: string; lead: { id: string; nombre: string; estado: string; createdAt: string; property: { id: string; titulo: string } | null } }[] };
