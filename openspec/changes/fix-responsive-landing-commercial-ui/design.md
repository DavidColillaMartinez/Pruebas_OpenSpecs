## Context

Ver motivación y alcance en `proposal.md`. Checkout inicial: `main` en `011b0c1`, limpio de modificaciones de código pero con dos entradas ajenas sin seguimiento. React/Vite, Tailwind 3, Playwright 1.63 declarado, Node requerido 24.x y pnpm 10.34.5. Se volverá a comprobar entorno y estado antes de implementar.

En el código actual, Inicio coloca un logo de 13.5rem fuera del flujo a `top:15%`; su bloque central no reserva ese espacio. La narrativa activa listeners globales de teclado y rueda; el listener de teclado aún no contiene las protecciones del parche. Su gate depende de dimensiones y debe coordinarse con la presentación y navegación, no ajustarse solo en CSS. Estas observaciones explican hipótesis de reproducción, no son resultados locales de navegador.

Las auditorías de septiembre describen otros commits y cobertura principalmente Chromium; no acreditan este encargo. La referencia externa de 1363×936 y las medidas facilitadas se etiquetarán como evidencia externa hasta reproducirlas localmente. El informe parcial de octubre no está presente aquí. Las especificaciones principales están vacías; se crean cuatro capacidades para este cambio sin archivar ni cerrar cambios anteriores.

## Goals / Non-Goals

**Goals:**
- Cambios de presentación pequeños por causa comprobada, con un contrato común de espacio útil y coordinación de capas.
- Pruebas locales deterministas con geometría, hit-testing, foco y comportamiento, antes/después en ambos temas, sin necesidad de capturas.
- Mantener continuidad narrativa y comercial al redimensionar; separar resultados mock, reales y pendientes externos.

**Non-Goals:**
- Nuevos diseños, medios, textos comerciales, rutas, variantes, contratos de API o modos mock en producción.
- Capturas como entregable, aceptación visual externa, validación Apple/Safari físico, configuración n8n/correo, JSON, dominio o hosting.

## Decisions

### 1. Diagnóstico y cambios por componente, con base preservada

Inspeccionar diffs previos, instrucciones de las áreas y fixtures disponibles antes de editar. Preparar un inventario de vistas/estados y una baseline local. Los cambios responsive afectarán los componentes necesarios, aunque superen cinco archivos (autorizado), sin refactor transversal ajeno. Reutilizar la skill `responsive-design` encontrada en `.agents/skills/.agents/skills/responsive-design/` mediante lectura si el harness no la expone, además de instrucciones UI aplicables al implementar; no mover ni incluir su instalación ajena.

Alternativa descartada: restaurar la base de ChatGPT o aplicar ajustes globales antes de medir; perdería trabajo y podría ocultar causas diferentes.

### 2. Inicio con espacio reservado y capítulos según capacidad real

Logo, enlace, títulos y tarjetas se compondrán dentro de una distribución que reserve sus tamaños, con gaps/tamaños fluidos acotados por ancho y alto útil. Se mantienen animación del logo, callback, cascade de tarjetas y `/productos`. No corregir mediante otro porcentaje absoluto.

Medir contenido final, cabecera y controles de cada capítulo para justificar el umbral narrativo. Mantener el modo narrativo donde cabe; cuando no, usar el modo de scroll existente coherentemente, con contenido completo y sin scroll interno interceptado. Centralizar o sincronizar la decisión de modo entre render, listeners y navegación. Al pasar ambos sentidos de los umbrales, conservar capítulo/posición equivalente y evitar zonas vacías. El umbral actual de 1024×720 será un caso obligatorio de regresión, aunque las medidas justifiquen otro umbral.

Cabecera: conservar ocultación/transición de marca en Inicio; elegir distribución compacta o menú existente al faltar espacio medido, con acceso equivalente a todos los destinos y CTA. Menú móvil con alto máximo útil, scroll propio, safe-area CSS y foco/body-lock restaurados. En las demás secciones tocar únicamente restricciones que causen fallos: imágenes alternas, bloque final de Servicios, video/pasos, comparación/replay de Visión, reseñas completas con scroll accesible y formulario de Contacto. Comparar light antes/después y ambos temas, no solo ausencia de overflow.

Alternativas descartadas: reducir toda la web, ocultar texto/acciones, forzar `overflow-hidden`, desactivar narrativa en todo desktop o modificar medios.

### 3. Superficies comerciales según ancho del contenedor

Aplicar `min-width:0`, wrapping y distribución de controles donde corresponda; calcular columnas de resultados por ancho útil real cuando conviven filtros y cesta (grid adaptable o container queries según patrón existente). Conservar aspect ratios, textos completos y opciones visibles sin scale que invada vecinas. Los drawers/cesta y galería ampliada tendrán cierre/acciones alcanzables, alto limitado al viewport útil y scroll accesible para listas largas.

Inventariar rutas representativas desde catálogo o fixtures, sin inventar disponibilidad: GME mamparas, IO con swatches, Royo modular/no modular, Duplach compacto y Manillons con medidas/acabados. Probar formularios y presupuesto en todos sus estados sin cambiar selección, cantidades, snapshots, persistencia ni payloads.

Alternativa descartada: cambiar paginación, facetas o contenido comercial para reducir densidad visual.

### 4. Contrato compartido de capas y zona flotante

Definir niveles coherentes para documento/navegación, controles flotantes y diálogos activos, con el diálogo por encima de controles externos. Coordinar visibilidad o presentación temporal del launcher/bienvenida durante menú, filtros, cesta o galería, manteniendo el acceso aprobado fuera de estados incompatibles. No resolver cada caso subiendo su z-index.

Para formularios en scroll, reservar espacio o adaptar la zona flotante de forma que launcher/bienvenida/chat no cubran campos, etiquetas o acciones ni su punto de interacción. Probar geometría en distintas posiciones, foco, nueva sesión y bienvenida descartada. El chat abierto conserva scroll de conversación, borrador y comportamiento de apertura, sin mensajes reales.

Alternativas descartadas: padding inferior como única solución al solape a mitad de página, ocultación permanente del asistente o incremento ilimitado de z-index.

### 5. Teclado y datos oficiales con fronteras claras

Antes de aplicar el parche externo, repetir `git apply --check`; si falla, comprobar aplicación inversa y diff actual. Aplicar una vez o integrar la protección equivalente respetando cambios posteriores. Proteger `defaultPrevented`, inputs, textarea, select, contenteditable y roles editables/diálogo para las cuatro teclas; fuera de ellos mantener narrativa. Probar rueda en regiones con scroll propio para evitar que el listener global cambie capítulos al leer reseñas/diálogos.

Actualizar constante pública y referencias de ejecución con `692912180`, presentación `+34 692 91 21 80`, `tel:+34692912180` y `wa.me/34692912180`. Revisar cabecera, menú, contacto, asistente/fallbacks y datos estructurados; buscar números antiguos sin reemplazar referencias de productos o historia. Contacto mantiene borrador WhatsApp manual, probando apertura interceptada. Contacto oscuro podrá usar soporte de tema o variante existente del logo sin alterar recurso ni presentación clara innecesariamente. El correo interno no se publica ni se enruta desde cliente.

### 6. Runner reutilizable y evidencia textual

Usar Playwright instalado y servidor local, con Chromium y Firefox; intentar instalar binarios mediante mecanismo estándar si faltan. Fixtures/mocks se limitan a scripts/pruebas, identificados por caso y con envíos interceptados. Cubrir catálogo cargando, cargado, filtros/búsqueda, vacío, error/reintento, paginación y fin; cesta vacía/poblada y drawers con listas largas; ficha/galería/selección/formularios; presupuesto vacío/poblado, validación, enviando, error y confirmación; chat abierto, mensajes largos y bienvenida nueva/descartada.

Matriz obligatoria, CSS px, para Chromium y Firefox y temas claro/oscuro:

| Grupo | Viewports |
| --- | --- |
| Referencia | 1363×936 |
| Móvil vertical | 320×568, 360×640, 375×667, 390×844, 393×852, 430×932 |
| Móvil horizontal | 667×375, 844×390 |
| Tablet/modo | 768×1024, 1023×768, 1024×719, 1024×720, 1024×768 |
| Portátil | 1280×720, 1280×800, 1366×768, 1440×900, 1536×864 |
| Desktop | 1920×1080, 2560×1440 |
| Ultrawide | 2560×1080, 3440×1440 |

Añadir anchos 639/640/641, 767/768/769, 1023/1024/1025 y 1279/1280/1281 con alturas sensibles al layout (incluido 719/720/721) y cualquier breakpoint nuevo. Las siete secciones y todas las rutas representativas/presupuesto se recorren en la matriz completa; drawers/estados específicos al menos en tamaños críticos de sus layouts, con registro explícito de cobertura. Redimensionar en ambos sentidos y cambiar orientación sobre la misma sesión.

Esperar fuentes, medios relevantes, animaciones y estabilidad de rectángulos; timeout de estabilización se informa, no se convierte en aprobado. Identificar capítulo activo/visible y distinguir opacity/visibility, capítulos fuera de pantalla y recorte por ancestros. Medir cajas de logo, enlace, títulos y tarjetas por separado, cabecera, controles, contención y clipping vertical/horizontal. Hit-testing sobre puntos interactivos verifica que ninguna capa ajena los tape; contención geométrica y scroll útil detectan acciones/textos perdidos. Excluir explícitamente relaciones padre/hijo y overlays intencionales (tarjeta clicable, handle, media y carrusel), sin excluir sus controles de acceso.

Cada fila: navegador/versión, viewport efectivo, DPR, tema, ruta/sección/estado, origen real/fixture/mock, PASA/FALLA/NO PROBADO y causa. Cada fallo: dos elementos, medidas aproximadas, reproducción y resultado después. No confundir `deviceScaleFactor` con zoom: si hay zoom real 125%/200%, registrar mecanismo y viewport efectivo; si no, marcar no probado. No declarar teclado virtual físico ni dispositivo Apple por emulación. El informe nuevo `docs/audit/responsive-review-2026-10-09.md` contendrá evidencia actual, sin prompt antiguo; si aparece antes de implementar, leerlo y actualizarlo sin destruir evidencia válida.

Alternativa descartada: usar únicamente `scrollWidth`, Vitest, lectura CSS o aprobación visual histórica como gate responsive.

## Risks / Trade-offs

- [Matriz extensa y animaciones no deterministas] → Inventario parametrizado, espera de estabilidad por vista y salida por caso; repetir fallos y matriz afectada tras ajustes. No omitir combinaciones para ahorrar tiempo.
- [Cambio de gate pierde sección o callbacks] → Regresión de resize/orientación en ambos sentidos, capítulo activo, callback de logo, cascade y swipe/replay de Visión.
- [Mocks difieren del upstream] → Fixtures reales existentes, escenarios comerciales preservados y origen de datos explícito; mocks no acreditan backend ni recepción.
- [Firefox/binarios o backend no disponibles] → Intentar instalación estándar; registrar causa exacta NO PROBADO y continuar lo disponible, sin declarar matriz aprobada.
- [Dark/light regresan al corregir espacio] → Medir y revisar localmente ambos temas antes/después, incluida legibilidad de estados y marca, sin cambiar light por un fallo exclusivamente dark.
- [Trabajo ajeno o cambio concurrente] → Revisar status durante la tarea, preservar diffs previos y preguntar si aparece un archivo ajeno inesperado; stage explícito por archivo.
- [Evidencia geométrica no equivale a aceptación visual] → Revisión local de interacciones más informe textual; aceptación del propietario/ChatGPT permanece pendiente tras entrega.

## Migration Plan

### Decisiones adoptadas tras reproducción local

- Gate compartido: narrativa desde 1024 px de ancho con al menos 940 px de alto en columnas compactas (<1280); desde 1280 px, mínimo 880 px. A 1024×720 se medían Servicios hasta y≈780, Quiénes somos hasta y≈740 y controles de Opiniones hasta y≈724, con títulos bajo cabecera. Los nuevos umbrales se verifican también a ±1 px; 719/720 permanece como regresión obligatoria.
- Reserva lateral real para launcher/volver arriba y cesta compacta, porque padding inferior no evita solapes a mitad del scroll. Inicio desktop conserva foto a ancho completo, centrado y navegación inicial; las superficies restantes reservan el extremo de interacción. Bienvenida cede temporalmente si tapa contenido; launcher conserva acceso y diálogos externos tienen prioridad mediante inert/visibility, sin cambiar sus z-index por separado.
- Swatches con tracks acotados, gap y espacio de ampliación: a 1363×936 se reprodujo Olivo ampliado x≈784.3–894.2 contra Roble x≈699.4–787.3 (cruce≈3 px). Se mantiene scale-125 aprobado, reservando espacio alrededor.
- En Visión compacta se reprodujo cruce de título/párrafo ≈79 px de alto a 1024×940. Solo esa composición usa flujo para el texto; comparación/video/gesto/replay y composición amplia clara se preservan. Los textos oscuros y soportes de marca usan tokens/recursos existentes.
- La matriz final añade Testio (fixture IO con swatches, no ruta publicada afirmada) a las seis fichas representativas y ocho combinaciones de frontera de los gates nuevos: 44 tamaños × 2 navegadores × 2 temas × 16 vistas = 2816 casos geométricos. Interacciones y tiempos normales se entregan aparte.

No hay migración de datos. Implementar por causas, verificar casos y gates `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`; inspeccionar diff completo, teléfono y contratos preservados. Limpiar datos de la sesión de prueba y detener procesos propios. Crear commits coherentes y push a `main`/`origin` si sigue siendo la rama prevista al comenzar aplicación; si difiere, aclarar el destino sin restaurarlo. No hacer push con build roto ni fallos obligatorios causados por cambios pendientes de corregir. Las limitaciones de herramientas se entregan explícitas.

No promover despliegues ni tocar hosting. Si el push dispara despliegue habitual, entregar SHA para revisión posterior. Para rollback, confirmar el commit exacto, crear backup branch y revertir de forma dirigida/no destructiva; nunca restauraciones globales. La aceptación visual y tareas externas permanecen pendientes y no bloquean la entrega Git autorizada cuando los checks locales disponibles están resueltos.
