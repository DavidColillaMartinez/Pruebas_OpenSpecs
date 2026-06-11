## ADDED Requirements

### Requirement: Desktop narrative requires a wide-enough viewport
The page SHALL activate the desktop narrative flow only when the viewport is wide enough and tall enough to support the controlled experience. The default gate MUST be a minimum width of 1024px AND a minimum height of 720px. Viewports that fail the gate MUST render the stacked mobile/tablet experience instead.

#### Scenario: User opens the page on a 1280x600 laptop
- **WHEN** a user opens the page on a 1280x600 viewport
- **THEN** the page renders the stacked mobile/tablet experience because the height gate is not met

#### Scenario: User opens the page on a tablet portrait
- **WHEN** a user opens the page on a 768x1024 tablet in portrait
- **THEN** the page renders the stacked mobile/tablet experience because the width gate is not met

#### Scenario: User opens the page on a 1440x900 monitor
- **WHEN** a user opens the page on a 1440x900 viewport
- **THEN** the page renders the desktop narrative experience because both gates are met

### Requirement: Window resize re-evaluates the gate
The page SHALL re-evaluate the desktop narrative gate when the window is resized. Crossing the gate in either direction MUST update the active experience on the next frame.

#### Scenario: User resizes from desktop to narrow
- **WHEN** a user resizes the window from a desktop-class size to a narrow size
- **THEN** the page transitions to the stacked mobile/tablet experience without a full reload

#### Scenario: User resizes from narrow to desktop
- **WHEN** a user resizes the window from a narrow size to a desktop-class size
- **THEN** the page transitions to the desktop narrative experience without a full reload
