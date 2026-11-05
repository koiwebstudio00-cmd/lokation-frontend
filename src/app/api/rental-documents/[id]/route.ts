import { apiBinary } from "@/lib/api";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return new Response(null, { status: 404 });
  try {
    const preview = new URL(_request.url).searchParams.get("preview") === "1";
    const response = await apiBinary(`/v1/rental-documents/${id}/content${preview ? "?preview=1" : ""}`);
    return new Response(response.body, { headers: { "Content-Type": response.headers.get("Content-Type") || "application/octet-stream",
      "Content-Disposition": response.headers.get("Content-Disposition") || "attachment", "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff" } });
  } catch { return new Response(null, { status: 404 }); }
}
