# Finance OS custom visual - data-free

Five internal React pages share a Material-style sidebar, filters, D3 charts, tables and invoice drawers inside one Power BI visual. Release 2.1.0.0 contains no embedded records or sample-data fallback. No fields bound means an empty connection screen. Invalid report data produces an error/warning rather than a substitute dataset.

## Development

From the repository root, run `npm ci`. Dependencies and the Power BI CLI are managed by the root workspace and lockfile. Run `npm run check -w finance-dashboard`, `npm test -w finance-dashboard`, and `npm run build -w finance-dashboard`. `npm run demo` builds the offline browser demos; `npm run release:finance` packages Finance OS independently. Open `../../demos/finance/index.html` for the committed synthetic browser demo. The production entry point remains `src/visual.ts` and does not import demo records.

## Architecture and contract

src/visual.ts owns host formatting, cached table parsing, native row selections/context menus and persisted page state. src/empty.ts supplies a zero-row dataset. src/FinanceApp.tsx owns internal navigation and local filters. src/finance/model.ts validates ledger rows and reconstructs dated balances with integer-cent sums. Shared components provide charts, tables, drawers, icons and an error boundary. destroy unmounts React and releases the dataset cache.

The data role contract requires Event ID, Invoice ID, Customer, Invoice date, Due date, Event date, Event type and Event amount. Supply unique events and complete invoice lifecycles in one reporting currency. Optional dimensions enable regional/collector/risk views. Field roles, event types, finance formulas, limits and population instructions are in ../../docs/Finance-OS-Population-Guide.pdf and ../../reports/FinanceOS/START-HERE.md.

The source report is a typed empty model, not a file connection until configured. Prepare-Visual.ps1 installs generated visual resources after a fresh checkout; these and compiled packages remain Git-ignored. Desktop behavior still requires manual acceptance. The requested Creative Tim public repository contains documentation/reference media rather than application source, so the Material-style components here are original.
