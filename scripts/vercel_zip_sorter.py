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
