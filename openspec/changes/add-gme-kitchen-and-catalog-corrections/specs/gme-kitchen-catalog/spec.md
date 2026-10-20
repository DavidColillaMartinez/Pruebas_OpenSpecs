## ADDED Requirements

### Requirement: Cocina fiel al catálogo IO 2026
The system SHALL expose eleven kitchen products and their 23 actual references using the current catalogue API, database and quote contracts.

#### Scenario: Selección de acabado
- **WHEN** a customer opens a kitchen product
- **THEN** the explicit cover appears first and every selectable finish has a real image thumbnail
- **AND** manual finish selection activates its full-size photo and preserves its real variant ID/reference for quotes
- **AND** selector cutouts never replace gallery or quote photographs

#### Scenario: Datos fuente
- **WHEN** the import is prepared
- **THEN** Silver is chrome reference 3145, Osmosis Extraíble contains 3230/3231 and Osmosis Acero contains 3137
- **AND** no generic extra Osmosis product, prices, points or unsupported equipment is fabricated

### Requirement: Maneta y nombres inequívocos
The system SHALL retain the complete Sirio shower while retiring the separate one-function handle from the public offer, without deleting historical records.

#### Scenario: Modelos homónimos
- **WHEN** Basic, Glass, Open or Screen appears in a catalogue card
- **THEN** its product type is included in its public name and its original ID, slug and collection are preserved

### Requirement: Publicación verificable
The import SHALL remain isolated until all 47 assets are available at their canonical paths with expected SHA256 and manual browser review is completed.

#### Scenario: Retorno
- **WHEN** the guarded rollback is applied before conflicting later edits
- **THEN** original content is restored and new products are archived, with the existing audit trigger recording the restore timestamp


### Requirement: Separación del ámbito de grifería
The catalogue SHALL let customers narrow the Grifería family to bathroom taps or kitchen taps.

#### Scenario: Ámbito tras seleccionar Grifería
- **WHEN** the customer chooses `catalog_section=griferia`
- **THEN** the next relevant facet offers «Grifería de baño» and «Grifería de cocina» with server-side counts
- **AND** selecting either scope retains both options so the customer can switch
- **AND** bathroom counts include lavabo/bidé products, while kitchen counts include kitchen taps; shower families are excluded
- **AND** the parameter travels through the existing proxy and list workflow, without client-side filtering of one page
