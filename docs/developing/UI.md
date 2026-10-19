# 현재 구현 — 포스터·화면 구성

> 2026-10-19 기록. **CSS를 수정하기 전에 [CSS.md](CSS.md)를 먼저 읽고 함께 갱신한다.** 실제 코드가 바뀌면 `html/game.html`, `js/statusView.js`, `js/poster.js`, `css/style.css`를 확인한다. 스탯 SVG 토큰은 아직 [미확정 UI 초안](../notes/UI_TOKENS.md)이다.

## 공통 DOM 포스터 함수 (2026-10-19 반영)

- 신규 `js/poster.js`가 `window.GukminPoster.create(data)`로 **HTMLElement를 반환**한다. 기존 요소는 `window.GukminPoster.update(element,data)`로 재사용·갱신한다.
- 게임 `renderStatus()`는 직접 포스터의 각 DOM을 수정하지 않고 `#playerPosterMount`의 포스터 생성/갱신 함수만 사용한다.
- 필드: `color`(HEX 정당색), `partyName`, `partyIcon`, `phrase`(상황별 상태 문구), `stage`(현재 단계/직업), `name`, `number`(후보 기호, 없으면 숨김), `imageSrc`(이미지 경로), `ageGroup`, `template`.
- 배치: 상단 정당 로고·정당명/단계 → 중앙 이미지 → 하단 상태 문구 → 맨 아래 `기호 N번`과 큰 이름. 기호는 실제 후보가 된 단계에서만 표시.
- 인물 이미지는 독립 `<img>` 슬롯에 `object-fit: contain; object-position: center bottom` 적용. `imageSrc`가 없거나 불러올 수 없으면 기존 익명 인물 컨셉의 SVG 실루엣으로 대체. 향후 8인 캐릭터/성장 연령별 자산 경로를 데이터에서 연결할 수 있다.
- 색상은 `--poster-party`에서 적용하고 `solid`(기본 정당색 전면), `light`, `minimal` 구도 지원. 현재 게임은 `solid`를 사용한다.
- 렌더러에서 사용자 문자열은 `textContent`로 쓰고 색상은 HEX만 허용한다.


## 현재 화면 계약 (2026-10-19)

- **CSS 단위·PC/모바일 규칙의 기준 문서는 [CSS.md](CSS.md)**. CSS 변경에 앞서 반드시 읽고 관련 수정 시 함께 갱신한다.
- **PC (약 761px 이상)**: 왼쪽은 **포스터와 상태표가 같은 너비인 수직 flex**, 오른쪽은 능력치(상) + 인생 기록(하). PC의 기록 패널은 고정 바텀시트가 아니다.
- **모바일 (약 760px 이하)**: 기존 포스터/학력 가로 2열 + 능력치 + 고정 히스토리 바텀시트를 그대로 유지한다.
- 루트 폰트 크기는 모바일 16px / PC 15px, 자식 크기와 간격은 rem/em을 기준으로 한다. 포스터 텍스트도 포스터 상위 글꼴 크기를 기준으로 em 배율을 사용한다.
- 현재 UI는 진행이 비활성화된 인물 생성·저장 및 선택 팝업 미리보기다. 화면 DOM은 루트 `index.html`이 아닌 `html/game.html`에서 불러온다. 이전 `renderStatus()` 등은 구 시연 이력이며 현행 구현은 `js/game.js`의 `render()`가 `GukminPoster.create/update`를 호출한다.

## 화면 분리 및 현재 상태 토큰 (2026-10-19)

- `index.html`은 `#app`만 소유. `html/waiting.html`은 대기(출생·포스터/시작·재추첨), `html/game.html`은 인게임, `html/result.html`은 **엔딩 미구현 미리보기**.
- `js/boot.js`가 화면을 교체하고, `js/game.js`는 인게임에만 연결된다. 자세한 소유권: [RUNTIME.md](RUNTIME.md).
- 왼쪽 프로필 하단에는 **속성 스탯(집안·출생·역할)** + **학교 이력**만 표시. 학교는 사용자가 확정한 **배경색 알약 + 내부 흰색 stroke SVG + 학교명**. `enrolled` 상태만 기존 알약 구성 그대로 배경/테두리 강조, `graduated`는 차분한 톤.
- 오른쪽 `.gauges`는 단일 하드코딩 게이지 나열을 제거하고 `#gaugesList`에서 활성 상태 스탯을 동적으로 렌더한다. 기본 정신병·건강·재산, 성장 단계별 용돈/관계/성적/내신/수능/수입/지지도/인지도는 정의만 있고 아직 진행하지 않는다.
- **특성은 상태 스탯 프로그래스 바로 아래** `.trait-section > #traits`. 작고 둥근 알약에 **하얀 선 SVG 아이콘 + 이름**을 사용. 저축습관/인내심/꼼꼼함/리더십/언변 등의 정의는 있으나 실제 버프·디버프 계산/특성 획득 이벤트는 아직 없음.
- 아기 출생 데이터의 '집안'을 특성으로 넣지 않는다. 가족 배경은 속성, 특성 토큰은 실제 버프/디버프만 나타낸다.
