# Feature 제공 목록

기준: 로컬 Vite 실행 URL 사용 및 코드 확인.

1. 전체 브라우저 뷰포트를 캔버스 작업 영역으로 사용한다.
2. 캔버스 배경에 40px 간격 그리드를 표시한다.
3. 초기 데이터로 파란 사각형, 초록 사각형, 텍스트 항목을 제공한다.
4. 초기 진입 시 파란 사각형과 텍스트 항목을 다중 선택 상태로 표시한다.
5. 좌상단에 도구 툴바를 캔버스 오버레이로 고정 표시한다.
6. 툴바는 `role="toolbar"`와 `Tools` 접근성 레이블을 제공한다.
7. 도구 버튼은 아이콘, `aria-label`, `title`을 함께 제공한다.
8. 선택 도구 버튼을 제공한다.
9. 팬 도구 버튼을 제공한다.
10. 사각형 생성 도구 버튼을 제공한다.
11. 텍스트 생성 도구 버튼을 제공한다.
12. 활성 도구 버튼은 `aria-pressed` 상태를 노출한다.
13. 활성 도구 버튼은 시각적 활성 상태를 표시한다.
14. 그룹 버튼을 제공한다.
15. 언그룹 버튼을 제공한다.
16. 선택 항목이 2개 미만이면 그룹 버튼을 비활성화한다.
17. 선택 항목에 그룹이 없으면 언그룹 버튼을 비활성화한다.
18. 좌하단에 줌 컨트롤을 캔버스 오버레이로 고정 표시한다.
19. 줌 컨트롤은 `Zoom controls` 접근성 레이블을 제공한다.
20. 현재 줌 배율을 정수 퍼센트로 표시한다.
21. 줌 아웃 버튼을 제공한다.
22. 줌 값 버튼으로 줌 리셋을 실행한다.
23. 화면 맞춤 버튼을 제공한다.
24. 줌 인 버튼을 제공한다.
25. 선택 도구에서 빈 캔버스를 클릭하면 현재 선택을 해제한다.
26. 선택 도구에서 빈 캔버스를 드래그하면 마키 선택을 시작한다.
27. 마키 드래그 중 선택 영역을 반투명 사각형으로 표시한다.
28. 마키 선택은 항목 경계와 교차한 항목을 선택한다.
29. `Shift`, `Meta`, `Ctrl`을 누른 마키 선택은 기존 선택에 항목을 추가한다.
30. 항목 클릭 시 해당 항목을 단일 선택한다.
31. `Shift`, `Meta`, `Ctrl` 클릭으로 항목을 선택에 추가한다.
32. 이미 선택된 항목은 `Shift`, `Meta`, `Ctrl` 클릭으로 선택에서 제거한다.
33. 선택된 항목에는 파란 외곽선을 표시한다.
34. 여러 항목 선택 시 전체 선택 경계를 점선 박스로 표시한다.
35. 선택 경계에 8개 리사이즈 핸들을 표시한다.
36. 리사이즈 핸들은 방향별 커서를 제공한다.
37. 줌 배율이 바뀌어도 리사이즈 핸들의 화면상 크기를 유지한다.
38. 선택 도구 상태에서는 기본 커서를 사용한다.
39. 사각형 및 텍스트 도구 상태에서는 십자 커서를 사용한다.
40. 팬 상태에서는 잡기 커서와 드래그 중 잡은 커서를 사용한다.
41. 캔버스 항목은 드래그 가능한 커서를 표시한다.
42. 선택 항목을 드래그하면 위치를 이동한다.
43. 선택되지 않은 항목을 드래그하면 먼저 선택한 뒤 이동한다.
44. 여러 선택 항목을 드래그하면 함께 이동한다.
45. 3px 이하의 미세 포인터 이동은 실제 이동으로 처리하지 않는다.
46. 이동 중에는 항목 위치를 라이브로 반영한다.
47. `Alt`를 누른 채 항목을 드래그하면 복제본을 만든 뒤 이동한다.
48. 팬 도구에서 캔버스를 드래그하면 뷰포트를 이동한다.
49. 스페이스바를 누르는 동안 현재 도구와 무관하게 임시 팬 모드로 전환한다.
50. 마우스 가운데 버튼 드래그로도 뷰포트를 이동한다.
51. 마우스 휠은 포인터 위치를 기준으로 확대 및 축소한다.
52. 줌 배율은 최소 20%, 최대 500%로 제한한다.
53. 줌 인은 화면 중앙 기준으로 1.25배 확대한다.
54. 줌 아웃은 화면 중앙 기준으로 0.8배 축소한다.
55. 줌 리셋은 뷰포트를 원점과 100% 배율로 되돌린다.
56. 화면 맞춤은 선택 항목이 있으면 선택 항목 기준으로 맞춘다.
57. 화면 맞춤은 선택 항목이 없으면 전체 항목 기준으로 맞춘다.
58. `0` 키로 전체 항목 화면 맞춤을 실행한다.
59. `1` 키로 선택 항목 화면 맞춤을 실행한다.
60. `V` 키로 선택 도구를 활성화한다.
61. `H` 키로 팬 도구를 활성화한다.
62. `R` 키로 사각형 도구를 활성화한다.
63. `T` 키로 텍스트 도구를 활성화한다.
64. `Escape`는 제스처, 드래프트, 마키, 편집, 선택을 취소하고 선택 도구로 돌아간다.
65. 사각형 도구에서 드래그하면 드래프트 사각형을 표시한다.
66. 사각형 드래그를 마치면 새 사각형을 생성한다.
67. 아주 짧은 사각형 입력은 168x112 기본 크기 사각형으로 보정한다.
68. 새 사각형은 생성 직후 선택된다.
69. 새 사각형은 노란 계열 채움과 선 색상으로 생성된다.
70. 리사이즈 핸들 드래그로 선택 경계의 크기와 위치를 조정한다.
71. 여러 항목 선택 상태에서 리사이즈하면 선택 항목들을 함께 스케일한다.
72. 리사이즈는 항목 최소 크기 24px을 유지한다.
73. 텍스트 도구에서 캔버스를 클릭하면 새 텍스트 항목을 생성한다.
74. 새 텍스트 항목은 190x42 기본 크기로 생성된다.
75. 새 텍스트 항목은 `Text` 기본값으로 생성된다.
76. 새 텍스트 항목은 생성 직후 선택된다.
77. 텍스트 생성 직후 인라인 편집기를 연다.
78. 텍스트 편집기는 실제 `textarea`로 제공된다.
79. 텍스트 편집기가 열리면 포커스와 전체 선택을 적용한다.
80. 텍스트 편집기는 항목 위치와 줌 배율에 맞춰 배치된다.
81. 텍스트 항목 더블클릭으로 인라인 편집을 시작한다.
82. 사각형 더블클릭으로 사각형 라벨 편집을 시작한다.
83. 텍스트 편집 중 `Enter`로 값을 커밋한다.
84. 텍스트 편집 중 `Shift+Enter`로 줄바꿈을 입력한다.
85. 텍스트 편집 중 `Escape`로 편집을 취소한다.
86. 텍스트 편집기 블러 시 값을 커밋한다.
87. 텍스트 항목을 빈 값으로 커밋하면 `Text` 기본값으로 복원한다.
88. 텍스트 편집기 포인터 입력은 캔버스 드래그로 전파하지 않는다.
89. 입력 요소에서 타이핑 중이면 전역 캔버스 단축키를 실행하지 않는다.
90. `Delete` 또는 `Backspace`로 선택 항목을 삭제한다.
91. 화살표 키로 선택 항목을 1px 단위 이동한다.
92. `Shift+화살표`로 선택 항목을 10px 단위 이동한다.
93. `Cmd/Ctrl+C`로 선택 항목을 앱 내부 클립보드에 복사한다.
94. `Cmd/Ctrl+X`로 선택 항목을 잘라낸다.
95. `Cmd/Ctrl+V`로 내부 클립보드 항목을 새 ID로 붙여넣는다.
96. 붙여넣기와 복제는 28px, 28px 오프셋을 적용한다.
97. `Cmd/Ctrl+D`로 선택 항목을 복제한다.
98. `Cmd/Ctrl+G` 또는 그룹 버튼으로 선택 항목을 그룹화한다.
99. `Cmd/Ctrl+Shift+G` 또는 언그룹 버튼으로 선택 그룹을 해제한다.
100. `Cmd/Ctrl+Z`, `Cmd/Ctrl+Shift+Z`, `Cmd/Ctrl+Y`로 실행 취소와 다시 실행을 제공한다.
101. 툴바는 실행 취소 버튼을 제공한다.
102. 툴바는 다시 실행 버튼을 제공한다.
103. 실행 취소할 히스토리가 없으면 실행 취소 버튼을 비활성화한다.
104. 다시 실행할 히스토리가 없으면 다시 실행 버튼을 비활성화한다.
105. 툴바는 선택 항목 복제 버튼을 제공한다.
106. 툴바는 선택 항목 삭제 버튼을 제공한다.
107. 선택 항목이 없으면 복제 버튼을 비활성화한다.
108. 선택 항목이 없으면 삭제 버튼을 비활성화한다.
109. 툴바 버튼은 주요 단축키를 `title`로 제공한다.
110. 좁은 화면에서 툴바 버튼은 줄바꿈되어 화면 밖으로 밀리지 않는다.
111. 우하단에 현재 캔버스 상태를 표시한다.
112. 상태 표시에는 현재 도구 또는 진행 중 제스처를 표시한다.
113. 상태 표시에는 현재 선택 개수를 표시한다.
114. 상태 표시에는 현재 줌 배율을 표시한다.
115. 상태 표시는 `aria-live="polite"`로 변경 사항을 노출한다.
116. 줌 컨트롤은 `role="toolbar"`를 제공한다.
117. 화살표 connector는 선택과 저장에 포함되는 `text` 라벨을 가질 수 있다.
118. 라벨이 있는 connector는 선 중앙에 읽기 가능한 라벨 박스를 표시한다.
119. connector 라벨은 더블클릭으로 인라인 텍스트 편집을 시작한다.
120. connector 라벨 편집기는 선 전체 경계가 아니라 라벨 위치에 맞춰 열린다.
121. connector 라벨 편집 중 plain `Enter`는 줄바꿈으로 남기고, 블러 시 값을 커밋한다.
122. 새로 생성하는 connector는 FigJam식 bent/elbow 경로로 생성된다.
123. 기존 straight connector 저장 데이터는 그대로 렌더링하고, connector 저장 shape는 `straight`와 `elbow` routing만 허용한다.
124. 선택 객체 인스펙터는 FigJam식 fill/stroke 색상 swatch를 제공한다.
125. Fill swatch는 사각형과 component 기반 항목에 적용된다.
126. Stroke swatch는 사각형, component, connector, marker, highlighter에 적용된다.
127. 색상 변경은 선택 상태를 유지한 채 document history에 기록된다.
128. Section은 내부 built-in tool로 제공된다.
129. `Shift+S`는 Section tool을 활성화하고, `S` sticky note shortcut과 충돌하지 않는다.
130. Section tool은 클릭 시 기본 section을 만들고, 드래그 시 custom size section을 만든 뒤 선택 도구로 돌아간다.
131. 선택한 section을 이동하면 section bounds 안에 완전히 포함된 항목도 함께 이동한다.
132. Section-contained 이동은 연결된 stamp/comment와 connector도 같은 Host transform 규칙으로 함께 처리한다.
133. Locked item과 section 밖으로 일부라도 벗어난 항목은 section-contained 이동에 포함하지 않는다.
134. Section title은 더블클릭으로 인라인 편집할 수 있다.
135. Section title 편집은 component `title` field를 patch한다.
136. Section title editor는 section 전체가 아니라 title 영역에 맞춰 열린다.
137. Sticky note는 커밋된 텍스트가 현재 높이에 들어가지 않으면 세로로 자동 확장된다.
138. Sticky auto-grow는 `body` patch와 `h` patch를 같은 document history change로 기록한다.
139. Comment는 선택 시 body card를 표시한다.
140. Comment는 더블클릭으로 body를 인라인 편집할 수 있다.
141. 빈 comment body 커밋은 저장 가능한 기본 `Comment` 값으로 복원한다.
142. Canvas App은 외부에서 collaborator presence cursor 목록을 runtime prop으로 받을 수 있다.
143. Demo는 두 명의 collaborator cursor를 canvas overlay에 표시한다.
144. Presence cursor는 줌 배율과 무관하게 화면상 크기를 유지한다.
145. Comment tool로 새 comment를 만들면 생성 직후 body editor가 열린다.
146. Comment 생성 직후 active tool은 select로 돌아간다.
147. Collaborator presence는 cursor와 함께 remote selection bounds를 표시할 수 있다.
148. Demo collaborator presence는 각 collaborator가 선택 중인 객체를 colored outline으로 표시한다.
149. Marker/highlighter freehand stroke는 connector용 직선 path와 분리된 SVG smoothing path로 렌더링한다.
150. Draft stroke preview와 커밋된 drawing stroke는 같은 smoothing primitive를 사용한다.
151. Marker/highlighter stroke 생성은 현재 선택을 훔치지 않아 연속 드로잉 흐름을 유지한다.
152. Marker/highlighter tool은 color, width, opacity drawing controls를 표시한다.
153. Drawing controls의 style 변경은 draft stroke preview와 커밋된 drawing stroke에 같이 적용된다.
154. Sticky note 하나를 선택하면 상/하/좌/우에 `+` quick-create control을 표시한다.
155. Sticky quick-create control은 선택한 방향에 빈 sticky note를 만들고 바로 body editor를 연다.
156. Sticky quick-create는 원본 sticky와 새 sticky 사이에 elbow connector를 같은 history change로 만든다.
157. Stamp controls는 선택 객체가 있으면 선택 경계 위에 contextual reaction bar로 표시된다.
158. Eraser tool은 marker/highlighter freehand stroke를 whole-stroke 단위로 지운다.
159. 선택 객체에 reaction stamp를 추가해도 선택은 원래 객체에 남아 연속 반응을 붙일 수 있다.
160. 같은 객체 또는 같은 selection bounds에 추가한 reaction stamp는 기존 stamp와 겹치지 않도록 간격을 두고 배치된다.
161. Contextual reaction bar는 상단 객체 선택 시 toolbar 아래로 내려와 버튼 클릭을 방해받지 않는다.
162. Laser pointer는 문서 item을 만들지 않는 built-in transient tool로 제공된다.
163. Laser pointer drag는 SVG overlay trail과 현재 점을 표시하고 pointer 종료 시 사라진다.
164. `P` shortcut은 Laser pointer tool을 활성화한다.
165. Cursor chat은 `/` shortcut으로 열리는 built-in transient UI로 제공된다.
166. Cursor chat은 pointer 위치에 붙어 움직이며 Escape 또는 canvas pointer down으로 닫힌다.
167. Cursor chat은 문서 item을 만들지 않고 App UI 상태로만 유지된다.
168. Demo canvas는 초기 선택 없이 열려 inspector와 reaction bar를 필요할 때만 표시한다.
169. Session timer는 문서 item을 만들지 않는 built-in facilitation affordance로 제공된다.
170. Session timer는 5/10/15분 preset, start, pause, resume, +1m, reset을 지원한다.
171. Running session timer는 시간을 줄이지 않고 남은 시간을 추가하는 방식으로만 조정한다.
172. Voting session은 문서 item을 만들지 않는 built-in facilitation affordance로 제공된다.
173. Voting session은 prompt와 1인당 vote limit을 설정하고 start/end/clear 상태를 관리한다.
174. Active voting session에서는 stamp insertion이 local vote quota를 소모하고 quota가 끝나면 stamp controls를 비활성화한다.
175. Spotlight는 문서 item을 만들지 않는 built-in facilitation affordance로 제공된다.
176. Spotlight는 현재 board collaborator presence 수를 follower count로 표시하고 stop 상태를 App transient state로 관리한다.
177. Emote burst는 문서 item을 만들지 않는 built-in live reaction affordance로 제공된다.
178. Emote controls 또는 `Shift`+canvas click은 마지막 pointer 위치에 viewport scale 보정된 transient reaction burst를 표시한다.
179. Shape tool군은 FigJam 기본 shape affordance로 제공되며 rectangle, ellipse, diamond를 같은 `create-shape` pointer grammar와 bounded `shape` 저장 계약으로 생성한다.
180. Ellipse tool은 `O` shortcut을 제공하고, Diamond tool은 toolbar에서 SVG diamond path로 렌더링된다.
181. CSV/TSV tabular text는 FigJam식 built-in table import affordance로 처리한다.
182. `.csv` 파일 drop은 drop 위치에 matrix table component를 생성하고, spreadsheet clipboard paste는 viewport 중심에 table을 생성한다.
183. Table component 렌더러는 고정 3x3이 아니라 저장된 `columns`와 `items` 계약에서 동적 행/열 grid를 계산한다.
184. HTTP/HTTPS URL 또는 embed snippet paste는 FigJam식 built-in link preview import affordance로 처리한다.
185. URL drop은 drop 위치에 link preview component를 생성하고, URL paste는 viewport 중심에 link preview component를 생성한다.
186. Link preview component는 `url`을 title/body와 분리해 저장하고, renderer는 component library template 없이 built-in `link-preview-card` presentation으로 표시한다.
187. 선택한 link preview는 Inspector의 built-in action으로 원본 URL text item으로 되돌릴 수 있다.
188. 선택한 static link preview는 Inspector action으로 horizontal/vertical 표시 방향을 전환할 수 있다.
189. 선택한 connector는 Inspector action으로 elbow/straight routing을 전환할 수 있다.
190. 선택한 checklist component는 Inspector에서 항목 체크, 텍스트 수정, 항목 추가와 삭제를 할 수 있다.
191. 선택한 Queue/Kanban component는 Inspector에서 카드 텍스트 수정, 카드 추가/삭제와 순서 이동을 할 수 있다.
