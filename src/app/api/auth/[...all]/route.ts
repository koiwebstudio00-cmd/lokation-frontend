import { getGoogleAuth, googleEnabled } from "@/lib/google-auth";
export async function GET(request: Request) {
  // OAuth es el único endpoint público de Better Auth; no habilitamos altas,
  // edición de identidad ni sesiones de aplicación a través de este proveedor.
  if (!googleEnabled || new URL(request.url).pathname !== "/api/auth/callback/google") return new Response(null, { status: 404 });
  const response = await getGoogleAuth().handler(request);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
