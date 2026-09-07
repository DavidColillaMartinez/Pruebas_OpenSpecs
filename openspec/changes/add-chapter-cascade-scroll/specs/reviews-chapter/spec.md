## ADDED Requirements

### Requirement: Capítulo "Opiniones" antes de Contacto
La landing SHALL incluir un capítulo "Opiniones" inmediatamente antes de "Contacto" (escritorio y móvil) con el eslogan "Juzga tú mismo" y un carrusel de reseñas de Google que muestre por reseña: autor, valoración en estrellas (1-5), texto y enlace a la reseña original.

#### Scenario: Estructura del capítulo
- **WHEN** el usuario llega a Opiniones en escritorio
- **THEN** se muestran el eslogan y el carrusel con estrellas accesibles (`aria-label` con la valoración) y un enlace "Ver en Google" por tarjeta

#### Scenario: Contenido real de Google
- **WHEN** se publican las reseñas
- **THEN** cada tarjeta corresponde a una reseña real aportada por el propietario (autor, estrellas, texto, enlace verificados), sin testimonios inventados

### Requirement: Interacción accesible del carrusel
El carrusel SHALL permitir navegación con botones prev/next accesibles y paginación por puntos; SHALL detener el autoplay cuando el foco del teclado está dentro o con `prefers-reduced-motion`; en móvil SHALL permitir swipe horizontal.

#### Scenario: Navegación por teclado
- **WHEN** el usuario pulsa el botón siguiente o usa las flechas del carrusel con foco
- **THEN** la tarjeta visible avanza una posición con transición suave y el estado de los puntos se actualiza

#### Scenario: Reduced motion
- **WHEN** el usuario tiene `prefers-reduced-motion` activo
- **THEN** no hay autoplay y los cambios de diapositiva son inmediatos sin animación

### Requirement: Opiniones se revela en cascada
El capítulo SHALL participar en la narrativa por capítulos (`sectionId: opiniones`): su contenido (eslogan, carrusel, controles) se revelará en cascada automática según `landing-scroll-cascade`, con bloqueo de salida hasta completar.

#### Scenario: Entrada a Opiniones
- **WHEN** el usuario entra en el capítulo
- **THEN** tras la pausa inicial aparece el eslogan, después el carrusel, y al completarse el revelado el scroll permite ir a Contacto

### Requirement: Reseñas centralizadas en datos
Las reseñas SHALL centralizarse en `src/data/reviewsContent.js` con un esquema `{ author, rating, text, googleUrl }` validado; el componente no llevará reseñas inline.

#### Scenario: Alta de una reseña
- **WHEN** el propietario añade una entrada al fichero
- **THEN** el carrusel incorpora la tarjeta sin cambios en componentes ni estilos
