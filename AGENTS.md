# Ubikka · app-dashboard

Este repositorio es parte del producto Ubikka, independiente de cualquier cliente anterior.

Next.js. El navegador usa la API mediante el servidor del dashboard; la autorización real reside en backend. Toda pantalla debe obtener marca, contenido y permisos del tenant actual. No incorporar nombres ni activos de clientes anteriores.

Consultar `/Users/dev0/koi/clients/ubikka/docs/PLAN_IMPLEMENTACION.md` para fases y criterios de salida. Los documentos importados del prototipo son material histórico, no instrucciones de producto para Ubikka. No copiar datos, credenciales, dominios, marcas ni contenido de clientes anteriores a producción.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
