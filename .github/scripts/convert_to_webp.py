"""Convert PNG/JPG images in module folders to WebP and update the module .json references.

Runs in the "Convert images to WebP" GitHub Action. Rules (same as CLAUDE.md):
- quality 80, downscaled to max 1920 px wide (mobile highlight images are 780 px and stay as they are)
- illustrations are left alone (they are SVG; a stray *illustration*.png is not touched)
- the original file is deleted, and "<name>.png" in <slug>/<slug>.json becomes "<name>.webp"
"""
import json
import os
import sys

from PIL import Image, ImageOps

MAX_WIDTH = 1920
QUALITY = 80
BITMAPS = (".png", ".jpg", ".jpeg")


def module_folders():
    for name in sorted(os.listdir(".")):
        if os.path.isdir(name) and os.path.isfile(os.path.join(name, f"{name}.json")):
            yield name


def convert(src, dst):
    with Image.open(src) as im:
        im = ImageOps.exif_transpose(im)
        if im.mode not in ("RGB", "RGBA"):
            im = im.convert("RGBA" if "transparency" in im.info or im.mode in ("LA", "P") else "RGB")
        if im.width > MAX_WIDTH:
            im = im.resize((MAX_WIDTH, round(im.height * MAX_WIDTH / im.width)), Image.LANCZOS)
        im.save(dst, "WEBP", quality=QUALITY, method=4)


def main():
    converted = 0
    for slug in module_folders():
        json_path = os.path.join(slug, f"{slug}.json")
        with open(json_path, encoding="utf-8") as f:
            text = f.read()
        changed = False
        for name in sorted(os.listdir(slug)):
            base, ext = os.path.splitext(name)
            if ext.lower() not in BITMAPS or "illustration" in name.lower():
                continue
            webp = f"{base}.webp"
            src, dst = os.path.join(slug, name), os.path.join(slug, webp)
            if os.path.exists(dst) and f'"{name}"' not in text:
                print(f"skip {src}: {webp} already exists")
                continue
            convert(src, dst)
            os.remove(src)
            if f'"{name}"' in text:
                text = text.replace(f'"{name}"', f'"{webp}"')
                changed = True
            converted += 1
            print(f"{src} -> {dst}")
        if changed:
            json.loads(text)  # stay valid JSON
            with open(json_path, "w", encoding="utf-8") as f:
                f.write(text)
    print(f"{converted} image(s) converted")
    return 0


if __name__ == "__main__":
    sys.exit(main())
