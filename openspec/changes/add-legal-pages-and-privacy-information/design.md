## Context

Ver proposal.md para motivación. Vite/React con rutas lazy y applyRouteMeta; Vercel tiene rewrites específicos. HEAD inicial de aplicación b92eedc incluye SEO y el parche transitorio. Un agente paralelo ajusta geometría de portátil; no editar estilos globales ni lógica de escala. El flujo externo transitorio es evidencia del propietario y del cambio remove-quote-storage, no verificación MCP nueva.

## Goals / Non-Goals

**Goals:** capa legal reutilizable, información por capas, enlaces sin pérdida de estado y revisión local con trazabilidad.

**Non-Goals:** modificar backend, almacenamiento, medios, arquitectura, pagos, navegación comercial o realizar publicación. No convertir documentación pública de proveedores en prueba de acuerdos del cliente.

## Decisions

- Un módulo legal centraliza sociedad, contacto, resúmenes y contenido; una página compartida renderiza tres variantes. Carga lazy, estilos mediante tokens existentes y sin CSS global. Evita tres páginas duplicadas.
- Enlaces de privacidad usan target=_blank con noopener/noreferrer y aviso visible de nueva pestaña; evitan serializar datos de contacto para conservar el borrador.
- Presupuestos: propuesta art. 6.1.b RGPD, solicitud y seguimiento individual; mantener consentPrivacy por compatibilidad, expresar reconocimiento de información. Consultas generales/chat y seguridad: propuesta de interés legítimo art. 6.1.f, pendiente de ponderación interna, sin invocar consentimiento genérico.
- No prometer conservación aprobada: describir la práctica empresarial real (sin borrado programado) en el borrador local y registrar que no resuelve art. 5/13 RGPD. Chat: solo hechos acreditados, sin nombre IA ni plazo inventados; falta de identificación/retención sigue bloqueando aprobación.
- Enlaces legales de Contacto se añaden al componente compartido del formulario al final, evitando tocar ambos layouts que revisa el otro agente. Catálogo usa su masthead; cesta y ficha sus superficies existentes.
- Reusar applyRouteMeta para title, description, canonical y robots. Para metadatos sociales usar efecto local con restauración en la página legal; no cambiar index.html ni el helper compartido. noindex,follow por decisión editorial; fuera de sitemap, sin Disallow legal. Limitación HTML inicial SPA explícita, sin migración SEO.
- Inventario previo runtime determina banner. Sin tecnologías no exentas observadas no añadirlo; ante evidencia concreta de no exentas documentar bloqueo previo como trabajo sujeto a alcance, sin banner decorativo.
- Las tres frases que afirman arquitectura directa se aclaran de forma puntual; no reescribir texto comercial adyacente.

## Risks / Trade-offs

- [Faltan registro, retención y detalle IA] → borrador local con datos confirmados, informe interno y tareas de aprobación abiertas; no deploy.
- [Trabajo concurrente] → releer inmediatamente antes de parchear; aplicar hunks mínimos sin restauraciones amplias; detenerse ante conflictos.
- [Metadatos SPA no visibles sin JS] → documentar límite actual; verificar DOM y restauración, sin vender esto como prerender.
- [Recursos externos/logs no equivalen a cookies] → separar red, almacenamiento navegador y retención de servidor; no extrapolar captura local a producción.

## Migration Plan

Solo revisión local. Propietario decide commit/push/publicación tras resolver pendientes. Una retirada futura sería por hunks específicos del cambio legal, preservando el trabajo concurrente y sin recrear datos retirados.

## Open Questions

Respuesta de gestoría prevista para 15/10/2026; proveedor/modelo IA, retención real y contratos efectivos requieren evidencia antes de aprobar/publicar el texto, no impiden construir la revisión local autorizada.
