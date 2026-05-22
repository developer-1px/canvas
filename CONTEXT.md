# Context

## Domain Terms

- Canvas Affordance Engine: 캔버스 앱마다 반복되는 선택, 이동, 리사이즈, 편집, 줌, 명령, 오버레이 문법을 제공하는 Module.
- Affordance: 사용자가 캔버스에서 할 수 있다고 인지하고 실행하는 조작 단위. 예: resize handle, marquee, pan, duplicate.
- Feature Toggle: Affordance를 켜거나 끄는 설정. 모든 Affordance는 기본적으로 toggle 뒤에 있어야 한다.
- Host App: 엔진을 사용하는 실제 제품. 데이터 모델, 저장, 도메인 명령, 화면 구성을 소유한다.
- Renderer Adapter: Affordance 상태를 SVG, Canvas, DOM, WebGL 등으로 그리는 Adapter.
- Scene Adapter: Host App의 항목 트리, bounds, hit target, editable target을 엔진이 읽을 수 있게 맞추는 Adapter.

## Product Rule

- Demo 설명과 장식은 최소화한다.
- 엔진은 Fabric.js 같은 완성형 객체 모델을 감싸기보다, 커스텀 가능한 Affordance 문법을 작은 Interface로 제공한다.
- 모든 기능은 on/off 가능해야 한다.
