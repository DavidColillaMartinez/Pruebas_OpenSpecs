## Context

El frontend ya dispone de cliente y normalizadores de catálogo, selección de variantes, galería y cesta genérica en `src/features/catalog` y `src/features/quote`. La API pública del proyecto ya está preparada para Royo: el listado acepta `modularity=modular|normal`, el detalle entrega `modularity`, especificaciones de configuración, mapas de imágenes y variantes, y las imágenes de producción se sirven desde las URLs entregadas por API.

El paquete de referencia `/media/test/Program/Downloads/switch/royo-muebles-bano-2026-2027(1)` confirma dos grupos de catálogo, las colecciones modulares y normales, la portada completa `001-cover.webp`, la galería ordenada, las correspondencias inequívocas de acabados y la ausencia de precios. El frontend no debe copiar estos assets ni regenerar sus rutas: solo debe consumir el contrato público.

La modificación es deliberadamente acotada a listado, ficha, `/presupuesto`, hooks, tipos y componentes compartidos estrictamente necesarios, más sus tests. La landing y sus estilos, assets, backend, Neon/PostgreSQL, SQL, n8n, VPS, espejos y mamparas/GME quedan fuera del cambio.

## Goals / Non-Goals

**Goals:**

- Aplicar el filtro Modular/Normal solo dentro del ámbito exacto `supplier_id=royo` y `category_id=muebles-y-lavabos`, enviándolo al servidor en cada consulta.
- Modelar los campos Royo recibidos por API sin derivar modularidad, portadas, acabados, medidas o variantes desde nombres, slugs, imágenes o textos.
- Representar únicamente variantes y combinaciones comerciales reales.
- Mantener la galería completa del producto y usar una imagen rápida de variante solo como primera imagen cuando exista.
- Añadir muebles modulares y normales a la cesta genérica con identidad `productId + variantId`, persistencia y payload sin precios.
- Mantener el comportamiento actual de Espejos, Mamparas/GME y otros proveedores mediante pruebas de no regresión.
- Validar con tests, comprobaciones de los endpoints del proxy, lint, typecheck, build y revisión del diff.

**Non-Goals:**

- Modificar landing, página principal, navegación de landing o estilos ajenos a tienda, catálogo y presupuesto.
- Modificar o subir assets, imágenes, backend, base de datos, SQL, n8n, VPS o proxy salvo que una adaptación estrictamente frontend sea imprescindible para consumir el contrato ya existente.
- Crear composiciones comerciales, módulos, medidas o variantes que no tengan referencia real en la API.
- Mostrar, calcular o persistir precios.
- Hacer capturas, montar un harness visual, usar Firefox o realizar comprobaciones visuales.

## Decisions

### 1. Guard de ámbito Royo antes de aplicar reglas específicas

Se añadirá una comprobación reutilizable que compare, normalizados, `supplier_id === 'royo'` y `category_id === 'muebles-y-lavabos'`. La lógica de modularidad, los tipos de especificación y las reglas de imágenes solo se activarán cuando ambos identificadores estén presentes; no se usará el slug, el nombre ni una coincidencia parcial como sustituto.

El estado de consulta incorporará la modularidad como valor cerrado `modular | normal`. Al serializar una consulta, el cliente solo enviará `modularity` si el ámbito Royo es válido y el valor pertenece al conjunto permitido. Para el resto del catálogo se conservarán exactamente las claves y valores existentes, sin enviar ni filtrar modularidad en React después de recibir la respuesta.

Alternativas descartadas:

- Filtrar la respuesta en React: rompe paginación y facetas del servidor y contradice el contrato del endpoint.
- Identificar Royo por slug, marca visible o nombre: puede aplicar reglas a productos ajenos y no representa el contrato de datos.
- Hacer `modularity` un filtro global: contaminaría las familias existentes con una condición que solo pertenece a Royo.

### 2. Adaptador de datos API-preserving

Se ampliarán los tipos y la normalización para conservar `modularity`, `main_image_url`, `main_image_path`, `images`, `specs.modular_notice`, `specs.module_configuration`, `specs.finish_image_map` y los atributos reales de las variantes. Los campos opcionales ausentes permanecerán como `undefined` o `null`; no se aplicarán valores booleanos por defecto ni conversiones semánticas no confirmadas.

La portada de tarjeta se resolverá desde el valor de imagen que entregue la API, priorizando `main_image_url` y su representación `main_image_path` únicamente según el contrato del adaptador, sin reconstruir una ruta basada en slug. En detalle, `product.images` será la fuente completa de la galería. Los datos de configuración modular se mostrarán como información mientras no existan referencias exactas de composición.

Alternativas descartadas:

- Hardcodear la lista de diez colecciones modulares como clasificación: la clasificación real es el campo `modularity` de cada respuesta.
- Fabricar `specs` o completar ausencias con `false`: ocultaría diferencias entre datos no entregados y datos explícitamente negativos.
- Construir rutas con el prefijo de assets: las URLs públicas ya forman parte del contrato y los assets quedan fuera de alcance.

### 3. Selección basada en unidades reales

La selección se derivará de las variantes reales entregadas para el producto. Cada control se construirá con valores presentes en dichas variantes y, cuando proceda, con atributos públicos declarados por la API. Un valor será seleccionable solo si existe una unidad completa compatible; al cambiar un atributo se conservará una unidad compatible determinista o se dejará la selección incompleta. Nunca se calculará un producto cartesiano.

`measure_options`, `depths_cm`, `module_types` y otros datos de `module_configuration` se renderizarán como información de configuración cuando no estén ligados a referencias comerciales exactas. Un único valor de medida se mostrará como dato, no como grupo de botones. En muebles normales, `presentation_types` y `type_image_map` solo producirán controles si el contrato los asocia a una variante u opción comercial real.

El botón de añadir exigirá una unidad con `variantId` real y todos los atributos comerciales requeridos. Las variantes de ofertas solo se utilizarán si el adaptador confirma su identidad comercial y relación con la unidad, manteniendo el camino genérico que ya usan otras familias.

Alternativas descartadas:

- Generar botones a partir de etiquetas de configuración: convertiría información técnica en opciones comerciales ficticias.
- Seleccionar por índice de array: los índices no son identificadores persistentes.
- Mantener un camino exclusivo para Royo o Espejos: duplicaría reglas y arriesgaría regresiones en GME y otros proveedores.

### 4. Galería deduplicada con atajo no destructivo

Se creará una función pura para construir la galería efectiva a partir de `product.images` y de las imágenes de la unidad seleccionada. Deduplicará por URL API-preservada, colocará primero la imagen rápida inequívoca cuando exista y después conservará todas las imágenes del producto en su orden. No se sustituirá la galería por `selectedUnit.images`.

La selección de acabado solo activará el atajo si la variante real o `finish_image_map` aporta una correspondencia inequívoca. Sin esa imagen, la selección conservará el índice o URL activa y no cambiará automáticamente la galería; el acabado sí permanecerá en la selección de presupuesto. Los atajos de tipo y de combinación tipo + acabado seguirán la misma regla y solo se usarán si la API entrega esa correspondencia.

Alternativas descartadas:

- Mostrar únicamente la imagen de la variante: oculta contenido editorial válido y rompe la navegación completa.
- Inventar una URL a partir de `finish`, slug o nombre de archivo: puede apuntar a un asset inexistente o incorrecto.
- Reiniciar siempre al índice cero: cambia la imagen activa incluso cuando el acabado no tiene imagen asociada.

### 5. Cesta genérica como única fuente de selección

La ficha construirá una línea mediante el store genérico ya usado por el catálogo. Para Royo, la clave será `productId + variantId`; no se guardará solo el producto cuando exista una variante. La línea conservará proveedor, categoría, nombre, imagen principal, referencia/SKU, atributos públicos seleccionados, medida, acabado, tipo, tipo de módulo cuando exista y cantidad, excluyendo claves de precio.

El store seguirá persistiendo en `localStorage` y será consumido por el resumen del catálogo y `/presupuesto`. La fusión de líneas incrementará cantidad solo ante la misma identidad; otra variante del producto conservará una línea independiente. El feedback de añadido será local y breve, sin navegación automática a `/presupuesto`.

Si es necesario adaptar la clave o el tipo compartido, se hará mediante una extensión compatible: se conservarán los identificadores alternativos que ya necesiten familias existentes y se cubrirán con tests Espejos, Mamparas/GME y proveedores ajenos. No se añadirá estado paralelo específico de Royo.

### 6. Verificación por contrato y comportamiento

La implementación comprobará mediante el proxy los dos listados filtrados y el detalle `royo-modular-logika`, sin modificar el upstream. Si un campo requerido por el flujo no está presente, se registrará en la documentación de la implementación el endpoint y el campo ausente y se mantendrá opcional en el modelo.

Los tests usarán respuestas controladas para probar normalización, selección, galería, store y payload; no presentarán fixtures como prueba de producción. La validación de producción será independiente y se limitará a las URLs solicitadas, sin POST real desde tests.

## Risks / Trade-offs

- [La forma real de una variante Royo difiere de la documentación] → Inspeccionar las respuestas del proxy antes de fijar adaptadores; conservar campos desconocidos como opcionales y no inventar su significado.
- [Un campo de configuración contiene información sin referencias comerciales] → Renderizarlo como información y bloquear la conversión a control hasta disponer de una variante real.
- [La imagen rápida usa una estructura distinta entre variantes modulares y normales] → Centralizar la lectura de URLs entregadas por el adaptador y probar URL directa, path resuelto por API y ausencia de imagen.
- [Una adaptación compartida rompe una familia existente] → Mantener el guard de ámbito, ejecutar las pruebas actuales de Espejos/GME/otros proveedores y añadir casos explícitos de no regresión.
- [El store legado contiene líneas sin la nueva forma] → Mantener la normalización defensiva existente, rechazar líneas incompletas y no reconstruir atributos desde slugs.
- [La API no expone algún campo en producción] → Dejarlo en `undefined`/`null`, documentar endpoint y campo, y mantener el flujo funcional sin asumir una sustitución.
- [Las portadas o assets aún no están disponibles en el host] → No modificar assets ni rutas; reportar el bloqueo de disponibilidad como problema de API/infraestructura si el endpoint no entrega una URL utilizable.

## Migration Plan

1. Revisar los tipos, query builder, normalizadores, selección, galería y store actuales para localizar los puntos de extensión mínimos.
2. Verificar mediante el proxy los dos endpoints de listado y el detalle modular indicado y registrar cualquier campo ausente.
3. Implementar el guard Royo, el parámetro `modularity` y la normalización API-preserving sin cambiar consultas ajenas.
4. Integrar variantes reales, reglas de selectores, configuración informativa y galería no destructiva en la ficha.
5. Conectar la ficha Royo con la cesta genérica y asegurar resumen, persistencia y payload completo en `/presupuesto`.
6. Añadir o actualizar tests de comportamiento y no regresión.
7. Ejecutar `npm test`, `npm run lint`, `npm run typecheck`, `npm run build` y revisar `git diff`/`git status` para confirmar el alcance.

Rollback: retirar el filtro y las proyecciones específicas de Royo y conservar las rutas existentes de catálogo, ficha y presupuesto. No habrá migración de datos ni cambios de assets que requieran rollback.

## Open Questions

- ¿El proxy devuelve `main_image_url` y `main_image_path` simultáneamente en todos los listados, o alguno de ellos solo aparece en ciertos modelos?
- ¿Las variantes normales de tipo de presentación exponen siempre `variantId` propio o algunas opciones siguen siendo solo informativas?
- ¿Qué campos exactos usa la API para SKU/referencia y para los atributos de tipo de mueble y tipo de módulo en cada grupo?
- ¿Existe algún caso Royo con `commercial_offer_variant_id` que deba permanecer en la identidad además de `variantId`, o todas las líneas Royo disponen de `variantId`?
