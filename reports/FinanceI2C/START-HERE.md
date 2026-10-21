# Finance | Invoice-to-Cash

A four-page Power BI report, with the existing React/D3 KPI visual embedded and editable native charts, slicers and tables. All records are synthetic. Currency: USD. Fixed reporting close: **30 September 2026**. Source history: October 2025–September 2026.

## Open in Power BI Desktop

1. Extract the entire ZIP to a normal local folder. Keep the `.Report` and `.SemanticModel` folders beside `FinanceI2C.pbip`.
2. Open **FinanceI2C.pbip** in a recent Power BI Desktop version that supports Power BI projects, PBIR and TMDL. If Desktop asks, enable the relevant project/report-format preview options and restart it.
3. Select **Refresh**. This imports the embedded sample tables. There are no file paths, sign-ins or external sources to configure.
4. If the private custom visual is blocked by your organization's policy, permit the trusted local visual or import the included `KPI-Dashboard.pbiviz`. Native charts remain separate from the private visual.
5. After reviewing the report, use **Save As** to save a `.pbix` if you prefer that format. Publishing to the Power BI service requires your own workspace and account; this package has not been published.

This deliverable is an editable **Power BI project**, not an already-refreshed PBIX. Source files and data have been validated, but Desktop refresh, DAX execution, rendering and interactions have not been run in this environment.

## Report pages

| Page | Purpose |
|---|---|
| Executive Overview | Open AR, latest monthly cash, DSO, overdue share, monthly billings vs cash, aging and collection effectiveness |
| Receivables & Risk | Overdue and 90+ exposure, disputes, weighted days overdue, regional/segment/risk exposure and customer priorities |
| Collections | Cash vs targets, collector contribution, collection effectiveness and promise-to-pay performance |
| Invoice Explorer | Invoice-level worklist, closing balances, due dates, disputes and owners |

Each page includes month, region, segment and collector slicers. Power BI's page tabs provide navigation. The preview PNG is a design illustration based on the same source data; it is not a Desktop screenshot.

## Reading the dates

- **No month selected:** closing balance metrics use the latest available month; cash and billings charts show the full history. “Latest month” cards show September, while explicitly labeled “selected period” metrics cover all selected months.
- **One month selected:** balance metrics use that month-end and period flows use that month.
- **Several months selected:** balances use the latest selected month; additive flows include the selected months. Do not sum monthly AR balances or average monthly ratio cards.
- Invoice Explorer includes invoice cohorts issued on or before the chosen close through the snapshot measures. Blank open AR means no open position at that close. The table can include previously closed invoices.

## Metric definitions

| Metric | Definition |
|---|---|
| Open AR | Sum of invoice balances at the selected month-end; balances are reduced only by payments/credit notes dated on or before that close |
| Overdue AR | Open balances whose due date is before the reporting close |
| Aging | Current, 1–30, 31–60, 61–90 and 90+ days past due; buckets are mutually exclusive |
| Overdue share | Overdue AR / open AR |
| Cash collected | Payment allocations received in the selected months; no unapplied cash is modeled |
| DSO | Closing AR / invoiced credit sales over the preceding 90 calendar days × 90; USD gross credit billings basis |
| CEI | (Opening AR + monthly billings − monthly credits − ending AR) / (Opening AR + monthly billings − monthly credits − ending current AR); credit-note-adjusted collection effectiveness |
| Cash target | 95% of monthly billings, a deliberately illustrative operating target |
| Cash attainment | Latest selected month's cash / its cash target |
| Weighted days overdue | Sum of open amount × days past due / total open amount; current invoices contribute zero days |
| Disputed AR | Outstanding balance for invoices flagged disputed by that close; assumes the whole open invoice balance is disputed, with no modeled dispute resolution |
| On-time paid rate | Count of invoices fully closed on/before their due date / invoices closed by the selected close; an inception-to-date rate, not an invoice-month cohort rate |
| Promise kept rate | Commitments whose payments after promise creation and through the promised date reach the promised amount / commitments due in the selected period |
| Average invoice | Selected-month billings / invoices issued in those months |

The DSO target of 45 days and overdue-share target of 25% are sample assumptions, not industry benchmarks. A positive variance means an increase. The dashboard enables “Lower values are better” for DSO, overdue share and AR balance comparison cards; increases are red and decreases green on those cards. Cash attainment uses the opposite direction. October and November DSO have incomplete 90-day history; use December onward for a full-window comparison. October CEI assumes zero opening AR before sample inception. The sample excludes tax, FX, write-offs, unallocated cash and revenue recognition.

## Model and replacing sample data

`Customers → Invoices → Payments / Credits / ARSnapshot / Promises` uses one-to-many, single-direction relationships. Calendar is deliberately disconnected: DAX applies the appropriate month to payment flows, invoice flows or snapshots using `TREATAS`. This avoids ambiguous invoice-date vs cash-date relationships.

The headline measures remove the chart-axis context with `ALLSELECTED(Calendar)`; the trend measures retain it. Non-additive KPI values are never derived by summing trend points.

Seven UTF-8 CSVs in `sample-data/` mirror the embedded Power Query sources. **Editing the CSVs does not change the model automatically.** Replace the corresponding M partition's embedded source with your approved database, dataflow or CSV connector in Power Query, preserve column types/keys, and refresh. Maintain the month-end snapshot grain: one open invoice per month-end. Move targets to a governed target table when connecting production data.

## Validation and remaining acceptance checks

- 12 month-end reconciliations: cumulative invoices − cash − credits = closing AR, within $0.02 tolerance.
- Embedded model data round-trips exactly to the supplied CSV records.
- Report field references and visual bounds are checked.
- 67 report/project JSON files pass Microsoft's published schemas.
- Microsoft's Tabular Object Model successfully deserializes all 8 TMDL tables, 5 relationships and 49 measures.
- Desktop rendering, refresh, DAX calculation results and slicer/cross-filter behavior remain manual acceptance checks. JSON/TMDL validation does not prove those behaviors.

In Desktop, check all four pages; reconcile September AR and cash against `validation/data-summary.json`; test month and region slicers; compare DSO to its 90-day formula; inspect overdue bucket boundaries; select native chart categories and KPI points; clear selection; test keyboard focus, right-click context menus and table sorting. Check private-visual policy and dark theme readability before distribution.

The earlier custom visual retains its documented limits: local selection dimming can reset on host updates, tooltips are local rather than the native host tooltip service, and line animation is an entry fade. Native report visuals supply the analytical charts and worklists.

## Files

- `FinanceI2C.pbip`: opening shortcut.
- `FinanceI2C.Report/`: PBIR report pages, private KPI visual and themes.
- `FinanceI2C.SemanticModel/`: typed TMDL model, embedded sources and DAX.
- `sample-data/`: auditable synthetic source tables.
- `validation/`: reconciliation, source counts and validation results.
- `Finance-I2C-preview.png`: executive-page design preview.
- `KPI-Dashboard.pbiviz`: separate visual package for manual import if needed.

Format references: [Power BI report project files](https://learn.microsoft.com/en-us/power-bi/developer/projects/projects-report) and [semantic model project files](https://learn.microsoft.com/en-us/power-bi/developer/projects/projects-dataset).
