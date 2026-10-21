import { formattingSettings as f } from "powerbi-visuals-utils-formattingmodel";
class dashboardCard extends f.SimpleCard {
    name = "dashboard";
    displayName = "dashboard";
    showTitle = new f.ToggleSwitch({ name: "showTitle", displayName: "Title visible", value: true });
    title = new f.TextInput({ name: "title", displayName: "Title", value: "", placeholder: "Automatic" });
    fontSize = new f.NumUpDown({ name: "fontSize", displayName: "Value font size", value: 40 });
    decimals = new f.NumUpDown({ name: "decimals", displayName: "Decimal places", value: 2 });
    prefix = new f.TextInput({ name: "prefix", displayName: "Prefix", value: "", placeholder: "Automatic" });
    suffix = new f.TextInput({ name: "suffix", displayName: "Suffix", value: "", placeholder: "Automatic" });
    percent = new f.ToggleSwitch({ name: "percent", displayName: "Percentage", value: false });
    light = new f.ToggleSwitch({ name: "light", displayName: "Light theme", value: false });
    background = new f.ColorPicker({ name: "background", displayName: "Background", value: { "value": "#111827" } });
    text = new f.ColorPicker({ name: "text", displayName: "Text", value: { "value": "#f9fafb" } });
    accent = new f.ColorPicker({ name: "accent", displayName: "Accent", value: { "value": "#34d399" } });
    showComparison = new f.ToggleSwitch({ name: "showComparison", displayName: "Comparison visible", value: true });
    slices = [this.showTitle, this.title, this.fontSize, this.decimals, this.prefix, this.suffix, this.percent, this.light, this.background, this.text, this.accent, this.showComparison];
}
class chartCard extends f.SimpleCard {
    name = "chart";
    displayName = "chart";
    show = new f.ToggleSwitch({ name: "show", displayName: "Chart visible", value: true });
    lineColor = new f.ColorPicker({ name: "lineColor", displayName: "Line color", value: { "value": "#34d399" } });
    lineWidth = new f.NumUpDown({ name: "lineWidth", displayName: "Line width", value: 3 });
    opacity = new f.NumUpDown({ name: "opacity", displayName: "Area opacity", value: 0.2 });
    tooltips = new f.ToggleSwitch({ name: "tooltips", displayName: "Tooltips", value: true });
    gridlines = new f.ToggleSwitch({ name: "gridlines", displayName: "Gridlines", value: true });
    animation = new f.ToggleSwitch({ name: "animation", displayName: "Animation", value: true });
    slices = [this.show, this.lineColor, this.lineWidth, this.opacity, this.tooltips, this.gridlines, this.animation];
}
class LegacyCard extends f.SimpleCard {
    name = "dataPoint";
    displayName = "Legacy data colors";
    defaultColor = new f.ColorPicker({ name: "defaultColor", displayName: "defaultColor", value: { "value": "" } });
    fill = new f.ColorPicker({ name: "fill", displayName: "fill", value: { "value": "" } });
    fillRule = new f.ColorPicker({ name: "fillRule", displayName: "fillRule", value: { "value": "" } });
    fontSize = new f.NumUpDown({ name: "fontSize", displayName: "fontSize", value: 12 });
    showAllDataPoints = new f.ToggleSwitch({ name: "showAllDataPoints", displayName: "showAllDataPoints", value: true });
    slices = [this.defaultColor, this.fill, this.fillRule, this.fontSize, this.showAllDataPoints];
}
export class VisualFormattingSettingsModel extends f.Model {
    dashboard = new dashboardCard();
    chart = new chartCard();
    legacy = new LegacyCard();
    cards = [this.dashboard, this.chart, this.legacy];
}
