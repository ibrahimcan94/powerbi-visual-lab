import React from "react";
import {createRoot} from "react-dom/client";
import {FinanceApp} from "./FinanceApp";
import {createDataset,FinanceEvent} from "./finance/model";
import events from "./demo-events.json";
const demoDataset=createDataset(events as FinanceEvent[],"report");
import {ErrorBoundary} from "./components/ErrorBoundary";
const root=document.getElementById("root");
if(root)createRoot(root).render(<ErrorBoundary><div style={{height:28,background:'#fff3cd',color:'#664d03',textAlign:'center',font:'12px/28px Segoe UI,sans-serif'}}>SYNTHETIC DEMO · Fictional invoices and figures · No live finance connection</div><div style={{height:'calc(100% - 28px)'}}><FinanceApp dataset={demoDataset} title="Finance overview"/></div></ErrorBoundary>);
