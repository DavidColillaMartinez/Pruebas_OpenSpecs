## ADDED Requirements

### Requirement: Desktop Vision remembers if the user already saw the sketch video in the session
The desktop Vision section MUST remember, for the lifetime of the current page load, whether the user has reached the "ended" state of the sketch video at least once. While the page is reloaded the memory is reset.

#### Scenario: First time entering Vision in a session
- **WHEN** the user lands on the page and scrolls to the Vision chapter for the first time
- **THEN** the sketch video starts playing automatically (consistent with current narrative behavior)

#### Scenario: Re-entering Vision after the video was already completed
- **WHEN** the user has already completed the sketch video in this session and then re-enters the Vision chapter
- **THEN** the section opens directly in the "reveal" state, the "Revelar" overlay is visible, and the video is paused on its last frame

#### Scenario: Re-entering Vision while the video is still in progress
- **WHEN** the user leaves Vision while the video is still playing and later re-enters
- **THEN** the video resumes from where it was paused, the "ended" state has not been recorded, and "Revelar" is not shown yet

#### Scenario: Reloading the page resets the memory
- **WHEN** the user reloads the page in the browser
- **THEN** the "already seen" memory is reset and the video plays again on the first entry to Vision

### Requirement: Replay button is shown only in the "reveal" state
When the desktop Vision section is in the "reveal" state (video ended, before user clicks "Revelar"), a replay button MUST be visible. The button MUST NOT be visible in any other state.

#### Scenario: Replay button visible after video ends
- **WHEN** the sketch video reaches its end and "Revelar" is the next action
- **THEN** the replay button is visible alongside (or in addition to) the "Revelar" button

#### Scenario: Replay button hidden while video is playing
- **WHEN** the user is in the "playing" state of the Vision section
- **THEN** the replay button is not in the DOM and is not focusable

#### Scenario: Replay button hidden once comparison is active
- **WHEN** the user has clicked "Revelar" and the slider is shown for comparison
- **THEN** the replay button is not in the DOM and is not focusable

#### Scenario: Replay button click restarts the video
- **WHEN** the user clicks the replay button in the "reveal" state
- **THEN** the sketch video resets to time 0, starts playing, and "Revelar" is hidden until the video ends again

### Requirement: Replay button has an animated circular arrow icon
The replay button MUST render a circular arrow icon that signals "replay / volver a ver". The icon MUST have a subtle animation (rotation, scale, or equivalent) tied to hover or to a continuous keyframe, consistent with the brand's minimal/sobrio aesthetic.

#### Scenario: Hover triggers the icon animation
- **WHEN** the user hovers the replay button
- **THEN** the circular arrow icon animates (rotation or scale) with a transition between 200 ms and 500 ms

#### Scenario: Icon is keyboard-focusable
- **WHEN** the user tabs to the replay button
- **THEN** the focus ring is visible and matches the existing clay focus ring of the page

### Requirement: Replay control meets the existing accessibility baseline
The replay button MUST be reachable by keyboard, expose a meaningful accessible name, and have at least a 44x44 CSS pixel hit area.

#### Scenario: Replay button is announced to assistive technology
- **WHEN** a screen reader focuses the replay button
- **THEN** it announces the button's purpose (e.g. "Reproducir video de nuevo" or "Volver a ver")
