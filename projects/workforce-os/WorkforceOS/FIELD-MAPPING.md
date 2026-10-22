# Workday field mapping

The model uses one record per Workday ID per Snapshot_Date. Map your approved export to these columns. All names and records in the included sample are fictional.

| Visual role | Model / export column | Type |
|---|---|---|
| id | Workday ID | string |
| snapshot | Snapshot_Date | dateTime |
| name | Worker Display Name | string |
| status | Worker Status | string |
| fte | Full Time Equivalent (FTE) | double |
| exclude | Exclude from Headcount | string |
| type | Worker Type | string |
| employeeType | Employee Type | string |
| hire | Latest Hire Date | dateTime |
| originalHire | Original Hire Date | dateTime |
| positionDate | Effective Date for Current Position | dateTime |
| manager | Is Manager | string |
| family | Job Family | string |
| title | Job Title | string |
| country | Work Country | string |
| region | Global Region | string |
| city | Work City | string |
| cost | Cost Center - Name | string |
| costId | Cost Center - ID | string |
| time | Time Type | string |
| grade | Job Grade - Number | string |
| managerId | Manager ID | string |
| level | Management Level according to Job Profile | string |
| entity | Government Reporting Entity | string |

Worker Display Name is a derived field; combine Legal First Name and Legal Last Name in your approved import if needed. Latest Hire Date is the sole tenure start date. Original Hire Date and current-position effective date are retained for future analysis, but do not drive tenure or imply mobility.
