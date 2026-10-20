# 국민의 부름 — 정적 화면 기반 실행 구조

> 현행: 정적 3화면·공통 정산 기반과 출생~19세 학생 생애 콘텐츠. 성인·정치·전체 게임 엔딩은 연결하지 않았다. 아래는 날짜별 개발 이력이므로 최신 LIFE/STORY/UI/CSS 계약을 우선한다.

## 2026-10-20 사용성 회귀 보강

- `game.renderProgress()`는 같은 한방 선택의 presenter가 소유하는 `#currentChoice` 재열기 DOM을 지우지 않는다. 선택 토큰 교체·해제 시에만 정리한다.
- `majorView`는 실제 현재 세션의 인물 스냅샷으로 효과를 투영하며 특성·조건부 결과를 포함한다. 모달 접기와 시트 헤더 재열기는 세이브를 변경하지 않는다.
- `render()`는 기록/검토/콘텐츠가 같은 일반 턴에서 로그 DOM을 다시 만들지 않는다. 최신 결과의 포커스·학교 모달 선택·저장된 결과를 보존한다.
- 전환 연출은 다음 선택창보다 먼저 표시하고 연출 중 UI 자동 진행을 멈춘다. 종료 뒤 대기 선택을 표시하며 학교 지원 결과도 모바일 기록 시트를 펼친다. 별도 저장 상태는 추가하지 않는다.
- `tests/experience.mjs`는 화면 버튼만 사용해 38회 선택과 결과 확인 후 현재 이야기 마지막까지 완주한다. 실제 콘텐츠로 320×568 / 390×844 / 1365×900의 긴 선택, 관심 기록, 시험 접기/재열기/새로고침, 성적 결과, 학교 확정 영역을 검사한다. 기존 `tests/browser.mjs`는 전체 생애와 저장·미리보기·바텀시트 회귀를 계속 검사한다.

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
| `js/game.js` | 공통 세션의 확정 상태 렌더, 일상 선택, 한방 UI 연결, 검증용 도구 |
| `js/effects.js` / `js/timeline.js` | 공통 정산·이벤트 3종·선택 2종·턴 및 대기 |
| `js/systemDemo.js` | 명시적으로 실행하는 공통 기반 검증 데이터 |
| `css/style.css` | 정적 세 화면 및 반응형·팝업·토큰 스타일 |
| `tests/smoke.mjs` | 독립 HTML/JS 상대경로·구문·ID·CSS 단위와 fetch 제거 확인 |

- `index.html` → `html/waiting.html` 리다이렉트. 각 `html/{waiting|game|result}.html`은 `<!doctype html>`이 있는 독립 문서이며 공통 JS/CSS는 정적 `<base href="../">`로 Pages의 `/callOfgukmin/` 및 로컬 상위 폴더를 기준으로 불러온다. 동적 base 삽입 전 잘못된 경로로 발생하는 브라우저 선행 요청을 방지한다. `boot.js`는 `document.baseURI`를 기준으로 페이지 네비게이션만 처리하며 `fetch()`를 사용하지 않는다. 루트 진입점도 상대 경로로 이동하므로 로컬 루트와 Pages 하위 경로에서 모두 작동한다.
- 스크립트 순서: `poster.js`, `playerState.js`, `effects.js`, `timeline.js`, `systemDemo.js`, `statusView.js`, `game.js`, `boot.js`. 일반 `defer` 스크립트, 번들러/외부 런타임 프레임워크 없음.
- 독립 HTML 파일이므로 `fetch()` 없이 직접 페이지가 열린다. HTTP 정적 서버 권장: 루트에서 `python3 -m http.server 8000`. GitHub Pages 호스팅 경로는 루트 `index.html` 유지.
- 초기 화면은 **대기**. 시작 클릭은 인트로 후 인게임으로 이동하고, 기본 생애 관제탑이 등록 콘텐츠의 마지막 시점까지만 자동 정산한다. 현재 출생 사건은 0턴이어서 턴·나이가 증가하지 않는다. 결과 화면은 대기에서 테스트용으로만 접근.
- 페이지 이동마다 브라우저가 새 HTML 문서를 로드하고, 공통 `localStorage` UI 키로 동일 인물을 다시 읽는다.
- 작업 시작 시 [AGENTS.md](../../AGENTS.md), CSS 작업이면 [CSS.md](CSS.md), [UI.md](UI.md) 확인.

## 인물 데이터·UI 계약

- `GukminPlayer.generate/load/save/ensure`는 현재 UI 세이브 키 `callOfgukmin__ui__v1`만 사용. 기존 플레이 기록 키 `callOfgukmin__playable__v1`은 읽거나 덮어쓰지 않는다.
- 출생 시 `phase:'infant'` / `stats.stress=0, health=100, money=0`인 **UI 테스트 인물**을 생성. 초기값은 게임 밸런스 확정값이 아니다.
- 예전 UI 스키마(`school`, `stats`, `history` 등)는 유효하면 읽을 수 있도록 유지. `family`는 **집안 속성**으로 표시되며 신규 특성으로 지급하지 않는다.
- `activeMetrics`는 단계 기본값과 명시적 활성/종료를 반영한 목록을 반환하며 `GukminStatus.render`가 이를 그린다. 직업·학력·역할 데이터는 추후 확장 가능. 실제 생애 성장 콘텐츠는 없으며 공통 정산·획득 기능은 [SYSTEMS.md](SYSTEMS.md)에 정의한다.
- `schoolHistory`: 학교별 `kind,name,status` 기록 배열. `enrolled`는 활성 알약 토큰, `graduated`는 일반/완료 토큰. 학력이 '텍스트+커다란 카드'가 되는 별도 UI가 아니다.
- `traits`: 별도 특성 토큰 목록. 버프·디버프를 데이터로 정의할 수 있으며 구체적인 기본 특성 밸런스는 미정. 상태 스탯 오른쪽 패널 **하단** 배치.
- 과거 게임 코드의 학업·정치 스탯과 새 [PLAYER_STATE.md](../notes/PLAYER_STATE.md)의 제안을 합쳐서 활성 게임플레이로 오해하지 않는다.

## 화면·회귀 검증

- PC: 왼쪽 포스터·프로필(속성/학교 토큰), 오른쪽 상태 스탯·특성 및 기록. 모바일: 포스터·속성 영역 가로 배치 + 상태·특성 + **항상 열린 하단 바텀시트**.
- CSS 작업 시 [CSS.md](CSS.md) 우선. 스탯이 많은 시기의 실제 UI 높이·터치 영역은 별도 점검.
- `node tests/smoke.mjs`에서 정적 경로/스크립트/구문/필수 ID/버프 토큰·화면 호스트 계약을 검사한다.
- 자동 스모크 통과는 실제 브라우저에서의 화면 전환·팝업·모바일 UI 확인과 동의어가 아니다. 실제 생애 콘텐츠·선거·엔딩은 미구현. 검증용 턴 진행은 명시적으로 시작한다.

## 공통 기반 인수인계 (2026-10-19)

데이터/API/정산 순서/저장 및 시간 계약은 [SYSTEMS.md](SYSTEMS.md)를 따른다. 이벤트는 소식·일상·한방, 선택은 일상·한방으로 확정했다. 기본 인게임의 상태 문구·미리보기 버튼·대기 화면 복귀 안내는 제거하고 일상 선택을 기록 아래에 표시한다. 검증 도구는 `?systems=1`에서만 표시하고 한방 선택 전용 팝업은 후속 개발한다.

## 생애 초기 설정 및 출생 인트로 (2026-10-19)

- `js/playerState.js`의 `lifeStages`가 기존 7개 생애 ID, 화면 표시명, 대표 후속 경로, 단계별 기본 스탯 목록을 소유한다. `birthDefaults`는 출생 초기 상태값의 단일 원천이다. 인물 생성 시 기존 이름·가정 샘플에서 선택하며 실제 인구통계 확률을 의미하지 않는다.
- `js/effects.js`의 단계 ID 검증은 같은 등록 데이터를 참조한다. 효과 `attributes.phase`로 단계 변경은 가능하나, 자동 성장·나이/턴 대응·조건별 콘텐츠 실행은 추가하지 않았다.
- `html/waiting.html`의 `#birthIntro`는 시작 클릭 뒤 나타나는 출생 연출 전용 오버레이다. `boot.js`는 저장 인물의 이름·출생 배경만 읽고 약 3초 후 게임으로 화면 이동한다. `#birthIntroSkip`, Escape, 동작 줄이기 선호는 즉시 이동한다. 인트로 자체는 시간을 진행하거나 재추첨·저장하지 않는다.
- 구체적인 데이터와 보류한 결정은 [LIFE.md](LIFE.md) 참조.

## 기본 생애 관제탑 연결 (2026-10-19)

- 로드: `data/base.js`는 `playerState.js` 앞, `life/director.js`와 `life/infant.js`는 `timeline.js` 뒤·`game.js` 앞. 3개 독립 페이지의 스크립트 참조를 같이 유지한다.
- 인게임은 기존 시연 데이터 `GukminContent`가 없으면 `GukminDirector.create(...).run()`으로 시작한다. 인생 기록/스탯/포스터 렌더러는 그대로 사용한다.
- 선택 대기 또는 제공된 콘텐츠가 끝나면 자동 턴 진행을 중단하고 진행도에 `이야기 준비 중`을 표시한다. 시계·나이 증가의 공식은 없다.
- 명시적으로 `?systems=1`을 열면 기존 검증 버튼을 표시한다. 이미 생애 세션이 저장되었더라도 검증 시작을 누를 때 **개발용 세션만** 새로 시작하고, 기본 생애를 별도로 진행시키지는 않는다.
- 구조/경계는 [LIFE.md](LIFE.md). 오래된 `callOfgukmin__playable__v1` 키는 불변.

## 정적 지역·재력 자료와 공통 렌더러 (2026-10-19)

- `data/base.js`에 독립적으로 추첨되는 가정 재력 계층 프리셋을 기록하고 `data/regions.js`에 기존 255개 지역 후보와 태그를 이관. 모든 화면에서 `playerState.js` 앞에 두 파일을 로드한다.
- `GukminPlayer.generate()`에서 출생 지역·태그·재력·특성을 만든다. `GukminStatus.traitToken(name)`으로 출생 인트로와 인게임 특성 토큰을 공유하며 저장 중인 기존 인물은 다시 추첨하지 않는다.

## 고교까지 플레이 흐름 (2026-10-19)

- 정적 로드 순서: `data/base → data/regions → data/schools → playerState → effects → timeline → life/director → life/story → life/infant → life/elementary → life/middle → life/high → systemDemo → statusView → game → majorView → boot`. 대기/결과 HTML도 같은 로드 순서를 유지하여 스모크 검증을 공유한다.
- 기본 인생은 첫 선택(2세 가족 이벤트)까지 자동 진행하며 이후 선택을 해결할 때마다 관제탑이 다음 사건 시점까지 진행한다. 해당 시대 이벤트가 없으면 멈춘다. 고3 기말고사와 졸업까지 처리된 뒤 추가 운영자(operator) 등록을 기다린다.
- 한방 팝업은 `majorView.js`가 게임 뷰의 `#lifeDecisionDialog`에 실험실과 별도로 표시한다. 기존 학교/정당 UI는 여전히 검증 모드 전용 미리보기이며 기본 게임에서 접근할 수 없다.
- 구버전 저장 데이터·legacy 키를 삭제하지 않는다. 동일 `life-main-v1` 콘텐츠 ID를 유지하고 과거에 완료된 출생 사건은 중복 실행하지 않는다.

## 브라우저 자동회귀 (2026-10-19)

- `.github/workflows/smoke.yml`의 기존 정적/시스템 작업과 **별도 browser 작업**이 Playwright+Chromium을 설치하여 `tests/browser.mjs`를 실행한다. 실패해도 PC/모바일 스크린샷 산출물을 GitHub Actions artifact로 남긴다.
- 시연용 외부 `GukminContent` 모드와 기본 인생 연속 진행은 같은 브라우저 테스트 안에서 독립 BrowserContext로 검증한다. 선행 시험을 선택하자마자 다음 시험지 팝업이 열릴 수 있으므로 다이얼로그 존재 자체가 아니라 *이전 토큰이 closed*인지 확인한다.


## 추가 데이터·UI 로드 (2026-10-19)

- HTML 3개에서 data/schools.js 다음, playerState.js 전에 data/grades.js를 로드한다.
- statusView.js는 기본 스탯 ID별 SVG/색을 부여하고 내신과 모의고사에 게임 예상 등급을 보인다.
- 기존 79턴/19세 고교 졸업까지의 자동 진행과 저장 키는 그대로 유지한다. 신규 고교 학년별 시험은 6회이다.


## 2026-10-19 화면·저장 동작 수정

- `html/game.html`: 상태 스탯/속성 스탯의 실제 DOM 위치를 교체, 기록 제목 `#lifeHeadline`과 `#sheetToggle`, 공용 스크롤 `#sheetContent` 추가. 모바일 바텀시트는 고정이며 닫히지 않는다.
- `js/game.js`: 기록 최신순·나이 및 현재 학년, 용돈·스탯 선택 토큰, 선택 결과 리뷰/다음 이야기 버튼을 표시한다. 사용자가 리뷰 상태에서 재접속하면 이어서 확인 가능하다.
- `js/boot.js`: 출생신고서 10초 프로그레스와 수동 출생 버튼. 인물 데이터는 다시 추첨하지 않고 출생 인트로에서 턴을 진행하지 않는다.
- 테스트는 기본 검증 모드의 자율 시간 이동과 일반 생애의 리뷰 대기 흐름을 구분해야 한다.

## 모바일 시트 배포 캐시 (2026-10-20)

- `html/game.html`은 3단계 시트 개선분이 이전 GitHub Pages 캐시에 묶이지 않게 CSS와 게임 JS 참조에 버전 쿼리를 붙인다. 정적 파일 경로와 스크립트 로드 순서는 그대로다.
- `tests/smoke.mjs`는 경로·순서 검증 시 쿼리를 제거하고 실제 파일 존재 검사를 유지한다.


## 2026-10-20 생애 스토리 브랜치 실행 계약

오퍼레이터가 런타임 이전에 반환하는 스토리 정의에는 조건부 `variants` 후보가 포함될 수 있으나, 실제 후보의 `scenarioId`는 `timeline.pump()`의 이벤트 시작 순간 저장된다. 새로고침 시 기존 시나리오를 계속 쓰고 구 저장 선택은 `choiceId`에 연결된 원래 옵션을 유지한다. `contentId`, 저장 키, `simulation.version` 불변.

`GukminDailyChoice.restore(snapshot)`는 일상 선택의 저장된 `awaitingContinuation` 리뷰와 `reviewBefore`를 복원한다. 기록·결과 마크업은 `GukminMarkup.render` 안전 DOM 전용. 상세 제약은 [STORY.md](STORY.md) 참조.

## 2026-10-20 스토리·가격 판본 전환
- 세 화면의 게임 스크립트와 CSS URL, 루트 대기 이동에 `?v=story-balance-20261020`를 붙였다. 이전 버전의 브라우저 캐시가 최근 분기를 숨기지 않도록 한다.
- 대기 화면은 이미 진행한 저장 인물을 확인해 `이어서 플레이하기`와 `새 인생 시작하기 (기록 초기화)`를 구분한다. 새 인생은 확인 후 생성하며, 기존 기록은 사용자가 초기화하기 전까지 보존한다. 이전에 완료한 이벤트는 코드가 바뀌어도 소급 재실행되지 않는다.

## 2026-10-20 화면 진행 연출과 캐시 버전
- `?v=ui-motion-traits-20261020`로 3개 화면의 CSS·JS 버전, `boot.js` 네비게이션과 루트 리다이렉트 판본을 맞춘다.
- 기존 `run()`은 동기식으로 보존하여 공통 시뮬레이션/세이브 검증을 유지한다. 게임 화면의 결과 확인 버튼은 `director.step()`으로 논리 턴을 한 번씩 진행하고 중간 소식 뒤 짧게 쉬었다가 다음 선택으로 이어진다. 탭 재진입과 초기 실행은 기존 동기 복원 경로를 따른다.
