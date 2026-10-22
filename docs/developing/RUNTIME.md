## 2026-10-22 진행 타이밍·교실 경기 재현성 (현행)

사용자 설정 키 `callOfgukmin__controls__v1`는 변경하지 않는다. 값이 없는 새 플레이는 manual을 사용하고, 저장된 auto/manual은 그대로 우선한다. 수동 진행은 `nextMoment`가 무소식 턴만 건너뛰고 표시 가능한 소식 또는 선택에서 멈춘다. 자동은 실제 `Timeline.step`마다 소식이면 3000ms, 일반이면 450ms 뒤 재개하고, `choiceProgressFill`을 그 대기 시간과 현재 타임라인 진행 비율 사이에서만 보간한다. 저장 턴은 보간 중 변경하지 않는다.

교실 자리 선택에서 운동능력은 도윤 또는 실제 계주 출전에서만 활성화된다. 계주 운 보정은 저장된 `admissionSeed` 기반 결정적 해시로 매번 동일하여 결과·중간 새로고침·동결 선택 스크립트의 재현성을 유지한다. 보정 크기는 경기 임계점 ±1에 한정되며 선수 선택과 특성 이점이 우선한다. 새 확률 저장 키/별도 정산기는 없다.

`GukminDailyScenes`는 메시지별 대사·SVG runner DOM 순서·순위 시각화만 담당하고 `dailyChoice`는 한 번의 settle과 회복 가능한 결과를 관리한다. 기존 시트 생성·저장·보상·중고교 시험/진학 표시기는 변경하지 않는다.

## 2026-10-22 교실 콘텐츠·일상 표현 (현행)

`life/classroom.js`는 elementary와 같은 단계에서 작동하는 소규모 콘텐츠 오퍼레이터다. 기존 첫 친구 선택의 새 정산에만 `classroomRevision=1`을 부여한다. 이를 조건으로31턴 자리,35턴 짝꿍 메시지,38턴 운동회가 열린다. 운동능력 정의는 data/base에 두어 다른 화면에서도 같은 저장을 읽을 수 있다. 이미 완료한/옛 스크립트로 대기 중인 선택에는 새 플래그를 소급 부여하지 않으므로 기존 저장에 과거 선택이 끼어들지 않는다. 첫 반 번호는 이름으로 결정한1~6 중 하나이며 짝꿍은 seatmate에 저장한다. 학년 전체의 학급 재편성/친구 인공지능은 구현하지 않는다.

`dailyScenes.js`는 DOM 표현만 담당하며 `dailyChoice.js`가 선택/예측/자동 열기/확정/보상 복원을 유지한다. 스크립트의 presentation은 기존 대기 선택과 함께 동결 저장된다. 결과 복원도 저장된 스크립트·optionId·outcome.attributes를 사용하며 보상을 재실행하지 않는다. 입력·임의 HTML·외부 채팅 서비스는 없다. 새 스탯은 첫 활성값을 ‘시작’ 토큰으로 표시하고 이미 존재하는 수치의 증감과 구분한다.

로드: game HTML의 elementary 다음 classroom, sheetController 다음 dailyScenes→dailyChoice. 두 새 파일은 SW shell에도 포함한다. 검증은 systems의 교실/기존 저장 조건과 `tests/classroom.mjs`의 실제 PC/모바일/320 화면·자리/대화/경주·새로고침 결과 복구를 사용한다.

## 2026-10-22 플레이어 진행 설정 (현행)

`game.js`가 자동/수동과 사용자 정지를 소유한다. 실제 논리 진행/정산은 기존 Director.step()/Timeline이 유지한다. 수동 다음은 최대10000개의 무소식 턴만 건너뛰고 보이는 기록·대기 선택·컷신·안내에서 멈춘다. 결과 정산을 우회하지 않는다. 자동 타이머는 사용자 정지·가이드·숨겨진 문서에서 진행하지 않는다. 일상 렌더러 `setAutomatic(false)`는 남은5초 열기 시간을 보존하고 다시 켜면 이어 간다.

설정은 `callOfgukmin__controls__v1`의 `{mode,paused}`, 가이드 숨김은 `callOfgukmin__tutorial_hidden__v1`의 `1`로 별도 저장한다. 새 삶/새로고침에도 유지하며 인물 저장/과거 playable 저장은 수정하지 않는다. 가이드 동안 첫 생애 복원과 선택 UI를 보류하고 닫을 때 한 번만 복원한다. 기존 결과 대기·접은 선택·한방 표시기·구매 간격을 보존한다. 마운트 해제 시 타이머·dialog·visibilitychange를 정리한다.

검증: `CHROMIUM_PATH=/usr/bin/chromium node tests/playback.mjs`. 기존 브라우저 시나리오는 `tests/browserSession.mjs`에서 가이드를 이미 본 사용자로 설정한다. 첫 진입/미표시 선택·진행 제어는 playback 전용 테스트가 실제 UI로 검증한다.

## 2026-10-22 한국식 세는나이 (현행)

자산/화면 이동/서비스 워커는 `korean-age-20261022`이다. 출생1살·초1 8살·중1 14살·고1 17살·고3 수능19살·고교 졸업20살을 사용한다. `GukminData.schoolAges`가 화면 계산/기본 단계/학생 용돈과 편의점 경계의 공통 기준이다. 실제 입학/학년 사건과 시험 데이터도 같은 나이를 사용한다. 이벤트 ID와 발생 턴은 유지한다.

인물은 `ageSystem=korean`을 저장한다. 구0살 출생 저장은 load/save/타임라인 복원에서 현재/과거 기록/선택 전후/동결 선택의 나이·시험 제목을 한 번 +1 보정한다.30세 종료 경계는 그대로 유지한다. 돈·능력치·지원 사용 횟수·이벤트 ID/완료 횟수·정산 ID·턴·기존 세이브 키는 변경하지 않는다. 실제 저장은 기존 저장 경로를 사용하며 과거 결과를 다시 실행하지 않는다.

신생아가1살인 것을 진행 중 저장으로 오인하지 않도록 홈의 신규 판정도 출생 기본 나이를 따른다. 회고 시작도1살이며 결과는 ‘살아온 년수’ 대신 한국식 나이를 표시한다.

## 2026-10-22 대통령 도전 표지 릴리스 (현행)

진입/화면 이동·수정 자산·서비스 워커는 `campaign-home-20261022`이다. 헤더 직업 DOM 제거 외 인물 상태와 진행 규칙은 유지한다. browser의 헤더 시나리오로0살·초1·중2·고2·졸업 후 나이를 PC/모바일에서 검증한다.

## 2026-10-22 새 홈·전환 릴리스 (현행)

진입/화면 이동·수정 자산·서비스 워커는 `lobby-motion-20261022`이다. `navigate()`는 기본160ms 전환 뒤 이동하고 reduced-motion이면 즉시 이동한다. 신규 안내는7초 후 자동으로 출생신고서에 이어지며 스킵과 같은 단일 경로를 사용한다. 저장/타임라인/정산/가족 지원 규칙은 변경하지 않는다.

## 2026-10-22 가족 지원 릴리스 (현행)

진입/화면 이동·수정 자산·서비스 워커는 `family-retake-20261022`이다. 원본 포스터/아이콘과 저장 키는 유지한다. 재수는 기존 `retryYear` 공통 정산과 시간축에 남기며 새 별도 엔진/서버를 추가하지 않는다. 지원·독학·사회 진출·30세 종료 검증은 systems와 experience의 checkpoints에서 수행한다.

## 2026-10-22 출생 전 안내 릴리스 (현행)

자산/화면 이동/서비스 워커는 `fiction-notice-20261022`이다. 상태/기존 저장 키는 변경하지 않는다. 안내·스킵·저장 불변은 ui-refresh, 오프라인 신규 인생 진입은 pwa 브라우저 검증에 포함한다.

## 2026-10-22 화면 정리 릴리스 (현행)

진입/화면 이동·수정 자산·서비스 워커 버전은 `life-scenes-20261022`이다. 변경된 `life/story.js`도 같은 버전으로 갱신한다. 기존 저장·선택·정산·원본 아이콘은 보존한다. 검증은 smoke/systems 및 ui-refresh의 PC·모바일·소형 화면에서 스크롤, 사망→회고, 故 크기/비사망 구분, 파비콘 투명 모서리를 포함한다.

## 2026-10-21 PWA·아이콘·오프라인 (현행)

진입/화면 이동과 이번 변경 자산은 `pwa-icons-20261021`을 사용한다. 사용자 제공8483.jpg 원본을 `assets/icons/app-icon-source.jpg`로 보존하고 PNG192/512·maskable512·Apple180·ICO16/32/48·PNG 파비콘을 생성했다. 모든 화면은 `<base>` 다음에 동일한 manifest/아이콘을 참조한다. `manifest.json`의 상대 `id/start_url/scope`는 GitHub Pages 저장소 하위 경로에서도 동작한다.

`boot.js`가 load 후 HTTPS/localhost에서 `sw.js?v=RELEASE`를 등록한다. 첫 온라인 방문의 워커 설치가 끝나면 대기·게임·결과와 로컬 자산을 오프라인으로 열 수 있다. 외부 Google 글꼴은 캐시 대상이 아니며 오프라인에서는 기본 글꼴로 표시한다. 설치·홈 화면 추가 메뉴는 브라우저가 제공하며 별도 설치 유도 팝업은 없다.

워커는 명시한 정적 파일만 네트워크 우선으로 제공하고 실패 시 캐시로 복원한다. 쿼리는 캐시 키에서 제거한다. 새 RELEASE의 워커가 필수 파일 전체를 확보한 뒤 활성화하며 `gukmin-shell-`의 이전 캐시만 정리한다. 기존 화면을 강제로 새로고침하지 않는다. 저장 키·인물·선택 정산은 변경하지 않으며 다른 앱 캐시도 보존한다. JS/HTML을 추가하면 `sw.js`의 `SHELL` 목록도 갱신하고 릴리스 시 boot의 RELEASE/진입 쿼리를 함께 올린다.

검증: `CHROMIUM_PATH=/usr/bin/chromium node tests/pwa.mjs`. 독립 Chromium 프로필의 PC·모바일에서 설치 가능 판정·저장소 scope·HTTP 캐시를 끈 새 오프라인 탭·선택/새로고침 복구·결과1080×1350 PNG·워커 버전 교체/캐시 정리·레거시 저장 보존을 확인한다. OS 홈 화면 설치 조작은 자동화하지 않는다.

## 2026-10-21 초등 선택 정정 캐시 (현행)

진입/화면 이동·변경 자산은 `elementary-choices-20261021`을 사용한다. 신규 방과후/선거 데이터와 잠금 설명/글자 크기를 반영하며 기존 저장 키·선택 ID·동결 스크립트·과거 결과는 유지한다.

## 2026-10-21 결과 카드 실행 (현행)

진입/화면 이동·변경 자산의 쿼리는 `life-card-20261021`이다. 결과 화면에만 `js/resultView.js`를 boot 직전에 로드한다. boot는 화면 이동/초기화를, resultView는 읽기 전용 결과·회고·합성 PNG를 담당한다. `GukminPoster.ready(el)`은 글꼴/초상 디코드를 기다리고 원본 Canvas를 반환한다. 저장 키·과거 기록·선택 ID는 그대로다.

## 2026-10-21 회복 정산·GU 구매 캐시 (현행)

진입/화면 이동·CSS·변경한 정산/학생 데이터/화면 JS의 쿼리는 `gu-recovery-20261021`이다. 상품 SVG도 같은 쿼리를 사용한다. 저장 키·모델 버전·동결 선택·과거 기록은 변경하지 않는다. 저장된 대기 선택도 현재 공통 정산기의 정신병 우선 회복 규칙으로 실행한다.

## 2026-10-21 GU·안내 빈도 캐시 (현행)

진입/화면 이동·CSS·변경된 JS의 쿼리는 `gu-care-20261021`이다. 기존 저장 키·정산 ID·턴·동결 스크립트는 유지한다. `pressureGuideSeen`과 새 `pressureCriticalSeen`을 별도로 저장하여 첫 안내/정신병4 경고를 반복하지 않는다. 검증은 `tests/pressure.mjs`의 PC·390·320 브라우저 경로에 포함한다.

## 2026-10-21 상태창 복원 캐시

진입/화면 이동·CSS·statusView/game/boot 쿼리는 `vitals-grid-20261021`이다. 공통 정산·저장 모델은 그대로다.

## 2026-10-21 압박·돌봄 캐시 (현행)

진입/화면 이동·세 독립 HTML의 자산 쿼리는 `pressure-care-20261021`이다. `mentalModel:2` 마이그레이션은 상태/타임라인 복원 시 적용한다. 전용 UI 검증은 `CHROMIUM_PATH=/usr/bin/chromium node tests/pressure.mjs`를 사용한다.

## 2026-10-21 학업 카드 캐시 갱신

진입/화면 이동·CSS·boot 쿼리는 `academic-layout-20261021`로 갱신한다. 다른 JS는 기존 `life-refresh-20261021`을 유지한다.

## 2026-10-21 화면 개편 캐시 (현행)

루트 진입·화면 이동 및 세 독립 HTML의 자산 쿼리는 `life-refresh-20261021`이다. 결과 화면은 `boot.js`에서 기존 저장을 읽고 DOM/Canvas로 표현하며 게임 엔진이나 새 저장을 만들지 않는다. UI 회귀는 `CHROMIUM_PATH=/usr/bin/chromium node tests/ui-refresh.mjs`로 이름/복구/공유 호출/PNG/구매/쿨다운을 PC·390×844·320×568에서 확인한다. OS 공유 창에서 실제 외부 전송하는 과정은 자동화하지 않는다.

## 2026-10-21 25점 저장·캐시 (현행)

- 새 인물은 `statScale:25`를 저장한다. 이전 저장은 load/세션 복원에서 한 번 변환하며 기존 저장 키·이벤트 ID·정산 ID는 유지한다. 금액·시간·응시 회차는 변환하지 않는다.
- 진입 URL과 모든 화면의 JS/CSS 쿼리를 `balance25-20261021`로 맞춰 새 수치 코드와 이전 자산이 섞이지 않게 한다. 이번 작업은 로컬 main 커밋 범위이며 원격 배포 검증을 뜻하지 않는다.

# 국민의 부름 — 정적 화면 기반 실행 구조

## 2026-10-21 학생 생애 개정 — 현행

정적 HTML/일반 JS/기존 로드 순서를 유지한다. 제품 의존성·빌드·서버를 추가하지 않았다. 공통 성적 순수 계산은 기존 `data/grades.js`에 있어 새 스크립트 로더가 필요 없다. 세 화면 CSS/JS 버전은 `student-revision-20261021`이다.

선택 script와 발표 대기는 기존 simulation 안에 저장한다. 이전 인물/키는 보존하며 이미 완료한 사건은 재지급하지 않는다. N수는2회/99턴 종료 대신 실제 연도 반복과 세 한계로 진행한다. 입시 seed는 신생 인물에 저장하며 구 인물은 기존 출생 식별값의 안정적 해시를 사용한다.

검사: `node tests/smoke.mjs`, `node --test tests/systems.mjs`, `CHROMIUM_PATH=/usr/bin/chromium node tests/browser.mjs`, `CHROMIUM_PATH=/usr/bin/chromium node tests/experience.mjs`. Playwright는 테스트 전용이다. 환경별 Chromium 경로는 조정한다. [수치/범위/화면 검증표](STUDENT_REVISION.md).

> 아래2회차·99턴 등은 개정 전 이력이다.

## 2026-10-21 시각 진행바와 일상 선택 자동 노출

`GukminDailyChoice`는 동일 토큰당 한 번만 5초 wall-clock 타이머를 시작한다. `document.visibilitychange`에서 남은 시간과 막대를 일시 정지하며, 수동 열기·접기·다른 선택·dispose 시 타이머를 취소한다. 5초 후의 유일한 부작용은 `dialog.showModal()`이고 `resolve`/정산은 절대 호출하지 않는다. 인생 진행바의 값은 기존 논리 턴에만 의존하고, UI 진행률은 CSS transform 보간으로 표시한다. `GukminStatus.showMetrics`는 각 게이지의 실제 현재 변환 값을 읽어 새 렌더에 이어 주고, 접근 가능한 `<progress>`의 값을 그대로 유지한다. 출생 화면도 원래의 10초 타이머와 Skip 버튼을 변경하지 않는다.


## 현행 일상 보상 시트·진행 연결 (2026-10-21)

- `GukminDailyChoice`는 기존 `engine.resolve(token,id)`로 **정산·저장한 뒤 모눈종이 `#dailyChoiceDialog`를 열린 채 유지**한다. 본문만 체크 표시/획득 제목/실제 결과·통합 알약 토큰으로 교체한다.
- `#dailyPaperConfirm`은 기존 `.daily-paper-confirm` 스타일에서 문구만 `보상 받기`로 바뀐다. 탭·Escape·아래 드래그 등으로 닫힘이 완료된 뒤 `startJourney()`를 호출한다. 보상을 보기 전에 다음 사건을 진행시키지 않는다.
- 정산 영향은 `runtime.choices[token].outcome.before/after`와 인생 기록에 남는다. `reviewPending`을 새로고침으로 복원하면 같은 보상 종이를 다시 열고, 실제 결과가 없는 구세이브에서는 가짜 보상 없이 레거시 복구를 실행한다.
- 다음 일상은 새 토큰의 **5초 자동 열림** 또는 직접 열기 중 먼저 발생한 것으로 열린다. 5초는 UI 전용 실시간 카운트다운이며 턴/정산을 진행시키지 않는다. 한방은 별도 화면이다.

## 2026-10-20 범용 시트 컨트롤러

`js/sheetController.js`는 시트 `element`, `handle`, `dragTargets`, `steps: [{name,ratio,minRem?,maxRem?,topGapRem?}]`, `initial`, `enabled`, `dismissible`, `removeOnDismiss`, `onDismiss`를 받아 재사용 가능한 스냅/관성/해제 정책을 제공한다. `dispose`, `dismiss`, `setLevel`, `reset`, `revealAtLeast`, `getLevel` 메서드를 제공한다. 스타일 변경은 각 시트 클래스로 격리한다.

기록 시트는 3단계 비삭제형, 일상 모눈 선택지는 2단계 접기 허용형이다. 후자는 명시적 버튼으로 선택을 확정한 뒤 **같은 종이에서 보상**을 보여 주고, 수령/닫기 이후에만 진행한다.


> **2026-10-21 현행:** 정적 3화면, 출생~19세 학생 사건과 대입 수시/정시·최대 2회차 입시 결산까지 연결됐다. 대학 생활·성인·정치·엔딩은 미구현이다. **아래 날짜별 개발 이력은 당시 상태**로, 현행 안내와 충돌하면 실제 소스·맨 앞 계약을 우선한다.

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
| `js/statusView.js` | 오른쪽 속성·학력 토큰과 왼쪽 상태 스탯·특성 렌더링(PC 기준) |
| `js/poster.js` | 기존 독립 DOM 포스터 `GukminPoster.create/update` |
| `js/game.js` | 인게임 상태·기록·일상/한방 연결·컷신·진행·검증 도구 |
| `js/dailyChoice.js` / `js/sheetController.js` | 일상 선택/동일 시트 보상·5초 열기 / 공통 시트 스냅·접기 |
| `js/life/admissions.js` | 수시/정시·수능/내신 제출·진로 및 입시 재도전 |
| `js/effects.js` / `js/timeline.js` | 공통 정산·이벤트 3종·선택 2종·턴 및 대기 |
| `js/systemDemo.js` | 명시적으로 실행하는 공통 기반 검증 데이터 |
| `css/style.css` | 정적 세 화면 및 반응형·팝업·토큰 스타일 |
| `tests/smoke.mjs` | 독립 HTML/JS 상대경로·구문·ID·CSS 단위와 fetch 제거 확인 |

- `index.html` → `html/waiting.html` 리다이렉트. 각 `html/{waiting|game|result}.html`은 `<!doctype html>`이 있는 독립 문서이며 공통 JS/CSS는 정적 `<base href="../">`로 Pages의 `/callOfgukmin/` 및 로컬 상위 폴더를 기준으로 불러온다. 동적 base 삽입 전 잘못된 경로로 발생하는 브라우저 선행 요청을 방지한다. `boot.js`는 `document.baseURI`를 기준으로 페이지 네비게이션만 처리하며 `fetch()`를 사용하지 않는다. 루트 진입점도 상대 경로로 이동하므로 로컬 루트와 Pages 하위 경로에서 모두 작동한다.
- 실제 인게임 `defer` 로드 순서: `poster → data/base → data/regions → data/schools → data/grades → playerState → effects → timeline → life/director → life/story → life/infant → life/elementary → life/middle → life/high → life/admissions → systemDemo → statusView → sheetController → dailyChoice → game → majorView → boot`. `html/game.html`을 기준으로 유지하며 번들러는 없다.
- 독립 HTML 파일이므로 `fetch()` 없이 직접 페이지가 열린다. HTTP 정적 서버 권장: 루트에서 `python3 -m http.server 8000`. GitHub Pages 호스팅 경로는 루트 `index.html` 유지.
- 초기 화면은 **대기**. 시작 클릭은 인트로 후 인게임으로 이동하고, 기본 생애 관제탑이 등록 콘텐츠의 마지막 시점까지만 자동 정산한다. 현재 출생 사건은 0턴이어서 턴·나이가 증가하지 않는다. 결과 화면은 대기에서 테스트용으로만 접근.
- 페이지 이동마다 브라우저가 새 HTML 문서를 로드하고, 공통 `localStorage` UI 키로 동일 인물을 다시 읽는다.
- 작업 시작 시 [AGENTS.md](../../AGENTS.md), CSS 작업이면 [CSS.md](CSS.md), [UI.md](UI.md) 확인.

## 인물 데이터·UI 계약

- `GukminPlayer.generate/load/save/ensure`는 현재 UI 세이브 키 `callOfgukmin__ui__v1`만 사용. 기존 플레이 기록 키 `callOfgukmin__playable__v1`은 읽거나 덮어쓰지 않는다.
- 출생 시 `phase:'infant'` / `stats.stress=0, health=100, money=0`인 **UI 테스트 인물**을 생성. 초기값은 게임 밸런스 확정값이 아니다.
- 예전 UI 스키마(`school`, `stats`, `history` 등)는 유효하면 읽을 수 있도록 유지. `family`는 **집안 속성**으로 표시되며 신규 특성으로 지급하지 않는다.
- `activeMetrics`는 단계 기본값과 명시적 활성/종료를 반영하고 `GukminStatus.render`가 표시한다. 유년기~고교·대입 분기는 구현됐지만 대학 캠퍼스 및 성인 직업·정치 활동은 연결되지 않았다. 정산 규칙은 [SYSTEMS.md](SYSTEMS.md)를 따른다.
- `schoolHistory`: 학교별 `kind,name,status` 기록 배열. `enrolled`는 활성 알약 토큰, `graduated`는 일반/완료 토큰. 학력이 '텍스트+커다란 카드'가 되는 별도 UI가 아니다.
- `traits`: 별도 특성 토큰 목록. 버프·디버프를 데이터로 정의할 수 있으며 구체적인 기본 특성 밸런스는 미정. 상태 스탯과 같은 패널의 **상단** 배치.
- 과거 게임 코드의 학업·정치 스탯과 새 [PLAYER_STATE.md](../notes/PLAYER_STATE.md)의 제안을 합쳐서 활성 게임플레이로 오해하지 않는다.

## 화면·회귀 검증

- PC: 왼쪽 포스터와 상태 스탯·특성, 오른쪽 속성·학교 토큰과 인생 기록. 모바일: 포스터·상태가 상단 2열, 아래에 속성·학교, 화면 아래에 **항상 남는 인생 기록 시트**. 일상 종이는 별도 접을 수 있는 모달이다.
- CSS 작업 시 [CSS.md](CSS.md) 우선. 스탯이 많은 시기의 실제 UI 높이·터치 영역은 별도 점검.
- `node tests/smoke.mjs`에서 정적 경로/스크립트/구문/필수 ID/버프 토큰·화면 호스트 계약을 검사한다.
- 자동 스모크 통과는 실제 브라우저에서의 화면 전환·팝업·모바일 UI 확인과 동의어가 아니다. 실제 생애 콘텐츠·선거·엔딩은 미구현. 검증용 턴 진행은 명시적으로 시작한다.

## 공통 기반 인수인계 (2026-10-19)

데이터/API/정산 순서/저장 및 시간 계약은 [SYSTEMS.md](SYSTEMS.md)를 따른다. 이벤트는 소식·일상·한방, 선택은 일상·한방으로 확정했다. 기본 인게임의 상태 문구·미리보기 버튼·대기 화면 복귀 안내는 제거하고 일상 선택을 기록 아래에 표시한다. 검증 도구는 `?systems=1`에서만 표시하고 한방 선택 전용 팝업은 후속 개발한다.

## 생애 초기 설정 및 출생 인트로 (2026-10-19)

- `js/playerState.js`의 `lifeStages`가 기존 7개 생애 ID, 화면 표시명, 대표 후속 경로, 단계별 기본 스탯 목록을 소유한다. `birthDefaults`는 출생 초기 상태값의 단일 원천이다. 인물 생성 시 기존 이름·가정 샘플에서 선택하며 실제 인구통계 확률을 의미하지 않는다.
- `js/effects.js`의 단계 ID 검증은 같은 등록 데이터를 참조한다. 효과 `attributes.phase`로 단계 변경은 가능하나, 자동 성장·나이/턴 대응·조건별 콘텐츠 실행은 추가하지 않았다.
- `html/waiting.html`의 `#birthIntro`는 시작 클릭 뒤 나타나는 출생 연출 전용 오버레이다. `boot.js`는 저장 인물의 출생 배경을 읽고 **10초 후** 게임으로 이동한다. `#birthIntroSkip` 또는 Escape로 즉시 이동할 수 있다. 동작 줄이기 설정은 화면 애니메이션만 축소하며 10초 대기를 자동 생략하지 않는다. 인트로 자체는 시간을 진행하거나 재추첨·저장하지 않는다.
- 구체적인 데이터와 보류한 결정은 [LIFE.md](LIFE.md) 참조.

## 기본 생애 관제탑 연결 (2026-10-19)

- 로드: `data/base.js`는 `playerState.js` 앞, `life/director.js`와 `life/infant.js`는 `timeline.js` 뒤·`game.js` 앞. 3개 독립 페이지의 스크립트 참조를 같이 유지한다.
- 인게임은 기존 시연 데이터 `GukminContent`가 없으면 `GukminDirector.create(...).run()`으로 시작한다. 인생 기록/스탯/포스터 렌더러는 그대로 사용한다.
- 선택 대기나 제공된 콘텐츠의 끝에서는 자동 턴 진행을 멈춘다. 실제 턴 진행 중일 때만 선택 진행도를 보이며 콘텐츠가 소진됐다고 가짜 100% 막대를 표시하지 않는다. 시계·나이 증가의 공식은 없다.
- 명시적으로 `?systems=1`을 열면 기존 검증 버튼을 표시한다. 이미 생애 세션이 저장되었더라도 검증 시작을 누를 때 **개발용 세션만** 새로 시작하고, 기본 생애를 별도로 진행시키지는 않는다.
- 구조/경계는 [LIFE.md](LIFE.md). 오래된 `callOfgukmin__playable__v1` 키는 불변.

## 정적 지역·재력 자료와 공통 렌더러 (2026-10-19)

- `data/base.js`에 독립적으로 추첨되는 가정 재력 계층 프리셋을 기록하고 `data/regions.js`에 기존 255개 지역 후보와 태그를 이관. 모든 화면에서 `playerState.js` 앞에 두 파일을 로드한다.
- `GukminPlayer.generate()`에서 출생 지역·태그·재력·특성을 만든다. `GukminStatus.traitToken(name)`으로 출생 인트로와 인게임 특성 토큰을 공유하며 저장 중인 기존 인물은 다시 추첨하지 않는다.

## 고교까지 플레이 흐름 (2026-10-19)

- **당시(2026-10-19) 로드 이력**: 이후 `data/grades`, `life/admissions`, `sheetController`, `dailyChoice`가 추가됐다. 현행의 정확한 로드 순서는 위 `진입·화면 책임`에서 확인한다. 세 화면은 각자 필요한 스크립트를 `defer`로 로드한다.
- 기본 인생은 첫 선택(2세 가족 이벤트)까지 자동 진행한다. 이후 일상 보상을 받거나 한방 결과를 확인하면 다음 등록 사건을 진행한다. 현재는 고교 졸업뿐 아니라 **대입·최대 2회차 진로 결산**까지 콘텐츠가 있고, 이후에는 새 오퍼레이터를 기다린다.
- 한방 팝업은 `majorView.js`가 게임 뷰의 `#lifeDecisionDialog`에 실험실과 별도로 표시한다. 기존 학교/정당 UI는 여전히 검증 모드 전용 미리보기이며 기본 게임에서 접근할 수 없다.
- 구버전 저장 데이터·legacy 키를 삭제하지 않는다. 동일 `life-main-v1` 콘텐츠 ID를 유지하고 과거에 완료된 출생 사건은 중복 실행하지 않는다.

## 브라우저 자동회귀 (2026-10-19)

- `.github/workflows/smoke.yml`의 기존 정적/시스템 작업과 **별도 browser 작업**이 Playwright+Chromium을 설치하여 `tests/browser.mjs`를 실행한다. 실패해도 PC/모바일 스크린샷 산출물을 GitHub Actions artifact로 남긴다.
- 시연용 외부 `GukminContent` 모드와 기본 인생 연속 진행은 같은 브라우저 테스트 안에서 독립 BrowserContext로 검증한다. 선행 시험을 선택하자마자 다음 시험지 팝업이 열릴 수 있으므로 다이얼로그 존재 자체가 아니라 *이전 토큰이 closed*인지 확인한다.


## 추가 데이터·UI 로드 (2026-10-19)

- HTML 3개에서 data/schools.js 다음, playerState.js 전에 data/grades.js를 로드한다.
- statusView.js는 기본 스탯 ID별 SVG/색을 부여하고 내신과 모의고사에 게임 예상 등급을 보인다.
- **2026-10-19 당시** 79턴을 마지막 학생 콘텐츠 경계로 사용했다. 현재 고교 졸업은 **88턴**이고 이후 입시 재도전·진로 사건이 등록되어 있다. 고교 연간 한방 시험은 학년당 2회, 총 6회다.


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

`GukminDailyChoice.restore(snapshot)`는 저장된 일상 검토 대기에서 `outcome.before/after`를 읽어 실제 보상 시트를 복구한다. 기록·결과 마크업은 `GukminMarkup.render` 안전 DOM 전용. 상세 제약은 [STORY.md](STORY.md) 참조.

## 2026-10-20 스토리·가격 판본 전환
- 세 화면의 게임 스크립트와 CSS URL, 루트 대기 이동에 `?v=story-balance-20261020`를 붙였다. 이전 버전의 브라우저 캐시가 최근 분기를 숨기지 않도록 한다.
- 대기 화면은 이미 진행한 저장 인물을 확인해 `이어서 플레이하기`와 `새 인생 시작하기 (기록 초기화)`를 구분한다. 새 인생은 확인 후 생성하며, 기존 기록은 사용자가 초기화하기 전까지 보존한다. 이전에 완료한 이벤트는 코드가 바뀌어도 소급 재실행되지 않는다.

## 2026-10-20 화면 진행 연출과 캐시 버전
- `?v=ui-motion-traits-20261020`로 3개 화면의 CSS·JS 버전, `boot.js` 네비게이션과 루트 리다이렉트 판본을 맞춘다.
- 기존 `run()`은 동기식으로 보존하여 공통 시뮬레이션/세이브 검증을 유지한다. 게임 화면의 결과 확인 버튼은 `director.step()`으로 논리 턴을 한 번씩 진행하고 중간 소식 뒤 짧게 쉬었다가 다음 선택으로 이어진다. 탭 재진입과 초기 실행은 기존 동기 복원 경로를 따른다.
