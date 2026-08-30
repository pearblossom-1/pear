# Diagnostic-60 Executable-Stage Preparation

> Status: **constructed and protocol-frozen; formal 235-stage GPT-5.5 run not started**.

## Frozen inputs preserved

- Final Diagnostic-60: **60 tasks**; the existing rank-42 replacement is unchanged.
- Frozen decomposition: **235 stages** (`information_acquisition=149`, `environment_execution=86`).
- Dependency DAGs, stage boundaries, device assignments, evaluator ownership, and predecessor contracts were consumed without resampling or structural edits.
- Original evaluator ownership remains `local_stage=108`, `local_guard=38`, `global_only=1`.

## New executable artifacts

| Artifact | Contents |
| --- | --- |
| `diagnostic60_semantic_judge_v2.json` | frozen GPT-5.5 judge model/version, decoding, prompt, schema, and audit sampling protocol |
| `diagnostic60_isolated_stage_budget_policy.json` | uniform 30-step / 600-second agent-execution policy with separate infrastructure timeouts |
| `prompts/` | the Core-200 GPT-5.5 mother snapshot, three device-specific templates, hashes, notes, and unified diffs |
| `diagnostic60_gold_handoffs.jsonl` | 149 source-grounded minimal references plus complete auditable source snapshots |
| `diagnostic60_gold_predecessor_states.jsonl` | 19 materialized environment-predecessor edge states |
| `gold_states/` | replayed native Android/SmartHome predecessor states validated by their original local evaluators |
| `gold_artifacts/` | corrected validator HTML and exact selected-member release archive |
| `diagnostic60_executable_stage_specs.jsonl` | 235 runner-consumable single-device stage specifications |
| `scripts/experiments/diagnostic60_stage_runner.py` | one-stage launcher, semantic-judge integration, exact step accounting, and Local-All aggregation |
| `diagnostic60_validation_smoke_report.md` | targeted pre-run construction and execution smoke results |

## Gold isolation rule

- An information stage sees its task-provided source state but not its own gold reference.
- A downstream stage receives only declared gold predecessor inputs; it never receives the isolated predecessor's actual answer or state.
- Source provenance and complete raw evidence stay in `source_evidence_snapshot`; downstream stages and the semantic judge receive the task-relevant projection, with distractor rows/branches removed where the original instruction selects one record.
- Environment predecessor records reference replayed native state or real artifact bytes/structure, plus only the downstream-needed projection.
- The sole `global_only` evaluator remains task-global and is excluded from Local-All stage evaluation.

## Launcher interface

Run exactly one approved stage with:

```bash
python scripts/experiments/diagnostic60_stage_runner.py run \
  --repo-root . \
  --stage-id <task.SNN> \
  --result-dir <stage-result-directory> \
  --env-file <approved-env-file>
```

The launcher exits 0 for PASS, 1 for FAIL/error, and 2 for `UNCERTAIN`. Its `summarize` subcommand aggregates actual environment steps and Local-All after stage results exist.

## Formal-run gate

The S01 contract correction is recorded and the specs are constructed. Do not launch the full GPT-5.5 isolated-stage batch until the runtime preflight report is reviewed and human confirmation is recorded.
