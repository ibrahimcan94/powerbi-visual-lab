const ts=require('typescript'),fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
function load(file){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,require,Intl,Date,Number});return exports;}
const {finite,variance,parseData,performanceDirection}=load('src/data/model.ts');const {formatNumber}=load('src/utils/format.ts');
let count=0;function test(name,fn){fn();count++;console.log('PASS '+name);}
const column=(role,values)=>({source:{displayName:role,roles:{[role]:true}},values});
const fixture={categorical:{categories:[{source:{},values:['A','B','C']}],values:[column('measure',[10,null,30]),column('headline',[.25,.25,.25]),column('comparison',[0,0,0])]}};
test('independent ratio is never summed',()=>assert.equal(parseData(fixture).value,.25));
test('missing headline does not invent total',()=>assert.equal(parseData({categorical:{values:[column('measure',[10,30])]}}).value,null));
test('empty and malformed values',()=>{assert.equal(parseData().points.length,0);for(const v of [null,undefined,NaN,Infinity,'5'])assert.equal(finite(v),null);assert.equal(finite(0),0);assert.equal(finite(-1),-1);});
test('gaps and original selection indices preserved',()=>{const d=parseData(fixture);assert.equal(d.points[1].value,null);assert.equal(d.points[2].index,2);});
test('zero comparison has no percentage',()=>{assert.equal(variance(4,0).percent,null);assert.equal(variance(0,0).absolute,0);assert.equal(variance(null,1),null);});
test('negative baseline uses absolute denominator',()=>assert.equal(variance(-5,-10).percent,.5));
test('date sorting preserves identities',()=>{const d=parseData({categorical:{categories:[{source:{type:{dateTime:true}},values:[new Date('2025-02-01'),new Date('2025-01-01')]}],values:[column('measure',[2,1])]}});assert.equal(d.points[0].index,1);});
test('format null percent prefix and precision limits',()=>{assert.equal(formatNumber(null,'en-US',2),'—');assert.equal(formatNumber(.25,'en-US',1,'','',true),'25.0%');assert.equal(formatNumber(12,'en-US',0,'$',' USD'),'$12 USD');assert.doesNotThrow(()=>formatNumber(1,'en-US',100));});
test('finance performance polarity',()=>{assert.equal(performanceDirection(5,true),-1);assert.equal(performanceDirection(-5,true),1);assert.equal(performanceDirection(5,false),1);assert.ok(performanceDirection(0,true) === 0);});
console.log(count+' tests passed');