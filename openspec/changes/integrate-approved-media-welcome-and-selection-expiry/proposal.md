# Propuesta: medios definitivos, jerarquía de textos, bienvenida móvil y caducidad de la selección

## Why

- El propietario aportó un lote definitivo de fotos, vídeos, reseñas y logotipos, ya convertido y alojado en el VPS público
  (`https://assets.colilladavid.es/proyectos/lrmq/site/media-20261015`). El código sigue apuntando a Unsplash, PNG/WebP antiguos
  y archivos con nombres previos, por lo que las imágenes visibles no son las aportadas.
- En Servicios la tarjeta principal repite «Reformas integrales» como etiqueta y título, y en Quiénes somos la jerarquía
  actual de encabezados no corresponde al texto que el propietario aprobó.
- En móvil, la primera entrada del asistente muestra la burbuja de bienvenida con una franja opaca de ~244 px que tapa la web
  (reserva de la región de herramientas vía `body:has(.assistant-welcome)` y `body::after`).
- La selección de presupuesto se conserva indefinidamente; el propietario aprobó caducidad de 7 días sin cambios con una
  opción voluntaria «Recordar en este dispositivo».

## What Changes

1. **Medios VPS**: la base pública cambia a `…/site/media-20261015`; fotografías nuevas en Inicio (desktop/móvil), Quiénes
   somos (dos detalles 2,7:1 desktop, originales verticales móvil, Equipo), Servicios (escalera) y masthead del catálogo
   (fachada). Vídeos, póster, boceto final, reseñas (WebP) y logotipos se renombran en la configuración central
   `src/config/mediaAssets.ts`. El PNG de redes sociales se conserva; el favicon pasa a `logo-marca-512.webp`.
2. **Textos**: Servicios muestra el título «Reformas integrales» y suprime la etiqueta redundante cuando coincide con el
   título. Quiénes somos promueve el párrafo de experiencia a h2 y elimina «Experiencia y oficio en cada reforma.»
3. **Bienvenida móvil**: se elimina la reserva de franja de 244 px; la burbuja queda como tarjeta flotante sin backdrop ni
   superficie extra.
4. **Selección con caducidad**: formato v3 con metadatos (recordar, actualizado, vence). 7 días por defecto, opción
   «Recordar mi selección en este dispositivo hasta que la borre» desmarcada por defecto, migración única desde v2,
   comprobación al montar, visibilidad/foco y evento `storage`. Operaciones sin cambio real no renuevan el plazo.

## Non-goals

- No se modera Visión/CompareSlider, catálogo de proveedores, backend de presupuestos, n8n, Resend, Neon, DNS ni credenciales.
- No se añaden binarios al repositorio, ni `public/media/`, ni fallback local, ni CMP/banner/análisis.
- No se ejecutan limpieza de VPS, `retirar-antiguos.sh`, commit, push ni despliegue: el propietario revisa localmente.
- No se alteran los textos de las otras categorías, las clases de visual ni los comporta mientos de los controles flotantes.

## Risks / Trade-offs

- La eliminación de la franja de bienvenida acorta el scrollport móvil mientras la burbuja está visible; se verifica que el
  dock de catálogo y los botones flotantes siguen operativos (la franja del dock de 64 px no se toca).
- El registro v2 sin fecha migra una vez a 7 días desde la migración; se documenta sin inventar antigüedad histórica.
- Las fotos verticales en cajas 16:10 se recortan con foco local; se revisa visualmente cada marco.
