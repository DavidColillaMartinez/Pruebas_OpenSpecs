## Why

AREA LRMQ necesita que los buscadores reciban e interpreten correctamente la web existente para captar solicitudes de reformas en la Comunidad de Madrid; el catálogo es un apoyo comercial y no una tienda de venta online. El diseño y el contenido ya están aprobados por el cliente, pero la aplicación entrega un HTML inicial sin contenido de página y mantiene pendientes de renderizado, canonical, descubrimiento y estados HTTP.

## What Changes

- Mejorar exclusivamente el SEO técnico de las rutas actuales: `/`, `/productos`, `/productos/:slug`, `/presupuesto`, `/aviso-legal`, `/privacidad`, `/cookies` y sus estados de error.
- Entregar contenido público existente y metadatos específicos en la respuesta HTML inicial, con una solución de renderizado compatible con la apariencia, navegación e interacciones actuales. Resolver su viabilidad en una candidata aislada antes de extenderla a todas las rutas.
- Corregir coherencia entre metadatos iniciales y navegación cliente, canonical, directivas de indexación, barras finales, estados HTTP, robots, sitemap y datos estructurados veraces.
- Definir un descubrimiento mantenible de las fichas publicadas sin añadir pantallas, secciones, controles visibles o contenido comercial. Revisar el acceso del rastreador a los recursos necesarios para renderizar.
- Preparar una rama y worktree independientes con otro puerto local; comparar la candidata con una referencia fijada, con datos equivalentes y sin envíos reales accidentales.
- Exigir pruebas funcionales y revisión visual del propietario antes de integrar. Mantener separados los pendientes de Search Console y de comprobación publicada, sin inventar evidencia de indexación o aceptación.

## Capabilities

### New Capabilities

- `search-indexing-integrity`: Respuesta inicial y navegación coherentes para las páginas existentes, política de indexación y descubrimiento, y validación de paridad visual/funcional de la candidata antes de su integración.

### Modified Capabilities

Ninguna: `openspec list --specs` no encuentra especificaciones principales. Se reutiliza el nombre de capacidad del cambio pendiente `audit-harden-repo-seo-security` como antecedente, sin modificarlo ni asumir resueltos sus bloqueos.

## Impact

- Áreas previsiblemente afectadas durante implementación: entradas de renderizado/arranque, metadatos compartidos y por ruta, datos públicos iniciales del catálogo, build/servido de HTML, routing de páginas, `public/robots.txt`, sitemap, datos estructurados y pruebas. La lista exacta se documentará tras el estudio de viabilidad.
- Se preservan el diseño claro/oscuro, la portada narrativa, el móvil, las rutas y enlaces visibles actuales, los textos aprobados y los medios. No se crean páginas por servicio, municipio o sección, artículos, proyectos, textos ocultos SEO ni animaciones móviles nuevas.
- Ampliación expresamente aprobada durante implementación: portada con estructura única y adaptación CSS móvil. Inicio móvil adopta contenido/orden PC, con tarjetas apiladas e imagen vertical; sustituye su párrafo/CTA exclusivos. El resto comparte estructura conservando información móvil útil, asesoría, profesionales independientes y contratación separada. El PC conserva su presentación.
- Se preservan contratos, endpoints, payloads, validaciones, almacenamiento, caducidad/recordatorio de selección, chat y preparación de WhatsApp. El arranque compartido se considera un área de regresión que requiere comprobación, no una garantía automática de ausencia de fallos.
- No se modifica n8n, Neon, VPS, DNS, credenciales, variables externas ni paneles de proveedores. No se instala analítica ni se añaden tratamientos de datos. Una dependencia o cambio de renderizado debe justificarse; no se presupone migración de framework.
- Este paso crea solo planificación. La futura implementación no autoriza por sí sola integración en `main`, commit, push, despliegue, operaciones reales de contacto ni cambios en Perfil de Empresa/Search Console. Las confirmaciones requeridas quedan pendientes hasta evidencia expresa.
