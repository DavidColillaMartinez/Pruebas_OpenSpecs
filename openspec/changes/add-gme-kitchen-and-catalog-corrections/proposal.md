# Incorporar cocina GME y corregir catálogo

## Why
Falta la familia de grifería de cocina del PDF IO 2026. La maneta empotrable Sirio se publicó como ducha independiente; Basic de bañera no sincroniza fotos con variantes y varios modelos comparten nombres sin indicar su tipo.

## What Changes
- Importar 11 productos, 23 variantes y 47 imágenes nativas siguiendo los contratos actuales.
- Separar grifería de baño/cocina con la faceta server-side `tap_scope`, accesible después de Familia→Grifería.
- Identificar explícitamente portada, fotografía grande y recorte del selector.
- Archivar la maneta Sirio independiente conservando la ducha completa e historial.
- Activar galería optativa por variante para Basic bañera con mapa exacto de 28 fotos y aviso para siete combinaciones sin foto.
- Distinguir nueve nombres ambiguos y corregir subtítulo de tarjetas.
- Preparar el rótulo «Grifería», la faceta y el filtro `tap_scope` en la consulta y el preparador n8n existentes; publicación comunicada por Codex, verificación completa tras despliegue pendiente.

## Capabilities
### New Capabilities
- gme-kitchen-catalog: datos de cocina, imágenes, retirada Sirio y nomenclatura.
- enclosure-variant-gallery: activación exacta de fotos de Basic.

## Impact
Frontend de catálogo, datos de catalog en Neon, nuevos WebP en el origen actual y rótulo/faceta/filtro de ámbito en SQL y preparador n8n. Sin cambios de esquema, migración JSON, eliminación de BD, cambios en bot, presupuestos o landing. Código integrado localmente sin commit; SQL en producción, despliegue y revisión final pendientes. Evidencias aportadas de assets y Chromium identificadas en la auditoría.
