const {chromium}=require('C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('assert/strict'),fs=require('fs'),path=require('path');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true}),p=await b.newPage({viewport:{width:1600,height:1100}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto('file:///'+path.resolve(__dirname,'../visual/preview/Preview.html').replaceAll('\\','/'));
const total=()=>p.locator('.fd-kpi-body strong').first().innerText();assert.equal(await total(),'714');
await p.locator('.fd-filterbar label').filter({hasText:'Country'}).locator('select').selectOption('Poland');assert(Number(await total())<714);
await p.getByRole('button',{name:'Reset',exact:true}).click();assert.equal(await total(),'714');
await p.locator('.fd-filterbar label').filter({hasText:'Snapshot'}).locator('select').selectOption('2026-09-30');assert(Number(await total())<714);
await p.locator('.fd-filterbar label').filter({hasText:'Snapshot'}).locator('select').selectOption('2026-10-21');
for(const name of ['Organization','Workforce mix','Tenure & hiring','Worker directory','Data quality']){await p.locator('nav').getByRole('button',{name,exact:false}).click();assert.equal(await p.locator('h1').innerText(),name);if(name==='Organization'){await p.locator('.wo-person').first().click();assert((await p.locator('.wo-person').count())>0);}if(name==='Worker directory'){await p.getByPlaceholder('Search workers…').fill('S0001');assert.equal(await p.locator('tbody tr').count(),1);await p.getByPlaceholder('Search workers…').fill('');await p.getByRole('button',{name:'Next',exact:true}).click();assert((await p.locator('tbody').innerText()).includes('S0021'));}}
await p.locator('nav').getByRole('button',{name:'Overview',exact:false}).click();await p.screenshot({path:path.resolve(__dirname,'../WorkforceOS/Preview.png')});
await p.getByRole('button',{name:'Dark appearance',exact:false}).click();assert(await p.locator('.finance-dashboard.dark').count());
await p.setViewportSize({width:1100,height:800});await p.screenshot({path:path.resolve(__dirname,'../WorkforceOS/Preview-dark.png')});assert.equal(errors.length,0,errors.join('\n'));
fs.writeFileSync(path.resolve(__dirname,'../WorkforceOS/ui-validation.json'),JSON.stringify({navigation:'6 views passed',filters:'country / snapshot / reset passed',organization:'drill passed',directory:'search / pagination passed',theme:'dark passed',browserErrors:errors,desktop:'not tested: Computer Use did not approve Power BI Desktop'},null,2));await b.close();console.log('PASS: browser navigation, filters, organization drill, directory search/pagination, dark mode.');})().catch(e=>{console.error(e);process.exit(1)});
