// Replace the placeholder path with your populated event-ledger CSV.
let
    LedgerCsvPath = "C:\Data\FinanceLedger.csv",
    Source = Csv.Document(File.Contents(LedgerCsvPath),
        [Delimiter=",", Encoding=65001, QuoteStyle=QuoteStyle.Csv]),
    Headers = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
    Required = {"EventID", "InvoiceID", "Customer", "InvoiceDate", "DueDate",
        "EventDate", "EventType", "Amount"},
    Missing = List.Difference(Required, Table.ColumnNames(Headers)),
    Checked = if List.IsEmpty(Missing) then Headers else
        error Error.Record("Missing ledger columns", Text.Combine(Missing, ", "), Missing),
    Defaults = {{"Region", "Unassigned"}, {"Segment", "Unassigned"},
        {"Collector", "Unassigned"}, {"RiskTier", "Unassigned"},
        {"DisputeDate", null}, {"PromiseDue", null}},
    Complete = List.Accumulate(Defaults, Checked, (state, item) =>
        if Table.HasColumns(state, {item{0}}) then state else
        Table.AddColumn(state, item{0}, each item{1})),
    TextColumns = {"EventID", "InvoiceID", "Customer", "Region", "Segment",
        "Collector", "RiskTier", "EventType"},
    Trimmed = Table.TransformColumns(Complete, List.Transform(TextColumns,
        (name) => {name, each if _ = null then null else Text.Trim(Text.From(_)), type text})),
    Dates = List.Accumulate({"InvoiceDate", "DueDate", "EventDate", "DisputeDate",
        "PromiseDue"}, Trimmed, (state, name) => Table.TransformColumns(state,
        {{name, each if _ = null or Text.Trim(Text.From(_)) = "" then null else
            Date.FromText(Text.From(_), [Format="yyyy-MM-dd", Culture="en-US"]), type date}})),
    Typed = Table.TransformColumnTypes(Dates, {{"Amount", Currency.Type}}, "en-US")
in
    Typed
