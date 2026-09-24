"""SmartHome task-generation profile placeholder."""
from __future__ import annotations

from mdcbench.tasks.generation.profiles.base import GenerationProfile


PROFILE = GenerationProfile(
    name="smarthome",
    status="planned",
    description="SmartHome-only task generation profile; sampling remains owned by the SmartHome task builder.",
)

__all__ = ["PROFILE"]
