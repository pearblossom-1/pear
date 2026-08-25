# Updating an MDCBench project from Pear

Pear is the exchange repository for the reviewed Core200 task snapshot. The
task files and their attachments are authoritative; the per-task review notes
may lag behind the JSON files.

This update also includes one optional runtime compatibility patch for
`mdcbench/evaluation/entity_relations.py`. No test file, experiment output, run
history, or frozen evaluation manifest is included.

## 1. Update the Pear checkout

Use a clean Pear checkout on each device:

```bash
git -C /path/to/pear switch main
git -C /path/to/pear pull --ff-only
git -C /path/to/pear rev-parse --short HEAD
```

The final command records the Pear revision used by that device. A Git revision
is sufficient for identifying this task snapshot; no per-task hash refresh is
required for this transfer.

## 2. Check the destination project first

```bash
git -C /path/to/MDC_Benchmark_2 status --short
git -C /path/to/MDC_Benchmark_2 branch --show-current
```

Do not reset, clean, stash, or delete existing work. If another session is
editing a destination file, use a separate worktree and merge later.

## 3. Copy the Core200 task bundle

```bash
rsync -a /path/to/pear/tasks/ /path/to/MDC_Benchmark_2/tasks/
rsync -a /path/to/pear/configs/ /path/to/MDC_Benchmark_2/configs/
```

Do not add `--delete`. This preserves local tasks, attachments, run history,
experiment results, and evidence that are outside the Pear bundle.

The Pear task snapshot already contains the cleanup-schema corrections for:

- `android_only_214`
- `android_only_234`
- `android_only_267`

## 4. Apply the evaluator compatibility patch

From the destination MDCBench repository:

```bash
git apply --check /path/to/pear/patches/core200_entity_relations.patch
git apply /path/to/pear/patches/core200_entity_relations.patch
```

If the check reports that the patch is already applied, no action is needed. If
the evaluator file has independent local edits, do not overwrite it. Merge the
patch manually, preserving local changes. The patch adds support for these
task-visible contracts:

- `required_patterns`
- `conflict_patterns`
- `ordered_entities`
- `semantic_record_table`

The test-only change used during integration is intentionally not distributed
through Pear.

## 5. Minimal local verification

```bash
python3 -m py_compile mdcbench/evaluation/entity_relations.py
git status --short
```

Projects with the MDCBench virtual environment available should additionally
load their Core200 task JSON files through `load_task_config`. Existing frozen
manifest or smoke-evidence checks may still describe an older experiment
snapshot; this transfer does not rewrite those historical records.

## 6. Integrate without disturbing other device work

Commit the synchronized task files and the evaluator merge on a local branch,
then merge or cherry-pick that commit into the device's integration branch.
Resolve overlapping task/runtime edits explicitly. Do not solve conflicts by
replacing the whole worktree or deleting untracked evidence.
