from __future__ import annotations

import random
from typing import Any


DEVICE_POOLS: dict[str, list[str]] = {
    "2A": ["android_0", "android_1"],
    "2L": ["linux_0", "linux_1"],
    "1A+1L": ["android_0", "linux_0"],
    "1A+2L": ["android_0", "linux_0", "linux_1"],
    "2A+1L": ["android_0", "android_1", "linux_0"],
    "2A+2L": ["android_0", "android_1", "linux_0", "linux_1"],
}

ANDROID_SURFACES: tuple[str, ...] = (
    "android.markor_note",
    "android.files_download",
    "android.calendar_event",
    "android.task",
    "android.sms",
    "android.contacts",
    "android.photo_video",
    "android.audio_recording",
    "android.clock_alarm_timer",
    "android.retro_music_playlist",
    "android.osmand_favorite_marker",
    "android.simple_draw",
    "android.recipe",
)

LINUX_SURFACES: tuple[str, ...] = (
    "linux.text_markdown",
    "linux.csv",
    "linux.json",
    "linux.xlsx",
    "linux.odt_docx",
    "linux.odp_pptx",
    "linux.pdf",
    "linux.html_browser",
    "linux.thunderbird_draft",
    "linux.vscode_project",
    "linux.gimp_image",
    "linux.vlc_playback",
    "linux.zip_archive",
    "linux.terminal",
)

SETUP_VALUES = ("clean", "distractor")


def _device_family(device_id: str) -> str:
    if device_id.startswith("android_"):
        return "android"
    if device_id.startswith("linux_"):
        return "linux"
    return "unknown"


def validate_sample(sample: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    allowed_devices = {tuple(devices) for devices in DEVICE_POOLS.values()}
    if tuple(sample.get("devices", [])) not in allowed_devices:
        errors.append("devices must match one of the Android/Linux cross-device pools")
        return errors

    if sample.get("setup") not in SETUP_VALUES:
        errors.append("setup must be clean or distractor")

    device_surfaces = sample.get("device_surfaces")
    if not isinstance(device_surfaces, dict):
        errors.append("device_surfaces must be an object")
        return errors

    for device_id in sample["devices"]:
        surfaces = device_surfaces.get(device_id)
        if not isinstance(surfaces, list) or not surfaces:
            errors.append(f"{device_id} must have at least one surface")
            continue
        family = _device_family(device_id)
        for surface in surfaces:
            surface_text = str(surface)
            if family == "android" and not surface_text.startswith("android."):
                errors.append(f"{device_id} has non-Android surface {surface}")
            if family == "linux" and not surface_text.startswith("linux."):
                errors.append(f"{device_id} has non-Linux surface {surface}")
            if surface_text.startswith("android.") and surface not in ANDROID_SURFACES:
                errors.append(f"{device_id} uses unknown Android surface {surface}")
            if surface_text.startswith("linux.") and surface not in LINUX_SURFACES:
                errors.append(f"{device_id} uses unknown Linux surface {surface}")

    forbidden = {
        "topology",
        "domain",
        "scenario_domain",
        "pattern",
        "patterns",
        "source",
        "sink",
        "evaluator",
        "oracle",
        "difficulty",
    }
    for key in sorted(forbidden & set(sample)):
        errors.append(f"sample must not contain {key}")
    return errors


def generate_sample_set(total_count: int, random_seed: int) -> dict[str, Any]:
    rng = random.Random(random_seed)
    topology_names = list(DEVICE_POOLS)
    samples: list[dict[str, Any]] = []
    for index in range(1, total_count + 1):
        topology_name = topology_names[(index - 1) % len(topology_names)]
        devices = DEVICE_POOLS[topology_name]
        device_surfaces: dict[str, list[str]] = {}
        for device_id in devices:
            if device_id.startswith("android_"):
                device_surfaces[device_id] = [rng.choice(ANDROID_SURFACES)]
            else:
                device_surfaces[device_id] = [rng.choice(LINUX_SURFACES)]
        sample = {
            "sample_id": f"sample_{index:06d}",
            "devices": list(devices),
            "device_surfaces": device_surfaces,
            "setup": "distractor" if rng.random() < 0.25 else "clean",
        }
        errors = validate_sample(sample)
        if errors:
            raise ValueError(f"invalid generated sample {sample['sample_id']}: {errors}")
        samples.append(sample)

    return {
        "schema_version": "stage0.sample_set.v1",
        "sample_set_id": "sample_set_0001",
        "generator_version": "stage0.v1",
        "total_count": total_count,
        "random_seed": random_seed,
        "samples": samples,
    }

