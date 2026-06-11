## ADDED Requirements

### Requirement: Reformas progress bar reaches 100% on video end
The mobile Reformas progress bar MUST reach 100% width when the video reaches its end. The progress text MUST update to "Proyecto completo" once the bar is full.

#### Scenario: Video plays to the end
- **WHEN** a user plays the Reformas video on mobile and the video ends
- **THEN** the progress bar width is 100% and the progress text reads "Proyecto completo"

### Requirement: Reformas listeners are cleaned up on remount
The mobile Reformas component MUST clean up its `timeupdate` and `ended` listeners on unmount and on re-mount. The component MUST NOT accumulate duplicate listeners across renders.

#### Scenario: Section remounts
- **WHEN** the user navigates away from Reformas and back
- **THEN** the listeners are removed and re-added cleanly and the progress bar starts from 0

### Requirement: Reformas video uses a sensible poster
The mobile Reformas video MUST use a poster that visually matches the renovation theme. If a Reforma-specific poster is not available, the `poster` attribute MUST be omitted rather than referencing an unrelated image.

#### Scenario: User reaches Reformas on a slow connection
- **WHEN** a user on a slow connection reaches the Reformas section
- **THEN** the poster is either a Reforma-themed image or absent; the section MUST NOT use the Boceto poster as a placeholder
