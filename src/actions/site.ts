"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ApiError, apiFetch, getCurrentUser } from "@/lib/api";
import { esAdmin } from "@/lib/permisos";

export type SiteState = { error?: string; success?: string };

const optional = (value: FormDataEntryValue | null) => {
  const text = typeof value === "string" ? value.trim() : "";
  return text || undefined;
};

const schema = z.object({
  nombre: z.string().trim().min(2).max(120),
  descripcion: z.string().trim().min(30, "La descripción necesita al menos 30 caracteres.").max(500),
  telefono: z.string().max(40).optional(),
  email: z.union([z.email().max(254), z.literal("")]),
  direccion: z.string().max(200).optional(),
  ciudad: z.string().max(100).optional(),
  imagen_portada_url: z.union([z.url(), z.literal("")]),
  logo_url: z.url().optional(),
  lema: z.string().trim().max(100),
  color_primario: z.string().regex(/^#[0-9a-fA-F]{6}$/)
});

export async function saveSite(_previous: SiteState, formData: FormData): Promise<SiteState> {
  const me = await getCurrentUser();
  if (!me || !esAdmin(me.rol)) return { error: "No tenés permiso para editar el sitio." };
  const parsed = schema.safeParse({
    nombre: formData.get("nombre"), descripcion: formData.get("descripcion"),
    telefono: String(formData.get("telefono") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    direccion: String(formData.get("direccion") ?? "").trim(),
    ciudad: String(formData.get("ciudad") ?? "").trim(),
    imagen_portada_url: String(formData.get("imagen_portada_url") ?? "").trim(),
    logo_url: optional(formData.get("logo_url")),
    lema: String(formData.get("lema") ?? "").trim(),
    color_primario: formData.get("color_primario")
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const intent = formData.get("intent");
  const sitePublished = intent === "publish" ? true : intent === "unpublish" ? false : undefined;
  try {
    await apiFetch("/v1/tenants/current", { method: "PATCH", body: {
      nombre: parsed.data.nombre,
      logo_url: parsed.data.logo_url ?? null,
      config_sitio: {
        descripcion: parsed.data.descripcion,
        telefono: parsed.data.telefono,
        email: parsed.data.email,
        direccion: parsed.data.direccion,
        ciudad: parsed.data.ciudad,
        imagen_portada_url: parsed.data.imagen_portada_url,
        lema: parsed.data.lema,
        color_primario: parsed.data.color_primario
      },
      ...(sitePublished !== undefined ? { site_published: sitePublished } : {})
    } });
    revalidatePath("/mi-sitio");
    revalidatePath("/", "layout");
    return { success: sitePublished === true ? "Sitio publicado." : sitePublished === false
      ? "Sitio retirado de la web." : "Datos del sitio guardados." };
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : "No pudimos guardar el sitio." };
  }
}

export async function chooseWebsiteMode(_previous: SiteState, formData: FormData): Promise<SiteState> {
  const me = await getCurrentUser();
  if (!me || !esAdmin(me.rol)) return { error: "No tenés permiso para configurar el sitio." };
  const mode = z.enum(["managed", "custom"]).safeParse(formData.get("mode"));
  if (!mode.success) return { error: "Elegí una opción válida." };
  try {
    await apiFetch("/v1/tenants/current", { method: "PATCH", body: { website_mode: mode.data } });
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : "No pudimos guardar tu elección." };
  }
  revalidatePath("/mi-sitio");
  redirect("/mi-sitio");
}
