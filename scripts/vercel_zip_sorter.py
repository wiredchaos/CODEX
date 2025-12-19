#!/usr/bin/env python3
import hashlib
import json
from pathlib import Path
from datetime import datetime
import shutil

ROOT = Path(__file__).resolve().parent.parent
INBOX = ROOT / "INBOX_UPLOADS"
ROOT_DROP = ROOT
TARGET_BASE = ROOT / "VERCEL_HISTORY"
TARGET_DIRS = {
    "exports": "exports",
    "3dt": "3dt",
    "builds": "builds",
    "misc": "misc",
}
MANIFEST_PATH = TARGET_BASE / "exports" / "_MANIFEST.json"

KEYWORDS = {
    "exports": [
        "transcript",
        "chat",
        "vercel_history",
        "export",
        "_manifest",
        "logs",
    ],
    "3dt": [
        "3dt",
        "3-dt",
        "trinity",
        "webgpu",
        "environmentrenderer",
        "wc-webgpu-3dt",
    ],
    "builds": [
        "build",
        "bot",
        "discord",
        "deploy",
        "pipeline",
        "web-experience",
        "wcm",
        "hub",
    ],
}


def ensure_directories() -> None:
    for directory in TARGET_DIRS.values():
        (TARGET_BASE / directory).mkdir(parents=True, exist_ok=True)
    INBOX.mkdir(parents=True, exist_ok=True)


def load_manifest() -> list:
    if not MANIFEST_PATH.exists():
        return []
    try:
        with MANIFEST_PATH.open("r", encoding="utf-8") as manifest_file:
            return json.load(manifest_file)
    except json.JSONDecodeError:
        return []


def save_manifest(entries: list) -> None:
    entries_sorted = sorted(entries, key=lambda item: item["path"])
    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    with MANIFEST_PATH.open("w", encoding="utf-8") as manifest_file:
        json.dump(entries_sorted, manifest_file, indent=2)


def classify_target(filename: str) -> str:
    lower_name = filename.lower()
    for bucket, keywords in KEYWORDS.items():
        if any(keyword in lower_name for keyword in keywords):
            return bucket
    return "misc"


def sha256_file(path: Path) -> str:
    hasher = hashlib.sha256()
    with path.open("rb") as file_handle:
        for chunk in iter(lambda: file_handle.read(8192), b""):
            hasher.update(chunk)
    return hasher.hexdigest()


def next_available_name(target_dir: Path, filename: str) -> Path:
    candidate = target_dir / filename
    if not candidate.exists():
        return candidate
    stem = candidate.stem
    suffix = candidate.suffix
    counter = 1
    while True:
        candidate = target_dir / f"{stem}-{counter:02d}{suffix}"
        if not candidate.exists():
            return candidate
        counter += 1


def collect_drop_files() -> list[Path]:
    candidates = []
    for path in INBOX.glob("*.zip"):
        candidates.append(path)
    for path in ROOT_DROP.glob("*.zip"):
        if TARGET_BASE in path.parents:
            continue
        candidates.append(path)
    return candidates


def update_manifest(entries: list, record: dict) -> None:
    existing = next((item for item in entries if item["path"] == record["path"] and item["sha256"] == record["sha256"] and item["size"] == record["size"]), None)
    if existing:
        return
    entries.append(record)


def process_files() -> bool:
    ensure_directories()
    manifest_entries = load_manifest()
    moved_any = False
    for zip_path in collect_drop_files():
        target_bucket = classify_target(zip_path.name)
        destination_dir = TARGET_BASE / target_bucket
        destination_dir.mkdir(parents=True, exist_ok=True)
        destination_path = next_available_name(destination_dir, zip_path.name)
        destination_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(zip_path), destination_path)
        file_stat = destination_path.stat()
        record = {
            "path": str(destination_path.relative_to(ROOT)),
            "sha256": sha256_file(destination_path),
            "size": file_stat.st_size,
            "timestamp": datetime.utcnow().isoformat() + "Z",
        }
        update_manifest(manifest_entries, record)
        moved_any = True
    if moved_any:
        save_manifest(manifest_entries)
    return moved_any


def main() -> None:
    moved = process_files()
    if moved:
        print("ZIP files sorted and manifest updated.")
    else:
        print("No ZIP files to process.")


if __name__ == "__main__":
    main()
