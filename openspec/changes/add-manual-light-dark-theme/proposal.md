## Why

El propietario quiere un modo oscuro adicional sin perder el diseño claro desarrollado ni el funcionamiento actual. El tema debe ser una elección manual que cambie solo la presentación, manteniendo conversación, borradores, navegación y selecciones.

## What Changes

- Tercera etapa, después de `refine-web-usability-accessibility`, usando como referencia su estado claro revisado y sin bloqueos críticos de las etapas anteriores.
- Añadir un selector manual de dos estados: claro predeterminado sin preferencia guardada y oscuro opcional. No activar oscuro por `prefers-color-scheme`.
- Persistir la elección en una clave propia, con recuperación segura si el almacenamiento no funciona; aplicar la preferencia antes del primer pintado respetando la CSP existente.
- Colocar el control móvil inmediatamente antes de `Tienda`; en PC integrarlo en la cabecera. Proporcionar acceso consistente en las demás rutas sin añadir nuevos elementos de navegación comercial.
- Introducir roles de color compatibles con Tailwind y sus opacidades, preservando el claro byte a byte cuando sea posible; no invertir globalmente `ink`/`white` sin distinguir texto, botones, fotografía y superficies de marca.
- Adaptar chat, bienvenida, menús, filtros, fichas, presupuesto, estados y 404 al oscuro sin remontar providers ni modificar transporte, datos o medios.
- Validar ambos temas en móvil y PC y entregar el informe final de la secuencia, manteniendo explícitos los límites de la auditoría externa.

## Capabilities

### New Capabilities

- `manual-color-preference`: Selector accesible, claro predeterminado, persistencia y aplicación temprana del tema.
- `state-preserving-themed-surfaces`: Apariencia oscura coherente por rol sin regresiones del modo claro ni pérdida de estado.
- `final-web-release-evidence`: Validación integrada de temas, recorridos, SEO, seguridad y responsive de la secuencia.

### Modified Capabilities

Ninguna al crear la propuesta. Revisar las especificaciones principales al aplicar si las etapas anteriores se han archivado.

## Impact

- Posibles archivos de tokens/configuración Tailwind, inicialización del tema, header/controles por ruta, estilos y componentes afectados; evitar cambios masivos de clases y nuevos providers acoplados al estado comercial.
- No modificar APIs, proxy, rutas funcionales, n8n, cotizaciones, media, `CompareSlider` ni secciones Vision por este cambio de tema. Las zonas protegidas pueden conservar superficies de marca claras dentro del oscuro si es necesario para no alterarlas.
- No filtros de inversión sobre la página o imágenes, ni reemplazo de logo, fotografías o vídeo. El comportamiento de blur acordado en la segunda etapa se conserva.
- Ningún commit, push o despliegue automático. No archivar ni declarar terminada la revisión sin evidencia suficiente de las tareas de aceptación.
