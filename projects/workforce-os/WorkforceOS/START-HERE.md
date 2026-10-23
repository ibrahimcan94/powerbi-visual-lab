# Workforce OS — Power BI synthetic demo

This dashboard uses entirely fictional workers and figures. The prior Finance OS project supplied the visual design system.

## Open the report

1. Extract the complete ZIP to a local folder.
2. Open `WorkforceOS.pbip` in Power BI Desktop. Keep the Report and SemanticModel folders beside it.
3. Select **Refresh** to load the embedded synthetic dataset. No file path, Workday credential or network data connection is required for this demo.
4. The first page is **Monthly targets**, with monthly actuals, targets and comparison metrics. See MONTHLY-TARGETS.md for input templates and definitions. Use the other report page for the six original workforce views. Each page contains a custom application visual.

If your Desktop version requires the Power BI Project preview option, enable that option in Desktop and restart. A custom-visual policy may affect loading private visuals in your organization. The separate `Workforce-OS.pbiviz` is supplied for importing the visual into another report.

For an immediate browser preview, open `Preview.html`. This is a self-contained interactive rendering of the same React application, with the synthetic dataset. It does not connect to Workday.

## Views

| View | Contents |
|---|---|
| Overview | Headcount, FTE, managers, average tenure, geography, job families and workforce signals |
| Organization | Drill through manager cards; direct reports, descendant headcount, descendant FTE, and manager spans |
| Workforce mix | Employee type, time type, status, management level, job grade and cost center |
| Tenure & hiring | Latest-hire tenure bands and current workers grouped by latest-hire year |
| Worker directory | Searchable, paginated worker list |
| Data quality | Duplicate keys, conflicting records, missing manager references, missing cost centers, FTE and hire-date checks |

All views share snapshot, region, country, cost center, status, time type and entity filters. Reset clears the population filters and search; the selected snapshot stays selected. Clicking region or country bars filters the population. Light and dark appearances are available.

## Metric definitions

- **Population:** one unique Workday ID at the selected Snapshot_Date. The latest available snapshot is selected initially. Active and On Leave are included; explicit Yes / True / 1 exclusion values are excluded. Contingent workers are included unless excluded by the source flag.
- **Headcount:** included unique workers. It is never summed across snapshots.
- **FTE:** the sum of each included worker's decimal FTE, once per snapshot. 0.5, 0.75 and 1 are supported and represented in the sample. A three-person team with these values has headcount 3 and FTE 2.25. Displays use up to two decimal places.
- **Tenure:** elapsed days from **Latest Hire Date** to **Snapshot_Date**, divided by 365.25. Original Hire Date does not drive tenure. Invalid or future latest-hire dates appear as Unknown and are excluded from average tenure.
- **Tenure bands:** <0.25, 0.25–<0.5, 0.5–<1, 1–<2, 2–<5, 5–<10 and 10+ elapsed years; the first three are labeled <3, 3–6 and 6–12 months. These are elapsed-year thresholds rather than calendar-anniversary month calculations.
- **People managers:** included workers with Is Manager = Yes. Manager share uses included headcount as the denominator.
- **Manager span:** included direct reports per included manager. A zero-report manager is retained. The org explorer's team HC and FTE count descendants and exclude the selected manager themself. Traversal is cycle-safe; totals respond to active population filters. Filtering may remove an intermediate manager and therefore break a visible descendant branch.
- **Current workers hired in the last 90 days / YTD:** included workers whose latest-hire dates meet that period, as of the selected snapshot. These are surviving cohorts, not all historical hires.
- **Capacity gap:** included headcount minus included FTE. This is not a vacancy or hiring requirement.
- **On-leave share:** included on-leave workers divided by included headcount. On-leave workers also belong to the employee or contingent category.

The semantic model includes 20 DAX measures for reuse in native Power BI visuals. The custom app calculates its views from the bound worker rows using the same definitions. Its internal filters do not change the filter context of separate native visuals. External report filters still filter the rows delivered to the app. Do not use a multi-snapshot SUM(FTE) as a point-in-time capacity measure.

## Connect approved Workday data later

1. Map an approved Workday export to the columns in `FIELD-MAPPING.md` and `Workday-Field-Template.csv`. Use one row per worker per snapshot. Preserve ID and cost-center fields as text. Use ISO dates and decimal-point FTE values.
2. In Power Query, replace the Workforce table's embedded sample query with `Workday-Import.pq`. Change ExportPath locally. The query expects a UTF-8 comma-delimited export with the mapped headers. It is an export adapter, not an authenticated Workday connector.
3. If needed, derive Worker Display Name from Legal First Name and Legal Last Name. Snapshot_Date must come from the extraction's reporting date, rather than a hire date or an automatically changing current date.
4. The query collapses exact duplicates and rejects missing keys or conflicting worker/snapshot records. Resolve conflicts in the source rather than selecting an arbitrary FTE or manager record.
5. Refresh and reconcile headcount and decimal FTE against a trusted Workday total for one snapshot. Validate the business policy for exclusions, on-leave and contingent populations before use.
6. Turn off **Show synthetic demo label** in the visual's Workforce workspace formatting card after replacing the sample. Rename the report page, which is also labeled Synthetic demo.

For a live Workday integration, replace the CSV source with your organization's approved connector or staged data source while preserving the typed table contract. Attrition, turnover, vacancies, cost and actual internal mobility are deliberately not inferred from current-worker snapshots; add the corresponding event, requisition, budget or compensation tables first.

## Validation and limitations

The package builds with Power BI Visuals SDK 7.2.1. TypeScript checks, metric and reconciliation assertions, eight Microsoft JSON schema checks, 24 role bindings, embedded-data round-trip checks and Microsoft TOM model deserialization pass. Browser tests cover all six views, filters, snapshot selection, org drill, directory search and pagination, and dark mode.

Power BI Desktop rendering, refresh and DAX execution were not verified: Computer Use rejected launching Desktop because it was not approved for automation in the session. TOM validates model syntax, not DAX query results. The visual currently provides app-local interactions, not cross-visual selection, context menus or Power BI high-contrast theme integration. It loads segmented data before displaying totals, and withholds totals if the host cannot supply the complete population.

The sample contains 720 fictional workers and 1,421 rows across two snapshots. The latest snapshot has 714 included workers and 646.5 FTE. Names intentionally include Example, Demo, Sample or Test.

Power BI project format reference: https://learn.microsoft.com/en-us/power-bi/developer/projects/projects-report
