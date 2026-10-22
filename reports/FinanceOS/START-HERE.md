# Finance OS — one Power BI visual, five internal pages

The complete Invoice-to-Cash workspace is a **single custom Power BI visual**. Its sidebar switches between Overview, Receivables, Collections, Customers and Invoices. These are React views inside the visual, rather than separate report pages.

## Try it immediately

- Open **Preview.html** in a browser. It is a self-contained, offline copy of the working application with synthetic data. Navigation, filters, charts, sorting, pagination, invoice details and appearance controls are functional. It uses the same React components and finance engine as the packaged visual, without the Power BI host adapter.
- Import **Finance-OS.pbiviz** into Power BI Desktop. Add it to a blank page and make it large enough for an application, preferably 1,200 × 850 or larger. It displays clearly labeled sample data when nothing is bound and sample mode is enabled.
- For a prebound example, open **FinanceOS.pbip** after extracting the whole ZIP and select **Refresh**. This project contains **one report page and exactly one visual container**, bound to its embedded 5,388-row finance ledger. It requires a recent Desktop version supporting PBIP, PBIR and TMDL.

Your organization must permit this private visual. There are no external runtime API calls, fonts, maps, telemetry, sign-ins, database servers or added privileges. It does not require Node.js on the report viewer's computer.

## Working application features

- Sidebar navigation with current-page indication, keyboard focus and a collapsible rail.
- Shared reporting close, region, segment, collector, risk and search filters. They remain active across internal pages during the session.
- KPI cards calculated from invoice/payment/credit events, historical trends and invoice aging.
- Click a region to filter, click an aging bucket to open its worklist, or select a chart month to change the reporting close.
- Sort every table, move between pages of rows, select a customer to open their invoices, and inspect an invoice's dated activity in a drawer.
- Escape closes drawers and restores focus. The modal contains keyboard focus. Chart periods can be selected by keyboard.
- The appearance drawer switches light/dark mode; the formatting pane supplies default appearance, accent, title, currency and opening page.
- With bound report data, invoice actions use the supported Power BI selection manager and context menu. Ctrl/Command supports additive selection. The native selection identifies the invoice event's source table row; internal filters remain local to this visual.

The five-page architecture is isolated in `visuals/FinanceDashboard`. The older `visuals/kpiDashboard` and earlier four-page Finance report remain available.

## Connect your own data

Bind the following fields from **one event-ledger table**. Do not supply headline KPI measures to this visual. It reconstructs the full finance model from event rows.

| Visual role | Example model column | Required | Meaning |
|---|---|---|---|
| Event ID | EventID | Yes | Unique across the entire ledger, including different event types |
| Invoice ID | InvoiceID | Yes | Stable invoice key, repeated on all of its events |
| Customer | Customer | Yes | Customer name; use unique names if separate accounts must stay separate |
| Region | Region | Optional | Regional grouping |
| Segment | Segment | Optional | Customer segment |
| Collector | Collector | Optional | Invoice owner |
| Risk tier | RiskTier | Optional | Customer risk grouping |
| Invoice date | InvoiceDate | Yes | Original invoice date, repeated on its events |
| Due date | DueDate | Yes | Invoice due date |
| Event date | EventDate | Yes | Date of invoice issue, payment receipt, credit or promise creation |
| Event type | EventType | Yes | Exactly `Invoice`, `Payment`, `Credit` or `Promise` |
| Event amount | Amount | Yes | Invoice value, received allocation, credit value or promised payment; a numeric field |
| Dispute date | DisputeDate | Optional | Date the whole invoice became disputed, on its Invoice event |
| Promise due | PromiseDue | For Promise events | Date the payment was promised by |

One `Invoice` event per invoice is required. All payment, credit and promise events must reference it. Bind **Sum of Amount**; grouping by the unique Event ID prevents double-counting. Dates may be Power BI date values or ISO calendar dates. Optional dimensions appear as Unassigned. `FinanceLedger.csv` is an auditable example of this contract.

The PBIP embeds a compressed copy of that same ledger in Power Query, so opening it requires no source path or credentials. Editing the CSV does not update the model automatically. To connect production data, replace the embedded Power Query source while preserving the columns and types.

**Supply complete invoice lifecycles.** Dimension/RLS filters that retain all events for the visible invoices are appropriate. Report-level date filters that remove old Invoice events while leaving newer Payment events cause incomplete balances; use the visual's reporting-close control instead. The visual warns about orphaned events, malformed rows, duplicates and host data reduction. It never substitutes sample figures for invalid bound data.

The table mapping requests up to 30,000 event rows. This version does not fetch additional segments. A reduction warning means the visible totals are incomplete; do not use them as complete portfolio balances. Do not mix reporting currencies. The currency format setting labels already-converted values; it does not perform FX conversion. Built-in sample data is always labeled USD.

## Finance definitions

All stock metrics use the selected month-end; cash, billings, CEI and promise outcomes use that month. Trends show up to the preceding 12 months. Defaults use the latest month present in the supplied ledger, not today's system date.

| Metric | Definition |
|---|---|
| Open AR | Positive unpaid balance after payments and credits effective by the reporting close |
| Overdue AR | Open balance with a due date before the close; invoices due on the close are current |
| Aging | Current; 1–30; 31–60; 61–90; 90+ days overdue |
| Overdue share | Overdue AR / open AR |
| DSO | Closing AR / credit invoice sales in the last 90 calendar days × 90 |
| Cash collected | Payment allocations in the selected month |
| Cash target | Illustrative target of 95% of that month's billings |
| CEI | (Opening AR + billings − credits − ending AR) / (opening AR + billings − credits − ending current AR) |
| Promise kept rate | Promises due in the month whose payments after creation and through the due date meet the promised amount / promises due |
| Disputed balances | Whole open balances from an invoice's dispute date; no resolution events are modeled |
| Weighted days overdue | Sum(open balance × days overdue) / open AR |
| On-time paid | Invoices closed by their due date / invoices closed by the reporting close; an inception-to-date rate |

Zero denominators display an em dash. Financial sums use integer cents. The 45-day DSO target and 25% overdue reference are sample assumptions. The first two sample months have incomplete 90-day sales history; October assumes no opening AR before sample inception. Credit balances, FX, write-offs, unapplied cash, tax and revenue recognition are outside this version's scope. No operational payment or collection write-back is performed.

At the sample September 2026 close: AR **$4,465,880.76**, cash **$2,493,297.28**, overdue AR **$1,440,715.53**, DSO **53.067 days**. The sample contains 2,400 invoices, 2,547 payments, 84 credits and 357 promises for 80 customers.

## Design reference

The requested [Creative Tim repository](https://github.com/creativetimofficial/ct-material-dashboard-react-pro-nodejs) contains documentation and screenshots rather than the advertised React/Node application source. This implementation uses its supplied dashboard screenshot as a visual reference: graphite sidebar, light canvas, white cards, raised chart surfaces, blue navigation and compact tables. The React/TypeScript, CSS, SVG icons and finance calculations here are original; no paid PRO source, Creative Tim branding, stock assets or backend were copied into the visual.

## Validation

- Strict TypeScript and ESLint pass; `.pbiviz` packaging succeeds with CLI 7.2.1 and API 5.11.1.
- 14 finance tests cover historical cutoffs, aging, CEI, promises, duplicates, invalid dates, missing bindings, dimensions, zero denominators and all 12 source reconciliations.
- Browser testing exercised all five pages, shared filters, chart-month selection, aging/customer drill-through, sorting, pagination, invoice drawers, Escape/focus return, empty searches, light/dark mode and 320/400/800/1600-pixel layouts.
- The single-page report passes Microsoft's JSON schemas, has exactly one visual, and its embedded ledger matches the supplied CSV. Microsoft's Tabular Object Model deserializes the model.
- **Power BI Desktop itself has not been tested.** Host data binding/refresh, report selection/context menus, format persistence, high contrast and organization private-visual policy remain Desktop acceptance checks.

The browser preview does not simulate Power BI host selection or formatting persistence. Internal session filters and appearance reset when the visual is recreated. The selected page is written to the host formatting property in the actual visual; its behavior under report saves/bookmarks requires Desktop verification.

## Build from the Git repository

From `visuals/FinanceDashboard`: `npm ci`, `npm run check`, `npm test`, `npm run build`. The SDK entry remains `src/visual.ts` in the `files` entry of tsconfig. No additional runtime libraries were added beyond React, D3 and the Power BI utilities already used by the lab.

The source report lives in `reports/FinanceOS`. Its generated CustomVisuals resources are ignored by Git. Run `Prepare-Visual.ps1 -Build` there to package and install them before opening the project from a fresh checkout. The downloadable ZIP already contains these resources.
