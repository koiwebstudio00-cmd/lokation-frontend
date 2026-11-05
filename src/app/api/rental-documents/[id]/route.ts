import { apiFetch, ApiError } from "@/lib/api";
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return new Response(null,{status:404});
  try {
    const preview = new URL(request.url).searchParams.get("preview") === "1";
    const {url} = await apiFetch<{url:string}>(`/v1/rental-documents/${id}/download-ticket${preview ? "?preview=1" : ""}`);
    return new Response(null,{status:307,headers:{Location:url,"Cache-Control":"no-store","Referrer-Policy":"no-referrer"}});
  } catch(error) { return new Response(null,{status:error instanceof ApiError ? error.status : 502}); }
}
