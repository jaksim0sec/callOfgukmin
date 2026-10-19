# 국민의 부름 — 문서 체계

| 경로 | 구분 | 활용 |
|---|---|---|
| [VISION.md](VISION.md) | 방향성 | 어떤 게임을 만들지 |
| [developing/SYSTEMS.md](developing/SYSTEMS.md) | 구현 계약 | 이벤트 3종·선택 2종·정산·시간·저장·검증 콘텐츠 API |
| [developing/LIFE.md](developing/LIFE.md) | 1차 출생·생애 계약 | 단계 데이터·출생 기본값·인트로·미확정 전환 조건 |
| [developing/RUNTIME.md](developing/RUNTIME.md) | 구현 사실 | 3화면 HTML·JS 책임·화면 전환·상태 토큰 구조·검증 |
| [developing/CSS.md](developing/CSS.md) | **필수 CSS 작업 규칙** | 수정 전에 읽고 CSS 변경 때마다 동시 갱신 |
| [developing/UI.md](developing/UI.md) | 구현 사실 | 학교·특성 SVG 토큰, 화면별 구성, 포스터 |
| [notes/GAMEPLAY_IDEAS.md](notes/GAMEPLAY_IDEAS.md) | 기획 메모 | 단계별 진행·선택 시스템(미확정) |
| [notes/PLAYER_STATE.md](notes/PLAYER_STATE.md) | **현재 결정된 구조** | 속성 스탯 · 상태 스탯 · 특성, 단계별 활성화 및 미정 사항 |
| [notes/STATS.md](notes/STATS.md) | 이전 논의 | 과거 8스탯 제안. 현재 기준은 PLAYER_STATE 우선 |
| [notes/REGION_CATALOG.md](notes/REGION_CATALOG.md) | 기획 데이터 | 출생지역 255개 후보·태그(미구현) |
| [notes/UI_TOKENS.md](notes/UI_TOKENS.md) | 시각 기획 | SVG 스탯 토큰(미확정) |
| [RESEARCH.md](RESEARCH.md) | 조사 | 실제 제도·출처. 최신성 별도 확인 |
| [archive/](archive/) | 이력 | 과거 v3 / 시연 검증, 현행 명세 아님 |

**우선순위:** 실제 코드(현재 동작) ↔ `developing`(확정 구현 계약) ↔ `notes`(미확정 기획) 구분. 충돌하면 추측으로 하나를 정답 삼지 말고 차이를 보고한다.

문서 작성은 필요한 기존 파일을 갱신하는 것을 우선한다. 확정된 설계는 `notes`에서 `developing`으로 정리·이관하고 중복 규칙을 방치하지 않는다. 제목·경로만 보고도 해당 작업에 필요한 문서를 찾을 수 있도록 한다.
