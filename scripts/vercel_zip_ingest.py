import json
import zipfile
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Tuple


ROOT = Path(__file__).resolve().parents[1]
INBOX = ROOT / "INBOX_UPLOADS"
VERCEL_HISTORY = ROOT / "VERCEL_HISTORY"
UNPACKED = VERCEL_HISTORY / "unpacked"
MANIFEST_PATH = VERCEL_HISTORY / "exports" / "_MANIFEST.json"
SUMMARY_PATH = VERCEL_HISTORY / "exports" / "_INGEST_RUN_SUMMARY.json"

TRANSCRIPT_EXTS = {".md", ".txt", ".json", ".log", ".html"}
TRANSCRIPT_TOKENS = [
    "chat",
    "transcript",
    "build",
    "vercel",
    "logs",
    "console",
    "diff",
]

TRINITY_KEYWORDS = [
    "-3dt",
    "3dt",
    "trinity",
    "trinity 3d",
    "webgpu-3dt",
    "wc-webgpu-3dt",
    "environmentrenderer",
    "<environmentrenderer",
    "patchid=\"clear\"",
    "kind=\"lobby\"",
    "registry",
    "manifest",
    "floor",
    "lobby",
    "timeline",
    "door",
    "hotspot",
    "hud",
    "akira codex",
    "gating",
    "vault",
    "permission",
    "neteru",
    "signal era",
    "rvp",
]

CONSUMER_DECLARATION_TOKEN = "consumer declaration"
TIMELINE_TOKENS = ["neteru", "signal era", "rvp"]


@dataclass
class ManifestEntry:
    zip_name: str
    sha256: str
    bytes: int
    extracted_path: str
    found_transcripts_count: int
    trinity_hits_count: int
    top_keywords_found: List[str]
    processed_at: str

    @property
    def stable_id(self) -> str:
        return f"{self.zip_name}:{self.sha256}"


def sha256_file(path: Path) -> str:
    import hashlib

    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def ensure_dirs() -> None:
    (VERCEL_HISTORY / "exports").mkdir(parents=True, exist_ok=True)
    UNPACKED.mkdir(parents=True, exist_ok=True)


def load_manifest() -> List[ManifestEntry]:
    if not MANIFEST_PATH.exists():
        return []
    try:
        data = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    except Exception:
        return []

    if isinstance(data, dict):
        archives = data.get("archives") or data.get("transcripts") or []
    elif isinstance(data, list):
        archives = data
    else:
        archives = []

    entries: List[ManifestEntry] = []
    for item in archives:
        try:
            entries.append(
                ManifestEntry(
                    zip_name=item.get("zip_name", "unknown.zip"),
                    sha256=item.get("sha256", "UNKNOWN"),
                    bytes=int(item.get("bytes", 0)),
                    extracted_path=item.get("extracted_path", ""),
                    found_transcripts_count=int(item.get("found_transcripts_count", 0)),
                    trinity_hits_count=int(item.get("trinity_hits_count", 0)),
                    top_keywords_found=item.get("top_keywords_found", []),
                    processed_at=item.get("processed_at", ""),
                )
            )
        except Exception:
            continue
    return entries


def save_manifest(entries: List[ManifestEntry]) -> None:
    payload = {
        "schema": "v1",
        "archives": [asdict(e) for e in sorted(entries, key=lambda e: e.zip_name)],
    }
    MANIFEST_PATH.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def discover_zips() -> List[Path]:
    if not INBOX.exists():
        return []
    return sorted([p for p in INBOX.glob("*.zip") if p.is_file()])


def target_extract_dir(stem: str, sha: str) -> Path:
    base = UNPACKED / stem
    if not base.exists():
        return base
    suffixed = UNPACKED / f"{stem}-{sha[:8]}"
    return suffixed


def extract_zip(zip_path: Path, sha: str) -> Path:
    stem = zip_path.stem
    dest = target_extract_dir(stem, sha)
    dest.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(zip_path, "r") as zf:
        zf.extractall(dest)
    return dest


def is_transcript_candidate(path: Path) -> bool:
    if path.suffix.lower() in TRANSCRIPT_EXTS:
        return True
    name = path.name.lower()
    return any(token in name for token in TRANSCRIPT_TOKENS)


def scan_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return ""


def count_keywords(text: str) -> Tuple[int, Dict[str, int]]:
    hits = 0
    freq: Dict[str, int] = {}
    lower = text.lower()
    for kw in TRINITY_KEYWORDS:
        n = lower.count(kw)
        if n:
            hits += n
            freq[kw] = freq.get(kw, 0) + n
    return hits, freq


def detect_timeline(text: str) -> bool:
    lower = text.lower()
    return any(token in lower for token in TIMELINE_TOKENS)


def process_zip(zip_path: Path, existing: Dict[str, ManifestEntry]) -> ManifestEntry:
    sha = sha256_file(zip_path)
    size = zip_path.stat().st_size
    dest = extract_zip(zip_path, sha)

    transcripts: List[Path] = []
    for p in dest.rglob("*"):
        if p.is_file() and is_transcript_candidate(p):
            transcripts.append(p)

    total_trinity_hits = 0
    keyword_freq: Dict[str, int] = {}
    consumer_decl = False
    timeline_flag = False

    for t in transcripts:
        text = scan_text(t)
        hits, freq = count_keywords(text)
        total_trinity_hits += hits
        for k, v in freq.items():
            keyword_freq[k] = keyword_freq.get(k, 0) + v
        if CONSUMER_DECLARATION_TOKEN in text.lower():
            consumer_decl = True
        if detect_timeline(text):
            timeline_flag = True

    processed_at = datetime.now(timezone.utc).isoformat()
    stable_id = f"{zip_path.name}:{sha}"
    prev = existing.get(stable_id)
    if prev:
        processed_at = prev.processed_at or processed_at

    top_keywords = [k for k, _ in sorted(keyword_freq.items(), key=lambda kv: (-kv[1], kv[0]))][:10]

    entry = ManifestEntry(
        zip_name=zip_path.name,
        sha256=sha,
        bytes=size,
        extracted_path=str(dest.relative_to(ROOT)),
        found_transcripts_count=len(transcripts),
        trinity_hits_count=total_trinity_hits,
        top_keywords_found=top_keywords,
        processed_at=processed_at,
    )

    entry.consumer_declaration = consumer_decl  # type: ignore[attr-defined]
    entry.timeline_flag = timeline_flag  # type: ignore[attr-defined]
    return entry


def summarize(entries: List[ManifestEntry]) -> Dict[str, object]:
    total_transcripts = sum(e.found_transcripts_count for e in entries)
    total_hits = sum(e.trinity_hits_count for e in entries)
    return {
        "total_zips": len(entries),
        "total_transcripts": total_transcripts,
        "total_trinity_hits": total_hits,
        "archives": [asdict(e) for e in entries],
    }


def render_crab_legs(entries: List[ManifestEntry]) -> str:
    lines = ["# CRAB Legs Index (Vercel Transcripts)", ""]
    if not entries:
        lines.append("Scan result: `NO TRANSCRIPTS FOUND — NEED EXPORTS.`")
        lines.append("")
        lines.append("## Legs")
        lines.append("")
        lines.append("| Transcript Path | Patch Name | Repo | Trinity / 3DT Indicators | Consumer Declaration | Timeline / Floor Mentions | Notes |")
        lines.append("| --- | --- | --- | --- | --- | --- | --- |")
        lines.append("| *(none found)* | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | Waiting on transcript exports. |")
        return "\n".join(lines)

    lines.append("Evidence-based index of processed Vercel archives. Values default to UNKNOWN if not present in the extracted files.")
    lines.append("")
    lines.append("## Legs")
    lines.append("")
    lines.append(
        "| ZIP | Extracted Path | Transcript Count | Trinity Hits | Consumer Declaration | Timeline Mentions | Notes |"
    )
    lines.append("| --- | --- | --- | --- | --- | --- | --- |")
    for e in sorted(entries, key=lambda x: x.zip_name):
        consumer = "YES" if getattr(e, "consumer_declaration", False) else ("UNKNOWN" if e.found_transcripts_count == 0 else "NO")
        timeline = "YES" if getattr(e, "timeline_flag", False) else ("UNKNOWN" if e.found_transcripts_count == 0 else "NO")
        notes = "; ".join(e.top_keywords_found) if e.top_keywords_found else "No Trinity indicators found."
        lines.append(
            f"| {e.zip_name} | {e.extracted_path} | {e.found_transcripts_count} | {e.trinity_hits_count} | {consumer} | {timeline} | {notes} |"
        )
    return "\n".join(lines)


def classify_entry(e: ManifestEntry) -> str:
    if e.found_transcripts_count == 0:
        return "❓ UNKNOWN"
    if e.trinity_hits_count > 0:
        return "🟡 Partial"
    return "🔴 Missing"


def render_trinity_catalog(entries: List[ManifestEntry]) -> str:
    lines = ["# Trinity / 3DT Install Catalog (Status Only)", "", "Evidence-based status of Trinity/3DT indicators.", ""]
    lines.append("## A) By Repo (accessible: CODEX)")
    lines.append("")
    lines.append("| Repo | Status | Evidence |")
    lines.append("| --- | --- | --- |")
    repo_status = "🔴 Missing"
    repo_evidence = "Workspace scan limited to extracted transcript artifacts. No Trinity implementation files detected in CODEX repository code." if entries else "No transcript evidence available to alter repository status."
    if entries and any(e.trinity_hits_count > 0 for e in entries):
        repo_status = "🟡 Partial"
        repo_evidence = "Transcript archives contain Trinity/3DT indicators; implementation code not present in CODEX codebase."  # noqa: E501
    lines.append(f"| CODEX | {repo_status} | {repo_evidence} |")

    lines.append("")
    lines.append("## B) By CRAB Leg (Transcript)")
    lines.append("")
    if not entries:
        lines.append("No CRAB legs exist yet because transcript exports are missing (`NO TRANSCRIPTS FOUND — NEED EXPORTS.`).")
    else:
        lines.append("| ZIP | Status | Evidence |")
        lines.append("| --- | --- | --- |")
        for e in sorted(entries, key=lambda x: x.zip_name):
            status = classify_entry(e)
            evidence = (
                "Trinity indicators present; Consumer Declaration detected." if getattr(e, "consumer_declaration", False)
                else "Trinity indicators present." if e.trinity_hits_count > 0
                else "No Trinity indicators in transcripts." if e.found_transcripts_count > 0
                else "No transcripts detected in archive."
            )
            lines.append(f"| {e.zip_name} | {status} | {evidence} |")

    lines.append("")
    lines.append("## Repo evidence (CODEX)")
    lines.append("")
    if entries and any(e.trinity_hits_count > 0 for e in entries):
        lines.append("Transcript artifacts referenced in manifest contain Trinity/3DT keywords. No code-side hits found in CODEX repository.")
    else:
        lines.append("Ripgrep search for Trinity/3DT keywords in CODEX repository code returned no matches.")

    lines.append("")
    lines.append("## Required Pieces Status")
    lines.append("")
    lines.append(
        "`TRINITY_REQUIRED_PIECES.md` remains a placeholder. All required pieces are UNKNOWN until the checklist is authored and evidence is provided."
    )

    return "\n".join(lines)


def render_gaps(entries: List[ManifestEntry]) -> str:
    lines = ["# Trinity Gaps and Next Actions", ""]
    if not entries:
        lines.append("Evidence gaps remain because Trinity/3DT artifacts are not present in this workspace.")
        lines.append("")
        lines.append("## Missing Evidence")
        lines.append("- Vercel chat/build transcripts (none found under `VERCEL_HISTORY/` after recursive scan).")
        lines.append("- Any repository files containing Trinity/3DT indicators within CODEX.")
        lines.append("- Defined checklist of required pieces for Trinity installation.")
    else:
        lines.append("Evidence was derived solely from uploaded ZIP archives. Items remain UNKNOWN where documents lacked explicit statements.")
        lines.append("")
        lines.append("## Missing Evidence")
        for e in sorted(entries, key=lambda x: x.zip_name):
            if e.found_transcripts_count == 0:
                lines.append(f"- {e.zip_name}: No transcript-like files detected in extracted archive (`{e.extracted_path}`).")
            if e.found_transcripts_count > 0 and e.trinity_hits_count == 0:
                lines.append(f"- {e.zip_name}: Transcripts lacked Trinity/3DT keywords; need explicit references.")
            if getattr(e, "consumer_declaration", False) is False:
                lines.append(f"- {e.zip_name}: Consumer Declaration not evidenced in transcripts.")
            if getattr(e, "timeline_flag", False) is False:
                lines.append(f"- {e.zip_name}: No timeline/floor mentions (NETERU / SIGNAL ERA / RVP) found.")

        lines.append("- Repository-side Trinity required pieces remain unspecified in `TRINITY_REQUIRED_PIECES.md`.")

    lines.append("")
    lines.append("## Evidence Needed")
    if not entries:
        lines.append("- Exported transcript files placed under `VERCEL_HISTORY/exports/` so CRAB legs can be indexed.")
    else:
        lines.append("- Transcript excerpts that explicitly mention Trinity/3DT components, Consumer Declaration, and timeline/floor markers.")
        lines.append("- A populated `TRINITY_REQUIRED_PIECES.md` enumerating required mount pieces.")
        lines.append("- Repository files (code or docs) referencing Trinity/3DT implementations to move status beyond Partial/Missing.")

    lines.append("")
    lines.append("## Next 3 Documentation-Only Actions")
    lines.append("1. Upload additional Vercel transcript exports (small batches) into `INBOX_UPLOADS/` to enrich evidence and re-run ingestion.")
    lines.append("2. Author the authoritative Trinity required pieces checklist in `TRINITY_REQUIRED_PIECES.md` to support consistent audits.")
    lines.append("3. Cite transcript paths directly inside audit docs when Trinity indicators or Consumer Declarations are confirmed.")

    return "\n".join(lines)


def write_file(path: Path, content: str) -> None:
    path.write_text(content.strip() + "\n", encoding="utf-8")


def update_docs(entries: List[ManifestEntry]) -> None:
    write_file(CRAB_LEGS_INDEX := ROOT / "CRAB_LEGS_INDEX.md", render_crab_legs(entries))
    write_file(TRINITY_INSTALL := ROOT / "TRINITY_INSTALL_CATALOG.md", render_trinity_catalog(entries))
    write_file(TRINITY_GAPS := ROOT / "TRINITY_GAPS_NEXT_ACTIONS.md", render_gaps(entries))


def main() -> None:
    ensure_dirs()
    zips = discover_zips()
    existing_entries = load_manifest()
    existing_by_id = {f"{e.zip_name}:{e.sha256}": e for e in existing_entries}

    processed: List[ManifestEntry] = []
    for z in zips:
        processed.append(process_zip(z, existing_by_id))

    if not processed:
        # keep previous manifest content untouched when nothing new
        return

    merged: Dict[str, ManifestEntry] = {e.stable_id: e for e in existing_entries}
    for e in processed:
        merged[e.stable_id] = e

    merged_entries = list(merged.values())
    save_manifest(merged_entries)
    update_docs(merged_entries)

    summary = summarize(processed)
    SUMMARY_PATH.write_text(json.dumps(summary, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
