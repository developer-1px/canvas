# json-document update notes

Date: 2026-05-22

## Current State

`canvas` currently uses json-document as the host document facade for item content,
history, validation, and document selection state.

- `CanvasDocument.ts` creates a `JSONDocument<CanvasItem[]>` with
  `createJSONDocument`.
- json-document owns undo/redo history through `doc.history`.
- json-document owns document selection state through `doc.selection`.
- Selection-only canvas changes commit a json-document history entry with an
  unchanged-value mutation carrier and explicit selection diff, so undo/redo can
  restore selection without changing item content.
- Canvas converts between geometric item ids and JSON Pointers at the document
  boundary.
- Canvas command availability is still implemented in the canvas command engine.
- Canvas copy/paste/cut use json-document `doc.clipboard` for clipboard payload
  storage while canvas keeps id rekey and paste offset policy.
- Canvas duplicate commits cloned items through json-document `add` patches.
- Canvas find/replace helpers use json-document `doc.query`, `doc.at`, and
  `replace` patch batches over searchable text fields.
- The app exposes a compact find/replace panel opened with Cmd/Ctrl+F; replace
  commits those json-document text patch batches into document history.
- Canvas text edits commit json-document `add`/`replace` patches at the edited
  item text pointer instead of replacing the root item array.
- Inspector geometry edits commit json-document `replace` patches for changed item
  subtrees instead of replacing the root item array.
- Align, distribute, lock, unlock, and keyboard nudge commands commit json-document
  `replace` patch batches for changed item subtrees.
- Group and ungroup commands commit json-document structural `remove`/`add` patch
  batches instead of replacing the root item array.
- Z-order commands commit json-document `move` patch batches instead of replacing
  the root item array.
- Pointer drag/resize history commits json-document patch batches after live
  preview; moved/resized existing items use `replace` patches and alt-drag
  duplicates use `add` patches.

This is an intermediate state. Canvas is no longer applyPatch-only. Item
creation, paste, and duplicate commits now use json-document `add` patches, text
edits use text field patches, inspector geometry, pointer transforms, and
simple geometry/property commands use item subtree `replace` patches, group and
ungroup use structural `remove`/`add` patches, and selection delete commits use
json-document `remove` patches with group-bound repair patches when needed. Alt-drag
duplicate previews commit final cloned items through json-document `add` patches.

## Changelog Impact

Current json-document public API offers more than `applyPatch`:

- `createJSONDocument`
- `doc.patch`
- `doc.commit`
- `doc.history`
- `doc.clipboard`
- `doc.can*`

`doc.ops` and `doc.commands` are not public.

## Improvement Direction

1. Keep `createJSONDocument` as the canvas item document facade.
   json-document owns item document history, schema validation, and document
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

- json-document owns undo/redo patch history for `CanvasItem[]`.
- json-document owns document selection state through `doc.selection`.
- Confirmed selection changes are committed as mutation diffs, not only restored
  as ambient UI state.
- Canvas converts selected item ids to JSON Pointers when mutating
  `doc.selection`, then converts snapshots back to ids for renderer and command
  inputs.
- Canvas keeps gesture preview state such as marquee bounds, hover, and drag
  previews.
- Canvas command semantics such as grouping, nudging, and geometry transforms
  remain local, with committed edits converted to json-document patches at the
  document boundary.

Current migration scope: history, validation, selection ownership, item creation
patches, duplicate patches, selection delete patches, json-document-backed clipboard
payloads, and json-document-backed find/replace, text-edit, inspector geometry,
pointer transform, align, distribute, lock, unlock, nudge, group, ungroup, and
z-order patch helpers. Generic command availability stays app-owned until
command patch planning is introduced.

## Suggested Local Work Items

- Replace command `nextItems` producers with patch planners.

## Verification

```sh
pnpm test
pnpm lint
pnpm build
```
