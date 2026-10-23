# Workforce OS

Workforce analytics and monthly headcount targets, with entirely fictional demo data.

For an immediate offline demo, open [the repository launcher](../../START-DEMO.html). The canonical browser demos are in `../../demos/workforce/`.

For Power BI, open [WorkforceOS.pbip](WorkforceOS/WorkforceOS.pbip). See [START-HERE.md](WorkforceOS/START-HERE.md) for definitions and the Workday export adapter.

## Development

Run these commands from the repository root:

```powershell
npm ci
npm run check
npm test
npm run demo
npm run release:workforce
```

The root npm workspaces and lockfile manage dependencies without a global CLI or junction to another project. `visual/src` owns workforce analytics; `targets-visual/src` owns monthly targets. Both share `packages/design-system/base.less` and the root preview/release tooling with Finance OS.

The release ZIP contains both workforce applications, the Power BI report, compiled custom visuals and data templates. It runs independently of Finance OS. Older generators and validation scripts in this folder are historical utilities; use the root commands for supported builds.
