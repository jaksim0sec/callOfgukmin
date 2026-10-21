# 국민의 부름 — 문서 안내

**현행 동작은 실제 소스가 기준**입니다. `developing/`은 현행 계약과 날짜별 구현 기록이 함께 있으므로 각 문서의 **맨 앞 현행 설명이 아래 과거 기록보다 우선**합니다. `notes/`는 이전 논의·미확정 구상이며 `archive/`는 과거 판본입니다.

현재 구현 범위: **출생~19세, 고교 졸업·수시/정시·수능 제출/결과·대학/사회 진로 선택·2회차 입시**. 대학 캠퍼스 생활·성인·정치·완결 엔딩은 미구현입니다.

| 문서 | 책임 |
|---|---|
| [../README.md](../README.md) | 플레이 범위·실행·검증 |
| [../AGENTS.md](../AGENTS.md) | 개발 지침·파일 책임·작업 절차 |
| [VISION.md](VISION.md) | 장기 목표 **(구현 명세 아님)** |
| [developing/RUNTIME.md](developing/RUNTIME.md) | 독립 페이지·로드 순서·화면/복원 흐름 |
| [developing/SYSTEMS.md](developing/SYSTEMS.md) | 이벤트 3종·선택 2종·정산·조건·턴·복구 |
| [developing/LIFE.md](developing/LIFE.md) | 출생/생애·학생 플레이·대입/재도전 |
| [developing/STORY.md](developing/STORY.md) | 인과·기회비용·조건 분기·현재 사건 |
| [developing/UI.md](developing/UI.md) | 종이 일상 선택/보상·시험/원서·포스터 |
| [developing/CSS.md](developing/CSS.md) | **CSS 수정 전 필독**: 단위·반응형·공통 토큰·시트 |
| [notes/PLAYER_STATE.md](notes/PLAYER_STATE.md) | 상태 분류와 아직 구현되지 않은 후속 규칙 |
| [notes/GAMEPLAY_IDEAS.md](notes/GAMEPLAY_IDEAS.md) | 초기 기획 아이디어 |
| [notes/STATS.md](notes/STATS.md) | 구형 8스탯 제안 **(현행 아님)** |
| [notes/UI_TOKENS.md](notes/UI_TOKENS.md) | 초기 SVG 토큰 논의 **(현행 생성기는 `statusView.js`)** |
| [notes/REGION_CATALOG.md](notes/REGION_CATALOG.md) | 지역 후보 데이터 원본 |
| [RESEARCH.md](RESEARCH.md) | 제도·출처 조사와 미구현 구분 |
| [archive/](archive/) | v3~v4 설계 기록 **(현행 아님)** |

### 개발 전 순서

1. `AGENTS.md` → `docs/README.md` → 요청에 해당하는 `developing/`.
2. 해당 `html/`·`js/`·`css/`와 테스트에서 실제 구현 확인.
3. CSS 작업 전 [developing/CSS.md](developing/CSS.md) 확인 후 **같은 커밋에 문서 갱신**.
4. 기획/옛 날짜별 기록을 현재 계약으로 취급하거나 미구현 기능을 구현했다고 적지 않기.
