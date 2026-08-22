# Climate fallback matrix

Use the live SmartHome capabilities to apply the first available fallback for each room.

| room | preferred_device | requested_mode | target_c | fallback_order |
|---|---|---|---:|---|
| office | air conditioner | cool | 24 | exact_target;mode_only;report |
| study | heater | heat | 22 | exact_target;report |
| guest room | climate device | heat | 22 | exact_target;report |

## Output schema

Save `/tmp/climate/fallback_result.json` as a JSON object with exactly one top-level field, `rooms`. `rooms` must contain exactly `office`, `study`, and `guest room`.

For an applied room, use exactly these fields:

- `status`: string; value `applied`
- `device`: string; controlled value `air conditioner` or `heater`
- `target_c`: number

For an unavailable room, use exactly these fields:

- `status`: string; value `unavailable`
- `reason`: string; value `no climate device`

Do not add any other fields.
