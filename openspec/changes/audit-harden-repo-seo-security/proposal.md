## Why

AREA LRMQ necesita una revisión verificable de indexación, rutas y seguridad antes de las siguientes mejoras de interfaz. Los controles de inputs por sí solos no protegen una API pública ni permiten certificar la seguridad del sistema de IA externo.

## What Changes

- Primera etapa de la secuencia: `audit-harden-repo-seo-security` → `refine-web-usability-accessibility` → `add-manual-light-dark-theme`.
- Inventariar rutas, entradas de usuario, GET/POST, almacenamiento, renderizado y fronteras de confianza; corregir defectos reproducibles dentro del repositorio, priorizando los críticos.
- Revisar SEO de portada, catálogo, fichas, presupuesto y página no encontrada: HTML inicial/renderizado, metadatos, canonical, estados HTTP, robots, sitemap, paginación, filtros, enlaces y datos estructurados reales.
- Verificar el 404 por navegación interna y petición directa antes de cambiar reglas de alojamiento; evitar rewrites que creen soft 404 o intercepten APIs/assets.
- Revisar XSS, URLs, límites y esquemas de peticiones/respuestas, caché privada, abuso, dependencias, secretos y registros. Evaluar código o copias de workflows versionados solo como evidencia local, nunca como prueba de la configuración externa vigente.
- Conciliar pendientes anteriores con código, pruebas y la confirmación visual del propietario; no cerrar tareas técnicas, de privacidad o externas por inferencia.
- Generar un informe reproducible con severidad, evidencia, corrección y asuntos fuera de alcance; mantener contratos válidos de catálogo, chat y presupuesto.

## Capabilities

### New Capabilities

- `repo-audit-evidence`: Inventario, trazabilidad, priorización y conciliación de comprobaciones anteriores.
- `search-indexing-integrity`: SEO por ruta y comportamiento HTTP/indexación coherente, incluyendo 404 y productos inexistentes.
- `repo-request-response-security`: Validación y protección de datos desde navegador hasta los límites de las APIs versionadas.

### Modified Capabilities

Ninguna: no hay especificaciones principales en `openspec/specs/` al crear esta propuesta. Las propuestas pendientes antiguas se usan como contexto, no como especificaciones ya archivadas.

## Impact

- Posibles áreas: `src/routes/**`, metadatos en páginas, `src/features/**` para validación/renderizado, `api/**`, `server/**`, configuración de build/headers/rewrites versionada y tests.
- No se modifica n8n, Neon, VPS, el panel de Vercel, credenciales ni variables externas. No se ejecutan cargas, escáneres agresivos o envíos reales contra producción.
- El diseño claro, navegación, media y áreas protegidas se conservan. Un cambio de contrato, dependencia mayor o arquitectura de renderizado requiere justificarlo y actualizar el diseño antes de implementarlo.
- Entrega local sin commit, push, despliegue o archivo automático de cambios anteriores. Los bloqueos externos quedan identificados sin declarar seguridad absoluta.
