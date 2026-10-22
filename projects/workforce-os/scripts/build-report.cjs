const fs=require('fs'),path=require('path'),zlib=require('zlib');
const root=path.resolve(__dirname,'..'),out=path.join(root,'WorkforceOS'),report=path.join(out,'WorkforceOS.Report'),model=path.join(out,'WorkforceOS.SemanticModel');
const fields=require('./fields.json'),rows=require('../visual/src/sample.json');
const write=(p,x)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,typeof x==='string'?x:JSON.stringify(x,null,2));};
const schema=(type,ver)=>`https://developer.microsoft.com/json-schemas/fabric/item/${type}/${ver}/schema.json`;
write(path.join(out,'WorkforceOS.pbip'),{$schema:'https://developer.microsoft.com/json-schemas/fabric/pbip/pbipProperties/1.0.0/schema.json',version:'1.0',artifacts:[{report:{path:'WorkforceOS.Report'}}],settings:{enableAutoRecovery:true}});
write(path.join(report,'definition.pbir'),{$schema:schema('report/definitionProperties','2.0.0'),version:'4.0',datasetReference:{byPath:{path:'../WorkforceOS.SemanticModel'}}});
write(path.join(model,'definition.pbism'),{$schema:schema('semanticModel/definitionProperties','1.0.0'),version:'4.0',settings:{}});
write(path.join(model,'definition/database.tmdl'),'database\n\tcompatibilityLevel: 1600\n');
write(path.join(model,'definition/model.tmdl'),'model Model\n\tculture: en-US\n\tdefaultPowerBIDataSourceVersion: powerBI_V3\n\tsourceQueryCulture: en-US\n\tdataAccessOptions\n\t\tlegacyRedirects\n\t\treturnErrorValuesAsNull\n\nref table Workforce\n');
const data=rows.map(w=>fields.map(([key])=>w[key])),encoded=zlib.deflateRawSync(Buffer.from(JSON.stringify(data))).toString('base64');
const typePairs=fields.map(([,name,type])=>`{${JSON.stringify(name)}, ${type==='dateTime'?'type date':type==='double'?'type number':'type text'}}`).join(', ');
const validation=`    Typed = Table.TransformColumnTypes(Source, {${typePairs}}, "en-US"),
    Clean = Table.TransformColumns(Typed, {{"Workday ID", each if _ = null then null else Text.Trim(_), type text}, {"Worker Status", each if _ = null then "" else Text.Trim(_), type text}, {"Exclude from Headcount", each if _ = null then "No" else Text.Trim(_), type text}}),
    DistinctRows = Table.Distinct(Clean),
    Keys = Table.Group(DistinctRows, {"Workday ID", "Snapshot_Date"}, {{"Records", each Table.RowCount(_), Int64.Type}}),
    BadKeys = Table.SelectRows(Keys, each [Workday ID] = null or [Workday ID] = "" or [Snapshot_Date] = null or [Records] > 1),
    Checked = if Table.RowCount(BadKeys) > 0 then error "Missing keys or conflicting worker/snapshot records. Resolve them before refreshing." else DistinctRows
in
    Checked`;
const m=`let
    Data = Json.Document(Binary.Decompress(Binary.FromText("${encoded}", BinaryEncoding.Base64), Compression.Deflate)),
    Source = Table.FromRows(Data, {${fields.map(([,n])=>JSON.stringify(n)).join(', ')}}),
${validation}`;
let t='table Workforce\n';
for(const [,name,type] of fields)t+=`\tcolumn '${name}'\n\t\tdataType: ${type}\n\t\tsourceColumn: ${name}\n\t\tsummarizeBy: none\n${type==='dateTime'?'\t\tformatString: yyyy-MM-dd\n':type==='double'?'\t\tformatString: #,0.00\n':''}`;
t+=`\tcolumn 'Tenure Years' = DIVIDE( DATEDIFF( Workforce[Latest Hire Date], Workforce[Snapshot_Date], DAY ), 365.25 )
\t\tdataType: double
\t\tformatString: 0.00
\t\tsummarizeBy: none
\tcolumn 'Included' = IF( LOWER(TRIM(Workforce[Exclude from Headcount])) IN { "yes", "true", "1" }, FALSE(), LOWER(TRIM(Workforce[Worker Status])) IN { "active", "on leave" } )
\t\tdataType: boolean
\t\tsummarizeBy: none
`;
const measures={
 'Selected Snapshot':['MAXX(ALLSELECTED(Workforce), Workforce[Snapshot_Date])','yyyy-MM-dd'],
 'Included Headcount':['VAR D = [Selected Snapshot] RETURN CALCULATE(DISTINCTCOUNT(Workforce[Workday ID]), Workforce[Snapshot_Date] = D, Workforce[Included] = TRUE())','#,0'],
 'Total FTE':['VAR D = [Selected Snapshot] RETURN CALCULATE(SUM(Workforce[Full Time Equivalent (FTE)]), Workforce[Snapshot_Date] = D, Workforce[Included] = TRUE())','#,0.00'],
 'Employees':['CALCULATE([Included Headcount], KEEPFILTERS(Workforce[Worker Type] = "Employee"))','#,0'],
 'Contingent Workers':['CALCULATE([Included Headcount], KEEPFILTERS(Workforce[Worker Type] = "Contingent Worker"))','#,0'],
 'People Managers':['CALCULATE([Included Headcount], KEEPFILTERS(Workforce[Is Manager] = "Yes"))','#,0'],
 'On Leave':['CALCULATE([Included Headcount], KEEPFILTERS(Workforce[Worker Status] = "On Leave"))','#,0'],
 'Part Time Workers':['CALCULATE([Included Headcount], KEEPFILTERS(Workforce[Time Type] = "Part time"))','#,0'],
 'FTE per Worker':['DIVIDE([Total FTE], [Included Headcount])','0.00'],
 'Capacity Gap':['[Included Headcount] - [Total FTE]','#,0.00'],
 'Manager Share':['DIVIDE([People Managers], [Included Headcount])','0.0%'],
 'Contingent Share':['DIVIDE([Contingent Workers], [Included Headcount])','0.0%'],
 'On Leave Share':['DIVIDE([On Leave], [Included Headcount])','0.0%'],
 'Part Time Share':['DIVIDE([Part Time Workers], [Included Headcount])','0.0%'],
 'Average Tenure Years':['VAR D = [Selected Snapshot] RETURN CALCULATE(AVERAGE(Workforce[Tenure Years]), Workforce[Snapshot_Date] = D, Workforce[Included] = TRUE(), Workforce[Latest Hire Date] <> BLANK(), Workforce[Tenure Years] >= 0)','0.0'],
 'Median Tenure Years':['VAR D = [Selected Snapshot] RETURN CALCULATE(MEDIAN(Workforce[Tenure Years]), Workforce[Snapshot_Date] = D, Workforce[Included] = TRUE(), Workforce[Latest Hire Date] <> BLANK(), Workforce[Tenure Years] >= 0)','0.0'],
 'Current Workers Hired Last 90 Days':['VAR D = [Selected Snapshot] RETURN CALCULATE([Included Headcount], KEEPFILTERS(Workforce[Latest Hire Date] >= D - 90), KEEPFILTERS(Workforce[Latest Hire Date] <= D))','#,0'],
 'Current Workers Hired YTD':['VAR D = [Selected Snapshot] RETURN CALCULATE([Included Headcount], KEEPFILTERS(Workforce[Latest Hire Date] >= DATE(YEAR(D),1,1)), KEEPFILTERS(Workforce[Latest Hire Date] <= D))','#,0'],
 'Countries':['VAR D = [Selected Snapshot] RETURN CALCULATE(DISTINCTCOUNT(Workforce[Work Country]), Workforce[Snapshot_Date] = D, Workforce[Included] = TRUE(), Workforce[Work Country] <> BLANK())','#,0'],
 'Cost Centers':['VAR D = [Selected Snapshot] RETURN CALCULATE(DISTINCTCOUNT(Workforce[Cost Center - ID]), Workforce[Snapshot_Date] = D, Workforce[Included] = TRUE(), Workforce[Cost Center - ID] <> BLANK())','#,0']
};
for(const [name,[dax,format]] of Object.entries(measures))t+=`\tmeasure '${name}' = ${dax}\n\t\tformatString: ${format}\n\t\tdisplayFolder: Workforce Metrics\n`;
t+='\n\tpartition Workforce = m\n\t\tmode: import\n\t\tsource =\n'+m.split('\n').map(l=>'\t\t\t'+l).join('\n')+'\n';
write(path.join(model,'definition/tables/Workforce.tmdl'),t);
write(path.join(out,'Workday-Import.pq'),`// Replace the synthetic partition with this query after mapping the export fields.
// Replace ExportPath locally. Keep credentials outside source code.
let
    ExportPath = "C:\\Workday\\Workforce.csv",
    Raw = Csv.Document(File.Contents(ExportPath), [Delimiter=",", Encoding=65001, QuoteStyle=QuoteStyle.Csv]),
    Source = Table.PromoteHeaders(Raw, [PromoteAllScalars=true]),
${validation}`);
write(path.join(out,'Measures.dax'),Object.entries(measures).map(([name,[dax]])=>`${name} =\n${dax}`).join('\n\n'));
const csv=data=>data.map(r=>r.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(',')).join('\r\n');
write(path.join(out,'sample-data/Workforce-SYNTHETIC.csv'),csv([fields.map(([,n])=>n),...data]));
write(path.join(out,'Workday-Field-Template.csv'),csv([fields.map(([,n])=>n)]));
const prior='C:/Users/Admin/Desktop/powerbi-visual-lab/reports/FinanceOS/FinanceOS.Report';
const config=JSON.parse(fs.readFileSync(path.join(prior,'definition/report.json'))),guid=require('../visual/pbiviz.json').visual.guid;
config.resourcePackages=config.resourcePackages.filter(p=>p.type!=='CustomVisual');config.resourcePackages.push({name:guid,type:'CustomVisual',items:[{name:guid+'.pbiviz.json',path:guid+'.pbiviz.json',type:'CustomVisualMetadata'}]});
fs.cpSync(path.join(prior,'StaticResources'),path.join(report,'StaticResources'),{recursive:true});
write(path.join(report,'definition/report.json'),config);
write(path.join(report,'definition/version.json'),{$schema:schema('report/definition/versionMetadata','1.0.0'),version:'2.0.0'});
const page='WorkforceWorkspace',vid='WorkforceApp';
write(path.join(report,'definition/pages/pages.json'),{$schema:schema('report/definition/pagesMetadata','1.1.0'),pageOrder:[page],activePageName:page});
write(path.join(report,`definition/pages/${page}/page.json`),{$schema:schema('report/definition/page','2.1.0'),name:page,displayName:'Workforce OS — Synthetic demo',displayOption:'FitToPage',width:1600,height:1100});
const queryState={};for(const [role,name] of fields)queryState[role]={projections:[{field:{Column:{Expression:{SourceRef:{Entity:'Workforce'}},Property:name}},queryRef:'Workforce.'+name,nativeQueryRef:name}]};
write(path.join(report,`definition/pages/${page}/visuals/${vid}/visual.json`),{$schema:schema('report/definition/visualContainer','2.12.0'),name:vid,position:{x:0,y:0,z:0,width:1600,height:1100,tabOrder:0},visual:{visualType:guid,query:{queryState},drillFilterOtherVisuals:true,visualContainerObjects:{title:[{properties:{show:{expr:{Literal:{Value:'false'}}}}}],background:[{properties:{show:{expr:{Literal:{Value:'false'}}}}}]}}});
write(path.join(out,'FIELD-MAPPING.md'),'# Workday field mapping\n\nThe model uses one record per Workday ID per Snapshot_Date. Map your approved export to these columns. All names and records in the included sample are fictional.\n\n| Visual role | Model / export column | Type |\n|---|---|---|\n'+fields.map(([r,n,t])=>`| ${r} | ${n} | ${t} |`).join('\n')+'\n\nWorker Display Name is a derived field; combine Legal First Name and Legal Last Name in your approved import if needed. Latest Hire Date is the sole tenure start date. Original Hire Date and current-position effective date are retained for future analysis, but do not drive tenure or imply mobility.\n');
console.log('Built report, model, 20 DAX measures, import query and synthetic data.');
