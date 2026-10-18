import { apiBinary } from "@/lib/api";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return new Response(null, { status: 404 });
  try {
    const response = await apiBinary(`/v1/rental-documents/${id}/content`);
    return new Response(response.body, { headers: { "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=\"documento.pdf\"", "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff" } });
  } catch { return new Response(null, { status: 404 }); }
}
