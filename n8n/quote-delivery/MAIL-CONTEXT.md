# Identificación comercial en los correos de presupuesto

Actualización del 14/10/2026 sobre el envío transitorio. El parche acumulado
`area-lrmq-presupuestos-final.patch` parte del parche sin almacenamiento ya aplicado
por el propietario. Sustituye al primer parche de identificación de artículos.
Si ese primer parche también está aplicado, usar únicamente el parche incremental
`area-lrmq-presupuestos-completar.patch`. No aplicar ambos ni importar el
workflow sobre producción: n8n se actualiza mediante su MCP con las credenciales
existentes.

El correo muestra nombre, tipo de producto, proveedor, categoría, selección
canónica, opciones, referencia publicada, identificadores internos y ficha.
Las variantes reales se describen con hechos del catálogo, no con una copia
antigua enviada por el navegador. Se traducen tipos de grifo, instalación,
mecanismo, presentación de muebles y abreviaturas de cajones/puertas. Se omiten
medidas y acabados equivalentes repetidos. La iluminación se limita a los
productos que la soportan. Los platos compactos conservan únicamente opciones
validadas; familia de acabado y válvula se resuelven contra el catálogo.

La revisión de la vista publicable encontró 151 fichas y 1.632 variantes activas:
53 espejos, 42 fichas de grifería, 21 mamparas, 27 muebles/lavabos y 8 platos.
409 variantes tienen la referencia vacía: 278 mamparas, 125 muebles modulares y
6 opciones Níquel de Miox/Persio. Los ocho platos se configuran mediante opciones
y no tienen SKU publicado. El código no genera una referencia de fabricante a
partir de un identificador interno. Esta carencia se hace explícita en el correo.

Las mamparas no tienen medidas de instalación publicadas ni selector de medidas.
El correo pide confirmarlas con el cliente y revisar sus observaciones. Los diez
modelos modulares Royo solo recogen acabados, tiradores y encimera donde proceda;
el catálogo indica que composición y medidas se confirman antes de presupuestar.
El correo transmite esa condición, sin aparentar que se seleccionó un conjunto
cerrado. La recopilación por teléfono/email forma parte de preparar el presupuesto;
este cambio no incorpora un configurador de medidas o módulos al formulario.

Diez referencias de grifería aparecen en distintos modelos del mismo proveedor.
La consulta detecta esta situación en los productos publicables actuales y pide
verificación con el proveedor, manteniendo el código publicado. No se sustituyen
referencias duplicadas sin documentación que acredite el código correcto.

La comprobación completa detectó además 36 variantes Royo con algún acabado
declarado en las opciones de la ficha pero ausente de la variante: Alfa Compact,
Bassi, Essence Compact, Logika Compact y Vida Compact. Un valor elegido por el
cliente solo se conserva si está en la lista publicada de opciones, identificándolo
como preferencia pendiente de compatibilidad; si falta, el correo pide confirmarlo.
Los datos contradictorios de acabado/medida entre la variante publicada y los
atributos complementarios también generan una indicación de revisión. El acabado
del mueble sigue el valor publicado de la variante, evitando mostrar dos acabados
incompatibles como si ambos fueran correctos.

Validación: 26 pruebas de resolución/formato pasadas y una comprobación local de
1.640 casos procedentes de una consulta de catálogo de solo lectura: las 1.632
variantes reales y una configuración válida de cada uno de los ocho platos.
Se ejecutó tanto la lógica modular como el código exacto exportado de n8n y sus
resultados coincidieron. Todas las opciones seleccionables están representadas
o indicadas como pendientes. Se detectaron dos contradicciones de acabado, en
Vida Compact y Wave Compact, que ahora se explicitan. No se envió correo real.

Flujo n8n publicado por MCP y verificado activo, con los dos nodos coincidiendo
con las fuentes: versión `0d0e43f9-a45c-4645-82e5-9319d4de3914`.
Conserva 12 nodos y guardado de éxito/error/manual deshabilitado. No se modificó
el catálogo ni se crearon solicitudes o credenciales. El parche no requiere
ejecutar migraciones SQL: 004 es la consulta usada por el nodo ya actualizado.

No hay escrituras de solicitudes en Neon, colas nuevas, credenciales nuevas ni
envíos reales para verificar este cambio. La clave de idempotencia v2 se mantiene:
una repetición de una solicitud antigua cuyo formato haya cambiado puede devolver
409 de Resend y debe tratarse como incierta, sin reenviarse con una clave distinta.
Las correcciones de SKU en el catálogo requieren los datos originales del
proveedor. El objetivo de este cambio es que la solicitud recibida sea inequívoca
y diga qué falta confirmar; no certificar los códigos de fabricante ausentes.
