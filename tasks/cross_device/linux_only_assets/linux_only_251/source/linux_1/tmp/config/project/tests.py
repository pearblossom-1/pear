from merge_config import merge


def main():
    base = {"debug": True, "db": {"host": "base", "port": 1}, "keep": "yes"}
    environment = {"db": {"host": "env", "pool": 4}, "region": "west"}
    override = {"debug": None, "db": {"port": 9}, "region": "east"}
    merged = merge(base, environment, override)
    cases = [
        (merged.get("debug", "missing"), "missing"),
        (merged["db"], {"host": "env", "port": 9, "pool": 4}),
        (merged["region"], "east"),
        (merged["keep"], "yes"),
        (base["db"], {"host": "base", "port": 1}),
        (merge({"a": {"b": 1}}, {}, {"a": {"b": None}}), {"a": {}}),
        (merge({"mode": "base"}, {"mode": "env"}, {}), {"mode": "env"}),
    ]
    failures = [str(index) for index, pair in enumerate(cases, 1) if pair[0] != pair[1]]
    if failures:
        print("failed cases: " + ", ".join(failures))
        raise SystemExit(1)
    print(f"{len(cases)} passed")


if __name__ == "__main__":
    main()
