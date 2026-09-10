## Why

El propietario encontró dos defectos tras la revisión del modo oscuro: (1) la pill de navegación superior muestra fondo en la sección Inicio, donde debe ser transparente con solo un borde fino (referencia visual del propietario), conservando el color actual en las secciones sin foto; (2) el panel del asistente bloquea el scroll de la página cuando está abierto, siendo una ventana flotante que lo debería permitir.

## What Changes

- Condicionar las clases del `<nav>` de `Header` sobre `isInicio`: en Inicio, pill transparente con borde hairline claro sin fondo ni sombra (claro y oscuro); en las demás secciones se conserva el estilo aprobado actual (clara `bg-elevated-hover/90` + sombra; dark-glass vía `.lrmq-nav-pill` solo en esa rama).
- Eliminar el bloqueo de `document.body.style.overflow` que aplica `ChatPanel` al abrirse, dejando el scroll de fondo operativo en desktop y móvil.
- Actualizar el test de accesibilidad del chat al nuevo contrato (sin lock) y añadir verificación visual de la pill.

## Capabilities

### New Capabilities

Ninguna: correcciones de presentación sobre `header-navigation` existente y el comportamiento del asistente.

### Modified Capabilities

Ninguna registrada como spec: los ajustes no alteran contratos funcionales.

## Impact

- Archivos: `src/components/Header.jsx` (una expresión de clases), `src/styles/index.css` (comentario/alcance de `.lrmq-nav-pill`), `src/features/assistant/components/ChatPanel.tsx` (remover efecto de lock), `src/features/assistant/components/ChatPanel.test.tsx` (contrato actualizado).
- No se tocan: ThemeToggle, burbuja de bienvenida, Vision, secciones, proxies/rutas, media ni metadatos.
