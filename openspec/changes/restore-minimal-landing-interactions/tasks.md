## 1. Seguridad y baseline

- [x] 1.1 Ejecutar `git status`, registrar todos los cambios preexistentes y confirmar que `assets/Catalogo/**`, `assets/Boceto/**` y `public/boceto-final.png` quedan fuera de staging y de cualquier parche.
- [x] 1.2 Inspeccionar como referencia de solo lectura `66366d0:src/App.jsx` y las ramas `cardless=true` de los cinco capitulos desktop y todas las secciones mobile, sin restaurar el repositorio completo.
- [x] 1.3 Comparar el estado actual con la referencia y documentar las diferencias objetivas; limitar la primera correccion a Coleccion y fondo blanco salvo aprobacion expresa para diferencias adicionales.
- [ ] 1.4 Registrar capturas baseline de la landing actual en desktop y mobile, incluyendo Coleccion completa y el swipe de Vision con los assets actuales.

## 2. Recuperacion minimalista y confirmacion

- [x] 2.1 Sustituir solo la presentacion activa de `src/sections/desktop/Coleccion.jsx` por el markup exacto de la rama minimalista de referencia, conservando contenido, alt text, umbrales y stagger agrupado.
- [x] 2.2 Aplicar el fondo blanco durante el ciclo de vida de `LandingPage` y limpiarlo al abandonar `/`, sin modificar `:root`, la paleta Tailwind ni las superficies del catalogo.
- [x] 2.3 Añadir pruebas focalizadas que detecten la reaparicion de la composicion de tarjetas en Coleccion y verifiquen que la landing no deja su fondo impuesto tras desmontarse.
- [x] 2.4 Ejecutar `npm test`, `npm run lint`, `npm run typecheck` y `npm run build` tras la recuperacion.
- [x] 2.5 Revisar en navegador los cinco capitulos desktop, todas las secciones mobile, la navegacion `Tienda -> /productos`, proporciones de media y swipe de Vision; informar cualquier diferencia adicional antes de editarla.
- [x] 2.6 PENDIENTE DE CONFIRMACION DEL PROPIETARIO: presentar la recuperacion minimalista y detener la implementacion hasta recibir aprobacion visual explicita.
- [x] 2.7 Tras la aprobacion, inspeccionar `git status`, `git diff` y el historial, stagear solo los archivos aprobados de recuperacion y crear un commit local focalizado sin push.

## 3. Auditoria y preparacion del catalogo

- [x] 3.1 Confirmar que `src/features/catalog/api/client.ts` usa exclusivamente `/api/catalog` y comprobar que el bundle no contiene `webhook`, `webhookId`, URLs n8n ni variables server-side.
- [x] 3.2 Comparar `.env.example`, `api/catalog/[...path].js` y `vite.config.js` con las tres variables confirmadas en Vercel: `N8N_CATALOG_CONFIG_UPSTREAM_BASE_URL`, `N8N_CATALOG_PRODUCTS_UPSTREAM_BASE_URL` y `N8N_CATALOG_QUOTE_REQUESTS_UPSTREAM_BASE_URL`.
- [x] 3.3 Verificar mediante GET si listado y detalle comparten realmente la base de productos; si no la comparten, informar y justificar `N8N_CATALOG_PRODUCT_DETAIL_UPSTREAM_BASE_URL` como cuarta variable antes de editar configuracion.
- [x] 3.4 Unificar solo los nombres server-side demostrados entre `.env.example`, Vite y la funcion Vercel, sin crear `VITE_*`, aliases especulativos ni fallbacks publicos.
- [x] 3.5 Corregir `vercel.json` para resolver `/productos` y `/productos/:slug` sin interceptar `/api/*` ni archivos estaticos.
- [x] 3.6 Mantener y ampliar pruebas de proxy para GET permitido, metodo no permitido, configuracion ausente, timeout/error upstream y normalizacion `200 PRODUCT_NOT_FOUND` a `404` publico; no ejecutar POST real.
- [x] 3.7 Ejecutar en local tests de cliente, normalizacion, rutas de listado/detalle y build; registrar como esperada cualquier dependencia de variables no disponible localmente.
- [ ] 3.8 Revisar el diff de catalogo y crear un commit local separado solo si las correcciones estan demostradas; no marcar ninguna de las cinco tareas pendientes de `implement-product-detail-page`.

## 4. Secuencia simplificada de Inicio

- [ ] 4.1 Reducir `chapterSteps[0]` a un unico step interno sin cambiar los pasos ni tipos de los otros capitulos.
- [ ] 4.2 Hacer que los tres articulos de `src/sections/desktop/Inicio.jsx` se activen desde ese mismo step con delays declarativos de 0 ms, 1000 ms y 2000 ms.
- [ ] 4.3 Verificar que reduced motion elimina esperas perceptibles y que salir antes de completar el stagger no deja timers ni actualizaciones tardias.
- [ ] 4.4 Añadir pruebas para rueda/step, teclado, delays de los tres articulos y transicion al siguiente capitulo sin tres scrolls adicionales.
- [ ] 4.5 Validar visualmente la secuencia en desktop y crear un commit local focalizado tras revisar status y diff.

## 5. Vision directa a compare con replay

- [ ] 5.1 Simplificar Vision desktop a estados video/compare, eliminar `showReveal`, `handleReveal` y el overlay/boton Revelar.
- [ ] 5.2 Hacer que la primera entrada desktop reproduzca automaticamente una sola vez por sesion y pase a compare al terminar o fallar, liberando siempre el bloqueo narrativo.
- [ ] 5.3 Mantener permanentemente el boton SVG replay en `bottom-3 right-3`; al activarlo, reproducir desde cero y volver directamente a compare al finalizar.
- [ ] 5.4 Garantizar que salir durante autoplay o replay pausa el video, limpia listeners/bloqueo y hace que la siguiente entrada muestre compare.
- [ ] 5.5 Actualizar Vision mobile para eliminar el estado Revelar, pasar de reproduccion bajo demanda a compare al finalizar y ofrecer replay permanente.
- [ ] 5.6 Preservar `CompareSlider.jsx`, rutas de media, object-fit, aspect ratio, teclado, puntero, touch y atributos ARIA salvo que una prueba funcional requiera un cambio previamente aprobado.
- [ ] 5.7 Añadir pruebas de primera entrada, fin de video, fallo de play, regreso a Vision, replay, salida durante replay y flujo mobile sin Revelar.
- [ ] 5.8 Validar manualmente autoplay unico, drag, replay, teclado y media actual en desktop/mobile, y crear un commit local focalizado tras revisar status y diff.
- [ ] 5.9 Ajustar el presupuesto de steps de Vision y sus transiciones para que el scroll posterior al compare avance directamente al siguiente capitulo y no exista ningun gesto sin efecto.

## 6. Verificacion final y entrega controlada

- [ ] 6.1 Ejecutar la suite completa: `npm test`, `npm run lint`, `npm run typecheck`, `npm run build` y `openspec validate --all`.
- [ ] 6.2 Comparar capturas antes/despues y confirmar que fuera de Coleccion, fondo, secuencia de Inicio y flujo de Vision no existen regresiones visuales en la landing clara.
- [ ] 6.3 Confirmar que los cambios del usuario en `assets/Catalogo/**`, `assets/Boceto/**` y `public/boceto-final.png` siguen intactos y fuera de todos los commits.
- [ ] 6.4 PENDIENTE DE AUTORIZACION DEL PROPIETARIO: no hacer push hasta recibir orden explicita.
- [ ] 6.5 Tras un push autorizado y nuevo deployment, verificar por GET en Vercel configuracion, listado, ambos slugs validos, slug inexistente con `404` y navegacion `Tienda -> /productos`, sin POST de presupuesto.
- [ ] 6.6 Mantener pendientes privacidad, consentimiento, hosting/dominio definitivo, rewrite del hosting final, confirmacion de `sourcePage` y cierre de `implement-product-detail-page` hasta evidencia del propietario.
