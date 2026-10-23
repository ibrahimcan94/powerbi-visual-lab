const fs = require('node:fs');
const path = require('node:path');
const webpack = require('webpack');
const less = require('less');

module.exports = async function preview(visual, title, destination) {
  const output = path.join(visual, 'preview/_build');
  await new Promise((resolve, reject) => {
    const compiler = webpack({
      mode: 'production', context: visual, entry: path.join(visual, 'src/preview.tsx'),
      output: {path: output, filename: 'dashboard.js'},
      resolve: {extensions: ['.tsx', '.ts', '.js', '.json']},
      module: {rules: [{test: /\.tsx?$/, exclude: /node_modules/, use: {
        loader: require.resolve('ts-loader'), options: {transpileOnly: true,
          configFile: path.join(visual, 'tsconfig.json'), onlyCompileBundledFiles: true,
          compilerOptions: {declaration: false}}
      }}]}, performance: {hints: false}
    });
    compiler.run((error, stats) => compiler.close(() => {
      if (error || stats.hasErrors()) reject(error || new Error(stats.toString({all: false, errors: true})));
      else resolve();
    }));
  });
  const filename = path.join(visual, 'style/visual.less');
  const {css} = await less.render(fs.readFileSync(filename, 'utf8'), {filename});
  const js = fs.readFileSync(path.join(output, 'dashboard.js'), 'utf8').replace(/<\/script/gi, '<\\/script');
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>html,body,#root{width:100%;height:100%;margin:0}${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`;
  const dest = destination || path.join(visual, 'preview/Preview.html');
  fs.mkdirSync(path.dirname(dest), {recursive: true});
  fs.writeFileSync(dest, html);
  console.log(`Built ${title}: ${dest}`);
};
