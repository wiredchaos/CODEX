#!/usr/bin/env python3
"""Wired Chaos 3DT execution worker.

This worker scans the JOBS directory for queued 3DT jobs, claims them,
performs a deterministic STUB_EXECUTION placeholder render, and advances
status tracking (queued -> running -> completed). Rendering remains
mocked; this only operationalizes the first execution hop.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import time
from pathlib import Path
from typing import Dict, Iterable, Optional, Tuple

BASE_DIR = Path("WIRED_CHAOS_3DT")
JOBS_DIR = BASE_DIR / "JOBS"
MANIFEST_PATH = BASE_DIR / "_JOBS_MANIFEST.json"

STATUS_QUEUED = "queued"
STATUS_RUNNING = "running"
STATUS_COMPLETED = "completed"


def _load_json(path: Path) -> Dict:
    if not path.exists():
        return {}
    with path.open("r", encoding="utf-8") as fh:
        try:
            return json.load(fh)
        except json.JSONDecodeError:
            return {}


def _save_json(path: Path, payload: Dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as fh:
        json.dump(payload, fh, indent=2, sort_keys=True)
        fh.write("\n")


def _iter_version_metadata() -> Iterable[Tuple[str, str, Path]]:
    if not JOBS_DIR.exists():
        return []
    jobs = sorted(p for p in JOBS_DIR.iterdir() if p.is_dir())
    for job_dir in jobs:
        versions_dir = job_dir / "versions"
        if not versions_dir.exists():
            continue
        for version_dir in sorted(p for p in versions_dir.iterdir() if p.is_dir()):
            metadata_path = version_dir / "metadata.json"
            if metadata_path.exists():
                yield job_dir.name, version_dir.name, metadata_path


def _update_manifest_status(job_id: str, version: str, status: str, timestamp: str) -> None:
    manifest = _load_json(MANIFEST_PATH)
    jobs = manifest.get("jobs", {})
    job_record = jobs.get(job_id)
    if not job_record:
        return

    updated = False
    for entry in job_record.get("versions", []):
        if entry.get("version") == version:
            entry["status"] = status
            if status == STATUS_RUNNING:
                entry["started_at"] = timestamp
            elif status == STATUS_COMPLETED:
                entry["completed_at"] = timestamp
                entry["rendering"] = "STUB_EXECUTION"
            updated = True
            break

    if updated:
        _save_json(MANIFEST_PATH, manifest)


def _claim_job(metadata_path: Path) -> Optional[Dict]:
    metadata = _load_json(metadata_path)
    if metadata.get("status") != STATUS_QUEUED:
        return None

    metadata["status"] = STATUS_RUNNING
    metadata["started_at"] = dt.datetime.now(dt.UTC).isoformat(timespec="seconds") + "Z"
    _save_json(metadata_path, metadata)
    _update_manifest_status(metadata["job_id"], metadata["version"], STATUS_RUNNING, metadata["started_at"])
    return metadata


def _complete_job(metadata_path: Path, metadata: Dict) -> None:
    version_dir = metadata_path.parent
    stub = version_dir / "STUB_EXECUTION.md"
    stub.write_text(
        "\n".join(
            [
                "# STUB_EXECUTION",
                "- Rendering mocked for deterministic pipeline bring-up.",
                "- No GPU or renderer selected; this is a placeholder output stage.",
                f"- Job: {metadata.get('job_id')}, Version: {metadata.get('version')}.",
                f"- Claimed by: Wired Chaos worker.",
            ]
        )
        + "\n",
        encoding="utf-8",
    )

    metadata["status"] = STATUS_COMPLETED
    metadata["completed_at"] = dt.datetime.now(dt.UTC).isoformat(timespec="seconds") + "Z"
    metadata["rendering"] = "STUB_EXECUTION"
    _save_json(metadata_path, metadata)
    _update_manifest_status(metadata["job_id"], metadata["version"], STATUS_COMPLETED, metadata["completed_at"])


def _next_queued_job() -> Optional[Tuple[Dict, Path]]:
    for job_id, version, metadata_path in _iter_version_metadata():
        metadata = _load_json(metadata_path)
        if metadata.get("status") == STATUS_QUEUED:
            return metadata, metadata_path
    return None


def run_once(verbose: bool = False) -> bool:
    queued = _next_queued_job()
    if not queued:
        if verbose:
            print("No queued jobs discovered.")
        return False

    metadata, path = queued
    if verbose:
        print(f"Claiming job {metadata.get('job_id')}@{metadata.get('version')}")
    claimed = _claim_job(path)
    if not claimed:
        if verbose:
            print("Job already claimed by another worker.")
        return False

    if verbose:
        print("Executing STUB_EXECUTION placeholder render…")
    _complete_job(path, claimed)
    if verbose:
        print("Job completed.")
    return True


def run_loop(poll_seconds: float, verbose: bool = False) -> None:
    while True:
        work_done = run_once(verbose=verbose)
        if not work_done and verbose:
            print(f"Sleeping for {poll_seconds} seconds before next check…")
        time.sleep(poll_seconds)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Execute queued Wired Chaos 3DT jobs (STUB_EXECUTION stage).")
    parser.add_argument("--poll-seconds", type=float, default=10.0, help="Polling interval when running in watch mode.")
    parser.add_argument("--watch", action="store_true", help="Continuously watch for queued jobs.")
    parser.add_argument("--verbose", action="store_true", help="Enable verbose logging.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if args.watch:
        run_loop(poll_seconds=args.poll_seconds, verbose=args.verbose)
    else:
        run_once(verbose=args.verbose)


if __name__ == "__main__":
    main()
