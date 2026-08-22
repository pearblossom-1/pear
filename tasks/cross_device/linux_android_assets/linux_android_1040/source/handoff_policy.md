# Route review handoff policy

Current approved source row: 1040-A
Approval code: NX04005
Owner: Mira Patel (Release reviewer)
Required decision: Select the approved event row. The track list comes from the second phone's route review audio note.
The downstream route-handoff consumer reads `/tmp/music/decision.json`. Use this complete minimal schema (all fields required, all values strings):

```json
{
  "case_id": "1040-A",
  "owner": "Mira Patel",
  "approval_code": "NX04005",
  "selected_source": "event_schedule.csv#1040-A",
  "status": "ready"
}
```

`status` must be `ready` for an approved handoff. `selected_source` identifies the authoritative schedule row.
Authority note: row 1040-D is an older draft on hold; use the current approved
row even though the owner names are similar.
