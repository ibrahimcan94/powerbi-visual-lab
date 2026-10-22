import {formattingSettings as f} from 'powerbi-visuals-utils-formattingmodel';
class WorkspaceCard extends f.SimpleCard {
 name='workspace';displayName='Workforce workspace';
 demo=new f.ToggleSwitch({name:'demo',displayName:'Show synthetic demo label',value:true});
 slices=[this.demo];
}
export class Settings extends f.Model {workspace=new WorkspaceCard();cards=[this.workspace];}
