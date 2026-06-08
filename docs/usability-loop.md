# 사용성 루프 기록

범위: 기본 `/`와 `/engine`이 공유하는 engine 검증 demo.

주의: 1-5회차 기록 중 product board 전환은 이후 public API 공급과 무관한 코드로 판정되어 제거됐다. 현재 기본 `/`는 다시 engine 부품 검증 demo다.

| 회차 | 점검 | 개선 | 평가 |
| --- | --- | --- | --- |
| 1 | 기본 화면이 design-system/product demo로 읽힘 | default seed를 shape/text/drawing으로 교체 | engine 부품이 첫 화면에 드러남 |
| 2 | product rail/source/review UI가 목적을 흐림 | demo shell에서 rail과 dock 장식 제거 | stage와 최소 controls만 남음 |
| 3 | DOM/CSS inspector가 core처럼 보임 | HTML/CSS E2E를 legacy consumer 검증으로 분류 | default E2E가 engine demo만 검증 |
| 4 | 보편 부품과 제품 feature가 섞임 | `docs/affordance-inventory.md`에 keep/legacy/drop 분류 추가 | 다음 정리 기준이 남음 |
| 5 | foundation만 키우면 제품 압력이 부족함 | `/`를 product brainstorming board로 전환하고 `/engine`을 검증 route로 보존 | 이후 public API 공급과 무관한 product route로 판정되어 제거 |
| 6 | product route가 package public API 공급과 무관함 | `/`와 `/engine`을 같은 engine demo로 단순화 | product seed/route/E2E/docs 제거 |

검증:

- `pnpm exec tsc -b --pretty false` -> pass
- focused Vitest -> pass
- `pnpm test:e2e` -> pass
- `pnpm lint` -> pass
- `pnpm build` -> pass
- `http://localhost:53175/` screenshot 확인
