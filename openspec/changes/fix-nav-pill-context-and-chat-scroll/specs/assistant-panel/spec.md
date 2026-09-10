## ADDED Requirements

### Requirement: Scroll de fondo con el asistente abierto
El panel del asistente SHALL NOT bloquear el desplazamiento de la página mientras está abierto, conservando su scroll interno y el resto de su comportamiento.

#### Scenario: Página detrás del panel
- **WHEN** el usuario abre el chat y desplaza la página
- **THEN** la página scrollea normalmente y la conversación se mantiene
