## 1. Seguridad y reproduccion

- [x] 1.1 Ejecutar `git status`, registrar los cambios preexistentes y mantener `assets/Catalogo/**`, `assets/Boceto/**` y `public/boceto-final.png` fuera de parches, staging y commits.
- [ ] 1.2 Confirmar mediante GET en el deployment `35499b5` los fallos actuales (`405` en config/listado y `404` de Vercel en detalle), guardando status y content-type sin ejecutar ningun POST.
- [x] 1.3 Verificar que `src/features/catalog/api/client.ts` usa solo `/api/catalog/*` y registrar las cuatro variables server-side exactas sin leer ni imprimir sus valores de Production.

## 2. EntryPoints Vercel explicitos

- [x] 2.1 Crear un modulo compartido fuera de `api/` para metodo permitido, variable por recurso, URL/query/body upstream, timeout, headers, errores y normalizacion de status.
- [x] 2.2 Crear `api/catalog/config.js` como handler GET explicito que delega en el modulo compartido con `N8N_CATALOG_CONFIG_UPSTREAM_BASE_URL`.
- [x] 2.3 Crear `api/catalog/products.js` como handler GET explicito que delega el listado y sus query strings con `N8N_CATALOG_PRODUCTS_UPSTREAM_BASE_URL`.
- [x] 2.4 Crear `api/catalog/products/[slug].js` como handler GET dinamico que usa `request.query.slug`, lo excluye de la query reenviada y selecciona `N8N_CATALOG_PRODUCT_DETAIL_UPSTREAM_BASE_URL`.
- [x] 2.5 Crear `api/catalog/quote-requests.js` como handler POST explicito que delega el cuerpo JSON con `N8N_CATALOG_QUOTE_REQUESTS_UPSTREAM_BASE_URL`.
- [x] 2.6 Eliminar `api/catalog/[...path].js` y asegurar que `api/` no publica el helper compartido ni otro endpoint de catalogo accidental.
- [x] 2.7 Mantener `normalizeCatalogResponseStatus` compartido con Vite y los handlers, actualizando solo imports server-side necesarios.

## 3. Pruebas del routing real

- [x] 3.1 Reemplazar el test del catch-all por pruebas que importen directamente `config.js` y `products.js` y ejecuten requests sin `query.path`.
- [x] 3.2 Probar `products/[slug].js` con `{ query: { slug } }`, incluyendo codificacion unica, exclusion de `slug` en la query upstream y base de detalle separada.
- [x] 3.3 Probar que un upstream `200 PRODUCT_NOT_FOUND` produce `404 PRODUCT_NOT_FOUND` publico y que un producto valido conserva HTTP 200.
- [x] 3.4 Probar los cuatro mapas de variables, configuracion ausente, metodos no permitidos con `Allow`, error upstream y timeout sin filtrar secretos.
- [x] 3.5 Probar quote-requests con `fetch` mockeado para forwarding del POST y verificar que ninguna solicitud real sale del proceso de test.
- [x] 3.6 Añadir una comprobacion estructural de los cuatro entrypoints, ausencia del catch-all y ausencia de un quinto handler generado por el modulo compartido.

## 4. Contrato y documentacion

- [x] 4.1 Mantener sin cambios las URLs publicas del cliente para config, listado, detalle y presupuesto, y ejecutar sus pruebas existentes.
- [x] 4.2 Actualizar `docs/catalog-api-proxy.md` con los cuatro archivos de ruta, el helper server-only y la matriz segura de verificacion Vercel.
- [x] 4.3 Generar el bundle y confirmar que no contiene host n8n, `/webhook`, `webhookId` ni ninguno de los cuatro nombres de variables server-side.
- [x] 4.4 Confirmar que `vercel.json` sigue limitando sus rewrites a la SPA y no intercepta `/api/*` ni estaticos.

## 5. Validacion local y entrega

- [x] 5.1 Ejecutar `corepack pnpm install --frozen-lockfile`, `npm test`, `npm run lint`, `npm run typecheck`, `npm run build` y `openspec validate --all`.
- [x] 5.2 Ejecutar el build/inspeccion de rutas de Vercel disponible y comprobar que descubre exactamente config, listado, detalle dinamico y quote-requests bajo sus URLs publicas.
- [x] 5.3 Revisar `git status`, `git diff`, archivos staged e historial; confirmar que no hay UI, media, workflows n8n ni tareas de otros cambios OpenSpec en el diff.
- [ ] 5.4 Crear un commit local focalizado del routing solo despues de que las pruebas y el build pasen.
- [ ] 5.5 PENDIENTE DE AUTORIZACION DEL PROPIETARIO: no hacer push hasta recibir orden explicita.

## 6. Redeploy y verificacion de produccion

- [ ] 6.1 PENDIENTE DE EVIDENCIA DEL PROPIETARIO: confirmar en Production las cuatro variables exactas, incluida `N8N_CATALOG_PRODUCT_DETAIL_UPSTREAM_BASE_URL`, sin copiar sus valores a logs o artefactos.
- [ ] 6.2 Tras un push autorizado, hacer redeploy y confirmar que el deployment del nuevo commit alcanza estado Ready con Node 24 y pnpm 10.
- [ ] 6.3 Verificar por GET que `/api/catalog/config`, `/api/catalog/products`, `mt-espejos-alba` y `royo-royo-alfa-compact-alfa-compact-fondo-46-100-2c-mueble-lavabo-17` responden HTTP 200 JSON.
- [ ] 6.4 Verificar por GET que un slug inexistente responde HTTP 404 JSON con `PRODUCT_NOT_FOUND`, no HTML ni un 404 de plataforma.
- [ ] 6.5 Confirmar que durante toda la auditoria de produccion no se ejecuto ningun POST a `/api/catalog/quote-requests`.
