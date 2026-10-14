## Purpose

Ofrecer información legal y de privacidad accesible para la actividad informativa de AREA LRMQ y sus flujos reales, sin atribuir aprobaciones o prácticas no acreditadas.

## ADDED Requirements

### Requirement: Rutas legales accesibles
El sitio SHALL ofrecer /aviso-legal, /privacidad y /cookies con identidad confirmada, lectura móvil/desktop en ambos temas y navegación de teclado.

#### Scenario: Acceso directo y recarga
- **WHEN** un visitante abre o recarga cada ruta legal
- **THEN** recibe su página con un encabezado principal, enlaces de retorno y contenido legible, sin alterar rutas API, assets ni 404.

### Requirement: Información previa y conservación del borrador
El sitio SHALL informar antes de transmitir datos en presupuesto, WhatsApp y asistente. Los formularios SHALL enlazar la política en nueva pestaña accesible y mantener la casilla obligatoria como lectura de información, sin consentimiento comercial.

#### Scenario: Leer privacidad desde ficha o cesta
- **WHEN** un usuario con campos cumplimentados abre la política desde cualquiera de los formularios
- **THEN** el texto se abre sin reemplazar la página original ni perder datos o selección, y enviar sin marcar la casilla sigue bloqueado.

#### Scenario: Contacto y asistente
- **WHEN** el usuario prepara el primer mensaje
- **THEN** dispone de información del flujo y enlace completo antes de abrir WhatsApp o enviar al asistente, sin envío provocado por leer la información.

### Requirement: Metadatos aislados
Las páginas legales SHALL usar metadatos propios y canonical https://arealrmq.es; noindex,follow SHALL limitarse a esas rutas conservando las reglas comerciales existentes.

#### Scenario: Salir de una página legal
- **WHEN** se navega a portada o catálogo después de visitar una página legal
- **THEN** se restauran sus título, descripción, canonical y robots sin contaminación de noindex legal.

### Requirement: Contenido basado en evidencia
Los textos SHALL distinguir los flujos y almacenamiento reales, identificar a la sociedad con DESING y separar la contratación independiente de arquitectura. Los pendientes SHALL documentarse internamente sin inventar registros, plazos, contratos o aprobación legal.

#### Scenario: Revisión del responsable
- **WHEN** se entrega el cambio para revisión local
- **THEN** el informe distingue contenido implementado, fuentes, evidencias, límites y pendientes de gestoría, chat y proveedores; las aprobaciones siguen abiertas y no se publica.

### Requirement: Tecnologías del navegador
El sitio SHALL explicar titular, finalidad y duración efectiva del almacenamiento observado. Un banner SHALL implementarse solo si el inventario acredita tecnologías no exentas y puede bloquearlas realmente.

#### Scenario: Inventario técnico exento
- **WHEN** la revisión solo identifica almacenamiento funcional exento
- **THEN** la página lo describe sin añadir consentimiento ficticio ni afirmar ausencia universal de terceros.
