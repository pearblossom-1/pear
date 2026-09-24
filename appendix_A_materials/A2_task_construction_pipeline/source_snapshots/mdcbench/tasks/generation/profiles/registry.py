from __future__ import annotations

from mdcbench.tasks.generation.profiles.linux_android import PROFILE as LINUX_ANDROID_PROFILE
from mdcbench.tasks.generation.profiles.base import GenerationProfile
from mdcbench.tasks.generation.profiles.smarthome import PROFILE as SMARTHOME_PROFILE
from mdcbench.tasks.generation.profiles.smarthome_mixed import PROFILE as SMARTHOME_MIXED_PROFILE


DEFAULT_PROFILE_NAME = "linux_android"

_PROFILES: dict[str, GenerationProfile] = {
    profile.name: profile
    for profile in (
        LINUX_ANDROID_PROFILE,
        SMARTHOME_PROFILE,
        SMARTHOME_MIXED_PROFILE,
    )
}


def get_profile(name: str = DEFAULT_PROFILE_NAME) -> GenerationProfile:
    try:
        return _PROFILES[name]
    except KeyError as exc:
        known = ", ".join(sorted(_PROFILES))
        raise ValueError(f"unknown generation profile {name!r}; known profiles: {known}") from exc


def get_active_profile(name: str = DEFAULT_PROFILE_NAME) -> GenerationProfile:
    return get_profile(name).require_active()


def list_profile_names(*, include_planned: bool = True) -> list[str]:
    profiles = _PROFILES.values()
    if not include_planned:
        profiles = [profile for profile in profiles if profile.status == "active"]
    return sorted(profile.name for profile in profiles)


def list_profiles(*, include_planned: bool = True) -> list[GenerationProfile]:
    return [get_profile(name) for name in list_profile_names(include_planned=include_planned)]
