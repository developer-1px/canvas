# Canvas Affordance Engine

목표: 앱별 객체 모델과 렌더러에 묶이지 않는 캔버스 조작 문법을 만든다.

## 원칙

1. 모든 Affordance는 Feature Toggle 뒤에 둔다.
2. Host App은 데이터와 저장을 소유한다.
3. Engine은 intent, gesture, selection, overlay state, command routing을 소유한다.
4. Renderer Adapter는 그리기만 한다.
5. Scene Adapter는 bounds, hit target, parent/group, editable target만 제공한다.

## Layer

| Layer | Module | 책임 | Toggle 영향 |
| --- | --- | --- | --- |
| Host | App | 도메인 데이터, 저장, 화면 구성 | Engine config를 만든다 |
| Engine | Affordance Catalog | tool, command, gesture, overlay, shortcut 메타 | 사용 가능한 항목을 결정한다 |
| Engine | Gesture State | pointer/keyboard 입력을 intent로 바꾼다 | 꺼진 gesture는 시작되지 않는다 |
| Engine | Selection Model | 선택, additive 선택, ancestor 선택 | 꺼진 selection 기능은 명령 대상이 되지 않는다 |
| Engine | Command Router | duplicate, delete, group, undo 같은 명령 실행 | 꺼진 command는 UI/shortcut/API에서 막힌다 |
| Engine | Overlay Model | handle, outline, marquee, draft 표시 상태 | 꺼진 overlay는 렌더 입력에서 빠진다 |
| Adapter | Scene Adapter | item tree, bounds, hit, editable target 제공 | Feature와 무관하게 최소 질의만 제공한다 |
| Adapter | Renderer Adapter | SVG/Canvas/DOM/WebGL 렌더링 | 받은 overlay만 그린다 |

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
- Toggle이 꺼져도 문서 상태는 손상하지 않는다.
- Toggle 기본값은 모두 on이다. Host App이 필요한 것만 끈다.

## Extraction State

현재 앱에서 뽑는 Module:

1. `CanvasAffordances`: 안정적인 tool/command/gesture/overlay/shortcut id와 label, title, default toggle. 완료.
2. `CanvasOverlayEngine`: Renderer Adapter가 그릴 renderer-independent overlay state 생성. `CanvasSceneAdapter` 입력으로 전환 중.
3. `CanvasCommandEngine`: command availability와 item command 결과 계산. React state/history 적용은 `useCanvasCommands` Adapter에 남아 있음.
4. `CanvasSelectionEngine`: item click selection과 marquee hit selection 계산. `CanvasSceneAdapter` 입력으로 전환 중.
5. `CanvasGestureEngine`: pointer event를 gesture intent로 변환.

추출 순서는 동작 변경 없이 Host App에서 Engine 책임을 하나씩 떼어내는 방식으로 진행한다.
