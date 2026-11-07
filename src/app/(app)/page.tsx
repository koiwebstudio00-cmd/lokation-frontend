import { HomeSummary } from "@/components/home-summary";
import { CommunityHome } from "@/components/community-home";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Building2,
  Home,
  ImageOff,
  Inbox,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CanalBadge, LeadEstadoBadge } from "@/components/leads/estado-badge";
import { EstadoBadge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCurrentUser } from "@/lib/api";
import { esAdmin } from "@/lib/permisos";
import { getResumen } from "@/lib/queries";
import { formatDateTime, formatPrice, imageUrl } from "@/lib/utils";
import type { PropertyCardData } from "@/components/properties/property-card";
import type { Lead, Operacion } from "@/lib/types";

export const metadata = { title: "Inicio — Cubiko AI" };

const OPERACION_LABEL: Record<Operacion, string> = {
  venta: "Venta",
  alquiler: "Alquiler",
  ambos: "Venta y alquiler",
};

export default async function HomePage() {
  const me = await getCurrentUser();
  if(me?.rol === "community") return <CommunityHome nombre={me.nombre}/>;
  const resumen = await getResumen();
  const admin = me ? esAdmin(me.rol) : false;
  const total = resumen.totalPropiedades;

  // El vendedor está viendo su propio trabajo, no el de la inmobiliaria: los
  // textos tienen que decirlo, o los números se leen como totales del negocio.
  const textos = admin
    ? {
        resumen: `${total} ${total === 1 ? "propiedad cargada" : "propiedades cargadas"} en total.`,
        consultas: "Últimas consultas",
        consultasVacio: "Todavía no entró ninguna consulta.",
        propiedades: "Últimas propiedades",
        propiedadesVacio: "Todavía no hay propiedades cargadas.",
        verPropiedades: "/propiedades",
      }
    : {
        resumen: `${total} ${total === 1 ? "propiedad tuya" : "propiedades tuyas"} cargadas.`,
        consultas: "Tus últimas consultas",
        consultasVacio: "Todavía no tenés consultas asignadas.",
        propiedades: "Tus últimas propiedades",
        propiedadesVacio: "Todavía no cargaste propiedades.",
        verPropiedades: "/mis-propiedades",
      };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold">
            Hola{me?.nombre ? `, ${me.nombre.split(" ")[0]}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground">{textos.resumen}</p>
        </div>
        <Button asChild size="sm">
          <Link href="/propiedades/nueva" prefetch={false}>
            <Plus /> Nueva propiedad
          </Link>
        </Button>
      </div>

      <HomeSummary items={[
        { label: "Disponibles", value: resumen.propiedades.disponible, href: `${textos.verPropiedades}?estado=disponible`, description: "Listas para publicar" },
        { label: "Reservadas", value: resumen.propiedades.reservado, href: `${textos.verPropiedades}?estado=reservado`, description: "Con operación en curso" },
        { label: "Vendidas", value: resumen.propiedades.vendida, href: `${textos.verPropiedades}?estado=vendida`, description: "Operaciones cerradas" },
        { label: "Consultas nuevas", value: resumen.consultasNuevas, href: "/consultas?estado=nueva", description: "Pendientes de respuesta" },
      ]} />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold">
            <Inbox className="size-5 text-primary" /> {textos.consultas}
          </h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/consultas" prefetch={false}>
              Ver todas <ArrowRight />
            </Link>
          </Button>
        </div>
        {resumen.ultimasConsultas.length === 0 ? (
          <p className="border-y py-10 text-center text-sm text-muted-foreground">
            {textos.consultasVacio}
          </p>
        ) : (
          <HomeLeadTable leads={resumen.ultimasConsultas} />
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold">
            <Building2 className="size-5 text-primary" /> {textos.propiedades}
          </h2>
          <Button asChild variant="ghost" size="sm">
            <Link href={textos.verPropiedades} prefetch={false}>
              Ver todas <ArrowRight />
            </Link>
          </Button>
        </div>
        {resumen.ultimasPropiedades.length === 0 ? (
          <p className="border-y py-10 text-center text-sm text-muted-foreground">
            {textos.propiedadesVacio}
          </p>
        ) : (
          <HomePropertyTable properties={resumen.ultimasPropiedades} />
        )}
      </section>
    </div>
  );
}

function HomeLeadTable({ leads }: { leads: Lead[] }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Consulta</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Origen</TableHead>
            <TableHead>Propiedad</TableHead>
            <TableHead className="text-right">Entrada</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell className="min-w-[18rem] max-w-[26rem]">
                <Link
                  href={`/consultas/${lead.id}`}
                  prefetch={false}
                  className="block truncate font-medium hover:text-primary"
                >
                  {lead.nombre}
                </Link>
                <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                  {lead.mensaje}
                </p>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                  {lead.telefono && <span className="whitespace-nowrap">{lead.telefono}</span>}
                  {lead.email && <span className="max-w-[16rem] truncate">{lead.email}</span>}
                  {!lead.telefono && !lead.email && "—"}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <CanalBadge canal={lead.canal} />
                  <LeadEstadoBadge estado={lead.estado} />
                </div>
              </TableCell>
              <TableCell className="max-w-[16rem]">
                {lead.propiedad ? (
                  <Link
                    href={`/propiedades/${lead.propiedad.id}`}
                    prefetch={false}
                    className="block truncate text-muted-foreground hover:text-primary"
                  >
                    {lead.propiedad.titulo}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="whitespace-nowrap text-right text-xs tabular-nums text-muted-foreground">
                {formatDateTime(lead.created_at)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function HomePropertyTable({ properties }: { properties: PropertyCardData[] }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">
              <span className="sr-only">Foto</span>
            </TableHead>
            <TableHead>Propiedad</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Precio</TableHead>
            <TableHead className="text-right">Alta</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {properties.map((property) => (
            <TableRow key={property.id}>
              <TableCell>
                <Link
                  href={`/propiedades/${property.id}`}
                  prefetch={false}
                  className="relative flex size-12 items-center justify-center bg-muted text-muted-foreground"
                >
                  {property.portada ? (
                    <Image
                      src={imageUrl(property.portada)}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : (
                    <ImageOff className="size-4" />
                  )}
                </Link>
              </TableCell>
              <TableCell className="min-w-[18rem] max-w-[28rem]">
                <Link
                  href={`/propiedades/${property.id}`}
                  prefetch={false}
                  className="block truncate font-medium hover:text-primary"
                >
                  {property.titulo}
                </Link>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Home className="size-3.5 shrink-0" />
                  <span className="truncate">
                    {property.zona ?? property.vendedor ?? "Sin zona cargada"}
                  </span>
                </p>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {OPERACION_LABEL[property.operacion]} · {property.tipo}
              </TableCell>
              <TableCell>
                <EstadoBadge estado={property.estado} />
              </TableCell>
              <TableCell className="whitespace-nowrap text-right font-medium tabular-nums text-primary">
                {formatPrice(property.precio, property.moneda)}
              </TableCell>
              <TableCell className="whitespace-nowrap text-right text-xs tabular-nums text-muted-foreground">
                {property.created_at ? formatDateTime(property.created_at) : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
