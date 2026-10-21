# Limpieza del repositorio — 21/10/2026

Se retiraron del estado actual backups de workflows, instrucciones operativas privadas, el SDK y los SQL del almacenamiento de presupuestos sustituido, matrices extensas de revisión, críticas antiguas, metadatos reproducibles de TypeScript y el lockfile npm redundante. Se mantiene pnpm-lock.yaml y se fija su instalador en Vercel.

El inventario completo de productos usado por el mock responsive se sustituyó por los cinco campos públicos necesarios de Akord en scripts/fixtures/akord.json. Las habilidades responsive se trasladaron desde el directorio anidado por error a .agents/skills/responsive-design sin cambiar su contenido. Se conservan herramientas de OpenCode y las tareas pendientes de OpenSpec.

Se resumió documentación y se retiraron referencias administrativas concretas. No se cambió código de la aplicación, medios, proxies, flujos vigentes ni los SQL 004/005. No se modificaron n8n, Neon, credenciales ni la visibilidad del repositorio.

Validación: 67 archivos de pruebas; 625 pruebas aprobadas y una omitida. Lint sin errores, con diez avisos existentes; typecheck y build correctos, incluido el renderizado SEO empaquetado. El mock responsive conserva seis productos, doce líneas de selección y dos variantes de Akord. Se comprobaron JSON, diferencias de espacios, estados de casillas y conservación de fuentes de producción. Estas comprobaciones no equivalen a una nueva revisión visual ni de servicios en producción.

Los archivos retirados siguen en el historial de Git y pueden existir en clones anteriores. No se ha reescrito el historial. La visibilidad privada la gestiona el propietario.
