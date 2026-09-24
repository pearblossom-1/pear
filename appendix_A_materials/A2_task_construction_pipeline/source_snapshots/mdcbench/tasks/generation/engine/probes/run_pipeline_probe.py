from __future__ import annotations

import argparse
import json
from pathlib import Path

from mdcbench.tasks.generation.llm_client import chat_completion, load_provider_config, make_openai_image_generator
from mdcbench.tasks.generation.profiles.registry import DEFAULT_PROFILE_NAME, get_active_profile, list_profile_names
from mdcbench.tasks.generation.engine.pipeline import run_deterministic_pipeline, run_model_pipeline
from mdcbench.tasks.generation.engine.prompts import DEFAULT_PROMPT_VARIANT


DEFAULT_MODEL = "gpt-5-mini"


def run_deterministic_record(
    *,
    work_dir: str | Path,
    profile_name: str = DEFAULT_PROFILE_NAME,
    deterministic_image_fallback: bool = False,
) -> dict:
    return {
        "mode": "deterministic_engine",
        "profile": profile_name,
        "pipeline": run_deterministic_pipeline(
            work_dir=work_dir,
            profile_name=profile_name,
            deterministic_image_fallback=deterministic_image_fallback,
        ),
    }


def run_model_record(
    *,
    provider_config: dict[str, str],
    model: str,
    work_dir: str | Path,
    chat_fn=chat_completion,
    prompt_variant: str = DEFAULT_PROMPT_VARIANT,
    profile_name: str = DEFAULT_PROFILE_NAME,
    deterministic_image_fallback: bool = False,
    image_generator=None,
) -> dict:
    return {
        "mode": "model_engine",
        "model": model,
        "profile": profile_name,
        "prompt_variant": prompt_variant,
        "pipeline": run_model_pipeline(
            sample=None,
            provider_config=provider_config,
            model=model,
            work_dir=work_dir,
            chat_fn=chat_fn,
            image_generator=image_generator,
            prompt_variant=prompt_variant,
            profile_name=profile_name,
            deterministic_image_fallback=deterministic_image_fallback,
        ),
    }


def run_model_batch_record(
    *,
    provider_config: dict[str, str],
    model: str,
    work_dir: str | Path,
    count: int,
    seed: int,
    prompt_variant: str = DEFAULT_PROMPT_VARIANT,
    profile_name: str = DEFAULT_PROFILE_NAME,
    chat_fn=chat_completion,
    pipeline_fn=run_model_pipeline,
    partial_out_path: str | Path | None = None,
    deterministic_image_fallback: bool = False,
    image_generator=None,
) -> dict:
    profile = get_active_profile(profile_name)
    sample_set = profile.require_sample_generator()(total_count=count, random_seed=seed)
    return run_model_samples_record(
        provider_config=provider_config,
        model=model,
        work_dir=work_dir,
        samples=sample_set["samples"],
        sample_set=sample_set,
        prompt_variant=prompt_variant,
        profile_name=profile.name,
        chat_fn=chat_fn,
        pipeline_fn=pipeline_fn,
        partial_out_path=partial_out_path,
        deterministic_image_fallback=deterministic_image_fallback,
        image_generator=image_generator,
    )


def run_model_samples_record(
    *,
    provider_config: dict[str, str],
    model: str,
    work_dir: str | Path,
    samples: list[dict],
    sample_set: dict | None = None,
    prompt_variant: str = DEFAULT_PROMPT_VARIANT,
    profile_name: str = DEFAULT_PROFILE_NAME,
    chat_fn=chat_completion,
    pipeline_fn=run_model_pipeline,
    partial_out_path: str | Path | None = None,
    deterministic_image_fallback: bool = False,
    image_generator=None,
) -> dict:
    profile = get_active_profile(profile_name)
    if sample_set is None:
        sample_set = {"total_count": len(samples), "samples": samples}
    root = Path(work_dir)
    records: list[dict] = []
    batch_record = {
        "mode": "model_engine_batch",
        "model": model,
        "profile": profile.name,
        "prompt_variant": prompt_variant,
        "sample_set": sample_set,
        "records": records,
    }
    for sample in sample_set["samples"]:
        print(f"running {sample['sample_id']} prompt_variant={prompt_variant}", flush=True)
        sample_work_dir = root / sample["sample_id"]

        def progress_fn(event: dict) -> None:
            active = {"sample_id": sample["sample_id"], **event}
            batch_record["active"] = active
            print(
                f"{sample['sample_id']} {event.get('stage')} {event.get('event')}",
                flush=True,
            )
            if partial_out_path is not None:
                _write_json_record(Path(partial_out_path), batch_record)

        try:
            pipeline = pipeline_fn(
                sample=sample,
                provider_config=provider_config,
                model=model,
                work_dir=sample_work_dir,
                chat_fn=chat_fn,
                image_generator=image_generator,
                prompt_variant=prompt_variant,
                profile_name=profile.name,
                progress_fn=progress_fn,
                deterministic_image_fallback=deterministic_image_fallback,
            )
        except Exception as exc:
            pipeline = {
                "status": "failed",
                "failure_stage": "exception",
                "stages": {},
                "exception": {
                    "type": type(exc).__name__,
                    "message": str(exc),
                },
            }
        records.append(
            {
                "sample_id": sample["sample_id"],
                "sample": sample,
                "status": pipeline.get("status"),
                "failure_stage": pipeline.get("failure_stage"),
                "pipeline": pipeline,
            }
        )
        print(
            f"finished {sample['sample_id']} status={pipeline.get('status')} "
            f"failure_stage={pipeline.get('failure_stage')}",
            flush=True,
        )
        batch_record["active"] = {
            "sample_id": sample["sample_id"],
            "stage": "sample",
            "event": "done",
            "status": pipeline.get("status"),
            "failure_stage": pipeline.get("failure_stage"),
        }
        if partial_out_path is not None:
            _write_json_record(Path(partial_out_path), batch_record)
    return batch_record


def load_samples_from_results(source: str | Path, sample_ids: list[str] | None = None) -> list[dict]:
    source_path = Path(source)
    paths = sorted(source_path.glob("*.json")) if source_path.is_dir() else [source_path]
    samples_by_id: dict[str, dict] = {}
    for path in paths:
        loaded = json.loads(path.read_text(encoding="utf-8"))
        for record in _records_from_json(loaded):
            sample_id = str(record.get("sample_id") or "")
            sample = record.get("sample")
            if sample_id and isinstance(sample, dict):
                samples_by_id.setdefault(sample_id, sample)
        for sample in _samples_from_sample_set(loaded):
            sample_id = str(sample.get("sample_id") or "")
            if sample_id:
                samples_by_id.setdefault(sample_id, sample)

    if sample_ids:
        missing = [sample_id for sample_id in sample_ids if sample_id not in samples_by_id]
        if missing:
            raise ValueError(f"samples not found in {source_path}: {', '.join(missing)}")
        return [samples_by_id[sample_id] for sample_id in sample_ids]
    return [samples_by_id[sample_id] for sample_id in sorted(samples_by_id)]


def _records_from_json(value: object) -> list[dict]:
    if isinstance(value, list):
        records: list[dict] = []
        for item in value:
            records.extend(_records_from_json(item))
        return records
    if not isinstance(value, dict):
        return []
    if isinstance(value.get("records"), list):
        return [record for record in value["records"] if isinstance(record, dict)]
    if value.get("sample_id") and value.get("sample"):
        return [value]
    return []


def _samples_from_sample_set(value: object) -> list[dict]:
    if not isinstance(value, dict):
        return []
    sample_set = value.get("sample_set")
    if not isinstance(sample_set, dict):
        return []
    samples = sample_set.get("samples")
    if not isinstance(samples, list):
        return []
    return [sample for sample in samples if isinstance(sample, dict)]


def _parse_sample_ids(value: str | None) -> list[str] | None:
    if not value:
        return None
    return [part.strip() for part in value.split(",") if part.strip()]


def _write_json_record(path: Path, record: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(record, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", default="deterministic", choices=["deterministic", "model"])
    parser.add_argument("--provider", default="gpt", choices=["gpt", "deepseek"])
    parser.add_argument("--model", default=DEFAULT_MODEL)
    parser.add_argument("--env", default=".env")
    parser.add_argument("--out", default="runs/generation_engine_probe/result.json")
    parser.add_argument("--work-dir", default="runs/generation_engine_probe/work")
    parser.add_argument("--count", type=int, default=1)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--samples-from", help="Existing result/rerun JSON file or round directory to rerun exact samples from.")
    parser.add_argument("--sample-ids", help="Comma-separated sample ids to select when --samples-from is provided.")
    parser.add_argument("--profile", default=DEFAULT_PROFILE_NAME, choices=list_profile_names())
    parser.add_argument(
        "--prompt-variant",
        default=DEFAULT_PROMPT_VARIANT,
        choices=[DEFAULT_PROMPT_VARIANT],
    )
    parser.add_argument(
        "--allow-deterministic-image-fallback",
        action="store_true",
        help="Allow local deterministic raster fallback for GPTImage2 assets when no image provider is configured. Intended for offline tests only.",
    )
    parser.add_argument(
        "--image-provider",
        default="none",
        choices=["none", "gpt"],
        help="Optional image generation provider for GPTImage2 raster assets.",
    )
    parser.add_argument(
        "--image-model",
        default="gpt-image-2",
        help="Image model name used when --image-provider=gpt.",
    )
    args = parser.parse_args()

    if args.mode == "deterministic":
        record = run_deterministic_record(
            work_dir=args.work_dir,
            profile_name=args.profile,
            deterministic_image_fallback=args.allow_deterministic_image_fallback,
        )
    else:
        provider_config = load_provider_config(args.env, args.provider)
        image_generator = (
            make_openai_image_generator(provider_config, model=args.image_model)
            if args.image_provider == "gpt"
            else None
        )
        if args.samples_from:
            samples = load_samples_from_results(args.samples_from, _parse_sample_ids(args.sample_ids))
            record = run_model_samples_record(
                provider_config=provider_config,
                model=args.model,
                work_dir=args.work_dir,
                samples=samples,
                sample_set={
                    "total_count": len(samples),
                    "samples": samples,
                    "source": args.samples_from,
                    "sample_ids": _parse_sample_ids(args.sample_ids),
                },
                prompt_variant=args.prompt_variant,
                profile_name=args.profile,
                partial_out_path=args.out,
                deterministic_image_fallback=args.allow_deterministic_image_fallback,
                image_generator=image_generator,
            )
        elif args.count == 1:
            record = run_model_record(
                provider_config=provider_config,
                model=args.model,
                work_dir=args.work_dir,
                prompt_variant=args.prompt_variant,
                profile_name=args.profile,
                deterministic_image_fallback=args.allow_deterministic_image_fallback,
                image_generator=image_generator,
            )
        else:
            record = run_model_batch_record(
                provider_config=provider_config,
                model=args.model,
                work_dir=args.work_dir,
                count=args.count,
                seed=args.seed,
                prompt_variant=args.prompt_variant,
                profile_name=args.profile,
                partial_out_path=args.out,
                deterministic_image_fallback=args.allow_deterministic_image_fallback,
                image_generator=image_generator,
            )
    out_path = Path(args.out)
    _write_json_record(out_path, record)
    print(f"wrote {out_path}")


if __name__ == "__main__":
    main()
