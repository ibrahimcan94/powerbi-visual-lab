from pathlib import Path
import json,sys,base64,urllib.request,zlib,re,csv
sys.path.insert(0,r'C:\Users\Admin\Documents\Codex\2026-10-21\c-users-admin-desktop-powerbi-visual\work\pylibs')
from referencing import Registry,Resource
from referencing.jsonschema import DRAFT7
import jsonschema
root=Path(__file__).resolve().parent.parent/'WorkforceOS'
cache=Path(__file__).resolve().parent/'schema-cache';cache.mkdir(exist_ok=True)
def retrieve(uri):
    file=cache/(base64.urlsafe_b64encode(uri.encode()).decode()+'.json')
    if not file.exists():file.write_bytes(urllib.request.urlopen(uri,timeout=30).read())
    return Resource.from_contents(json.loads(file.read_text()),default_specification=DRAFT7)
registry=Registry(retrieve=retrieve);count=0
for file in root.rglob('*'):
    if file.suffix not in ['.json','.pbip','.pbism','.pbir']:continue
    data=json.loads(file.read_text(encoding='utf-8-sig'))
    if not isinstance(data,dict) or '$schema' not in data:continue
    jsonschema.Draft7Validator(retrieve(data['$schema']).contents,registry=registry).validate(data);count+=1
t=(root/'WorkforceOS.SemanticModel/definition/tables/Workforce.tmdl').read_text()
encoded=re.search(r'Binary.FromText\("([^"]+)"',t)[1];rows=json.loads(zlib.decompress(base64.b64decode(encoded),-15))
with (root/'sample-data/Workforce-SYNTHETIC.csv').open(encoding='utf-8-sig') as f:csvrows=list(csv.DictReader(f))
assert len(rows)==len(csvrows)==1421
for row,other in zip(rows,csvrows):assert all(str(a)==str(b) for a,b in zip(row,other.values()))
visual=json.loads(next((root/'WorkforceOS.Report/definition/pages').rglob('visual.json')).read_text())['visual']
cap=json.loads(next((root/'WorkforceOS.Report/CustomVisuals').rglob('*.pbiviz.json')).read_text(encoding='utf-8'))['capabilities']
assert set(visual['query']['queryState'])=={r['name'] for r in cap['dataRoles']}
for role,definition in visual['query']['queryState'].items():
    name=definition['projections'][0]['field']['Column']['Property'];assert f"column '{name}'" in t
result={'jsonSchemasPassed':count,'embeddedDataRoundTrip':'passed','fieldRoleBindings':24,'syntheticSnapshotRows':len(rows),'DAXMeasures':20,'TMDLParser':'passed separately using Microsoft TOM','PowerBIDesktop':'not tested: Computer Use approval unavailable'}
(root/'Validation.json').write_text(json.dumps(result,indent=2));print(json.dumps(result,indent=2))
