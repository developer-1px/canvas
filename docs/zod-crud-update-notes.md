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
- Canvas duplicate commits cloned items through zod-crud `add` patches.
- Canvas find/replace helpers use zod-crud `doc.query`, `doc.at`, and
  `replace` patch batches over searchable text fields.
- The app exposes a compact find/replace panel opened with Cmd/Ctrl+F; replace
  commits those zod-crud text patch batches into document history.
- Canvas text edits commit zod-crud `add`/`replace` patches at the edited
  item text pointer instead of replacing the root item array.
- Inspector geometry edits commit zod-crud `replace` patches for changed item
  subtrees instead of replacing the root item array.

This is an intermediate state. Canvas is no longer applyPatch-only. Item
creation, paste, and duplicate commits now use zod-crud `add` patches, text
edits use text field patches, inspector geometry edits use item subtree
`replace` patches, and selection delete commits use zod-crud `remove` patches
with group-bound repair patches when needed. Most other content commands still
produce `CanvasItem[]` and commit them as root document replacements. The next
migration step is to make more commands produce zod-crud patch batches.

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
patches, duplicate patches, selection delete patches, zod-crud-backed clipboard
payloads, and zod-crud-backed find/replace, text-edit, and inspector geometry
patch helpers. Generic command availability stays app-owned until command patch
planning is introduced.

## Suggested Local Work Items

- Replace command `nextItems` producers with patch planners.
- Replace align, distribute, lock, and z-order with patch planners.

## Verification

```sh
pnpm test
pnpm lint
pnpm build
```
