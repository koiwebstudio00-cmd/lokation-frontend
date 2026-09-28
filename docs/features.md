# Features por implementar — lamelas (panel interno)

**Última revisión:** 2026-09-27

Backlog exclusivo de **este repo**. Cuando una feature se implementa y queda
verificada, se saca de acá; el historial vive en commits y en `docs/bugfix/`.

Las features que también necesitan trabajo en otro repo se registran allá con el
mismo ID: `back-lamelas/docs/features.md` (API y datos),
`lamelas-web/docs/features.md` (sitio público),
`lamelas-agent/docs/features.md` (Sofía y n8n).

Formato de cada item: **qué es**, **ventaja** de hacerlo, **viabilidad**
(esfuerzo S/M/L y qué se toca) y **estado**.

## Orden de trabajo acordado (2026-09-27)

1. Zonas en propiedades (`ZONA-SELECT-01` + `ZONA-SELECT-02`, con
   `back-lamelas` → `ZONA-NORMALIZE-01`).
2. UI de Consultas: distinguir fantasmas y los que necesitan atención
   (`CONSULTAS-UI-01`).
3. Datos extra del lead (`LEAD-DATOS-01`).
4. Imagen de la propiedad al compartir el link (`lamelas-web` →
   `OG-DINAMICO-01`).

Flujo: todo se implementa en `dev`, Cacho prueba a mano y verifica, y solo
después se pasa a `main` y se sube al remoto.

## Índice

| ID | Item | Esfuerzo | Estado |
|---|---|:---:|---|
| ZONA-SELECT-01 | Cerrar la carga de zona a una lista, con escape "Otra" | S | implementado en local, sin commitear |
| ZONA-SELECT-02 | Consecuencias de la lista cerrada en filtros | S | pendiente |
| CONSULTAS-UI-01 | Distinguir en Consultas fantasmas y los que necesitan atención | M | pendiente — prioridad 2 |
| LEAD-DATOS-01 | Datos extra del lead en la ficha | S/M | a definir — prioridad 3 |
| MOTIVO-VISIBLE-01 | Mostrar y filtrar el motivo de derivación | S | pendiente |
| SIN-LEER-01 | Estado "sin leer" por lead | M | pendiente (plan escrito) |
| F1-PANEL | Vistas faltantes de analíticas | M | parcial |
| F3-PANEL | Vista de incidentes de n8n y Zernio | M | pendiente |
| F4-PANEL | Pantalla de configuración de Sofía por tenant | M | pendiente |
| F7-PANEL | Logs de correo y envío desde el lead | M | pendiente |

---

## ZONA-SELECT-01 — carga de zona con lista cerrada

**Qué es.** `Barrio / Zona` en `property-form.tsx` pasó de `Input` libre a
`Select` sobre la constante `ZONAS` de `src/lib/types.ts` (22 zonas de Tucumán y
alrededores). Las propiedades con un valor que no está en la lista lo conservan:
el form agrega una opción `"<valor> (valor actual)"`.

**Ventaja.** Los vendedores dejan de escribir la misma zona de cinco formas
distintas, y eso arregla en cascada el filtro del sitio público, los conteos de
analíticas y el matcheo de zona del buscador de Sofía.

**Viabilidad.** Ya hecho, S. No requiere cambios de backend: `zona` sigue siendo
texto libre en la API y en Postgres, así que la lista es una convención de UI y
nada rompe. `tsc --noEmit` verde.

**Estado.** **Implementado en local, sin commitear** (rama `dev`; archivos
`property-form.tsx` y `lib/types.ts`). `tsc --noEmit` y `eslint` verdes.

Decisiones tomadas el 2026-09-27:
- **Las localidades que también son ciudad se quedan en las dos listas**
  (Yerba Buena, Tafí Viejo, Alderetes, Lules, Monteros, Concepción pueden ir como
  zona y como ciudad). Consecuencia asumida: el filtro del sitio puede mostrar la
  misma localidad como zona y como ciudad.
- **Lista cerrada + opción "Otra (especificar)"**: implementado con el centinela
  `OTRA_ZONA` (`lib/types.ts`). Al elegir "Otra" aparece un input libre y es ese
  input el que viaja como `zona` (el `<select>` pierde el `name`). Una propiedad
  cuyo valor guardado no está en la lista abre el form directamente en "Otra" con
  el texto cargado, así no se pierde al editar. Reemplaza el hack anterior de la
  opción `"(valor actual)"`.
- Lo que se escriba en "Otra" es la señal para ir sumando zonas a `ZONAS`: vale
  revisarlo cada tanto con la query de `ZONA-NORMALIZE-01`.

Pendiente antes de mergear a `main`: probar a mano (alta nueva, edición de una
propiedad con zona de la lista, edición de una con zona vieja fuera de la lista,
y guardar con "Otra" vacío → debe quedar `null`). Falta Salta en la lista, que el
SEO del sitio publicita.

## ZONA-SELECT-02 — consecuencias de la lista cerrada en los filtros

**Qué es.** Dos lugares del panel quedaron desalineados con la lista cerrada:
- Analíticas → filtro "Zona exacta" es un `Input` de texto libre
  (`analytics-filters.tsx`) contra una comparación exacta en el backend. Debería
  ser el mismo `Select` de `ZONAS`.
- El listado de propiedades muestra la columna Zona pero **no se puede filtrar
  por zona**, aunque ahora el vocabulario es finito y el filtro sería trivial.

**Ventaja.** El filtro de analíticas deja de depender de que el admin escriba
exactamente igual que el vendedor que cargó la propiedad. Y filtrar el listado
por zona es la consulta más común de la oficina ("qué tengo en Yerba Buena").

**Viabilidad.** S. Solo panel; el endpoint de analíticas ya acepta `zona` y el de
propiedades ya acepta filtros.

**Estado.** Pendiente.

## MOTIVO-VISIBLE-01 — mostrar el motivo de derivación en el lead

**Qué es.** Pedido de los empleados: poder distinguir al lead que viene a **dejar
una propiedad**. Sofía ya lo detecta y deriva con `motivo: "tasacion"`, que queda
guardado en `derivaciones.motivo`, pero el panel no lo muestra ni permite
filtrar por él.

**Ventaja.** Resuelve el pedido sin tocar el enum de clasificación ni migrar
nada: el dato ya existe. Los vendedores ven de una si la consulta es de alguien
que quiere comprar o de alguien que quiere vender.

**Viabilidad.** S del lado del panel (ficha del lead + filtro en Consultas), una
vez que la API lo devuelva → `back-lamelas/docs/features.md` →
`CLASIF-PROPIETARIO-01`.

**Estado.** Pendiente. Alternativa más cara: agregar `propietario` al enum de
clasificación, que además toca `actions/leads.ts`,
`lead-clasificacion-select.tsx`, `lead-filters.tsx`, `analytics-filters.tsx`,
`CLASIF_VALUES` y el tile de stats de Consultas.

## SIN-LEER-01 — estado "sin leer" por lead

**Qué es.** Distintivo visual de lead sin leer en: el listado, un badge en el
menú lateral, un filtro "Sin leer" y un tile del dashboard. Marcar como leída
**cierra el handoff**: el acuse de recibo del vendedor es lo que frena la
reasignación por timeout, igual que "Tomar el chat" en WhatsApp.

**Ventaja.** Le da a los leads web el mismo acuse de recibo que ya tienen los de
WhatsApp, que es lo que habilita reasignarlos cuando nadie los atiende. Y de paso
el vendedor ve de un vistazo qué le entró y no miró.

**Viabilidad.** M en el panel, pero depende de
`back-lamelas/docs/features.md` → `LEAD-WEB-HANDOFF-01` (L). Reglas ya
acordadas: `leido_at` se resetea al reasignar; se marca por acción explícita, no
por abrir el detalle; `POST /conversations/:id/take` también lo setea; el
distintivo cuelga de `assigned_to = yo`, nunca de ser dueño de la propiedad.

**Estado.** Pendiente. Plan completo del 2026-08-24 en
`Documents/Claude/Projects/Inmobiliaria lamelas/plan-reparto-leads-y-leidos.md`.

## CONSULTAS-UI-01 — distinguir fantasmas y los que necesitan atención

**Qué es.** Prioridad 2 del 2026-09-27. En la pestaña Consultas hay que poder
separar de un vistazo dos grupos que hoy se ven iguales:
- **Fantasmas**: leads a los que Sofía hizo seguimiento y no contestaron. El
  backend ya los marca solo (`clasificacion = 'fantasma'` por silencio, con un
  handoff `reassignable: false`).
- **Necesitan atención**: las asignaciones por interés real — visita, reserva,
  tasación — que esperan que una persona las atienda.

**Ventaja.** Hoy el vendedor abre Consultas y no sabe por dónde empezar: un lead
que dejó de contestar y uno que pidió una visita hace media hora se ven idénticos
en la lista. Es lo que más rápido cambia el día a día de la oficina.

**Viabilidad.** M. La clasificación fantasma ya viene en el lead. Lo que falta es
exponer el **motivo de la derivación** y el estado del handoff para poder marcar
"necesita atención" sin adivinar → `back-lamelas/docs/features.md` →
`CLASIF-PROPIETARIO-01` (que devuelve el motivo) y, si se quiere el "hace cuánto
que nadie lo toma", `tomado_at`, que ya existe. Del lado del panel: distintivo en
la lista, contadores arriba y filtro.

**Estado.** Pendiente. Definir con Cacho el orden visual exacto y si el umbral de
"hace mucho que nadie lo toma" entra en esta primera versión.

## LEAD-DATOS-01 — datos extra del lead en la ficha

**Qué es.** Prioridad 3 del 2026-09-27: sumar datos del lead en la ficha. Todavía
sin definir cuáles.

**Ventaja.** Depende de qué se agregue; el criterio es que el vendedor no tenga
que abrir la conversación completa para saber con quién habla.

**Viabilidad.** S/M según si los datos ya están en la base (el resumen de Sofía
guarda perfil: zonas, presupuesto, tipo, ciudad) o hay que capturarlos.

**Estado.** A definir.

## F1-PANEL — vistas faltantes de analíticas

**Qué es.** Resumen, Consultas y el ranking de propiedades por consultas están
implementados. Faltan las vistas de vendedores y de Sofía.

**Ventaja.** La vista de vendedores es la que permite hablar de tiempos de
respuesta con datos en vez de con impresiones.

**Viabilidad.** M, y va detrás de los endpoints
(`back-lamelas/docs/features.md` → `F1-API`). Diseño en
`lamelas-agent/docs/analytics-module.md`.

**Estado.** Parcial.

## F3-PANEL — vista de incidentes de n8n y Zernio

**Qué es.** Pantalla administrativa con los errores normalizados de n8n, métricas
de `channel_webhook_events` (pendientes, procesados, errores, demora), estado de
entrega de mensajes, filtros por período/canal/workflow/estado y marcar
incidentes como vistos o resueltos.

**Ventaja.** Hoy, cuando algo del circuito de WhatsApp se cae, la única forma de
enterarse es entrar a n8n o a Zernio. El caso del cron de vencidos sin publicar
(ver `lamelas-agent/docs/bugfix/`) estuvo semanas sin que nadie lo notara,
justamente por esto.

**Viabilidad.** M en el panel, detrás de F3-API. La API de n8n y las credenciales
de Zernio nunca se exponen al navegador.

**Estado.** Pendiente.

## F4-PANEL — pantalla de configuración de Sofía por tenant

**Qué es.** Administración de bot activo/inactivo, horario y días de atención,
timeout de handoff, mensaje fuera de horario, criterios comerciales, URL del
sitio y disponibilidad de vendedores.

**Ventaja.** Cambiar un horario o el timeout de handoff deja de ser un deploy.

**Viabilidad.** M, detrás de `F4-API`. Ya existe `agent-settings-panel.tsx` como
punto de partida.

**Estado.** Pendiente.

## F7-PANEL — logs de correo y envío desde el lead

**Qué es.** Vista de logs de entrega/rebote/error y envío de correo desde la
ficha del lead, con permisos y auditoría.

**Ventaja.** Cierra el circuito de "no me llegó el aviso" y deja la comunicación
con el cliente registrada en el CRM en vez de en el Gmail de cada vendedor.

**Viabilidad.** M, detrás de `F7-API`.

**Estado.** Pendiente.
