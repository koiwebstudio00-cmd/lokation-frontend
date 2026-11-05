import { portalRequest } from "@/lib/rental-portal";
import { ApiError } from "@/lib/api";
export async function GET(_request: Request, context: { params: Promise<{ slug: string; id: string }> }) {
  const {slug,id} = await context.params;
  if (!/^[a-z0-9][a-z0-9-]{1,48}$/.test(slug) || !/^[0-9a-f-]{36}$/.test(id)) return new Response(null,{status:404});
  try {
    const {url} = await portalRequest<{url:string}>(slug,`/documents/${id}/download-ticket`,{authenticated:true});
    return new Response(null,{status:307,headers:{Location:url,"Cache-Control":"no-store","Referrer-Policy":"no-referrer"}});
  } catch(error) { return new Response(null,{status:error instanceof ApiError ? error.status : 502}); }
}
