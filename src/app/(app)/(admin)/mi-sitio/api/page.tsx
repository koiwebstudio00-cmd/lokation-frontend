import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { SiteData } from "@/components/site/site-form";

export const metadata = { title: "Guía de integración API — Lokation" };

function Code({ children }: { children: string }) {
  return <pre tabIndex={0} className="max-w-full overflow-x-auto rounded-lg border bg-muted/50 p-4 text-xs leading-relaxed"><code>{children}</code></pre>;
}
function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return <section id={id} className="scroll-mt-20"><Card><CardHeader><h2 className="font-semibold">{title}</h2></CardHeader><CardContent className="min-w-0 space-y-4 text-sm leading-relaxed">{children}</CardContent></Card></section>;
}

export default async function ApiGuidePage() {
  const { tenant } = await apiFetch<{ tenant: SiteData }>("/v1/tenants/current");
  const base = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001").replace(/\/$/, "");
  const leads = `${base}/v1/public/${encodeURIComponent(tenant.slug)}/leads`;
  const example = { nombre: "María Pérez", email: "maria@example.com", telefono: "3811234567", mensaje: "Estoy buscando un departamento para alquilar.", website: "" };
  return <div className="mx-auto min-w-0 max-w-5xl space-y-5 pb-8">
    <Button asChild variant="outline"><Link href="/mi-sitio">Volver a Mi sitio web</Link></Button>
    <header className="space-y-2"><h1 className="text-2xl font-semibold">Conectá tu web con Lokation</h1><p className="text-muted-foreground">Guía para vos o tu desarrollador: mostrar propiedades y recibir consultas en el panel de {tenant.nombre}.</p></header>
    <div className="space-y-2 rounded-xl border bg-muted/30 p-4 text-sm"><p className="break-all">API de este entorno: <strong>{base}</strong></p><p>Identificador de tu inmobiliaria: <code>{tenant.slug}</code></p><p>Si estás probando en localhost, reemplazá la URL por la API productiva al desplegar tu web. No necesitás publicar el template de Lokation para usar esta integración.</p></div>
    <nav aria-label="Secciones de la guía" className="flex flex-wrap gap-x-5 gap-y-2 text-sm underline underline-offset-4"><a href="#clave">API key</a><a href="#propiedades">Propiedades</a><a href="#consultas">Consultas</a><a href="#informacion">Datos de la inmobiliaria</a><a href="#verificacion">Prueba y errores</a></nav>

    <Section id="clave" title="1. Crear y guardar la API key">
      <p>En <Link href="/mi-sitio" className="underline">Mi sitio web</Link>, elegí <strong>Conectar mi web propia</strong> y creá una clave con un nombre reconocible. Se genera con el permiso <code>export:read</code> y se muestra completa una sola vez. Sólo permite leer información de tu inmobiliaria.</p>
      <p>Guardala en las variables privadas del servidor de tu web. No uses prefijos <code>NEXT_PUBLIC_</code> o <code>VITE_</code>, ni incluyas la clave en el código del navegador. Si tu web es estática, agregá una función de servidor que consulte Lokation.</p>
      <Code>{`# Variables privadas del servidor de TU WEB\nLOKATION_API_URL=${base}\nLOKATION_API_KEY=REEMPLAZAR_POR_TU_CLAVE`}</Code>
      <p>Podés revocarla desde Mi sitio web. La web que la use dejará de acceder hasta configurar una clave nueva.</p>
    </Section>

    <Section id="propiedades" title="2. Mostrar el catálogo y las fichas">
      <p>Enviá la clave en el encabezado <code>X-Api-Key</code>. Este ejemplo JavaScript se ejecuta exclusivamente en el servidor de tu web:</p>
      <Code>{`const base = process.env.LOKATION_API_URL.replace(/\\/$/, "");\nconst response = await fetch(\n  base + "/v1/export/properties?estado=disponible&page=1&limit=24",\n  {\n    headers: { "X-Api-Key": process.env.LOKATION_API_KEY },\n    cache: "no-store",\n  }\n);\nif (!response.ok) throw new Error("No se pudo cargar el catálogo");\nconst { data: propiedades, meta } = await response.json();\nconst totalPaginas = Math.ceil(meta.total / meta.limit);`}</Code>
      <p>La respuesta tiene <code>data</code> (propiedades) y <code>meta</code> con <code>page</code>, <code>limit</code> y <code>total</code>. Solicitá las páginas siguientes según la navegación de tu web. El límite es de 100 propiedades por página; por defecto se devuelven 24.</p>
      <p>Usá <code>estado=disponible</code> para un catálogo de propiedades disponibles. Sin ese filtro también pueden aparecer reservadas o vendidas. Podés filtrar por <code>operacion</code> (venta/alquiler), <code>tipo</code>, <code>zona</code>, <code>ciudad</code>, <code>dormitorios</code> y <code>q</code> (texto). Construí los parámetros con <code>URLSearchParams</code>.</p>
      <Code>{`GET /v1/export/properties?estado=disponible&operacion=venta&page=1&limit=24\nGET /v1/export/properties/SLUG_O_UUID\nGET /v1/export/zonas?estado=disponible\nGET /v1/export/ciudades?estado=disponible`}</Code>
      <p>El listado incluye la foto de portada en <code>images</code>. El detalle devuelve <code>{'{ property: { ... } }'}</code> con todas las fotos, ordenadas por portada y posición. Las zonas y ciudades devuelven <code>{'{ data: [...] }'}</code>.</p>
      <p>Los datos incluyen <code>id</code>, <code>slug</code>, título, descripción, operación, tipo, precios y monedas, dirección, zona, ciudad, coordenadas, ambientes, dormitorios, baños, superficies, estado, destacado y condiciones de alquiler. Las fotos incluyen URL, orden y marca de portada. Los importes pueden llegar como cadenas decimales; convertí y formateá según la moneda.</p>
      <p>Para propiedades con ambas operaciones, el precio de alquiler está en <code>precioAlquiler</code> y su moneda en <code>monedaAlquiler</code>. No se exportan notas internas, usuarios ni consultas de clientes. Conservá el <code>id</code> de cada propiedad para enviar consultas asociadas.</p>
    </Section>

    <Section id="consultas" title="3. Enviar consultas al panel">
      <p>Conectá el envío de tus formularios a este endpoint. Es público y <strong>no requiere API key</strong>; la clave de catálogo no es un permiso de escritura.</p>
      <Code>{`POST ${leads}\nContent-Type: application/json`}</Code>
      <h3 className="font-semibold">Consulta general</h3>
      <Code>{JSON.stringify(example, null, 2)}</Code>
      <h3 className="font-semibold">Consulta por una propiedad</h3>
      <p>Agregá <code>property_id</code> con el UUID que recibiste en <code>id</code> al consultar el catálogo. Debe pertenecer a tu inmobiliaria.</p>
      <Code>{JSON.stringify({ ...example, mensaje: "Quisiera coordinar una visita a esta propiedad.", property_id: "REEMPLAZAR_POR_EL_ID_DEL_CATALOGO" }, null, 2)}</Code>
      <p>Para webs propias utilizá <code>property_id</code>. La alternativa <code>property_slug</code> actualmente requiere que el template de Lokation esté publicado y que la propiedad esté disponible.</p>
      <h3 className="font-semibold">Ejemplo de envío desde el servidor de tu web</h3>
      <Code>{`// Validá los datos recibidos de tu formulario antes de enviarlos.\nconst response = await fetch(${JSON.stringify(leads)}, {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify({\n    nombre: "María Pérez",\n    email: "maria@example.com",\n    mensaje: "Quisiera recibir más información.",\n    // property_id: idDeLaPropiedad, // omitir en consultas generales\n    website: "",\n  }),\n});\nconst result = await response.json();\nif (!response.ok) {\n  throw new Error(result.error?.message ?? "No se pudo enviar la consulta");\n}\n// HTTP 201: { ok: true, lead_id: "..." }\n// Ahora sí, mostrar confirmación al visitante.`}</Code>
      <p><code>nombre</code> y <code>mensaje</code> son obligatorios (hasta 200 y 5000 caracteres). Email y teléfono son opcionales en la API; en tu formulario pedí al menos uno para poder responder. Omití el email si está vacío. El teléfono admite hasta 50 caracteres.</p>
      <p><code>website</code> es un campo trampa antispam: debe llegar vacío u omitido. Deshabilitá el botón mientras se envía y confirmá el éxito sólo al recibir HTTP 201. No reintentes automáticamente un POST fallido: podría duplicar una consulta ya guardada.</p>
      <p>La consulta aparece en <strong>Consultas → canal Web</strong>. Si tiene propiedad, queda vinculada y asignada a su agente creador. Las generales se distribuyen entre agentes disponibles; si no hay ninguno, quedan sin asignar. Se generan notificaciones y se intenta enviar correo cuando está configurado.</p>
      <p>El endpoint admite 10 solicitudes por minuto por IP. Si enviás desde un único servidor, sus visitantes comparten ese límite: controlá el spam y manejá HTTP 429. No falsifiques encabezados de IP para evitarlo. Para llamar directamente desde el navegador se necesita autorizar el dominio en el CORS del backend; coordinalo con el operador de Lokation.</p>
    </Section>

    <Section id="informacion" title="4. Información de la inmobiliaria (opcional)">
      <p>La sección “Información para tu web” guarda nombre, logo, descripción, contacto, dirección, ciudad, portada, lema y color principal. Tu desarrollador puede leerlos con:</p>
      <Code>{`GET /v1/export/site\nX-Api-Key: TU_CLAVE\n\n// Respuesta: { site: { nombre, slug, logoUrl, configSitio } }`}</Code>
      <p>Tu web decide qué campos utiliza. Si ya tiene su presentación y diseño, no hace falta completar esa sección para consultar propiedades o enviar consultas. Guardar estos datos no modifica automáticamente el diseño de una web propia.</p>
    </Section>

    <Section id="verificacion" title="5. Comprobar la integración">
      <ol className="list-decimal space-y-2 pl-5"><li>Creá una propiedad de prueba y comprobá que aparezca en el catálogo de tu web.</li><li>Abrí su ficha y verificá fotos, precio, moneda y características.</li><li>Enviá una consulta general y otra con el ID de esa propiedad.</li><li>Revisá ambas en Consultas y verificá la propiedad asociada en la segunda.</li><li>Comprobá la campana de notificaciones y el correo si está configurado. Esta prueba puede enviar avisos reales.</li></ol>
      <ul className="list-disc space-y-1 pl-5"><li><strong>400:</strong> revisá campos, UUID, email y campo antispam.</li><li><strong>401:</strong> falta la API key o es inválida/revocada en los endpoints de exportación.</li><li><strong>403:</strong> revisá permisos de la clave y estado de la cuenta.</li><li><strong>404:</strong> identificador de inmobiliaria o propiedad inexistente/no accesible.</li><li><strong>429:</strong> esperá antes de volver a enviar; la exportación admite 120 solicitudes/minuto por clave.</li><li><strong>500 o error de red:</strong> no muestres éxito. Registrá un error sin claves ni datos personales y permití que el visitante vuelva a intentar.</li></ul>
    </Section>
  </div>;
}
