# Power BI Visual Lab Roadmap

## Current status

This roadmap is the starting point for the modernization of the existing `KpiDashboard` visual. The existing implementation and repository conventions must be inspected before source changes are made; working behavior will be preserved throughout the migration.

## Phases

1. **Foundation** — inventory the current project, preserve the SDK entry points and `tsconfig` file constraints, establish modular integration/visual/UI/utilities boundaries, add strict validation, linting, fixtures, and focused transformation tests.
2. **Production KPI** — parse independent headline and comparison measures, add robust null/missing handling, variance semantics, formatting, and accessible KPI states.
3. **Advanced D3** — refine responsive scales, date-aware ordering, negative/zero handling, area fill, crosshair/tooltips, reduced-motion behavior, and chart customization.
4. **Native Power BI integration** — use supported selection, context-menu, formatting-model, theme, and lifecycle APIs with cleanup on destroy.
5. **Reusable framework** — extract shared design tokens, components, adapters, data contracts, and documentation for future visuals.
6. **Validation and polish** — run checks, tests, lint, and `.pbiviz` packaging; resolve defects and document manual Power BI Desktop verification steps.

## Working agreements

- Do not introduce network calls, telemetry, credentials, or unsupported Power BI APIs.
- Keep the headline KPI sourced from its own measure; never infer it by summing trend points.
- Prefer small, typed modules and stable render boundaries to avoid unnecessary rerenders.
- Preserve existing formatting capabilities while migrating to newer supported APIs.
- Update this document and the architecture documentation as significant decisions are made.

## Validation gates

Each phase should pass TypeScript validation, linting, focused tests, and packaging when the project toolchain supports them. Power BI Desktop behavior will be reported separately and will only be marked verified after an actual Desktop test.

## Baseline inspection
CLI 7.2.1 / API 5.11.1, React 19, D3 7. Preserve GUID, existing measure role and tsconfig files entry. Repair duplicate mappings, summed headline, unused settings, missing host interactions. Implement adapter and tests, formatting, responsive charts and selection, then package.

## Implementation status

Phases 1–5 delivered as a reusable KPI foundation: strict adapter, eight focused tests, independent scalar roles, variance/formatting, D3 gaps/date geometry/comparison, native selection/context menu, formatting cards, theme and lifecycle cleanup. Phase 6: TypeScript/lint/tests and production packaging validated; Desktop acceptance remains manual.

Next refinements: native tooltip service, external selection synchronization, complete custom format-string support, true path interpolation, localization and host cross-highlights. See README for exact scalar/DAX contract and limits.
