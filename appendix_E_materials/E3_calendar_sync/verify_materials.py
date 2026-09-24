"""Read-only integrity and evidence checks for the selected E3 UFO3 run.

Run with Python 3 from any directory. No model, device, or network access.
"""
import hashlib
import json
import re
from pathlib import Path
from urllib.parse import unquote


CASE = Path(__file__).resolve().parent


def read(path):
    return json.loads(path.read_text(encoding="utf-8"))


def require(condition, message):
    if not condition:
        raise ValueError(message)


def strings(value):
    if isinstance(value, str):
        yield value
    elif isinstance(value, dict):
        for item in value.values():
            yield from strings(item)
    elif isinstance(value, list):
        for item in value:
            yield from strings(item)


def main():
    manifest = read(CASE / "material_integrity.json")
    inventory = read(CASE / "material_inventory.json")
    run = CASE / manifest["destination_directory"]
    originals = {entry["path"] for entry in manifest["files"]}
    require(len(originals) == len(manifest["files"]) == 410, "original file set")
    actual = {p.relative_to(run).as_posix() for p in run.rglob("*") if p.is_file()}
    require(actual == originals | set(manifest["additional_run_files"]), "run file set differs")
    credential_pattern = re.compile(
        r"-----BEGIN (?:[A-Z ]+)?PRIVATE KEY-----|\bsk-[A-Za-z0-9_-]{20,}\b|"
        r"\bgh[pousr]_[A-Za-z0-9]{20,}\b|Bearer [A-Za-z0-9_.-]{20,}",
        re.IGNORECASE,
    )
    screenshot_count = 0
    json_count = 0
    for entry in manifest["files"]:
        path = run / entry["path"]
        require(not path.is_symlink(), "unexpected symbolic link")
        content = path.read_bytes()
        require(len(content) == entry["bytes"], "size mismatch: " + entry["path"])
        require(hashlib.sha256(content).hexdigest() == entry["sha256"], "hash mismatch: " + entry["path"])
        if path.suffix == ".png":
            require(content.startswith(b"\x89PNG\r\n\x1a\n"), "PNG signature")
            screenshot_count += 1
        elif path.suffix in {".json", ".txt", ".yaml", ".jsonl"}:
            text = content.decode("utf-8")
            require(not credential_pattern.search(text), "credential-like value; inspect before publishing: " + entry["path"])
            if path.suffix == ".json":
                json.loads(text)
                json_count += 1
    require(screenshot_count == inventory["screenshots"] == 149, "screenshot count")
    require(sum(e["bytes"] for e in manifest["files"]) == inventory["original_bytes"], "byte total")
    require(inventory["original_files"] == len(originals), "inventory file count")

    result = read(run / "result.json")
    trajectory = read(run / "trajectory.json")
    ledger = read(run / "model_calls.json")
    evaluators = read(run / "evaluator_trace.json")["evaluators"]
    actions = [e for e in trajectory["events"] if e["event"] == "agent_step"]
    policy_calls = [e for e in trajectory["events"] if e["event"] == "policy_call_started"]
    require(len(actions) == 49 and [e["step_index"] for e in actions] == list(range(49)), "action count/indices")
    require(all(e["target_device_id"] == "android_0" and e["action"]["device_id"] == "android_0" and e["ok"] is True for e in actions), "device/action feedback")
    require(len(policy_calls) == len(ledger["calls"]) == result["policy_calls"] == 50, "policy/model call count")
    require(result["planner_calls"] == 1 and result["device_agent_calls"] == 49 and result["replans_attempted"] == 0, "call types")
    require(result["success"] is False and result["score"] == 0 and result["termination_reason"] == "max_steps", "task result")
    require(all(result[k] is True for k in ("initialization_success", "evaluation_success", "cleanup_success")), "lifecycle result")
    require(trajectory["events"][-1]["event"] == "step_limit", "terminal event")
    final_tasks = trajectory["orchestration"]["final_constellation"]["tasks"]
    require([(t["status"], t["attempts"]) for t in final_tasks] == [("RUNNING", 49), ("PENDING", 0), ("PENDING", 0)], "final plan")
    require(len(evaluators) == 2 and all(e["score"] == 0 and e["success"] is False for e in evaluators), "evaluator outcomes")
    require(evaluators[0]["actual"] is None and evaluators[1]["actual"] == "cache/mdcbench_linux_0_reset/week.csv", "raw evaluator evidence")

    call_dirs = sorted((run / "ufo3/calls").iterdir())
    require(len(call_dirs) == 50, "raw call directories")
    require(all((d / name).is_file() for d in call_dirs for name in ("messages.json", "response.txt", "call.json")), "raw call files")
    reference_count = 0
    for value in strings({"trajectory": trajectory, "ledger": ledger}):
        prefix = manifest["source_directory"] + "/"
        if value.startswith(prefix):
            require((run / value[len(prefix):]).exists(), "unresolved original artifact reference")
            reference_count += 1

    for path in (run / "config").iterdir():
        require(path.read_bytes() == (CASE / "task/config" / path.name).read_bytes(), "duplicate task config")
    canonical = read(CASE / "task/canonical_selected_attempt.json")["record"]
    selected = read(CASE / "main_experiment_selection.json")["record"]
    require(canonical["result_dir"] == manifest["source_directory"] == selected["run_ref"], "selected attempt source")
    require(selected["task_version"] == "sha256:" + hashlib.sha256((run / "config/task.json").read_bytes()).hexdigest(), "task snapshot version")
    for resource in read(CASE / "task/resources/provenance.json")["files"]:
        data = (CASE / "task/resources" / resource["local_path"]).read_bytes()
        require(len(data) == resource["bytes"] and hashlib.sha256(data).hexdigest() == resource["sha256"], "input resource hash")
    global_case = next(c for c in read(CASE.parent / "material_inventory.json")["cases"] if c["case"] == CASE.name)
    require(global_case == inventory, "global/per-case inventory mismatch")

    markdown_paths = list(CASE.rglob("*.md")) + [CASE.parent / "case_index.md", CASE.parent / "missing_materials.md"]
    link_count = 0
    for path in markdown_paths:
        for target in re.findall(r"\[[^\]\n]*\]\(([^)\n]+)\)", path.read_text(encoding="utf-8")):
            if re.match(r"^[a-z]+://|^#", target):
                continue
            target = unquote(target.split("#", 1)[0].strip("<>"))
            require((path.parent / target).exists(), "broken link: " + str(path) + " -> " + target)
            link_count += 1
    print(json.dumps({"ok": True, "original_files_verified": len(originals), "screenshots": screenshot_count,
                      "json_files_parsed": json_count, "policy_calls": len(policy_calls), "android_actions": len(actions),
                      "artifact_references_resolved": reference_count, "markdown_links_checked": link_count,
                      "input_resources_verified": 2}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
