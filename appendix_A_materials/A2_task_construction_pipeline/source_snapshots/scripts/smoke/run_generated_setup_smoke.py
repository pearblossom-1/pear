#!/usr/bin/env python3
"""Run setup/evaluate/cleanup smoke for generated linux-android tasks.

This is intentionally not a positive-oracle test. It validates that a generated
task can be reset on real runtimes and that its evaluators execute without
runtime/config errors in the initial state.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import traceback
from pathlib import Path
from typing import Any


REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from mdcbench.core.env import MultiDeviceEnv
from mdcbench.core.run_config import load_run_config
from mdcbench.core.task_config import load_task_config


RUN_CONFIG_BY_SHAPE = {
    "A+A": REPO_ROOT / "configs" / "cross_device" / "local_2android.json",
    "L+L": REPO_ROOT / "configs" / "cross_device" / "local_2linux.json",
    "A+L": REPO_ROOT / "configs" / "cross_device" / "local_android_linux.json",
    "A+A+L": REPO_ROOT / "configs" / "cross_device" / "local_2android_linux.json",
    "A+L+L": REPO_ROOT / "configs" / "cross_device" / "local_android_2linux.json",
    "A+A+L+L": REPO_ROOT / "configs" / "cross_device" / "local_2android_2linux.json",
}


def device_shape(task: dict[str, Any]) -> str:
    parts = []
    for device in task.get("devices", []):
        if device["type"] == "android":
            parts.append("A")
        elif device["type"] == "linux":
            parts.append("L")
        else:
            parts.append(device["type"][0].upper())
    return "+".join(parts)


def run_config_for_task(task: dict[str, Any]) -> Path:
    shape = device_shape(task)
    if shape not in RUN_CONFIG_BY_SHAPE:
        raise ValueError(f"no_run_config_for_shape: {shape}")
    return RUN_CONFIG_BY_SHAPE[shape]


def run_one(task_path: Path, result_dir: Path) -> dict[str, Any]:
    task = load_task_config(task_path)
    run_config_path = run_config_for_task(task)
    run_slug = re.sub(r"[^A-Za-z0-9_.-]+", "_", f"{task_path.parent.parent.name}__{task['id']}")[:180]
    run_dir = result_dir / run_slug
    run_dir.mkdir(parents=True, exist_ok=True)
    result: dict[str, Any] = {
        "task_path": str(task_path),
        "task_id": task["id"],
        "device_shape": device_shape(task),
        "run_config": str(run_config_path.relative_to(REPO_ROOT)),
    }
    env = MultiDeviceEnv(
        task,
        load_run_config(run_config_path),
        artifact_dir=run_dir / "artifacts",
    )
    try:
        env.start()
        reset_obs = env.reset(task)
        result["reset_observation_devices"] = sorted(reset_obs.get("observations", {}).keys())
        before = env.evaluate()
        result["before"] = before
        result["runtime_ok"] = True
        result["before_success"] = before.get("success")
        result["before_score"] = before.get("score")
    except Exception as exc:
        result["runtime_ok"] = False
        result["error"] = f"{type(exc).__name__}: {exc}"
        result["traceback"] = traceback.format_exc()
    finally:
        try:
            env.close()
        except Exception as exc:
            result.setdefault("cleanup_error", f"{type(exc).__name__}: {exc}")
    (run_dir / "setup_smoke_result.json").write_text(
        json.dumps(result, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    return result


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--task", action="append", required=True, help="Path to assembled_task.json. Repeatable.")
    parser.add_argument("--result-dir", default="runs/generated_setup_smoke")
    args = parser.parse_args(argv)

    result_dir = Path(args.result_dir)
    results = [run_one(Path(path), result_dir) for path in args.task]
    result_dir.mkdir(parents=True, exist_ok=True)
    summary = {
        "total": len(results),
        "runtime_ok": sum(1 for item in results if item.get("runtime_ok") is True),
        "runtime_failed": sum(1 for item in results if item.get("runtime_ok") is False),
        "results": results,
    }
    (result_dir / "summary.json").write_text(
        json.dumps(summary, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    print(json.dumps(summary, indent=2, ensure_ascii=False))
    return 0 if summary["runtime_failed"] == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
