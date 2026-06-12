## ADDED Requirements

### Requirement: Desktop side navigation dots are interactive controls
The desktop side navigation dots SHALL be rendered as interactive controls that navigate to their corresponding section when clicked or activated by keyboard.

#### Scenario: User clicks a side dot
- **WHEN** the user clicks the side navigation dot for `Visión`
- **THEN** the page navigates to the Visión chapter using the existing desktop narrative navigation mechanism

#### Scenario: User activates a dot with keyboard
- **WHEN** the user tabs to the `Contacto` side navigation dot and presses Enter or Space
- **THEN** the page navigates to the Contacto chapter

#### Scenario: Active dot remains visually distinct
- **WHEN** the user is in a chapter
- **THEN** that chapter's dot remains visually active with the current active styling

### Requirement: Side navigation label follows hover and focus
The desktop side navigation label SHALL display the hovered or focused dot's section name while the pointer or focus is on that dot. When no dot is hovered or focused, the label MUST display the current active chapter.

#### Scenario: Hover previews section label
- **WHEN** the user hovers the dot for `Colección` while currently in `Inicio`
- **THEN** the label changes from `Inicio` to `Colección`

#### Scenario: Hover exit restores active section label
- **WHEN** the user stops hovering any dot while still in `Inicio`
- **THEN** the label returns to `Inicio`

#### Scenario: Focus previews section label
- **WHEN** the user tabs to the dot for `Reformas`
- **THEN** the label changes to `Reformas`

### Requirement: Side navigation label transition is smooth
The label change in the side navigation SHALL animate with transform and/or opacity between 200 ms and 350 ms. The transition MUST not cause layout shift or change the dot positions.

#### Scenario: Label changes without layout jump
- **WHEN** the user moves hover across multiple side dots
- **THEN** the label changes smoothly and the dots remain in a stable vertical position
