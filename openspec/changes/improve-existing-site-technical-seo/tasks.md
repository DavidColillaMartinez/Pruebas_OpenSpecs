## 1. Preparación, referencia y candidata aislada

- [x] 1.1 Releer `AGENTS.md`, cargar la skill `seo`, leer artefactos de este cambio y antecedentes SEO/privacidad/selección/chat; registrar en `docs/audit/existing-site-technical-seo-review.md` SHA, `git status`, contratos vigentes y todos los cambios ajenos, verificando que quedan fuera del alcance.
- [x] 1.2 Fijar la referencia con el propietario si hay cambios concurrentes que afecten a lo aprobado; inventariar rutas, textos/medios visibles y matriz HTTP/HTML/DOM inicial, y ejecutar `npm test`, `npm run typecheck`, `npm run lint` y `npm run build` como baseline con resultados registrados.
- [ ] 1.3 Verificar worktrees, carpetas padre y puertos disponibles; crear rama/worktree candidata con los artefactos vigentes de este cambio y arrancar referencia/candidata en puertos distintos, con dependencias separadas y fixtures equivalentes; entregar comandos/URLs y comprobar que editar la candidata no altera archivos de la referencia ni arrastra trabajo ajeno.
- [x] 1.4 Capturar estados iniciales equivalentes en claro/oscuro, escritorio/móvil, movimiento normal/reducido y selección vigente; registrar esquema/fechas de fixtures y diferencias por origen para verificar que el almacenamiento separado por puerto no se interpreta como regresión.

## 2. Corte de renderizado y activación sin regresiones

- [x] 2.1 Inventariar archivos, dependencias y responsabilidades necesarias para el renderizado híbrido; justificar la lista en el informe y obtener confirmación de alcance cuando la regla de más de cinco archivos resulte aplicable, antes de extender las ediciones.
- [x] 2.2 Preparar las entradas de renderizado/build y servido de la candidata reutilizando vistas actuales; verificar en una petición directa de portada que el HTML contiene su contenido existente y que no se ha añadido contenido comercial ni ejecutado POST.
- [x] 2.3 Resolver estado responsive e hidratación de portada manteniendo primer pintado y montaje único de proveedores; verificar en navegador ambos modos y umbrales sin flashes de otro layout, duplicaciones, errores de hidratación o reinicios de navegación, incluyendo movimiento normal.
- [x] 2.4 Preparar la lectura pública inicial de una ficha mediante el contrato GET vigente e hidratar esos mismos datos; verificar con fixtures éxito, inexistencia, timeout, serialización segura y ausencia de doble petición o datos personales/credenciales en HTML.
- [x] 2.5 Documentar el resultado del corte vertical de portada/ficha, adaptadores elegidos y evidencias de paridad; comprobar que cumple las especificaciones antes de extenderlo y dejar bloqueada la expansión si necesita cambiar diseño, contratos o alcance.
- [x] 2.6 Extender el renderizado estable a legales/presupuesto y por petición a catálogo/fichas, conservando navegación lazy cuando proceda; verificar contenido y metadatos iniciales de cada ruta, revalidación recuperable y aislamiento entre dos visitantes con selecciones distintas.

## 3. Metadatos, indexación y respuestas HTTP

- [x] 3.1 Unificar descriptores de metadatos iniciales y cliente, sustituyendo solo las escrituras duplicadas; probar title, description, canonical, robots y OG/Twitter en petición directa y recorridos Inicio → catálogo → ficha → legales → Atrás/Adelante.
- [x] 3.2 Aplicar la matriz de indexación del diseño a catálogo base, búsqueda/filtros/orden, paginación, fichas, presupuesto y legales; verificar con requests y pruebas de navegación que ninguna página indexable hereda noindex y que las auxiliares lo emiten desde el HTML inicial.
- [x] 3.3 Normalizar alias de barras finales sin cambiar las URLs canónicas publicadas ni enlaces visibles; verificar un único salto por normalización de ruta, parámetros funcionales conservados, ausencia de bucles y exclusión de API/assets.
- [x] 3.4 Resolver 404 de documento para páginas/fichas confirmadas inexistentes y 503 recuperable para fallos temporales; verificar status/content-type con el artefacto servido y no solo Vite dev, manteniendo errores propios de API y archivos.
- [x] 3.5 Auditar el HTML/estado inicial y configuración de caché/servido; probar que no se filtran datos de contacto, conversación, selección o secretos, no se debilita CSP y una petición a una página no produce envíos de chat/presupuesto.

## 4. Descubrimiento y datos estructurados

- [x] 4.1 Implementar enumeración verificable de fichas públicas y generación de sitemap con orden estable y deduplicación; probar inventario completo, páginas repetidas, fallo intermedio y preservación del último inventario válido o fallo explícito inicial, sin publicar fixtures como datos reales.
- [x] 4.2 Documentar cuándo se regenera y cómo se comprueba el sitemap; contrastar en una ejecución autorizada de lectura pública el inventario real con las URLs indexables, excluyendo auxiliares/parámetros y fechas de modificación sin evidencia.
- [x] 4.3 Ajustar robots según recursos necesarios y páginas cuyo noindex debe leerse; verificar reglas para presupuesto con/sin barra, legales, CSS/JS/imágenes y GET públicos imprescindibles, sin alterar endpoints de escritura o funcionalidad del botón «Cargar más».
- [x] 4.4 Revisar y emitir JSON-LD de negocio/datos aplicables desde la respuesta inicial; verificar sintaxis, datos públicos confirmados y coherencia con contenido/legal, omitiendo propiedades no acreditadas y documentando por separado lo pendiente de contrastar con Perfil de Empresa.

## 5. Regresión funcional con transportes controlados

- [x] 5.1 Verificar chat completo: bienvenida, apertura/cierre, privacidad desplegable, conversación, reinicio, contexto, recomendaciones y preparación/cancelación de WhatsApp; registrar pruebas de navegador con respuestas controladas y una única petición por acción, sin envío externo accidental.
- [x] 5.2 Verificar búsqueda/filtros/orden/carga incremental, enlaces de fichas, galerías y selectores de las familias presentes; comprobar retorno al catálogo con filtros/posición conservados y mismos resultados con datos equivalentes.
- [x] 5.3 Verificar selección/presupuesto: añadir, cantidades, atributos, modificar/eliminar/vaciar, recarga, recordatorio/caducidad y sincronización entre pestañas; ejecutar pruebas pertinentes del esquema vigente sin alterar claves, TTL o contratos.
- [x] 5.4 Verificar formularios de ficha y presupuesto con borradores, enlaces de privacidad, casilla, errores y éxito controlado; comprobar payload idéntico y preservación/retirada de selección según la semántica actual.
- [x] 5.5 Verificar Contacto, teléfono, mapa, redes y enlaces legales, interceptando destinos externos; comprobar texto/destino de WhatsApp y que revisar privacidad mantiene borradores sin enviar mensajes.
- [x] 5.6 Verificar landing y navegación: hashes, menú, capítulos, Atrás/Adelante, resize, temas, vídeos, ratios y swipe/teclado de Visión; comparar resultados con la referencia en navegador real.

## 6. Paridad visual, rendimiento y comprobaciones finales

- [x] 6.1 Comparar capturas/estados de referencia y candidata en 390×844, 1366×768, 1440×900 y ambos lados de los umbrales vigentes, claro/oscuro; revisar primer pintado, hidratación y estados interactivos con tiempos equivalentes, registrando cada diferencia y resolviendo regresiones.
- [x] 6.2 Medir carga, estabilidad e interacciones con metodología comparable; registrar LCP/CLS y datos INP de campo si existen, diferenciar laboratorio/campo y corregir regresiones atribuibles al cambio sin modificar contenido, animaciones o medios aprobados.
- [x] 6.3 Ejecutar `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` y `openspec validate improve-existing-site-technical-seo --strict`; registrar resultados, warnings previos y cobertura de rutas/renderizado sin presentar build o tests como aprobación visual.
- [x] 6.4 Revisar diff y artefacto servido: rutas comerciales/contenido/medios conservados, APIs/almacenamiento sin cambios de contrato, metadatos iniciales y sitemap correctos; entregar informe reproducible, referencia, comandos, URLs locales, evidencias y pendientes externos.

## 7. Revisión del propietario e integración condicionada

- [ ] 7.1 Obtener revisión visual expresa del propietario de las dos versiones y registrar su decisión/ajustes; mantener esta casilla pendiente hasta recibir evidencia, aunque todas las pruebas técnicas pasen.
- [ ] 7.2 Tras aprobación, comprobar si la base ha avanzado, coordinar trabajo ajeno y repetir solo las verificaciones afectadas antes de integrar; ejecutar integración/commit/push exclusivamente con la autorización correspondiente y verificar el diff final enfocado.

## 8. Seguimiento externo, solo tras autorización y disponibilidad

- [ ] 8.1 Tras publicación expresamente autorizada, verificar en el dominio real HTML/status/robots/canonical/metadatos/sitemap y recursos, registrando diferencias del alojamiento; dejar pendiente mientras la candidata siga solo en local.
- [ ] 8.2 Cuando se acredite Search Console y se autorice el acceso, comprobar propiedad/verificación, enviar o validar sitemap e inspeccionar URLs representativas, HTML renderizado y canonical elegido; registrar resultados y distinguir envío, rastreo e indexación, sin dar por completada la tarea por la previsión de propagación DNS.
- [ ] 8.3 Entregar una rutina de seguimiento con responsable acordado: incidencias/consultas al inicio, revisión mensual de búsquedas y consultas comerciales conocidas, y verificación tras cambios de catálogo; comprobar que no exige instalar analítica o modificar contenido y mantener cualquier aceptación/acceso pendiente hasta confirmación.
