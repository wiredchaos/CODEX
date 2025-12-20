#!/usr/bin/env python3
"""Wired Chaos 3DT pipeline entry point.

This script formalizes the 3DT intake as jobs, emits placeholder versioned
artifacts, and captures job metadata. Rendering and GPU assumptions are
explicitly out of scope; this only wires up the execution spine.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import re
from pathlib import Path
from typing import Dict, List, Optional

BASE_DIR = Path("WIRED_CHAOS_3DT")
INTAKE_DIR = BASE_DIR / "INTAKE"
JOBS_DIR = BASE_DIR / "JOBS"
MANIFEST_PATH = BASE_DIR / "_JOBS_MANIFEST.json"


def _load_manifest() -> Dict:
    if MANIFEST_PATH.exists():
        with MANIFEST_PATH.open("r", encoding="utf-8") as fh:
            try:
                return json.load(fh)
            except json.JSONDecodeError:
                # Preserve forward progress even if previous file was malformed.
                return {}
    return {}


def _save_manifest(manifest: Dict) -> None:
    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    with MANIFEST_PATH.open("w", encoding="utf-8") as fh:
        json.dump(manifest, fh, indent=2, sort_keys=True)
        fh.write("\n")


def _next_version(existing: List[str], requested: Optional[str]) -> str:
    if requested:
        normalized = requested.strip()
        if not normalized:
            requested = None
        else:
            match = re.match(r"v?(\d+)", normalized, re.IGNORECASE)
            if match:
                return f"v{int(match.group(1)):04d}"
            return normalized

    numbers: List[int] = []
    for name in existing:
        match = re.match(r"v0*(\d+)$", name)
        if match:
            numbers.append(int(match.group(1)))
    next_index = max(numbers) + 1 if numbers else 1
    return f"v{next_index:04d}"


def _ensure_base_dirs() -> None:
    for path in (INTAKE_DIR, JOBS_DIR):
        path.mkdir(parents=True, exist_ok=True)


def _validate_segment(value: str, field: str) -> str:
    candidate = value.strip()
    if not candidate:
        raise ValueError(f"{field} cannot be empty")

    # Limit to safe folder name characters and forbid traversal tokens.
    if "/" in candidate or "\\" in candidate or ".." in candidate:
        raise ValueError(f"{field} contains invalid path separators or traversal sequences")

    if not re.fullmatch(r"[A-Za-z0-9._-]+", candidate):
        raise ValueError(
            f"{field} must use alphanumeric characters, dots, underscores, or hyphens only"
        )

    return candidate


def _prepare_job_dirs(job_id: str, version: str) -> Path:
    job_root = JOBS_DIR / job_id
    version_dir = job_root / "versions" / version
    version_dir.mkdir(parents=True, exist_ok=True)
    return version_dir


def _update_manifest(job_id: str, version: str, consumer: str, timestamp: str, notes: str, status: str) -> None:
    manifest = _load_manifest()
    manifest.setdefault("intake_root", str(INTAKE_DIR))
    manifest.setdefault("jobs", {})

    job_record = manifest["jobs"].get(job_id, {})
    versions = job_record.get("versions", [])
    version_entry = {
        "version": version,
        "timestamp": timestamp,
        "consumer": consumer,
        "status": status,
        "notes": notes,
        "owned_by": "Wired Chaos",
        "rendering": "pending",
        "intake_mode": "job",
    }
    versions.append(version_entry)

    job_record.update(
        {
            "job_id": job_id,
            "intake_path": str(INTAKE_DIR / job_id),
            "owned_by": "Wired Chaos",
            "last_version": version,
            "versions": versions,
        }
    )
    manifest["jobs"][job_id] = job_record
    _save_manifest(manifest)


def _write_version_metadata(version_dir: Path, metadata: Dict) -> None:
    metadata_path = version_dir / "metadata.json"
    with metadata_path.open("w", encoding="utf-8") as fh:
        json.dump(metadata, fh, indent=2, sort_keys=True)
        fh.write("\n")

    placeholder = version_dir / "ARTIFACTS_PLACEHOLDER.md"
    placeholder.write_text(
        "\n".join(
            [
                "# Placeholder artifacts",
                "- Rendering intentionally not executed.",
                "- No rendering engine selected; no GPU assumptions made.",
                "- Replace this placeholder when render-ready assets exist.",
            ]
        )
        + "\n",
        encoding="utf-8",
    )


def register_job(intake_id: str, consumer: str, requested_version: Optional[str], notes: str) -> str:
    normalized_consumer = consumer.strip()
    if not normalized_consumer.lower().endswith("-3dt"):
        raise ValueError("consumer must end with '-3DT' to be treated as an execution consumer")

    safe_intake_id = _validate_segment(intake_id, "intake_id")
    safe_requested_version = None
    if requested_version:
        safe_requested_version = _validate_segment(requested_version, "requested version")

    _ensure_base_dirs()
    intake_path = INTAKE_DIR / safe_intake_id
    intake_path.mkdir(parents=True, exist_ok=True)

    existing_versions: List[str] = []
    versions_dir = JOBS_DIR / safe_intake_id / "versions"
    if versions_dir.exists():
        existing_versions = [p.name for p in versions_dir.iterdir() if p.is_dir()]

    version = _validate_segment(_next_version(existing_versions, safe_requested_version), "version")
    timestamp = dt.datetime.utcnow().isoformat(timespec="seconds") + "Z"

    version_dir = _prepare_job_dirs(safe_intake_id, version)
    metadata = {
        "job_id": safe_intake_id,
        "consumer": normalized_consumer,
        "version": version,
        "timestamp": timestamp,
        "intake_path": str(intake_path),
        "owned_by": "Wired Chaos",
        "intake_mode": "job",
        "rendering": "pending",
        "status": "queued",
        "notes": notes,
    }
    _write_version_metadata(version_dir, metadata)
    _update_manifest(safe_intake_id, version, normalized_consumer, timestamp, notes, status="queued")
    return version


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Register a -3DT intake job and emit placeholder outputs.")
    parser.add_argument("--intake-id", required=True, help="Folder name inside WIRED_CHAOS_3DT/INTAKE representing the job")
    parser.add_argument("--consumer", required=True, help="Name of the -3DT consumer supplying the intake inputs")
    parser.add_argument("--version", default=None, help="Optional explicit version tag (e.g., v0002). Defaults to next incremental.")
    parser.add_argument("--notes", default="", help="Optional notes captured in metadata for traceability")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    # Treat empty strings as unset for optional flags.
    requested_version = args.version if args.version and args.version.strip() else None
    notes = args.notes.strip()

    version = register_job(
        intake_id=args.intake_id.strip(),
        consumer=args.consumer.strip(),
        requested_version=requested_version,
        notes=notes,
    )
    print(f"Registered intake '{args.intake_id}' for consumer '{args.consumer}' at version {version} (placeholder only).")


if __name__ == "__main__":
    main()
