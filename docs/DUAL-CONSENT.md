# Dual Consent Doctrine

Dual consent means two independent approvals bound to the same exact action payload. It is doctrine for wallet, settlement, and other high-risk privileged actions. It is documented here as a contract baseline only; no runtime verifier is claimed in this repository.

## Approval requirements

Approvals must:

- come from separate authorized identities;
- include timestamps;
- include approval expiry;
- bind to the same normalized payload hash;
- bind to the same destination, amount, chain, asset, and action;
- be invalidated if the payload changes; and
- be protected against replay through a nonce or equivalent freshness control.

Human plus policy-engine approval is not automatically equivalent to two independent human approvals unless a specific governance profile explicitly permits that substitution.

## Wallet and settlement receipt fields

Wallet and settlement actions must record:

- initiator identity;
- approver identity;
- normalized transaction hash;
- chain;
- asset;
- amount;
- destination;
- expiry;
- approval signatures or evidence references; and
- replay nonce.

No example in this repository should contain real wallet addresses, private keys, production identifiers, or production signing material.
