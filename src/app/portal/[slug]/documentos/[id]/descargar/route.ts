import { cookies } from "next/headers";
import { API_URL } from "@/lib/session-cookies";
import { PORTAL_COOKIE } from "@/lib/rental-portal";

export async function GET(_request: Request, context: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await context.params;
  if (!/^[a-z0-9][a-z0-9-]{1,48}$/.test(slug) || !/^[0-9a-f-]{36}$/.test(id)) return new Response(null, { status: 404 });
  const token = (await cookies()).get(PORTAL_COOKIE)?.value;
  if (!token) return new Response(null, { status: 401 });
  const response = await fetch(`${API_URL}/v1/portal/${slug}/documents/${id}/content`, {
    headers: { Authorization: `Bearer ${token}` }, cache: "no-store"
  });
  if (!response.ok) return new Response(null, { status: response.status });
  return new Response(response.body, { headers: { "Content-Type": "application/pdf",
    "Content-Disposition": "attachment; filename=\"documento.pdf\"", "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff" } });
}
