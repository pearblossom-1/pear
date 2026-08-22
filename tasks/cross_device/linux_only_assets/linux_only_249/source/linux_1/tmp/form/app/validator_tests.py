import importlib.util
from pathlib import Path


CASES = [
    ("APP-0000", True),
    ("APP-1234", True),
    ("APP-9999", True),
    ("app-1234", False),
    ("App-1234", False),
    ("APP-123", False),
    ("APP-12345", False),
    ("APP-12A4", False),
    (" APP-1234", False),
    ("APP-1234 ", False),
    ("APP-１２３４", False),
    (1234, False),
]


def load_validator():
    path = Path(__file__).with_name("validator.py")
    spec = importlib.util.spec_from_file_location("approval_validator", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.is_approval_code


def main():
    check = load_validator()
    failures = [
        repr(value)
        for value, expected in CASES
        if check(value) is not expected
    ]
    if failures:
        print("failed values: " + ", ".join(failures))
        raise SystemExit(1)
    print(f"{len(CASES)} passed")


if __name__ == "__main__":
    main()
