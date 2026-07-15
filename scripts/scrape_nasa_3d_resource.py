from __future__ import annotations

import json
import re
from html import unescape
from pathlib import Path
from urllib.parse import unquote, urlparse
from urllib.request import Request, urlopen


TARGET_URL = "https://science.nasa.gov/3d-resources/explorer-jupiter-c-rocket/"
OUTPUT_ROOT = Path(__file__).resolve().parents[1] / "scraped" / "nasa" / "explorer-jupiter-c-rocket"


def fetch_text(url: str) -> str:
    request = Request(
        url,
        headers={
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/126.0.0.0 Safari/537.36"
            )
        },
    )
    with urlopen(request) as response:
        return response.read().decode("utf-8", errors="replace")


def fetch_bytes(url: str) -> bytes:
    request = Request(
        url,
        headers={
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/126.0.0.0 Safari/537.36"
            )
        },
    )
    with urlopen(request) as response:
        return response.read()


def extract(pattern: str, text: str, default: str = "") -> str:
    match = re.search(pattern, text, re.S | re.I)
    if not match:
        return default
    return unescape(match.group(1).strip())


def safe_name_from_url(url: str) -> str:
    parsed = urlparse(url)
    filename = unquote(Path(parsed.path).name)
    return filename or "download.bin"


def main() -> None:
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)

    html = fetch_text(TARGET_URL)
    (OUTPUT_ROOT / "page.html").write_text(html, encoding="utf-8")

    title = extract(r"<title>(.*?)</title>", html)
    heading = extract(r"<h1[^>]*>(.*?)</h1>", html)
    published_at = extract(r'article:published_time" content="([^"]+)"', html)
    updated_at = extract(r'article:modified_time" content="([^"]+)"', html)
    og_image = extract(r'property="og:image" content="([^"]+)"', html)
    glb_url = extract(r'<model-viewer[^>]*\ssrc="([^"]+\.glb)"', html)
    poster_url = extract(r'<model-viewer[^>]*\sposter="([^"]+)"', html)
    source = extract(r"<h4 class=\"label\">Source</h4>\s*<p>(.*?)</p>", html)
    github_repo = extract(
        r"<h4 class=\"label\">GitHub Repository</h4>\s*<p><a href=\"([^\"]+)\"",
        html,
    )
    download_name = extract(r"<h2 class=\"heading-22\">(.*?)</h2>", html)
    download_size = extract(r'<p class="p-sm">\s*\((.*?)\)</p>', html)
    author = extract(r'twitter:data1" content="([^"]+)"', html)

    poster_bytes = fetch_bytes(poster_url) if poster_url else b""
    glb_bytes = fetch_bytes(glb_url) if glb_url else b""

    poster_name = safe_name_from_url(poster_url) if poster_url else "poster.png"
    glb_name = safe_name_from_url(glb_url) if glb_url else "model.glb"

    if poster_bytes:
        (OUTPUT_ROOT / poster_name).write_bytes(poster_bytes)
    if glb_bytes:
        (OUTPUT_ROOT / glb_name).write_bytes(glb_bytes)

    manifest = {
        "title": title,
        "heading": heading,
        "url": TARGET_URL,
        "author": author,
        "source_credit": source,
        "published_at": published_at,
        "updated_at": updated_at,
        "github_repository": github_repo,
        "og_image_url": og_image,
        "poster_url": poster_url,
        "poster_file": poster_name,
        "glb_url": glb_url,
        "glb_file": glb_name,
        "download_name": download_name,
        "download_size_label": download_size,
        "note": "Local reference only. NASA content preserved for non-commercial internal use.",
    }
    (OUTPUT_ROOT / "metadata.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    summary = "\n".join(
        [
            "NASA 3D resource scraped successfully.",
            f"Title: {title}",
            f"Model: {glb_name}",
            f"Poster: {poster_name}",
            f"Output: {OUTPUT_ROOT}",
        ]
    )
    (OUTPUT_ROOT / "README.txt").write_text(summary, encoding="utf-8")
    print(summary)


if __name__ == "__main__":
    main()
