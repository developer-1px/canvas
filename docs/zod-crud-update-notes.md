# zod-crud update notes

Date: 2026-05-22

## Current State

`canvas` currently uses zod-crud as a pure schema-checked patch engine.

- `CanvasDocument.ts` imports `applyPatch` and `JSONPatchOperation`.
- Canvas history is owned by `useCanvasHistory`.
- Canvas selection is geometric/id-based and app-owned.
- Canvas clipboard, command availability, duplicate, group, ungroup, nudge, and delete are implemented in the canvas command engine.

This is valid if canvas intentionally treats zod-crud as a patch validator only. It does mean canvas is not using document history/clipboard/can* from zod-crud.

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

1. Decide whether canvas should adopt `createJSONDocument`.
   If yes, zod-crud can own item document history and schema validation while canvas keeps geometry selection and rendering.

2. Keep geometric selection app-owned.
   Canvas selection is not the same as JSON document selection. Convert selected item ids to item pointers only at mutation boundaries.

3. Consider mapping command availability to `can*` where it is model-based.
   Geometry-specific commands can stay app-owned.

4. Keep grouping/nudging local.
   Those are canvas semantics, not generic JSON document commands.

## Decision

Adopt `createJSONDocument` for canvas item document history and schema validation.

- Canvas keeps geometric/id-based selection as app state.
- zod-crud owns undo/redo patch history for `CanvasItem[]`.
- Canvas converts selected item ids to JSON Pointers only when committing history entries, then converts restored pointers back to ids after undo/redo.
- Canvas command semantics such as grouping, nudging, and geometry transforms remain local.

First migration scope: history only. Clipboard and generic command availability stay app-owned until history behavior is verified.

## Suggested Local Work Items

- Write a short decision note: "applyPatch-only" vs "JSONDocument-backed canvas state".
- If adopting `JSONDocument`, start with history only: replace snapshot `useCanvasHistory` with `doc.history` for item patches.
- Add tests around undo/redo and selection preservation before changing command behavior.

## Verification

```sh
pnpm test
pnpm lint
pnpm build
```
