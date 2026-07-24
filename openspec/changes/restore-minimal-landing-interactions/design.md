## Context

La rama actual conserva las rutas y la logica del catalogo de `implement-product-detail-page`, pero la landing ya no representa por completo el modo minimalista que estaba activo en `66366d0` con `cardless=true`. El problema visible esta concentrado en Coleccion desktop y en el fondo decorativo global que vuelve a aparecer al no fijarse el fondo blanco de la landing. Las secciones de Inicio y Vision tambien mantienen mas pasos manuales de los necesarios.

El trabajo se realizara sobre un arbol con cambios de media propiedad del usuario en `assets/Boceto/Imagen_Original.png` y `public/boceto-final.png`, ademas de `assets/Catalogo/` sin seguimiento. Esos archivos son contexto de validacion, no objetivos de edicion. El cambio activo de producto conserva 73 de 78 tareas completas y sus cinco tareas de confirmacion deben permanecer pendientes.

## Goals / Non-Goals

**Goals:**

- Recuperar primero la referencia minimalista clara con el menor diff posible y obtener confirmacion visual antes del primer commit.
- Identificar y comunicar cualquier otra divergencia objetiva respecto al modo `cardless=true` antes de editar secciones adicionales.
- Determinar si el catalogo esta listo para Vercel con las variables realmente configuradas y corregir solo bloqueos demostrados de proxy/rewrite/configuracion.
- Reducir Inicio a un unico paso de revelado con stagger de un segundo.
- Hacer que Vision termine directamente en el comparador, conserve replay permanente y no repita automaticamente el video al volver.
- Mantener accesibilidad, reduced motion, navegacion existente, datos y media.

**Non-Goals:**

- Crear o recuperar un tema oscuro.
- Redisenar la landing, el catalogo o las fichas de producto.
- Modificar imagenes, videos, workflows n8n, payloads de presupuesto o datos de producto.
- Ejecutar POST reales, resolver privacidad/consentimiento/hosting definitivo o cerrar las cinco tareas OpenSpec pendientes.
- Hacer push sin autorizacion explicita.

## Decisions

### 1. Recuperacion visual en una fase con puerta de propietario

Se usara `66366d0` solo como referencia de lectura para comparar las ramas `cardless=true`; no se restaurara el repositorio completo desde ese commit. Coleccion conservara exactamente el markup, medidas, contenido y umbrales de su rama minimalista, pero sin mantener una bifurcacion de tarjetas inactiva.

El fondo blanco se aplicara al ciclo de vida de `LandingPage`, siguiendo el comportamiento minimalista anterior, y se limpiara al abandonar `/` para no alterar las superficies propias del catalogo. Esta solucion se prefiere a cambiar `:root` o la paleta Tailwind porque evita modificar globalmente el diseño claro y las rutas de producto.

Antes de editar cualquier otra seccion se compararan Inicio, Reformas, Vision, Contacto y sus variantes mobile con la referencia. Si aparecen diferencias adicionales que requieren ampliar el diff, se informaran y se esperara confirmacion. Tras validar la recuperacion en navegador, la implementacion se detendra para que el propietario confirme el resultado antes del primer commit.

### 2. Auditoria de catalogo basada en rutas y nombres reales

El navegador seguira usando exclusivamente `/api/catalog/...`. La auditoria revisara por separado cliente, proxy Vite, funcion Vercel, variables y rewrites. No se introduciran `VITE_*`, URLs `/webhook` ni IDs de workflow en el bundle.

Actualmente el repositorio consume cuatro nombres especializados, mientras que el propietario confirma tres variables en Vercel. Se comprobara si una unica base de productos sirve listado y detalle. Si las bases son distintas, se documentara la cuarta variable realmente necesaria por nombre antes de modificar o desplegar; no se crearan aliases especulativos. La configuracion final tendra una sola nomenclatura documentada y coincidente entre `.env.example`, Vite y la funcion server-side.

El rewrite SPA no podra interceptar `/api/*` ni estaticos. Las pruebas de red se limitaran a GET para config, listado, dos slugs validos y un slug inexistente. La normalizacion `200 PRODUCT_NOT_FOUND` de n8n a `404` publico se preservara. La verificacion real de Vercel se realizara solo despues de un push autorizado.

### 3. Inicio usa un unico step y stagger de presentacion

`chapterSteps[0]` pasara de tres pasos de contenido a uno. Cuando `step >= 1`, los tres articulos adoptaran su estado visible; el primero no tendra espera, el segundo tendra 800 ms y el tercero 1600 ms de delay, un 20% mas rapido que la propuesta inicial. Se usaran delays declarativos de presentacion en el componente en vez de timers con estado, evitando callbacks pendientes al cambiar de capitulo.

Con `prefers-reduced-motion`, la regla global existente reducira animacion y delays, de modo que los tres articulos apareceran practicamente juntos. No se bloqueara al usuario durante dos segundos: el siguiente gesto podra avanzar a Coleccion conforme a la navegacion existente.

### 4. Vision se modela como video o compare

Vision desktop mantendra dos estados visibles: video y comparador. La primera entrada de la sesion reproduce automaticamente el video y bloquea el avance como ahora. Al terminar o fallar la reproduccion, el estado cambia directamente a comparador y se marca la experiencia como vista. Las entradas posteriores muestran el comparador sin volver a reproducir.

El boton replay existente permanecera siempre en la esquina inferior derecha, tanto durante video como durante compare. Al activarlo reiniciara el video por accion explicita, centrara de nuevo el divisor en 50% y, al terminar, volvera directamente al comparador. Se eliminan `showReveal`, `handleReveal` y el overlay Revelar; no se cambia el layout ni `CompareSlider` salvo que una prueba demuestre una necesidad funcional y el propietario la apruebe.

En mobile se conserva la reproduccion inicial bajo demanda para respetar el comportamiento existente y las restricciones de autoplay. Al terminar se pasa directamente a compare, se elimina Revelar y se muestra replay permanente. El comparador mantiene teclado, puntero y touch.

El presupuesto narrativo de Vision se ajustara para que no exista un step intermedio sin efecto. Cuando el comparador y la composicion textual ya esten en su estado estable, el siguiente gesto SHALL avanzar directamente a Contacto; ningun incremento de `step` puede dejar la pantalla sin animacion, cambio de estado o avance de capitulo.

### 5. Commits y validacion por fases

La recuperacion minimalista se valida y confirma antes de su commit. La auditoria/correccion de catalogo, Inicio y Vision se mantienen en commits locales separados. Antes de cada commit se revisaran status, diff y archivos staged; nunca se incluiran los tres grupos de assets protegidos.

## Risks / Trade-offs

- [Una divergencia adicional del minimalismo exige mas de cinco archivos] -> detener la implementacion, mostrar el diff necesario y esperar autorizacion.
- [El stagger termina despues de que el usuario abandone Inicio] -> usar CSS declarativo sin timers ni actualizaciones de estado tardias; no bloquear la navegacion.
- [La marca de Vision vista se pierde al recargar] -> aceptar persistencia por sesion de pagina, coherente con el comportamiento actual, sin introducir storage.
- [Replay puede competir con el bloqueo narrativo] -> distinguir reproduccion automatica y explicita, liberar siempre `setBlocked(false)` en fin, fallo, salida y cleanup.
- [Las imagenes del usuario tienen dimensiones/formato distintos al commit] -> no modificarlas y validar el swipe con los archivos actuales en desktop y mobile.
- [Las tres variables de Vercel no cubren dos upstreams de productos distintos] -> reportar la cuarta variable exacta como bloqueo; no exponer ni inventar fallbacks cliente.
- [El rewrite global devuelve HTML en `/api/*`] -> limitar el fallback SPA a rutas de aplicacion y verificar que API/estaticos quedan fuera.
- [Solapamiento con `fix-navigation-collection-vision-contact-interactions`] -> no marcar sus tareas ni implementar Contacto/navegacion lateral dentro de este cambio.

## Migration Plan

1. Inspeccionar y registrar el baseline visual actual sin editar media.
2. Recuperar Coleccion y fondo blanco; auditar las demas secciones.
3. Validar navegador desktop/mobile y detenerse para confirmacion del propietario.
4. Crear el commit local de recuperacion aprobado.
5. Auditar catalogo y aplicar solo correcciones demostradas; validar localmente sin POST.
6. Implementar y validar Inicio en un commit separado.
7. Implementar y validar Vision en un commit separado.
8. Ejecutar tests, lint, typecheck, build y revision visual final.
9. Hacer push y verificar Vercel solo con autorizacion explicita.

El rollback de cada fase se realizara revirtiendo su commit local aislado. La rama de respaldo existente se conserva y no se usaran reset, clean ni restauraciones amplias.

## Open Questions

- La equivalencia entre la variable de productos configurada en Vercel y las bases distintas de listado/detalle debe resolverse durante la auditoria antes de cualquier correccion de nombres.
- Cualquier diferencia minimalista adicional fuera de Coleccion y el fondo blanco requiere confirmacion del propietario antes de ampliar el alcance.
