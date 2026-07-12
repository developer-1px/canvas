# DesignDocument performance

## Single-node update benchmark

Run the reproducible Node benchmark with:

```sh
pnpm benchmark:design-document
```

The runner creates one flat root with the remaining nodes as direct children,
warms up two updates, then reports the median of nine single-leaf label updates.
The 5,000-node median is asserted against the 16.7ms frame budget. This
benchmark is intentionally opt-in so normal unit verification is not gated only
by machine-dependent wall-clock timing.

Measurements below were captured on 2026-07-13 with Node v24.16.0, pnpm
10.26.2, Vitest 3.2.4, macOS arm64:

| Flat nodes | Before median | After median | Speed-up |
| ---: | ---: | ---: | ---: |
| 1,000 | 8.802ms | 1.064ms | 8.3x |
| 5,000 | 42.720ms | 4.027ms | 10.6x |
| 10,000 | 83.109ms | 7.530ms | 11.0x |

The 5,000-node result improved by 90.6% and is below the frame budget on the
recorded runner. Absolute timings should only be compared on the same machine;
the fixture, warm-up, sample count, and Node runner stay fixed for local before
and after comparisons.

## Deterministic regression coverage

Regular Vitest verification does not rely on the timing threshold. It also
asserts that a single-node transaction:

- preserves the identity of untouched roots and nodes;
- reuses the parent, node-position, and component-slot graph indexes;
- commits a granular `/nodes/{index}` store operation while publishing the
  existing frozen canonical root replacement to causal observers.

A separate 5,000-node deep-chain fixture creates the document, updates the
deepest node, serializes it, and removes the deep subtree. This keeps graph and
remove traversal stack safety deterministic without a wall-clock assertion.
