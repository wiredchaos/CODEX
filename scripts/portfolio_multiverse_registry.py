#!/usr/bin/env python3
"""Generate patch_registry.json from -3DT patches.

- Scans repository root for files/folders ending with '-3DT' (case-insensitive)
- Emits registry entries used by the Portfolio Multiverse runtime
- Keeps generation deterministic for auditable runs
"""
from __future__ import annotations

import argparse
import json
import re
from hashlib import md5
from pathlib import Path
from typing import Dict, List

ROOT = Path(__file__).resolve().parent.parent
REGISTRY_PATH = ROOT / "patch_registry.json"


def discover_patches() -> List[str]:
    names: List[str] = []
    for item in ROOT.iterdir():
        name = item.name
        lower = name.lower()
        if lower.endswith("-3dt") or lower.endswith("-3dt.zip") or lower.endswith("-3-dt.zip"):
            cleaned = re.sub(r"\.(zip|tar\.gz|tgz)$", "", name, flags=re.IGNORECASE)
            names.append(cleaned)
    return sorted(set(names))


def deterministic_profile(seed: str) -> Dict:
    digest = md5(seed.encode("utf-8")).hexdigest()
    lighting_modes = ["ambient", "neon", "noir", "cosmic"]
    motion_modes = ["slow_orbit", "drift", "pulse", "spiral"]
    particles = ["dust", "rays", "embers", "mist"]
    scale_modes = ["heroic", "macro", "micro", "panorama"]

    def pick(options: List[str], offset: int) -> str:
        return options[int(digest[offset: offset + 2], 16) % len(options)]

    return {
        "lighting": pick(lighting_modes, 0),
        "motion": pick(motion_modes, 4),
        "particles": pick(particles, 8),
        "scale": pick(scale_modes, 12),
    }


def derive_room_type(name: str) -> str:
    lowered = name.lower()
    if "runtime" in lowered:
        return "runtime"
    if "lore" in lowered:
        return "lore"
    if "vault" in lowered:
        return "vault"
    if "system" in lowered:
        return "system"
    return "portfolio"


def generate_registry() -> List[Dict]:
    patches = discover_patches()
    registry: List[Dict] = []
    for idx, patch in enumerate(patches, start=1):
        slug = re.sub(r"[^a-z0-9]+", "-", patch.lower()).strip("-")
        entry = {
            "patch_id": patch,
            "display_name": patch.replace("-", " ").title(),
            "room_type": derive_room_type(patch),
            "access_rules": {
                "soft": ["artifact:genesis-token"] if idx % 3 == 0 else [],
                "hard": ["nft:alpha-key"] if idx % 5 == 0 else [],
            },
            "trinity_level": idx,
            "3d_scene_profile": deterministic_profile(patch),
            "route_slug": slug,
        }
        registry.append(entry)
    return registry


def save_registry(entries: List[Dict]) -> None:
    REGISTRY_PATH.write_text(json.dumps(entries, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate patch_registry.json from -3DT patches")
    parser.add_argument("--write", action="store_true", help="Write registry to patch_registry.json")
    args = parser.parse_args()

    registry = generate_registry()
    if args.write:
        save_registry(registry)
        print(f"Wrote {len(registry)} entries to {REGISTRY_PATH}")
    else:
        print(json.dumps(registry, indent=2))


if __name__ == "__main__":
    main()
