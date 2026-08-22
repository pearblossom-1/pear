from index_images import include, label_for, row_for


CASES = [
    (include("asset_a.png"), True),
    (include("PHOTO.JPG"), True),
    (include("scan.Jpeg"), True),
    (include("notes.txt"), False),
    (include("fake.png.txt"), False),
    (include("no_extension"), False),
    (label_for("kitchen_400x200.png"), "kitchen"),
    (label_for("/incoming/north_gate_640x480.JPG"), "north_gate"),
    (label_for("portrait.jpeg"), "portrait"),
    (row_for("/incoming/north_gate_640x480.JPG", 640, 480), {
        "file": "/incoming/north_gate_640x480.JPG",
        "width": 640,
        "height": 480,
        "label": "north_gate",
    }),
]


def main():
    failures = [str(index) for index, pair in enumerate(CASES, 1) if pair[0] != pair[1]]
    if failures:
        print("failed cases: " + ", ".join(failures))
        raise SystemExit(1)
    print(f"{len(CASES)} passed")


if __name__ == "__main__":
    main()
