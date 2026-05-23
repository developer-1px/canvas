# Canvas Affordance Engine

목표: 앱별 객체 모델과 렌더러에 묶이지 않는 캔버스 조작 문법을 만든다.

## 원칙

1. 모든 Affordance는 Feature Toggle 뒤에 둔다.
2. Host는 데이터와 저장을 소유한다.
3. App workflow는 concrete item adapter를 주입한다.
4. Engine은 intent, gesture, selection, creation result, overlay state, command routing을 소유한다.
5. Renderer Adapter는 그리기만 한다.
6. Scene Adapter는 bounds, hit target, parent/group, editable target만 제공한다.

## Layer / Concept / Role

| Layer | Concept | Role |
| --- | --- | --- |
| app | workflow | React state와 engine/host/renderer 연결 |
| engine | behavior | host와 renderer를 모르는 조작 규칙 |
| host | domain | demo canvas item, document, tree, operations |
| renderer | adapter | host item과 engine overlay를 실제 SVG로 그림 |
| ui | controls | toolbar, palette, editor 같은 화면 조각 |

## Folder Structure

| Folder | 책임 |
| --- | --- |
| `src/canvas/app/shell` | CanvasApp composition과 shell style |
| `src/canvas/app/workflow` | React state와 engine/host/renderer wiring |
| `src/canvas/app/geometry` | DOM/SVG pointer 좌표 변환 |
| `src/canvas/core` | Host item과 renderer를 모르는 geometry, viewport, id, primitive math 같은 재사용 계약 |
| `src/canvas/engine` | Host item과 renderer를 모르는 조작 규칙. 외부 소비자는 `src/canvas/engine` public facade를 사용한다 |
| `src/canvas/engine/snap` | Grid, alignment, spacing snap과 guide 계산 |
| `src/canvas/host/model` | Demo canvas item model. Core 재사용 계약에 포함하지 않는다 |
| `src/canvas/host` | Demo canvas item public facade |
| `src/canvas/host/component/CanvasComponentLibrary.ts` | Demo component template 목록과 component item 생성을 함께 제공한다 |
| `src/canvas/host/document/CanvasDocumentController.ts` | App workflow가 사용하는 Host Document Controller. zod-crud, JSON Patch, selection snapshot, clipboard 구현을 숨긴다 |
| `src/canvas/host/read/CanvasItemReadModel.ts` | Demo item tree 조회, bounds, selection 정규화, Scene Adapter 생성을 tree helper 구현 없이 제공한다 |
| `src/canvas/host/operations` | Transform, text, clone, remove, group item operations |
| `src/canvas/host/tree` | Bounds, traversal, selection tree helpers |
| `src/canvas/host/adapters` | Demo host item을 engine interface에 맞추는 adapter |
| `src/canvas/renderer/svg` | SVG renderer adapter |
| `src/canvas/ui` | Toolbar, palette, status, stage, editor controls |

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
5. `CanvasSvgItemRenderer`: Demo Host item을 SVG로 그린다.
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
- Host domain Module은 Engine 구현 파일을 import하지 않는다. Engine Adapter 타입은 `src/canvas/engine` public facade에서 받는다.
- App workflow는 Host document 구현 파일을 import하지 않는다. 문서 변경, history, selection, clipboard, text search는 Host Document Controller를 통해 사용한다.
- App workflow는 Host tree helper를 import하지 않는다. item 조회, bounds, selection 정규화, Scene Adapter 생성은 Canvas Item Read Model을 통해 사용한다.
- App workflow는 `CANVAS_ITEM_ENGINE_ADAPTERS`를 통해 concrete item adapter를 주입한다.
- Renderer Adapter는 `CanvasOverlayState`를 받아 SVG로 그리며, Engine은 SVG/DOM 구현을 모른다.

추출 순서는 동작 변경 없이 app workflow에서 Engine 책임을 하나씩 떼어내는 방식으로 진행한다.
