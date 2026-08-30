# Diagnostic-60 Stage Evaluation Method Proposal

> Status: **pending human review; not frozen**. This document defines the proposed protocol only and does not authorize a model run.

## Evaluator assignment

- Original evaluator references assigned: **146** total; **127** are scored in the original tasks, and **32** have a guard role (the categories overlap).
- Information-acquisition stages using the semantic judge: **148**.
- Each original evaluator belongs to exactly one stage. Environment-changing stages reuse their task's evaluator subset; guard checks stay with the local stage whose behavior they constrain.
- An information stage passes only when the semantic judge returns `PASS` and every scored original guard assigned to that stage passes.
- A target/decision stage passes its programmatic subset only when every scored evaluator in that subset passes. Unscored guards are retained as diagnostics and must not be promoted to scoring without a separate research decision.

## Fixed semantic judge v1

Proposed judge ID: `diagnostic60.semantic_handoff_judge.v1`.

The judge receives only:

1. the original task instruction;
2. the reviewed stage goal and expected-handoff contract;
3. the reviewed gold handoff for this information stage;
4. the model's reported stage output.

It must not receive the E2E model trajectory, E2E score, failure label, or another stage's actual output.

Proposed fixed prompt:

```text
You are evaluating an isolated information-acquisition stage in a device-level
decomposition experiment.

Decide whether CANDIDATE preserves all and only the task-relevant information
needed by the declared downstream stages when compared with GOLD.

Use these criteria:
1. Correctness: no material factual error or wrong selection.
2. Sufficiency: every fact needed for downstream execution is present.
3. No material distortion: wording differences are allowed, but a downstream
   executor following CANDIDATE must not be led to a wrong action or omission.

Return exactly one label and one short reason:
PASS — correct and sufficient.
FAIL — incorrect, missing a necessary fact, or materially misleading.
UNCERTAIN — the supplied gold/reference is insufficient to decide reliably.

Do not judge writing style, completeness beyond the handoff contract, or the
success of any other stage.
```

Required output schema:

```json
{"label":"PASS|FAIL|UNCERTAIN","reason":"one concise evidence-based reason"}
```

The judge model/version, decoding settings, and prompt text must be frozen before the first run. `UNCERTAIN` cases and a predeclared audit sample of PASS/FAIL cases go to human review; the prompt is not adjusted after seeing outcomes.

## Gold handoff and initialization

- Information predecessor: inject the reviewed gold semantic handoff. Never inject the predecessor's actual isolated-run answer.
- Environment predecessor: initialize the affected device(s) to the predecessor's gold postcondition using the task oracle when available and the original evaluator contract as the verification target.
- Cross-device artifact dependency: materialize the exact gold artifact through the intended transfer fixture/channel before the downstream device-local stage; do not replace it with a prose summary when bytes or document structure matter.
- A downstream stage starts from the original task setup subset plus only its declared predecessor overlays. Unrelated final outcomes from sibling stages must not be pre-populated.
- The proposal records `pending_human_review` where a gold semantic handoff still has to be written. No executable stage may be generated until those entries are resolved.

## Stage result record

Each eventual isolated run should store: task ID, stage ID, frozen stage instruction, predecessor IDs, gold-handoff reference, initialization reference, trajectory, model stage output, evaluator/judge result, steps, and termination reason.

## Aggregation after the future run

- `Stage Success`: mean pass rate across isolated stages; report semantic-judge `UNCERTAIN` separately until adjudicated.
- `Local-All(task)=1` only if every stage for the task passes.
- Compare the same 60 tasks' `Local-All` and version-matched E2E success.
- `Conditional E2E`: E2E success among tasks with `Local-All=1`.
- `Composition Gap = Local-All Success Rate - E2E Success Rate` (percentage points), described as a cross-device/end-to-end composition gap.
