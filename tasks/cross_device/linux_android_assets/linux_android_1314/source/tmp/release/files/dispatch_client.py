"""Dispatch client for the approved REL-1314 package."""

def build_dispatch_payload(case_id: str, route: str) -> dict[str, str]:
    return {"case_id": case_id, "route": route, "release": "REL-1314"}
