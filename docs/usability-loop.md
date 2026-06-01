# 사용성 루프 기록

범위: headless에 가까운 canvas affordance engine demo.

주의: 아래 기록은 기본 demo가 제품 UI가 아니라 engine 부품 검증용이어야 한다는 정리 기준을 따른다.

| 회차 | 점검 | 개선 | 평가 |
| --- | --- | --- | --- |
| 1 | 기본 화면이 design-system/product demo로 읽힘 | default seed를 shape/text/drawing으로 교체 | engine 부품이 첫 화면에 드러남 |
| 2 | product rail/source/review UI가 목적을 흐림 | demo shell에서 rail과 dock 장식 제거 | stage와 최소 controls만 남음 |
| 3 | DOM/CSS inspector가 core처럼 보임 | HTML/CSS E2E를 legacy consumer 검증으로 분류 | default E2E가 engine demo만 검증 |
| 4 | 보편 부품과 제품 feature가 섞임 | `docs/affordance-inventory.md`에 keep/legacy/drop 분류 추가 | 다음 정리 기준이 남음 |

검증:

- `pnpm exec tsc -b --pretty false` -> pass
- focused Vitest -> pass
- `pnpm test:e2e` -> pass
- `pnpm lint` -> pass
- `pnpm build` -> pass
- `http://localhost:53175/` screenshot 확인
