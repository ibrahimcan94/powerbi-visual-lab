// Replace the synthetic partition with this query after mapping the export fields.
// Replace ExportPath locally. Keep credentials outside source code.
let
    ExportPath = "C:\Workday\Workforce.csv",
    Raw = Csv.Document(File.Contents(ExportPath), [Delimiter=",", Encoding=65001, QuoteStyle=QuoteStyle.Csv]),
    Source = Table.PromoteHeaders(Raw, [PromoteAllScalars=true]),
    Typed = Table.TransformColumnTypes(Source, {{"Workday ID", type text}, {"Snapshot_Date", type date}, {"Worker Display Name", type text}, {"Worker Status", type text}, {"Full Time Equivalent (FTE)", type number}, {"Exclude from Headcount", type text}, {"Worker Type", type text}, {"Employee Type", type text}, {"Latest Hire Date", type date}, {"Original Hire Date", type date}, {"Effective Date for Current Position", type date}, {"Is Manager", type text}, {"Job Family", type text}, {"Job Title", type text}, {"Work Country", type text}, {"Global Region", type text}, {"Work City", type text}, {"Cost Center - Name", type text}, {"Cost Center - ID", type text}, {"Time Type", type text}, {"Job Grade - Number", type text}, {"Manager ID", type text}, {"Management Level according to Job Profile", type text}, {"Government Reporting Entity", type text}}, "en-US"),
    Clean = Table.TransformColumns(Typed, {{"Workday ID", each if _ = null then null else Text.Trim(_), type text}, {"Worker Status", each if _ = null then "" else Text.Trim(_), type text}, {"Exclude from Headcount", each if _ = null then "No" else Text.Trim(_), type text}}),
    DistinctRows = Table.Distinct(Clean),
    Keys = Table.Group(DistinctRows, {"Workday ID", "Snapshot_Date"}, {{"Records", each Table.RowCount(_), Int64.Type}}),
    BadKeys = Table.SelectRows(Keys, each [Workday ID] = null or [Workday ID] = "" or [Snapshot_Date] = null or [Records] > 1),
    Checked = if Table.RowCount(BadKeys) > 0 then error "Missing keys or conflicting worker/snapshot records. Resolve them before refreshing." else DistinctRows
in
    Checked