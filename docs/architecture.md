# Architecture

```text
kenneldao.org
      │
      ▼
KDAOcore API
      ▲
      │
kdaocmd

KDAOcore
      │
      ▼
barkbuildownkdao smart contracts
```

The website is a frontend. `kdaocmd` is an operator surface. KDAOcore is the authoritative off-chain system of record. `barkbuildownkdao` is the on-chain execution layer. Agentropolis provides shared agent infrastructure for dispatch, skills, policy, memory, and receipts.

Governance votes recorded off-chain do not automatically execute on-chain. Transaction preparation requires explicit authorization and external signing.
