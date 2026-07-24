## Why

La landing ha conservado en Coleccion la presentacion descartada de tarjetas y ha perdido el fondo blanco que definia la experiencia minimalista original. Antes de optimizar los gestos de Inicio y Vision, es necesario recuperar y validar esa referencia visual, y revisar que el catalogo desplegado pueda funcionar con las variables server-side reales sin alterar sus cinco tareas OpenSpec pendientes.

## What Changes

- Recuperar en desktop la composicion minimalista original de Coleccion, eliminando de su presentacion activa contenedores, sombras y superficies de tarjetas.
- Restaurar el fondo blanco permanente de la landing minimalista y auditar los cinco capitulos desktop y todas las secciones mobile frente a la referencia anterior al tema oscuro.
- Detener la implementacion tras esa recuperacion para obtener confirmacion visual del propietario antes de crear el primer commit.
- Auditar el catalogo, el cliente relativo `/api/catalog`, el proxy server-side, los nombres de variables de Vercel, los rewrites SPA/API, listado, detalles y normalizacion publica de `PRODUCT_NOT_FOUND`, sin ejecutar solicitudes POST reales.
- Cambiar Inicio desktop para que un unico avance revele el primer articulo y programe los dos siguientes con intervalos de un segundo, reduciendo pasos de scroll sin cambiar contenido ni composicion.
- Cambiar Vision para pasar automaticamente del final del video al comparador drag, omitir el boton Revelar y mantener permanentemente el boton SVG de replay en su posicion actual.
- Mantener una sola reproduccion automatica del boceto durante la sesion; al volver a Vision se mostrara directamente el comparador y el video solo se repetira por accion explicita del usuario.
- Eliminar cualquier paso de scroll ciego en Vision: cada gesto dentro del capitulo debe producir una transicion visible o avanzar al siguiente capitulo.
- Respetar `prefers-reduced-motion`, teclado, foco y operacion tactil en las secuencias nuevas.
- Mantener fuera de alcance cualquier cambio de tema, navegacion, contenido, media proporcionada por el usuario, workflows n8n o tareas pendientes de privacidad/hosting.

## Capabilities

### New Capabilities
- `minimal-landing-visual-baseline`: composicion minimalista unica, fondo blanco y comprobacion de paridad visual desktop/mobile.
- `catalog-deployment-readiness-audit`: contrato de auditoria para cliente relativo, proxy, variables server-side, rewrites y verificaciones GET sin presupuestos reales.
- `intro-sequenced-reveal`: revelado de los tres articulos de Inicio desde un solo avance con stagger temporal accesible.
- `vision-direct-compare-replay`: transicion automatica video-comparador, replay permanente y reproduccion automatica unica por sesion.

### Modified Capabilities
- (ninguna; no existen specs raiz en `openspec/specs/`).

## Impact

- Landing: `src/App.jsx`, `src/styles/index.css`, `src/sections/desktop/Inicio.jsx`, `src/sections/desktop/Coleccion.jsx` y, solo si la auditoria demuestra una diferencia real, las secciones mobile afectadas.
- Vision: `src/sections/desktop/Vision.jsx` y `src/sections/mobile/Vision.jsx`; se preservan `src/components/CompareSlider.jsx`, `assets/Boceto/**` y `public/boceto-final.png` salvo necesidad funcional demostrada y aprobacion expresa.
- Catalogo: auditoria de `.env.example`, `api/catalog/[...path].js`, `vite.config.js`, `vercel.json` y `src/features/catalog/api/client.ts`; cualquier correccion se limitara a configuracion/proxy y mantendra los upstreams fuera del bundle.
- OpenSpec existente: `implement-product-detail-page` conserva sus cinco tareas pendientes sin marcarlas, reinterpretarlas ni cerrarlas.
- Sin dependencias visuales nuevas, sin POST real de presupuesto y sin push automatico.
