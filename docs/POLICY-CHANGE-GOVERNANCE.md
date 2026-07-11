# Policy Change Governance

- Policy versions are immutable once released.
- Changes require a new policy version.
- Production policy downgrades require explicit approval.
- Emergency disable is separate from weakening policy.
- Policy changes require a receipt.
- Rollback must not silently restore weaker controls.
- Schema changes require migration notes.
- Receipt verification must retain older schema support or document migration requirements.
- Silent overrides are not permitted.
