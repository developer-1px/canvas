# zod-crud update notes

Date: 2026-05-22

## Current State

`canvas` currently uses zod-crud as the host document facade for item content,
history, validation, and document selection state.

- `CanvasDocument.ts` creates a `JSONDocument<CanvasItem[]>` with
  `createJSONDocument`.
- zod-crud owns undo/redo history through `doc.history`.
- zod-crud owns document selection state through `doc.selection`.
- Canvas converts between geometric item ids and JSON Pointers at the document
  boundary.
- Canvas clipboard, command availability, duplicate, group, ungroup, nudge, and delete are implemented in the canvas command engine.

This is an intermediate state. Canvas is no longer applyPatch-only, but content
commands still mostly produce `CanvasItem[]` and commit them as root document
replacements. The next migration step is to make commands produce zod-crud patch
batches and use zod-crud clipboard/find/replace surfaces.

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

3. Consider mapping command availability to `can*` where it is model-based.
   Geometry-specific commands can stay app-owned.

4. Keep grouping/nudging local.
   Those are canvas semantics, not generic JSON document commands.

## Decision

Adopt `createJSONDocument` for canvas item document history, schema validation,
and document selection state.

- zod-crud owns undo/redo patch history for `CanvasItem[]`.
- zod-crud owns document selection state through `doc.selection`.
- Canvas converts selected item ids to JSON Pointers when mutating
  `doc.selection`, then converts snapshots back to ids for renderer and command
  inputs.
- Canvas keeps gesture preview state such as marquee bounds, hover, and drag
  previews.
- Canvas command semantics such as grouping, nudging, and geometry transforms
  remain local until patch planners replace root document replacement commits.

Current migration scope: history, validation, and selection ownership. Clipboard,
find, replace, and generic command availability stay app-owned until command
patch planning is introduced.

## Suggested Local Work Items

- Replace command `nextItems` producers with patch planners.
- Move clipboard to `doc.clipboard` with canvas id rekey and paste offset policy.
- Add find/replace over searchable canvas item fields using zod-crud query and
  patch batches.

## Verification

```sh
pnpm test
pnpm lint
pnpm build
```
