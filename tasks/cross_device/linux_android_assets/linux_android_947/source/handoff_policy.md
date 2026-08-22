# Audio file list recording handoff policy

Current approved source row: 947-A
Approval code: NX94733
Owner: Tao Lin (Inventory owner)

Required decision: Prepare the approved recording handoff for both the phone recording operator and the second-Linux transfer operator.

The `recording-handoff-router` consumes `/tmp/audio_file_list_creates_reco/decision.json`; the phone note is for the Android recording operator and `handoff.txt` is for the second-Linux transfer operator.

The JSON must contain exactly one handoff record with this complete minimal schema (an array or a `handoffs` array is accepted):
`{"case_id":"947-A","approval_code":"NX94733","owner":"Tao Lin","selected_source":"/tmp/audio_file_list_creates_reco/request_table.csv","status":"ready"}`

Authority note: row 947-D is on hold and is not authorized for transfer.
