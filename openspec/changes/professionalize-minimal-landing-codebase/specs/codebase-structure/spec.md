## ADDED Requirements

### Requirement: src tree is split by concern
The `src/` directory MUST be organized into `data/`, `hooks/`, `components/`, `sections/`, and `styles/` subdirectories. Brand constants, hooks, reusable components, and section components MUST live in their respective folders.

#### Scenario: Project layout
- **WHEN** an engineer opens the project
- **THEN** the `src/` directory exposes a clear tree where data, hooks, components, sections, and styles are separated

### Requirement: App.jsx is a thin entry
`App.jsx` MUST be a thin entry that wires data, hooks, and section components. It MUST NOT define brand constants, hooks, or section JSX inline.

#### Scenario: Engineer reads App.jsx
- **WHEN** an engineer reads `App.jsx`
- **THEN** the file is short, declarative, and references the data, hooks, and section components without redefining them

### Requirement: Reusable components exist for repeated patterns
The codebase MUST expose reusable components for the repeated visual patterns of the page: `LogoMark`, `Button`, `GoldLabel`, `SectionTitle`, `CompareSlider`, `ProgressBar`, `ProjectFacts`, `ContactLinks`, `ContactForm`, and `MobileSectionShell`. These components MUST be the single source of truth for those patterns.

#### Scenario: Section uses shared components
- **WHEN** a section renders a "Reforma en 21 días" block
- **THEN** it uses the shared `SectionTitle`, `ProjectFacts`, and `ProgressBar` components instead of re-implementing them

### Requirement: Dead state and dead branches are removed
The codebase MUST NOT contain unused state, unused refs, unused exports, or unreachable branches. Concretely, `useNarrativeScroll` MUST NOT return `skipBlocked` or a `chapterLabels` array. The `App` component MUST NOT destructure fields it does not use.

#### Scenario: Lint passes
- **WHEN** an engineer runs a typecheck or unused-import check
- **THEN** no unused exports, no unused state, and no unused destructured fields are reported in the production code
