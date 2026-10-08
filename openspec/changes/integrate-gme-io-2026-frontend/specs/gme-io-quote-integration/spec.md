## Purpose

Conservar la configuración real de GME IO 2026 en la cesta genérica persistente y en las solicitudes de presupuesto existentes, con identidad de variante y sin precios.

## ADDED Requirements

### Requirement: Identidad y persistencia compartidas
El sistema SHALL usar identidad `productId + variantId` para líneas GME IO, sumar cantidades al añadir la misma variante y crear líneas distintas para variantes distintas. SHALL persistir al navegar y recargar y compartir estado entre ficha, resumen del catálogo y `/presupuesto`. Añadir SHALL dar feedback breve sin navegación automática.

#### Scenario: Añadir misma y distinta variante
- **WHEN** se añade dos veces la misma variante y una vez otro acabado del mismo producto
- **THEN** existen dos líneas con cantidades dos y uno respectivamente.

#### Scenario: Persistencia y feedback
- **WHEN** se añade una variante, se navega al catálogo y se recarga `/presupuesto`
- **THEN** se conserva la misma selección y cantidad en el estado compartido y añadir no ha abierto otra página.

### Requirement: Snapshot completo compatible con contrato existente
Cada artículo GME IO SHALL contener producto, variante real, cantidad y nombre de producto mediante el contrato actual equivalente a `product_id`, `variant_id`, `quantity`, `product_name_snapshot` y `variant_snapshot`. Dentro del snapshot SHALL conservar proveedor, categoría, modelo, tipo, acabado, instalación/mecanismo cuando correspondan, referencia si existe e imagen API comercial. SHALL excluir precios y Puntos de cesta, resumen y payload, y no utilizar el modo compacto sin variante de Duplach.

#### Scenario: Payload comercial completo
- **WHEN** se prepara una solicitud con lavabo alto Níquel Persio
- **THEN** `items[]` incluye ID real de variante, cantidad, nombre y snapshot con proveedor, categoría, modelo, tipo, acabado e imagen, sin precios ni referencia inventada.

#### Scenario: Atributos de ducha
- **WHEN** se prepara una solicitud de ducha termostática empotrable
- **THEN** conserva instalación y mecanismo API en el snapshot junto a la variante seleccionada.

#### Scenario: Sin variante completa
- **WHEN** una selección GME no tiene ID de variante real
- **THEN** no puede añadirse ni enviarse usando el modo compacto de Duplach.

### Requirement: Compatibilidad y comprobación sin solicitudes reales
El sistema SHALL conservar el flujo actual de presupuesto de otros proveedores y verificar payloads mediante pruebas aisladas sin enviar solicitudes reales de prueba a clientes ni cambiar n8n.

#### Scenario: Cesta mixta
- **WHEN** la cesta contiene GME IO, Royo, Duplach, Espejos y Mamparas
- **THEN** cada línea conserva su identidad y contrato previo, incluida la configuración compacta autorizada únicamente para Duplach.
