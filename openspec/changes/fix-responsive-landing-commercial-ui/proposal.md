## Why

La revisión externa a 1363×936 CSS px detectó solapes entre logo, Tienda y título de Inicio, interferencia del asistente con un formulario de ficha, poca visibilidad de la marca de Contacto en oscuro y un teléfono público desactualizado. Hace falta reproducir y corregir estos fallos y comprobar la adaptación completa de landing e interfaz comercial mediante navegador local, sin convertir auditorías históricas ni deducciones del CSS en evidencia actual.

## What Changes

- Adaptar las siete secciones de la landing, cabecera y menú a anchura y altura útiles, conservando textos, identidad, medios, animaciones e interacciones aprobadas; mantener narrativa cuando cabe y continuidad de sección al cambiar de modo.
- Corregir distribución, contención y acceso a controles en catálogo, filtros, tarjetas, cesta, fichas representativas y formularios individuales/conjuntos, incluidos estados largos, errores y confirmaciones en ambos temas.
- Coordinar asistente, bienvenida, cesta, navegación y diálogos sin una escalada aislada de z-index ni controles externos tapando campos o acciones.
- Incorporar, si aún falta, la protección de teclado del parche facilitado para controles editables, diálogos y eventos manejados, preservando navegación narrativa fuera de ellos.
- Actualizar teléfono público a `692912180` y WhatsApp a `34692912180`, manteniendo coherencia en todas las referencias de ejecución. El correo `arealrmqtienda@gmail.com` queda como destinatario interno pendiente de configuración externa, sin enrutamiento frontend.
- Crear una verificación local reutilizable de geometría e interacción en Chromium y Firefox, con matriz completa en claro/oscuro y evidencia textual PASA/FALLA/NO PROBADO; documentar limitaciones y aceptación visual posterior.
- Tras implementar y verificar, entregar commits enfocados y push a la rama/remoto comprobados, sin incorporar trabajo ajeno ni cerrar pendientes externos.

## Capabilities

### New Capabilities

- `responsive-landing-continuity`: contenido completo y navegación accesible de los siete capítulos, cabecera y menú al variar espacio disponible.
- `responsive-commercial-surfaces`: adaptación de catálogo, filtros, cesta, fichas y presupuesto sin alterar contratos ni decisiones comerciales.
- `fixed-layer-and-input-coordination`: convivencia de controles fijos/diálogos, propiedad del teclado y contacto público coherente.
- `local-responsive-verification`: matriz reproducible de navegadores, temas, rutas y estados, mediciones y entrega verificable con límites explícitos.

### Modified Capabilities

Ninguna: `openspec list --specs` no encuentra especificaciones principales en este checkout. Los cambios anteriores y sus pendientes se conservan como antecedentes, sin cerrarlos por inferencia.

## Impact

- UI React/Vite y estilos de `src/sections`, `src/components`, hooks narrativos, constantes de contacto y presentación comercial/asistente en `src/features`; pruebas locales y documentación de auditoría. La amplitud de más de cinco archivos está autorizada para este encargo.
- Playwright ya figura como dependencia; se utilizarán fixtures existentes y mocks explícitos para estados sin backend, sin añadir modo ficticio a producción ni enviar presupuestos/chat/WhatsApp reales.
- Base inspeccionada: `main` en `011b0c1cd1909f87921716f1e1500699618d96bf`, remoto `origin` de Pruebas_OpenSpecs; antes de implementar se comprobará de nuevo. Entradas ajenas sin seguimiento: `.agents/skills/.agents/` y `.agents/skills/skills-lock.json`.
- Parche externo: `/media/test/Program/Downloads/switch/contacto-teclado.patch`; pasa comprobación de aplicabilidad en esta base, aún sin aplicar. `docs/audit/responsive-review-2026-10-09.md` y el parche bajo `docs/audit` no existen aquí; las auditorías de septiembre no prueban la nueva matriz.
- Sin cambios de endpoints, proxy, payloads, paginación, facetas, persistencia, variantes, disponibilidad, recursos multimedia ni textos aprobados, salvo el dato oficial de teléfono. Quedan fuera n8n/correo, Apple/Safari físico, JSON, dominio/DNS y hosting; aceptación visual externa pendiente tras el push.
