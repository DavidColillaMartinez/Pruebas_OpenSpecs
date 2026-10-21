# Configuración del envío transitorio

Configurar en el entorno privado N8N_QUOTE_DELIVERY_ENABLED, N8N_CATALOG_QUOTE_REQUESTS_UPSTREAM_BASE_URL, N8N_QUOTE_WEBHOOK_SECRET y QUOTE_ALLOWED_ORIGINS. Usar autenticación Header Auth y las credenciales existentes del catálogo y correo. No publicar valores, identificadores operativos ni exportaciones con datos.

Antes de aplicar cambios, leer el workflow activo, comparar nodos y conservar sus credenciales. transient-workflow.json es una definición sanitizada, no una copia acreditada de producción. Activar solo después de verificar el entorno de prueba y la configuración del proveedor.

La consulta SQL utiliza identificadores del catálogo; contacto y mensaje se procesan en memoria para el correo, sin una cola de solicitudes en PostgreSQL. Revisar en el servicio que éxito, error, progreso y ejecución manual no guarden datos privados. Esta comprobación del envío no acredita el tratamiento del chat ni de otros servicios.

Un 201 confirma aceptación del proveedor con identificador, no entrega al buzón. La idempotencia depende de su ventana de servicio y el limitador local no constituye un límite global entre instancias. Ante un resultado ambiguo comprobar el proveedor antes de reenviar.

No reinstalar los antiguos SQL de almacenamiento. SQL 005 documenta la retirada histórica; no ejecutarlo automáticamente. La recepción real, dominio, privacidad y aceptación que sigan pendientes requieren comprobación del propietario. Esta documentación no los da por completados.
