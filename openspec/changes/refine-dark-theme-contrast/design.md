# Design — refine-dark-theme-contrast

## Contexto

Tras el cambio `add-manual-light-dark-theme`, oscuro funciona pero es ilegible en la landing (secciones sin foto usan clases duras claras sobre fondo oscuro), demasiado negro en superficies, con imágenes de producto que "brillan" y un toggle poco pulido mal colocado en catálogo. Este cambio no toca transporte ni datos.

## Paleta oscura objetivo (referencia GitHub/Linear dark)

| Rol | Valor anterior | Nuevo | Referencia de uso |
|---|---|---|---|
| `--lrmq-surface` | 21 21 22 | 28 29 31 (#1c1d1f) | fondo de página dark |
| `--lrmq-elevated` | 34 34 35 | 46 47 50 | cards/forms/paneles |
| `--lrmq-elevated-hover` | 46 46 48 | 58 59 63 | hover |
| `--lrmq-primary` | 242 238 230 | 228 226 220 | texto primario |
| `--lrmq-secondary` | 201 196 187 | 168 165 158 | texto secundario |
| `--lrmq-hairline` | 242 238 230 | 228 226 220 (usar con alfa) | bordes |

Contraste: primario sobre surface ≈ 12:1, secundario más legible manteniendo jerarquía. Verificar por cálculo; ajustar si alguna combinación cae bajo 4.5:1.

## Decisiones

1. **Landing dark** (fin de la "isla oscura deliberada" por decisión del propietario): Header (nav superior, pill, CTA, hamburguesa) y dot-nav lateral cambian a tokens; Reformas (desktop y móvil) y Contacto adaptan textos/fondos/botones en dark con overrides `[data-theme='dark']` en `index.css` donde tocar JSX rompería el claro (regla: tocar JSX sólo cuando el claro queda byte-idéntico, preferencia por CSS scopped para secciones). Vision y CompareSlider siguen intactos: sus superficies son fotografía a史学ng pantalla y conservan su text lighting; en dark añadir solo, si es necesario para el dot-nav, contraste del indicador activo mediante token.
2. **Imágenes**: `index.css` añade bajo `[data-theme='dark']` reglas `.lrmq-dark-soften img` (o selector directo de clases existentes si es menos invasivo: `[data-theme='dark'] .catalog-card-image-frame img { filter: brightness(.92) saturate(.94) }`) aplicadas a: `CatalogProductCard` frame, `ProductGallery` main/bezuka/lightbox, `CatalogMasthead` foto, imágenes del assistant card. Sin cambios de assets, sin filtros en burbujas de texto. Suavizado también del elemento que define el frame (fondo del frame si foto tiene fondo blanco plano: `mix-blend` no; mejor background del frame en dark a surface-elevated + filtro).
3. **Inputs y controles**: selects/inputs/chips usan en dark `bg-surface-elevated/70`, borde `border-hairline/25`, placeholder `text-secondary/60`; errores `bg-red-50` → override dark `background: rgb(76 25 25)` etc. con texto `#fca5a5` (AA sobre 46 47 50). Aplicado por CSS scopped donde ya usa clases hard (`bg-white`, `text-ink`) solo en dark.
4. **ThemeToggle**: pill `h-11 min-w-[44px] rounded-full` con iconos SVG inline (sol/luna con stroke currentColor). Variante contextual: prop `variant='floating'|'solid'` (o context compartido con Header): en `isInicio` (foto) → transparente + `backdrop-blur` + borde blanco translúcido (coherente con botón Tienda); resto → `bg-surface-elevated/solid`. En `CatalogPage`: mismo flex row que el link Volver (`flex items-start justify-between`, link manda, toggle `shrink-0`). `QuoteSelectionPage`/`ProductDetailPage` fila breadcrumb igual (avise si tuviéramos que unificar).
5. **Burbuja bienvenida**: misma variante contextual (blur/transparente en `/`, sólida fuera). Trigger: auditar `ChatWelcomeBubble` — se muestra solo si: ruta `/`, chat cerrado, sin descarte previo en sesión, tras delay y solo hasta primera interacción con el panel; tests nuevos que fijen ese contrato (aparece en `/` tras delay; no reaparece tras descartar; no aparece en otras rutas; aparece tras cambiar a una sección cuando aún no se hubiera mostrado).
6. **Claro byte-idéntico**: cualquier override de landing/imágenes/errors va dentro de `[data-theme='dark']`; tokens light conservan valores actuales.

## Riesgos

- Regresiones del claro: mitigado con matriz light antes/después (capturas referencia de `/tmp/opencode/evidence-light-*.png`).
- `backdrop-blur` sobre foto ya cargada: coste GPU aceptado (ya se usa en Tienda/burbuja).
- Dot-nav activo sobre secciones claras en dark: mantener contraste del indicador con token (verificación visual).
