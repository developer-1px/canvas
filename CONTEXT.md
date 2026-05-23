# Context

## Domain Terms

- Canvas Affordance Engine: 캔버스 앱마다 반복되는 선택, 이동, 리사이즈, 편집, 줌, 명령, 오버레이 문법을 제공하는 Module.
- Affordance: 사용자가 캔버스에서 할 수 있다고 인지하고 실행하는 조작 단위. 예: resize handle, marquee, pan, duplicate.
- Feature Toggle: Affordance를 켜거나 끄는 설정. 모든 Affordance는 기본적으로 toggle 뒤에 있어야 한다.
- Host App: 엔진을 사용하는 실제 제품. 데이터 모델, 저장, 도메인 명령, 화면 구성을 소유한다.
- Core Contract: 특정 Host App, Renderer, React 상태에 묶이지 않는 재사용 부품의 입력과 출력 계약.
- Entities Contract: 런타임 구현 없이 Core geometry type과 Demo canvas item type을 노출하는 type-only 계약.
- Engine Public Facade: Host App, Demo App, UI, Renderer Adapter가 Engine을 사용할 때 import하는 안정된 Module 경계.
- Host Document Controller: Demo `CanvasItem` 문서의 history, selection, clipboard, text search, item commit을 React와 zod-crud 세부 구현 없이 제공하는 Module.
- Host Public Facade: Demo Host model type, read model, component library, document controller를 외부 레이어에 노출하는 안정된 Module 경계.
- Canvas Item Read Model: Demo `CanvasItem` tree의 조회, bounds, selection 정규화, Scene Adapter 생성을 tree helper 세부 구현 없이 제공하는 Module.
- Canvas Component Library: Demo component template, presentation key, component item 생성을 함께 제공하는 Module.
- Canvas Component Presentation: Demo component kind를 Renderer Adapter의 그리기 전략과 연결하는 key. 새 component kind는 기존 presentation을 재사용할 수 있다.
- Canvas App Model: App Shell이 렌더링할 control별 view props를 만들고 command, pointer, keyboard, viewport, text editing wiring을 숨기는 workflow Module.
- Canvas Interaction Model: tool, gesture, marquee, draft, snap guide, overlay state 생명주기를 App Shell에 숨기는 workflow Module.
- Canvas Workspace Model: Demo workspace의 저장된 snapshot, document history, viewport, read model, id 생성을 App Shell에 숨기는 workflow Module.
- Canvas Workflow Contract: App workflow hook들이 공유하는 document commit, selection commit, clipboard 계약. 개별 hook이 `useCanvasDocument` 구현 파일을 직접 알지 않게 한다.
- Renderer Adapter: Affordance 상태와 주입된 item layer를 SVG, Canvas, DOM, WebGL 등으로 배치하고 그리는 Adapter. Demo `CanvasItem`을 직접 알지 않는다.
- Demo SVG Item Layer Adapter: Demo `CanvasItem` tree와 component presentation을 SVG item layer로 바꾸어 Renderer Adapter에 주입하는 App-owned Adapter.
- Renderer Component Presentation Resolver: Demo component kind를 Renderer Adapter가 이해하는 presentation key로 바꾸는 함수. App workflow가 Host의 Canvas Component Library에서 꺼내 Renderer Adapter에 주입한다.
- Renderer Public Facade: App과 UI가 Renderer Adapter를 사용할 때 import하는 안정된 Module 경계. SVG 내부 파일 구조를 숨긴다.
- Scene Adapter: Host App의 항목 트리, bounds, hit target, editable target을 엔진이 읽을 수 있게 맞추는 Adapter.
- Canvas Module Boundary Guardrail: Engine, Host, App Shell, UI, Renderer seam import 규칙을 고정하는 architecture test.

## Product Rule

- Demo 설명과 장식은 최소화한다.
- 이 프로젝트는 단일 서비스 앱보다 재사용 가능한 캔버스 부품공장을 우선한다.
- 엔진은 Fabric.js 같은 완성형 객체 모델을 감싸기보다, 커스텀 가능한 Affordance 문법을 작은 Interface로 제공한다.
- Demo `CanvasItem`과 SVG 렌더링 방식은 재사용 Core Contract에 포함하지 않는다.
- Renderer Stage는 Demo `CanvasItem`, Host read model, component library를 import하지 않는다.
- Demo item SVG 렌더링은 App의 Demo SVG Item Layer Adapter가 소유한다.
- 안정 entity type은 `src/canvas/entities`에서 import한다.
- 모든 기능은 on/off 가능해야 한다.
- 새 Demo component kind가 기존 presentation을 재사용하면 Canvas Component Library만 수정한다.
- App Shell은 command, pointer, keyboard, viewport, text editing wiring을 직접 알지 않는다.
- App View는 raw workflow state 대신 Canvas App Model이 조립한 control별 props만 받는다.
- App Shell은 workspace 저장, document history, read model 생성 방식을 직접 알지 않는다.
- App workflow hook들은 Canvas Item Read Model을 직접 생성하지 않고 Canvas Workspace Model에서 주입받는다.
- App workflow는 editor/search 상태를 각각의 workflow Module 뒤에 숨긴다.
- UI controls는 Demo Host를 직접 import하지 않는다.
- Module seam import 규칙은 Canvas Module Boundary Guardrail로 검증한다.
