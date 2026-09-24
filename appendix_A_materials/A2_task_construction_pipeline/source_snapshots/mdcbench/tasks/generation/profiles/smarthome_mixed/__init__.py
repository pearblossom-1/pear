"""SmartHome mixed-device task-generation profile placeholder."""
from __future__ import annotations

from mdcbench.tasks.generation.profiles.base import GenerationProfile


PROFILE = GenerationProfile(
    name="smarthome_mixed",
    status="planned",
    description="Mixed SmartHome plus Android/Linux profile; prompts and runtime interfaces are not enabled yet.",
)

__all__ = ["PROFILE"]
