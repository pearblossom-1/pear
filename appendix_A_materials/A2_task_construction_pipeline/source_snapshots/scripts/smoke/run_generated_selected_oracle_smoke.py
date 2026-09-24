from __future__ import annotations

import argparse
import contextlib
import json
import os
import sys
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
    "A+L": REPO_ROOT / "configs" / "cross_device" / "local_android_linux.json",
    "A+A+L": REPO_ROOT / "configs" / "cross_device" / "local_2android_linux.json",
    "A+L+L": REPO_ROOT / "configs" / "cross_device" / "local_android_2linux.json",
    "L+L": REPO_ROOT / "configs" / "cross_device" / "local_2linux.json",
    "A+A+L+L": REPO_ROOT / "configs" / "cross_device" / "local_2android_2linux.json",
}


def device_shape(task: dict[str, Any]) -> str:
    return "+".join("A" if device["type"] == "android" else "L" for device in task["devices"])


def run_config_for_task(task: dict[str, Any]) -> Path:
    shape = device_shape(task)
    if shape not in RUN_CONFIG_BY_SHAPE:
        raise ValueError(f"no_run_config_for_shape: {shape}")
    return RUN_CONFIG_BY_SHAPE[shape]


def load_oracle_setup(path: str | Path) -> list[dict[str, Any]]:
    with Path(path).expanduser().open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    if isinstance(data, list):
        return data
    if not isinstance(data, dict):
        raise ValueError("oracle_invalid: expected object or list")
    setup = data.get("positive_setup", data.get("setup"))
    if not isinstance(setup, list):
        raise ValueError("oracle_invalid: expected positive_setup list")
    for block in setup:
        if not isinstance(block, dict) or "device_id" not in block or not isinstance(block.get("config"), list):
            raise ValueError("oracle_invalid: each setup block needs device_id and config list")
    return setup


def dry_run_summary(task: dict[str, Any], oracle_setup: list[dict[str, Any]], oracle_path: Path) -> dict[str, Any]:
    return {
        "task_id": task["id"],
        "device_shape": device_shape(task),
        "run_config": str(run_config_for_task(task).relative_to(REPO_ROOT)),
        "oracle": str(oracle_path),
        "oracle_devices": sorted({block["device_id"] for block in oracle_setup}),
        "oracle_operations": sum(len(block.get("config", [])) for block in oracle_setup),
    }


def apply_oracle_setup(env: MultiDeviceEnv, oracle_setup: list[dict[str, Any]]) -> None:
    for block in oracle_setup:
        device_id = block["device_id"]
        if device_id not in env.runtimes:
            raise ValueError(f"oracle_invalid_device: {device_id}")
        # Runtime cleanup applies the same setup-style operations without
        # resetting the whole environment, which is exactly what an oracle
        # state injection needs after env.reset().
        env.runtimes[device_id].cleanup(block.get("config", []))


def run_one(task_path: Path, oracle_path: Path, result_dir: Path, runtime_log_file: Path | None = None) -> dict[str, Any]:
    task = load_task_config(task_path)
    oracle_setup = load_oracle_setup(oracle_path)
    run_config_path = run_config_for_task(task)
    run_config = load_run_config(run_config_path)
    result_dir.mkdir(parents=True, exist_ok=True)
    result: dict[str, Any] = dry_run_summary(task, oracle_setup, oracle_path)
    result["task"] = str(task_path)
    try:
        with redirected_runtime_logs(runtime_log_file):
            env = MultiDeviceEnv(
                task,
                run_config,
                artifact_dir=result_dir / "_artifacts" / task["id"],
            )
            try:
                env.start()
                env.reset()
                result["before"] = env.evaluate()
                apply_oracle_setup(env, oracle_setup)
                result["after"] = env.evaluate()
                env.cleanup()
                result["after_cleanup"] = env.evaluate()
            finally:
                env.close()
    except Exception as exc:
        result["error"] = f"{type(exc).__name__}: {exc}"

    result["success"] = result_succeeded(result)
    (result_dir / "smoke_result.json").write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")
    return result


def result_succeeded(result: dict[str, Any]) -> bool:
    if result.get("error"):
        return False
    return (
        result.get("before", {}).get("success") is False
        and result.get("after", {}).get("success") is True
        and result.get("after_cleanup", {}).get("success") is False
    )


@contextlib.contextmanager
def redirected_runtime_logs(log_path: Path | None):
    if log_path is None:
        yield
        return
    log_path.parent.mkdir(parents=True, exist_ok=True)
    with log_path.open("ab") as log_file:
        stdout_fd = os.dup(1)
        stderr_fd = os.dup(2)
        try:
            os.dup2(log_file.fileno(), 1)
            os.dup2(log_file.fileno(), 2)
            yield
        finally:
            os.dup2(stdout_fd, 1)
            os.dup2(stderr_fd, 2)
            os.close(stdout_fd)
            os.close(stderr_fd)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Run one generated selected task with a setup-style positive oracle.")
    parser.add_argument("--task", required=True)
    parser.add_argument("--oracle", required=True)
    parser.add_argument("--result-dir", required=True)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--runtime-log-file")
    args = parser.parse_args(argv)

    task_path = Path(args.task)
    oracle_path = Path(args.oracle)
    task = load_task_config(task_path)
    oracle_setup = load_oracle_setup(oracle_path)
    if args.dry_run:
        print(json.dumps(dry_run_summary(task, oracle_setup, oracle_path), indent=2, ensure_ascii=False))
        return 0

    result = run_one(
        task_path,
        oracle_path,
        Path(args.result_dir),
        Path(args.runtime_log_file) if args.runtime_log_file else None,
    )
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0 if result.get("success") else 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
