# DevicesWorld Diagnostic-60 Preparation Summary

> Current gate: **executable stages constructed and protocol frozen; targeted smoke review pending final human confirmation; no formal stage batch started**.

## Frozen experiment

- Final sample: **60 tasks**, with the single documented rank-42 replacement and no resampling.
- Decomposition: **235 stages** (`information_acquisition=149`, `environment_execution=86`).
- Evaluator ownership: `local_stage=108`, `local_guard=38`, `global_only=1`; the global-only evaluator remains excluded from Local-All.
- Semantic judge: `diagnostic60.semantic_handoff_judge.v2`, fixed model `gpt-5.5`, decoding, prompt, strict output schema, and audit sampling.
- Isolated budget: 30 Core-compatible recorded interaction steps and 600 seconds of agent execution after reset; setup/materialization, evaluation/judge, and cleanup use separate infrastructure timeouts.
- Prompt v2: three device-specific prompts use ordinary single-device task framing; experiment terminology remains internal to specs/logs.

## Materialized executable artifacts

| Artifact | Status |
| --- | --- |
| `diagnostic60_sampling_report.md` | original result-blind statistics retained; post-replacement Final-60 distribution added |
| `diagnostic60_gold_handoffs.jsonl` | 149 concrete minimal handoffs, each retaining a complete auditable source snapshot |
| `diagnostic60_gold_predecessor_states.jsonl` | 19 native-state/artifact predecessor references |
| `gold_states/` and `gold_artifacts/` | replayed Android/SmartHome state plus real HTML/ZIP artifacts |
| `diagnostic60_executable_stage_specs.jsonl` | 235 single-device executable specs |
| `scripts/experiments/diagnostic60_stage_runner.py` | one-stage execution, semantic judge, exact step accounting, and Local-All aggregation |
| `diagnostic60_validation_smoke_report.md` | representative static, evaluator, runtime, and remaining-blocker evidence |

## Construction validation

- Task schema: 235/235 pass; run-config schema: 235/235 pass.
- Information-stage own gold excluded: 149/149.
- Actual predecessor isolated outputs disabled: 235/235.
- Native predecessor state/artifact materialized: 19/19.
- Prompt v2 model-visible template/instruction framing: 235/235 pass.
- Minimal source projection: 8 explicit tabular selections and 2 structured document selections; 4 cross-stage join tables remain complete; audit evidence retained for 149/149 handoffs.
- Formal GPT-5.5 isolated-stage runs started: **0/235**.

## Next decision

Review the real runtime preflight results and any remaining infrastructure blockers, then provide explicit confirmation. The `al_tutorial_screenshot.S01` correction is complete and did not change its DAG. Do not launch the formal 235-stage batch before confirmation.
