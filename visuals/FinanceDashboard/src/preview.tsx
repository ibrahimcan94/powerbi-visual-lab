import React from "react";
import {createRoot} from "react-dom/client";
import {FinanceApp} from "./FinanceApp";
import {emptyDataset} from "./empty";
import {ErrorBoundary} from "./components/ErrorBoundary";
const root=document.getElementById("root");
if(root)createRoot(root).render(<ErrorBoundary><FinanceApp dataset={emptyDataset} title="Finance overview"/></ErrorBoundary>);
