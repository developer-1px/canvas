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

## Folder Structure

| Folder | 책임 |
| --- | --- |
| `src/canvas/architecture/CanvasModuleBoundaries.test.ts` | Module seam import 규칙을 회귀 테스트로 검증한다 |
| `src/canvas/app/shell` | CanvasApp composition과 shell style |
| `src/canvas/app/rendering` | Demo `CanvasItem` tree를 SVG item layer로 바꾸는 App-owned Adapter |
| `src/canvas/app/rendering/CanvasDemoSvgComponentPresentationRegistry.ts` | Demo component presentation key와 SVG rendering strategy를 외부 조립 가능한 registry로 연결한다 |
| `src/canvas/app/rendering/CanvasDemoSvgCustomItemRendererRegistry.tsx` | Custom item presentation key와 SVG rendering strategy를 외부 조립 가능한 registry로 연결한다 |
| `src/canvas/app/workflow` | React state와 engine/host/renderer wiring |
| `src/canvas/app/commands/CanvasAppCustomCommands.ts` | Engine command union을 수정하지 않고 제품별 business action을 toolbar command로 등록하는 descriptor를 제공한다 |
| `src/canvas/app/inspector/CanvasAppInspectorPanels.ts` | 기본 bounds inspector를 수정하지 않고 제품별 선택 항목 패널을 등록하는 descriptor를 제공한다 |
| `src/canvas/app/tools/CanvasAppCustomCreationTools.ts` | 내부 Tool union에 구체 id를 추가하지 않고 제품별 생성 도구를 등록하는 descriptor를 제공한다 |
| `src/canvas/app/workflow/CanvasAppAssembly.ts` | Host item adapter, component library, custom command, custom creation tool, custom item renderer, custom item validator, inspector panel, initial items, SVG presentation registry 같은 제품별 의미를 외부 조립 seam으로 제공한다 |
| `src/canvas/app/workflow/index.ts` | App Shell이 사용하는 workflow public entry |
| `src/canvas/app/workflow/useCanvasAppModel.ts` | command, pointer, keyboard, viewport, text editing wiring과 control별 view props 조립을 App Shell에 숨긴다 |
| `src/canvas/app/workflow/CanvasWorkflowContract.ts` | App workflow hook들이 공유하는 document commit, selection, clipboard contract |
| `src/canvas/app/workflow/useCanvasFindReplaceModel.ts` | document text search 상태와 Find/Replace control props를 App Shell에 숨긴다 |
| `src/canvas/app/workflow/useCanvasInteractionModel.ts` | tool, gesture, marquee, draft, snap guide, overlay 상태 생명주기를 App Shell에 숨긴다 |
| `src/canvas/app/workflow/useCanvasTextEditorModel.ts` | text editing state, editable item lookup, text editor props를 App Shell에 숨긴다 |
| `src/canvas/app/workflow/useCanvasWorkspaceModel.ts` | 저장된 workspace snapshot, document history, viewport, read model, id 생성을 App Shell에 숨긴다 |
| `src/canvas/app/pointer/CanvasPointerGeometry.ts` | DOM/SVG pointer 좌표 변환 |
| `src/canvas/core` | Host item과 renderer를 모르는 geometry, viewport, id, primitive math 같은 재사용 계약 |
| `src/canvas/entities` | Core geometry와 Demo canvas item의 안정적인 type-only entity 계약 |
| `src/canvas/engine` | Host item과 renderer를 모르는 조작 규칙. 외부 소비자는 `src/canvas/engine` public facade를 사용한다 |
| `src/canvas/engine/snap` | Grid, alignment, spacing snap과 guide 계산 |
| `src/canvas/host/model` | Demo canvas item model. Core 재사용 계약에 포함하지 않는다 |
| `src/canvas/host` | Demo canvas item public facade |
| `src/canvas/host/component/CanvasComponentLibrary.ts` | Demo component template, presentation key, component item 생성을 함께 제공한다 |
| `src/canvas/host/document/CanvasDocumentController.ts` | App workflow가 사용하는 Host Document Controller. zod-crud, JSON Patch, selection snapshot, clipboard 구현을 숨긴다 |
| `src/canvas/host/read/CanvasItemReadModel.ts` | Demo item tree 조회, bounds, selection 정규화, Scene Adapter 생성을 tree helper 구현 없이 제공한다 |
| `src/canvas/host/operations` | Transform, text, clone, remove, group item operations |
| `src/canvas/host/tree` | Bounds, traversal, selection tree helpers |
| `src/canvas/host/adapters` | Demo host item을 engine interface에 맞추는 adapter |
| `src/canvas/renderer` | Renderer public facade |
| `src/canvas/renderer/svg` | Demo item을 모르는 SVG stage/overlay adapter |
| `src/canvas/ui` | Toolbar, palette, status, editor controls |
| `src/demo/CanvasDemoAssembly.tsx` | canvas Module 밖에서 demo-specific custom item, renderer, creation tool, inspector panel을 조립한다 |

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
- App과 Renderer는 Demo Host 내부 subpath를 import하지 않는다. 안정 entity type은 `src/canvas/entities` public contract에서 받는다.
- UI controls는 Demo Host를 import하지 않는다. Host component/template/text editing 값은 App workflow가 UI prop으로 주입한다.
- App workflow는 Host document 구현 파일을 import하지 않는다. 문서 변경, history, selection, clipboard, text search는 명시적인 Host Document Controller interface를 통해 사용한다.
- zod-crud document, JSON Patch, selection snapshot, clipboard 구현은 Host document layer 밖으로 새지 않는다.
- App hook들은 `useCanvasDocument` 구현 파일에서 타입을 가져오지 않는다. document commit과 selection contract는 Canvas Workflow Contract를 통해 공유한다.
- App workflow는 Host tree helper를 import하지 않는다. item 조회, bounds, selection 정규화, Scene Adapter 생성은 Canvas Item Read Model을 통해 사용한다.
- App workflow에서 read model 생성은 Canvas Workspace Model이 소유한다. Inspector, pointer, viewport hook은 생성하지 않고 주입받은 Canvas Item Read Model만 사용한다.
- App Shell은 workflow public entry만 import한다. command, pointer, keyboard, viewport, text editing wiring은 Canvas App Model이 소유한다.
- App Shell은 workspace 저장, initial item seed, read model 생성, id seed 계산을 직접 import하지 않는다. Canvas Workspace Model을 통해 사용한다.
- App workflow는 `CANVAS_ITEM_ENGINE_ADAPTERS`를 통해 concrete item adapter를 주입한다.
- App workflow는 Canvas App Assembly를 통해 concrete item adapter, component library, custom command, inspector panel, initial items, presentation registry를 주입받는다.
- App과 UI는 Renderer Adapter 내부 파일을 import하지 않는다. SVG stage는 `src/canvas/renderer` public facade에서 사용한다.
- Renderer Adapter는 `CanvasOverlayState`와 주입된 item layer를 받아 SVG로 배치하며, Engine은 SVG/DOM 구현을 모른다.
- Renderer Stage는 Demo `CanvasItem`, Host read model, Canvas Component Library를 import하지 않는다.
- Demo SVG Item Layer Adapter는 App-owned Adapter로 Demo component presentation key resolver와 presentation registry를 받아 그리기 전략을 고른다.
- 새 Demo component kind가 기존 presentation을 재사용하면 외부 조립된 `CanvasComponentLibrary`만 바꾼다. 새 presentation은 Canvas App Assembly에 presentation renderer를 함께 등록한다.
- 제품별 business action은 Engine command union에 추가하지 않고 Canvas App Assembly의 custom command descriptor로 등록한다.
- 제품별 creation tool은 내부 builtin tool list에 추가하지 않고 Canvas App Assembly의 custom creation tool descriptor로 등록한다.
- 제품별 item kind는 내부 `CanvasItem` variant를 추가하지 않고 `custom` storage envelope, custom item renderer registry, custom item validator로 등록한다.
- 제품별 inspector UI는 기본 Object Inspector 구현을 수정하지 않고 Canvas App Assembly의 inspector panel descriptor로 등록한다.
- 위 import 경계는 `src/canvas/architecture/CanvasModuleBoundaries.test.ts`에서 검증한다.

추출 순서는 동작 변경 없이 app workflow에서 Engine 책임을 하나씩 떼어내는 방식으로 진행한다.
