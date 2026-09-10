## ADDED Requirements

### Requirement: Recorridos completos conservan estado
La web SHALL conservar filtros, búsqueda, orden y posición al volver del detalle al catálogo, y variantes/cantidades al pasar al presupuesto. Navegación interna, enlaces directos, recarga y Atrás/Adelante SHALL ofrecer estados coherentes sin duplicar selecciones o peticiones.

#### Scenario: Catálogo a detalle y vuelta
- **WHEN** se abre una ficha desde resultados filtrados y se vuelve al catálogo
- **THEN** se recuperan consulta y posición previstas sin perder selección de presupuesto

### Requirement: Chat mantiene continuidad y apertura móvil segura
El chat SHALL conservar conversación, productos, acciones y borrador al cerrar/reabrir y navegar; SHALL no abrir teclado móvil automáticamente. Nueva conversación SHALL limpiar borrador e invalidar respuestas tardías; retry SHALL recuperar errores sin duplicar envíos concurrentes. El seguimiento SHALL respetar lectura manual y hacer visible un envío propio.

#### Scenario: Mensaje pendiente y nueva conversación
- **WHEN** el usuario inicia nueva conversación mientras llega una respuesta anterior
- **THEN** el borrador anterior se limpia y la respuesta tardía no entra en la nueva conversación

#### Scenario: Apertura móvil y lectura del historial
- **WHEN** el usuario abre el chat en móvil y después lee mensajes antiguos mientras llega una respuesta
- **THEN** no aparece teclado por autoenfoque y la lectura no es desplazada involuntariamente

### Requirement: Errores permiten recuperación sin pérdida evitable
Formularios, catálogo, media y chat SHALL mostrar espera/error/vacío/éxito adecuados. Un error de red SHALL conservar los datos necesarios para reintentar y un envío repetido mientras hay petición pendiente SHALL no duplicar la operación. Datos de prueba SHALL no sustituir silenciosamente una respuesta real fallida.

#### Scenario: Fallo de presupuesto
- **WHEN** falla un envío local de prueba de presupuesto con campos y líneas completados
- **THEN** se conserva lo escrito y la selección, se identifica el error y se puede reintentar según el contrato existente

### Requirement: Teclado lectores y controles utilizables
Las superficies SHALL cumplir los criterios WCAG 2.2 AA aplicables de nombre/rol, contraste, estructura, foco y mensajes, con controles táctiles principales de al menos 44 px. Los overlays SHALL gestionar foco, Escape y restauración de scroll sin desbloquear otra superficie activa. Los anuncios del chat SHALL no releer todo el historial con cada respuesta.

#### Scenario: Dos overlays con cierre sucesivo
- **WHEN** se abren superficies superpuestas en una combinación permitida y se cierran en distinto orden
- **THEN** solo la superficie activa recibe teclado, el fondo permanece bloqueado cuando corresponda y el foco vuelve a un control válido

#### Scenario: Error leído con tecnología asistiva
- **WHEN** un formulario informa de un campo inválido
- **THEN** el mensaje está asociado al campo, puede descubrirse con teclado/lector y no depende solo del color
