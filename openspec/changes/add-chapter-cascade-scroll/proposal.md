## Why

La landing actual concibe el scroll como narración, pero dentro de cada capítulo el usuario debe seguir girando la rueda para revelar cada bloque de contenido (pasos `step`). Esto diluye la sensación de "capítulo" y obliga a gestos repetidos para ver contenido que debería llegar solo. Queremos que el scroll signifique únicamente "cambiar de capítulo" y que, al entrar, el contenido se revele en cascada automática, respetando lo ya construido: ninguna alteración estética, de contenido ni de los visuales de aparición existentes. Además, faltan dos zonas de contenido (Quiénes somos y Opiniones) que deben integrarse en la narrativa y en ambas navegaciones (superior y puntos laterales).

## What Changes

- El scroll/teclas de flecha pasan de avanzar pasos dentro del capítulo a cambiar de capítulo: al entrar en un capítulo de tipo `step`, su contenido se revela solo en cascada (mismas animaciones y retardos relativos actuales, disparadas por temporización en lugar de por rueda).
- Mientras un capítulo no ha terminado de revelarse, el scroll no permite pasar al siguiente (excepción: el capítulo Reformas mantiene su scroll continuo actual porque el scroll controla la reproducción del vídeo; no se toca).
- Vision: la primera vez, el boceto (vídeo) se reproduce completo y bloqueando el scroll (igual que hoy) y, al terminar, encadena la cascada del titular y el texto; si el boceto ya se vio, al entrar queda el titular 1 s y después arranca la cascada automáticamente.
- Inicio: el bloque de textos (los tres pasos) espera a que termine la animación del logo SVG; al terminar aparecen con retardos escalonados ligeramente más rápidos que los actuales y desplazados un poco más arriba (más cerca del H1, menos pegados al borde inferior).
- Nuevo capítulo "Quiénes somos" antes de "Colección": 3 bloques texto+imagen con disposición alterna (texto izquierda/imagen derecha centrado, texto derecha/imagen izquierda, texto izquierda/imagen derecha). Estructura y comportamiento de revelado en cascada como el resto de capítulos.
- Nuevo capítulo "Opiniones" antes de "Contacto": eslogan "Juzga tú mismo" + carrusel de reseñas de Google con estrellas.
- Navegación: `navItems` (header superior), puntos laterales (ChapterDots), `sectionIds`/`chapterLabels`/`chapterSteps`/`chapterType`, MobileDrawer y el observer de secciones móvil pasan de 5 a 7 capítulos.
- Mobile mantiene flujo de scroll normal (no hay narrativa por capítulos en móvil); los dos nuevos capítulos se añaden también a la versión móvil como secciones apiladas.
- No se cambia nada de contenido copy existente, ni estilos de los capítulos actuales, ni el catálogo, ni la API.

## Capabilities

### New Capabilities
- `landing-scroll-cascade`: comportamiento de navegación por capítulos — scroll cambia de capítulo, revelado en cascada automática dentro del capítulo, bloqueo de transición hasta completar, excepción de Reformas (scroll continuo), secuencia de Vision (boceto → cascada, con reintegro de 1 s) y revelado de Inicio gated por fin de animación del logo.
- `about-chapter`: capítulo "Quiénes somos" — tres pares texto/imagen con layout alterno, en escritorio y móvil, con revelado en cascada.
- `reviews-chapter`: capítulo "Opiniones" — eslogan "Juzga tú mismo" y carrusel de reseñas de Google con estrellas, en escritorio y móvil, con revelado en cascada.
- `landing-chapter-navigation`: integración de los 7 capítulos en la navegación superior, los puntos laterales (con etiquetas y `aria-current`), el drawer móvil y el resaltado de sección activo.

### Modified Capabilities
- (ninguna — `openspec/specs/` está vacío; no hay specs principales que modificar)

## Impact

- `src/hooks/useNarrativeScroll.js`: cascada automática por temporización, gating de transiciones por capítulo completo, señales de listo desde Vision/Inicio.
- `src/data/copy.js`: 2 nuevas entradas en `sectionIds`, `chapterLabels`, `chapterSteps`, `chapterType`, `navItems`; datos de Quiénes somos y nuevo fichero de datos para reseñas (contenido de reseñas pendiente de confirmación del propietario).
- `src/App.jsx`: capítulos nuevos en el stack desktop y en `MobileSections`; ChapterDots se alimenta solo de `sectionIds`.
- `src/sections/desktop/` y `src/sections/mobile/`: `Inicio.jsx` (revelado gated + posición), `Vision.jsx` (encadenado vídeo→cascada sin cambiar visuales), nuevos `QuienesSomos.jsx` y `Opiniones.jsx`.
- `src/components/Header.jsx` / `MobileDrawer.jsx`: 2 elementos de navegación más (orden Colección ← Quiénes somos, Contacto ← Opiniones).
- Imágenes de "Quiénes somos": reutilizar assets existentes del repo; cualquier asset nuevo queda pendiente de aprobación del propietario.
- Tests existentes de secciones/navegación pueden requerir ajustes mínimos de orden de capítulos; se añade cobertura del nuevo comportamiento.
