const fs=require('fs'),path=require('path');
const cp=require('node:child_process');
if(!process.env.npm_execpath)throw new Error('Run this builder using npm run preview.');
const globalRoot=cp.execFileSync(process.execPath,[process.env.npm_execpath,'root','--global'],{encoding:'utf8'}).trim();
const cliRoot=path.join(process.env.APPDATA,'npm/node_modules/powerbi-visuals-tools');
const webpack=require(require.resolve('webpack',{paths:[cliRoot]}));
const visual=path.resolve(__dirname,'..');
const output=path.join(visual,'preview/_build');
webpack({mode:'production',context:visual,entry:path.join(visual,'src/preview.tsx'),output:{path:output,filename:'dashboard.js'},resolve:{extensions:['.tsx','.ts','.js','.json'],modules:[path.join(visual,'node_modules')]},module:{rules:[{test:/\.tsx?$/,exclude:/node_modules/,use:{loader:require.resolve('ts-loader',{paths:[cliRoot]}),options:{transpileOnly:true,configFile:path.join(visual,'tsconfig.json'),onlyCompileBundledFiles:true,compilerOptions:{declaration:false}}}}]},performance:{hints:false}},(error,stats)=>{
    if(error||stats.hasErrors()){console.error(error??stats.toString({all:false,errors:true}));process.exitCode=1;return;}
    const css=fs.readFileSync(path.join(visual,'style/visual.less'),'utf8'),js=fs.readFileSync(path.join(output,'dashboard.js'),'utf8').replace(/<\/script/gi,'<\\/script');
    const dest=path.join(visual,'preview');fs.mkdirSync(dest,{recursive:true});
    fs.writeFileSync(path.join(dest,'Preview.html'),'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Workforce OS — monthly targets</title><style>html,body,#root{width:100%;height:100%;margin:0}'+css+'</style></head><body><div id="root"></div><script>'+js+'</script></body></html>');
    console.log('Self-contained interactive preview built. '+stats.toString({all:false,timings:true}));
});
