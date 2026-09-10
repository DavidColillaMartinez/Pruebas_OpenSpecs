## 1. Entrada y diseño por roles

- [ ] 1.1 Confirmar gates e informes de las dos etapas anteriores, leer specs actuales y AGENTS.md y registrar git status/base; resolver bloqueos antes de implementar tema.
- [ ] 1.2 Capturar referencia clara de todas las rutas y estados principales; inventariar colores por rol, CSS literal/inline, opacidades, gradientes y superficies de marca protegidas.
- [ ] 1.3 Definir paleta oscura/tokens semánticos con contraste verificable, mapeo claro equivalente y soporte Tailwind de alpha; delimitar lotes de archivos y detenerse para explicar cualquiera que supere cinco archivos UI.

## 2. Preferencia e inicialización

- [ ] 2.1 Implementar preferencia manual `light|dark` con claro por defecto, clave `lrmq:theme:v1`, validación y manejo de storage fallido; no usar esquema del sistema como valor inicial.
- [ ] 2.2 Implementar aplicación temprana de la preferencia compatible con la CSP versionada sin `unsafe-inline` nuevo; probar recarga directa, storage inválido/bloqueado y fallback claro bajo cabeceras equivalentes a producción.
- [ ] 2.3 Añadir control accesible con nombre/estado, Enter/Espacio, foco visible y target 44x44; integrar móvil inmediatamente antes de `Tienda` y PC en cabecera sin alterar enlaces ni navegación lateral.
- [ ] 2.4 Reutilizar el control en zonas superiores existentes de catálogo, ficha, presupuesto y 404; verificar disponibilidad por ruta y geometría a 320 px sin crear un header o navegación comercial nuevos.

## 3. Superficies y estado preservado

- [ ] 3.1 Aplicar tokens por rol a superficies permitidas de portada/header y estados, preservando claro y sin editar Vision, CompareSlider o media; documentar las islas de marca claras.
- [ ] 3.2 Adaptar catálogo, filtros, fichas, variantes, presupuesto y 404 al oscuro por lotes; revisar sombras, bordes, mensajes, skeleton, formularios y errores en ambos temas.
- [ ] 3.3 Adaptar chat, launcher y bienvenida al oscuro manteniendo el blur contextual acordado y toda la lógica de apertura, sesión, temporización y transporte.
- [ ] 3.4 Probar cambio de tema con conversación y request en vuelo, draft, scroll manual, filtros, variantes y formulario de presupuesto; demostrar que no hay remonte, recarga, datos perdidos o llamadas API adicionales.
- [ ] 3.5 Comparar regreso al claro con la referencia por ruta; corregir toda diferencia no aprobada de composición, color, tipografía, navegación o media antes de validar oscuro.

## 4. Validación final de la secuencia

- [ ] 4.1 Ejecutar claro/oscuro en los 19 viewports de `measured-responsive-quality` para todas las rutas/estados relevantes y registrar overflow, solapes y consola; realizar recorridos completos en móvil estrecho, landscape, tablet y desktop.
- [ ] 4.2 Revisar teclado, lector, zoom, contraste, reduced motion, safe areas y teclado virtual en ambos temas; distinguir dispositivos reales de emulación y mantener pendientes las verificaciones no realizadas.
- [ ] 4.3 Revalidar SEO/status/canonical/JSON-LD y las pruebas locales de seguridad/GET/POST de la primera etapa; comprobar que el tema no altera contenido indexable o contratos.
- [ ] 4.4 Verificar todos los archivos nuevos/afectados con checks apropiados, ejecutar `npm test`, `npm run lint`, `npm run typecheck`, `npm run build` y `openspec validate add-manual-light-dark-theme` y reparar regresiones introducidas.
- [ ] 4.5 Crear `docs/audit/final-web-release-review.md` con base, evidencia nueva de ambos temas, resultados de la cadena y límites externos; conservar pendientes de aceptación/privacidad reales y no hacer commit, push, deploy o archivo automático.
