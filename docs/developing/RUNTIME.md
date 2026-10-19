# 국민의 부름 — 정적 화면 기반 실행 구조

> 기준: UI 프로토타입의 화면 분리·스탯 렌더러 도입. **게임 진행·엔딩 판정은 아직 없음.** 런타임 구현 사실과 향후 생애 시스템 설계를 혼동하지 않는다.

## 진입·화면 책임

| 파일 | 현재 책임 |
|---|---|
| `index.html` | GitHub Pages 루트 진입 시 `html/waiting.html`로 이동하는 리다이렉트 전용 |
| `html/waiting.html` | 대기 화면·현재 인물/출생 정보·시작/재추첨/결과 미리보기 버튼 |
| `html/game.html` | 인게임 포스터·속성/상태·특성·인생 기록·학교/정당 모달 |
| `html/result.html` | 종료 판정이 없는 결과 화면 **미리보기** |
| `js/boot.js` | 독립 HTML 화면별 초기화·화면 이동. 런타임 HTML fetch 사용 안 함 |
| `js/playerState.js` | 인물 생성/보존·스탯 정의/단계별 활성 조건·학력/특성 기반 데이터 |
| `js/statusView.js` | 왼쪽 속성·학력 토큰 / 오른쪽 상태 스탯·특성 렌더링 |
| `js/poster.js` | 기존 독립 DOM 포스터 `GukminPoster.create/update` |
| `js/game.js` | **인게임 화면 전용** 컨트롤러: 렌더/기록, 서류·투표지 미리보기, 리셋 |
| `css/style.css` | 정적 세 화면 및 반응형·팝업·토큰 스타일 |
| `tests/smoke.mjs` | 독립 HTML/JS 상대경로·구문·ID·CSS 단위와 fetch 제거 확인 |

- `index.html` → `html/waiting.html` 리다이렉트. 각 `html/{waiting|game|result}.html`은 `<!doctype html>`이 있는 독립 문서이며 공통 JS/CSS를 `../` 상대경로로 불러온다. `boot.js`는 화면별 초기화와 페이지 네비게이션만 처리하며 `fetch()`를 사용하지 않는다.
- 스크립트 순서: `poster.js`, `playerState.js`, `statusView.js`, `game.js`, `boot.js`. 일반 `defer` 스크립트, 번들러/외부 런타임 프레임워크 없음.
- 독립 HTML 파일이므로 `fetch()` 없이 직접 페이지가 열린다. HTTP 정적 서버 권장: 루트에서 `python3 -m http.server 8000`. GitHub Pages 호스팅 경로는 루트 `index.html` 유지.
- 초기 화면은 **대기**. 시작 클릭은 인게임으로 이동하지만 **스토리 시간은 진행시키지 않는다**. 결과 화면은 대기에서 테스트용으로만 접근.
- 페이지 이동마다 브라우저가 새 HTML 문서를 로드하고, 공통 `localStorage` UI 키로 동일 인물을 다시 읽는다.
- 작업 시작 시 [AGENTS.md](../../AGENTS.md), CSS 작업이면 [CSS.md](CSS.md), [UI.md](UI.md) 확인.

## 인물 데이터·UI 계약

- `GukminPlayer.generate/load/save/ensure`는 현재 UI 세이브 키 `callOfgukmin__ui__v1`만 사용. 기존 플레이 기록 키 `callOfgukmin__playable__v1`은 읽거나 덮어쓰지 않는다.
- 출생 시 `phase:'infant'` / `stats.stress=0, health=100, money=0`인 **UI 테스트 인물**을 생성. 초기값은 게임 밸런스 확정값이 아니다.
- 예전 UI 스키마(`school`, `stats`, `history` 등)는 유효하면 읽을 수 있도록 유지. `family`는 **집안 속성**으로 표시되며 신규 특성으로 지급하지 않는다.
- `activeMetrics`는 단계에 해당하는 상태 목록만 반환하며 `GukminStatus.render`가 이를 그린다. 직업·학력·역할 데이터는 추후 확장 가능. 아직 실제 성장·획득·효과 정산은 없다.
- `schoolHistory`: 학교별 `kind,name,status` 기록 배열. `enrolled`는 활성 알약 토큰, `graduated`는 일반/완료 토큰. 학력이 '텍스트+커다란 카드'가 되는 별도 UI가 아니다.
- `traits`: 별도 특성 토큰 목록. 시각 표시만 제공하며 버프·디버프 계산은 차후. 상태 스탯 오른쪽 패널 **하단** 배치.
- 과거 게임 코드의 학업·정치 스탯과 새 [PLAYER_STATE.md](../notes/PLAYER_STATE.md)의 제안을 합쳐서 활성 게임플레이로 오해하지 않는다.

## 화면·회귀 검증

- PC: 왼쪽 포스터·프로필(속성/학교 토큰), 오른쪽 상태 스탯·특성 및 기록. 모바일: 포스터·속성 영역 가로 배치 + 상태·특성 + **항상 열린 하단 바텀시트**.
- CSS 작업 시 [CSS.md](CSS.md) 우선. 스탯이 많은 시기의 실제 UI 높이·터치 영역은 별도 점검.
- `node tests/smoke.mjs`에서 정적 경로/스크립트/구문/필수 ID/버프 토큰·화면 호스트 계약을 검사한다.
- 자동 스모크 통과는 실제 브라우저에서의 화면 전환·팝업·모바일 UI 확인과 동의어가 아니다. 게임 진행·선거·엔딩은 아직 비활성.
