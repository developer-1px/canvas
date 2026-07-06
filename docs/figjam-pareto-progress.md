# FigJam Pareto Roadmap Progress

Last updated: 2026-06-02

## Tracker

GitHub parent issue: https://github.com/developer-1px/canvas/issues/10

This roadmap keeps feature work and cleanup work together. Each issue must
deliver a visible canvas affordance slice and remove or quarantine the legacy
code that would otherwise keep confusing the default demo.

## Status

| Issue | Status | Type | Blocked by | Scope |
| --- | --- | --- | --- | --- |
| [#10](https://github.com/developer-1px/canvas/issues/10) | Closed | Parent | None | FigJam Pareto canvas affordance roadmap |
| [#11](https://github.com/developer-1px/canvas/issues/11) | Done | HITL | None | Audit affordances and quarantine legacy demo code |
| [#12](https://github.com/developer-1px/canvas/issues/12) | Done | AFK | #11 | Minimal FigJam-like shell anatomy |
| [#13](https://github.com/developer-1px/canvas/issues/13) | Done | AFK | #12 | Selection and keyboard command parity |
| [#14](https://github.com/developer-1px/canvas/issues/14) | Done | AFK | #13 | Sticky note creation and quick-create loop |
| [#15](https://github.com/developer-1px/canvas/issues/15) | Done | AFK | #13 | One shape tool with selected-shape variants |
| [#16](https://github.com/developer-1px/canvas/issues/16) | Done | AFK | #15 | Connector attach and routing lifecycle |
| [#17](https://github.com/developer-1px/canvas/issues/17) | Done | AFK | #13 | Section lifecycle |
| [#18](https://github.com/developer-1px/canvas/issues/18) | Done | AFK | #13 | Group lifecycle |
| [#19](https://github.com/developer-1px/canvas/issues/19) | Done | AFK | #13 | Arrange and tidy selected objects |
| [#20](https://github.com/developer-1px/canvas/issues/20) | Done | AFK | #13 | Reaction stamps |
| [#21](https://github.com/developer-1px/canvas/issues/21) | Done | HITL | #20 | Simple voting session |
| [#22](https://github.com/developer-1px/canvas/issues/22) | Done | HITL | #12, #13 | Widget-like custom interactive object seam |
| [#23](https://github.com/developer-1px/canvas/issues/23) | Done | AFK | #12 | Visual and regression safety net |

## Completion Sweep

GitHub parent issue: https://github.com/developer-1px/canvas/issues/24

This sweep tracks the remaining common canvas-editor parts that were outside
the first Pareto loop.

| Issue | Status | Type | Blocked by | Scope |
| --- | --- | --- | --- | --- |
| [#24](https://github.com/developer-1px/canvas/issues/24) | Closed | Parent | None | Canvas affordance completion sweep |
| [#25](https://github.com/developer-1px/canvas/issues/25) | Done | AFK | None | Layer order controls for selected objects |
| [#26](https://github.com/developer-1px/canvas/issues/26) | Done | AFK | #25 optional | Comment annotations |
| [#27](https://github.com/developer-1px/canvas/issues/27) | Done | AFK | None | Snap grid and alignment guides |
| [#28](https://github.com/developer-1px/canvas/issues/28) | Done | AFK | #25 | History and context command surface |
| [#29](https://github.com/developer-1px/canvas/issues/29) | Done | AFK | #25 optional | Direct nested selection |
| [#30](https://github.com/developer-1px/canvas/issues/30) | Done | HITL | None | Rotation affordance |
| [#31](https://github.com/developer-1px/canvas/issues/31) | Done | AFK | None | Quarantine obsolete DOM/CSS direction issues |

## Progress Rules

- Move issues in dependency order unless an issue explicitly has no blocker.
- Keep cleanup in the same issue as the behavior it protects.
- Default demo must stay minimal: no product rail, no narrative chrome, no DOM/CSS inspector by default.
- Widget-like work is an extension seam, not a marketplace, iframe, or external-network feature.
- Update this file after every issue state change and after every verification run.

## De-facto Completeness Pass (#32)

이전의 "completion sweep complete"는 자체 제작 inventory 기준이었다. `docs/canvas-affordance-defacto.md`로
de-facto 표준 어휘를 정본화하고, 그 5축 표의 빈 칸(필수+보편)을 **behavioral DoD**(running 앱 동작)로 닫는다.
완료 판단은 "버튼 렌더+유닛 그린"이 아니라 "표준 동작대로 앱에서 작동 + behavioral e2e"다.

| Issue | Status | 결과 |
| --- | --- | --- |
| [#32](https://github.com/developer-1px/canvas/issues/32) | Closed | parent — de-facto 갭 채우기 |
| [#33](https://github.com/developer-1px/canvas/issues/33) Flip H/V | Done | host flip op + app affordance + demo 버튼. 유닛+e2e+앱 시연(미러/undo) |
| [#34](https://github.com/developer-1px/canvas/issues/34) Zoom to selection | Already satisfied | `fitView`가 선택분 fit, 'Fit selection' 버튼으로 노출됨 |
| [#35](https://github.com/developer-1px/canvas/issues/35) Tidy up | Already satisfied | `tidyCanvasSelection` 구현+노출+e2e 존재 |
| [#36](https://github.com/developer-1px/canvas/issues/36) Image/SVG export | Done | 파이프라인은 이미 완비(직렬화+래스터+모델)였고 demo 노출만 빠져 있었음. demo export 버튼으로 마감. behavioral e2e(다운로드) |
| [#37](https://github.com/developer-1px/canvas/issues/37) Select same type | Done | `CanvasItemSelectionQuery` + `onSelectSameType`(commitSelection) + demo 버튼. 유닛+e2e |
| [#38](https://github.com/developer-1px/canvas/issues/38) Dark mode toggle | Done | `<main data-theme>` 토글, 기존 dark 토큰 재사용. behavioral e2e(repaint) |
| [#41](https://github.com/developer-1px/canvas/issues/41) Line tool | Done (변형) | 별도 tool-union cascade 대신 arrow `arrowhead` 토글(end/none)로 plain line 능력 제공. behavioral e2e(marker-end 토글) |
| [#65](https://github.com/developer-1px/canvas/issues/65) Vector pen | Done | `pen` tool + typed `path` segments + path render/select/move/export. unit + e2e |

검증(이 패스 최신): `npx tsc -b --pretty false` pass · `npx vitest run --run` 268 files/1055 tests pass · `npm run lint` pass · `npx playwright test e2e/engine-demo.e2e.ts` 30 tests pass.

남은 갭: 선택 기능 Minimap/keyboard-shortcut-help · collaboration 결정 항목 follow-view/실 multiplayer sync.

## Current Focus

The #24 completion sweep is complete. #25, #26, #27, #28, #29, #30, and #31
are all implemented, verified, and mapped back to child issues.

Completed baseline:

- File-level keep/legacy/drop inventory.
- Clear canonical path for default FigJam Pareto demo.
- Legacy quarantine or deletion plan for DOM/CSS, risk, decision, story, and duplicate UI surfaces.
- First cleanup pass for obviously unused or already-quarantined default-demo leftovers.

Current cleanup pass:

- Added the #24 completion sweep so remaining canvas parts are managed as
  separate issues instead of being inferred ad hoc.
- #25 exposes layer-order actions from the selected-object toolbar and enables
  bracket shortcuts in the focused demo.
- #31 labels issues #1-#9 as legacy cleanup and closes them as not planned for
  the active engine roadmap.
- #26 enables comment tool creation in the focused demo; comments remain
  independent selectable/editable canvas objects rather than a thread sidebar.
- #27 enables grid, alignment, and spacing snap in the focused demo while
  keeping the visible grid hidden; alignment/spacing guides render only during
  active transform previews and clear on pointer release.
- #28 connects the reusable context command menu to the focused demo; Shift+F10
  opens it at the selected object anchor, right-click opens it at the pointer,
  and duplicate/undo route through the same command handlers as toolbar and
  keyboard commands.
- #29 keeps normal group selection as the default click behavior while allowing
  deliberate modifier-click direct selection of a child inside a group.
- #30 adds optional rotation degrees for supported bounded leaf items, exposes
  quiet -15/+15/reset selected-object controls, renders rotated SVG content,
  derives visual bounds for selection/group sync, hides resize handles while a
  rotated item is selected, and keeps unsupported arrows/freehand/groups/
  sections/custom items disabled or excluded.
- Nested child selection now shows the child outline without a persistent layer
  tree or selected wrapper outline.
- Edit, text edit, move, duplicate, and delete commands now operate on the
  nested child selection; duplicate inserts the clone back into the same parent
  group instead of promoting it to the root.
- Escape clears the nested child selection, and the next normal click on that
  child returns to wrapper-level group selection.
- Sections remain distinct canvas containers, not nested group trees.
- Section frames stay anchored behind normal object reorder operations, so
  `Send to back` cannot bury a shape behind the section backdrop.
- Stamp reactions now stack vertically away from the selected-object toolbar so
  toolbar actions remain clickable when the object toolbar grows.
- Removed the `html-specimen-css` special case from the shared app shell.
- Removed the inspector takeover mode from the shared inspector.
- Removed the matching special rail CSS from shared app styles.
- Kept the custom item extension seam empty in the default demo.
- Added mobile shell smoke coverage for the engine demo and moved mobile viewport controls away from the bottom tool rail.
- Added plain Enter edit selection routing through the shared keyboard command path.
- Added keyboard e2e coverage for click select, shift multi-select, Enter/Escape edit, delete, duplicate, copy, cut, paste, and nudge.
- Exposed sticky quick-create in the minimal engine demo and kept it hidden until a sticky is selected.
- Quick-created sticky notes now inherit the selected sticky's fill, stroke, and accent while keeping body text blank.
- Shape kind replacement now goes through a Host helper so the focused demo does not repeat the `shape`/legacy `rect` branch.
- Shape e2e now verifies the one-tool variant flow and centered text contract after resize.
- Connector routing changes in the focused demo now use Host arrow routing helpers instead of local object mutation.
- Connector e2e now verifies shape-to-sticky attachment and path updates when the attached sticky moves.
- Section lifecycle work adds explicit focused-demo affordances for hiding/showing section contents and locking section contents.
- Hidden item state is now a validated base item field and is respected by scene hit-testing and SVG rendering.
- Section contextual actions now avoid mixed section/non-section command noise.
- Group lifecycle coverage now verifies invisible wrapper grouping, child selection restoration on ungroup, group duplicate/delete, child removal, and bounds sync.
- The focused demo duplicate button now calls the command handler without leaking the pointer event as duplicate source ids.
- Arrange controls now expose align, distribute, and tidy grid from the focused selection toolbar.
- Tidy grid is a host operation that requires three layout objects and excludes connector/freehand drawing items.
- Reaction stamps now appear as compact selected-object toolbar actions instead of a global emote surface.
- Created stamps are independent selected items, so duplicate/delete/copy-style item commands continue to apply.
- The default demo keeps emote controls, standalone stamp controls, and voting session chrome hidden.
- Widget scope stays limited to independent canvas object, local state, and stickable-like relationships; marketplace, iframe, and network runtime stay out of the default demo.
- Voting is now an explicit compact session panel, not an always-mounted default surface.
- Voting prompt and vote limit are configurable before start, stamps increment the local vote count, and spent quota blocks additional vote stamps.
- Ending a session preserves the result count; clearing results resets the local session state.
- Hidden voting, multiplayer presence, audio, and facilitation ceremony remain out of scope.
- Widget-like custom object scope is captured by the separated `widget-counter` fixture module.
- The widget fixture stores local state in custom item `data`, validates optional `stuckTo`, renders through the custom item renderer seam, and exposes a selected-item increment command.
- Widget fixture tests verify normal object move/duplicate/delete via the public canvas facade.
- The default demo still opts into zero custom item modules; widget fixtures are not product chrome.
- Screenshot smoke coverage now checks desktop and mobile viewports without adding image snapshots.
- The nonblank guard verifies visible rendered canvas item area instead of only checking DOM presence.
- Existing e2e coverage protects quiet selected-object toolbar behavior and sticky, shape, connector, section, group, arrange, stamp, and voting core flows.
- DOM/CSS product UI remains absent from the default engine demo regression surface.

## Verification Log

| Date | Command | Result |
| --- | --- | --- |
| 2026-05-31 | `pnpm exec vitest run src/canvas/host/operations/CanvasItemRotationOperations.test.ts src/canvas/host/document/CanvasItemSchema.test.ts src/canvas/engine/overlay/CanvasOverlayEngine.test.ts src/canvas/app/rendering/CanvasDemoSvgItemFrame.test.tsx src/canvas/app/rendering/CanvasDemoSvgItemRenderer.test.tsx src/canvas/app/workflow/CanvasAppSelectionModel.test.ts` | Passed after #30 focused unit coverage: 6 files / 45 tests |
| 2026-05-31 | `pnpm exec vitest run src/canvas/architecture/CanvasHostItemBoundaries.test.ts src/canvas/host/document/CanvasItemSchema.test.ts` | Passed after #30 architecture/schema boundary check: 2 files / 23 tests |
| 2026-05-31 | `pnpm exec playwright test -g "object-specific toolbar"` | Passed after #30 focused e2e: 1 test |
| 2026-05-31 | `pnpm exec tsc -b --pretty false` | Passed after #30 |
| 2026-05-31 | `pnpm lint` | Passed after #30 |
| 2026-05-31 | `pnpm test:e2e` | Passed after #30 rotation coverage: 20 tests |
| 2026-05-31 | `pnpm test` | Passed after #30: 257 files / 975 tests |
| 2026-05-31 | `pnpm build` | Passed after #30 |
| 2026-05-31 | `pnpm exec vitest run src/canvas/engine/selection/CanvasSelectionEngine.test.ts src/canvas/host/operations/CanvasItemCloneOperations.test.ts src/canvas/app/affordances/commands/CanvasClipboardCommandResultEffects.test.ts src/canvas/app/affordances/commands/CanvasClipboardCommandEffectPlan.test.ts src/canvas/app/affordances/commands/CanvasClipboardCommandExecution.test.ts` | Passed after #29 focused unit coverage: 5 files / 22 tests |
| 2026-05-31 | `pnpm exec playwright test -g "direct-selects"` | Passed after #29 focused e2e: 1 test |
| 2026-05-31 | `pnpm exec tsc -b --pretty false` | Passed after #29 |
| 2026-05-31 | `pnpm lint` | Passed after #29 |
| 2026-05-31 | `pnpm test:e2e` | Passed after #29 direct nested selection coverage: 20 tests |
| 2026-05-31 | `pnpm test` | Passed after #29: 256 files / 969 tests |
| 2026-05-31 | `pnpm build` | Passed after #29 |
| 2026-05-31 | `pnpm exec vitest run src/canvas/app/affordances/controls/toolbar/CanvasToolbarCommandCatalog.test.ts src/canvas/app/affordances/controls/toolbar/CanvasToolbarCommandItems.test.ts src/canvas/app/shell/CanvasAppView.test.tsx src/canvas/architecture/CanvasPackageFacadeBoundaries.test.ts` | Passed after #28: 4 files / 17 tests |
| 2026-05-31 | `pnpm exec playwright test -g "context menu"` | Passed after #28 focused e2e: 1 test |
| 2026-05-31 | `pnpm exec tsc -b --pretty false` | Passed after #28 |
| 2026-05-31 | `pnpm lint` | Passed after #28 |
| 2026-05-31 | `pnpm test:e2e` | Passed after #28 context menu coverage: 19 tests |
| 2026-05-31 | `pnpm test` | Passed after #28: 256 files / 968 tests |
| 2026-05-31 | `pnpm build` | Passed after #28 |
| 2026-05-31 | `pnpm exec vitest run src/canvas/engine/snap/CanvasSnapEngine.test.ts src/demo/CanvasDemoAssembly.test.ts src/canvas/engine/viewport/CanvasViewportEngine.test.ts` | Passed after #27: 3 files / 10 tests |
| 2026-05-31 | `pnpm exec playwright test -g "snap guides\|minimal canvas affordance"` | Passed after #27 focused e2e: 2 tests |
| 2026-05-31 | `pnpm exec tsc -b --pretty false` | Passed after #27 |
| 2026-05-31 | `pnpm lint` | Passed after #27 |
| 2026-05-31 | `pnpm test:e2e` | Passed after #27 snap/guide coverage: 18 tests |
| 2026-05-31 | `pnpm test` | Passed after #27: 256 files / 968 tests |
| 2026-05-31 | `pnpm exec vitest run src/canvas/host/operations/CanvasItemZOrderOperations.test.ts src/canvas/host/document/CanvasDocumentLayerOrderPatch.test.ts src/canvas/host/document/CanvasDocumentTransformPatch.test.ts src/canvas/app/workflow/CanvasAppSelectionModel.test.ts` | Passed after #25: 4 files / 30 tests |
| 2026-05-31 | `pnpm exec tsc -b --pretty false` | Passed after #25 |
| 2026-05-31 | `pnpm lint` | Passed after #25 |
| 2026-05-31 | `pnpm exec playwright test -g "group and section\|layer controls\|minimal canvas affordance"` | Passed after #25 focused e2e: 3 tests |
| 2026-05-31 | `pnpm test:e2e` | Passed after #25 layer-order coverage: 16 tests |
| 2026-05-31 | `pnpm exec vitest run src/demo/CanvasDemoAssembly.test.ts src/canvas/host/comment/CanvasCommentItem.test.ts src/canvas/app/rendering/CanvasDemoSvgItemRenderer.test.tsx src/canvas/app/affordances/interaction/pointer/CanvasPointerInteractionStart.test.ts src/canvas/app/affordances/interaction/pointer/CanvasPointerCreationStart.test.ts src/canvas/app/affordances/editing/text-editor/CanvasTextEditingModel.test.ts` | Passed after #26: 6 files / 37 tests |
| 2026-05-31 | `pnpm exec tsc -b --pretty false` | Passed after #26 |
| 2026-05-31 | `pnpm lint` | Passed after #26 |
| 2026-05-31 | `pnpm exec playwright test -g "comments as independent|minimal canvas affordance"` | Passed after #26 focused e2e: 2 tests |
| 2026-05-31 | `pnpm test:e2e` | Passed after #26 comment coverage: 17 tests |
| 2026-05-31 | `pnpm exec playwright test -g "screenshots nonblank|minimal canvas affordance|mobile viewport|quiet"` | Passed after #23 focused e2e: 4 tests |
| 2026-05-31 | `pnpm exec tsc -b --pretty false` | Passed after #23 |
| 2026-05-31 | `pnpm test:e2e` | Passed after #23 visual safety coverage: 15 tests |
| 2026-05-31 | `pnpm lint` | Passed after #23 |
| 2026-05-31 | `pnpm test` | Passed after #23: 256 files / 959 tests |
| 2026-05-31 | `pnpm build` | Passed after #23 |
| 2026-05-31 | `pnpm exec vitest run src/canvas/app/affordances/interaction/keyboard/CanvasKeyboardCommandDispatch.test.ts src/canvas/app/affordances/interaction/keyboard/CanvasKeyboardShortcutDispatch.test.ts src/canvas/app/affordances/interaction/keyboard/CanvasKeyboardCommandShortcuts.test.ts src/canvas/app/affordances/interaction/keyboard/CanvasKeyboardCommandShortcutCatalog.test.ts src/canvas/app/affordances/interaction/keyboard/CanvasKeyboardShortcutListeners.test.ts src/canvas/app/affordances/interaction/keyboard/CanvasKeyboardShortcutRouter.test.ts src/canvas/app/workflow/CanvasWorkspaceConsumerModel.test.ts src/canvas/app/workflow/CanvasAppSelectionModel.test.ts` | Passed: 8 files / 26 tests |
| 2026-05-31 | `pnpm exec vitest run src/demo/CanvasDemoAssembly.test.ts src/canvas/app/feature-packs/component-authoring/CanvasStickyQuickCreateExecution.test.ts src/canvas/host/component/CanvasStickyComponent.test.ts` | Passed: 3 files / 12 tests |
| 2026-05-31 | `pnpm exec tsc -b --pretty false` | Passed after #14 |
| 2026-05-31 | `pnpm test:e2e` | Passed after #14 sticky quick-create coverage: 10 tests |
| 2026-05-31 | `pnpm lint` | Passed after #14 |
| 2026-05-31 | `pnpm test` | Passed after #14: 251 files / 930 tests |
| 2026-05-31 | `pnpm build` | Passed after #14 |
| 2026-05-31 | `pnpm exec vitest run src/canvas/host/shape/CanvasShapeItem.test.ts src/canvas/app/rendering/CanvasDemoSvgRectTextItemRenderer.test.tsx src/demo/CanvasDemoAssembly.test.ts` | Passed: 3 files / 9 tests |
| 2026-05-31 | `pnpm exec tsc -b --pretty false` | Passed after #15 |
| 2026-05-31 | `pnpm test:e2e` | Passed after #15 shape resize/variant coverage: 10 tests |
| 2026-05-31 | `pnpm lint` | Passed after #15 |
| 2026-05-31 | `pnpm test` | Passed after #15: 252 files / 932 tests |
| 2026-05-31 | `pnpm build` | Passed after #15 |
| 2026-05-31 | `pnpm exec vitest run src/canvas/host/drawing/CanvasDrawingItemGeometry.test.ts src/canvas/host/operations/CanvasItemTransformOperations.test.ts src/canvas/app/affordances/interaction/pointer/CanvasPointerShapeCreationCommit.test.ts src/canvas/app/affordances/interaction/pointer/CanvasPointerTransformInteraction.test.ts` | Passed: 4 files / 22 tests |
| 2026-05-31 | `pnpm exec tsc -b --pretty false` | Passed after #16 |
| 2026-05-31 | `pnpm test:e2e` | Passed after #16 connector attachment coverage: 11 tests |
| 2026-05-31 | `pnpm lint` | Passed after #16 |
| 2026-05-31 | `pnpm test` | Passed after #16: 252 files / 932 tests |
| 2026-05-31 | `pnpm build` | Passed after #16 |
| 2026-05-31 | `pnpm exec vitest run src/canvas/app/workflow/CanvasAppSelectionModel.test.ts src/canvas/host/document/CanvasItemSchema.test.ts src/canvas/host/operations/CanvasItemLockOperations.test.ts src/canvas/app/rendering/CanvasDemoSvgItemRenderer.test.tsx src/demo/CanvasDemoAssembly.test.ts` | Passed after #17: 5 files / 36 tests |
| 2026-05-31 | `pnpm exec tsc -b --pretty false` | Passed after #17 |
| 2026-05-31 | `pnpm test:e2e` | Passed after #17 section lifecycle coverage: 11 tests |
| 2026-05-31 | `pnpm lint` | Passed after #17 |
| 2026-05-31 | `pnpm test` | Passed after #17: 253 files / 938 tests |
| 2026-05-31 | `pnpm build` | Passed after #17 |
| 2026-05-31 | `pnpm exec vitest run src/canvas/host/operations/CanvasItemGroupOperations.test.ts src/canvas/host/operations/CanvasItemRemovalOperations.test.ts src/canvas/host/operations/CanvasItemCloneOperations.test.ts src/canvas/host/operations/CanvasItemTransformOperations.test.ts src/canvas/app/rendering/CanvasDemoSvgItemRenderer.test.tsx` | Passed after #18: 5 files / 21 tests |
| 2026-05-31 | `pnpm test:e2e` | Passed after #18 group duplicate/delete coverage: 11 tests |
| 2026-05-31 | `pnpm exec tsc -b --pretty false` | Passed after #18 |
| 2026-05-31 | `pnpm lint` | Passed after #18 |
| 2026-05-31 | `pnpm test` | Passed after #18: 255 files / 944 tests |
| 2026-05-31 | `pnpm build` | Passed after #18 |
| 2026-05-31 | `pnpm exec vitest run src/canvas/host/operations/CanvasItemAlignmentOperations.test.ts src/canvas/app/workflow/CanvasAppSelectionModel.test.ts` | Passed after #19: 2 files / 18 tests |
| 2026-05-31 | `pnpm exec tsc -b --pretty false` | Passed after #19 |
| 2026-05-31 | `pnpm test:e2e` | Passed after #19 arrange/tidy coverage: 12 tests |
| 2026-05-31 | `pnpm lint` | Passed after #19 |
| 2026-05-31 | `pnpm test` | Passed after #19: 255 files / 951 tests |
| 2026-05-31 | `pnpm build` | Passed after #19 |
| 2026-05-31 | `pnpm exec vitest run src/canvas/app/workflow/CanvasAppSelectionModel.test.ts src/canvas/host/stamp/CanvasStampItem.test.ts src/canvas/host/document/CanvasItemSchema.test.ts src/demo/CanvasDemoAssembly.test.ts` | Passed after #20: 4 files / 29 tests |
| 2026-05-31 | `pnpm exec playwright test -g "reaction stamps|minimal canvas affordance"` | Passed after #20 focused e2e: 2 tests |
| 2026-05-31 | `pnpm test:e2e` | Passed after #20 reaction stamp coverage: 13 tests |
| 2026-05-31 | `pnpm test` | Passed after #20: 255 files / 953 tests |
| 2026-05-31 | `pnpm exec tsc -b --pretty false` | Passed after #20 |
| 2026-05-31 | `pnpm lint` | Passed after #20 |
| 2026-05-31 | `pnpm build` | Passed after #20 |
| 2026-05-31 | `pnpm exec vitest run src/canvas/app/workflow/CanvasAppSelectionModel.test.ts src/canvas/app/feature-packs/facilitation/useCanvasVotingSessionModel.test.ts src/canvas/app/feature-packs/stamp-authoring/useCanvasStampControls.test.tsx src/demo/CanvasEngineDemoDesignContract.test.ts` | Passed after #21: 4 files / 20 tests |
| 2026-05-31 | `pnpm exec playwright test -g "voting session\|reaction stamps\|minimal canvas affordance\|mobile viewport"` | Passed after #21 focused e2e: 4 tests |
| 2026-05-31 | `pnpm exec tsc -b --pretty false` | Passed after #21 |
| 2026-05-31 | `pnpm test:e2e` | Passed after #21 voting session coverage: 14 tests |
| 2026-05-31 | `pnpm lint` | Passed after #21 |
| 2026-05-31 | `pnpm test` | Passed after #21: 255 files / 955 tests |
| 2026-05-31 | `pnpm build` | Passed after #21 |
| 2026-05-31 | `pnpm exec vitest run src/demo/custom-items/widget-counter/WidgetCounterCustomItemModule.test.tsx src/canvas/architecture/CanvasModuleBoundaries.test.ts src/canvas/architecture/CanvasPackageFacadeBoundaries.test.ts` | Passed after #22: 3 files / 24 tests |
| 2026-05-31 | `pnpm exec tsc -b --pretty false` | Passed after #22 |
| 2026-05-31 | `pnpm test:e2e` | Passed after #22: 14 tests |
| 2026-05-31 | `pnpm lint` | Passed after #22 |
| 2026-05-31 | `pnpm test` | Passed after #22: 256 files / 959 tests |
| 2026-05-31 | `pnpm build` | Passed after #22 |
| 2026-05-31 | `pnpm exec vitest run src/canvas/architecture/CanvasAppWorkspaceBoundaries.test.ts src/canvas/app/affordances/interaction/keyboard/CanvasKeyboardCommandDispatch.test.ts src/canvas/app/affordances/interaction/keyboard/CanvasKeyboardShortcutRouter.test.ts src/canvas/app/workflow/CanvasWorkspaceConsumerModel.test.ts` | Passed after context boundary adjustment: 4 files / 14 tests |
| 2026-05-31 | `pnpm lint` | Passed after #13 |
| 2026-05-31 | `pnpm test` | Passed after #13: 251 files / 930 tests |
| 2026-05-31 | `pnpm build` | Passed after #13 |
| 2026-05-31 | `pnpm test:e2e` | Passed after #13 keyboard regression: 9 tests |
| 2026-05-31 | `pnpm exec vitest run src/canvas/app/shell/CanvasAppView.test.tsx src/canvas/app/affordances/editing/inspector/CanvasObjectInspector.test.tsx src/demo/CanvasDemoAssembly.test.ts` | Passed: 3 files / 13 tests |
| 2026-05-31 | `pnpm exec tsc -b --pretty false` | Passed |
| 2026-05-31 | `pnpm test:e2e` | Passed after mobile smoke addition: 8 tests |
| 2026-05-31 | `pnpm lint` | Passed after #11/#12 cleanup |
| 2026-05-31 | `pnpm test` | Passed after #11/#12 cleanup: 251 files / 929 tests |
| 2026-05-31 | `pnpm build` | Passed after #11/#12 cleanup |
| 2026-05-31 | `pnpm lint` | Passed before issue split |
| 2026-05-31 | `pnpm test` | Passed before issue split: 251 files / 929 tests |
| 2026-05-31 | `pnpm build` | Passed before issue split |
| 2026-05-31 | `pnpm test:e2e` | Passed before issue split: 7 tests |
