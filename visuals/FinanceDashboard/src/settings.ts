import {formattingSettings as f} from "powerbi-visuals-utils-formattingmodel";
const pages=[{value:"overview",displayName:"Overview"},{value:"receivables",displayName:"Receivables"},{value:"collections",displayName:"Collections"},{value:"customers",displayName:"Customers"},{value:"invoices",displayName:"Invoices"}];
class AppCard extends f.SimpleCard {
    name="financeApp";displayName="Finance workspace";
    title=new f.TextInput({name:"title",displayName:"Overview title",value:"Finance overview",placeholder:"Finance overview"});
    activePage=new f.ItemDropdown({name:"activePage",displayName:"Opening page",items:pages,value:pages[0]});
    dark=new f.ToggleSwitch({name:"dark",displayName:"Dark canvas",value:false});
    accent=new f.ColorPicker({name:"accent",displayName:"Accent color",value:{value:"#2768ed"}});
    currency=new f.TextInput({name:"currency",displayName:"Reporting currency code",value:"USD",placeholder:"USD"});
    slices=[this.title,this.activePage,this.dark,this.accent,this.currency];
}
export class FinanceSettings extends f.Model {app=new AppCard();cards=[this.app];}
