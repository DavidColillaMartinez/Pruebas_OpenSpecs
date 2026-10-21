# Presupuestos por correo sin almacenamiento de solicitudes

El proxy valida cuerpo y origen, aplica controles locales y autentica la petición al workflow. El workflow valida los identificadores contra el catálogo público, prepara el mensaje en memoria y solicita el envío al proveedor de correo. Un 201 requiere confirmación del proveedor con identificador; no acredita recepción en el buzón. Evitar reenvíos automáticos ante resultados ambiguos.

Fuentes mantenidas: transient-workflow.json, validate-transient.js, resolve-transient.mjs, format-mail.mjs y sus pruebas. sql/004-read-only-catalog.sql define la consulta de catálogo. sql/005-remove-quote-storage.sql conserva el registro de retirada; no se ejecuta automáticamente.

Se han retirado del estado actual los backups, el SDK anterior y SQL 001/002/003 de almacenamiento y worker. No reinstalarlos.

Consultar [configuración transitoria](TRANSIENT-SETUP.md) y [criterios del mensaje](MAIL-CONTEXT.md). Los identificadores reales, credenciales, destinatarios operativos y evidencias de servicio corresponden a la configuración privada. Las definiciones del repositorio no prueban lo desplegado. Las tareas de aceptación pendientes de OpenSpec mantienen su estado.
