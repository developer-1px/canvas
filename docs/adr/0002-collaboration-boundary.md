# ADR 0002: Canvas Collaboration Boundary

## Status

Accepted

## Context

The canvas package already separates reusable canvas mechanics from Host-owned
document storage. Collaboration adds three concerns that look related in the UI
but have different ownership and persistence rules:

1. Document sync: persistent item, history, and patch state shared across users.
2. Presence sync: ephemeral cursor, selection, viewport, and follow state.
3. Sharing and permissions: identity, roles, links, and authorization policy.

Putting these directly in core would bind the reusable package to a backend,
transport, account model, and conflict strategy. Leaving the boundary implicit
makes collaboration look partially implemented when only visual overlays exist.

## Decision

1. Document sync is Host-owned and out of core. The canvas package may expose
   item validation, document change, patch, selection, and history contracts, but
   it does not own CRDTs, transports, storage replication, conflict resolution,
   user sessions, or server persistence.
2. Presence sync is ephemeral and enters the package through an App-owned
   provider or extension seam. Core and renderer code may define stable overlay
   records and draw remote cursors or remote selection bounds, but presence
   records are never committed to `CanvasItem` document state.
3. Sharing and permissions are Host-owned policy. The canvas package can accept
   a capability snapshot such as view, edit document, comment, export, and
   present/follow, then use it to gate tools, commands, pointer behavior,
   inspector controls, and keyboard shortcuts. It does not define account roles,
   share links, billing, guests, or authorization checks.
4. Collaboration-heavy product surfaces live outside core geometry. Presence
   visualization can be a first-party App seam because the renderer already owns
   overlays. Facilitation features such as timer, voting, spotlight, emotes,
   cursor chat, and laser pointer stay in the `canvas-facilitation` first-party
   bundle. AI-assisted collaboration belongs in labs until provider policy and
   review flows are explicit.
5. Demo behavior can use deterministic providers and fixtures to make these
   seams verifiable, but demo seed state must not imply persistence or real
   multiplayer transport.

## Follow-up Work

- Issue #53 can add a presence provider seam that feeds remote cursor and
  selection overlay records into the existing overlay path.
- Issue #54 can add a Host-owned capability contract that gates UI and
  execution paths without implementing identity or sharing.
- Issue #61 can propose labs-only AI automation contracts that produce
  reviewable document changes before commit.

## Consequences

- Host apps can plug in Yjs, Automerge, server patches, WebSocket sessions, or
  any other sync system without the canvas package choosing one.
- Presence has a stable renderer path while staying ephemeral and replaceable.
- Permission checks can become testable command and pointer gates without
  turning the package into an auth product.
- Collaboration work can progress in narrow vertical slices without re-litigating
  the reusable package boundary.
