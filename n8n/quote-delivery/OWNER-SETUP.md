# Configuración del propietario: presupuestos

Estado: código preparado en rama local; borrador n8n inactivo. No enviar una solicitud todavía. No se ha desplegado el endpoint nuevo ni aplicado SQL a producción.

Workflow: https://n8n.colilladavid.es/workflow/QdNnvSEYMdDSW2qN . Proyecto personal de David Colilla. Vercel: proyecto `pruebas-open-specs`, identificado `prj_biqSQyeFj0TZLxguAePWLNBbwxXW`.

## 1. Resend: credencial genérica de pruebas

1. En Resend verifica `avisos-pruebas.colilladavid.es` con los DNS ya creados en Hostalia. Debe figurar Verified antes del envío.
2. API Keys → Create API Key: nombre `Webs — pruebas`, permiso Sending access, restringida a ese subdominio.
3. En n8n abre **Enviar aviso con Resend** → Authentication: Generic Credential Type → Generic Auth Type: Bearer Auth → Create new credential.
4. Nombre de credencial: `Webs — pruebas Resend`. Campo Bearer Token: pega solo la clave `re_...`, sin añadir `Bearer`. Guarda y selecciónala en el nodo. No compartas la clave en el chat.
5. Deja el nodo deshabilitado y el workflow sin publicar hasta completar SQL staging, Header Auth y privacidad.

Remitente: `webs@avisos-pruebas.colilladavid.es`. Receptor: `pruebas@colilladavid.es`. El remitente no necesita otro buzón. El asunto identifica `[PRUEBAS · AREA LRMQ]`. No se han cambiado los contactos visibles de la web.

La API devuelve aceptación, no recepción en el buzón. Las claves de idempotencia son estables por presupuesto; Resend las conserva 24 horas. Los resultados inciertos quedan para revisión manual; no se reenvían automáticamente. Confirmaremos la entrega en Resend y en tu webmail. La integración de eventos con firma aún queda pendiente antes de producción.

Referencia: https://resend.com/docs/api-reference/emails/send-email

## 2. Credencial exclusiva para el webhook

1. Genera un secreto nuevo en tu ordenador, por ejemplo con `openssl rand -hex 32`. Consérvalo en un gestor de contraseñas.
2. Crea en n8n una credencial **Header Auth** llamada `LRMQ Quote Inbound`.
3. Campo **Name**: `x-lrmq-quote-auth`. Campo **Value**: el secreto generado.
4. En **POST presupuesto seguro v2**, sustituye la credencial del chat por `LRMQ Quote Inbound`. Guarda; deja el nodo deshabilitado y el workflow sin publicar.
5. El mismo valor se usará después en Vercel como `N8N_QUOTE_WEBHOOK_SECRET`, variable privada, sin prefijo `VITE_`. No cambies las credenciales ni variables del chat.

## 3. Privacidad de ejecuciones n8n

Workflow → menú de tres puntos → Settings. Para este workflow configura:

- Save successful production executions: no guardar.
- Save failed production executions: no guardar.
- Save manual executions: no guardar.
- Save execution progress: no guardar.
- Redact production/manual execution data: Redact, si tu instalación ofrece estas opciones.

Guarda sin publicar. La outbox conserva el estado de entrega y errores genéricos; los datos personales permanecen en las tablas del presupuesto. No confundir redacción de la interfaz con una política de retención. Los controles de guardado reducen también la persistencia de la cabecera de autenticación recibida por el webhook.

Referencia oficial: https://docs.n8n.io/workflows/settings/

## 4. PostgreSQL: entorno de pruebas instalado

Actualización: se creó `quote-delivery-test` (`br-plain-hat-ag4xtzk9`), se aplicaron 001/002 por transacción con funciones completas y 003 terminó PASS con ROLLBACK. No hace falta repetir los pasos 1–4 siguientes; se conservan como referencia histórica. Continúa con el paso 5 usando esta rama. La principal no se modificó.

El conector de migraciones devolvió `unterminated dollar-quoted string`, aparentemente al fragmentar el cuerpo de la función. No informó Migration ID ni nombre/ID de rama temporal. La migración por ese conector se detuvo; no está verificada ni aplicada a principal.

1. En Neon abre `LRMQ-Catalogo` (`polished-moon-35278349`) → Branches. Crea una rama de pruebas `quote-delivery-test-2026-10-13` a partir de la rama actual. La copia pertenece a la misma cuenta y puede incluir datos de origen: mantenla privada. Si el intento fallido dejó una rama temporal, no la borres ni uses sin identificarla primero.
2. En SQL Editor selecciona expresamente la rama nueva y la base `neondb`; confirma el nombre de rama antes de cada ejecución.
3. Ejecuta el archivo completo `sql/001-outbox-and-ingest.sql`, incluido BEGIN/COMMIT. Luego ejecuta completo `sql/002-delivery-worker.sql`. El editor debe procesar cada bloque de función entero. Si falla alguno, detente y comparte el error sin datos personales; no sigas al siguiente ni ejecutes en principal.
4. Ejecuta `sql/003-verify-in-staging.sql` completo. Debe mostrar `PASS` y finalizar con `ROLLBACK`: las solicitudes sintéticas se revierten. No llama a n8n ni envía correos. Este script está preparado, no se ha ejecutado todavía. No acredita concurrencia entre dos sesiones ni permisos de una credencial distinta.
5. Crea en n8n una credencial PostgreSQL **nueva**, `LRMQ_Catalogo_presupuestos_pruebas`, con Host/User/Password/Database y SSL del Connection details de esa rama. No edites `LRMQ_Catalogo`, usada por los workflows actuales. Indica el nombre de la nueva credencial y de la rama; yo podré revisar su asignación sin que compartas la contraseña.

## 5. Lo que haré después de tu configuración

Con Resend, Header Auth, privacidad y rama de pruebas preparados:

1. Revisaré las credenciales por su nombre y asignaré la credencial PostgreSQL de pruebas a los cuatro nodos del borrador.
2. Verificaré SQL ejecutado, permisos efectivos, concurrencia, rechazos y recuperación; resolveré errores antes de activar nada.
3. Prepararé la integración del código y un despliegue Preview del endpoint con variables limitadas a esa rama. El commit/push y despliegue siguen pendientes de autorización; el código actual está únicamente en la rama local `feat/quote-email-delivery-pretest`.
4. Prepararé `N8N_QUOTE_DELIVERY_ENABLED`, `N8N_QUOTE_WEBHOOK_SECRET`, `QUOTE_ALLOWED_ORIGINS` con la URL real de ese Preview y el upstream v2. No sustituyas ahora el upstream actual ni actives la bandera globalmente: aún atiende la web anterior.
5. Te daré la URL de prueba y el visto bueno para TU solicitud controlada. Yo revisaré API → presupuesto/outbox → acuse Resend; tú confirmarás su llegada a pruebas@colilladavid.es, incluyendo spam si no aparece en entrada.
6. Solo después acordaremos el corte a producción y la protección/retirada del webhook antiguo. JSON, legales y dominio siguen separados.

Puedes completar Resend, Header Auth y privacidad primero. Avísame con los nombres de las credenciales y el resultado de la prueba SQL; no envíes secretos ni hagas todavía la solicitud desde la web.
