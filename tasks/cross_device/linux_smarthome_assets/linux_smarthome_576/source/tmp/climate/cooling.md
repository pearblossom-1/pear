# Cooling selection rule

Review occupied rooms with air conditioners. Select at most one room: the hottest eligible room above 27 C.

For the selected room, cool to 24 C and save the decision details in `/tmp/climate/decision.json`.

## Facility decision JSON schema

The JSON object uses exactly these four fields and no others:

- `selected_room`: string
- `observed_temperature_c`: number
- `action`: string
- `reason_code`: string

For the room selected by this policy, use the controlled values:

- `action` = `"cool to 24 C"`
- `reason_code` = `"hottest_occupied_coolable_room"`
