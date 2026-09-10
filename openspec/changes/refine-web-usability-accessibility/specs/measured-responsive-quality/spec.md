## ADDED Requirements

### Requirement: Matriz de layout y dispositivos registrada
La revisión SHALL registrar resultados en 320x568, 360x800, 375x812, 390x844, 414x896, 430x932, 480x800, 568x320, 667x375, 768x1024, 820x1180, 912x1368, 1024x768, 1280x800, 1440x900, 1920x1080, 2560x1440, 3440x1440 y 3840x2160. SHALL distinguir navegador real, emulación y pruebas no ejecutadas, incluyendo Safari/iOS, Chrome/Android y PC cuando estén disponibles.

#### Scenario: Resolución emulada
- **WHEN** se prueba 320x568 mediante emulación desktop
- **THEN** se registra como emulación y no se afirma haber validado teclado virtual ni safe area física de un teléfono

### Requirement: Documento sin recortes accidentales
Cada ruta SHALL evitar overflow horizontal del documento, textos/controles cortados y solapes fixed/sticky. Carruseles intencionados SHALL contener su scroll sin ampliar el documento. Chat y formularios SHALL ser utilizables con altura reducida, zoom y teclado virtual, conservando ratios de imagen y acceso a cierre/envío.

#### Scenario: Landscape con compositor multilinea
- **WHEN** se abre el chat en altura reducida con texto largo en el compositor
- **THEN** el cierre, entrada y envío permanecen accesibles y el hilo conserva un área desplazable sin recorte silencioso

### Requirement: Rendimiento sustentado por medición
Las optimizaciones SHALL incluir baseline y medición posterior comparables de carga, respuesta y estabilidad; SHALL diferenciar métricas de laboratorio de datos reales. SHALL conservar medios del propietario y no mostrar datos ficticios para mejorar puntuaciones. Recursos diferidos o fallidos SHALL ofrecer recuperación o fallback útil.

#### Scenario: Cambio de prioridad de carga
- **WHEN** se optimiza una carga de imagen o módulo
- **THEN** se registra el efecto medido en condiciones equivalentes y se verifica que no introduce saltos o contenido ausente

### Requirement: Mantenimiento con alcance comprobado
Los archivos afectados SHALL estar cubiertos por los checks apropiados, no solo por comandos que los excluyen. Un refactor SHALL responder a un defecto o inconsistencia demostrados y preservar comportamiento de navegación. SHALL NOT hacerse una migración masiva de componentes como requisito previo al tema.

#### Scenario: Nuevo archivo fuera de los globs actuales
- **WHEN** un componente afectado no entra en lint o typecheck
- **THEN** se amplía cobertura de forma acotada o se ejecuta un check explícito, documentando el alcance efectivo

### Requirement: Evidencia visual como gate de salida
La etapa SHALL entregar `docs/audit/web-usability-review.md` con hallazgos, resultados por ruta/viewport y comparaciones claras antes/después. Sin navegador/capturas SHALL mantener pendiente la aceptación visual. La confirmación histórica del propietario SHALL NOT contarse como prueba de cambios nuevos.

#### Scenario: Tests verdes sin navegador
- **WHEN** pasan unitarios/build pero no se puede revisar una modificación visual
- **THEN** se conserva el pendiente visual y no se entrega la etapa como base visual verificada
