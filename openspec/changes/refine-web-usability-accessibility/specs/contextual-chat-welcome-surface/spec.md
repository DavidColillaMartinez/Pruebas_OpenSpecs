## ADDED Requirements

### Requirement: Evidencia de la composición de bienvenida
Antes de corregir la burbuja, la revisión SHALL comprobar CSS generado, fondo efectivo, blur, opacidad, stacking y contraste sobre Inicio fotográfico y Quiénes somos. SHALL NOT asumir que la clase `bg-white/96` se emite o que el contenedor narrativo causa el defecto sin verificarlo.

#### Scenario: Comparación de superficies
- **WHEN** se inspecciona la bienvenida sobre fotografía y sobre fondo claro
- **THEN** se registran los estilos calculados y la evidencia visual que justifican el cambio contextual

### Requirement: Corrección limitada a Inicio fotográfico
La burbuja SHALL ser legible y diferenciable sobre la imagen del inicio, manteniendo el efecto de blur solicitado. Fuera de ese contexto SHALL conservar el aspecto aprobado, incluido blur en Quiénes somos. La corrección SHALL NOT alterar fotografía, contenedor narrativo, composición de landing o navegación lateral, ni imponer fondo sólido global.

#### Scenario: Salir de Inicio con la burbuja visible
- **WHEN** el usuario pasa de Inicio a Quiénes somos o al catálogo mientras la burbuja se muestra
- **THEN** la presentación deja de usar el ajuste específico del hero y mantiene el blur/aspecto aprobado del nuevo fondo

### Requirement: Presentación no altera interacción de bienvenida
La corrección de superficie SHALL conservar temporización, descarte por sesión, apertura/cierre, logo y foco del aviso, excepto defectos funcionales demostrados y registrados por separado. SHALL respetar movimiento reducido y no introducir teclado automático móvil.

#### Scenario: Pulsar la burbuja sobre Inicio
- **WHEN** el usuario abre el asistente desde el aviso corregido
- **THEN** se ejecuta la apertura existente, el aviso se descarta según su política de sesión y no se pierde conversación ni aparece teclado automático en móvil
