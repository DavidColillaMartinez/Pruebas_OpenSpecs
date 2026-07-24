## 1. Fase 0 — Desbloqueo de contrato n8n

- [x] 1.1 Verificar el upstream n8n actualizado: `GET /webhook/35f1a0c4-e2e1-443d-8390-56f0027d0742/lrmq/catalog/products/:slug` devuelve `200` para ambos slugs publicables verificados.
- [x] 1.2 Verificar y filtrar en la capa de aplicación los campos técnicos presentes en la respuesta real (`source_page`, `component_refs`, `search_text`, `quality_status`) para que nunca se expongan al usuario.
- [x] 1.3 Verificar `PRODUCT_NOT_FOUND`, CORS y `Cache-Control: public, max-age=60, stale-while-revalidate=300` en el upstream de detalle; documentar que n8n conserva HTTP `200` y el proxy público lo normaliza a `404`.
- [x] 1.4 Confirmar por inspección externa el contrato de `POST /catalog/quote-requests` para `201`, `400 VALIDATION_ERROR` y `429 RATE_LIMITED`; las pruebas interceptan el POST y no se envía ninguna solicitud real.
- [ ] 1.5 PENDIENTE DE CONFIRMACIÓN DEL PROPIETARIO: documentar la URL pública de privacidad y el proveedor de hosting real; Vercel queda solo como preparación técnica.
- [x] 1.6 Consultar ambos slugs desde la aplicación, guardar respuestas anonimizadas como fixtures de test e inventariar las claves reales de producto, variantes, ofertas, imágenes y documentos.

## 2. Fase 1 — Tooling y estructura base

- [x] 2.1 Elegir y documentar npm como package manager del cambio, fijar una versión de Node compatible con Vite 8 y evitar regenerar el lockfile alternativo.
- [x] 2.2 Añadir `react-router-dom`, TypeScript incremental, tipos React, Vitest, Testing Library y las dependencias mínimas de test acordadas.
- [x] 2.3 Crear `tsconfig` incremental que permita nuevos módulos TS/TSX sin exigir migrar la landing existente.
- [x] 2.4 Añadir scripts reproducibles `lint`, `typecheck`, `test` y mantener `build`; configurar ESLint para detectar imports y estados muertos sin reformatear todo el proyecto.
- [x] 2.5 Crear la estructura `src/features/catalog/{api,model,components,pages}` y `src/features/quote/{api,model,components}` sin lógica visual monolítica.
- [x] 2.6 Implementar el proxy local de Vite y la API route server-side `api/catalog/[...path].js` para reenviar rutas públicas relativas al upstream privado configurado.
- [x] 2.7 Crear `.env.example` y `vercel.json` documentando la variable server-side y el rewrite SPA sin exponer el webhook en el cliente.

## 3. Fase 2 — Configuración y cliente API

- [x] 3.1 Crear configuración server-side para las variables `N8N_CATALOG_*_UPSTREAM_BASE_URL` y configuración frontend fija relativa a `/api/catalog`, con timeout y rutas `/config`, `/products` y `/quote-requests`.
- [x] 3.2 Implementar un cliente HTTP cancelable con `AbortController`, parseo JSON seguro y descarte de respuestas obsoletas.
- [x] 3.3 Implementar errores discriminados para not-found, validación, rate limit, red, timeout, servidor y contrato inválido.
- [x] 3.4 Definir `CatalogPublicConfig`, `ProductListResponse`, `ProductCard`, `ProductDetail` y tipos relacionados exclusivamente desde config/listado y el fixture real de detalle.
- [x] 3.5 Implementar type guards y normalización central para identidad mínima, arrays opcionales, nulls y campos públicos confirmados.
- [x] 3.6 Implementar resolución de assets que preserve URLs absolutas y combine rutas relativas solo con `asset_base_url`.
- [x] 3.7 Implementar `getCatalogConfig`, `getProducts`, `getProductBySlug` y `createQuoteRequest` fuera de componentes visuales, siempre contra `/api/catalog/...`.
- [x] 3.8 Añadir tests de `200`, `404`, `400`, `429`, `5xx`, red, timeout, JSON inválido, contrato inválido, arrays ausentes y resolución de URLs.

## 4. Fase 3 — Routing y shell de aplicación

- [x] 4.1 Extraer la landing actual a `LandingPage` para que `useNarrativeScroll` solo se monte en `/`.
- [x] 4.2 Montar React Router con rutas `/`, `/productos`, `/productos/:slug` y fallback `*`.
- [x] 4.3 Crear un layout de rutas de catálogo con scroll nativo, logo, navegación al inicio y retorno al catálogo, sin reutilizar el scroll-jacking desktop.
- [x] 4.4 Adaptar `Header` y `MobileDrawer` para distinguir anchors de landing y navegación real a `/productos`.
- [x] 4.5 Implementar la API route/proxy server-side `/api/catalog/[...path]` con el upstream en entorno privado y documentar el rewrite SPA del hosting para recargar `/productos/:slug`.
- [x] 4.6 Implementar la página mínima `/productos` con carga, error recuperable, retry y enlaces por slug provenientes del endpoint público.
- [x] 4.7 Añadir tests de navegación desde listado, acceso directo, recarga simulada, back/forward simulado y ruta no encontrada.

## 5. Fase 4 — Control de estados y contenido de la ficha

- [x] 5.1 Implementar el hook/controlador de detalle con estados `loading`, `success`, `not-found` y `error`, diferenciando `contract`, `network`, `timeout` y `server`.
- [x] 5.2 Implementar estados visibles y anunciados para carga inicial, `404`, contrato inválido y error recuperable con retry.
- [x] 5.3 Crear componentes de presentación para identidad, clasificación, descripción, características, atributos, medidas, acabados, oferta y documentos.
- [x] 5.4 Renderizar únicamente secciones con contenido público confirmado, sin nulls, objetos serializados, IDs técnicos innecesarios ni campos internos.
- [x] 5.5 Implementar los estados de producto sin variantes, con variante única y con múltiples variantes sin bloquear la acción de presupuesto válida.
- [x] 5.6 Actualizar y restaurar `document.title` y meta description usando únicamente datos públicos y fallbacks documentados.
- [x] 5.7 Añadir tests de carga, éxito, campos opcionales ausentes, documentos ausentes, `404`, red, `5xx` y contrato inválido.

## 6. Fase 5 — Selección de variantes y ofertas

- [x] 6.1 Adaptar variantes, ofertas y variantes comerciales reales a una unidad seleccionable con IDs persistentes y atributos públicos.
- [x] 6.2 Implementar selección inicial: única opción, default confirmado o primera unidad publicable completa en orden de API.
- [x] 6.3 Crear controles accesibles que deriven opciones de unidades reales y no generen producto cartesiano.
- [x] 6.4 Calcular compatibilidad de selecciones parciales y eliminar valores sin una unidad real compatible.
- [x] 6.5 Actualizar referencia, atributos, medidas, acabado, información comercial e imágenes solo cuando el contrato los asocie con la selección.
- [x] 6.6 Construir `variant_snapshot` mínimo con valores visibles, omitiendo conceptos ausentes y el objeto de API completo.
- [x] 6.7 Añadir tests de variante única, default, fallback, combinaciones imposibles, cambio de datos, IDs persistentes y snapshot.

## 7. Fase 6 — Galería de producto

- [x] 7.1 Implementar normalización y deduplicación estable de imágenes por URL pública resuelta.
- [x] 7.2 Implementar prioridad de imágenes de variante si el contrato las aporta y fallback a imágenes generales cuando no existan; la respuesta verificada no aporta imágenes propias de variante.
- [x] 7.3 Elegir imagen principal de forma determinista y mantener una imagen activa válida tras cambiar de variante.
- [x] 7.4 Crear controles de galería con botones nativos, estado seleccionado y operación por teclado.
- [x] 7.5 Añadir fallback local/semántico para productos sin imágenes y errores `onError` de imagen.
- [x] 7.6 Generar alt text desde nombre, contexto de variante y posición sin IDs técnicos.
- [x] 7.7 Añadir tests de imágenes vacías, duplicadas, URLs inválidas, variante sin imágenes propias, cambio de activa y fallo de carga.

## 8. Fase 7 — Solicitud de presupuesto

- [x] 8.1 Definir `QuoteRequestPayload`, `QuoteRequestItem`, `QuoteRequestCreated`, `QuoteValidationError` y límites canónicos.
- [x] 8.2 Implementar el constructor puro del artículo con producto, selección actual, cantidad y `variant_snapshot`.
- [x] 8.3 Crear el formulario con nombre, teléfono, email, tipo de reforma cuando se confirme, mensaje, cantidad, consentimiento y honeypot.
- [x] 8.4 Mostrar antes del envío el producto y configuración que se incluirán, actualizándolos si cambia la selección.
- [x] 8.5 Validar nombre, al menos email o teléfono, consentimiento, cantidades, longitudes, patrón de IDs y tamaño serializado máximo.
- [x] 8.6 Enviar `sourcePage` como pathname público actual y mantener `website` vacío sin PII en URL, storage, analytics o logs.
- [x] 8.7 Bloquear doble envío y comunicar accesiblemente el estado pendiente.
- [x] 8.8 Gestionar `201` con confirmación y limpieza posterior; gestionar `400` con asociación de campos y conservación de valores.
- [x] 8.9 Gestionar `429` con mensaje del servidor y conservación de valores; gestionar red, timeout y `5xx` con retry.
- [ ] 8.10 PENDIENTE DE CONFIRMACIÓN DEL PROPIETARIO: gestionar foco en errores y confirmación, asociar mensajes a controles y enlazar la política de privacidad confirmada.
- [x] 8.11 Añadir tests del payload exacto, límites, honeypot, doble envío, `201`, `400`, `429`, red y `5xx` usando mocks sin POST real.

## 9. Fase 8 — Accesibilidad, responsive y robustez

- [x] 9.1 Verificar un único `h1`, jerarquía de encabezados, landmarks y nombres accesibles en listado y ficha.
- [x] 9.2 Verificar teclado, foco visible, `aria-live`, asociación de errores y retorno de foco en todos los controles nuevos.
- [x] 9.3 Implementar estilos funcionales mínimos para móvil y escritorio sin horizontal overflow ni cierre de dirección visual.
- [x] 9.4 Verificar que el producto usa scroll nativo y que los listeners/RAF narrativos no se montan fuera de `/`.
- [x] 9.5 Revisar enlaces externos, contenido tratado como texto, ausencia de `dangerouslySetInnerHTML`, encoding de slug y mensajes seguros.
- [x] 9.6 Confirmar que ningún dato interno, coste, margen, fuente, estado de importación o PII aparece en UI, logs o fixtures.

## 10. Fase 9 — Matriz de estados y aceptación

- [x] 10.1 Verificar los estados 1–6: carga inicial, producto cargado, sin variantes, variante única, múltiples variantes y variante sin imágenes propias.
- [x] 10.2 Verificar los estados 7–13: sin imágenes, opcionales ausentes, documentos ausentes, `404`, red, `5xx` y contrato inválido.
- [x] 10.3 Verificar los estados 14–18: envío pendiente, creado, `400`, `429` y red durante presupuesto.
- [x] 10.4 Ejecutar tests unitarios/integración sin presupuestos reales y completar E2E si se incorpora Playwright.
- [x] 10.5 Ejecutar `npm run lint`, `npm run typecheck`, `npm test` y `npm run build` sin errores.
- [ ] 10.6 PENDIENTE DE CONFIRMACIÓN DEL PROPIETARIO: verificar manualmente listado → detalle, URL copiada, recarga directa, retry, móvil, escritorio y teclado en preview con n8n real y hosting definitivo.
- [ ] 10.7 PENDIENTE DE CONFIRMACIÓN DEL PROPIETARIO: revisar cada criterio de aceptación del documento y registrar evidencia o un bloqueo explícito; no cerrar el cambio con mocks o estados pendientes.

## 11. Fase 10 — Documentación y entrega

- [x] 11.1 Documentar ruta implementada, archivos creados/modificados, configuración de URL base y rewrite de hosting; el proveedor real sigue pendiente.
- [x] 11.2 Documentar la respuesta real usada para `ProductDetail`, mapeo de campos, criterio de selección y resolución de imágenes.
- [x] 11.3 Documentar el payload real de presupuesto, validaciones, respuestas y garantías de privacidad; la URL pública y el enlace de consentimiento siguen pendientes.
- [x] 11.4 Documentar comandos ejecutados, matriz de estados, limitaciones y diferencias entre documento, repositorio y API.
- [ ] 11.5 PENDIENTE DE CONFIRMACIÓN DEL PROPIETARIO: confirmar que la tarea no se declara terminada hasta que detalle y presupuesto funcionen contra n8n y todos los criterios estén cubiertos.
