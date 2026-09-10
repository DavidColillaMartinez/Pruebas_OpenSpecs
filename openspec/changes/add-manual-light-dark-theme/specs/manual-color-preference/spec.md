## ADDED Requirements

### Requirement: Claro predeterminado y elección exclusivamente manual
Sin preferencia válida guardada, la web SHALL usar el diseño claro actual aunque el sistema operativo prefiera oscuro. El selector SHALL ofrecer únicamente claro y oscuro y cambiar de estado solo por elección explícita o recuperación de esa elección guardada.

#### Scenario: Primera visita con sistema oscuro
- **WHEN** se abre la web sin preferencia guardada en un sistema configurado en oscuro
- **THEN** se muestra el diseño claro y no se cambia de tema por el sistema

### Requirement: Persistencia independiente y degradación segura
La preferencia SHALL guardarse como `light` o `dark` bajo `lrmq:theme:v1` sin incluir datos de chat/presupuesto. Un valor inválido o fallo de lectura SHALL resolver a claro; fallo de escritura SHALL no impedir cambiar el tema en la sesión actual ni romper la interfaz.

#### Scenario: Almacenamiento bloqueado
- **WHEN** localStorage falla al elegir oscuro
- **THEN** el tema actual cambia a oscuro sin error no controlado y la conversación y formularios permanecen intactos

### Requirement: Aplicación temprana compatible con seguridad
Una preferencia guardada SHALL aplicarse antes del primer pintado visible del contenido para evitar destello del tema opuesto, usando un mecanismo permitido por CSP. SHALL NOT habilitar `unsafe-inline` en script-src solo para inicializar tema ni depender de una petición al backend.

#### Scenario: Recarga con oscuro guardado y CSP activa
- **WHEN** se recarga una ruta directa con preferencia oscura bajo las cabeceras de producción simuladas localmente
- **THEN** se aplica oscuro sin violación CSP ni destello claro y se muestra contenido usable si el almacenamiento falla

### Requirement: Control accesible y posición acordada
El selector SHALL tener activación por teclado, nombre/estado accesible, foco visible y target mínimo de 44x44 px. En la cabecera móvil de portada SHALL estar inmediatamente antes de `Tienda` en orden visual/DOM. En PC SHALL integrarse en cabecera; las demás rutas SHALL ofrecer el mismo control en su zona superior de navegación existente sin añadir enlaces comerciales ni reemplazar navegación.

#### Scenario: Cabecera a 320 px
- **WHEN** el usuario visita la portada en móvil estrecho
- **THEN** el control aparece antes de `Tienda`, ambos siguen utilizables y no se recorta el botón de menú
