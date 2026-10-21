import powerbi from "powerbi-visuals-api";
import React from "react";
import { createRoot, Root } from "react-dom/client";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import { VisualFormattingSettingsModel } from "./settings";
import { parseData } from "./data/model";
import { KpiCard } from "./components/KpiCard";
import "../style/visual.less";
export class Visual implements powerbi.extensibility.visual.IVisual {
    private root: Root;
    private host: powerbi.extensibility.visual.IVisualHost;
    private selection: powerbi.extensibility.ISelectionManager;
    private service = new FormattingSettingsService();
    private settings = new VisualFormattingSettingsModel();
    constructor(options?: powerbi.extensibility.visual.VisualConstructorOptions) { if (!options)
        throw new Error("Power BI host options are required."); this.host = options.host; this.selection = this.host.createSelectionManager(); this.root = createRoot(options.element); }
    public update(options: powerbi.extensibility.visual.VisualUpdateOptions): void {
        this.host.eventService.renderingStarted(options);
        try {
            const view = options.dataViews?.[0];
            this.settings = view ? this.service.populateFormattingSettingsModel(VisualFormattingSettingsModel, view) : new VisualFormattingSettingsModel();
            const objects = view?.metadata.objects;
            if (!objects?.dashboard?.fontSize && objects?.dataPoint?.fontSize)
                this.settings.dashboard.fontSize.value = this.settings.legacy.fontSize.value;
            if (!objects?.chart?.lineColor && objects?.dataPoint?.defaultColor)
                this.settings.chart.lineColor.value = this.settings.legacy.defaultColor.value;
            if (!objects?.chart?.lineColor && objects?.dataPoint?.fill)
                this.settings.chart.lineColor.value = this.settings.legacy.fill.value;
            const category = view?.categorical?.categories?.[0];
            const ids = category?.values.map((_, i) => this.host.createSelectionIdBuilder().withCategory(category, i).createSelectionId()) ?? [];
            const palette = this.host.colorPalette;
            this.root.render(React.createElement(KpiCard, { data: parseData(view, this.host.locale), settings: this.settings, locale: this.host.locale, width: options.viewport.width, height: options.viewport.height, foreground: palette.isHighContrast ? palette.foreground.value : undefined, background: palette.isHighContrast ? palette.background.value : undefined,
                select: async (index: number, multi: boolean) => { if (ids[index])
                    return Promise.resolve(this.selection.select(ids[index], multi)).then(() => ids.flatMap((id, i) => this.selection.getSelectionIds().some(selected => (selected as powerbi.visuals.ISelectionId).equals(id)) ? [String(i)] : [])); return Promise.resolve([]); },
                clear: async () => { await Promise.resolve(this.selection.clear()); },
                context: (index: number, x: number, y: number) => { void this.selection.showContextMenu(ids[index] ?? {}, { x, y }); },
                keys: ids.map((_, i) => String(i)), finished: () => this.host.eventService.renderingFinished(options) }));
        }
        catch (error) {
            this.root.render(React.createElement("div", { role: "alert" }, "Unable to display this data. Check the bound measures."));
            this.host.eventService.renderingFailed(options, String(error));
        }
    }
    public getFormattingModel(): powerbi.visuals.FormattingModel { return this.service.buildFormattingModel(this.settings); }
    public destroy(): void { this.root.unmount(); }
}

