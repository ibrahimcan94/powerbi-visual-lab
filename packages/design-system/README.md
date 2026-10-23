# Shared design system

`base.less` is the common dashboard shell, navigation, cards, typography, focus states, themes and responsive rules used by Finance OS and both Workforce OS visuals. Each visual imports it and adds its own styles. Keep domain calculations and data adapters in the owning tool.

The shared preview compiler in `scripts/preview.cjs` compiles the same Less imports into self-contained offline HTML. Power BI's Less compiler uses the same source.
