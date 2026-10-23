const path = require('node:path');
const preview = require('./preview.cjs');
const root = path.resolve(__dirname, '..');
const tool = process.argv[2] || 'all';
if (!['all', 'finance', 'workforce'].includes(tool)) throw new Error('Expected all, finance or workforce');
(async () => {
  for (const [visual, title, dest] of [
    ['visuals/FinanceDashboard', 'Finance OS — synthetic demo', 'demos/finance/index.html'],
    ['projects/workforce-os/visual', 'Workforce OS — synthetic demo', 'demos/workforce/index.html'],
    ['projects/workforce-os/targets-visual', 'Workforce OS — monthly targets', 'demos/workforce/targets.html']
  ]) {
    if (tool !== 'all' && !dest.startsWith(`demos/${tool}/`)) continue;
    await preview(path.join(root, visual), title, path.join(root, dest));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
