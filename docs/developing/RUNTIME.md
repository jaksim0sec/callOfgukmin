# 현재 시연판 — 실행·파일 계약

> 2026-10-19 소스 확인 기준. **현재 구현 사실**이다. 미래 게임 전체 명세가 아니다.

| 파일 | 역할 |
|---|---|
| `index.html` | GitHub Pages 배포 진입점(루트 고정), DOM 및 리소스 참조 |
| `css/style.css` | 상태 패널·모달·바텀시트·반응형 스타일 |
| `js/poster.js` | `window.GukminPoster`를 제공하는 독립 포스터 스크립트 |
| `js/game.js` | 사건·선택·스탯·세이브·렌더링을 포함한 시연판 단일 스크립트 |
| `tests/smoke.mjs` | 외부 의존성 없는 정적 참조·구문 최소 검사 |

- HTML은 일반 `<script defer>`로 `js/poster.js`를 먼저, `js/game.js`를 나중에 로드. 빌드 시스템 없음. 기본 `index.html` 배포 주소 유지.
- `game.js`의 기존 로컬 저장 키는 `callOfgukmin__playable__v1`. 문서·파일 정리 중 키/세이브 구조를 변경하지 않는다.
- `#playerPosterMount` 및 기존 DOM ID는 게임/포스터 스크립트의 참조 계약이다.
- 웹으로 실행: 저장소 루트에서 `python3 -m http.server 8000`. 구문/참조 검사: `node tests/smoke.mjs`.
- 현재 시연은 출생·학교·직업·정당·선거·엔딩, 로컬 저장·PNG 결과 출력을 포함한다. 이는 **완성된 생애 시뮬레이터가 아님**.
- [notes/STATS.md](../notes/STATS.md)의 신규 스탯, [notes/REGION_CATALOG.md](../notes/REGION_CATALOG.md)의 255개 지역 데이터, 내신·수능 분리 등은 아직 시연판에 통합되지 않았다.
- 과거 자동 플레이/브라우저 검증 기록은 [archive/PLAYABLE_DEMO_V4.md](../archive/PLAYABLE_DEMO_V4.md)로 보관. 이번 정리 시 해당 테스트를 재실행한 것으로 간주하지 않는다.

## 회귀 확인
1. `node tests/smoke.mjs`: 상대 파일 경로, JS 파싱, DOM ID, 세이브 키.
2. 브라우저에서 시작→선택→진행→종료, 저장 새로고침·새 인생, 포스터 렌더 확인.
3. 모바일 바텀시트·모달·스크롤 확인. 정적 테스트만으로 실제 UI 동작을 보증하지 않는다.

향후 코드 분리는 이벤트 데이터·상태 규칙·렌더링 사이에 **실제 책임 경계가 생겼을 때만** 시행한다. 현재는 파일 위치만 정리하고 게임 동작은 변경하지 않는다.
