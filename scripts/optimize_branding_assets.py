from pathlib import Path

from PIL import Image


SOURCE = Path("/home/ubuntu/webdev-static-assets/essay-sentinel-icon.png")
TARGETS = [
    Path("/home/ubuntu/essay-sentinel/assets/images/icon.png"),
    Path("/home/ubuntu/essay-sentinel/assets/images/splash-icon.png"),
    Path("/home/ubuntu/essay-sentinel/assets/images/favicon.png"),
    Path("/home/ubuntu/essay-sentinel/assets/images/android-icon-foreground.png"),
]


def main() -> None:
    with Image.open(SOURCE) as source:
        image = source.convert("RGBA")
        image.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
        for target in TARGETS:
            image.save(target, format="PNG", optimize=True, compress_level=9)
            print(f"{target.name}: {target.stat().st_size} bytes")


if __name__ == "__main__":
    main()
