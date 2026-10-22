# Finance OS custom visual

A complete Finance Invoice-to-Cash workspace inside a single Power BI visual. Five internal React pages share filters, navigation, D3 geometry and a tested event-ledger model. The layout follows the supplied Creative Tim Material Dashboard screenshot, using original components and CSS. The public reference repository contains no application source; no paid template code or backend is bundled.

## Commands

With Node.js and Power BI visuals tools 7.2.1 installed globally: npm ci, npm run check, npm test, npm run build. npm run preview builds a self-contained offline application at preview/Preview.html using the installed CLI's webpack/ts-loader. That preview exercises the same components and engine, without the Power BI host adapter. No additional runtime dependencies were added.

## Architecture

- src/visual.ts owns host formatting, dataset parsing/caching, table-row selection IDs, native context menus, page persistence and React root cleanup.
- src/FinanceApp.tsx composes the five internal pages and shares reporting close/dimension/search filters across them.
- src/finance/model.ts parses the ledger, validates identity and dates, reconstructs historical balances and calculates ratios independently of chart points. Sums use integer cents. Malformed, orphaned, duplicate and reduced data are reported visibly.
- src/components contains reusable charts, bar lists, sortable/paged tables, keyboard-contained drawers, SVG icons and an error boundary.
- src/finance/sampleData.json is a deterministic synthetic fixture: 2,400 invoices, 2,547 payment allocations, 84 credits and 357 promises.
- tests/run.cjs runs fourteen finance assertions, including all twelve month-end reconciliations.

The visual has a new GUID so older KPI report bindings remain valid. Its default is a light Material-style canvas with a graphite sidebar. Dark mode and Power BI high-contrast palette inputs are supported. React owns listeners; there are no global subscriptions, timers, network requests or added privileges.

See ../../reports/FinanceOS/START-HERE.md for field roles, data grain, formulas, assumptions, limits and remaining Power BI Desktop acceptance checks. The sample and bound data paths never silently mix. Bound data requires one Invoice event per invoice and complete dated Payment/Credit/Promise events, all in one reporting currency. Local filters do not modify the underlying report; explicit native selection acts at the source invoice-event table-row grain.
