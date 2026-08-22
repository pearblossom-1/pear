# Audio manifest produces transcript status handoff policy

Current approved source row: 943-A
Approval code: use the code in the matching phone evidence; the Linux row intentionally leaves it blank.
Owner: Grace Kim (Quality reviewer)
Required decision: Match by filename and recording date fields.
The transcript-status consumer reads one CSV row using this complete header:
`case_id,title,owner,phone,approval_code,selected_source,status,decision`

For this request, use the current row's exact values. Example shape (illustrative values only):
`EXAMPLE-1,Example title,Example Owner,+15550000000,EX00000,/tmp/example.csv,ready,Example decision`
Authority note: row 943-D is on hold. Similar owner details do not make it the
current source.
