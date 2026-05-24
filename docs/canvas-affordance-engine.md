# Canvas Affordance Engine

목표: 앱별 객체 모델과 렌더러에 묶이지 않는 캔버스 조작 문법을 만든다.

## 원칙

1. 모든 Affordance는 Feature Toggle 뒤에 둔다.
2. Host는 데이터와 저장을 소유한다.
3. App workflow는 concrete item adapter를 주입한다.
4. Engine은 intent, gesture, selection, creation result, overlay state, command routing을 소유한다.
5. Renderer Adapter는 그리기만 한다.
6. Scene Adapter는 bounds, hit target, parent/group, editable target만 제공한다.
7. Drawing Item은 Demo Host item이며 Core Contract에 포함하지 않는다.
8. 사회적 약속이 된 캔버스 문법은 내부 Module이 관리하고, 제품별 의미는 Canvas App Assembly에서 외부 등록한다.

## Layer / Concept / Role

| Layer | Concept | Role |
| --- | --- | --- |
| app | workflow | React state와 engine/host/renderer 연결 |
| engine | behavior | host와 renderer를 모르는 조작 규칙 |
| host | domain | demo canvas item, document, tree, operations |
| renderer | adapter | engine overlay와 주입된 item layer를 실제 SVG로 배치 |
| ui | controls | toolbar, palette, editor 같은 화면 조각 |
| ui | toolbar items | feature toggle과 built-in/custom state를 toolbar item group grammar로 변환 |
| ui | toolbar command items | built-in command feature toggle과 availability를 command item group grammar로 변환 |

## Folder Structure

| Folder | 책임 |
| --- | --- |
| `package.json` | Canvas package export map을 public facade entry로 고정한다 |
| `src/canvas/architecture/CanvasModuleBoundaries.test.ts` | Module seam import 규칙을 회귀 테스트로 검증한다 |
| `src/canvas/architecture/CanvasPackageConsumer.test.ts` | 외부 소비자처럼 `canvas`와 `canvas/*` export를 import해 public package surface를 검증한다 |
| `src/canvas/architecture/CanvasPackageManifest.test.ts` | package manifest export map이 public facade만 가리키는지 검증한다 |
| `src/canvas/app/shell` | CanvasApp composition과 shell style |
| `src/canvas/app/index.ts` | Canvas App Shell과 workflow 조립 계약을 노출하는 App public facade |
| `src/canvas/app/extensions/CanvasAppExtensionIds.ts` | 제품별 descriptor와 registry key가 공유하는 lower-kebab 안정 id 계약을 검증한다 |
| `src/canvas/app/extensions/CanvasAppExtensionRegistries.ts` | assembly 단계에서 extension entry와 record key 검증, 중복 실패 처리를 한 내부 계약으로 제공한다 |
| `src/canvas/app/extensions/CanvasAppExtensionBundle.ts` | Custom command/tool/item renderer/validator/inspector output slot과 slot별 중복 병합/snapshot/defaulting 규칙을 소유하고 Assembly output 계약에 합성된다 |
| `src/canvas/app/extensions/CanvasAppExtensionStateContracts.ts` | Custom command state와 custom creation tool state의 consumer-facing shape를 execution/runtime helper와 분리한다 |
| `src/canvas/app/extensions/CanvasAppDescriptorSnapshot.ts` | 외부 등록 descriptor의 copy/freeze 규칙을 Assembly와 Custom Item Module snapshot이 공유하게 한다 |
| `src/canvas/app/stage/CanvasAppStageElement.ts` | stage DOM element의 bounds, pointer capture, wheel listener를 caller Interface 뒤에 숨기고 mount ref bridge는 Controller로 분리한다 |
| `src/canvas/app/rendering` | Demo `CanvasItem` tree를 SVG item layer로 바꾸는 App-owned Adapter |
| `src/canvas/app/rendering/CanvasAppRenderingContracts.ts` | 외부 조립자가 쓰는 App-owned renderer authoring Interface를 Demo SVG registry type name과 분리한다 |
| `src/canvas/app/rendering/CanvasAppRendererRegistries.ts` | App-named component/custom item renderer registry 생성, 검증, default를 소유하고 Demo SVG registry 구현명을 외부 authoring seam 뒤에 숨긴다 |
| `src/canvas/app/rendering/CanvasAppStageAdapter.tsx` | App Shell이 stage props를 알지 않도록 stage ReactNode를 만드는 Adapter Interface를 제공하고, stage mount Interface를 기본 SVG Stage ref로 매핑한다 |
| `src/canvas/app/rendering/CanvasAppItemLayerAdapter.tsx` | App workflow가 concrete Demo SVG item layer 없이 stage children을 만들도록 하는 Adapter Interface를 제공하고, SVG item pointer event를 App pointer Interface로 매핑한다 |
| `src/canvas/app/workflow/CanvasAppConsumerContracts.ts` | Command, extension, interaction, keyboard, pointer, stage, stage element runtime fan-out의 입력과 consumer별 출력 Interface를 한곳에 모은다 |
| `src/canvas/app/rendering/CanvasDemoSvgItemFrame.tsx` | Demo SVG item의 lock, selected, pointer event, outline wrapper 문법을 item type별 shape rendering과 분리해 소유한다 |
| `src/canvas/app/rendering/CanvasDemoSvgDrawingItemRenderer.tsx` | Marker, highlighter, arrow의 SVG path/line shape와 arrow marker 사용을 소유한다 |
| `src/canvas/app/rendering/CanvasDemoSvgRectTextItemRenderer.tsx` | Rect와 text item의 SVG shape, embedded text foreignObject 문법을 소유한다 |
| `src/canvas/app/rendering/CanvasDemoSvgComponentPresentationRegistry.ts` | Demo component presentation key와 SVG rendering strategy를 외부 조립 가능한 registry로 연결한다 |
| `src/canvas/app/rendering/CanvasDemoSvgBuiltInComponentPresentationRenderers.tsx` | 기본 Demo component presentation key와 SVG renderer strategy mapping을 소유한다 |
| `src/canvas/app/rendering/CanvasDemoSvgComponentPresentationRegistryContracts.ts` | Component presentation renderer registry key와 render strategy slot을 검증한다 |
| `src/canvas/app/rendering/CanvasDemoSvgComponentRendererExecution.tsx` | Component presentation resolver 호출, renderer lookup, render 실행, throw 시 fallback containment를 소유한다 |
| `src/canvas/app/rendering/CanvasDemoSvgComponentRenderFallback.tsx` | Component presentation resolver/renderer 실패 때 쓰는 기본 component card fallback shape를 소유한다 |
| `src/canvas/app/rendering/CanvasDemoSvgCustomItemRendererRegistry.tsx` | Custom item presentation key와 SVG rendering strategy를 외부 조립 가능한 registry로 연결한다 |
| `src/canvas/app/rendering/CanvasDemoSvgCustomItemRendererRegistryContracts.ts` | Custom item renderer registry key와 render strategy slot을 검증한다 |
| `src/canvas/app/rendering/CanvasDemoSvgCustomItemRendererExecution.tsx` | Custom item renderer lookup, render 실행, throw 시 fallback containment를 소유한다 |
| `src/canvas/app/rendering/CanvasDemoSvgCustomItemRenderFallback.tsx` | Custom item renderer 누락/실패 때 쓰는 unknown custom item card fallback shape를 소유한다 |
| `src/canvas/app/workflow` | React state와 engine/host/renderer wiring |
| `src/canvas/app/commands/CanvasStandardCommandExecution.ts` | 내부 canvas command grammar 실행을 effect plan 생성과 document effect 적용으로 조립한다 |
| `src/canvas/app/commands/CanvasStandardCommandEffectPlan.ts` | 내부 canvas command grammar와 Engine command 결과를 App document effect descriptor로 변환한다 |
| `src/canvas/app/commands/CanvasStandardCommandDocumentEffects.ts` | Standard command 결과를 document commit fallback, selection commit, editing clear, history restore effect로 반영한다 |
| `src/canvas/app/commands/CanvasClipboardCommandExecution.ts` | Clipboard command effect plan 생성과 clipboard/document effect 적용을 조립한다 |
| `src/canvas/app/commands/CanvasClipboardCommandEffectPlan.ts` | Copy, cut, paste, duplicate, clone command를 clone result/add item/copy/cut effect descriptor로 변환하고 paste offset 계산을 소유한다 |
| `src/canvas/app/commands/CanvasClipboardCommandEffects.ts` | Clipboard command effect descriptor를 Host clipboard, document commit/selection/editing update와 실행 결과로 적용한다 |
| `src/canvas/app/commands/CanvasAppCustomCommands.ts` | Engine command union을 수정하지 않고 제품별 business action을 toolbar command로 등록하는 descriptor를 제공한다 |
| `src/canvas/app/commands/CanvasAppCustomCommandContracts.ts` | Custom command descriptor shape와 id registry contract를 검증한다 |
| `src/canvas/app/commands/CanvasAppCustomCommandExecution.ts` | Custom command toolbar state, availability, run 호출과 실패 containment를 소유한다 |
| `src/canvas/ui/toolbar/CanvasToolbarItems.ts` | Feature toggle, availability, built-in/custom tool, built-in/custom command 상태를 toolbar item group grammar로 변환한다 |
| `src/canvas/ui/toolbar/CanvasToolbarCommandItems.ts` | Built-in toolbar command group, feature toggle, availability를 command item group grammar로 변환한다 |
| `src/canvas/app/inspector/CanvasAppInspectorPanels.ts` | 기본 bounds inspector를 수정하지 않고 제품별 선택 항목 패널을 등록하는 descriptor를 제공한다 |
| `src/canvas/app/inspector/CanvasAppInspectorPanelContracts.ts` | Inspector panel descriptor shape와 id registry contract를 검증한다 |
| `src/canvas/app/modules/CanvasAppCustomItemModules.ts` | 제품별 item kind에 필요한 creation tool, renderer, validator, inspector, command descriptor와 define 계약을 소유한다 |
| `src/canvas/app/modules/CanvasAppCustomItemModuleAssembly.ts` | Custom item module descriptor list와 disabled module ids를 Extension Bundle output으로 조립하고 duplicate/unknown/snapshot 규칙을 적용한다 |
| `src/canvas/app/modules/CanvasAppCustomItemModuleContracts.ts` | Custom item module descriptor, disabled module id, duplicate module id, assembled tool shortcut contract를 검증한다 |
| `src/canvas/app/modules/CanvasAppCustomItemValidatorContracts.ts` | Custom item validator registry key와 validate strategy slot을 검증한다 |
| `src/canvas/app/modules/CanvasAppCustomItemModuleRuntime.ts` | Module-owned creation tool envelope 생성, item validation, renderer/validator registry 변환과 실패 containment를 소유한다 |
| `src/canvas/app/modules/CanvasAppCustomItemModuleSnapshot.ts` | Custom item module define/assembly 후 외부 descriptor mutation에서 module과 assembled extension parts를 보호한다 |
| `src/canvas/app/tools/CanvasAppCustomCreationTools.ts` | 내부 Tool union에 구체 id를 추가하지 않고 제품별 생성 도구를 등록하는 descriptor를 제공한다 |
| `src/canvas/app/tools/CanvasAppCustomCreationToolContracts.ts` | Custom creation tool descriptor shape와 reserved/duplicate shortcut conflict를 검증한다 |
| `src/canvas/app/tools/CanvasAppCustomCreationToolRuntime.ts` | Custom creation tool id 변환, toolbar state, lookup, shortcut matching을 소유한다 |
| `src/canvas/app/workflow/CanvasAppAssembly.ts` | Host item adapter, component library, custom command, custom item module, inspector panel, initial items, SVG presentation registry 같은 제품별 의미를 외부 조립 seam으로 제공한다 |
| `src/canvas/app/workflow/CanvasAppAssemblyTypes.ts` | App Assembly input/output type 계약을 runtime 조립 구현과 분리해 소유한다 |
| `src/canvas/app/workflow/CanvasAppAssemblyInputTypes.ts` | Affordance/component/adapter/workspace child assembly input field 계약을 runtime 조립 구현과 분리해 소유한다 |
| `src/canvas/app/workflow/CanvasAppExtensionAssemblyTypes.ts` | 외부 extension input field 계약을 runtime extension 조립 구현과 분리해 소유하고 Assembly input 계약에 합성된다 |
| `src/canvas/app/workflow/CanvasAppAdapterAssembly.ts` | Item, item layer, stage adapter fallback을 조립한다 |
| `src/canvas/app/workflow/CanvasAppAffordanceAssembly.ts` | 제품별 affordance feature toggle override와 default affordance config fallback을 조립한다 |
| `src/canvas/app/workflow/CanvasAppAssemblyContracts.ts` | 조립된 assembly output의 component library resolver, renderer coverage, custom extension registry, initial item, adapter shape를 검증한다 |
| `src/canvas/app/workflow/CanvasAppDefaultAssembly.ts` | Built-in app baseline과 Demo default initial selection을 소유한다 |
| `src/canvas/app/workflow/CanvasAppWorkspaceAssembly.ts` | Workspace 초기 items normalization, Demo default selection fallback, storage provider fallback을 조립한다 |
| `src/canvas/app/workflow/CanvasAppWorkspaceAssemblyContracts.ts` | Workspace 초기 items, 초기 selection, storage provider 계약을 검증하고, selection과 item tree 불일치를 runtime 진입 전에 차단한다 |
| `src/canvas/app/workflow/CanvasAppAssemblySnapshot.ts` | 조립된 assembly output을 외부 mutation에서 보호하도록 component library, extension registry, initial item, adapter를 snapshot/freeze 한다 |
| `src/canvas/app/workflow/CanvasAppAssemblyModelContracts.ts` | Public Assembly output과 workflow 내부 consumer context를 분리하는 App Assembly Model type 계약을 소유한다 |
| `src/canvas/app/workflow/CanvasAppAffordanceModelContracts.ts` | Affordance config fan-out의 consumer별 내부 Interface를 명시한다 |
| `src/canvas/app/workflow/index.ts` | App Shell이 사용하는 workflow public entry |
| `src/canvas/app/workflow/useCanvasAppModel.ts` | command, pointer, keyboard, viewport, text editing wiring과 control별 view props 조립을 App Shell에 숨긴다 |
| `src/canvas/app/workflow/CanvasAppControlModel.ts` | component palette, toolbar, status, zoom controls props와 command availability/status/selected fit target 규칙을 만든다 |
| `src/canvas/app/workflow/useCanvasAppExtensionModel.ts` | 외부 custom command/tool descriptor를 toolbar state, custom tool state, custom command run callback으로 바꾼다 |
| `src/canvas/app/workflow/CanvasAppStageModel.tsx` | stage와 item layer Adapter 호출 순서, text editor blur, context menu 차단, render 실패 containment를 소유한다 |
| `src/canvas/app/workflow/CanvasWorkflowContract.ts` | App workflow hook들이 공유하는 document commit, selection, clipboard contract |
| `src/canvas/app/workflow/useCanvasFindReplaceModel.ts` | document text search 상태와 Find/Replace control props를 App Shell에 숨긴다 |
| `src/canvas/app/workflow/useCanvasInteractionModel.ts` | tool, gesture, marquee, draft, snap guide, overlay 상태 생명주기를 App Shell에 숨긴다 |
| `src/canvas/app/workflow/useCanvasTextEditorModel.ts` | text editing state, editable item lookup, text editor props를 App Shell에 숨긴다 |
| `src/canvas/app/workflow/useCanvasWorkspaceModel.ts` | 저장된 workspace snapshot, document history, viewport, read model, id 생성을 App Shell에 숨긴다 |
| `src/canvas/app/authoring/index.ts` | `canvas/app/authoring` subpath로 외부 조립자가 쓰는 assembly input과 custom descriptor 계약을 모으고 App runtime hook/default/validator를 제외한다 |
| `src/canvas/app/workflow/CanvasWorkspaceConsumerContracts.ts` | Workspace document/read/viewport fan-out의 입력과 consumer별 출력 Interface를 명시한다 |
| `src/canvas/app/inspector/CanvasAppInspectorPanelExecution.ts` | Inspector panel visibility/render 호출과 실패 시 omit containment를 소유한다 |
| `src/canvas/app/keyboard/CanvasKeyboardShortcutIntent.ts` | Keydown 입력, typing target suppression, temporary pan, escape, command/tool shortcut precedence를 실행 가능한 keyboard intent로 조립한다 |
| `src/canvas/app/keyboard/CanvasKeyboardCommandShortcutIntent.ts` | Built-in command, viewport, nudge keyboard shortcut grammar를 feature toggle과 selection 기준으로 keyboard intent로 변환한다 |
| `src/canvas/app/keyboard/CanvasKeyboardToolShortcutIntent.ts` | Built-in tool shortcut precedence와 custom creation tool shortcut matching을 소유한다 |
| `src/canvas/app/keyboard/CanvasKeyboardShortcutRouter.ts` | Keyboard intent의 preventDefault와 handler 실행을 적용한다 |
| `src/canvas/app/pointer/CanvasAppPointerInput.ts` | React/SVG pointer event를 App workflow가 쓰는 최소 pointer/event Interface로 변환한다 |
| `src/canvas/app/pointer/CanvasPointerGeometry.ts` | DOM/SVG pointer 좌표 변환 |
| `src/canvas/app/pointer/CanvasPointerInteractionStart.ts` | Pointer-down 시 tool/gesture/config/custom tool 상태를 active interaction, draft overlay, immediate item creation으로 변환한다 |
| `src/canvas/app/pointer/CanvasPointerInteractionStartEffects.ts` | Pointer-down start 결과를 pointer capture, document commit, selection/live item, draft overlay, editing/tool/gesture state로 적용한다 |
| `src/canvas/app/pointer/CanvasItemPointerInteractionStart.ts` | Item pointer-down/text double-click 시 selection, edit state, alt-drag duplicate, move interaction 시작 상태를 계산한다 |
| `src/canvas/app/pointer/CanvasResizePointerInteractionStart.ts` | Resize handle pointer-down 시 selected bounds, handle, selection, item snapshot을 resize interaction 시작 상태로 변환한다 |
| `src/canvas/app/pointer/CanvasPointerInteractionPreview.ts` | Pointer-move 시 active interaction을 viewport, live item, marquee, selection, draft overlay, snap guide preview로 변환한다 |
| `src/canvas/app/pointer/CanvasPointerCreationPreview.ts` | Create-rect, marker, highlighter, arrow, custom creation의 draft overlay와 currentWorld/moved preview를 소유한다 |
| `src/canvas/app/pointer/CanvasPointerCommentCreation.ts` | Comment tool click을 Canvas Comment Item 생성과 optional clicked-item attachment로 변환한다 |
| `src/canvas/app/pointer/CanvasPointerComponentCreation.ts` | Sticky note tool click을 Component Library `sticky` template 기반 component item 생성으로 변환한다 |
| `src/canvas/app/pointer/CanvasPointerInteractionMovement.ts` | Drag threshold 기반 moved 판정을 pointer interaction Module들이 공유한다 |
| `src/canvas/app/pointer/CanvasPointerInteractionLifecycle.ts` | Pointer-up/cancel 시 active interaction을 문서 변경, selection 변경, edit 진입, cancel rollback으로 확정하거나 되돌린다 |
| `src/canvas/core` | Host item과 renderer를 모르는 geometry, viewport, id, primitive math 같은 재사용 계약 |
| `src/canvas/core/CanvasBoundsResize.ts` | Bounds resize, aspect ratio lock, center resize, handle point, item bounds scaling을 소유한다 |
| `src/canvas/core/CanvasStableIds.ts` | persisted kind, presentation key, registry key에 쓰는 lower-kebab 안정 id 계약 |
| `src/canvas/entities` | Core geometry와 Demo canvas item의 안정적인 type-only entity 계약. Runtime helper는 Core/Host/App seam에 둔다 |
| `src/canvas/engine` | Host item과 renderer를 모르는 조작 규칙. 외부 소비자는 `src/canvas/engine` public facade를 사용한다 |
| `src/canvas/engine/snap` | Grid, alignment, spacing snap과 guide 계산 |
| `src/canvas/host/model` | Demo canvas item model. Core 재사용 계약에 포함하지 않는다 |
| `src/canvas/host` | Demo canvas item public facade |
| `src/canvas/host/component/CanvasBuiltInComponentTemplates.ts` | Sticky, label, card 같은 기본 Demo component catalogue를 소유한다 |
| `src/canvas/host/component/CanvasComponentLibrary.ts` | Demo component template, presentation key, component item 생성을 함께 제공한다 |
| `src/canvas/host/component/CanvasComponentLibraryContracts.ts` | Component library input, component template descriptor shape, stable id/presentation, duplicate template id를 검증한다 |
| `src/canvas/host/attachment/CanvasItemAttachment.ts` | Comment/stamp 같은 collaboration affordance가 선택 item에 붙는 `attachedTo` 판정을 소유한다 |
| `src/canvas/host/comment/CanvasCommentItem.ts` | Comment item 생성, 저장 shape 검증, attached target 판정, translate helper를 소유한다 |
| `src/canvas/host/drawing/CanvasDrawingItemStyles.ts` | Built-in Drawing Item의 stroke/opacity 기본값을 소유하고 draft overlay와 item creation이 공유하게 한다 |
| `src/canvas/host/document/CanvasDocumentController.ts` | App workflow가 사용하는 Host Document Controller. zod-crud, JSON Patch, selection snapshot, clipboard 구현을 숨긴다 |
| `src/canvas/host/document/CanvasDocumentChangePatch.ts` | High-level CanvasItemsChange를 Host-owned JSON Patch factory 호출로 변환하는 change-to-patch grammar를 소유한다 |
| `src/canvas/host/document/CanvasDocumentPatchTreeDiff.ts` | before/after Demo item tree를 patch factory용 topmost changed entry, changed group entry, removal entry로 변환한다 |
| `src/canvas/host/document/CanvasDocumentReorderPatch.ts` | before/after Demo item tree의 sibling order 차이를 zod-crud JSON Patch `move` operation으로 변환한다 |
| `src/canvas/host/read/CanvasItemReadModel.ts` | Demo item tree 조회, bounds, selection 정규화, Scene Adapter 생성을 tree helper 구현 없이 제공한다 |
| `src/canvas/host/operations` | Transform, text, clone, remove, group item operations |
| `src/canvas/host/tree` | Bounds, traversal, selection tree helpers |
| `src/canvas/host/adapters` | Demo host item을 engine interface에 맞추는 adapter |
| `src/canvas/renderer` | Renderer public facade |
| `src/canvas/renderer/svg/CanvasSvgDrawingPrimitives.ts` | SVG path data와 arrow marker id/IRI를 Renderer-owned drawing primitive 계약으로 제공한다 |
| `src/canvas/renderer/svg` | Demo item을 모르는 SVG stage/overlay adapter |
| `src/canvas/index.ts` | 외부 조립자와 Demo가 사용하는 Canvas package public entry |
| `src/canvas/ui` | Toolbar, palette, status, editor controls |
| `src/demo/CanvasDemoAssembly.ts` | canvas Module 밖에서 demo-specific custom item modules를 조립한다 |
| `src/demo/custom-items` | demo-specific custom item module 구현과 해당 표현 스타일. `<name>/index.ts` convention으로 자동 수집한다 |

## Feature Toggle Shape

```ts
type CanvasAffordanceConfig = {
  tools: Record<ToolId, boolean>
  commands: Record<CommandId, boolean>
  gestures: Record<GestureId, boolean>
  overlays: Record<OverlayId, boolean>
  shortcuts: Record<ShortcutId, boolean>
}
```

규칙:

- Toggle이 꺼진 기능은 시각 entry point, shortcut, pointer gesture, command API에서 모두 꺼진다.
- Snap 계열 gesture와 guide overlay도 toggle로 독립 제어한다.
- Toggle이 꺼져도 문서 상태는 손상하지 않는다.
- Toggle 기본값은 모두 on이다. App workflow가 필요한 것만 끈다.
- Canvas App Affordance Assembly는 제품별 feature toggle override와 default affordance config fallback 조립을 소유한다.
- Canvas App Default Assembly는 built-in app baseline과 Demo default initial selection을 소유한다.

## Extraction State

현재 앱에서 뽑는 Module:

1. `core`: Engine과 Renderer Adapter가 공유하는 geometry, viewport, id, tool, interaction kind.
2. `CanvasAffordances`: 안정적인 tool/command/gesture/overlay/shortcut id와 label, title, default toggle. 완료.
3. `CanvasOverlayEngine`: Renderer Adapter가 그릴 renderer-independent overlay state 생성. `CanvasSceneAdapter` 입력 사용.
4. `CanvasSvgOverlayRenderer`: SVG Renderer Adapter로 overlay state를 그린다.
5. `CanvasDemoSvgItemLayer`: App-owned Adapter로 Demo Host item을 SVG item layer로 그린다.
6. `CanvasCommandEngine`: command availability와 command result routing. Demo item 변경은 `CanvasItemCommandAdapter`가 수행한다.
7. `CanvasSelectionEngine`: item click selection과 marquee hit selection 계산. `CanvasSceneAdapter` 입력 사용.
8. `CanvasTransformEngine`: move/resize transform routing. Demo item 변경은 `CanvasItemTransformAdapter`가 수행한다.
9. `CanvasGestureEngine`: pointer input을 canvas/item gesture intent로 변환한다.
10. `CanvasCreationEngine`: create tool result routing. Demo item 생성은 `CanvasItemCreationAdapter`가 수행한다.
11. `CanvasItemSceneAdapter`: Demo item tree를 renderer-independent scene entry로 변환한다.
12. `CanvasSnapEngine`: move/create/resize에서 grid, alignment, spacing snap과 renderer-independent guide state를 계산한다.

## Boundary Check

- Engine Module은 `core`, `CanvasAffordances`, `CanvasSceneAdapter` 같은 renderer-independent 입력만 사용한다.
- Engine Module은 Demo `CanvasItem`, `CanvasOperations`, `CanvasTree`, SVG Renderer를 import하지 않는다.
- Entities Module은 `core` type만 사용하고 app, engine, host, renderer, ui 구현을 import하지 않는다.
- Host domain Module은 Engine 구현 파일을 import하지 않는다. Engine Adapter 타입은 `src/canvas/engine` public facade에서 받는다.
- App과 Renderer는 Demo Host 내부 subpath를 import하지 않는다. 안정 entity type은 `src/canvas/entities` type-only public contract에서 받는다.
- UI controls는 Demo Host를 import하지 않는다. Host component/template/text editing 값은 App workflow가 UI prop으로 주입한다.
- App workflow는 Host document 구현 파일을 import하지 않는다. 문서 변경, history, selection, clipboard, text search는 명시적인 Host Document Controller interface를 통해 사용한다.
- zod-crud document, JSON Patch, selection snapshot, clipboard 구현은 Host document layer 밖으로 새지 않는다.
- Canvas Document Changes는 document commit orchestration을 맡고, CanvasItemsChange별 JSON Patch factory 선택은 Canvas Document Change Patch가 소유한다.
- Canvas Document Patches는 tree flattening, topmost filtering, item equality, removal path ordering을 Canvas Document Patch Tree Diff에 위임한다.
- Canvas Document Patches는 z-order sibling traversal와 JSON Patch move sequence 생성을 Canvas Document Reorder Patch에 위임한다.
- App hook들은 `useCanvasDocument` 구현 파일에서 타입을 가져오지 않는다. document commit과 selection contract는 Canvas Workflow Contract를 통해 공유한다.
- App workflow는 Host tree helper를 import하지 않는다. item 조회, bounds, selection 정규화, Scene Adapter 생성은 Canvas Item Read Model을 통해 사용한다.
- App workflow에서 read model 생성은 Canvas Workspace Model이 소유한다. Inspector, pointer, viewport hook은 생성하지 않고 주입받은 Canvas Item Read Model만 사용한다.
- App Shell은 workflow public entry만 import한다. command, pointer, keyboard, viewport, text editing wiring은 Canvas App Model이 소유한다.
- App Shell은 workspace 저장, initial item seed, read model 생성, id seed 계산을 직접 import하지 않는다. Canvas Workspace Model을 통해 사용한다.
- Standard command hook은 toolbar/keyboard용 callback wiring을 맡고, Canvas Standard Command Execution은 plan 생성과 effect 적용만 조립한다. Engine command 호출과 document effect descriptor 생성은 Canvas Standard Command Effect Plan이, document commit/selection/editing/history effect routing은 Canvas Standard Command Document Effects가 소유한다.
- Clipboard command hook은 paste index와 callback wiring을 맡고, Canvas Clipboard Command Execution은 plan 생성과 effect 적용만 조립한다. Clone/duplicate/paste/cut plan과 paste offset 계산은 Canvas Clipboard Command Effect Plan이, Host clipboard/document/editing effect routing은 Canvas Clipboard Command Effects가 소유한다.
- Canvas Toolbar는 item/button 렌더링과 click dispatch를 맡고, tool/custom command 항목 assembly는 Canvas Toolbar Items가, built-in command group grammar는 Canvas Toolbar Command Items가 소유한다.
- Keyboard shortcut router는 event preventDefault와 handler 실행을 맡고, keydown orchestration은 Canvas Keyboard Shortcut Intent가, built-in command/viewport/nudge shortcut grammar는 Canvas Keyboard Command Shortcut Intent가, built-in/custom tool shortcut precedence는 Canvas Keyboard Tool Shortcut Intent가 소유한다.
- App workflow는 `CANVAS_ITEM_ENGINE_ADAPTERS`를 통해 concrete item adapter를 주입한다.
- App workflow는 Canvas App Assembly를 통해 concrete item adapter, component library, custom command, custom item module, inspector panel, initial items, presentation registry를 주입받는다.
- Canvas App Assembly input은 output type의 `Partial`이 아니라 Host가 조립할 수 있는 필드만 명시한 외부 입력 계약이다.
- Canvas App Assembly composition, output contract validation, output snapshot/freeze는 분리하고, validation은 Canvas App Assembly Contracts가, mutation 방어는 Canvas App Assembly Snapshot이 소유한다.
- Canvas App Custom Item Module define, Custom Item Module Assembly output, Canvas App Assembly output은 define/조립 후 외부 descriptor, adapter, initial item mutation에 흔들리지 않도록 snapshot으로 보관한다.
- Canvas App Assembly initial items는 조립된 custom item validator로 assembly 단계에서 검증되어 잘못된 Host seed가 React document 생성까지 넘어가지 않는다.
- App과 UI는 Renderer Adapter 내부 파일을 import하지 않는다. SVG stage는 `src/canvas/renderer` public facade에서 사용한다.
- Renderer Adapter는 `CanvasOverlayState`와 주입된 item layer를 받아 SVG로 배치하며, Engine은 SVG/DOM 구현을 모른다.
- Renderer Stage는 Demo `CanvasItem`, Host read model, Canvas Component Library를 import하지 않는다.
- Canvas SVG Drawing Primitives가 SVG path data와 arrow marker id/IRI를 소유해서 Renderer Stage defs와 App-owned item layer가 문자열 계약을 중복하지 않는다.
- Demo SVG Item Layer Adapter는 App-owned Adapter로 Demo component presentation key resolver와 presentation registry를 받아 그리기 전략을 고른다.
- Demo SVG Item Frame이 lock/selected/pointer/outline wrapper 문법을 소유해서 item type별 shape renderer branch가 공통 interaction frame을 복사하지 않는다.
- Demo SVG Item Layer Adapter는 tree/frame orchestration을 맡고, marker/highlighter/arrow shape 렌더링은 Demo SVG Drawing Item Renderer가 소유한다.
- Demo SVG Item Layer Adapter는 rect/text shape와 embedded text foreignObject 문법을 알지 않고 Demo SVG Rect/Text Item Renderer에 위임한다.
- Demo SVG Built-in Component Presentation Renderers가 기본 component presentation renderer mapping을 소유하고, Demo SVG Component Presentation Registry Contracts가 외부 renderer registry shape를 검증한다.
- Demo SVG Component Renderer Execution이 component presentation resolver와 renderer lookup/실행 실패 containment를 소유하고, Demo SVG Component Render Fallback이 기본 component card fallback shape를 소유한다.
- Demo SVG Custom Item Renderer Registry Contracts가 외부 custom item renderer registry shape를 검증한다.
- Demo SVG Custom Item Renderer Execution이 custom item renderer lookup과 실행 실패 containment를 소유하고, Demo SVG Custom Item Render Fallback이 unknown custom item card shape를 소유한다.
- 새 Demo component kind가 기존 presentation을 재사용하면 Canvas Built-in Component Templates만 바꾼다. 제품별 component kind는 외부 조립된 `CanvasComponentLibrary`로 등록한다. 새 presentation은 Canvas App Assembly에 presentation renderer를 함께 등록한다.
- Canvas Component Library의 presentation key가 component presentation renderer registry에 없으면 Canvas App Assembly가 실패한다.
- Canvas Component Library Contracts는 외부 component template의 id/presentation, 필수 display/style string, 양수 크기, optional string list shape를 생성 단계에서 검증하고, Canvas Component Library는 생성 후 외부 template mutation에 흔들리지 않도록 snapshot을 보관한다.
- Canvas App Assembly는 주입된 Canvas Component Library의 template 목록과 `getTemplate`, `getPresentation` resolver 결과가 어긋나면 실패한다.
- Canvas App Assembly의 component presentation renderer input은 기본 SVG presentation registry를 대체하지 않고 extension/override로 합성된다.
- 제품별 business action은 Engine command union에 추가하지 않고 Canvas App Assembly의 custom command descriptor로 등록한다.
- Canvas App Custom Command Context는 내부 Canvas Workflow Contract를 외부 authoring Interface로 노출하지 않고 필요한 commit/document slot을 자체 public context 계약으로 명시한다.
- Custom command의 availability/run 실패는 내부 command loop를 깨지 않고 disabled/false로 containment 된다.
- Canvas App Custom Command descriptor shape 검증과 toolbar state/run execution은 분리하고, validation은 Canvas App Custom Command Contracts가, 실행 실패 containment는 Canvas App Custom Command Execution이 소유한다. Descriptor Module은 validation/execution helper를 재노출하지 않는다.
- Canvas App Custom Command State와 Canvas App Custom Creation Tool State shape는 Canvas App Extension State Contracts가 소유하고, execution/runtime Module은 state 생성과 실행 mechanics만 소유한다.
- 제품별 item creation tool은 내부 builtin tool list에 추가하지 않고 Canvas App Custom Item Module에 등록한다.
- Canvas App Custom Creation Tool descriptor shape/shortcut conflict 검증과 runtime state/lookup/shortcut matching은 분리하고, validation은 Canvas App Custom Creation Tool Contracts가, runtime behavior는 Canvas App Custom Creation Tool Runtime이 소유한다. Descriptor Module은 validation/runtime helper를 재노출하지 않는다.
- Canvas App Custom Creation Tool Contracts와 Canvas App Custom Item Module Contracts는 Runtime Module을 import하지 않고 raw descriptor shape와 shortcut conflict를 검증한다.
- Custom creation tool이 item 생성을 거부하거나 실패하거나 invalid item을 반환해도 pointer interaction cleanup은 계속 진행되고 문서 상태는 손상하지 않는다.
- Pointer down hook은 DOM pointer routing과 coordinate 변환을 맡고, tool/gesture/config/custom tool 기반 interaction 시작 규칙은 Canvas Pointer Interaction Start가, built-in sticky/component-backed creation은 Canvas Pointer Component Creation이, 시작 결과 적용은 Canvas Pointer Interaction Start Effects가 소유한다.
- Item pointer down hook은 DOM event routing과 시작 결과 적용을 맡고, selection/edit/duplicate/move 시작 규칙은 Canvas Item Pointer Interaction Start가 소유한다.
- Pointer drag hook은 DOM pointer routing과 preview 결과 적용을 맡고, pointer-move live preview 계산은 Canvas Pointer Interaction Preview가, 생성/드로잉 draft preview는 Canvas Pointer Creation Preview가, pointer-up/cancel 확정 규칙은 Canvas Pointer Interaction Lifecycle이 소유한다.
- Sticky note, marker, highlighter, arrow, comment는 제품별 custom item이 아니라 내부 Affordance다. Sticky note는 별도 entity 없이 Component Library의 `sticky` template을 component item으로 생성한다. Drawing Item의 `x/y/w/h`는 외부 입력이 아니라 `points` 또는 `start/end`에서 Host tree/document가 동기화하는 canonical bounds다. Drawing Item style 기본값은 Host Drawing Item Style Module이 소유하고 draft overlay와 item creation이 같은 값을 쓴다.
- Core primitive facade는 resize/handle/scale 규칙을 직접 구현하지 않고 Canvas Bounds Resize에 위임한다.
- 제품별 item kind는 내부 `CanvasItem` variant를 추가하지 않고 Canvas App Custom Item Module로 묶어 등록한다.
- Canvas App Custom Item Module의 `id`는 소유한 custom item kind이며, module은 `presentation`, `renderItem`, `validateItem`을 받아 renderer registry와 validator registry를 내부에서 조립한다.
- Canvas App Custom Item Module descriptor/assembly, contract validation, module-owned creation/validator runtime은 분리하고, assembly는 Canvas App Custom Item Module Assembly가, validation은 Canvas App Custom Item Module Contracts가, runtime containment는 Canvas App Custom Item Module Runtime이 소유한다.
- Canvas Custom Item Validator registry shape 검증은 Canvas App Custom Item Validator Contracts가 소유한다.
- Canvas App Custom Item Module mutation 방어는 Canvas App Custom Item Module Snapshot이 소유한다.
- Module-owned custom creation tool은 bounds/title/data만 반환하고, `id`, `type`, `kind`, `presentation`은 Canvas App Custom Item Module이 주입한다.
- Demo custom item module은 `src/demo/custom-items/<name>/index.ts`에서 default export하면 자동 수집된다.
- Demo와 Demo custom item module은 `src/canvas` package public entry만 사용하고 canvas 하위 구현 경로를 직접 import하지 않는다.
- package manifest는 `canvas`, `canvas/app`, `canvas/app/authoring`, `canvas/core`, `canvas/engine`, `canvas/entities`, `canvas/host`, `canvas/renderer` export만 열고 각 export는 public facade `index.ts`를 가리킨다.
- package manifest의 각 export entry는 `types`, `import`, `default` target을 같은 public facade `index.ts`로 맞춘다.
- package public entry는 package manifest의 layer facade만 알고 app 내부 submodule을 직접 export target으로 삼지 않는다.
- package public entry는 App Shell 조립과 descriptor authoring contract를 열고, layer별 세부 기능은 flat re-export가 아니라 `CanvasEngine`, `CanvasHost`, `CanvasRenderer`, `CanvasCore` namespace 또는 package subpath에서만 연다.
- package public entry는 App Shell과 App props/source만 `canvas/app` facade에서 가져오고, descriptor authoring contract는 `canvas/app/authoring` facade에서 가져온다.
- package public entry는 `useCanvasAppModel`, `DEFAULT_CANVAS_APP_ASSEMBLY`, `assertCanvasAppAssembly`, `createCanvasAppCustomItemModuleAssembly` 같은 App runtime how를 `canvas/app` subpath에서만 연다.
- Canvas App Public Facade는 descriptor authoring contract를 Canvas App Authoring Facade에서 재노출하고, runtime hook/default/validator는 workflow public entry에서만 재노출한다.
- `canvas/app/authoring` subpath는 descriptor what만 열고 `useCanvasAppModel`, default assembly, assertion, assembled custom tool/state, custom module assembly output 같은 runtime how를 열지 않는다.
- Canvas App Inspector Panel Context는 내부 Canvas Workflow Contract를 외부 authoring Interface로 노출하지 않고 필요한 commit/document slot을 자체 public context 계약으로 명시한다.
- package public entry와 subpath export는 `canvas` package self-import consumer smoke test로 검증한다.
- package manifest는 CSS import가 bundler tree-shaking에서 제거되지 않도록 `sideEffects`에 CSS를 명시한다.
- package manifest는 React, React DOM, Zod를 shared runtime peer dependency로 선언한다.
- Custom item authoring Interface는 `CanvasApp*Renderer*` 이름을 쓰고, `CanvasDemoSvg*` 구현명은 App rendering Adapter 내부에 둔다. Canvas App Rendering Contracts가 App-owned renderer type을 소유하고 Demo SVG registry type은 그 계약을 구현하는 내부 alias로 둔다.
- App authoring/workflow module은 renderer registry what을 `CanvasAppRendererRegistries` named seam에서 가져오고 `../rendering` barrel에 직접 기대지 않는다.
- Canvas App extension id와 registry key는 lower-kebab 안정 id만 허용한다. 잘못된 module id, command id, tool id, renderer key, validator key, inspector id는 define 또는 assembly 단계에서 실패한다.
- Canvas App descriptor는 id뿐 아니라 필수 string/function/shortcut slot과 registry shape도 define 또는 assembly 단계에서 검증한다. malformed command, creation tool, inspector panel, renderer strategy는 등록 전에 실패하고, 실행 중 throw는 별도의 containment로 처리한다.
- Canvas App Inspector Panel descriptor shape 검증과 visibility/render execution은 분리하고, validation은 Canvas App Inspector Panel Contracts가, 실행 실패 omit은 Canvas App Inspector Panel Execution이 소유한다. Descriptor Module은 validation/execution helper를 재노출하지 않는다.
- Custom item `kind`/`presentation`과 Component Template `id`/`presentation`도 같은 안정 id 계약을 따르며, 잘못된 persisted key는 Host validation 또는 component library 생성 단계에서 실패한다.
- App workflow는 Demo SVG Item Layer를 직접 생성하지 않고 Canvas App Item Layer Adapter를 통해 stage children을 만든다.
- App Shell은 concrete Renderer Stage를 직접 import하지 않고 Canvas App Stage Adapter가 만든 stage ReactNode를 배치한다.
- Canvas App Adapter Assembly는 item, item layer, stage adapter fallback 조립을 소유하고, Canvas App Assembly는 adapter 선택 규칙을 직접 알지 않는다.
- App workflow와 command/pointer/viewport hook은 raw SVG ref를 직접 읽지 않고 Canvas App Stage Element를 통해 stage DOM 기능을 사용한다.
- App rendering Adapter의 public render input은 React/SVG pointer event를 직접 요구하지 않고 Canvas App Pointer Input을 사용한다.
- 알 수 없는 stable component kind는 forward compatibility를 위해 기본 template로 fallback할 수 있지만, malformed component kind는 schema validation 또는 component lookup 단계에서 실패한다.
- 저장된 workspace snapshot은 현재 custom item validator로 다시 검증한다. validator가 바뀌어 저장 payload가 더 이상 유효하지 않으면 저장 snapshot을 제거하고 앱 초기값으로 시작한다.
- Canvas App Assembly는 `workspaceStorageProvider`를 받아 Workspace Persistence에 전달하고, App workflow가 browser `localStorage`를 직접 선택하지 않게 한다.
- Canvas App Assembly는 `initialSelection`을 받아 Workspace Runtime에 전달하고, Demo 기본 선택 id는 default assembly에만 둔다. 제품별 `initialItems`가 있으면 명시 `initialSelection` 없이는 빈 selection으로 시작한다.
- Canvas App Workspace Assembly는 initial items normalization, Demo default selection fallback, workspace storage provider fallback을 소유한다.
- Canvas App Workspace Assembly Contracts는 initial selection이 assembled initial items에 맞지 않으면 App runtime 진입 전에 실패시킨다.
- Custom Item Module 간 module id, tool id, renderer key, validator key, inspector id, command id가 겹치면 조용히 덮어쓰지 않고 assembly 단계에서 실패한다.
- Host App은 `disabledCustomItemModuleIds`로 custom item module을 끌 수 있고, 알 수 없는 module id를 끄려고 하면 assembly 단계에서 실패한다.
- Custom creation tool shortcut이 내부 canvas shortcut, shift-insensitive built-in shortcut, temporary pan, nudge shortcut, 다른 custom creation tool shortcut과 겹치면 assembly 단계에서 실패한다.
- 제품별 renderer 세부 스타일은 canvas shell CSS에 두지 않고 Host App/Demo module 쪽에서 소유한다.
- 제품별 inspector UI는 기본 Object Inspector 구현을 수정하지 않고 Canvas App Assembly의 inspector panel descriptor로 등록한다.
- Linked peer dependency는 앱 번들에 한 번만 들어가야 한다. Package manifest는 React, React DOM, Zod를 peer dependency로 열고, Vite config는 `zod-crud` 같은 linked package가 `react`, `react-dom`, `zod`를 중복 번들링하지 않도록 dedupe하고, local dev server를 `127.0.0.1:5173` strict port로 고정하며, production build에서 React runtime을 별도 chunk로 분리한다.
- 위 import 경계는 `src/canvas/architecture/CanvasModuleBoundaries.test.ts`에서 검증한다.

추출 순서는 동작 변경 없이 app workflow에서 Engine 책임을 하나씩 떼어내는 방식으로 진행한다.
