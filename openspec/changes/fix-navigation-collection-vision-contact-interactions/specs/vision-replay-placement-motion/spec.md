## ADDED Requirements

### Requirement: Vision replay button is fully visible in the lower-right corner
The desktop Vision replay button SHALL be positioned in the lower-right corner of the compare/video frame while it is visible. The full button and focus ring MUST remain within the frame and must not be clipped.

#### Scenario: Replay button visible after video ends
- **WHEN** the video has ended and the `Revelar` overlay is visible
- **THEN** the replay button appears in the lower-right corner of the frame

#### Scenario: Replay button is not clipped
- **WHEN** the replay button is visible
- **THEN** its circular button, icon, and focus ring are fully visible

### Requirement: Vision replay icon rotates on hover and focus
The replay icon SHALL clearly rotate when the user hovers or keyboard-focuses the replay button. The animation MUST communicate reload/replay and MUST use transform-based motion.

#### Scenario: Hover rotates replay icon
- **WHEN** the user hovers the replay button
- **THEN** the reload icon rotates at least 180 degrees and returns to a stable state

#### Scenario: Focus rotates replay icon
- **WHEN** the user focuses the replay button with keyboard
- **THEN** the reload icon rotates and the focus ring is visible

#### Scenario: Reduced motion suppresses replay rotation
- **WHEN** the user has reduced motion enabled
- **THEN** the replay button does not perform a large rotation animation
