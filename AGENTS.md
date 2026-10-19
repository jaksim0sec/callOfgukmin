# 국민의 부름 — AGENTS.md

## 프로젝트
- 저장소: `jaksim0sec/callOfgukmin`, 기본 브랜치 `main`. 현재 코드는 완성된 게임이 아닌 **공통 게임 기반과 검증용 진행을 갖춘 UI 시연판**.
- 목표: 출생부터 성장·진학·취업·정치까지 선택과 운으로 전개되는 한국 배경의 풍자 인생 게임. [docs/VISION.md](docs/VISION.md).
- GitHub Pages에서 **저장소 루트 `index.html`**을 사용한다. 배포 루트·외부 라이브러리를 이유 없이 바꾸지 않는다. 과거 플레이 저장을 보존하고 신규 UI 시연용 키를 분리한다.

## 구조
- `index.html`: GitHub Pages 루트 진입점, 대기 화면으로 리다이렉트만 수행. 세부 화면 DOM 금지.
- `html/waiting.html`, `html/game.html`, `html/result.html`: 각 화면의 독립 HTML 문서(공통 JS/CSS 참조). 페이지 네비게이션으로 교체.
- `css/style.css`: 공통 스타일·모바일 바텀시트·선택 모달.
- `js/poster.js`: 포스터 컴포넌트(`window.GukminPoster`).
- `js/boot.js`: 각 화면의 초기화와 독립 페이지 간 이동. `fetch()`/HTML 조각 삽입 금지.
- `js/data/base.js`: 기본 정적 데이터셋(이름·가정·스탯·생애 단계·특성·재력 프리셋). 생성/시간 로직 금지.
- `js/data/regions.js`: 출생 지역 후보 255개·태그 정적 사전.
- `js/playerState.js`: 인물 생성·저장·등록 정의·생애 단계별 표시 목록.
- `js/life/director.js`: 생애 오퍼레이터 등록·현재 단계 조건 활성화·콘텐츠가 있는 지점까지만 자동 진행.
- `js/life/story.js`: 소식·일상·시험 이벤트 생성기.
- `js/life/infant.js`, `elementary.js`, `middle.js`, `high.js`: 출생부터 19세 고교 졸업까지 콘텐츠 오퍼레이터.
- `js/data/schools.js`: 실제 학교 이름의 지역별 시연 표본 및 게임용 입학 조건(공식 통계 아님).
- `js/majorView.js`: 시험지·고교 지원서 모달. 공통 한방 선택 표시기만 사용.
- `js/statusView.js`: 속성/학교 토큰과 상태 프로그래스·특성 SVG 토큰 렌더링.
- `js/game.js`: 인게임 세션 상태 렌더·일상 선택·한방 UI 연결 및 검증 도구. 0~19세 승인된 생애 시연을 재생하고 성인·정치·엔딩은 아직 연결하지 않는다.
- `js/effects.js`, `js/timeline.js`: 데이터 기반 공통 정산·이벤트·선택·턴/대기. 계약은 `docs/developing/SYSTEMS.md`.
- `js/systemDemo.js`: 명시적 검증 콘텐츠. 기본 플레이 콘텐츠가 아님.
- `tests/systems.mjs`, `tests/browser.mjs`: 정산/시간 및 실제 Chromium 통합 검증.
- `tests/smoke.mjs`: 파일 참조·스크립트 구문·DOM 연결 검사.
- `docs/VISION.md`: 방향·제품 가치.
- `docs/developing/`: **현재 확인된 구현 사실, 확정 개발 계약**.
- `docs/notes/`: **미확정** 시스템·능력치·지역·이벤트·UI 제안.
- `docs/archive/`: 예전 설계·검증 기록. 현재의 구현 명세가 아님.
- `docs/RESEARCH.md`: 조사 출처(시간 경과 시 재검증).

## 작업 원칙
1. [docs/README.md](docs/README.md)의 분류를 먼저 읽고 **요청과 관련된** `docs/developing/`·`docs/notes/` 문서를 읽은 뒤 실제 소스를 확인한다.
2. 기획 중인 Claude/GPT 제안은 사용자가 확정하기 전까지 구현 계약으로 간주하지 않는다. 과거 v3 스탯/성향과 신규 기획을 임의로 섞지 않는다.
3. 디렉터리는 책임, 파일명은 역할. `utils.js`, `misc.js`, `final2` 식 이름, 비어 있는 확장용 폴더·계층, 불필요한 라이브러리·서버·번들러를 도입하지 않는다.
4. **CSS 변경 시 `docs/developing/CSS.md`를 작업 전에 반드시 읽고, CSS 변경사항을 같은 커밋에서 해당 문서에 함께 반영한다.** PC/모바일 분기를 구분하고 루트 외에는 `rem`/`em` 기준 단위를 사용한다.
5. 대기·인게임·결과 HTML 책임을 분리하고, 포스터·선택 팝업·모바일 바텀시트를 보존한다. 옛 플레이 세이브를 삭제하거나 새 시연 세이브와 혼합하지 않는다. `poster.js → data/base.js → data/regions.js → data/schools.js → playerState.js → effects.js → timeline.js → life/director.js → life/story.js → life/infant.js → life/elementary.js → life/middle.js → life/high.js → systemDemo.js → statusView.js → game.js → majorView.js → boot.js` 로드 순서와 화면 마운트 생명주기를 지킨다.
6. 오류는 증상에 우회 코드를 덧대기 전에 호출·상태·원인을 확인한다. 개발 명세와 코드가 불일치하면 실제 구현과 기획을 구분해서 보고한다.
7. 필요한 최소 변경 뒤 `node tests/smoke.mjs`, `node --test tests/systems.mjs`를 실행하고, PC·모바일 UI, 저장 복구, 선택 미리보기가 실제 게임 진행을 유발하지 않는지 확인한다. 확인하지 않은 테스트를 성공했다고 쓰지 않는다.
8. 관련 수정은 가급적 한 커밋에 묶고, 불필요한 브랜치·PR·반복 배포를 만들지 않는다. 배포 설정 변경과 큰 리팩터링은 명확한 이유 없이 하지 않는다.
9. `AGENTS.md`의 규칙 변경이 필요하면 사용자에게 무엇을 왜 바꿨는지 알린다.
10. 이벤트는 소식(선택 없음)·일상(일상 선택)·한방(한방 선택), 선택은 일상·한방으로 확정한다. 일상 선택은 기록 아래 N개 버튼, 한방은 전용 팝업을 임의로 만들지 않고 대기/연결 인터페이스를 보존한다.
