# Workforce OS

A synthetic Workday workforce dashboard using the previous Finance OS design system: charcoal navigation, white cards, blue accents, rounded panels and internal page navigation.

Open [WorkforceOS/WorkforceOS.pbip](WorkforceOS/WorkforceOS.pbip) in Power BI Desktop and refresh. See [START-HERE.md](WorkforceOS/START-HERE.md) for metric definitions, validation status and the Workday export adapter.

All bundled sample data is synthetic.

## Development

Source: `visual/src`; shared design styles: `visual/style/visual.less`.

With Node.js and Power BI Visuals Tools 7.2.1 installed:

```powershell
cd visual
npm install
npm run check
npm run test
npm run package
npm run preview
```

This workspace currently reuses the prior FinanceDashboard node_modules through a junction. A separate checkout should run npm install to obtain its own dependencies. The deliverable ZIP contains the report, custom visual, documentation and synthetic sample data.

`scripts/build-report.cjs` creates the PBIP and model, using the prior project's Fluent base theme. `scripts/setup.cjs` is the initial synthetic data/configuration generator. `scripts/test.cjs` tests the metric layer. `scripts/ui-test.cjs` and `scripts/validate.py` use the bundled local testing runtimes; update those runtime paths if rebuilding elsewhere.
