# Ubikka · app-dashboard

Dashboard de inmobiliarias de Ubikka. Este repositorio Git local se creó a partir del estado de trabajo de un prototipo técnico y no tiene remoto configurado.

Next.js. El navegador usa la API mediante el servidor del dashboard; la autorización real reside en backend. Toda pantalla debe obtener marca, contenido y permisos del tenant actual. No incorporar nombres ni activos de clientes anteriores.

El documento [README.legacy.md](README.legacy.md) y los documentos importados describen el prototipo original y se conservan solo como referencia técnica. Plan vigente: [PLAN_IMPLEMENTACION.md](../docs/PLAN_IMPLEMENTACION.md).

## Login con Google y 2FA por etapas

Ver [configuración y pruebas](../docs/LOGIN_GOOGLE_2FA.md). Google usa Better Auth; las sesiones y los permisos de Ubikka continúan en el backend.

## Interfaz y navegación · 2026-10-01

- shadcn/ui con Radix, sidebar basado en `sidebar-07` y superficies redondeadas.
- Tema tweakcn `cmn4wp9hz000104lbgtucaj5m`; tokens en `src/app/globals.css`. Noto Sans JP se sirve desde `@fontsource-variable/noto-sans-jp`.
- Claro, oscuro y sistema desde el botón **Cambiar tema** a la derecha del navbar. Preferencia local `ubikka-dashboard-theme`.
- **Mi cuenta** contiene Mi perfil y Cerrar sesión. El desplegable se abre encima del botón. Los submenús contraídos usan DropdownMenu.
- El wrapper compartido de DropdownMenu activa por `click`, evita doble alternancia por `pointerdown` y conserva los eventos de teclado, foco y cierre de Radix.

El usuario reportó que los menús no abrían en su navegador. Se hicieron verificaciones en el navegador integrado y Chrome, pero la confirmación final de ambos menús en la sesión afectada está **pendiente**. Los cambios de posición y tooltip anteriores no bastaron para cerrar el incidente.

## Mejoras funcionales incorporadas

Analíticas con pestañas, comparación entre períodos, métricas del agente e inventario, distribución horaria y demanda por zona. `/analiticas/reporte?mes=AAAA-MM` muestra un reporte de la inmobiliaria actual; **Guardar como PDF** usa la impresión del navegador.

Consultas distingue fantasmas y derivaciones pendientes; el filtro **Necesita atención** consulta al backend. Propiedades incorpora **Punto de referencia**, filtro de zona sin completar y sugerencias de ciudad/zona del inventario propio. Se permite ingresar ubicaciones nuevas libremente.

## Preparación y comprobación local

1. En `backend`, ejecutar `npm run db:generate` y `npm run db:migrate:deploy`; levantar el backend y PostgreSQL.
2. En este repo, `npm install` y `npm run dev` (puerto 3000).
3. Revisar inicio, propiedades, consultas y analíticas; abrir el reporte mensual.
4. Probar cuenta y tema con mouse, teclado y móvil; comprobar Escape, navegación al perfil y cierre de sesión.
5. Ejecutar `npm run lint` y `npm run build`.

El build/lint pasaron durante la integración del tema y las mejoras. El último ajuste de activación de menús requiere la confirmación indicada arriba. No se modificaron los repositorios fuente de Lamelas.
