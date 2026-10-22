import powerbi from "powerbi-visuals-api";
import React from "react";
import {createRoot,Root} from "react-dom/client";
import {FormattingSettingsService} from "powerbi-visuals-utils-formattingmodel";
import {FinanceApp,Page,PAGES} from "./FinanceApp";
import {FinanceSettings} from "./settings";
import {FinanceDataset,parseLedger} from "./finance/model";
import {sampleDataset} from "./sample";
import {ErrorBoundary} from "./components/ErrorBoundary";
import "../style/visual.less";

export class Visual implements powerbi.extensibility.visual.IVisual {
    private root:Root;
    private host:powerbi.extensibility.visual.IVisualHost;
    private selection:powerbi.extensibility.ISelectionManager;
    private service=new FormattingSettingsService();
    private settings=new FinanceSettings();
    private cachedTable:powerbi.DataViewTable|undefined;
    private cachedDataset:FinanceDataset|undefined;
    constructor(options?:powerbi.extensibility.visual.VisualConstructorOptions){
        if(!options)throw new Error("Power BI host options are required.");
        this.host=options.host;this.selection=this.host.createSelectionManager();this.root=createRoot(options.element);
    }
    update(options:powerbi.extensibility.visual.VisualUpdateOptions):void{
        const events=this.host.eventService;events.renderingStarted(options);
        try{
            const view=options.dataViews?.[0];
            this.settings=view?this.service.populateFormattingSettingsModel(FinanceSettings,view):new FinanceSettings();
            const app=this.settings.app,hasBindings=Boolean(view?.metadata.columns?.length);
            let dataset:FinanceDataset;
            if(hasBindings && view){
                if(view.table!==this.cachedTable || !this.cachedDataset){this.cachedDataset=parseLedger(view);this.cachedTable=view.table;}
                dataset=this.cachedDataset;
            }else if(app.demoData.value){dataset=sampleDataset;}
            else{
                this.root.render(React.createElement("div",{className:"fd-start-state"},React.createElement("h2",null,"Connect your finance ledger"),React.createElement("p",null,"Bind Event ID, Invoice ID, Customer, Invoice Date, Due Date, Event Date, Event Type and Amount. Or enable sample data in the Finance workspace formatting card.")));
                events.renderingFinished(options);return;
            }
            const table=view?.table;
            const idFor=(index:number)=>{if(!table)throw new Error("Selection requires bound report rows.");return this.host.createSelectionIdBuilder().withTable(table,index).createSelectionId();};
            const pageValue=app.activePage.value.value;
            const initialPage=(PAGES.some(p=>p.id===pageValue)?pageValue:"overview") as Page;
            const palette=this.host.colorPalette;
            const component=React.createElement(FinanceApp,{dataset,initialPage,initialDark:app.dark.value,accent:app.accent.value.value,title:app.title.value,currency:app.currency.value,highContrast:palette.isHighContrast?{foreground:palette.foreground.value,background:palette.background.value}:undefined,
                onNavigate:(page:Page)=>this.host.persistProperties({merge:[{objectName:"financeApp",selector:{},properties:{activePage:page}}]}),
                onSelect:async(index:number,multi:boolean)=>{await Promise.resolve(this.selection.select(idFor(index),multi));},
                onClear:async()=>{await Promise.resolve(this.selection.clear());},
                onContext:(index:number,x:number,y:number)=>{void this.selection.showContextMenu(idFor(index),{x,y});},
                onRendered:()=>events.renderingFinished(options)});
            this.root.render(React.createElement("div",{style:{width:options.viewport.width,height:options.viewport.height,overflow:"hidden"}},React.createElement(ErrorBoundary,{onError:(message:string)=>events.renderingFailed(options,message)},component)));
        }catch(error){
            const message=error instanceof Error?error.message:String(error);
            this.root.render(React.createElement("div",{className:"fd-start-state",role:"alert"},React.createElement("h2",null,"Check your finance ledger"),React.createElement("p",null,message),React.createElement("p",null,"Sample data is never substituted for invalid report data. Correct the bindings or remove all fields to return to the sample workspace.")));
            events.renderingFailed(options,message);
        }
    }
    getFormattingModel():powerbi.visuals.FormattingModel{return this.service.buildFormattingModel(this.settings);}
    destroy():void{this.root.unmount();this.cachedDataset=undefined;this.cachedTable=undefined;}
}
