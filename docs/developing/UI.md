# 현재 구현 — 포스터·화면 구성

> 2026-10-19 기록. 실제 코드가 바뀌면 `index.html`, `js/poster.js`, `css/style.css`를 먼저 확인한다. 스탯 SVG 토큰은 아직 [미확정 UI 초안](../notes/UI_TOKENS.md)이다.

## 공통 DOM 포스터 함수 (2026-10-19 반영)

- 신규 `js/poster.js`가 `window.GukminPoster.create(data)`로 **HTMLElement를 반환**한다. 기존 요소는 `window.GukminPoster.update(element,data)`로 재사용·갱신한다.
- 게임 `renderStatus()`는 직접 포스터의 각 DOM을 수정하지 않고 `#playerPosterMount`의 포스터 생성/갱신 함수만 사용한다.
- 필드: `color`(HEX 정당색), `partyName`, `partyIcon`, `phrase`(상황별 상태 문구), `stage`(현재 단계/직업), `name`, `number`(후보 기호, 없으면 숨김), `imageSrc`(이미지 경로), `ageGroup`, `template`.
- 배치: 상단 정당 로고·정당명/단계 → 중앙 이미지 → 하단 상태 문구 → 맨 아래 `기호 N번`과 큰 이름. 기호는 실제 후보가 된 단계에서만 표시.
- 인물 이미지는 독립 `<img>` 슬롯에 `object-fit: contain; object-position: center bottom` 적용. `imageSrc`가 없거나 불러올 수 없으면 기존 익명 인물 컨셉의 SVG 실루엣으로 대체. 향후 8인 캐릭터/성장 연령별 자산 경로를 데이터에서 연결할 수 있다.
- 색상은 `--poster-party`에서 적용하고 `solid`(기본 정당색 전면), `light`, `minimal` 구도 지원. 현재 게임은 `solid`를 사용한다.
- 렌더러에서 사용자 문자열은 `textContent`로 쓰고 색상은 HEX만 허용한다.


## PC 2열 레이아웃 및 모바일 대응 (2026-10-19)

- PC 폭 751px 이상에서는 `.game`을 독립 게임 화면 **2열 그리드**로 구성한다. 왼쪽 `.desktop-left`: 포스터 + 나이/학력/특성 세로열. 오른쪽 `.desktop-right`: 가로로 배치한 능력치 + 커다란 인생 기록/현재 선택 공간.
- 데스크톱에서 `.sheet`는 더 이상 바텀시트가 아니라 오른쪽 콘텐츠의 **유연한 세로 공간**을 채운다. 기록만 내부 스크롤하며 화면 전체는 스크롤하지 않는다.
- 글씨를 데스크톱 기준 능력치 15px, 기록 제목 17px, 본문 15px 수준으로 확대. 나이, 교육 토큰 및 선택 버튼도 확대한다.
- 모바일에서는 두 래퍼를 `display:contents`로 풀어 기존 포스터/교육 2열 + 능력치 + 하단 고정 바텀시트의 DOM 배치를 유지한다.
- 751px은 현재 임시 breakpoint로, 실기기 확인을 통해 조정 가능하다.
