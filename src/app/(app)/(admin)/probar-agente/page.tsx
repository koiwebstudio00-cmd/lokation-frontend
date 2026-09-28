import { ProbarAgente } from "@/components/agente/probar-agente";
import { getConversacionesPrueba } from "@/lib/queries";

export const metadata = { title: "Probar agente — Ubikka" };

export default async function ProbarAgentePage() {
  if (process.env.NODE_ENV === "production") {
    return (
      <div className="max-w-2xl space-y-3">
        <h1 className="text-2xl font-semibold">Probar agente</h1>
        <p className="text-sm text-muted-foreground">
          El agente de Ubikka está en preparación. El probador estará disponible
          cuando la ejecución se migre a código y pueda configurarse por inmobiliaria.
        </p>
      </div>
    );
  }
  const conversaciones = await getConversacionesPrueba();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Probar agente</h1>
        <p className="text-sm text-muted-foreground">
          Conversá con el agente como si fueras un visitante del sitio, sin usar WhatsApp. Estas charlas
          quedan aparte de las consultas reales (se identifican por su sesión con prefijo{" "}
          <code>prueba-</code>).
        </p>
      </div>
      <ProbarAgente conversaciones={conversaciones} />
    </div>
  );
}
