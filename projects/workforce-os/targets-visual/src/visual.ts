import powerbi from 'powerbi-visuals-api';
import React from 'react';
import {createRoot,Root} from 'react-dom/client';
import {App} from './App';
import {MonthlyRow,normalize} from './model';
import {FormattingSettingsService,formattingSettings as f} from 'powerbi-visuals-utils-formattingmodel';
import '../style/visual.less';
class Card extends f.SimpleCard {name='workspace';displayName='Monthly targets';demo=new f.ToggleSwitch({name:'demo',displayName:'Show synthetic demo label',value:true});slices=[this.demo];}
class Settings extends f.Model {workspace=new Card();cards=[this.workspace];}
export class Visual implements powerbi.extensibility.visual.IVisual {
 private root:Root;private host:powerbi.extensibility.visual.IVisualHost;private service=new FormattingSettingsService();private settings=new Settings();
 constructor(o?:powerbi.extensibility.visual.VisualConstructorOptions){if(!o)throw new Error('Power BI host required');this.root=createRoot(o.element);this.host=o.host;}
 update(o:powerbi.extensibility.visual.VisualUpdateOptions):void {this.host.eventService.renderingStarted(o);try{const v=o.dataViews?.[0],t=v?.table;this.settings=v?this.service.populateFormattingSettingsModel(Settings,v):new Settings();if(v?.metadata.segment){const more=this.host.fetchMoreData(true);this.root.render(React.createElement('p',null,more?'Loading complete monthly history…':'Incomplete data: filter the report before viewing totals.'));this.host.eventService.renderingFinished(o);return;}
 const keys=['month','stream','country','director','actual','target'] as const;
 if(t?.rows?.length&&keys.some(k=>!t.columns.some(c=>c.roles?.[k])))throw new Error('Bind all six MonthlyPerformance fields.');
 const rows:MonthlyRow[]=(t?.rows||[]).map(row=>{const w:Record<string,string|number|null>={};for(const key of keys){const i=t!.columns.findIndex(c=>c.roles?.[key]),value=row[i];w[key]=key==='actual'||key==='target'?value===null||value===undefined||value===''?null:Number(value):String(value??'');}return w as unknown as MonthlyRow;});
 this.root.render(React.createElement('div',{style:{width:o.viewport.width,height:o.viewport.height}},React.createElement(App,{rows:normalize(rows),demo:this.settings.workspace.demo.value})));this.host.eventService.renderingFinished(o);
 }catch(e){this.root.render(React.createElement('p',{role:'alert'},String(e)));this.host.eventService.renderingFailed(o,String(e));}}
 getFormattingModel():powerbi.visuals.FormattingModel{return this.service.buildFormattingModel(this.settings);}
 destroy():void{this.root.unmount();}
}
