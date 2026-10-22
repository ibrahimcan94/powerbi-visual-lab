import type powerbi from "powerbi-visuals-api";

export type EventKind = "Invoice" | "Payment" | "Credit" | "Promise";
export interface FinanceEvent {
    eventId: string; invoiceId: string; customer: string; region: string; segment: string;
    collector: string; risk: string; invoiceDate: string; dueDate: string; eventDate: string;
    kind: EventKind; amount: number; disputeDate: string | null; promiseDue: string | null; rowIndex: number;
}
export interface Invoice {
    id: string; customer: string; region: string; segment: string; collector: string; risk: string;
    issued: string; due: string; amount: number; disputeDate: string | null; rowIndex: number;
    payments: FinanceEvent[]; credits: FinanceEvent[]; promises: FinanceEvent[];
}
export interface FinanceDataset { invoices: Invoice[]; periods: string[]; asOf: string; eventCount: number; warnings: string[]; source: "sample" | "report" }
export interface Filters { asOf: string; region: string; segment: string; collector: string; risk: string; search: string }
export type InvoiceStatus = "Paid" | "Current" | "Overdue" | "Disputed";
export interface Position { invoice: Invoice; balance: number; overdue: number; dpd: number; aging: string; disputed: number; status: InvoiceStatus; paid: number; credit: number; closedDate: string | null }
export interface Metrics {
    ar: number; overdue: number; current: number; aged90: number; disputed: number; cash: number;
    billings: number; credits: number; dso: number | null; overdueRate: number | null; cei: number | null;
    cashTarget: number; cashAttainment: number | null; openInvoices: number; activeCustomers: number;
    promises: number; kept: number; promiseRate: number | null; onTimeRate: number | null; weightedDpd: number | null;
}
export interface Trend { date: string; label: string; ar: number; cash: number; billings: number; dso: number | null; overdueRate: number | null; cashTarget: number; cei: number | null }
export interface Group { name: string; ar: number; overdue: number; cash: number; disputed: number; invoices: number; promises: number; kept: number }
export interface FinanceView { metrics: Metrics; prior: Metrics; positions: Position[]; trend: Trend[]; regions: Group[]; customers: Group[]; collectors: Group[]; aging: { name: string; value: number }[]; coverageWarning: boolean }
export const AGING = ["Current", "1–30 days", "31–60 days", "61–90 days", "90+ days"];
export const cents = (v: number): number => Math.round(v * 100);
export const dollars = (v: number): number => Math.round(v) / 100;
export const ratio = (a: number, b: number): number | null => b === 0 ? null : a / b;
export function dateValue(raw: unknown): string | null {
    if (raw instanceof Date && Number.isFinite(raw.getTime())) return raw.toISOString().slice(0, 10);
    if (typeof raw !== "string" || !/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(raw)) return null;
    const value = raw.slice(0, 10), time = Date.parse(value + "T00:00:00Z");
    return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value ? value : null;
}
export function monthEnd(date: string, offset = 0): string {
    const d = new Date(date + "T00:00:00Z");
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + offset + 1, 0)).toISOString().slice(0, 10);
}
export function monthStart(date: string): string { return date.slice(0, 8) + "01"; }
export function daysBetween(later: string, earlier: string): number { return Math.round((Date.parse(later) - Date.parse(earlier)) / 86400000); }
function before(events: FinanceEvent[], asOf: string): number { return events.reduce((sum, e) => sum + (e.eventDate <= asOf ? cents(e.amount) : 0), 0); }
function inMonth(events: FinanceEvent[], asOf: string): number { return events.reduce((sum, e) => sum + (e.eventDate >= monthStart(asOf) && e.eventDate <= asOf ? cents(e.amount) : 0), 0); }

export function createDataset(events: FinanceEvent[], source: "sample" | "report", initialWarnings: string[] = []): FinanceDataset {
    const invoices = new Map<string, Invoice>(), seen = new Set<string>(), unique: FinanceEvent[] = [];
    let duplicate = 0;
    for (const event of events) {
        if (seen.has(event.eventId)) { duplicate++; continue; }
        seen.add(event.eventId); unique.push(event);
        if (event.kind === "Invoice") {
            if (invoices.has(event.invoiceId)) throw new Error("More than one invoice event for " + event.invoiceId + ". Supply one unique Invoice event per invoice.");
            invoices.set(event.invoiceId, { id: event.invoiceId, customer: event.customer, region: event.region, segment: event.segment, collector: event.collector, risk: event.risk, issued: event.invoiceDate, due: event.dueDate, amount: event.amount, disputeDate: event.disputeDate, rowIndex: event.rowIndex, payments: [], credits: [], promises: [] });
        }
    }
    let orphan = 0;
    for (const event of unique) {
        const invoice = invoices.get(event.invoiceId);
        if (!invoice) { orphan++; continue; }
        if (event.kind === "Payment") invoice.payments.push(event);
        if (event.kind === "Credit") invoice.credits.push(event);
        if (event.kind === "Promise") invoice.promises.push(event);
    }
    const warnings = [...initialWarnings];
    if (duplicate) warnings.push(`${duplicate} duplicate event IDs were ignored.`);
    if (orphan) warnings.push(`${orphan} events have no invoice event. Report filters may have removed invoice history; balances are incomplete.`);
    const dates = unique.map(e => e.eventDate).sort();
    const asOf = dates.length ? monthEnd(dates[dates.length - 1]) : "";
    const first = dates.length ? monthEnd(dates[0]) : "";
    const periods: string[] = [];
    if (first && asOf) { let date = first; while (date <= asOf && periods.length < 240) { periods.push(date); date = monthEnd(date, 1); } }
    if (invoices.size === 0 && events.length) throw new Error("No Invoice events are available. Bind the full ledger, including original invoices and their payment history.");
    return { invoices: Array.from(invoices.values()), periods, asOf, eventCount: unique.length, warnings, source };
}

export const REQUIRED_ROLES = ["eventId", "invoiceId", "customer", "invoiceDate", "dueDate", "eventDate", "eventType", "amount"];
export function parseLedger(view: powerbi.DataView): FinanceDataset {
    const table = view.table;
    if (!table) throw new Error("Bind the finance event ledger using the table fields. KPI measure bindings cannot feed a full invoice dashboard.");
    const index = (role: string) => table.columns.findIndex(c => c.roles?.[role]);
    const missing = REQUIRED_ROLES.filter(role => index(role) < 0);
    if (missing.length) throw new Error("Missing required fields: " + missing.join(", ") + ". See the included ledger mapping guide.");
    const indices = Object.fromEntries([...REQUIRED_ROLES, "region", "segment", "collector", "risk", "disputeDate", "promiseDue"].map(role => [role, index(role)]));
    let malformed = 0;
    const events: FinanceEvent[] = [];
    (table.rows ?? []).forEach((row, rowIndex) => {
        const get = (key: string) => indices[key] < 0 ? null : row[indices[key]];
        const str = (key: string, fallback = "Unassigned") => get(key) === null || get(key) === undefined ? fallback : String(get(key));
        const invoiceDate = dateValue(get("invoiceDate")), dueDate = dateValue(get("dueDate")), eventDate = dateValue(get("eventDate"));
        const amount = get("amount"), kind = str("eventType");
        if (!invoiceDate || !dueDate || !eventDate || typeof amount !== "number" || !Number.isFinite(amount) || !["Invoice", "Payment", "Credit", "Promise"].includes(kind) || !str("eventId", "") || !str("invoiceId", "")) { malformed++; return; }
        const promiseDue = dateValue(get("promiseDue"));
        if (kind === "Promise" && !promiseDue) { malformed++; return; }
        events.push({ eventId: str("eventId"), invoiceId: str("invoiceId"), customer: str("customer"), region: str("region"), segment: str("segment"), collector: str("collector"), risk: str("risk"), invoiceDate, dueDate, eventDate, kind: kind as EventKind, amount, disputeDate: dateValue(get("disputeDate")), promiseDue, rowIndex });
    });
    const warnings: string[] = [];
    if (malformed) warnings.push(`${malformed} malformed rows were excluded. Correct their fields before relying on totals.`);
    if (view.metadata.segment) warnings.push("Power BI reduced the dataset. Supply the complete ledger or narrow by complete customer/invoice lifecycles; totals are incomplete.");
    return createDataset(events, "report", warnings);
}

export function position(invoice: Invoice, asOf: string): Position {
    const paid = before(invoice.payments, asOf), credit = before(invoice.credits, asOf);
    const balance = Math.max(0, cents(invoice.amount) - paid - credit);
    const dpd = balance ? Math.max(0, daysBetween(asOf, invoice.due)) : 0;
    const aging = dpd === 0 ? AGING[0] : dpd <= 30 ? AGING[1] : dpd <= 60 ? AGING[2] : dpd <= 90 ? AGING[3] : AGING[4];
    const disputed = invoice.disputeDate && invoice.disputeDate <= asOf ? balance : 0;
    let closedDate: string | null = null, remaining = cents(invoice.amount);
    for (const event of [...invoice.payments, ...invoice.credits].filter(e => e.eventDate <= asOf).sort((a,b) => a.eventDate.localeCompare(b.eventDate))) { remaining -= cents(event.amount); if (remaining <= 0 && !closedDate) closedDate = event.eventDate; if (remaining > 0) closedDate = null; }
    return { invoice, balance: dollars(balance), overdue: dpd ? dollars(balance) : 0, dpd, aging, disputed: dollars(disputed), status: !balance ? "Paid" : disputed ? "Disputed" : dpd ? "Overdue" : "Current", paid: dollars(paid), credit: dollars(credit), closedDate };
}
function metrics(invoices: Invoice[], asOf: string, positions?: Position[]): Metrics {
    const eligible = invoices.filter(i => i.issued <= asOf), pos = positions ?? eligible.map(i => position(i, asOf));
    const ar = dollars(pos.reduce((n,p) => n + cents(p.balance), 0)), overdue = dollars(pos.reduce((n,p) => n+cents(p.overdue), 0));
    const cash = dollars(eligible.reduce((n,i) => n + inMonth(i.payments, asOf), 0));
    const billings = dollars(eligible.reduce((n,i) => n + (i.issued >= monthStart(asOf) ? cents(i.amount) : 0), 0));
    const credits = dollars(eligible.reduce((n,i) => n+inMonth(i.credits,asOf), 0));
    const prior = monthEnd(asOf, -1), opening = dollars(eligible.filter(i => i.issued <= prior).reduce((n,i) => n+cents(position(i,prior).balance), 0));
    const rolling = dollars(eligible.reduce((n,i) => n + (daysBetween(asOf,i.issued)<90 ? cents(i.amount) : 0), 0));
    let promises = 0, kept = 0;
    for (const invoice of eligible) for (const promise of invoice.promises) {
        if (promise.promiseDue && promise.promiseDue >= monthStart(asOf) && promise.promiseDue <= asOf) {
            promises++;
            const paid = invoice.payments.reduce((n,e) => n+(e.eventDate>promise.eventDate && e.eventDate<=(promise.promiseDue ?? "") ? cents(e.amount) : 0),0);
            if (paid >= cents(promise.amount)) kept++;
        }
    }
    const closed = pos.filter(p => p.closedDate !== null), open = pos.filter(p => p.balance>0);
    const base = opening + billings - credits;
    return { ar, overdue, current: ar-overdue, aged90: dollars(pos.reduce((n,p) => n+(p.dpd>90?cents(p.balance):0),0)), disputed: dollars(pos.reduce((n,p) => n+cents(p.disputed),0)), cash, billings, credits, dso: ratio(ar*90,rolling), overdueRate: ratio(overdue,ar), cei: ratio(base-ar,base-(ar-overdue)), cashTarget: billings*.95, cashAttainment: ratio(cash,billings*.95), openInvoices: open.length, activeCustomers: new Set(open.map(p=>p.invoice.customer)).size, promises, kept, promiseRate: ratio(kept,promises), onTimeRate: ratio(closed.filter(p=>(p.closedDate??"")<=p.invoice.due).length,closed.length), weightedDpd: ratio(pos.reduce((n,p)=>n+p.balance*p.dpd,0),ar) };
}
function groups(positions: Position[], asOf: string, key: "region"|"customer"|"collector"): Group[] {
    const result = new Map<string,Group>();
    for (const p of positions) {
        const name=p.invoice[key], group=result.get(name)??{name,ar:0,overdue:0,cash:0,disputed:0,invoices:0,promises:0,kept:0};
        group.ar+=cents(p.balance);group.overdue+=cents(p.overdue);group.disputed+=cents(p.disputed);group.cash+=inMonth(p.invoice.payments,asOf);if(p.balance>0)group.invoices++;
        for(const promise of p.invoice.promises)if(promise.promiseDue && promise.promiseDue>=monthStart(asOf) && promise.promiseDue<=asOf){group.promises++;const cash=p.invoice.payments.reduce((n,e)=>n+(e.eventDate>promise.eventDate && e.eventDate<=(promise.promiseDue??"")?cents(e.amount):0),0);if(cash>=cents(promise.amount))group.kept++;}
        result.set(name,group);
    }
    return Array.from(result.values()).map(g=>({...g,ar:dollars(g.ar),overdue:dollars(g.overdue),cash:dollars(g.cash),disputed:dollars(g.disputed)})).sort((a,b)=>b.ar-a.ar);
}
export function calculateView(dataset: FinanceDataset, filters: Filters): FinanceView {
    const search=filters.search.trim().toLocaleLowerCase();
    const invoices=dataset.invoices.filter(i=>(!filters.region||i.region===filters.region)&&(!filters.segment||i.segment===filters.segment)&&(!filters.collector||i.collector===filters.collector)&&(!filters.risk||i.risk===filters.risk)&&(!search||[i.id,i.customer,i.collector].some(v=>v.toLocaleLowerCase().includes(search))));
    const positions=invoices.filter(i=>i.issued<=filters.asOf).map(i=>position(i,filters.asOf));
    const current=metrics(invoices,filters.asOf,positions), prior=metrics(invoices,monthEnd(filters.asOf,-1));
    const trend=dataset.periods.filter(d=>d<=filters.asOf).slice(-12).map(date=>{const m=metrics(invoices,date);return {date,label:new Intl.DateTimeFormat("en-US",{month:"short",timeZone:"UTC"}).format(new Date(date+"T00:00:00Z")),ar:m.ar,cash:m.cash,billings:m.billings,dso:m.dso,overdueRate:m.overdueRate,cashTarget:m.cashTarget,cei:m.cei};});
    return {metrics:current,prior,positions,trend,regions:groups(positions,filters.asOf,"region"),customers:groups(positions,filters.asOf,"customer"),collectors:groups(positions,filters.asOf,"collector"),aging:AGING.map(name=>({name,value:dollars(positions.reduce((sum,p)=>sum+(p.aging===name?cents(p.balance):0),0))})),coverageWarning:dataset.periods.indexOf(filters.asOf)<2};
}
