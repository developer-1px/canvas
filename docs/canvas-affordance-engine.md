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
| `package.json` | Canvas package export map을 public facade entry로 고정한다 |
| `src/canvas/architecture/CanvasModuleBoundaries.test.ts` | Module seam import 규칙을 회귀 테스트로 검증한다 |
| `src/canvas/architecture/CanvasPackageConsumer.test.ts` | 외부 소비자처럼 `canvas`와 `canvas/*` export를 import해 public package surface를 검증한다 |
| `src/canvas/architecture/CanvasPackageManifest.test.ts` | package manifest export map이 public facade만 가리키는지 검증한다 |
| `src/canvas/app/shell` | CanvasApp composition과 shell style |
| `src/canvas/app/index.ts` | Canvas App Shell과 workflow 조립 계약을 노출하는 App public facade |
| `src/canvas/app/extensions/CanvasAppExtensionIds.ts` | 제품별 descriptor와 registry key가 공유하는 lower-kebab 안정 id 계약을 검증한다 |
| `src/canvas/app/extensions/CanvasAppExtensionRegistries.ts` | assembly 단계에서 extension entry와 record key 검증, 중복 실패 처리를 한 내부 계약으로 제공한다 |
| `src/canvas/app/stage/CanvasAppStageElement.ts` | stage DOM element의 bounds, pointer capture, wheel listener를 caller Interface 뒤에 숨기고 mount ref bridge는 Controller로 분리한다 |
| `src/canvas/app/rendering` | Demo `CanvasItem` tree를 SVG item layer로 바꾸는 App-owned Adapter |
| `src/canvas/app/rendering/CanvasAppRenderingContracts.ts` | 외부 조립자가 쓰는 App-owned renderer authoring Interface를 Demo SVG registry type name과 분리한다 |
| `src/canvas/app/rendering/CanvasAppStageAdapter.tsx` | App Shell이 stage props를 알지 않도록 stage ReactNode를 만드는 Adapter Interface를 제공하고, stage mount Interface를 기본 SVG Stage ref로 매핑한다 |
| `src/canvas/app/rendering/CanvasAppItemLayerAdapter.tsx` | App workflow가 concrete Demo SVG item layer 없이 stage children을 만들도록 하는 Adapter Interface를 제공하고, SVG item pointer event를 App pointer Interface로 매핑한다 |
| `src/canvas/app/rendering/CanvasDemoSvgItemFrame.tsx` | Demo SVG item의 lock, selected, pointer event, outline wrapper 문법을 item type별 shape rendering과 분리해 소유한다 |
| `src/canvas/app/rendering/CanvasDemoSvgComponentPresentationRegistry.ts` | Demo component presentation key와 SVG rendering strategy를 외부 조립 가능한 registry로 연결한다 |
| `src/canvas/app/rendering/CanvasDemoSvgComponentRenderFallback.tsx` | Component presentation resolver나 renderer 실행 실패를 기본 component card로 containment 한다 |
| `src/canvas/app/rendering/CanvasDemoSvgCustomItemRendererRegistry.tsx` | Custom item presentation key와 SVG rendering strategy를 외부 조립 가능한 registry로 연결한다 |
| `src/canvas/app/rendering/CanvasDemoSvgCustomItemRenderFallback.tsx` | Custom item renderer 누락이나 실행 실패를 unknown custom item card로 containment 한다 |
| `src/canvas/app/workflow` | React state와 engine/host/renderer wiring |
| `src/canvas/app/commands/CanvasAppCustomCommands.ts` | Engine command union을 수정하지 않고 제품별 business action을 toolbar command로 등록하는 descriptor를 제공한다 |
| `src/canvas/app/commands/CanvasAppCustomCommandExecution.ts` | Custom command toolbar state, availability, run 호출과 실패 containment를 소유한다 |
| `src/canvas/app/inspector/CanvasAppInspectorPanels.ts` | 기본 bounds inspector를 수정하지 않고 제품별 선택 항목 패널을 등록하는 descriptor를 제공한다 |
| `src/canvas/app/modules/CanvasAppCustomItemModules.ts` | 제품별 item kind에 필요한 creation tool, renderer, validator, inspector, command를 한 Module로 조립하고 registry/envelope를 내부에서 만든다 |
| `src/canvas/app/modules/CanvasAppCustomItemModuleRuntime.ts` | Module-owned creation tool envelope 생성, item validation, renderer/validator registry 변환과 실패 containment를 소유한다 |
| `src/canvas/app/tools/CanvasAppCustomCreationTools.ts` | 내부 Tool union에 구체 id를 추가하지 않고 제품별 생성 도구를 등록하는 descriptor를 제공한다 |
| `src/canvas/app/tools/CanvasAppCustomCreationToolRuntime.ts` | Custom creation tool id 변환, toolbar state, lookup, shortcut matching을 소유한다 |
| `src/canvas/app/workflow/CanvasAppAssembly.ts` | Host item adapter, component library, custom command, custom item module, inspector panel, initial items, SVG presentation registry 같은 제품별 의미를 외부 조립 seam으로 제공한다 |
| `src/canvas/app/workflow/index.ts` | App Shell이 사용하는 workflow public entry |
| `src/canvas/app/workflow/useCanvasAppModel.ts` | command, pointer, keyboard, viewport, text editing wiring과 control별 view props 조립을 App Shell에 숨긴다 |
| `src/canvas/app/workflow/CanvasWorkflowContract.ts` | App workflow hook들이 공유하는 document commit, selection, clipboard contract |
| `src/canvas/app/workflow/useCanvasFindReplaceModel.ts` | document text search 상태와 Find/Replace control props를 App Shell에 숨긴다 |
| `src/canvas/app/workflow/useCanvasInteractionModel.ts` | tool, gesture, marquee, draft, snap guide, overlay 상태 생명주기를 App Shell에 숨긴다 |
| `src/canvas/app/workflow/useCanvasTextEditorModel.ts` | text editing state, editable item lookup, text editor props를 App Shell에 숨긴다 |
| `src/canvas/app/workflow/useCanvasWorkspaceModel.ts` | 저장된 workspace snapshot, document history, viewport, read model, id 생성을 App Shell에 숨긴다 |
| `src/canvas/app/inspector/CanvasAppInspectorPanelExecution.ts` | Inspector panel visibility/render 호출과 실패 시 omit containment를 소유한다 |
| `src/canvas/app/pointer/CanvasAppPointerInput.ts` | React/SVG pointer event를 App workflow가 쓰는 최소 pointer/event Interface로 변환한다 |
| `src/canvas/app/pointer/CanvasPointerGeometry.ts` | DOM/SVG pointer 좌표 변환 |
| `src/canvas/core` | Host item과 renderer를 모르는 geometry, viewport, id, primitive math 같은 재사용 계약 |
| `src/canvas/core/CanvasStableIds.ts` | persisted kind, presentation key, registry key에 쓰는 lower-kebab 안정 id 계약 |
| `src/canvas/entities` | Core geometry와 Demo canvas item의 안정적인 type-only entity 계약. Runtime helper는 Core/Host/App seam에 둔다 |
| `src/canvas/engine` | Host item과 renderer를 모르는 조작 규칙. 외부 소비자는 `src/canvas/engine` public facade를 사용한다 |
| `src/canvas/engine/snap` | Grid, alignment, spacing snap과 guide 계산 |
| `src/canvas/host/model` | Demo canvas item model. Core 재사용 계약에 포함하지 않는다 |
| `src/canvas/host` | Demo canvas item public facade |
| `src/canvas/host/component/CanvasComponentLibrary.ts` | Demo component template, presentation key, component item 생성을 함께 제공한다 |
| `src/canvas/host/drawing/CanvasDrawingItemStyles.ts` | Built-in Drawing Item의 stroke/opacity 기본값을 소유하고 draft overlay와 item creation이 공유하게 한다 |
| `src/canvas/host/document/CanvasDocumentController.ts` | App workflow가 사용하는 Host Document Controller. zod-crud, JSON Patch, selection snapshot, clipboard 구현을 숨긴다 |
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
- App hook들은 `useCanvasDocument` 구현 파일에서 타입을 가져오지 않는다. document commit과 selection contract는 Canvas Workflow Contract를 통해 공유한다.
- App workflow는 Host tree helper를 import하지 않는다. item 조회, bounds, selection 정규화, Scene Adapter 생성은 Canvas Item Read Model을 통해 사용한다.
- App workflow에서 read model 생성은 Canvas Workspace Model이 소유한다. Inspector, pointer, viewport hook은 생성하지 않고 주입받은 Canvas Item Read Model만 사용한다.
- App Shell은 workflow public entry만 import한다. command, pointer, keyboard, viewport, text editing wiring은 Canvas App Model이 소유한다.
- App Shell은 workspace 저장, initial item seed, read model 생성, id seed 계산을 직접 import하지 않는다. Canvas Workspace Model을 통해 사용한다.
- App workflow는 `CANVAS_ITEM_ENGINE_ADAPTERS`를 통해 concrete item adapter를 주입한다.
- App workflow는 Canvas App Assembly를 통해 concrete item adapter, component library, custom command, custom item module, inspector panel, initial items, presentation registry를 주입받는다.
- Canvas App Assembly input은 output type의 `Partial`이 아니라 Host가 조립할 수 있는 필드만 명시한 외부 입력 계약이다.
- Canvas App Custom Item Module define, Custom Item Module Assembly output, Canvas App Assembly output은 define/조립 후 외부 descriptor, adapter, initial item mutation에 흔들리지 않도록 snapshot으로 보관한다.
- Canvas App Assembly initial items는 조립된 custom item validator로 assembly 단계에서 검증되어 잘못된 Host seed가 React document 생성까지 넘어가지 않는다.
- App과 UI는 Renderer Adapter 내부 파일을 import하지 않는다. SVG stage는 `src/canvas/renderer` public facade에서 사용한다.
- Renderer Adapter는 `CanvasOverlayState`와 주입된 item layer를 받아 SVG로 배치하며, Engine은 SVG/DOM 구현을 모른다.
- Renderer Stage는 Demo `CanvasItem`, Host read model, Canvas Component Library를 import하지 않는다.
- Canvas SVG Drawing Primitives가 SVG path data와 arrow marker id/IRI를 소유해서 Renderer Stage defs와 App-owned item layer가 문자열 계약을 중복하지 않는다.
- Demo SVG Item Layer Adapter는 App-owned Adapter로 Demo component presentation key resolver와 presentation registry를 받아 그리기 전략을 고른다.
- Demo SVG Item Frame이 lock/selected/pointer/outline wrapper 문법을 소유해서 item type별 shape renderer branch가 공통 interaction frame을 복사하지 않는다.
- Demo SVG Component Render Fallback이 component presentation resolver와 renderer 실행 실패를 기본 component card로 containment 한다.
- Demo SVG Custom Item Render Fallback이 custom item renderer 누락과 실행 실패를 unknown custom item card로 containment 한다.
- 새 Demo component kind가 기존 presentation을 재사용하면 외부 조립된 `CanvasComponentLibrary`만 바꾼다. 새 presentation은 Canvas App Assembly에 presentation renderer를 함께 등록한다.
- Canvas Component Library의 presentation key가 component presentation renderer registry에 없으면 Canvas App Assembly가 실패한다.
- Canvas Component Library는 외부 component template의 id/presentation, 필수 display/style string, 양수 크기, optional string list shape를 생성 단계에서 검증하고, 생성 후 외부 template mutation에 흔들리지 않도록 snapshot을 보관한다.
- Canvas App Assembly는 주입된 Canvas Component Library의 template 목록과 `getTemplate`, `getPresentation` resolver 결과가 어긋나면 실패한다.
- Canvas App Assembly의 component presentation renderer input은 기본 SVG presentation registry를 대체하지 않고 extension/override로 합성된다.
- 제품별 business action은 Engine command union에 추가하지 않고 Canvas App Assembly의 custom command descriptor로 등록한다.
- Custom command의 availability/run 실패는 내부 command loop를 깨지 않고 disabled/false로 containment 된다.
- Canvas App Custom Command descriptor shape 검증과 toolbar state/run execution은 분리하고, 실행 실패 containment는 Canvas App Custom Command Execution이 소유한다.
- 제품별 item creation tool은 내부 builtin tool list에 추가하지 않고 Canvas App Custom Item Module에 등록한다.
- Canvas App Custom Creation Tool descriptor shape/shortcut conflict 검증과 runtime state/lookup/shortcut matching은 분리하고, runtime behavior는 Canvas App Custom Creation Tool Runtime이 소유한다.
- Custom creation tool이 item 생성을 거부하거나 실패하거나 invalid item을 반환해도 pointer interaction cleanup은 계속 진행되고 문서 상태는 손상하지 않는다.
- Marker, highlighter, arrow는 제품별 custom item이 아니라 내부 Drawing Item이다. Drawing Item의 `x/y/w/h`는 외부 입력이 아니라 `points` 또는 `start/end`에서 Host tree/document가 동기화하는 canonical bounds다. Drawing Item style 기본값은 Host Drawing Item Style Module이 소유하고 draft overlay와 item creation이 같은 값을 쓴다.
- 제품별 item kind는 내부 `CanvasItem` variant를 추가하지 않고 Canvas App Custom Item Module로 묶어 등록한다.
- Canvas App Custom Item Module의 `id`는 소유한 custom item kind이며, module은 `presentation`, `renderItem`, `validateItem`을 받아 renderer registry와 validator registry를 내부에서 조립한다.
- Canvas App Custom Item Module descriptor/assembly와 module-owned creation/validator runtime은 분리하고, runtime containment는 Canvas App Custom Item Module Runtime이 소유한다.
- Module-owned custom creation tool은 bounds/title/data만 반환하고, `id`, `type`, `kind`, `presentation`은 Canvas App Custom Item Module이 주입한다.
- Demo custom item module은 `src/demo/custom-items/<name>/index.ts`에서 default export하면 자동 수집된다.
- Demo와 Demo custom item module은 `src/canvas` package public entry만 사용하고 canvas 하위 구현 경로를 직접 import하지 않는다.
- package manifest는 `canvas`, `canvas/app`, `canvas/core`, `canvas/engine`, `canvas/entities`, `canvas/host`, `canvas/renderer` export만 열고 각 export는 public facade `index.ts`를 가리킨다.
- package public entry는 package manifest의 layer facade만 알고 app 내부 submodule을 직접 export target으로 삼지 않는다.
- package public entry와 subpath export는 `canvas` package self-import consumer smoke test로 검증한다.
- package manifest는 CSS import가 bundler tree-shaking에서 제거되지 않도록 `sideEffects`에 CSS를 명시한다.
- package manifest는 React, React DOM, Zod를 shared runtime peer dependency로 선언한다.
- Custom item authoring Interface는 `CanvasApp*Renderer*` 이름을 쓰고, `CanvasDemoSvg*` 구현명은 App rendering Adapter 내부에 둔다. Canvas App Rendering Contracts가 App-owned renderer type을 소유하고 Demo SVG registry type은 그 계약을 구현하는 내부 alias로 둔다.
- Canvas App extension id와 registry key는 lower-kebab 안정 id만 허용한다. 잘못된 module id, command id, tool id, renderer key, validator key, inspector id는 define 또는 assembly 단계에서 실패한다.
- Canvas App descriptor는 id뿐 아니라 필수 string/function/shortcut slot과 registry shape도 define 또는 assembly 단계에서 검증한다. malformed command, creation tool, inspector panel, renderer strategy는 등록 전에 실패하고, 실행 중 throw는 별도의 containment로 처리한다.
- Canvas App Inspector Panel descriptor shape 검증과 visibility/render execution은 분리하고, 실행 실패 omit은 Canvas App Inspector Panel Execution이 소유한다.
- Custom item `kind`/`presentation`과 Component Template `id`/`presentation`도 같은 안정 id 계약을 따르며, 잘못된 persisted key는 Host validation 또는 component library 생성 단계에서 실패한다.
- App workflow는 Demo SVG Item Layer를 직접 생성하지 않고 Canvas App Item Layer Adapter를 통해 stage children을 만든다.
- App Shell은 concrete Renderer Stage를 직접 import하지 않고 Canvas App Stage Adapter가 만든 stage ReactNode를 배치한다.
- App workflow와 command/pointer/viewport hook은 raw SVG ref를 직접 읽지 않고 Canvas App Stage Element를 통해 stage DOM 기능을 사용한다.
- App rendering Adapter의 public render input은 React/SVG pointer event를 직접 요구하지 않고 Canvas App Pointer Input을 사용한다.
- 알 수 없는 stable component kind는 forward compatibility를 위해 기본 template로 fallback할 수 있지만, malformed component kind는 schema validation 또는 component lookup 단계에서 실패한다.
- 저장된 workspace snapshot은 현재 custom item validator로 다시 검증한다. validator가 바뀌어 저장 payload가 더 이상 유효하지 않으면 저장 snapshot을 제거하고 앱 초기값으로 시작한다.
- Custom Item Module 간 module id, tool id, renderer key, validator key, inspector id, command id가 겹치면 조용히 덮어쓰지 않고 assembly 단계에서 실패한다.
- Host App은 `disabledCustomItemModuleIds`로 custom item module을 끌 수 있고, 알 수 없는 module id를 끄려고 하면 assembly 단계에서 실패한다.
- Custom creation tool shortcut이 내부 canvas shortcut, shift-insensitive built-in shortcut, temporary pan, nudge shortcut, 다른 custom creation tool shortcut과 겹치면 assembly 단계에서 실패한다.
- 제품별 renderer 세부 스타일은 canvas shell CSS에 두지 않고 Host App/Demo module 쪽에서 소유한다.
- 제품별 inspector UI는 기본 Object Inspector 구현을 수정하지 않고 Canvas App Assembly의 inspector panel descriptor로 등록한다.
- Linked peer dependency는 앱 번들에 한 번만 들어가야 한다. Package manifest는 React, React DOM, Zod를 peer dependency로 열고, Vite config는 `zod-crud` 같은 linked package가 `react`, `react-dom`, `zod`를 중복 번들링하지 않도록 dedupe하고, production build에서 React runtime을 별도 chunk로 분리한다.
- 위 import 경계는 `src/canvas/architecture/CanvasModuleBoundaries.test.ts`에서 검증한다.

추출 순서는 동작 변경 없이 app workflow에서 Engine 책임을 하나씩 떼어내는 방식으로 진행한다.
