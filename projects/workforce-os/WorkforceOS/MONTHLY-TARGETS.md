# Monthly headcount targets

Open WorkforceOS.pbip and select Refresh. The first report page is Monthly targets; the original workforce page remains available. All figures and director labels are fictional.

This page uses a separate monthly finance example (932 people in October), not the original worker-level demo population. The two demo pages are not reconciled. Connect both to the same approved population before using them together operationally.

## Comparisons

- MoM change = current actual minus previous calendar-month actual; percent uses previous actual.
- Target variance = actual minus that month's target; percent uses that month's target. Positive means above target.
- Gap change = current target variance minus prior target variance. Negative means improvement.
- Actual reduction = previous actual minus current actual.
- Planned reduction = previous target minus current target.
- Delivery vs plan = actual reduction minus planned reduction.
- Director targets met counts the ten workstream/country pairs where actual is at or below target. HC above individual targets sums positive gaps only, without offsetting below-target teams.

Missing actuals, targets or prior months produce unavailable comparisons. Zero is valid; percentages with a zero denominator are unavailable. Reduction is net headcount movement, not termination count. Targets are independent monthly values, not interpolated annual goals.

## Monthly inputs

MonthlyActuals-Template.csv: Month, Workstream, Country, ActualHC.
MonthlyTargets-Template.csv: Month, Workstream, Country, Director, TargetHC.

Use yyyy-MM months; I2P, I2C, R2R, MDM, ICO; Costa Rica or Poland. Supply one row per month/workstream/country and whole-number headcount. Keep historical actuals and approved targets so comparisons remain reproducible. Future targets can be supplied without future actuals. Maintain ten target rows per month, one for each director scope.

For Workday, count distinct included Worker IDs at one consistent monthly snapshot, grouped by workstream and director country. Do not sum daily snapshots or count duplicate worker rows. FTE is a separate metric: the existing workforce page supports 0.5, 0.75 and 1. Tenure continues to use latest hire date.

To connect real data in Power Query, replace the embedded Data/Source steps of MonthlyActuals and MonthlyTargets with your approved sources, keeping these exact column names, types and duplicate-key checks. MonthlyPerformance joins the sources automatically on Month, Workstream and Country. Refresh the report after updating inputs. The templates are not automatically read by this demonstration. The demo contains no live Workday connection.

Use the page's month, workstream and country controls. They control this custom visual; they do not filter other report pages or separate native visuals. Fourteen DAX measures in MonthlyPerformance are supplied for native cards/tables; use MonthlyPerformance dimensions with those measures. The custom visual computes the equivalent comparisons from monthly rows.

## Verification

TypeScript and custom visual packaging passed. Automated checks cover sample totals, filters, missing periods, future actuals, zero denominators and conflicting duplicates. The model deserializes through the Microsoft Tabular Object Model. Browser rendering and filters passed. Power BI Desktop refresh and host rendering have not been verified in this environment.
