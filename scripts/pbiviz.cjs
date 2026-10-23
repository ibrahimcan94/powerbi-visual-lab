const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
// The Power BI CLI loads this API from cwd/node_modules rather than Node resolution.
// Materialize only that package for workspace builds; never link to another checkout.
const api = path.dirname(require.resolve('powerbi-visuals-api/package.json'));
const local = path.join(process.cwd(), 'node_modules/powerbi-visuals-api');
if (path.resolve(api) !== path.resolve(local)) {
  fs.mkdirSync(path.dirname(local), {recursive: true});
  fs.cpSync(api, local, {recursive: true});
}
const result = spawnSync(process.execPath, [require.resolve('powerbi-visuals-tools'), ...process.argv.slice(2)], {stdio: 'inherit'});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
