# Staging Launch Validator

Edit `/tmp/launch/validator.html` in VSCode. Its
`evaluateLaunchGate(checklist, playlistTracks)` function must return:

- `checklistReady`: true only when `checklist` contains exactly the approved
  operations checklist from the Markor note on the first phone.
- `audioReady`: true only when `playlistTracks` contains exactly the approved
  staging audio cues from the Retro Music playlist on the second phone.
- `launch_passed`: true only when both readiness flags are true.

Treat missing members, substitutions, duplicates, extras, and non-array inputs
as not ready. Use the current records on the two operations phones as the
approved launch inputs.

Copy the corrected, self-contained page to
`/home/user/launch/validator.html` on the staging Linux kiosk and use that page
for final validation.
