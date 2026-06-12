## ADDED Requirements

### Requirement: Colección keeps the first two reveal beats unchanged
The desktop Colección section SHALL keep the reveal behavior of `Vidrio templado` and `Textura mineral` unchanged.

#### Scenario: First featured reveal remains unchanged
- **WHEN** the user reaches the existing reveal step for `Vidrio templado`
- **THEN** the featured content appears as it does before this change

#### Scenario: Textura mineral reveal remains unchanged
- **WHEN** the user reaches the existing reveal step for `Textura mineral`
- **THEN** the `Textura mineral` block appears as it does before this change

### Requirement: Colección reveals the remaining three blocks from one scroll action
After `Textura mineral`, the next three Colección content blocks SHALL become eligible to reveal from a single desktop scroll action. The blocks MUST appear in order using a staggered visual delay rather than requiring one scroll action per block.

#### Scenario: One scroll triggers the grouped reveal
- **WHEN** the user has reached `Textura mineral` and scrolls once downward
- **THEN** the next three Colección blocks begin appearing from the same narrative step

#### Scenario: Grouped reveal preserves visual order
- **WHEN** the grouped reveal starts
- **THEN** `Líneas puras` appears first, the next block appears after a short delay, and the final block appears after another short delay

#### Scenario: Reduced motion still reveals all grouped blocks
- **WHEN** the user has reduced motion enabled and reaches the grouped reveal step
- **THEN** all grouped blocks become visible without requiring separate scroll actions
