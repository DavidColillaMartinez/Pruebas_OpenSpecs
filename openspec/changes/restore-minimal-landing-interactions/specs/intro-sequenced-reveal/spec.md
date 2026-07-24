## ADDED Requirements

### Requirement: Un solo avance inicia los tres articulos
Inicio desktop SHALL requerir un unico avance de rueda o teclado para iniciar la aparicion de los tres articulos de metodo.

#### Scenario: Primer avance de Inicio
- **WHEN** Inicio pasa de step 0 a su step de contenido
- **THEN** el articulo 1 inicia su entrada inmediatamente, el articulo 2 aproximadamente 800 ms despues y el articulo 3 aproximadamente 1600 ms despues

### Requirement: Stagger sin estado tardio
La secuencia SHALL usar delays declarativos ligados al step visible y MUST NOT dejar timers que actualicen estado despues de abandonar Inicio.

#### Scenario: Salida antes de terminar el stagger
- **WHEN** el usuario avanza a Coleccion antes de que hayan pasado dos segundos
- **THEN** Inicio no ejecuta callbacks de estado pendientes ni afecta al capitulo activo

### Requirement: Menos pasos narrativos
La configuracion narrativa SHALL contabilizar un solo step interno para los articulos de Inicio, de modo que no se necesite un gesto separado para cada articulo.

#### Scenario: Avance despues de iniciar los articulos
- **WHEN** Inicio ya esta en su unico step de contenido y el usuario vuelve a avanzar
- **THEN** la navegacion continua hacia Coleccion conforme al cooldown existente

#### Scenario: Navegacion por teclado
- **WHEN** el usuario pulsa ArrowDown o PageDown desde Inicio
- **THEN** obtiene la misma secuencia y numero de pasos que con la rueda

### Requirement: Movimiento reducido
Con `prefers-reduced-motion: reduce`, los tres articulos SHALL aparecer sin esperas perceptibles ni transiciones prolongadas.

#### Scenario: Usuario con movimiento reducido
- **WHEN** se activa el step de contenido con movimiento reducido
- **THEN** los tres articulos quedan visibles practicamente a la vez y la navegacion sigue operativa
