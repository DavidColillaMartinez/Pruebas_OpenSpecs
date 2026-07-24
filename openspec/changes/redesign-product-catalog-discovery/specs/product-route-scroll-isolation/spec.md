## ADDED Requirements

### Requirement: Bloqueo narrativo exclusivo de la landing
El `overflow:hidden` y `height:100svh` de escritorio SHALL aplicarse solo mientras la landing `/` esta montada y en su modo narrativo.

#### Scenario: Landing desktop
- **WHEN** `/` se muestra en un viewport de al menos 1024x720 sin reduced motion
- **THEN** mantiene su viewport fijo, wheel/teclado narrativo y composicion actual

#### Scenario: Salida de la landing
- **WHEN** el usuario navega desde `/` a otra ruta
- **THEN** la clase/estado de bloqueo se limpia y no deja overflow inline o global activo

### Requirement: Scroll nativo en rutas de producto
`/productos` y `/productos/:slug` SHALL usar scroll nativo en desktop, tablet y mobile, independientemente de la cantidad de contenido.

#### Scenario: Muchos resultados
- **WHEN** el catalogo supera la altura del viewport desktop
- **THEN** el usuario puede llegar por wheel, teclado y scrollbar al ultimo producto y `Cargar mas`

#### Scenario: Ficha larga
- **WHEN** la ficha incluye galeria, detalles, variantes y formulario
- **THEN** todo el contenido permanece alcanzable sin montar el hook narrativo

#### Scenario: Poco contenido
- **WHEN** el catalogo tiene pocos o cero resultados
- **THEN** no aparece un contenedor de scroll artificial ni salto de altura

### Requirement: Panel de filtros no deja locks residuales
El drawer mobile SHALL bloquear el fondo solo mientras esta abierto y SHALL restaurar exactamente el estado anterior al cerrar, navegar o desmontar.

#### Scenario: Cierre normal
- **WHEN** el usuario cierra el drawer
- **THEN** el catalogo recupera scroll en la misma posicion

#### Scenario: Navegacion con drawer abierto
- **WHEN** cambia la ruta o el componente se desmonta
- **THEN** el cleanup restaura overflow y foco sin afectar landing o ficha

### Requirement: Regresion responsive y de retorno
El aislamiento SHALL funcionar en 1024x720, desktop grande, tablet y mobile, y SHALL preservar retorno desde ficha.

#### Scenario: Comparacion landing/catalogo/ficha
- **WHEN** se validan las tres rutas antes y despues
- **THEN** solo catalogo/ficha recuperan scroll nativo y la landing conserva su comportamiento visual y narrativo
