#!/usr/bin/env python3
"""Validate AGENTROPOLIS-54T policy, schema, examples, docs, and obvious secrets."""
from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REQUIRED = [
    "policies/54t-policy.yaml",
    "schemas/receipt.schema.json",
    "docs/POLICY-GATES.md",
    "docs/DUAL-CONSENT.md",
    "docs/PROMPT-INJECTION.md",
    "docs/THREAT-MODEL.md",
    "docs/POLICY-CHANGE-GOVERNANCE.md",
    "docs/LIVE-VS-PLANNED.md",
    "tests/README.md",
]
SECRET_PATTERNS = [
    re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----"),
    re.compile(r"(?i)(api[_-]?key|secret|token)\s*=\s*['\"]?[A-Za-z0-9_\-]{24,}"),
    re.compile(r"ghp_[A-Za-z0-9]{36}"),
]


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def load_yaml(path: Path) -> None:
    try:
        import yaml  # type: ignore
        yaml.safe_load(path.read_text())
    except ImportError:
        # Ruby ships with Psych in this environment and GitHub-hosted runners.
        subprocess.run(["ruby", "-e", "require 'yaml'; YAML.load_file(ARGV[0])", str(path)], check=True)


def validate_with_ajv(examples: list[Path]) -> None:
    js = r"""
const fs = require('fs');
const Ajv2020 = require('ajv/dist/2020');
const ajv = new Ajv2020({allErrors: true, strict: false, validateFormats: false});
const schema = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
let validate;
try { validate = ajv.compile(schema); } catch (error) { console.error(error.message); process.exit(1); }
for (const file of process.argv.slice(3)) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!validate(data)) {
    console.error(`${file} failed schema validation: ${ajv.errorsText(validate.errors)}`);
    process.exit(1);
  }
}
"""
    result = subprocess.run(
        ["node", "-e", js, str(ROOT / "schemas/receipt.schema.json"), *map(str, examples)],
        cwd=ROOT,
        text=True,
        capture_output=True,
    )
    if result.returncode != 0:
        fail(result.stderr.strip() or result.stdout.strip() or "AJV validation failed")


def main() -> None:
    for rel in REQUIRED:
        if not (ROOT / rel).is_file():
            fail(f"missing required file: {rel}")

    load_yaml(ROOT / "policies/54t-policy.yaml")

    schema = json.loads((ROOT / "schemas/receipt.schema.json").read_text())
    examples = sorted((ROOT / "examples/receipts").glob("*.json"))
    if not examples:
        fail("missing receipt examples")
    try:
        import jsonschema  # type: ignore
    except ImportError:
        validate_with_ajv(examples)
    else:
        jsonschema.Draft202012Validator.check_schema(schema)
        validator = jsonschema.Draft202012Validator(schema, format_checker=jsonschema.FormatChecker())
        for example in examples:
            data = json.loads(example.read_text())
            errors = sorted(validator.iter_errors(data), key=lambda error: list(error.path))
            if errors:
                fail(f"{example.relative_to(ROOT)} failed schema validation: {errors[0].message}")

    for md in list((ROOT / "docs").glob("*.md")) + [ROOT / "README.md", ROOT / "tests/README.md"]:
        text = md.read_text()
        for link in re.findall(r"\[[^\]]+\]\(([^)]+)\)", text):
            if re.match(r"^[a-z]+://", link) or link.startswith("#"):
                continue
            target = (md.parent / link.split("#", 1)[0]).resolve()
            if not target.exists():
                fail(f"broken markdown link in {md.relative_to(ROOT)}: {link}")

    scan_paths = [p for p in REQUIRED if not p.endswith(".yaml")] + ["README.md"]
    for rel in scan_paths:
        text = (ROOT / rel).read_text(errors="ignore")
        for pattern in SECRET_PATTERNS:
            if pattern.search(text):
                fail(f"possible secret pattern in {rel}")

    print(f"Validated {len(examples)} receipt examples against schemas/receipt.schema.json")


if __name__ == "__main__":
    main()
