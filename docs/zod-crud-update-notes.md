# zod-crud update notes

Date: 2026-05-22

## Current State

`canvas` currently uses zod-crud as the host document facade for item content,
history, validation, and document selection state.

- `CanvasDocument.ts` creates a `JSONDocument<CanvasItem[]>` with
  `createJSONDocument`.
- zod-crud owns undo/redo history through `doc.history`.
- zod-crud owns document selection state through `doc.selection`.
- Selection-only canvas changes commit a zod-crud history entry with an
  unchanged-value mutation carrier and explicit selection diff, so undo/redo can
  restore selection without changing item content.
- Canvas converts between geometric item ids and JSON Pointers at the document
  boundary.
- Canvas command availability, duplicate, group, ungroup, and nudge are still
  implemented in the canvas command engine.
- Canvas copy/paste/cut use zod-crud `doc.clipboard` for clipboard payload
  storage while canvas keeps id rekey and paste offset policy.
- Canvas find/replace helpers use zod-crud `doc.query`, `doc.at`, and
  `replace` patch batches over searchable text fields.

This is an intermediate state. Canvas is no longer applyPatch-only. Item
creation commits now use zod-crud `add` patches, and selection delete commits
use zod-crud `remove` patches with group-bound repair patches when needed. Most
other content commands still produce `CanvasItem[]` and commit them as root
document replacements. The next migration step is to make more commands produce
zod-crud patch batches and wire the find/replace helpers into UI when needed.

## Changelog Impact

Current zod-crud public API offers more than `applyPatch`:

- `createJSONDocument`
- `doc.patch`
- `doc.commit`
- `doc.history`
- `doc.clipboard`
- `doc.can*`

`doc.ops` and `doc.commands` are not public.

## Improvement Direction

1. Keep `createJSONDocument` as the canvas item document facade.
   zod-crud owns item document history, schema validation, and document
   selection state while canvas keeps gesture preview and rendering.

2. Keep canvas selection expressed as item ids at the UI boundary.
   Convert ids to JSON Pointers when mutating `doc.selection`, then convert
   `doc.selection` snapshots back to ids for renderer and command inputs.
   Confirmed selection changes use mutation-diff history when they are user
   actions; drag and marquee previews remain live state until pointer-up.

3. Consider mapping command availability to `can*` where it is model-based.
   Geometry-specific commands can stay app-owned.

4. Keep grouping/nudging local.
   Those are canvas semantics, not generic JSON document commands.

## Decision

Adopt `createJSONDocument` for canvas item document history, schema validation,
and document selection state.

- zod-crud owns undo/redo patch history for `CanvasItem[]`.
- zod-crud owns document selection state through `doc.selection`.
- Confirmed selection changes are committed as mutation diffs, not only restored
  as ambient UI state.
- Canvas converts selected item ids to JSON Pointers when mutating
  `doc.selection`, then converts snapshots back to ids for renderer and command
  inputs.
- Canvas keeps gesture preview state such as marquee bounds, hover, and drag
  previews.
- Canvas command semantics such as grouping, nudging, and geometry transforms
  remain local until patch planners replace root document replacement commits.

Current migration scope: history, validation, selection ownership, item creation
patches, selection delete patches, zod-crud-backed clipboard payloads, and
zod-crud-backed find/replace patch helpers. Generic command availability stays
app-owned until command patch planning is introduced.

## Suggested Local Work Items

- Replace command `nextItems` producers with patch planners.
- Replace duplicate, align, distribute, lock, z-order, and text edits with patch
  planners.
- Add UI entry points for find/replace when the demo needs them.

## Verification

```sh
pnpm test
pnpm lint
pnpm build
```
