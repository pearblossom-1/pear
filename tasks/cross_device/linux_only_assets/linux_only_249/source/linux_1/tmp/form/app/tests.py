import json
import subprocess
from pathlib import Path


def approval_result(value):
    script = (
        "const f=require('./validator.js').isApprovalCode;"
        f"process.stdout.write(JSON.stringify(f({json.dumps(value)})));"
    )
    result = subprocess.run(
        ["node", "-e", script],
        cwd=Path(__file__).parent,
        check=True,
        capture_output=True,
        text=True,
    )
    return json.loads(result.stdout)


def main():
    checks = [
        ("APP-0000", True),
        ("APP-1234", True),
        ("app-1234", False),
        ("App-1234", False),
        ("APP-123", False),
        ("APP-12345", False),
        ("APP-12A4", False),
        (" APP-1234", False),
        ("APP-1234 ", False),
    ]
    failures = [value for value, expected in checks if approval_result(value) is not expected]
    if failures:
        print(f"failed values: {failures}")
        raise SystemExit(1)
    print(f"{len(checks)} passed")


if __name__ == "__main__":
    main()
