# Auditoría de ejecución 2026-09-08 — abierta

## Alcance y estado

Despliegue actual indicado por el propietario: https://pruebas-open-specs-lmqzta979-davids-projects-28cb6a13.vercel.app/
Commit publicado: 93538c5. La URL anterior lxlrbqfno corresponde a otro despliegue; sus resultados no validan el actual.
No se declara finalizada la auditoría ni resuelto el timeout.

## Evidencia recogida

- Se recorrieron las 8 páginas del listado y las 188 fichas mediante GET secuenciales con parámetro audit único. Las 196 respuestas fueron HTTP 200, x-vercel-cache MISS, age 0; máximo 1120 ms.
- Esta prueba elimina aciertos de caché HTTP, pero mantiene activo el backend. NO demuestra un arranque en frío de Neon, n8n o la función Vercel.
- En navegador, /productos mostró 24 de 188 productos. No se han validado todas las interacciones, imágenes, variantes ni tamaños de pantalla.
- Un POST técnico válido de presupuesto devolvió CATALOG_UPSTREAM_TIMEOUT, HTTP 502, a los 3,294 s. No se repitió automáticamente. No existe confirmación de creación del presupuesto.
- items:[null] devolvía HTTP 200 vacío. Se corrigió la validación del nodo n8n para rechazar cuerpos y artículos que no sean objetos. Verificado después: HTTP 400 con VALIDATION_ERROR.
- Workflow de presupuesto activo tras esa corrección: c5af8a6b-e41b-4a11-a8fe-3b340fc43593. Versión anterior: 7dd5976d-6f11-4c74-9fb1-ada050898bc1. Copia temporal: /tmp/lrmq-quote-workflow-before-audit.json (no contiene secretos de credenciales; no sustituye un backup permanente del servidor).
- DNS autoritativo coherente en sus tres servidores: n8n resuelve al VPS; sin AAAA observado.
- El panel del despliegue Vercel requiere login. Falta consultar registros de la función fallida; la causa concreta de la conexión aún NO está demostrada.

## Correcciones locales preparadas

- Rewrite /presupuesto a index.html.
- Restaurar timeout de POST a 10 segundos: 93538c5 lo redujo accidentalmente a 3. Los POST siguen sin reintentos automáticos.
- Pruebas focalizadas del proxy: 12 correctas. Estos cambios locales no están desplegados.

## Hallazgos pendientes

- Antispam backend limitado por email/teléfono durante 2 minutos; permite variar contactos y no serializa solicitudes concurrentes. No equivale a protección robusta por origen/IP ni CAPTCHA.
- Selecciones compactas Duplach se aceptan por prefijo de producto y snapshot no vacío; falta demostrar validación server-side de cada combinación contra opciones reales.
- El workflow guarda presupuestos, pero no contiene nodo de aviso al negocio. Falta verificar recepción comercial con el propietario.
- Formularios solicitan aceptación de privacidad sin enlace visible al documento en los componentes revisados.
- Contacto abre WhatsApp con texto codificado; no envía un mensaje por sí mismo. Falta prueba interactiva completa y límites de longitud.
- npm audit --omit=dev notificó nanoid, postcss, react-router y react-router-dom. Evaluar alcance: el aviso de Router se refiere a RSC y la web usa BrowserRouter; PostCSS es tooling. No se ha demostrado explotación en esta aplicación ni se han actualizado los locks.
- Quedan pruebas tras inactividad, todos los filtros/selecciones, cesta completa, envío exitoso y rechazo por spam, navegación desktop/mobile, Vision, vídeos, assets y enlaces.

## Siguiente paso prioritario

Acceder a los logs del despliegue 38jQa2cDb8P9i99xrj5t5dmMe4XS y correlacionar el POST fallido y los GET lentos con n8n. No aumentar/reducir tiempos ni añadir más reintentos como sustituto de identificar el error. Repetir después pruebas con caché MISS y tras inactividad, y finalmente la verificación funcional completa.

## Addendum 2026-09-09 — acceso a Vercel y petición correlacionada

- Acceso al panel autenticado confirmado. El conector MCP sigue respondiendo 403; se usa el navegador. El panel confirma producción, main, 93538c5. Los rangos históricos amplios requieren otro plan; no se ha cambiado el plan.
- GET de listado a las 23:33:18 UTC del 8 de septiembre (01:33:18 CEST del día 9), request ID qhchb-1788910398194-aff78b238068: HTTP 200, 6,186 s de cliente. Vercel: entrada cdg1, función iad1, ejecución 5,41 s y dos llamadas GET externas a n8n. No hay registros propios que identifiquen el error del primer intento. DEP0169 es una advertencia de url.parse, no prueba de la causa del timeout.
- n8n: ejecución 2822 de 23:33:21.258 a 23:33:22.877 (1,619 s); ejecución 2823 de 23:33:23.755 a 23:33:23.963 (0,208 s), ambas correctas. Los dos intentos llegaron al backend. El límite de 3 s de cada intento incluye conexión y respuesta, no solo ejecución n8n.
- Segunda lectura HTTP 200 en 1,351 s. Primer acceso tras el intervalo sin pruebas, pero NO hay prueba de suspensión previa de Neon ni garantía de instancia Vercel nueva. No etiquetar como arranque en frío verificado de todas las capas.
- Instrumentación local añadida: identificador aleatorio por petición, ruta lógica, método, intento, tiempo hasta cabeceras y cuerpo, estado HTTP, fase y código de error acotado. No registra URLs, consultas, cuerpos, mensajes de excepción ni stacks.
- Lectura del cuerpo incluida en la unidad de reintento GET; POST nunca se reintenta, tampoco si falla al recibir el cuerpo. Tests de regresión y de ausencia de datos privados añadidos. El timeout GET no se ha cambiado de nuevo.
- Falta desplegar estos cambios y correlacionar un nuevo acceso lento con el error concreto registrado. La auditoría integral sigue abierta; no se ha hecho push ni deploy.
- Verificación local final: 280/280 tests, lint, typecheck y build correctos. No sustituye la validación del nuevo código desplegado.
