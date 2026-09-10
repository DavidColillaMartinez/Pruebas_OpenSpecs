## Context

Tercera etapa: depende de la base clara revisada en `refine-web-usability-accessibility`, que a su vez consume `audit-harden-repo-seo-security`. Se deben conservar Marcellus/Manrope, composición, navegación, medios e interacciones. El propietario elige claro predeterminado y cambio manual; no pide modo automático del sistema.

La configuración de Tailwind utiliza colores literales con variantes de opacidad; `ink` tiene usos distintos (texto, botón oscuro, overlay fotográfico). Convertirlo ciegamente en blanco al cambiar de tema podría romper todos esos roles y las zonas protegidas.

## Goals / Non-Goals

**Goals:** tema oscuro coherente, selector accesible en todas las rutas, persistencia independiente, sin destellos iniciales de tema incorrecto bajo CSP y sin pérdida de estado. Conservar exactamente el claro salvo el nuevo control y correcciones explícitas ya aprobadas en etapas anteriores.

**Non-Goals:** modo automático, rediseño, inversión de imágenes, modificación de Vision/CompareSlider, remonte del router/providers, cambios API/cotización, telemetría o datos de sesión en la preferencia de tema.

## Decisions

### D1. Preferencia manual mínima

Dos valores `light` y `dark`, guardados en `localStorage` bajo `lrmq:theme:v1`. Ausencia, valor inválido o lectura fallida resuelven a claro. Cambio manual actualiza la apariencia en memoria aun si guardar falla. No escribir historial, identificadores, formularios ni selección en esa clave; no escuchar el esquema del sistema como fuente de decisión.

No se fuerza recarga al cambiar tema. La sincronización opcional entre pestañas solo refleja una preferencia válida y nunca afecta estado de negocio. Evitar complejidad si no es necesaria para el control compartido por rutas.

### D2. Inicialización compatible con CSP

La cabecera CSP versionada restringe scripts a `self`; un bloque inline nuevo puede ser bloqueado. Preferir un script pequeño del mismo origen que resuelva el atributo `data-theme` antes de aplicar estilos/pintar y comparta la misma política que React. No añadir `unsafe-inline` a script-src para evitar el destello.

Comparar esta opción con un script inline autorizado por hash solo si hay generación reproducible del hash. Si se cambia el mecanismo, documentar y probar la política efectiva local con cabeceras de producción; Vite dev no es prueba de CSP desplegada. Fallo de JS/storage deja un claro usable.

### D3. Tokens semánticos aditivos, con soporte de alpha

Conservar tokens de marca/medios que deban ser invariantes. Crear roles para superficie, superficie elevada, texto principal/secundario, borde, control/contraste y estados. En Tailwind v3, usar canales compatibles con `rgb(var(--role) / <alpha-value>)` u otra definición equivalente probada para `bg-*/95`, `border-*/10` y gradientes. `var(--hex)` sin manejo de alpha no es sustitución garantizada.

El claro de cada rol conserva el valor efectivo actual. Reutilizar roles en superficies por lotes, sin search/replace global de `ink` o `white`, ni redefinir utilidades genéricas para toda la página. Auditar explícitamente fondos blancos, CSS literal, estilos inline, sombras, placeholder, iconos y superficies sobre fotografía.

Las imágenes, logos, vídeos y comparador mantienen archivos, proporciones y colores. Las superficies claras dentro de áreas protegidas son islas de marca deliberadas, no se invierten mediante selectores heredados. Documentar su tratamiento y contraste en oscuro.

### D4. Posición del selector sin alterar navegación

Portada móvil: botón inmediatamente antes de `Tienda` en orden visual y DOM; no relegarlo al drawer. Portada PC: integrado en cabecera junto a los controles existentes, sin mover enlaces ni alterar navegación lateral. Rutas con cabeceras distintas usan el mismo control en su zona superior existente, cerca de navegación de retorno/migas, sin un header global nuevo ni otro enlace de catálogo.

Botón nativo de al menos 44x44 px, nombre accesible del cambio disponible y estado expuesto coherentemente, icono decorativo, foco visible y activación Enter/Espacio. Reflow a 320 px sin encoger targets o ocultar `Tienda`. Se revisa cada cabecera antes de acordar el lote de archivos.

### D5. Presentación aislada de estado

Aplicar tokens/atributo raíz sin cambiar claves de React ni desmontar proveedores. En chat conservar mensajes, ID, petición en vuelo, draft, productos, acciones y scroll del lector. También conservar filtros, orden, variantes, cantidades, presupuesto, formulario, foco y posición del documento. Un cambio de tema no hace requests ni reenvía nada.

La burbuja hereda roles oscuros con la corrección contextual de Inicio ya aprobada; conservar blur en las otras zonas y no alterar temporizadores ni la clave de visibilidad por sesión.

### D6. Gate final de evidencia

Crear `docs/audit/final-web-release-review.md` con commits, condiciones, enlaces a hallazgos de las dos etapas previas, resultados nuevos en ambos temas y límites externos. Ejecutar la matriz de 19 viewports de la etapa 2 en claro y oscuro, incluyendo chat/menús/estados, sin afirmar pruebas reales de dispositivos por emulación.

Objetivos: contraste WCAG 2.2 AA para texto/controles aplicables, cero overflow accidental, contenidos y controles visibles con teclado/zoom, sin errores nuevos de consola, estado preservado, SEO y fronteras de seguridad sin regresiones. Las comprobaciones antiguas del propietario son evidencia histórica, no aprobación del oscuro nuevo.

## Risks / Trade-offs

- [Cambio global de token afecta fotografía/Vision] → Tokens por rol y scope explícito, comparación claro, ninguna edición de zonas protegidas.
- [FOUC o script bloqueado] → Bootstrap propio permitido por CSP, prueba de recarga en tema guardado, claro por defecto si falla.
- [Toggle invade `Tienda` en móvil] → Medir geometría a 320 px con targets de 44 px y ajuste mínimo del grupo de controles.
- [Cambio de tema remonta el chat] → Estado fuera del tema, prueba con petición pendiente y borrador, sin nuevas llamadas de red.
- [No hay revisión visual] → Mantener pendiente aceptación; no usar builds/tests ni declaración anterior como sustituto.

## Migration Plan

Confirmar gates anteriores → snapshots claros por ruta → acordar lotes/tokens → bootstrap y control → superficies oscuras → matriz y estado → informe final. Detenerse y explicar cualquier lote UI mayor de cinco archivos antes de editar. No publicar automáticamente. Rollback selectivo conservando datos de usuario y confirmando target/backup si se solicita.

## Open Questions

- Paleta oscura final y contraste sobre fotografías: resolver con variantes en navegador respetando marca, no imponer inversión automática.
- Colocación exacta dentro de cabeceras de ficha/presupuesto/404: revisar estructura al aplicar; todas mantienen acceso al mismo selector.
- Evidencia externa de hosting, privacidad y permisos de IA: continúa fuera de alcance, no condición inventada como ya satisfecha.
