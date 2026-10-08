## Context

Véase `proposal.md` para motivación y alcance. La revisión ha identificado estos puntos de extensión:

- `catalogQuery.ts` serializa filtros, perfiles de familia y offset de páginas de 24 productos. `getActiveCatalogFamilies` actualmente identifica Mamparas también por proveedor GME; esa coincidencia no distingue IO.
- `useCatalogDiscovery.ts` carga páginas y después solicita facetas con `limit=1`; su efecto de facetas no se ejecuta con cero productos. El cliente conserva caché, deduplicación de peticiones y prefetch por ruta.
- `types.ts` carece de las facetas IO y `ProductCard` no conserva `specs`. `normalize.ts` conserva specs públicos en detalle, normaliza imágenes y añade portada solo si no aparece ya: para IO hay que asegurar que portada esté primera incluso si se recibió más tarde en `images`.
- `ProductVariantSelector` ya emite origen inicial/usuario, pero no eje cambiado; usa reglas genéricas y solo exige compatibilidad estricta en Royo. `selection.ts` no incluye `tap_type` por defecto y puede priorizar ofertas comerciales.
- `ProductDetailPage` reemplaza la galería genérica por `selectedUnit.images`. `ProductGallery` ya proporciona navegación, deduplicación y fallback de error, pero no una petición independiente para activar una URL al cambiar acabado.
- La cesta v2 ya persiste en localStorage y usa producto + variante como identidad. `payload.ts` conserva proveedor/categoría/imagen fuera de `variantSnapshot`, por lo que hay que incluirlos dentro para IO.
- El cliente envía el contrato camelCase existente. `server/catalog/quoteBody.js` lo acepta, exige variante GME y limita cada string de snapshot a 300 caracteres; no se cambiará el contrato ni el validador.

### Evidencia del paquete de referencia

Se revisaron los cinco archivos indicados, incluidos sus datos estructurados: 42 productos, 362 filas de variantes, 356 referencias exactas y seis sin referencia; 450 entradas de manifiesto y 20 registros en `covers-v2.csv` (no es un inventario completo de las 42 portadas). `taxonomy-filters.json` conserva IDs nulos y categorías de preparación; no se importan a runtime. El manifiesto clasifica entradas por roles distintos del recuento de usos facilitado por el propietario: no demuestra que URLs remotas existan.

Sion tiene bajo/bidé, Paladio bajo/alto, Iony seis variantes de tres tipos y dos acabados, Persio/Miox 21 variantes cada uno; Sirio 1 función tiene seis acabados y galería de paquete vacía. El detalle API final sigue siendo la autoridad para IDs, nombres, fotos grandes y metadatos de selector.

## Goals / Non-Goals

**Goals:**
- Encapsular semántica IO en un módulo de modelo pequeño y conectar extensiones opt-in a los componentes actuales.
- Separar tres estados: consulta remota, configuración comercial y navegación de imágenes.
- Mantener persistencia y contrato actuales sin migraciones ni catálogo duplicado.

**Non-Goals:**
- Inferir rutas de assets, convertir categorías del paquete en categorías públicas, generar combinaciones o reestructurar componentes ajenos.
- Validar aceptación visual mediante herramientas: el usuario ha excluido navegador, capturas, Firefox y harness.

## Decisions

### 1. Identificación de producto estricta y contexto de consulta separado

Crear un helper de alcance que exija `supplierId === 'gme'`, `categoryId === 'griferia'` y marca booleana verdadera de specs normalizados. Preservar en tarjetas la marca API (en specs públicos o campo normalizado equivalente), sin inferirla del slug, nombre, proveedor solo o archivos locales. Detalle y tarjeta usan la misma comprobación.

El perfil de filtros describe la consulta a GME/griferia; no puede exigir una marca de producto antes de obtener resultados ni usar un producto de muestra para identificar resultados vacíos. Añadir perfil específico por proveedor y categoría; desambiguar Mamparas cuando categoría explícita es griferia, preservando su comportamiento en su alcance previo. Las reglas de galería, selector, tarjeta y presupuesto siempre exigen los tres criterios.

Alternativa descartada: aplicar reglas a todo GME, que alteraría Mamparas; inventar un parámetro de filtrado por specs, que no pertenece al contrato disponible.

### 2. Filtros API y facetas progresivas existentes

Extender claves, normalización de facetas, etiquetas, parseo URL y serialización del perfil IO con `catalog_section`, `tap_type`, `installation`, `mechanism`, además de collection, finish y subcategory. Usar `collection` como clave canónica; el alias `series` se verificará en las consultas reales del servidor. Enviar los valores exactos API, especialmente `Níquel`.

Reutilizar caché y ciclo de facetas existente, con una sola solicitud de facetas por consulta y sin añadir un hook paralelo. Permitir esa solicitud con resultados vacíos y no derivar opciones IO de las tarjetas de una página. Conservar facetas ya entregadas por el listado y evitar una solicitud extra si ya están disponibles. Cualquier cambio en parámetros de la primera petición debe mantener alineado el prefetch para evitar duplicación.

Al cambiar familia/proveedor, limpiar filtros dependientes incompatibles antes de solicitar resultados y usar las facetas del nuevo alcance para validar opciones restantes. Mantener información de familia raíz durante la transición para no dejar bloqueada la navegación. El mecanismo solo se muestra con Duchas; instalación/subcategoría permiten empotrables de lavabo/bidé. Offset se reinicia por el mecanismo existente de cambio de consulta.

Alternativa descartada: descargar los 42 productos y filtrar localmente, porque perdería paginación y facetas de servidor.

### 3. Presentación común de tarjeta

Conservar `CatalogProductCard` y sus marcos y estados de carga/error. Dentro del guard IO, priorizar portada API, usar nombre API y omitir colección redundante; usar subcategoría como texto secundario cuando sea útil. No cambiar proporción, altura, overlays o imagen fuente por familia. Los precios siguen fuera de UI y datos comerciales.

Alternativa descartada: una tarjeta GME independiente, que divergirá del contrato de alineación común.

### 4. Galería completa y activación explícita por evento

Un builder IO memoizado por producto construirá portada → imágenes de producto → imágenes grandes de todas las variantes, con deduplicación estable por URL y exclusión de URLs clasificadas como selectores. Respetar orden API/`sort_order` dentro de grupos y conservar dimensiones/roles. Usar exclusivamente URLs API; no usar rutas locales ni inferencia por slug.

Extender de forma opt-in `ProductGallery` con una petición de activación por URL y una identidad de evento que permita volver a activar el mismo acabado después de navegar manualmente. Mantener internamente la navegación actual y aplicar el cambio solo cuando llega un evento válido; no convertir `selectedUnit.images` en la galería. Sin URL de foto grande no emitir activación.

Añadir a la metadata de selección el eje cambiado solo para IO (o un callback equivalente), de modo que origen `initial` y cambios de tipo no activen fotografías. Para `finish` manual, resolver foto grande por acabado real: variante seleccionada, otras variantes del mismo acabado si comparten foto y respaldo `finish_image_urls` por nombre. Si solo existe respaldo grande API, incorporarlo a la galería completa para que la activación siga siendo navegable. Nunca usar `selector_image_url` como fallback. Evitar etiquetas que atribuyan a la selección comercial una foto navegada de otro acabado.

Alternativa descartada: reordenar fotos al cambiar acabado, que confunde portada/navegación; controlar foto mediante la variante en cada render, que deshace la navegación manual.

### 5. Variantes y muestras en el selector actual

Reutilizar `ProductVariantSelector` con una rama IO y helpers de modelo. Obtener unidades únicamente de `product.variants`, sin priorizar ofertas para IO. Construir ejes y opciones desde atributos reales: `tap_type`, `finish` y solo instalación/mecanismo con alternativas reales intraproducto. Metadatos de specs aportan etiquetas y muestras, nunca variantes nuevas.

Relacionar acabado mediante `finish_options[].name`; `value` solo identifica metadatos. Resolver muestras de opciones/specs y atributos de variantes con URLs API; conservar opciones de texto en ausencia de muestra. Mostrar ejes únicos como hechos. Excluir URLs de selector y metadatos técnicos de atributos comerciales enviados.

Exigir coincidencia completa con una variante y deshabilitar valores sin una combinación compatible; no caer silenciosamente en una unidad inicial cuando la selección esté incompleta. Cambios compatibles pueden conservar otros ejes, pero nunca sintetizar una unidad. Referencia opcional y ID obligatorio; las seis variantes sin referencia siguen válidas.

Alternativa descartada: producto cartesiano de todas las opciones y selector con referencia como identidad, que inventaría variantes y bloquearía Níquel.

### 6. Snapshot enriquecido dentro del contrato vigente

En `buildQuoteRequestItem`, añadir exclusivamente para IO un snapshot público con IDs/nombres de proveedor y categoría, modelo API, atributos seleccionados y atributos descriptivos API de instalación/mecanismo, referencia si existe e imagen comercial API. Mantener `productId`, `variantId`, `quantity`, `productName` y demás campos camelCase existentes: no introducir claves top-level snake_case rechazadas por el proxy. El normalizador aguas abajo mantiene sus equivalencias.

La imagen del presupuesto se decide desde la variante/foto comercial y portada de producto, no desde la foto que el usuario esté explorando ni desde muestras. Preservar cesta v2, identidad y cantidades actuales; probar recarga con proveedor mixto. Comprobar límites del validador existente, especialmente imagen dentro de snapshot (300 caracteres): si una URL API supera el límite, documentar el bloqueo concreto y solicitar resolución de contrato, sin truncar/inventar URL ni modificar backend unilateralmente.

Alternativa descartada: una cesta IO separada o el modo compacto Duplach, que rompe identidad y obligatoriedad de variante.

### 7. Bloqueo de transporte fuera del alcance autorizado

La allowlist común en `server/catalog/proxy.js` elimina `catalog_section`, `tap_type`, `installation`, `mechanism` y `series` tanto en dev como en producción. El frontend no puede satisfacer esos filtros mediante este proxy sin que se habiliten.

Decisión: conservar el alcance frontend y registrar como prerrequisito pendiente la autorización expresa del propietario para la ampliación mínima de allowlist y su prueba, o la actualización por el propietario. Una autorización futura permite únicamente esos parámetros en el proxy existente, sin otro backend, rutas, SQL o n8n. No usar endpoints alternativos ni acceso directo para eludirlo. No declarar integración completa mientras ese bloqueo permanezca.

## Risks / Trade-offs

- [Mock local confundido con API real] → Identificar destino configurado antes de GET técnicos; reportar mock como mock y ejecutar las cuatro consultas reales solo cuando exista acceso por proxy.
- [API real difiere del paquete preparatorio] → Mantener detalle API como autoridad; fixtures aislados con IDs de prueba claramente identificados, sin cargar archivos externos en runtime.
- [Assets aún sin subir] → Registrar URL/archivo exacto que falle en comprobaciones técnicas accesibles; mantener fallback existente y dejar verificación visual al propietario.
- [Extensiones compartidas alteran otras familias] → Guard estricto, props opcionales con defaults actuales y pruebas de regresión de Royo, Duplach, Espejos y Mamparas/GME, incluyendo GME/griferia sin marca IO.
- [Trabajo previo y número de archivos] → Conservar los dos archivos premodificados; antes de implementar enumerar los archivos estrictamente necesarios. Esta integración transversal probablemente supera cinco archivos por tipos, consulta, galería, selector, presupuesto y pruebas: explicar el alcance y detenerse para confirmación conforme a AGENTS.md antes de ampliarlo.
- [Comprobaciones técnicas no prueban apariencia] → No ejecutar herramientas visuales por instrucción expresa; declarar revisión visual pendiente del usuario.

## Migration Plan

1. Resolver autorización de allowlist y confirmar alcance de archivos; identificar disponibilidad del proxy real sin exponer secretos ni sustituir entorno del usuario.
2. Implementar tipos/normalización/helpers, descubrimiento, tarjeta, selector/galería y snapshot como extensiones IO aisladas, con pruebas significativas.
3. Ejecutar `npm test`, `npm run lint`, `npm run typecheck` y `npm run build`; documentar fallos previos sin ampliar alcance. Verificar solo GET de API real y assets accesibles, nunca POST de presupuesto real.
4. Revisar diff/status y ausencia de nuevos cambios en landing, conservar cambios previos, stage explícito de archivos propios y commit descriptivo; push a la rama actual según la solicitud del usuario. Si faltan gates de revisión manual del propietario, mantener entrega/aceptación pendientes según guardrails y acordar el cierre.
5. Para rollback, confirmar commit exacto, crear rama de respaldo y usar revert dirigido no destructivo; sin migraciones de datos ni limpieza amplia.
