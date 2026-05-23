# Context

## Domain Terms

- Canvas Affordance Engine: 캔버스 앱마다 반복되는 선택, 이동, 리사이즈, 편집, 줌, 명령, 오버레이 문법을 제공하는 Module.
- Affordance: 사용자가 캔버스에서 할 수 있다고 인지하고 실행하는 조작 단위. 예: resize handle, marquee, pan, duplicate.
- Feature Toggle: Affordance를 켜거나 끄는 설정. 모든 Affordance는 기본적으로 toggle 뒤에 있어야 한다.
- Host App: 엔진을 사용하는 실제 제품. 데이터 모델, 저장, 도메인 명령, 화면 구성을 소유한다.
- Core Contract: 특정 Host App, Renderer, React 상태에 묶이지 않는 재사용 부품의 입력과 출력 계약.
- Engine Public Facade: Host App, Demo App, UI, Renderer Adapter가 Engine을 사용할 때 import하는 안정된 Module 경계.
- Host Document Controller: Demo `CanvasItem` 문서의 history, selection, clipboard, text search, item commit을 React와 zod-crud 세부 구현 없이 제공하는 Module.
- Host Public Facade: Demo Host model type, read model, component library, document controller를 외부 레이어에 노출하는 안정된 Module 경계.
- Canvas Item Read Model: Demo `CanvasItem` tree의 조회, bounds, selection 정규화, Scene Adapter 생성을 tree helper 세부 구현 없이 제공하는 Module.
- Canvas Component Library: Demo component template 목록과 component item 생성을 함께 제공하는 Module.
- Canvas Workflow Contract: App workflow hook들이 공유하는 document commit, selection commit, clipboard 계약. 개별 hook이 `useCanvasDocument` 구현 파일을 직접 알지 않게 한다.
- Renderer Adapter: Affordance 상태를 SVG, Canvas, DOM, WebGL 등으로 그리는 Adapter.
- Renderer Public Facade: App과 UI가 Renderer Adapter를 사용할 때 import하는 안정된 Module 경계. SVG 내부 파일 구조를 숨긴다.
- Scene Adapter: Host App의 항목 트리, bounds, hit target, editable target을 엔진이 읽을 수 있게 맞추는 Adapter.

## Product Rule

- Demo 설명과 장식은 최소화한다.
- 이 프로젝트는 단일 서비스 앱보다 재사용 가능한 캔버스 부품공장을 우선한다.
- 엔진은 Fabric.js 같은 완성형 객체 모델을 감싸기보다, 커스텀 가능한 Affordance 문법을 작은 Interface로 제공한다.
- Demo `CanvasItem`과 SVG 렌더링 방식은 재사용 Core Contract에 포함하지 않는다.
- 모든 기능은 on/off 가능해야 한다.
