import powerbi from 'powerbi-visuals-api';
import React from 'react';
import {createRoot,Root} from 'react-dom/client';
import {App} from './App';
import {Worker,fields} from './model';
import {FormattingSettingsService} from 'powerbi-visuals-utils-formattingmodel';
import {Settings} from './settings';
import '../style/visual.less';
export class Visual implements powerbi.extensibility.visual.IVisual {
 private root:Root; private host:powerbi.extensibility.visual.IVisualHost;
 private service=new FormattingSettingsService();private settings=new Settings();
 constructor(o?:powerbi.extensibility.visual.VisualConstructorOptions){if(!o)throw new Error('Power BI host is required.');this.root=createRoot(o.element);this.host=o.host;}
 update(o:powerbi.extensibility.visual.VisualUpdateOptions):void{
  this.host.eventService.renderingStarted(o);
  try{const v=o.dataViews?.[0],t=v?.table;
   this.settings=v?this.service.populateFormattingSettingsModel(Settings,v):new Settings();
   if(v?.metadata.segment){const requested=this.host.fetchMoreData(true);this.root.render(React.createElement('p',null,requested?'Loading complete workforce…':'Data exceeds the visual limit. Filter the report before using totals.'));this.host.eventService.renderingFinished(o);return;}
   const rows:Worker[]=(t?.rows||[]).map(row=>{const w:Worker={};fields.forEach(([key,,type])=>{const i=t?.columns.findIndex(c=>c.roles?.[key])??-1;const value=i<0?'':row[i];if(type==='dateTime'&&value!==null&&value!==''){const d=new Date(value as string|number);w[key]=Number.isFinite(d.getTime())?d.toISOString().slice(0,10):'';}else w[key]=typeof value==='number'?value:String(value??'');});return w;});
   this.root.render(React.createElement('div',{style:{width:o.viewport.width,height:o.viewport.height}},React.createElement(App,{rows,demo:this.settings.workspace.demo.value})));
   this.host.eventService.renderingFinished(o);
  }catch(e){this.root.render(React.createElement('p',{role:'alert'},String(e)));this.host.eventService.renderingFailed(o,String(e));}
 }
 getFormattingModel():powerbi.visuals.FormattingModel{return this.service.buildFormattingModel(this.settings);}
 destroy():void{this.root.unmount();}
}
