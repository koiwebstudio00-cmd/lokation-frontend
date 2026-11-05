"use client";
import { prepareDocumentUpload, refreshDocumentViews } from "@/actions/rental-documents";
type State = {error?:string;success?:string};
async function upload(mode: "vault" | "contract", contractId: string | undefined, form: FormData): Promise<State> {
  const file = form.get("file");
  if (!(file instanceof File) || file.size < 8 || file.size > 10 * 1024 * 1024) return {error:"Elegí un archivo de hasta 10 MB."};
  if(mode === "contract" && file.type !== "application/pdf") return {error:"Subí un archivo PDF."};
  const text = (name:string) => String(form.get(name) ?? "");
  const linkedContract = contractId ?? (text("contractId") || undefined);
  try {
    // Only metadata crosses the Server Action boundary; File stays in this browser.
    const ticket = await prepareDocumentUpload({mode,title:text("title"),kind:text("kind"),originalName:file.name.slice(0,255),size:file.size,
      ...(mode === "contract" ? {contractId,visibility:text("visibility")} : linkedContract ? {contractId:linkedContract,personId:text("personId"),dossierKind:text("dossierKind")} : {})});
    if(ticket.error || !ticket.url || !ticket.token) return {error:ticket.error ?? "No pudimos autorizar la carga."};
    const response = await fetch(ticket.url,{method:"POST",credentials:"omit",headers:{Authorization:`Bearer ${ticket.token}`,"Content-Type":mode === "contract" ? "application/pdf" : "application/octet-stream"},body:file});
    if(!response.ok) {
      const result = await response.json().catch(()=>({})) as {error?:{message?:string}};
      return {error:result.error?.message ?? "No pudimos subir el archivo al VPS. Volvé a intentarlo."};
    }
    try { await refreshDocumentViews(linkedContract); }
    catch { return {success:"Archivo guardado. Recargá la página para actualizar el listado."}; }
    return {success:"Archivo privado guardado."};
  } catch { return {error:"No pudimos conectar con el almacenamiento del VPS. Revisá tu conexión y volvé a intentarlo."}; }
}
export async function uploadVaultFile(_state:State,form:FormData):Promise<State> { return upload("vault",undefined,form); }
export async function uploadRentalDocument(contractId:string,_state:State,form:FormData):Promise<State> { return upload("contract",contractId,form); }
