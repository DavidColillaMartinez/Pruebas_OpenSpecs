# Diseño

Se mantienen API y vistas actuales. El nuevo ámbito tap_scope clasifica mediante los specs tap_type_values existentes (`cocina` frente a usos de baño), y se filtra en el SQL de listado. Su faceta se calcula sin aplicar el ámbito seleccionado para que las dos opciones sigan disponibles al alternar. No requiere migración ni nuevas columnas.

Los productos usan specs.gme_io_2026 y catalog_version=io-2026-final porque la consulta existente limita sus facetas a ese contrato; source_package_version distingue esta incorporación. tap_type=cocina, installation=vista y mechanism=monomando. El flujo de detalle existente incorpora raw_data.image_path de cada variante, por lo que no requiere cambiarlo.

Las portadas son fotos reales del PDF y las miniaturas son recortes nativos aislados. Las rutas se alojan bajo images/gme_griferia/io-2026; selectores nunca entran en la galería grande ni en la foto del presupuesto. No se duplican las portadas bajo otra URL para la primera variante.

Basic habilita specs.variant_gallery=true y un mapa de imagen por variante; el frontend solo activa esa lógica cuando proveedor, categoría y flag coinciden. Conserva la galería entera y navega por ella sin cambiar la configuración. Si una selección manual carece de foto exacta se muestra aviso, sin invalidar el presupuesto ni simular otra combinación.

Los cambios de nombres conservan identificadores, rutas y el nombre original como alias. La maneta Sirio se archiva/inactiva, no se borra ni se mezcla con referencias de ducha.

SQL transaccional con guardas y snapshot de retorno por import_run. Según las evidencias del paquete, los cambios se probaron en [rama privada omitida] y el retorno en [rama privada omitida]. El retorno conserva contenido anterior salvo updated_at actualizado por el trigger de auditoría; mantiene los productos nuevos archivados. La auditoría registra evidencias aportadas de assets (47/47 HTTP y SHA256) y revisión local en Chromium con API simulada; no se han repetido en esta revisión. Siguen pendientes Safari/macOS, Basic de bañera y presupuesto en navegador, SQL en producción, despliegue y verificación de endpoints tras despliegue.
