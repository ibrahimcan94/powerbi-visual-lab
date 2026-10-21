/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualEventService = powerbi.extensibility.IVisualEventService;

import { VisualFormattingSettingsModel } from "./settings";
import React from "react";
import { createRoot, Root } from "react-dom/client";
import { KpiCard } from "./components/KpiCard";

export class Visual implements IVisual {
    private events: IVisualEventService;
    private root: Root;
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;

    constructor(options: VisualConstructorOptions) {
        this.events = options.host.eventService;
        this.formattingSettingsService =
            new FormattingSettingsService();

        this.root = createRoot(options.element);
    }

    public update(options: VisualUpdateOptions): void {
        this.events.renderingStarted(options);

        try {
            if (options.dataViews?.[0]) {
                this.formattingSettings =
                    this.formattingSettingsService
                        .populateFormattingSettingsModel(
                            VisualFormattingSettingsModel,
                            options.dataViews[0]
                        );
            }



const dataView = options.dataViews?.[0];

const categoryColumn =
    dataView?.categorical?.categories?.[0];

const measureColumn =
    dataView?.categorical?.values?.[0];

const trendData = (categoryColumn?.values ?? [])
    .map((category, index) => {
        const rawValue = measureColumn?.values?.[index];

        return {
            label: String(category ?? ""),
            value: typeof rawValue === "number"
                ? rawValue
                : NaN
        };
    })
    .filter(point => Number.isFinite(point.value));

const title =
    measureColumn?.source?.displayName ?? "Total Performance";

// Sum of visible category values.
// Appropriate for additive measures such as sales or volume.
const value = trendData.length > 0
    ? trendData.reduce((sum, point) => sum + point.value, 0)
    : (() => {
        const rawValue = measureColumn?.values?.[0];
        return typeof rawValue === "number" ? rawValue : 0;
    })();

this.root.render(
    React.createElement(KpiCard, {
        title,
        value,
        trendData
    })
);



            this.events.renderingFinished(options);
        } catch (error) {
            console.error("Visual update error:", error);
            this.events.renderingFailed(options, String(error));
        }
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(
            this.formattingSettings ??
            new VisualFormattingSettingsModel()
        );
    }

    public destroy(): void {
        this.root.unmount();
    }
}
