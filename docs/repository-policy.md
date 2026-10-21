# Política del repositorio

Versionar código, pruebas, contratos y ejemplos con datos ficticios o públicos. Mantener secretos, archivos .env reales, datos de clientes, exportaciones operativas y configuración administrativa fuera de GitHub. Las variables VITE_* llegan al navegador y no pueden contener secretos.

Usar pnpm y pnpm-lock.yaml como única instalación reproducible. Vercel instala la versión fijada en packageManager. Los informes extensos regenerables se guardan localmente en reports/generated/; conservar en Git los resúmenes útiles y los scripts de reproducción.

Las definiciones sanitizadas de n8n documentan contratos, pero no acreditan el estado del servicio. Resolver destinos, identificadores y credenciales desde la configuración privada antes de actuar. No reinstalar los SQL de almacenamiento retirados ni ejecutar automáticamente el SQL histórico de retirada.

Eliminar un archivo del estado actual no lo elimina del historial, de clones ni de copias previas. Si aparece una credencial real, revocarla o rotarla; hacer privado el repositorio no la invalida. Esta limpieza no reescribe el historial.
