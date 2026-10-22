import React from "react";
import {createRoot} from "react-dom/client";
import {FinanceApp} from "./FinanceApp";
import {sampleDataset} from "./sample";
import {ErrorBoundary} from "./components/ErrorBoundary";
const root=document.getElementById("root");
if(root)createRoot(root).render(<ErrorBoundary><FinanceApp dataset={sampleDataset} title="Finance overview"/></ErrorBoundary>);
