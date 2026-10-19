# 현재 구현 — 포스터·화면 구성

> 2026-10-19 기록. **CSS를 수정하기 전에 [CSS.md](CSS.md)를 먼저 읽고 함께 갱신한다.** 실제 코드가 바뀌면 `index.html`, `js/poster.js`, `css/style.css`를 확인한다. 스탯 SVG 토큰은 아직 [미확정 UI 초안](../notes/UI_TOKENS.md)이다.

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
- 현재 UI는 진행이 비활성화된 인물 생성·저장 및 선택 팝업 미리보기다. 이전 `renderStatus()` 등은 구 시연 이력이며 현행 구현은 `js/game.js`의 `render()`가 `GukminPoster.create/update`를 호출한다.
