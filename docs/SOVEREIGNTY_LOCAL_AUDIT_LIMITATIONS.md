# Sovereignty Local Audit Limitations

Local JSONL is local development audit output only.

It is not immutable, tamper-proof, cryptographically signed, multi-process safe, multi-node safe, compliance-grade, or durable on ephemeral filesystems.

Safeguards implemented for local mode include file permissions where practical, append-only application behavior, line-delimited structured records, secret redaction, output hashing for individual records, and a startup warning. Production persistence is not implemented; required targets include PostgreSQL, object storage, signed receipts, WORM or immutable storage, and external audit systems.
