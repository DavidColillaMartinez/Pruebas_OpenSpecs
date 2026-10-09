## 1. Base, entorno y preservación

- [x] 1.1 Volver a leer AGENTS.md e instrucciones por área, comprobar rama/HEAD/remoto/status/diff y registrar base y archivos previos en la auditoría; verificar que no se restaura la base histórica ni se incluye instalación ajena de skills.
- [x] 1.2 Revisar package.json, versiones Node/pnpm, auditorías existentes, cambios OpenSpec relacionados y skill responsive disponible; verificar un inventario escrito que distingue antecedentes y restricciones vigentes de evidencia actual.
- [x] 1.3 Registrar baseline de `pnpm test`, `pnpm typecheck`, `pnpm lint` y `pnpm build`, separando errores/avisos previos; verificar logs y versiones usadas sin atribuir resultados históricos al checkout.
- [x] 1.4 Inventariar componentes, breakpoints, modos narrativos, capas y rutas/fixtures de GME mamparas, IO, Royo modular/no modular, Duplach y Manillons; verificar que los productos/opciones existen en datos actuales o fixtures realistas.
- [x] 1.5 Comprobar Playwright/binarios, intentar instalación estándar de Chromium/Firefox si falta, iniciar servidor local y configurar interceptación de envíos y mocks explícitos; verificar arranque por navegador y ausencia de solicitudes reales de presupuesto/chat/WhatsApp.

## 2. Verificador reutilizable y reproducción

- [x] 2.1 Crear/adaptar runner local parametrizado con todos los viewports de design.md, fronteras 639/640/641, 767/768/769, 1023/1024/1025, 1279/1280/1281, alturas 719/720/721, ambos temas/navegadores y rutas; verificar enumeración completa sin resultados aprobados por defecto.
- [x] 2.2 Implementar espera de fuentes, navegación, medios, animaciones y estabilidad, clasificación de visibilidad/capítulo activo/recorte por ancestros; verificar que capítulos fuera de pantalla y opacity inicial no producen falsos solapes, y timeout se informa.
- [x] 2.3 Añadir mediciones de rectángulos, logo/Tienda/títulos/tarjetas separados, contención, cabecera, clipping de textos/acciones y hit-testing; verificar detectores con casos reproducidos y excepciones documentadas de padre/hijo, tarjetas, media, handle y carrusel.
- [x] 2.4 Añadir escenarios de navegación, teclado, foco, dialogs, scroll y salida textual por caso con navegador/versión, viewport efectivo, DPR, tema, ruta/estado y origen de datos; verificar que fallos identifican dos elementos y medidas y ausencia de herramientas queda NO PROBADO.
- [x] 2.5 Reproducir localmente Inicio, Nombre de Akord y Contacto oscuro a 1363×936 antes de corregir, contrastando las medidas externas facilitadas; verificar registro de causa y medidas locales o diferencia justificada sin inventar reproducción.
- [x] 2.6 Reproducir riesgos de contenido a 720/768 de alto, cabecera estrecha, menú bajo con body-lock y launcher sobre filtros; verificar comportamiento en navegador y separar fallos confirmados de hipótesis no reproducidas.

## 3. Teclado y contacto oficial

- [x] 3.1 Repetir `git apply --check /media/test/Program/Downloads/switch/contacto-teclado.patch`, aplicar una vez si procede o integrar protección equivalente si evolucionó; verificar diff preservado y tests de inputs, textarea, select, editable, roles, diálogo y defaultPrevented.
- [x] 3.2 Ejecutar regresión local de ↑/↓/PageUp/PageDown en Contacto, compositor y diálogos, además de controles editables y navegación exterior; verificar capítulo estable en controles y navegación narrativa intacta fuera de ellos.
- [x] 3.3 Actualizar constante compartida y referencias públicas del teléfono a 692912180 / +34 692 91 21 80 y WhatsApp 34692912180 en cabecera, menú, landing, formularios, asistente/fallbacks y datos estructurados aplicables; verificar enlaces y ausencia de contactos antiguos en código runtime sin reemplazar productos/historia.
- [x] 3.4 Probar construcción del borrador y destino WhatsApp de Contacto interceptando apertura; verificar envío manual conservado, ninguna comunicación externa y ningún mailto/enrutamiento nuevo para el destinatario interno de presupuestos.
- [x] 3.5 Adaptar soporte o variante existente de marca de Contacto en oscuro si se confirma poca visibilidad; verificar antes/después en ambos temas y diff sin modificación de recursos ni cambio claro innecesario.

## 4. Landing y adaptación por espacio útil

- [x] 4.1 Reservar espacio de logo, Tienda, títulos y tarjetas en Inicio mediante layout sensible a ancho/alto; verificar caso 1363×936 y ventanas bajas, callback/animación, entrada de tarjetas y `/productos` intactos, sin mover solo porcentaje absoluto.
- [x] 4.2 Medir capacidad final de capítulos con cabecera/márgenes/controles y ajustar coherentemente gate/presentación/listeners cuando sea necesario; verificar narrativa donde cabe y contenido completo con scroll accesible donde no cabe, sin ocultación ni escalado global.
- [x] 4.3 Conservar sección actual al cruzar modos/umbrales y redimensionar ambos sentidos; verificar 1024×719↔1024×720, cambios de ancho/orientación y umbrales nuevos sin pantalla vacía ni capítulo perdido.
- [x] 4.4 Adaptar cabecera según ancho disponible y menú equivalente, manteniendo transición de marca oculta en Inicio y todos los destinos/CTA; verificar rectángulos, foco, targets y espacio entre iconos/etiquetas fuera de Inicio en ambos temas.
- [x] 4.5 Limitar menú móvil al alto útil con scroll propio y safe-area CSS; verificar siete destinos/dos CTA en landscape bajo, cierre/Escape/Tab, restauración de foco/body-scroll y no interferencia del asistente.
- [x] 4.6 Corregir fallos confirmados de Quiénes somos y Servicios preservando imágenes, bloques alternos, columnas, textos y párrafo final; verificar estados inicial/final en claro/oscuro, especialmente alturas 720/768.
- [x] 4.7 Corregir únicamente adaptación comprobada de Reformas y Visión; verificar relación de aspecto, pasos/progreso, controles, swipe/handle y reproducir/repetir, conservando medios y funcionamiento aprobados.
- [x] 4.8 Corregir fallos confirmados de Opiniones y Contacto; verificar nombres/reseñas largos completos, scroll de reseña no interceptado, carrusel/overlays intencionales y todos los campos/acciones de Contacto con foco/errores.

## 5. Convivencia de capas y controles fijos

- [x] 5.1 Definir coordinación coherente de cabecera, lateral, volver arriba, asistente/bienvenida, cesta y diálogos; verificar hit-testing de controles internos sin escalada independiente de z-index ni pérdida permanente del asistente.
- [x] 5.2 Corregir solape flotante con campos/etiquetas/acciones mediante espacio o presentación adaptada; verificar Nombre de Akord a 1363×936 y formularios en varias posiciones de scroll/foco, no solo el final de página.
- [x] 5.3 Coordinar menú, filtros, cesta y galería ampliada con launcher/bienvenida; verificar cierre, opciones y acciones en listas largas, foco/Escape/restauración, tanto sesión nueva como bienvenida descartada.
- [x] 5.4 Revisar chat abierto con mensajes largos y compositor usando datos locales; verificar scroll, borrador, cierre, propiedad de teclado y acceso completo en tamaños críticos sin enviar mensajes reales.

## 6. Catálogo y cesta

- [x] 6.1 Adaptar masthead, imagen/etiqueta, acceso a selecciones, búsqueda/Limpiar/Filtros/ordenación y etiquetas largas; verificar wrapping, contención y acceso a quitar etiquetas en estados cargando/cargado/búsqueda/filtros.
- [x] 6.2 Ajustar cuadrícula por ancho útil con filtros y cesta visibles y tarjetas con textos largos; verificar columnas, imágenes/aspect ratios, nombres/resúmenes completos, título Resultados/contador, sin cambiar consultas/facetas/tamaño de página.
- [x] 6.3 Adaptar panel desktop y drawer móvil de filtros poblados; verificar ancho, scroll, labels, cierre, foco y coordinación de capas en ventanas bajas y ambos temas.
- [x] 6.4 Adaptar cesta desktop/móvil vacía y con varias líneas/referencias largas; verificar cantidades, eliminar, cerrar e Ir a presupuesto y persistencia conservada, sin solape con launcher/bienvenida ni acciones tapadas.
- [x] 6.5 Probar vacío, error/reintento, paginación y fin con mocks identificados; verificar legibilidad y acciones Cargar más/final alcanzables sin controles fijos encima.

## 7. Fichas y presupuesto

- [x] 7.1 Adaptar galería, miniaturas, flechas y vista ampliada si hay fallos confirmados; verificar navegación/cierre accesibles y medios/aspect ratios intactos en móvil horizontal y desktop.
- [x] 7.2 Revisar títulos, descripciones, características, chips/selectores/swatches largos en GME mamparas/IO, Royo modular/no modular, Duplach y Manillons; corregir distribución comprobada y verificar opciones sin invasión por scale, resumen/referencia/acciones y selección comercial intactos.
- [x] 7.3 Adaptar formulario individual y `/presupuesto` vacío/poblado con varias líneas; verificar campos, cantidades, consentimiento, validación, enviando/error/confirmación largos y controles sin capas encima, usando mocks de envío explícitos.
- [x] 7.4 Revisar visibilidad de bordes, secundarios, placeholders, seleccionados, deshabilitados, errores y confirmaciones en oscuro; verificar comparación con claro y flujo comercial/payloads/persistencia sin alteraciones.

## 8. Matriz y regresión integrada

- [x] 8.1 Ejecutar matriz completa de design.md en Chromium en claro/oscuro sobre las siete secciones, catálogo, todas las fichas representativas y presupuesto; verificar evidencia por combinación PASA/FALLA/NO PROBADO y corregir/repetir fallos propios.
- [x] 8.2 Ejecutar la misma matriz en Firefox en claro/oscuro o registrar indisponibilidad exacta tras intento estándar; verificar resultados por combinación sin heredar aprobación de Chromium.
- [x] 8.3 Ejecutar ambos lados de todos los breakpoints usados y nuevos, resize/orientación y umbral 720; verificar continuidad, contención y hit-testing en ambos temas/navegadores disponibles.
- [x] 8.4 Ejecutar drawers/menú/cesta/galería poblados, bienvenida nueva/descartada, chat y formularios en tamaños críticos de cada layout; verificar estados, scroll útil, foco/teclado y acciones finales sin interferencias.
- [x] 8.5 Comparar estado claro antes/después en desktop/móvil y ambos temas en las vistas afectadas; verificar navegación, Vision swipe, aspect ratios y contenido completo con revisión local e informe textual, sin confundirla con aceptación visual externa.
- [x] 8.6 Registrar si se ejecutó zoom real 125%/200% con mecanismo/viewport efectivo; verificar que DPR, viewport reducido, safe-area CSS y cambios de altura no se reportan como zoom real, iPhone o teclado virtual físico probado.

## 9. Gates, documentación y entrega autorizada

- [x] 9.1 Inspeccionar diff completo y ejecutar `git diff --check`; verificar solo alcance propio, ausencia de secretos/salidas temporales/cambios ajenos y preservación de rutas, textos aprobados, medios, contratos, disponibilidad y teléfonos oficiales.
- [x] 9.2 Ejecutar `pnpm test`, `pnpm typecheck`, `pnpm lint` y `pnpm build` en entorno registrado; verificar resultados, separar warnings previos/nuevos y corregir fallos obligatorios propios antes de commit/push.
- [x] 9.3 Crear/actualizar `docs/audit/responsive-review-2026-10-09.md` con comandos, matriz, fallos/medidas/causas/correcciones, datos reales frente a mocks y límites; verificar ausencia de prompt antiguo contradictorio y clasificación de pendientes de publicación, aprobación responsive y mejoras opcionales.
- [x] 9.4 Retirar datos de la sesión y detener procesos de prueba propios innecesarios; verificar limpieza específica sin borrar archivos ajenos ni usar cleanup destructivo.
- [x] 9.5 Inspeccionar status/diff/history, stage explícito y crear commits coherentes con verificaciones locales resueltas; verificar contenido staged sin instalación ajena de skills ni trabajo previo no autorizado, y build no roto.
- [x] 9.6 Hacer push autorizado a rama/remoto previstos, comprobar SHA y tracking y entregar archivos/propósito, resultados y pendientes; verificar ausencia de promoción manual/hosting y aceptación visual externa aún pendiente.

## 10. Aceptación y tareas externas — mantener pendientes

- [ ] 10.1 Obtener revisión visual posterior del propietario y ChatGPT sobre SHA publicado; verificar evidencia explícita antes de marcar aceptación, sin sustituirla por mediciones automáticas.
- [ ] 10.2 Registrar pruebas físicas Safari/macOS/iPhone, safe-area/teclado físico y medidas CSS reales de equipos del propietario como externas; verificar evidencia aportada antes de cerrar, sin identificar viewport por pulgadas/nombre.
- [ ] 10.3 Registrar configuración/entrega n8n a arealrmqtienda@gmail.com, JSON y dominio/DNS/hosting como tareas externas o separadas; verificar evidencia del responsable antes de cerrar, sin ejecutarlas ni inferir éxito desde mocks.
