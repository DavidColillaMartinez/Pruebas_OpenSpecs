# AREA LRMQ: revisión legal y privacidad local

Fecha: 14/10/2026. Cambio: `add-legal-pages-and-privacy-information`.
**Borrador de código/contenido para revisión del propietario y ChatGPT. No publicado. Terminar las tareas técnicas no acredita cumplimiento legal.**

## 1. Trazabilidad y coordinación

- Repo local `main`, remoto `https://github.com/DavidColillaMartinez/Pruebas_OpenSpecs.git`. Primera inspección HEAD `0f567352742c186e618e596d3251fd31d0a76dee`: incluye `2fd0e5a` Resend y `cf46436` SEO; el cambio sin almacenamiento está aplicado en código.
- Al iniciar aplicación HEAD `b92eedc3974e064a1bf478bd766e3c6d6c0908c6`: el otro agente había confirmado el ajuste inicial de portátil. Durante esta sesión continúa ajustando tamaño/espaciado. Sus cambios no son parte de esta entrega legal.
- HEAD observado al verificar: `101f688` (`fix(ui): compact short-viewport chapters and cap vision slider height`), confirmado por el otro agente. El diff actual de App respecto de ese HEAD contiene solo una importación legal y tres rutas; sus modificaciones están conservadas.
- Trabajo previo identificado: `docs/audit/owner-responsive-stability-review-2026-10-13.md`, `openspec/changes/fix-responsive-landing-commercial-ui/tasks.md`, `src/App.jsx`, `src/data/copy.js`, `src/styles/utilities.css`, `.agents/skills/.agents/` y `.agents/skills/skills-lock.json`. El estado de los tres archivos UI varió al avanzar el otro agente. Se relee App antes de añadir únicamente import lazy/rutas. No se restauran ni editan sus estilos, lógica de escala o documentos.
- Alcance superior a cinco archivos confirmado expresamente por el propietario. Solo cambios legales en los puntos de integración necesarios. La implementación y verificación se realizaron sin commit, push, despliegue, mensajes reales, credenciales, DNS ni cambios de servicios externos. La autorización posterior de entrega Git se registra al final de este informe.
- `remove-quote-storage` prevalece sobre la persistencia/outbox descrita en `add-quote-email-delivery`. No se cierran retrospectivamente sus pendientes. `audit-harden-repo-seo-security` documenta la limitación SPA y el enlace de privacidad antes ausente.

## 2. Identidad y actividad confirmadas por el propietario

Responsable: **ÁREA LRMQ DESING S.L**, NIF **B19932607**, **C/ Aquitania, 69, local 1, 28032 Madrid, España**. Correo empresarial y derechos: **arealrmqtienda@gmail.com**. Teléfono **+34 692 91 21 80**, WhatsApp **34692912180**. Marca **AREA LRMQ**; dominio definitivo **https://arealrmq.es**. DESING y acento se conservan; marca y materiales no se renombran.

La web informa y permite solicitar presupuestos gratuitos. No venta, contratación ni pago online; no condiciones ecommerce. Arquitectura: se entrega al interesado el número profesional, que contrata por separado y gestiona proyectos/trámites/facturación. No se acredita envío automático de datos del solicitante al arquitecto. Cualquier comunicación posterior requiere comprobarse por separado.

Las fotografías propias de trabajos y logo están autorizados según declaración del propietario. Las imágenes de Unsplash y contenidos de proveedores de catálogo son adicionales, no se califican como material propio ni se modifican.

## 3. Inventario por flujo y grado de evidencia

| Flujo | Datos y finalidad | Servicios y conservación | Evidencia / límite |
|---|---|---|---|
| Ficha y cesta | Nombre, email/teléfono, mensaje, página de origen, artículos/cantidades/atributos; ficha también tipo de reforma si se informa. Solicitud/seguimiento individual | Memoria React; POST `/api/catalog/quote-requests` en Vercel → infraestructura técnica con n8n → Resend → Gmail empresa | Código frontend/proxy + declaración vigente y OpenSpec externo; no nueva inspección MCP |
| Envío transitorio | Resolución de catálogo y aviso de presupuesto | Neon recibe solo identificadores de catálogo; sin solicitudes/contactos/texto libre ni outbox. 201 tras aceptación Resend, no garantía de bandeja de entrada, sin reintentos programados | Propietario 14/10 y `remove-quote-storage`; entrega al Gmail final condicionada a verificación de dominio; DNS no se diagnostica como error frontend |
| Empresa | Correos y presupuestos numerados con datos cliente; recuperar consultas posteriores, incluso >1 año; llamada aprox. a la semana si no hay respuesta | Gmail + base interna de la empresa; actualmente sin borrado ni plazo aprobado. Sin promociones | Práctica declarada, no auditada; **no subsanada por texto**. No se equipara presupuesto no contratado a factura |
| WhatsApp | Nombre/teléfono/mensaje preparados para consulta | Memoria formulario; al abrir `wa.me?text=...`, el texto llega a WhatsApp, usuario decide enviarlo a empresa. Otro flujo, sin POST de presupuesto | Código `ContactForm`; no se abre WhatsApp real durante revisión |
| Asistente | Texto, requestId, conversationId, turno, ruta/producto/filtros/búsqueda e idioma es | `/api/chat/messages` Vercel → upstream n8n; historial navegador en memoria. Backend/proveedor IA/retención concreta no acreditados en esta sesión | `assistantStore`, `useChatContext`, httpAdapter, proxy. No inferir OpenAI por compatibilidad API. No hay herramientas MCP n8n disponibles en esta sesión; no se abre su navegador |
| Navegación | IP/datos de petición, navegador; recursos y operación técnica | Vercel aloja y ejecuta funciones (`cdg1` no prueba residencia global). Hostalia registra dominio/DNS, no alojamiento | Código, configuración y documentación pública; contratos/plan/retenciones reales no acreditados |
| Recursos externos | Fuentes/imágenes/medios, IP y datos técnicos de conexión | Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`), Unsplash (`images.unsplash.com`), `assets.colilladavid.es` | Orígenes vistos en runtime local; no trackers deducidos solo por CSP. Operador y contrato de infraestructura de medios pendiente de acreditación |
| Enlaces externos | Acceso voluntario a Maps/Instagram/WhatsApp | Servicios externos con sus políticas; no se cargan como iframe de mapa ni SDK social en código revisado | Enlaces observados; cookies de destinos no probadas ni inventadas |

Remitente técnico declarado `presupuestos@avisos.arealrmq.es`, destino `arealrmqtienda@gmail.com`, Reply-To del email validado del solicitante. No Gmail OAuth requerido para recibir este correo. Ningún dato de solicitudes reales se utiliza como fixture o evidencia.

## 4. Almacenamiento de navegador

| Clave | Titular / tecnología | Finalidad | Duración efectiva |
|---|---|---|---|
| `lrmq:theme:v1` | AREA LRMQ / localStorage | Tema elegido | Sin TTL; hasta cambio/borrado de datos por usuario/navegador |
| `lrmq:quote-selection:v2` | AREA LRMQ / localStorage | Productos, cantidades, atributos; persiste sin notas libres ni contacto | Sin TTL; cambios/eliminación/vaciado/confirmación exitosa actualizan líneas |
| `lrmq:assistant:welcome:v1` | AREA LRMQ / sessionStorage | Descartar bienvenida | Sesión pestaña |
| `catalog:return-state` | AREA LRMQ / sessionStorage | Filtros/query y scroll de retorno | Sesión; se elimina al recuperarlo en catálogo |
| `lrmq:assistant:chat:v1` | Histórica / sessionStorage | Antiguo historial | Clave eliminada al montar AssistantProvider; no se vuelve a persistir |
| `lrmq:quote-selection:v1` | Histórica / localStorage | Selección antigua | Se elimina en efecto de selección, persiste v2 sin notas |

Contacto de formularios y conversación actual: solo memoria de la aplicación. Una recarga reinicia el chat; «Nueva conversación» no es borrado servidor/IA/n8n. Quitar datos locales no purga correo empresarial ni copias históricas.

Runtime inicial Chromium local, limpio, 1366×768 y 390×844: cookies `[]`; orígenes reales externos Google Fonts, servidor de medios y Unsplash. Se observó v2 de selección y bienvenida (bienvenida se descartó en setup). Preferencia de tema y retorno confirmados por código; revisión posterior ejercita selección/tema. No hay dependencias/scripts Web Analytics/Speed Insights/GA/Ads/Meta en código revisado. Esto **no prueba configuración actual de producción** ni ausencia universal de cookies externas. No se instala analítica por la mención del propietario.

**Decisión banner:** no añadir banner para las tecnologías funcionales identificadas; art. 22.2 LSSI y guía AEPD pp. 9–12 distinguen transmisión/servicio solicitado y preferencias elegidas. Revisar duración proporcional de selección persistente con el responsable (sin inventar TTL ni modificar almacenamiento). Si producción incorpora tecnologías no exentas: identificar el script y finalidad, bloquear antes de consentimiento, rechazo/aceptación/configuración equivalentes y retirada; requiere trabajo concreto, no un banner que no bloquee.

## 5. Fuentes consultadas el 14/10/2026

| Fuente | Enlace y evidencia | Aplicación / límite |
|---|---|---|
| BOE LSSI | https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758 (consolidado, actualización indicada 23/01/2025) | art. 10: identidad/NIF/contacto e inscripción cuando proceda; no exención por no cobrar online. art. 22: tecnologías de almacenamiento |
| RGPD EUR-Lex y DOUE | https://eur-lex.europa.eu/eli/reg/2016/679/oj?locale=es y https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:32016R0679 devolvieron contenido vacío al extractor. Texto oficial leído desde https://www.boe.es/doue/2016/119/L00001-00088.pdf | arts. 5, 6, 12–22, 28, 44–49: minimización/retención, bases, información, derechos, encargos y transferencias. PDF descargado fuera del repo, no se presenta el fetch vacío como lectura exitosa |
| BOE LO 3/2018 | https://www.boe.es/buscar/act.php?id=BOE-A-2018-16673 (actualización indicada 27/12/2025) | Información por capas (art. 11), derechos, responsabilidad activa. No copiar cláusula antigua |
| AEPD información | https://www.aepd.es/preguntas-frecuentes/2-tus-obligaciones-como-responsable-del-tratamiento/6-el-deber-de-informacion/FAQ-0247-como-debo-cumplir-con-el-deber-de-informar | Lenguaje claro/acceso fácil |
| AEPD información ≠ consentimiento | https://www.aepd.es/preguntas-frecuentes/2-tus-obligaciones-como-responsable-del-tratamiento/6-el-deber-de-informacion/FAQ-0248-sobre-si-el-usuario-tiene-que-dar-consentimiento-a-clausula-de-privacidad | Casilla como reconocimiento de información; finalidades consentidas deben separarse |
| AEPD cookies | https://www.aepd.es/guias/guia-cookies.pdf (PDF identifica mayo 2024; descarga y extracción de texto fuera del repo) | pp. 9–12, 24–30: exentas, preferencias, consentimiento/rechazo/retirada; no afirmar exención de tecnologías desconocidas |
| Resend regiones | https://resend.com/docs/dashboard/domains/regions | Ireland enruta/envía, cuenta/metadatos/logs/registros API en EE. UU. |
| Resend DPA/subencargos | https://resend.com/legal/dpa y https://resend.com/legal/subprocessors | DPA describe CCT y DPF; primario EE. UU.; subencargados incluyen AWS/Cloudflare/Datadog y otros. **No confirma acuerdo efectivo de la cuenta ni que cada subencargado reciba cada solicitud** |
| Vercel privacidad/DPA | https://vercel.com/legal/privacy-policy y https://vercel.com/legal/dpa | DPA §1/4 aplica Enterprise/Pro; plan real no acreditado. Distingue controlador de datos generados y encargado de contenido; CCT/DPF, operaciones EE. UU./globales, backups. No prometer toda residencia UE |
| Neon | https://neon.com/privacy-policy redirige a https://www.databricks.com/legal/privacynotice ; https://neon.com/dpa muestra Product Specific Schedule (Neon), actualizado 05/08/2026 | Aviso menciona Neon LLC y DPF; schedule enlaza MCSA/DPA/subencargos (incluido Grafana EE. UU.). Identificadores catálogo actuales no son clientes; retenciones históricas/plan/región no verificados |
| Google/Gmail | https://policies.google.com/privacy?hl=es (fecha indicada 12/10/2026), https://policies.google.com/privacy/frameworks?hl=es | Correo/contenidos en cuenta y servidores internacionales; borrado no instantáneo/backups. Gmail gmail.com no se presenta como Workspace con DPA contratado |
| Google Fonts | https://developers.google.com/fonts/faq/privacy | Extractor devolvió solo título; flujo real confirmado en red. No se usa esa extracción para afirmar garantías contractuales o ausencia de logging |
| WhatsApp / Unsplash | https://www.whatsapp.com/legal/privacy-policy-eea (fetch 400) ; https://unsplash.com/privacy (fetch 401) | Enlaces oficiales incluidos; consulta textual bloqueada. Sin plazos/garantías inventados, revisión manual documental pendiente |

No atribuir el uso de proveedores de IA internos de Resend a nuestro asistente. Publicación de un DPA/DPF no acredita adhesión contractual de la empresa, ponderación ni configuración. No adjuntar secretos o documentos de cuentas al repo.

## 6. Decisiones legales propuestas y asuntos pendientes

1. **Presupuesto/seguimiento individual solicitado:** art. 6.1.b RGPD; lectura de información no consentimiento marketing. Seguimiento limitado a esa solicitud, sin base para campañas.
2. **Consultas generales/chat y seguridad:** art. 6.1.f propuesto; intereses concretos atender comunicaciones y proteger disponibilidad. Falta aprobación/ponderación del responsable. No usar esta base para conservar indefinidamente solicitudes no contratadas.
3. **Conservación empresa:** describir práctica actual en borrador, no inventar 2 años ni «mientras sea necesario» como criterio cerrado. Propuesta para gestoría: distinguir solicitudes activas/cerradas/no contratadas/contratos, fijar evento de cierre, plazo proporcional, responsables de borrado y tratamiento de buzón/base/copias; **no implementada, sin plazo elegido**. No equivale a documentación fiscal obligatoria.
4. **Registro Mercantil:** falta inscripción. Gestoría consultada, respuesta prevista 15/10/2026. Aviso legal breve contiene los datos confirmados sin marcadores públicos. La omisión no está aprobada como cumplimiento y debe resolverse antes de publicar.
5. **Chat:** proveedor/modelo/región, datos enviados a IA, memoria/DB servidor y TTL efectivo no confirmados. Settings comunicados: `saveDataErrorExecution=all`, `saveManualExecutions=true`; desactivación y limpieza histórica pendientes mediante MCP con capacidades del propietario. No borrar por navegador ni pedir acceso de navegador. Reiniciar chat visible no resuelve este pendiente.
6. **Transferencias/encargos:** acreditar contratos reales con operador técnico, Vercel/plan, Resend, Google y servicio IA; garantías aplicables, acceso a copias, subencargos y retenciones. Neon histórico requiere región, ventana restore y copias efectivas. No se promete cero almacenamiento ni salida imposible de Europa.
7. **Derechos:** correo confirmado; procedimiento interno y responsables/plazos operativos aún no auditados. El texto informa derechos actuales y plazo normativo, no certifica ejecución interna. No DPO inventado ni nombre personal de la cláusula antigua en página.
8. **Cláusula presupuestos:** evidencia de relación comercial/contacto, no texto actualizado íntegro. Tras validar política, proponer sustitución por RGPD/LO 3/2018 con responsable sociedad, domicilio completo, finalidades/base, retención real y derechos/canal. No se modifican documentos ni base del cliente en este trabajo.

### Lista breve para la empresa (sin volver a pedir lo confirmado)

- Respuesta de gestoría: datos registrales y criterio de conservación real, aplicable también al buzón/base interna.
- Evidencia técnica autorizada de IA/chat/retenciones históricas y contratos/plan de proveedores; confirmar cualquier comunicación posterior de datos a profesionales.
- Validar ponderación/procedimiento de derechos y revisar contenido/código con propietario y ChatGPT antes de publicación.

## 7. Implementación y SEO

- Nuevos módulos `src/features/legal/{business,content,LegalLinks,PrivacyNotice,LegalPage}`: identidad separada de marca, resumen ligero compartido, contenidos completos lazy, página legible con índice y tabla desplazable por teclado. No estilos globales nuevos.
- `src/App.jsx`: import lazy y tres rutas. `vercel.json`: tres rewrites exactos; sin catch-all, reglas APIs/assets/404 preservadas.
- `QuoteRequestForm.tsx`, `QuoteSelectionPage.tsx`: resumen + casilla de lectura + enlaces nueva pestaña; mantiene payload/validación consentPrivacy. Cesta con enlaces legales también vacía.
- `ContactForm.jsx`: información previa apertura de WhatsApp y acceso legal al final en ambas variantes, sin cambiar el envío.
- `ChatPanel.tsx`: región de información previa desplazable por teclado y enlace, sin cambiar transporte o historial.
- `CatalogMasthead.tsx`: enlaces legales discretos bajo las migas; no nuevo menú comercial.
- `src/sections/{desktop,mobile}/Coleccion.jsx` y `src/data/methodSteps.js`: solo frase de arquitectura independiente autorizada. No cambios a Vision/CompareSlider/media.
- Tests de formularios y `LegalPage.test.tsx`: conservación de borrador, casilla obligatoria, metadatos/restauración. Selector de test ChatPanel se precisa para distinguir WhatsApp del nuevo enlace legal. `scripts/legal-review.mjs`: revisión local reproducible con GET fixture y prohibición de POST.

**SEO:** title/description/canonical propio `https://arealrmq.es/{aviso-legal,privacidad,cookies}`, OG/Twitter locales con restauración; `noindex, follow` solo durante esas rutas. No se edita `index.html`, helper compartido, sitemap o robots. Noindex editorial para páginas auxiliares, fuera de sitemap y rastreables (sin Disallow). Catálogo/presupuesto mantienen reglas actuales. El HTML inicial de Vite SPA todavía contiene metadatos de portada hasta ejecutar JS; redes sin JS pueden verlos. No es migración SEO ni prerender, y noindex no impide acceso público si se desplegara: no desplegar antes de revisión.

## 8. Verificación

### Resultados finales

- `npm test -- src/features/legal/LegalPage.test.tsx src/features/quote/components/QuoteRequestForm.test.tsx src/features/quote/pages/QuoteSelectionPage.test.tsx src/features/assistant/components/ChatPanel.test.tsx src/features/catalog/components/CatalogMasthead.test.tsx src/App.test.jsx src/features/assistant/model/assistantStore.test.tsx src/features/quote/model/selectionStore.test.tsx`: **8 archivos, 55 passed / 1 skipped preexistente**.
- `npm run typecheck`: PASS. `npm run build`: PASS. LegalPage lazy ≈20,84 kB (7,35 kB gzip); contenido completo no entra en bundle principal por usar módulo de resúmenes ligero.
- `npm run lint`: **0 errores / los mismos 10 warnings previos** (AnimatedLogoMark 5, ScrollTopButton 2, ThemeToggle 1, Vision 1, useThemePreference 1).
- `git diff --check`: PASS. Diff revisado: sin cambios a index.html, routeMeta, robots/sitemap, backend, medios o Vision/CompareSlider por este agente. Correcciones de pruebas iniciales: setup de title eliminado por innerHTML, selector de enlace ambiguo y opciones `exact` no soportadas por Testing Library; ningún cambio de contrato comercial. Runner de navegador espera DOM de catálogo, no el heading anterior durante la navegación.
- `node scripts/legal-review.mjs`, Vite local puerto 4181, **Chromium 153.0.8010.12**: **4 combinaciones PASS** (1366×768 / 390×844 × claro/oscuro), reduced motion. GET catálogo usa fixtures etiquetadas; endpoints POST bloqueados y contador **0**. URLs de imagen assets.example/test son fixtures, no proveedores reales.
- Las tres rutas respondieron 200 y recargaron en local. h1 único, canonical/robots/OG por ruta, vuelta a Inicio y Catálogo restaura title/description/canonical/robots/OG exactamente al baseline de cada destino. index.html compartido continúa index,follow.
- Enlaces de privacidad de ficha/cesta abrieron popup real a la política; nombre/mensaje permanecieron y selección persistida no cambió. Sin marcar casilla siguen bloqueados por pruebas de formulario. No se enviaron presupuestos, chat o WhatsApp reales.
- Foco visible revisado: enlaces legales, formulario/privacidad, tabla desplazable y región de privacidad del asistente; Escape cierra chat. Tabla móvil permite desplazamiento horizontal con teclado, sin overflow del documento.
- Regresión acotada de medios desktop: scroll hace avanzar tiempo del vídeo de Reformas; transición de final del vídeo de Visión permite comparar y ArrowRight cambia 50→55. El evento ended se simuló para evitar esperar el vídeo completo; no se declara revisión de reproducción completa ni dispositivo físico.
- Contraste medido en navegador para nuevo cuerpo legal: claro `rgb(46,49,52)` sobre `rgb(251,250,247)` **12,53:1**, oscuro `rgb(168,165,158)` sobre `rgb(28,29,31)` **6,86:1**. Tokens existentes reutilizados en resúmenes/enlaces. Revisión manual de capturas confirma ausencia de solapes añadidos en las superficies afectadas.
- Comparación light antes/después de Contacto en ambos tamaños. No se exige igualdad de píxeles: el otro agente cambió escala durante la sesión y el resumen añade altura. Se conserva estructura/medios/copy comercial salvo aclaración autorizada. Inicio/media siguen sin cambios de este agente; la geometría actual es la del ajuste paralelo, no se atribuye a este cambio.
- Revisión React disponible aplicada: componentes a nivel de módulo, datos estáticos, efectos con dependencias estables/restauración y limpieza, sin rehidratar contacto/historial ni nuevas dependencias; contenido legal lazy y enlaces/resúmenes ligeros. Detector Impeccable: ningún hallazgo en módulo legal nuevo; señala bounce/11px ya existentes en ChatPanel y 10px previo de Masthead (no se amplía a rediseño).

### Evidencia real de navegador (fuera del repo)

- Resultado estructurado: `/tmp/opencode/legal-browser-review.json`.
- Baselines claros: `/tmp/opencode/legal-before-1366.png`, `/tmp/opencode/legal-before-390.png`.
- Capturas por tamaño/tema: `/tmp/opencode/legal-{1366,390}-{light,dark}-{inicio,contacto,contacto-enlaces,aviso-legal,privacidad,cookies,tabla,ficha,presupuesto,asistente}.png`.
- Revisadas manualmente: Contacto claro desktop antes/después, Contacto móvil antes/después y enlaces en foco, Privacidad clara desktop, Aviso legal oscuro desktop, Cookies/tabla oscura móvil, ficha clara desktop y chat oscuro móvil. Se acortó resumen chat para mostrar identidad/canal/enlace sin ocultarlos al enfocar; confirmación posterior en captura final.
- Reproducir con `npm run dev -- --host 127.0.0.1 --port 4181` y `node scripts/legal-review.mjs` (Playwright instalado). Todas las capturas emplean datos sintéticos o contenido público; no contienen solicitudes reales.

La documentación PRODUCT.md/DESIGN.md y su sidecar está en formato anterior según la herramienta de diseño. Se preserva: actualizarla correspondería a `init`/`document` en otro alcance, no se introduce esa modificación aquí.

La recarga local no verifica por sí sola el servicio Vercel publicado. Sin dispositivo Safari/iPhone físico ni acceso MCP disponible en esta sesión. Ninguna aceptación/entrega de correo o cambio de DNS se prueba aquí.

## 9. Autorización posterior de entrega Git

Tras recibir la entrega local, el propietario solicita expresamente «haz commit push». Esta instrucción autoriza crear un commit centrado en el cambio legal y subirlo a origin/main. Se excluyen los documentos responsive y las entradas de skills ajenos. Los ajustes del otro agente ya presentes en HEAD se conservan.

Esta autorización no se registra como aprobación del cumplimiento legal ni cierra las tareas 4.1–4.4. No se ejecuta promoción manual de Vercel; el push puede activar la integración automática Git del proyecto si está configurada. Su estado y el resultado publicado requieren comprobación separada.
