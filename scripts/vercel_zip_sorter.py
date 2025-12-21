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

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INBOX = ROOT / "INBOX_UPLOADS"
VERCEL_HISTORY = ROOT / "VERCEL_HISTORY"
DEST = {
    "exports": VERCEL_HISTORY / "exports",
    "3dt": VERCEL_HISTORY / "3dt",
    "builds": VERCEL_HISTORY / "builds",
    "misc": VERCEL_HISTORY / "misc",
}
MANIFEST_PATH = DEST["exports"] / "_MANIFEST.json"

RULES = {
    "exports": ["transcript", "chat", "vercel_history", "export", "_manifest", "logs"],
    "3dt": ["3dt", "3-dt", "trinity", "webgpu", "environmentrenderer", "wc-webgpu-3dt"],
    "builds": ["build", "bot", "discord", "deploy", "pipeline", "web-experience", "wcm", "hub"],
}

def sha256_file(p: Path) -> str:
    h = hashlib.sha256()
    with p.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()

def classify(name_lower: str) -> str:
    for bucket, needles in RULES.items():
        if any(n in name_lower for n in needles):
            return bucket
    return "misc"

def non_overwrite_path(target: Path) -> Path:
    if not target.exists():
        return target
    stem, suf = target.stem, target.suffix
    for i in range(1, 1000):
        cand = target.with_name(f"{stem}-{i:02d}{suf}")
        if not cand.exists():
            return cand
    raise RuntimeError(f"Too many collisions for {target.name}")

def ensure_dirs():
    INBOX.mkdir(parents=True, exist_ok=True)
    VERCEL_HISTORY.mkdir(parents=True, exist_ok=True)
    for p in DEST.values():
        p.mkdir(parents=True, exist_ok=True)

def find_zip_sources():
    sources = []
    if INBOX.exists():
        sources.extend(INBOX.glob("**/*.zip"))
    # repo root zips (fallback)
    sources.extend([p for p in ROOT.glob("*.zip") if p.is_file()])
    # ignore already-sorted
    sources = [p for p in sources if "VERCEL_HISTORY" not in p.parts]
    return sorted(set(sources))

def load_manifest():
    if MANIFEST_PATH.exists():
        try:
            return json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
        except Exception:
            return []
    return []

def write_manifest(entries):
    # stable order
    entries_sorted = sorted(entries, key=lambda e: e["path"])
    MANIFEST_PATH.write_text(json.dumps(entries_sorted, indent=2), encoding="utf-8")

def main():
    ensure_dirs()
    sources = find_zip_sources()
    if not sources:
        return

    # Move files
    for src in sources:
        bucket = classify(src.name.lower())
        dst_dir = DEST[bucket]
        dst = non_overwrite_path(dst_dir / src.name)
        dst.parent.mkdir(parents=True, exist_ok=True)
        src.replace(dst)

    # Update manifest for EVERYTHING under VERCEL_HISTORY (not just moved)
    entries = []
    for bucket, folder in DEST.items():
        for p in folder.glob("**/*"):
            if not p.is_file():
                continue
            rel = p.relative_to(ROOT).as_posix()
            updated_at = datetime.fromtimestamp(p.stat().st_mtime, tz=timezone.utc).isoformat()
            entries.append({
                "path": rel,
                "bucket": bucket,
                "bytes": p.stat().st_size,
                "sha256": sha256_file(p),
                "updated_at": updated_at,
            })
    write_manifest(entries)

if __name__ == "__main__":
    main()
