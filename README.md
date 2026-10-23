# Business OS

Finance OS and Workforce OS are independently deployable tools with a shared design system and build tooling. Existing KPI and Finance I2C projects are retained; see docs/legacy-development.md.

## Demo immediately after unzipping

Open **START-DEMO.html** at the repository root, then choose Finance OS, Workforce OS or Monthly Targets. The committed demos are interactive, contain fictional data, and work offline without Node.js, Power BI, a server or credentials. Keep the extracted folder structure intact.

## Build from source

Install Node.js 22+ and run from this repository root:

```powershell
npm ci
npm run check
npm test
npm run demo
npm run build
```

Run `npm run test:demo` for browser checks (Microsoft Edge installed; set `BROWSER_CHANNEL=chrome` to use Chrome).

The root lockfile and npm workspaces manage common dependencies. No global Power BI CLI or dependency junction is needed. `npm run demo` regenerates the committed offline demos from source. Finance demo data is only imported by its browser entry point; the production Power BI visual still starts empty.

## Deploy separately

```powershell
npm run release:finance
npm run release:workforce
```

These commands require PowerShell 7 (`pwsh`) and produce `releases/Finance-OS.zip` and `releases/Workforce-OS.zip`. Each ZIP has its own START-DEMO.html, compiled visuals, editable PBIP report/model and data setup guide. Workforce also includes Monthly-Targets.html. Neither ZIP needs the other tool. `npm run release` builds both.

Run `pwsh -NoProfile -File scripts/export-source.ps1` to export the current working source, including offline demos, as `releases/Business-OS-Source.zip`. This includes uncommitted changes; GitHub's download ZIP includes only committed files.

For browser hosting, upload only `demos/finance/` or `demos/workforce/` to your static host. Each has its own index.html; Workforce targets are at targets.html. Browser demos use bundled synthetic data, with no backend connection.

For Power BI, extract the tool ZIP and open the PBIP under powerbi/ using Power BI Desktop. Follow powerbi/START-HERE.md for import mappings and data setup. Publish through your own workspace. Browser checks do not validate Power BI Desktop refresh or Service publishing.

## Source map

| Tool / shared code | Location |
| --- | --- |
| Finance app and metrics | visuals/FinanceDashboard |
| Finance report and data templates | reports/FinanceOS |
| Workforce app and metrics | projects/workforce-os/visual |
| Monthly targets app and metrics | projects/workforce-os/targets-visual |
| Workforce report and templates | projects/workforce-os/WorkforceOS |
| Shared navigation, cards, themes and responsive styles | packages/design-system/base.less |
| Shared offline demo compiler | scripts/preview.cjs |
| Separate release packaging | scripts/release.ps1 |

Domain models stay with each tool; the shell styling, dependency versions, preview build and release pipeline are shared. Older one-off generators and diagnostic scripts under projects/workforce-os/scripts are historical utilities; use the root commands above for supported builds and releases.
