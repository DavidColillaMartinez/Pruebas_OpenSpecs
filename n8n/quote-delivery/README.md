# Estado vigente — presupuestos sin almacenamiento, 14/10/2026

El propietario ha pedido retirar todas las solicitudes de nuestra base. El flujo activo ahora es el descrito en `TRANSIENT-SETUP.md` y `transient-workflow.json`. SQL 004 consulta solo catálogo; SQL 005 ya se aplicó en principal y pruebas. No volver a ejecutar las migraciones 001/002 ni importar el SDK histórico: restaurarían la arquitectura retirada.

El texto que sigue conserva únicamente evidencia histórica y no son instrucciones de instalación actuales.

## Migración a arealrmq.es — 2026-10-14

Vercel: dominios arealrmq.es y www.arealrmq.es añadidos al proyecto pruebas-open-specs; www redirige 308 al principal. DNS aún NXDOMAIN en comprobación pública. Recomendaciones de get_domain_config: apex A 76.76.21.21; www CNAME cname.vercel-dns.com. Nameservers del proveedor actual se conservan; configurar en su zona DNS.

QUOTE_ALLOWED_ORIGINS production ampliado con https://arealrmq.es y https://www.arealrmq.es, conservando temporalmente accesos de pruebas. Redeploy de la versión de archivos ya probada solicitado: dpl_8EduSF8hiuXcz1GmZaVHpCd24V8H. Canonical, og:url, robots y sitemap ya usan arealrmq.es; no fue necesario editar esos archivos.

Borrador n8n actualizado para sender AREA LRMQ · Presupuestos <presupuestos@avisos.arealrmq.es>, receptor arealrmqtienda@gmail.com, asunto sin PRUEBAS. 13 pruebas del correo pasan. NO publicado: versión activa conserva sender/destinatario de pruebas hasta verificar avisos.arealrmq.es y seleccionar Bearer Auth de cuenta Resend cliente. Clave solo en n8n, sin variable Resend en Vercel. Conservar Header Auth y Postgres existentes; SQL ya instalado, no repetir migraciones. Pendiente nueva clave/credencial AREA LRMQ — Resend, DNS, corte final, prueba oficial y sincronización GitHub.

## Actualización Resend — 2026-10-13

Correo afinado y publicado en n8n, versión f5e24ac3-9ac1-46c8-a4a2-9b6110b6d363: contacto, mensaje y artículos agrupados; etiquetas comerciales en español; fecha Europe/Madrid; eliminadas notas técnicas de adjuntos/enlaces; reply_to del solicitante solo si pasa validación de una dirección sin controles. 13 pruebas dirigidas del formato/routing/resultados pasan. No se reenvió el correo confirmado. La variante real de Aktual no tiene reference/measure/dimension en catálogo; se conserva exactamente lo seleccionado sin inventar datos. Pendiente confirmar nuevo formato y reply-to en la solicitud final hacia Gmail oficial.

Prueba real del propietario confirmada: solicitud `ea64ae7b-25cf-40a9-aecd-4aab363ae859`, outbox `sent`, attempts=1, provider ID `01a136fb-d64b-77ea-8370-f1e39b5ad580`, error_class=NULL. Capturas aportadas muestran Delivered en Resend y el mensaje recibido en la bandeja Hostalia de pruebas@colilladavid.es. Recorrido web→API→n8n→Neon→Resend→buzón acreditado para esta solicitud. No se ha verificado entrega a Gmail oficial todavía. El propietario aclara que al lanzar debe enviarse directamente mediante Resend a arealrmqtienda@gmail.com desde el dominio del cliente; Hostalia fue únicamente el receptor de esta prueba, no un relay necesario. Pendiente cambiar remitente/credencial/destinatario/asunto a los del cliente y sincronizar código con GitHub. No se reenviará la solicitud ya confirmada ni se borrarán sus registros sin instrucción específica.

Tras confirmar el corte y el rechazo SQL por la vía nueva, se despublicó el workflow antiguo `6Pdmj19Ko6zdMrzI`; el nuevo `QdNnvSEYMdDSW2qN` permanece activo. Los otros workflows de catálogo y chat no se modificaron. La despublicación es reversible si se acuerda rollback.

Despliegue directo de archivos revisados a Vercel production completado: `dpl_DN2keEKPX9AxrgZQ5CH9yRLENWMu`, READY, URL pública https://pruebas-open-specs.vercel.app . Variable privada creada por propietario, presencia comprobada sin descifrar. Comprobación POST con producto inexistente devolvió 400 de la función SQL a través del ingreso autenticado, sin crear presupuesto ni outbox (count=0). GET web=200 y endpoint=405. No se envió correo; recepción y clave Resend se verificarán con la solicitud del propietario. Lectura de build logs bloqueada por 403 del conector; READY confirmado por metadata. HTTPS de preview.colilladavid.es aún no confirmado desde el entorno (proxy 502), aunque Vercel asignó el alias. El código se desplegó sin git push: pendiente sincronizar este cambio con el repositorio antes del siguiente despliegue Git.

Autorización explícita de instalación/corte recibida. SQL 001 y 002 instalados en rama actual `br-floral-band-agkr5fnt`; 0 entradas outbox antes de activar. v2 publicado, versión `f83adf00-ff92-452a-95e4-b84947f69b90`. Webhook y Resend habilitados, privacidad confirmada. Vercel production: QUOTE_ALLOWED_ORIGINS y N8N_QUOTE_DELIVERY_ENABLED configurados; base quote upstream cambiada a v2. Falta N8N_QUOTE_WEBHOOK_SECRET, que introduce el propietario, y desplegar los archivos preparados. Despliegue actualmente servido corresponde a 2d091d9; código local preparado parte exactamente de ese commit. No se ha enviado correo real. El webhook antiguo sigue activo hasta completar el corte.

Simplificación solicitada por el propietario: reutilizar `LRMQ_Catalogo`, sin nueva credencial PostgreSQL ni más pruebas. Se asignó explícitamente a los cuatro nodos PostgreSQL y `LRMQ Quote Inbound` al webhook. Workflow y envío siguen deshabilitados. El intento de aplicar 001 a la rama principal `br-floral-band-agkr5fnt` fue rechazado por revisión automática por falta de autorización específica frente al aislamiento acordado; no se ejecutó SQL en principal. Pendientes autorización del corte y variable privada `N8N_QUOTE_WEBHOOK_SECRET` en Vercel (se comprobó solo listado de nombres, sin descifrar valores).

SQL ejecutado posteriormente por petición expresa del propietario en `quote-delivery-test` (`br-plain-hat-ag4xtzk9`), base `neondb`: 001 y 002 instalados usando run_sql_transaction, con cada función enviada como una sentencia completa obtenida mediante el parser de PostgreSQL 18. El archivo 003 terminó PASS y ROLLBACK. Recuento antes/después: 8 solicitudes copiadas, 0 entradas outbox; 0 ventanas de admisión tras rollback. Verifica alta, contrato received, duplicado secuencial, payload con tipo de reforma, leases, reintento, acuse simulado, incertidumbre, máximo de intentos, variante inválida y admisión. Sin conexión a Resend ni correo. Concurrencia entre sesiones y permisos de la credencial de n8n siguen pendientes. No se reprodujo el error de sintaxis del SQL Editor; no se cambió el SQL para obtener este resultado. La rama principal no se modificó.

Rama de Neon creada a petición del propietario: `quote-delivery-test` (`br-plain-hat-ag4xtzk9`), proyecto `LRMQ-Catalogo` (`polished-moon-35278349`), padre `br-floral-band-agkr5fnt`. Se confirmó `neondb` y el esquema copiado mediante lectura. No es default ni primary. No se han aplicado 001/002/003 en esta rama. Enlace: https://console.neon.tech/app/projects/polished-moon-35278349/branches/br-plain-hat-ag4xtzk9 . Configuración n8n confirmada: saveDataErrorExecution=none, saveDataSuccessExecution=none, saveManualExecutions=false, saveExecutionProgress=false. Credenciales Resend y Header Auth creadas; su selección fue confirmada por el propietario, sin prueba de autenticación real todavía.

Se sustituyó Gmail por HTTP Request a Resend en el borrador inactivo. Nodo de envío deshabilitado y sin credencial autoasignada. Remitente genérico `webs@avisos-pruebas.colilladavid.es`, destinatario `pruebas@colilladavid.es`, asunto de pruebas. 55 pruebas dirigidas pasan. Sin envío real, activación, migración, commit, push ni despliegue.

Aceptación requiere HTTP 2xx e ID. 429 reintenta; 400/401/403/404/422 falla; 409/5xx/timeout/respuesta incompleta queda uncertain. No se automatiza recuperación incierta tras la ventana de idempotencia. Eventos de entrega firmados pendientes; esta adaptación no los implementa. Credencial esperada: Bearer Auth `Webs — pruebas Resend`. SQL staging, autenticación de entrada, privacidad y DNS siguen pendientes. OWNER-SETUP.md sustituye las instrucciones antiguas de Gmail.

El resto del informe conserva la evidencia histórica anterior a Resend; sus referencias a Gmail no describen la configuración actual.

# Presupuestos por correo — verificación local; pendiente de staging y correo real

Fecha: 2026-10-13. Base: `origin/main` en `2d091d9`. Rama local aislada: `feat/quote-email-delivery-pretest`.

La web usa Vite/React con funciones Node.js en Vercel, no Next.js. Se conserva el endpoint `/api/catalog/quote-requests`, el contrato comercial y la interfaz aprobados. No hay migración de framework ni de catálogo a JSON.

## Estado real

- Endpoint reforzado en esta rama; no desplegado ni enviado a main.
- Borrador n8n: `QdNnvSEYMdDSW2qN`, https://n8n.colilladavid.es/workflow/QdNnvSEYMdDSW2qN . Proyecto personal **David Colilla <colillamartinezdavid@gmail.com>**.
- Borrador inactivo. El webhook sigue deshabilitado: n8n autoasignó la credencial del chat. Debe sustituirse por una credencial exclusiva de presupuestos; NO reutilizar ese secreto.
- Gmail sin conectar. Destinatario fijo: `arealrmqtienda@gmail.com`.
- SQL preparado en `sql/001-outbox-and-ingest.sql` y `sql/002-delivery-worker.sql`, NO aplicado a principal. El intento del conector sobre una rama temporal falló; no devolvió el identificador de esa rama ni de la migración.
- Validación estructural del SDK n8n: válida, 18 nodos. Esto NO acredita funcionamiento, seguridad efectiva ni recepción de correo.
- El propietario autorizó el punto 5 el 2026-10-13. Pruebas locales: `pnpm test` terminó en la última ejecución con 426 pasadas y 1 omitida; una ejecución completa anterior tuvo un fallo intermitente ajeno al cambio en `ProductDetailPage.gmeIo.test.tsx`, que no se reprodujo en la siguiente ejecución completa. Typecheck y build pasan. Lint termina sin errores, con 10 warnings preexistentes en UI.
- Probador n8n: ejecución manual `5225` terminó success sobre la rama de entrega usando salidas fijadas/simuladas de PostgreSQL y Gmail; no hubo llamada a esos proveedores. El intento de probar el webhook no arrancó porque está deshabilitado y no creó ejecución. La simulación NO prueba persistencia ni recepción de correo.
- Lectura de esquema Neon sin cambios: `quote_requests.id` es UUID y `metadata` JSONB; `quote_request_items.quote_request_id` también UUID, con snapshots JSONB. Dos solicitudes de los últimos 7 días tenían estado interno `new`. El cliente web solo acepta `received`, `created` o `accepted`. Se corrigió la respuesta pública de v2 para `received`, sin cambiar el estado interno. El workflow activo antiguo no se modificó.
- No se creó ninguna solicitud real ni se envió correo. La migración de prueba del conector falló con `unterminated dollar-quoted string`; parece fragmentar el cuerpo de las funciones. Se detuvo el flujo de migración conforme a su instrucción, sin intentar otra vía de aplicación automática. Migration ID, Temporary Branch Name y Temporary Branch ID: no proporcionados. Resultado: fallo, aplicación temporal no confirmada. Principal sin cambios. El CLI OpenSpec no está instalado, así que no se corrió su validación estricta.
- Workflow actual `6Pdmj19Ko6zdMrzI` preservado. `live-baseline-2026-10-13.json` es una copia de definición, sin datos de ejecuciones ni secretos.

## Últimos ajustes y prueba disponible para SQL Editor

- Corregida la colisión de `status` mediante alias explícito en el INSERT/RETURNING.
- El payload SQL y correo incluyen ahora el tipo de reforma. El borrador usa el objeto de respuesta directamente, conservando la forma del workflow anterior.
- Última comprobación dirigida: 47 pruebas pasadas en endpoint, validación y correo. La simulación n8n `5226` terminó success y contiene `Tipo de reforma: Reforma integral`, con PostgreSQL y Gmail fijados a fixtures.
- `sql/003-verify-in-staging.sql` está preparado para probar alta, duplicado, payload, leases, reintento, acuse simulado, incertidumbre, máximo de intentos, rechazo de variante y admisión. Todo se ejecuta dentro de una transacción que termina en ROLLBACK. No se ha ejecutado este archivo ni probado concurrencia entre sesiones. Las antiguas comprobaciones por regex del texto SQL se retiraron: no validaban la ejecución del motor.
- Los archivos 001 y 002 llevan transacción y límites de bloqueo/tiempo para una aplicación manual controlada en staging.
- Sigue pendiente conectar Gmail, Header Auth exclusiva, privacidad de ejecuciones y credencial PostgreSQL de staging. La guía paso a paso está en [OWNER-SETUP.md](OWNER-SETUP.md).

## Configuración pendiente, solo servidor

| Variable | Uso |
| --- | --- |
| `N8N_QUOTE_DELIVERY_ENABLED` | Mantener ausente/false hasta el cambio coordinado; true activa el nuevo ingreso. |
| `N8N_QUOTE_WEBHOOK_SECRET` | Secreto exclusivo aleatorio, mínimo 32 caracteres; nunca `VITE_*`, Git ni chat. |
| `QUOTE_ALLOWED_ORIGINS` | Orígenes exactos separados por comas, sin rutas ni barra final; separar preview de producción. |
| `N8N_CATALOG_QUOTE_REQUESTS_UPSTREAM_BASE_URL` | Para v2, base `/webhook/lrmq/catalog/quote-delivery-v2`; el proxy añade `/quote-requests`. |

Crear credencial n8n Header Auth con nombre de cabecera `x-lrmq-quote-auth` y valor idéntico al secreto del servidor. Sustituir la autoasignada ANTES de habilitar el webhook. Conectar OAuth Gmail de la empresa mediante autorización de Google; no compartir contraseñas. Confirmar asignación de `LRMQ_Catalogo` a todos los nodos PostgreSQL (credencial listada `yweip3obnvxHHKdK`).

La ejecución `5225` contiene solo fixtures sintéticos; n8n informa que la redacción de datos de ejecuciones manuales no está activa. Antes de cualquier prueba con solicitudes reales: minimizar/redactar datos de ejecución, establecer retención, verificar permisos del proyecto y limitar acceso a presupuestos. El borrador no configura todavía esas opciones. La sintaxis del correo no demuestra que la dirección exista o pertenezca al solicitante; si se necesita verificación de titularidad requerirá un flujo adicional acordado.

## Garantías diseñadas y límites

El servidor valida JSON, tamaños, contacto y consentimiento; restringe Origin y construye HMAC de cliente y contenido. El guard local es suplementario, no un rate limit distribuido. PostgreSQL controla la admisión compartida. Origin no sustituye autenticación ni protección contra bots; un atacante no navegador puede falsificarlo. Revisar protección WAF/antibot según tráfico sin afectar el formulario aprobado.

Se mantiene la validación comercial del workflow existente y sus snapshots de productos. Presupuesto y entrada en outbox se guardan en la misma transacción. Un contenido idéntico dentro de 10 minutos devuelve el presupuesto existente. La respuesta pública usa `status: received` para el contrato de la web, independientemente del estado operativo `new` almacenado en Neon. No se guarda una copia completa del payload original en `metadata`; se persisten los campos de negocio y metadatos mínimos necesarios para deduplicación y auditoría. La outbox no incluye automáticamente solicitudes antiguas.

El correo usa texto plano, destino y asunto controlados, sin adjuntos ni descarga de URLs. Texto plano evita interpretar HTML, pero no convierte los enlaces o el texto del cliente en confiables. No se promete análisis antivirus ni ausencia absoluta de contenido malicioso.

La cola reclama un trabajo con lease, limita intentos a cinco y usa `SKIP LOCKED`. Se intenta notificar el presupuesto recién recibido; el programador recupera un pendiente por minuto. Puede ampliarse el drenaje si el volumen lo exige. Acuse Gmail con ID marca `sent`, no recepción en bandeja de entrada. Rechazo explícito 429 se reintenta; errores definitivos se marcan failed. Timeouts, respuestas ambiguas o pérdida tras iniciar envío se marcan uncertain: comprobar Gmail por identificador de presupuesto y reconciliar manualmente antes de autorizar un reenvío. No hay garantía de exactamente-un-envío frente a fallos externos.

## Punto 5 — estado y trabajo todavía pendiente

1. Revisar el diff y corregir el contrato de respuesta de v2 ya encontrado. Suite, typecheck y build pasan localmente; resolver/verificar el test de galería intermitente fuera de alcance y ejecutar la validación estricta OpenSpec cuando el CLI esté disponible.
2. El esquema de tablas relevante se leyó en Neon sin mutaciones. Aún faltan verificar privilegios/funciones/extensiones efectivos y probar migraciones primero en un entorno aislado, nunca asumir que están listas para producción.
3. Probar funciones con productos/variantes reales en aislamiento: transacción, duplicado concurrente, 400/429, snapshots, leases, expiración, acuse, errores y máximo de intentos. Verificar query replacements n8n y forma real de errores Gmail. Revisar permisos mínimos de la credencial.
4. Verificar IP de plataforma en Vercel y aislamiento preview/producción. El código usa `x-vercel-forwarded-for`; Vercel documenta que corresponde a la IP pública del cliente. Probar configuración real, origen, secretos, bypass directo, payloads largos y entradas inválidas; confirmar que no hay datos personales o secretos en logs. ([documentación oficial](https://vercel.com/docs/headers/request-headers))
5. Conectar las credenciales y configurar privacidad de ejecuciones. Probar n8n sin envío primero; después realizar UN envío real controlado y confirmar su llegada a `arealrmqtienda@gmail.com`, no solo el acuse del proveedor. Coordinar el envío con el propietario.
6. Si todo pasa, aprobar migración y activación coordinadas. Actualizar endpoint/base y flag juntos; probar frontend→API→DB→correo. Retirar/proteger el webhook antiguo sin autenticación después del corte, pues dejarlo accesible permitiría saltarse la nueva vía. No afectar otros workflows de catálogo/chat.
7. Revisar monitorización de failed/uncertain, tiempos de respuesta y retención. Definir limpieza de ventanas de admisión caducadas y política de conservación de presupuestos/outbox. No borrar historiales sin aprobación.

Rollback: mantener disponibles la definición previa y configuración anterior. Desactivar v2 ante incidente y decidir explícitamente si volver a ingreso anterior sin email; no hacer rollback de datos por borrado ni prometer que la vía anterior mantiene las nuevas protecciones. No reencolar automáticamente correos inciertos.

## Fuera de alcance

Responsive y diseño, JSON, páginas legales, dominio/hosting y publicación comercial. No se autoriza publicación porque el borrador exista: siguen pendientes pruebas, credenciales, privacidad de ejecuciones, esquema/migraciones y recepción real.
