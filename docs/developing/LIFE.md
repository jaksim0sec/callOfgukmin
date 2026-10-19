# 생애 단계 · 출생 초기 데이터 — 1차 계약

> 2026-10-19. 실제 성장 스토리·전환 시점·경제 밸런스는 아직 구현하거나 확정하지 않았다. 기존 UI 생성값과 생애 ID를 정리한 첫 단계다.

## 단계 데이터

`js/playerState.js`의 `GukminPlayer.lifeStages`가 각 단계의 `id`, `label`, `next`, `metrics`를 제공한다. `phaseDefinition(id)`, `nextPhases(id)`로 조회할 수 있다.

| ID | 표시 | 대표 후속 경로 |
|---|---|---|
| `infant` | 출생·유년기 | `elementary` |
| `elementary` | 초등학생 | `middle` |
| `middle` | 중학생 | `high` |
| `high` | 고등학생 | `university` 또는 `adult` |
| `university` | 대학생 | `adult` |
| `adult` | 사회생활 | `political` |
| `political` | 정치활동 | `adult` |

`next`는 **대표적인 콘텐츠 이동 경로**일 뿐 강제 전환·자동 진행·조건 판정 로직이 아니다. 대학과 성인 여부, 직업과 정치 활동은 실제로 서로 겹칠 수 있다. 후속 콘텐츠 설계에서 이 모델을 분리하거나 넓히는 판단이 필요하다. 현재는 기존 `phase` ID를 유지하고, `GukminEffects.apply`의 `effects.attributes.phase`로 필요한 순간 명시적 변경을 허용한다. 나이 자체와 턴·실제 시계 간 대응은 정하지 않았다. 구 세이브에서 `phase`가 없는 경우의 `phaseOf` 나이 기준 추론은 레거시 호환용으로 보존한다.

## 출생 데이터와 값

`GukminPlayer.generate()`는 출생 정보를 다음과 같이 만든다.

- 이름: 기존 `NAMES` 샘플 중 하나를 뽑는다.
- 가정: 기존 `HOMES` 샘플 중 하나를 뽑고 `family`, `birthplace`, `description`을 서로 맞는 값으로 저장한다. 이 샘플의 동일확률 추첨은 임시 UI 생성 방식이며 실제 한국 인구·계층 분포를 주장하지 않는다.
- 생애: `age:0`, `phase:'infant'`, `job:'아기'`. 기존 학교/경력/역할 이력은 비어 있는 상태로 시작한다.
- 기본 특성: `traits:[]`. 출생 집안은 **속성**이므로 특성으로 중복 지급하지 않는다.
- 기본 상태값(`birthDefaults.stats`): `stress:0`, `health:100`, `money:0`. 나머지 용돈·관계·성적·내신·수능·수입·지지도·인지도는 `null`로 보존한다. 전 생애 노출 스탯만 초기 화면에서 표시한다.

숫자 0/100은 **현행 화면 호환용 시드값**이다. 의료적 해석, 집안 재력별 초기 재산, 특성 발생 확률, 성인 전환 시 수치 이관이나 시작 범위는 아직 확정하지 않았다. 지지도·인지도는 `university`/성인 단계 표시 데이터만 있으며 정치 입문 조건을 구현한 것이 아니다.

## 인트로 흐름

대기에서 인물은 이미 `ensure()`로 생성·보존된다. 시작 클릭 시 `html/waiting.html`의 정적 오버레이가 **해당 인물**의 이름·출생 배경을 약 3초 동안 연출한 뒤 `html/game.html`로 이동한다. 건너뛰기 버튼, Escape, `prefers-reduced-motion` 설정에서는 즉시 이동한다. 저장/재추첨/턴 진행은 하지 않으며 인게임도 새 스토리나 타이머를 자동 시작하지 않는다.

## 다음 콘텐츠 작업에서 결정할 것

유년기 에피소드·학교 입학 및 졸업 조건, 대학생과 성인의 중복 표현, 용돈/수입 전환, 관계의 특성 환산, 정치 진입 및 직업별 활성 지표, 출생 배경 분포와 밸런스, 연령/시간 드라이버. 확정 전까지 별도 엔진이나 자동 진행을 추가하지 않는다. 공통 정산·선택 구현은 [SYSTEMS.md](SYSTEMS.md)와 [PLAYER_STATE.md](../notes/PLAYER_STATE.md)를 참조한다.
