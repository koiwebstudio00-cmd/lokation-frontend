# Ubikka · app-dashboard

Dashboard de inmobiliarias de Ubikka. Este repositorio Git local se creó a partir del estado de trabajo de un prototipo técnico y no tiene remoto configurado.

Next.js. El navegador usa la API mediante el servidor del dashboard; la autorización real reside en backend. Toda pantalla debe obtener marca, contenido y permisos del tenant actual. No incorporar nombres ni activos de clientes anteriores.

El documento [README.legacy.md](README.legacy.md) y los documentos importados describen el prototipo original y se conservan solo como referencia técnica. Plan vigente: [PLAN_IMPLEMENTACION.md](../docs/PLAN_IMPLEMENTACION.md).

## Login con Google y 2FA por etapas

Ver [configuración y pruebas](../docs/LOGIN_GOOGLE_2FA.md). Google usa Better Auth; las sesiones y los permisos de Ubikka continúan en el backend.
