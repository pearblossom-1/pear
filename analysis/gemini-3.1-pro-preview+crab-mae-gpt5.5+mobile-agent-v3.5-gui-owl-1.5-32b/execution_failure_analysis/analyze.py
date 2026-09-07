"""Offline analysis of three explicitly selected main runs; never changes inputs.

All paths are resolved from this repository, no device or model access is used.
JSON paths printed by trace are zero-based and point into the original files.
"""
import argparse
import csv
import itertools
import json
import statistics
import sys
from collections import Counter, defaultdict
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

REPO = Path(__file__).resolve().parents[3]
OUT = Path(__file__).resolve().parent
RUNS = REPO / 'runs/core200-rerun-20260826'
MODELS = {
    'gemini': ('Gemini 3.1 Pro Preview', 'gemini-3.1-pro-preview-lite'),
    'crab': ('Crab-MAE (GPT-5.5)', 'crab-mae-gpt55-core200'),
    'mobile': ('Mobile-Agent-v3.5 (GUI-Owl-1.5-32B-Instruct)', 'mobile-agent-v3.5-gui-owl15-32b'),
}
DEPLOYMENT_ROOTS = (
    'D:/MDC_Benchmark_2/workflow/integration_worktrees/core200-real200-real300-submit-20260826',
    'D:/MDC_Benchmark_2/workflow/integration_worktrees/core200-crab-mae-gpt55-rerun-20260831',
    'D:/MDC_Benchmark_2/w/ma35',
)
CASE_NOTES = {
    ('gemini', 17): ('G1', 'body_candidate', 'Wrong source note propagated into the document.'),
    ('gemini', 28): ('G2', 'appendix_candidate', 'Fields eventually filled; submit coordinates missed the button.'),
    ('crab', 192): ('C1', 'body_candidate', 'Different appliance substituted within home_0.'),
    ('crab', 146): ('C2', 'body_candidate', 'Repeated same-environment multi-action rejection; no Home command executed.'),
    ('mobile', 7): ('M1', 'body_candidate', 'Repeated Python syntax error with no effective repair.'),
    ('mobile', 12): ('M2', 'appendix_candidate', 'Protocol error limit invoked adapter-generated done.'),
    ('gemini', 7): ('S1', 'success_control', 'Same CSV-to-JSON task; successful recorded command and evaluation.'),
    ('gemini', 192): ('S2', 'success_control', 'Exact plain-light target retained; infeasibility reported.'),
    ('gemini', 178): ('X1', 'excluded_scoring_question', 'Historical test output says 12 passed; raw FAIL retained, no rescoring.'),
    ('gemini', 43): ('X2', 'excluded_scoring_question', 'Blocking decision and absent order recorded; wording-dependent failure not used.'),
    ('crab', 193): ('X3', 'excluded_insufficient_evidence', 'Initial batch errors recovered; future light-power effect not independently verified.'),
    ('crab', 132): ('X4', 'excluded_scope_boundary', 'Required schedule cancelled; additional device changes trigger preservation guards. Not used as a clear necessary-goal failure.'),
}


def read(p):
    return json.loads(Path(p).read_text(encoding='utf-8-sig'))


def ref(p):
    try:
        return Path(p).resolve().relative_to(REPO).as_posix()
    except ValueError:
        return str(p)


def root(key):
    return RUNS / MODELS[key][1] / 'PC-20260130VLZZ/run_01'


def records(key):
    return read(root(key) / 'summary.json')['records']


def selected(key, ident):
    return next(r for r in records(key) if str(r['lite_index']) == str(ident) or r['task_id'] == ident)


def compact(x, limit=1200):
    s = json.dumps(x, ensure_ascii=False, separators=(',', ':'))
    return s if not limit or len(s) <= limit else s[:limit] + ' ...[truncated for navigation only]'


def event_view(e, obs=False, limit=1200):
    result = {k: e[k] for k in ('event','step_index','coordination_round','action','ok','done','info',
                               'error','thought') if k in e}
    if e.get('event') == 'coordination_round':
        dg = e.get('diagnostics', {})
        result['model_response'] = e.get('model_response')
        result['coordination_errors'] = dg.get('coordination_errors')
        result['main_agent_output'] = dg.get('main_agent_output')
    if obs:
        result['observation'] = e.get('observation')
    return compact(result, limit)


def inventory():
    data = {k: {r['task_id']: r for r in records(k)} for k in MODELS}
    for tid, r in data['gemini'].items():
        print(r['lite_index'], tid, ' | '.join(
            f'{k}: {m[tid]["score"]} {m[tid]["steps"]} {m[tid].get("termination_reason", "unknown")}'
            for k, m in data.items()))


def trace(key, ident, obs=False, limit=1200, start=0, end=None):
    r = selected(key, ident)
    d = Path(r['result_dir'])
    task = read(d / 'config/task.json')
    print('RUN', ref(d))
    print('TASK', compact({k: task.get(k) for k in ('id','instruction','devices')}, 0))
    print('RESULT', compact(read(d / 'result.json'), 0))
    tr = read(d / 'trajectory.json')
    for i, e in enumerate(tr['events']):
        if i < start or (end is not None and i >= end):
            continue
        print(f'events[{i}]', event_view(e, obs, limit))
    ev = read(d / 'evaluator_trace.json')
    for i, e in enumerate(ev.get('evaluators', [])):
        print(f'evaluators[{i}]', compact(e, limit))


def differing_paths(a, b, path=''):
    if type(a) is not type(b):
        return [path]
    if isinstance(a, dict):
        return [p for k in sorted(set(a) | set(b)) for p in (
            differing_paths(a[k], b[k], f'{path}/{k}') if k in a and k in b else [f'{path}/{k}'])]
    if isinstance(a, list):
        if len(a) != len(b):
            return [path + '/length']
        return [p for i, (x, y) in enumerate(zip(a, b)) for p in differing_paths(x, y, f'{path}/{i}')]
    return [] if a == b else [path]


def normalize_deployment_paths(x):
    """Compare configuration contents, not files currently referenced by them.

    Only replace the three observed host checkout prefixes for task asset paths.
    Do not normalize guest paths, field values, semantics, or arbitrary strings.
    """
    if isinstance(x, dict):
        return {k: normalize_deployment_paths(v) for k, v in x.items()}
    if isinstance(x, list):
        return [normalize_deployment_paths(v) for v in x]
    if isinstance(x, str):
        path = x.replace('\\', '/')
        for prefix in DEPLOYMENT_ROOTS:
            if path.startswith(prefix + '/tasks/'):
                return '<CHECKOUT>' + path[len(prefix):]
    return x


def aggregate(rs):
    return dict(n=len(rs), passed=sum(r['adopted_result'] == 'PASS' for r in rs),
                success_rate=sum(r['adopted_result'] == 'PASS' for r in rs)/len(rs),
                mean_score=statistics.mean(r['adopted_score'] for r in rs),
                mean_steps=statistics.mean(r['steps'] for r in rs),
                median_steps=statistics.median(r['steps'] for r in rs),
                mean_duration_s=statistics.mean(r['duration'] for r in rs),
                median_duration_s=statistics.median(r['duration'] for r in rs),
                terminations=dict(Counter(r['termination_reason'] for r in rs)))


def build(write=False):
    rows, tasks, mats, eval_specs, metadata = [], {}, {}, {}, {}
    for key, (name, _) in MODELS.items():
        tasks[key], mats[key], eval_specs[key] = {}, {}, {}
        metadata[key] = read(root(key) / 'run_metadata.json')
        for r in records(key):
            d = Path(r['result_dir'])
            raw = read(d / 'result.json')
            t = read(d / 'config/task.json')
            mt = read(d / 'config/materialized_task.json')
            et = read(d / 'evaluator_trace.json')
            tid = r['task_id']
            tasks[key][tid], mats[key][tid] = t, mt
            eval_specs[key][tid] = [e.get('raw_evaluator') for e in et.get('evaluators', [])]
            assert r['success'] == raw['success'], (key, tid, 'success mismatch')
            assert abs(r['score'] - raw['score']) < 1e-6, (key, tid, 'score mismatch')
            assert raw['task_id'] == tid == t['id']
            devs = t['devices']
            types = sorted({v['type'] for v in devs})
            case_id, case_use, note = CASE_NOTES.get((key, r['lite_index']), ('', 'not_close_read', ''))
            rows.append(dict(
                model=name, baseline_key=key, task_id=tid, lite_index=r['lite_index'],
                selected_attempt=d.name, run_ref=ref(d), task_version='unknown; historical config/task.json retained',
                result_basis='formal run_01 summary.records selection; matching result.json',
                raw_result='PASS' if raw['success'] else 'FAIL',
                adopted_result='PASS' if raw['success'] else 'FAIL',
                evaluation_status='recorded_automatic; no applicable confirmed adjudication located; not reaudited',
                raw_score=raw['score'], adopted_score=raw['score'],
                score_basis='selected attempt recorded automatic score; no rescoring',
                steps=raw['steps'], duration=raw['duration_s'],
                termination_reason=raw.get('termination_reason') or 'unknown',
                summary_termination_reason=r.get('termination_reason') or 'unknown',
                recorded_run_status=r.get('status', 'unknown'),
                returncode=r.get('returncode'),
                device_count=len(devs), device_types='+'.join(types),
                device_instances=compact(devs, 0), metadata_ref=ref(d / 'config/task.json'),
                materialized_task_ref=ref(d / 'config/materialized_task.json'),
                result_ref=ref(d / 'result.json'), evaluator_trace_ref=ref(d / 'evaluator_trace.json'),
                trajectory_ref=ref(d / 'trajectory.json'), run_metadata_ref=ref(root(key) / 'run_metadata.json'),
                time_limited=raw.get('time_limited'), environment_actions=raw.get('environment_actions'),
                coordination_rounds=raw.get('coordination_rounds'),
                summary_ref=ref(root(key) / 'summary.json'),
                case_id=case_id, case_use=case_use, interpretation_note=note,
            ))
    assert len(rows) == 600 and len({(r['model'], r['task_id']) for r in rows}) == 600
    report = {'overall': {}, 'by_device_types': {}, 'by_device_count': {}, 'pairs': {},
              'pairs_without_new_scoring_questions': {}, 'comparability': {}}
    for key in MODELS:
        rs = [r for r in rows if r['baseline_key'] == key]
        report['overall'][key] = aggregate(rs)
        for field in ('device_types', 'device_count'):
            groups = defaultdict(list)
            for r in rs:
                groups[r[field]].append(r)
            report['by_' + field][key] = {g: aggregate(v) for g, v in sorted(groups.items())}
    for a, b in itertools.combinations(MODELS, 2):
        diffs = {}
        counts = Counter()
        mat_diffs, ev_diffs = Counter(), Counter()
        paired_rows = {}
        clear_counts, separated = Counter(), []
        for tid in tasks[a]:
            dt = differing_paths(tasks[a][tid], tasks[b][tid])
            if dt:
                diffs[tid] = dt
            mat_diffs.update(differing_paths(mats[a][tid], mats[b][tid]))
            ev_diffs.update(differing_paths(eval_specs[a][tid], eval_specs[b][tid]))
            x = next(r for r in rows if r['baseline_key'] == a and r['task_id'] == tid)
            y = next(r for r in rows if r['baseline_key'] == b and r['task_id'] == tid)
            c = ('both_pass' if x['adopted_result'] == y['adopted_result'] == 'PASS' else
                 'both_fail' if x['adopted_result'] == y['adopted_result'] == 'FAIL' else
                 'only_' + a if x['adopted_result'] == 'PASS' else 'only_' + b)
            counts[c] += 1
            paired_rows[tid] = c
            if 'excluded_scoring_question' in (x['case_use'], y['case_use']):
                separated.append({'task_id': tid, 'raw_pair': c,
                                  'reason': 'incidental scoring question; no result change'})
            else:
                clear_counts[c] += 1
        report['pairs'][a + '+' + b] = dict(counts)
        report['pairs_without_new_scoring_questions'][a + '+' + b] = {
            'n': sum(clear_counts.values()), 'counts': dict(clear_counts), 'separate': separated}
        report['comparability'][a + '+' + b] = dict(
            exact_task_equal=200-len(diffs), task_diffs=diffs,
            materialized_diff_paths=dict(mat_diffs), evaluator_spec_diff_paths=dict(ev_diffs),
            normalized_materialized_equal=sum(normalize_deployment_paths(mats[a][tid]) ==
                                             normalize_deployment_paths(mats[b][tid]) for tid in tasks[a]),
            normalized_evaluator_spec_equal=sum(normalize_deployment_paths(eval_specs[a][tid]) ==
                                               normalize_deployment_paths(eval_specs[b][tid]) for tid in tasks[a]),
            boundary='configuration comparison only; no historical asset-byte or evaluator-implementation equivalence asserted')
    report['checks'] = {
        'rows': len(rows),
        'statuses': dict(Counter(r['recorded_run_status'] for r in rows)),
        'returncodes': dict(Counter(r['returncode'] for r in rows)),
        'summary_raw_termination_mismatches': [r['run_ref'] for r in rows if
                                             r['summary_termination_reason'] != r['termination_reason']],
        'time_flag_reason_mismatches': [r['run_ref'] for r in rows if
                                       bool(r['time_limited']) != (r['termination_reason'] == 'time_limit')],
        'max_steps_flag_not_50': [r['run_ref'] for r in rows if
                                r['termination_reason'] == 'max_steps' and r['steps'] != 50],
    }
    if write:
        with (OUT / 'execution_results.csv').open('w', encoding='utf-8-sig', newline='') as f:
            w = csv.DictWriter(f, fieldnames=list(rows[0]))
            w.writeheader()
            w.writerows(rows)
        (OUT / 'aggregate_support.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print(json.dumps({k: v for k, v in report.items() if k != 'comparability'}, ensure_ascii=False, indent=2))
    print('COMPARABILITY', compact({p: v['exact_task_equal'] for p, v in report['comparability'].items()}, 0))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('mode', choices=['inventory', 'trace', 'build'])
    parser.add_argument('--model', choices=list(MODELS))
    parser.add_argument('--task')
    parser.add_argument('--obs', action='store_true')
    parser.add_argument('--limit', type=int, default=1200)
    parser.add_argument('--start', type=int, default=0)
    parser.add_argument('--end', type=int)
    parser.add_argument('--write', action='store_true')
    args = parser.parse_args()
    if args.mode == 'inventory':
        inventory()
    elif args.mode == 'trace':
        trace(args.model, args.task, args.obs, args.limit, args.start, args.end)
    else:
        build(args.write)
