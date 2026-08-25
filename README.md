# Pear Core200 review bundle

This repository contains the current Core200 task bundle and the existing per-task review notes.

## Authoritative task snapshot

- `experiments/human_validation1000/core200_manifest.jsonl` defines the 200-task set and order.
- `tasks/` contains the corresponding task JSON files and all task-specific attachments.
- `configs/` contains the run configurations referenced by the Core200 manifest.
- Paths are preserved from the MDCBench repository so `${repo_root}/...` references in task setup remain valid.

## Review-note status

The `core_tasks_001_010/` through `core_tasks_191_200/` Markdown files are existing review notes. They predate part of the current task update: 57 notes currently quote an instruction that differs from the authoritative task JSON. Treat the JSON and its attachments as authoritative until those notes are reviewed again.

## Updating MDCBench projects

See [`MDCBENCH_PROJECT_UPDATE_GUIDE.md`](MDCBENCH_PROJECT_UPDATE_GUIDE.md) for
the non-destructive multi-device task sync procedure and the optional Core200
entity-relation evaluator compatibility patch.
