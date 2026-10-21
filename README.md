# Power BI Visual Lab

A React / TypeScript / D3 custom KPI visual, extending the original visual GUID and trend role. Default dark theme, optional light/high contrast theme, configurable KPI and chart, independent headline and comparison measures, variance, date-aware chart, missing-data gaps, keyboard point selection and native selection/context menu APIs.

## Develop on Windows

Use Node.js supported by Power BI visuals tools 7.2.1. Install the CLI with npm install -g powerbi-visuals-tools@7.2.1 if absent. From visuals/kpiDashboard run npm ci, npm run check, npm test, npm start, and npm run build. Build creates dist/*.pbiviz. The CLI is currently supplied globally; no new runtime dependencies were added. npm run package is also retained.

## Bind measures correctly

- Trend axis: date or category. Trend measure: the original measure role.
- Independent headline measure: a dedicated DAX measure evaluated independently of the trend category. Example: Revenue headline = CALCULATE([Revenue], ALLSELECTED('Calendar'[Date])). Choose the correct filter-removal expression for the model and actual axis. Do the same for Independent headline comparison.
- Trend comparison: optional category-level measure.

Categorical mappings evaluate measures per category. The adapter deliberately reads the first headline value and NEVER sums category values. Therefore headline DAX must return the same intended scalar for each category. A normal ratio bound without removing axis context is not a report-wide ratio. Empty/headline-null data displays an em dash; no total is fabricated. A zero baseline has absolute variance but no percentage. Positive variance indicates an increase, not necessarily business success.

## Formatting and interaction

Dashboard and chart cards control title, fonts, decimals, prefixes/suffixes, percent scaling, theme/colors, chart visibility, width/fill, gridlines, tooltip, comparison and animation. Currency uses a prefix/suffix. Percent mode expects fractional values. Legacy color/font properties remain and migrate when new equivalents are absent. Obsolete legacy saturation/show-all metadata is retained; all points use the configured line color.

Tab to points, Enter/Space selects; Ctrl/Command adds selection. Right click or Shift+F10 opens the host context menu. Clear selection uses the native manager. Tooltips show point and comparison values. High contrast uses host foreground/background; reduced motion disables entry animation.

## Manual Power BI Desktop acceptance

Import dist/*.pbiviz using Get more visuals > Import a visual from a file. Bind headline, trend, axis and comparison fields. Verify DAX headline semantics under slicers and cross filters, click and multi-select against a second visual, clear selection, context menus and keyboard focus. Check 200x150, 600x300 and large viewports, light/dark/high contrast, zero/negative/null series, date sorting, tooltip clipping, format persistence after reopen, and reduced motion. These Desktop checks have NOT been executed.

## Current limits

Chart is capped at 1,000 categories by host reduction; there is no paging. Comparison is a dashed line. Number formats use Intl plus explicit pane settings rather than all DAX custom format strings. Animation is an entry fade; interpolated path transitions remain future work. Native host tooltip service, localization resources and partial cross-highlighting remain future work. Selection dimming is local and resets after host data updates. Shared framework currently comprises the typed adapter, formatting utilities, KPI and chart components; additional navigation/dropdown components should be introduced with real use cases.
