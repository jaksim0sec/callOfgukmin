## 2026-10-21 압박·정신병 2단계 (현행)

- 선택한 체계는 압박 누적 방식이다. 기존 저장 ID `stress`는 이제 **압박 0~25**, 새 `illness`는 **정신병 0~5**다. 압박은 0에서 시작하고 양수 변화 중 25를 넘는 정수 초과분만 정신병에 더한다. 예: 압박24/정신병0에서 압박+3 → 압박25/정신병2. 압박 감소만으로 정신병을 줄이지 않으며, 명시적인 illness 감소 효과를 사용한다.
- 정신병5가 생애/N수 종료 기준이다. 압박25만으로 종료하지 않는다. 기존 돈0·나이30 N수 경계와 결과 확인 대기는 유지한다. 압박/정신병 증가는 모두 위험이고 선택 미리보기·보상·기록은 같은 순수 정산 결과의 실제 차이를 쓴다.
- `mentalModel:2`를 저장한다. 구 저장은 압박 숫자·동결 선택·과거 기록을 보존하고 정신병0을 추가한다. 이미 정신병 한계로 끝난 저장은 정신병5와 기존 종료를 보존한다. 100→25 수치 변환은 먼저 한 번 수행한다.
- 첫 압박13 이상 안내와 정신병4 경고만 각각 한 번 대기하고, 결과/컷신 확인 뒤에 단독 팝업으로 표시한다. 확인 시 `pressureGuideSeen`/`pressureCriticalSeen`/`pressureAdviceCount`만 원자 저장하며 턴은 진행하지 않는다. 회복/재도달/새로고침에도 확인 플래그를 유지한다. 구 `pressureNoticeBand`는 저장 호환을 위해 정의만 남기고 새 경고 판정/구매에서 사용하지 않는다.
- 편의점은 1천~9만원의 8개 데이터 상품이다. 기본 상품은 압박을, 돌봄 상품은 압박과 정신병을 줄인다. 돌봄 상품은 정신병이 있을 때만, 압박 전용 상품은 압박이 있을 때만 구매할 수 있다. 4턴 공통 간격·실제 재산·생존·대기 상태를 구매 시 다시 검사하며, 구매/안내 확인 자체는 시간을 진행시키지 않는다. 이미 종료한 삶은 회복할 수 없다.

## 2026-10-21 수치 단위·소비 정산 (현행)

- 기본 progress 정의의 최대값은25다. 정산에서 범위를 적용한 뒤 정수로 반영한다. 통화와 명시적인 검증용 커스텀 스탯의 단위는 보존한다.
- `GukminPlayer.upgradeScale`은 `statScale`이 없는 이전 인물만 변환한다. `scaleRules`는 저장된 선택 스크립트의 수치·조건·학교 메타데이터를 변환하고, 기존 미동결 스크립트 복원은 복원한 차이값만 변환한다. 새 데이터는25점 단위로 작성한다.
- `Director.storeStatus()`/`buy(id)`는 일반 정산기와 저장 흐름을 쓴다. 금액 차감·정신병 회복·이용 턴을 하나의 `store:<turn>` 트랜잭션으로 저장한다.4턴 공통 간격과 재산/생존/대기 상태는 클릭 시 다시 확인한다. 구매는 `run/step`을 호출하지 않는다.

## 2026-10-21 사용자 피드백 반영 (현행)

- 건강은 등록된 기본 스탯에서 제거했다. 새 결과에서 미등록 건강을 참조하면 기존의 미등록 스탯 오류를 낸다. 구 저장에 한해서 `GukminPlayer.withoutHealth`가 값·플래그·이전 대기 결과를 정리하며 나머지 상태와 기록을 유지한다.
- 자동 고압 휴식 이벤트는 등록하지 않는다. 구 runtime의 해당 이벤트 엔트리만 제거해 로드 오류를 방지하고 과거 인생 기록은 유지한다.
- 생애 디렉터는 정신병 100을 입력/진행 경계에서 검사한다. 단일 `external:life-limit` 정산으로 `lifeEndReason`과 종료 기록을 저장하고 대기 선택을 취소한다. 결과 확인 대기는 보존하며 N수 기존 종료 처리는 별도로 유지한다.

# 게임 공통 시스템 — 구현 계약

## 2026-10-21 학생 생애 개정 — 현행 추가 계약

- 선택 시작 시 조건부 variant를 우선 검토하고 그중 매칭이 없을 때만 명시 폴백/기본 슬롯을 쓴다. 각 variant 제목은 필수다. `runtime.choices[token].script`(revision2)는 제목·본문·옵션·결과 전체를 저장한다. 구 대기 선택만 `story.legacyChoice` 차이표로 복구한다.
- 기존 공통 정산은 선택적 `result.assessment:{metric,effort}`, `highEntry:{track}`, `retryYear:true`, `admissionDecision:{cycle,type}`를 해석한다. `grades`와 `admissions`의 순수 계산이며 시간·저장·DOM을 소유하지 않는다. 옵션 `conditional[].before:true`는 결과 직전 상태로 조건을 확인한다.
- `resolve(token,optionId,{admissionField})` 입력은 대학 지원에서만 인문/자연 enum으로 허용된다. 미리보기는 저장하지 않고 확정 때 단일 정산한다.
- 발표 소식의 선택적 `presentation`은 `runtime.cinematic`으로 저장한다. 명시적 `acknowledge()` 전까지 타임라인이 멈추고 UI는 정산된 결과만 보여 준다. 선택 결과도 `presentationAcknowledged`로 중복 연출/정산을 구별한다. `run()`은 시뮬레이션 소비자의 명시적 계속 요청이며 UI는 확인 후에만 호출한다.
- N수 한계는 다음 입력 경계에서 `cancelPending`으로 미확정 선택을 종료한다. 비용과 종료 기록은 같은 트랜잭션이다. 예전 retry/more-prep 저장은 첫 계속 요청에서 한 번만 새 준비 연도로 이행한다.
- 현재/다음 연도 성적과 비용·전체 검증 근거는 [STUDENT_REVISION.md](STUDENT_REVISION.md).

## 현행 선택 정산·검토 흐름 (2026-10-21)

- **공통 엔진**: `GukminTimeline.resolve()`는 선택을 한 번만 정산·저장하고 `runtime.choices[token].outcome`에 선택 문구·기록 구간·정산 전후 상태를 남긴다. 생애 감독의 `pauseAfterChoice:true`는 `awaitingContinuation`/`reviewPending`을 유지한다.
- **일상 UI**: 기존 `#dailyChoiceDialog` 모눈종이에서 선택을 확정하면 종이를 닫지 않고 **같은 시트의 보상 상태**로 전환한다. 체크·획득 제목, 실제 서술과 `GukminStatus` 공통 알약 토큰을 보여 준다. `보상 받기` 또는 시트 닫힘 완료 이후에만 `startJourney()`를 재개한다. 새로고침 시 저장된 `outcome.before/after`로 보상 시트를 복원한다. 차이가 없으면 보상을 만들어내지 않는다.
- **한방 UI**: 시험·학교·수시/정시·최종 진로는 기존 `majorView.js` 및 성적표/결과 확인 정책을 유지한다. 일상처럼 즉시 확인하지 않는다.
- **기본 타임라인/검증 콘텐츠**: `pauseAfterChoice`는 기본 꺼짐이고 일반 `advance`/테스트와 UI 재개는 별개다. 확정 결과는 인생 기록에도 누적된다.

## 2026-10-20 선택 조건·전망과 기존 슬롯 확장

- `GukminStory.selection()`은 옵션의 선택적 문자열 `requirement`, `outlook`을 보존한다. `when`이 가용성을 결정하며 설명 문자열 자체는 권한·정산을 바꾸지 않는다.
- `requirement`는 잠긴 해결법의 필요 조건, 열린 해결법의 활용 경험을 설명한다. 기존 옵션에 없어도 렌더 가능하다.
- `outlook`이 있는 일상 선택만 조건부 보상/실패를 확정 효과 미리보기에서 빼고 기본 비용과 조건 설명을 보여 준다. 실제 선택은 기존 전체 `result`로 한 번 정산하고 검토 화면에는 실제 전후 변화가 남는다. 일반 선택과 시험은 기존 정확한 투영을 유지한다.
- `GukminStory.paths(pack, choiceId, scenarios)`는 기존 사건/선택을 찾아 시나리오를 추가한다. 기존 시나리오와 기본 옵션은 지우지 않으며 없는 슬롯은 오류다. 신규 시나리오 선정은 기존 사건 개시 시점·우선순위 계약을 따른다.
- 활동 경험·후속 부탁·습관 진행은 등록 속성으로 저장하며, 지연 결과는 후속 사건의 조건부 효과로 처리한다. 새로운 정산 엔진·확률 재추첨·저장 버전은 도입하지 않는다.

2026-10-19 공통 엔진을 바탕으로 `LIFE.md`의 0~19세 학생기와 `js/life/admissions.js`의 내신·수능·대입·2회차 진로 분기가 연결됐다. 대학 생활·성인·정치·엔딩은 미구현이다. 아래 초창기 문단과 UI가 충돌하면 위 **현행 흐름**을 우선한다.

## 확정한 이벤트 3종류·선택 2종류

| 이벤트 `layer` | 연결 가능한 선택 `layer` | 처리 |
|---|---|---|
| `소식 이벤트` | 없음 | 선택 없이 발생 효과·기록·완료 처리 |
| `일상 이벤트` | `일상 선택` | N개 선택지를 종이 시트에서 결정하고 같은 시트에서 실제 보상 확인 |
| `한방 이벤트` | `한방 선택` | 시험·고교/대학 지원·진로 전용 표시기의 응답/검토 대기 |

종류가 맞지 않으면 등록 오류다. 중요도·확률·우선순위·나이 배율을 종류에서 추론하지 않는다. 같은 턴 사건은 데이터 등록 순서로 처리한다. 일상 선택을 다음 한방 선택까지 미루지 않는다. 선택의 `blocksTime`은 개별 데이터로 지정하며 생략하면 대기 중 턴 진행을 막는다.

## 책임과 공개 API

- `playerState.js`: 속성·상태 스탯·특성 정의 등록/조회, 기존 인물 생성·저장 호환. `registerMetric`, `registerTrait`, `registerAttribute`, `hasTrait`, `activeMetrics`, `schoolsOf`.
- `effects.js`: DOM/저장소와 무관한 `GukminEffects.apply(persona,result,context)` 및 `matches(persona,condition,turn)`. 원본을 변경하지 않고 정산한 인물을 반환한다.
- `timeline.js`: `GukminTimeline.create({persona,contentId,metrics,traits,attributes,events,choices,persist,onChange})`. 반환값은 `snapshot()`, `advance(turns)`, `resolve(token,optionId)`, `resume()`, `apply(transactionId,result)`.
- `game.js`: 확정된 스냅샷을 기존 포스터·상태·학력·특성·기록 렌더러와 선택 UI에 반영. `GukminGame.session`으로 연결된 세션의 `snapshot/advance/resolve/apply/dispose`를 사용할 수 있다. 인게임 외 화면에서는 세션이 없다.
- `systemDemo.js`: 명시적으로 시작하는 테스트 콘텐츠. 실제 생애·학교·밸런스가 아니다.

`boot.js` 전에 데이터 스크립트에서 `window.GukminContent = {...}`를 정의하면 인게임이 그 데이터를 연결한다. 해당 데이터 스크립트만 HTML 로드 목록에 추가하면 되며 사건별 실행기·렌더러를 작성하지 않는다. 기존 정의 ID는 콘텐츠에서 표시 정보와 효과를 보완할 수 있다. 한 페이지에서 같은 ID의 서로 다른 명시적 정의는 오류다. 기본 속성의 구조는 재정의할 수 없다.

## 데이터로 사건 추가하기

아래는 콘텐츠 작성 형태의 예시이며 실제로 등록된 생애 사건이 아니다. 나이와 턴의 관계는 아직 확정하지 않았다.

```js
window.GukminContent = {
  contentId: 'infant-content-v1',
  events: [{
    id: 'tidy-room', layer: '일상 이벤트', title: '방 정리',
    at: 0, when: {age: {gte: 3}}, choice: 'tidy-room',
    history: {title: '방을 정리할 시간', detail: '어떻게 할까?'}
  }],
  choices: [{
    id: 'tidy-room', layer: '일상 선택', title: '방을 정리할까?',
    body: '지금 할 일을 골라 보자.', blocksTime: true,
    options: [{
      id: 'tidy', label: '꼼꼼히 정리한다',
      result: {
        effects: {stats: {health: -5}, traits: {add: ['꼼꼼함']}},
        history: {title: '정리 완료', detail: '꼼꼼함 특성을 얻었다.'}
      }
    }, {
      id: 'rest', label: '잠깐 쉰다',
      result: {history: {title: '휴식', detail: '다음 기회를 기다린다.'}}
    }]
  }]
};
```

`at`은 발생 가능한 최초 **정수 턴**(기본 0), `when`은 추가 조건이다. 조건이 아직 거짓이면 발생 대기로 남아 재검사한다. `every`를 생략하면 1회성, 지정하면 해당 턴 간격으로 다시 발생 가능하다. 이미 진행 중인 같은 사건을 중복 생성하지 않는다. 미응답인 반복 사건은 완료 후 다음 예정 발생분을 처리하며 같은 사건의 응답을 여러 개 동시에 만들지 않는다.

이벤트 필드:

- `id`, `layer`, `title`, `at`, `every`, `when`
- `result`: 발생 시 공통 결과. `history`를 별도 지정하면 발생 기록으로 사용한다.
- `choice`: 선택 정의 ID. 소식에는 금지, 일상·한방에는 필수.
- `completeWhen`: 선택 정산 이후 또는 선택 없는 사건의 완료 조건. 생략하면 바로 완료.
- `completion`: 완료 시 결과. 발생 결과 및 선택 결과와 별개의 중복 방지 키로 한 번만 적용.

상태는 `unseen → pending → running → completed`이다. 반복 사건은 다음 시점에 다시 pending으로 간다. 선택은 발생 전 런타임 항목이 없고, 발생하면 `waiting → confirmed → settled → closed`를 따른다. 순간적인 확정·정산은 한 트랜잭션이며 저장된 관찰 상태는 waiting 또는 closed다. `snapshot().choice`는 현재 응답할 첫 선택이고, 나머지도 `runtime.choices`에 보존된다.

## 결과 정산

```js
{
  tags: ['income'],
  effects: {
    activate: {projectScore: 0},
    stats: {health: -5, money: 10000, projectScore: 2},
    attributes: {job: '학생', roles: ['반장']},
    schools: [{id: 'middle-1', kind: 'middle', name: '예시중', status: 'enrolled'}],
    traits: {add: ['꼼꼼함'], remove: []},
    deactivate: ['study']
  },
  history: {title: '결과', detail: '변화 설명', importance: 'normal'},
  conditional: [{when: {traits: ['꼼꼼함']}, result: {effects: {stats: {money: 1}}}}]
}
```

- 순서: 스탯 활성화 → **정산 전 보유 특성**의 수정 → 스탯 증감 → 속성·학교 → 특성 제거/획득 → 스탯 종료·최종값 보존 → 기록 → 조건부 결과. 방금 얻은 특성이 같은 기본 결과를 소급 증폭하지 않는다.
- `stats`는 증감량. 숫자·범위·스탯/특성/속성 ID 오류는 예외이며 조용히 무시하지 않는다. 정의의 `min/max`가 있을 때만 수치를 제한한다. 범위·실제 초기값·전환 규칙은 콘텐츠 소유다.
- `activate`는 초기값 및 명시적 표시 활성화. `deactivate`는 현재값을 `metricHistory`에 턴·나이·단계와 보존하고 화면에서 감춘다. 생애 단계 기본 표시 목록은 기존 구현을 유지하며 명시적인 활성/종료가 우선한다.
- 학교는 고유 `id`로 입학→졸업/중퇴 상태를 갱신한다. 완료된 학교의 이름·종류와 졸업 이력을 덮어쓰지 않는다. 예전 `school` 필드와 새 `schoolHistory`를 함께 보존한다.
- 기본 속성은 기존 최상위 필드를 사용한다. 추가 속성은 정의와 `persona.attributes`를 사용하며 문자열·유한 숫자·불리언·null 값을 지원하고 렌더러가 자동 토큰 표시한다. 변경 이력은 `attributeHistory`에 누적한다.
- `history`는 하나 또는 배열. `importance: 'minor'`는 작은 기록, `display: 'hidden'`은 저장만 하고 표시하지 않는다. 모든 수치 변동을 자동으로 긴 기록으로 만들지 않으며 콘텐츠가 중요한 변화를 묶어 기록한다. 기록에 `turn/age/phase/source`가 자동 추가된다.
- 외부 정산은 `apply('고유 작업 ID', result)`를 사용한다. 같은 ID의 재요청, 닫힌 선택의 중복 클릭·늦은 콜백은 다시 적용하지 않는다. 이벤트 발생/완료·선택·주기 효과도 각기 고유 ID를 갖는다.
- 정산과 턴 진행은 복사 상태에서 수행한다. 오류 또는 `persist`의 실패 시 인물·런타임 모두 롤백한다. 다음 선택의 조건까지 포함한 스냅샷을 저장 전에 검증한다. 저장 성공 뒤에만 `onChange`를 호출해 화면을 갱신한다. 다중 탭 간 동시 편집 충돌 해결은 이번 범위 밖이다.

## 동적 정의·특성

콘텐츠의 `metrics/traits/attributes`는 `{ID: 정의}` 맵이다. 위 예시에서 projectScore를 사용한다면 `metrics: {projectScore: {label:'과제',type:'progress',min:0,max:10}}`을 함께 등록해야 한다.

상태 표시 유형은 `progress`, `currency`, 숫자 텍스트를 지원한다. `progress`는 정의의 범위로 표시한다(미지정 시 기존 0~100 표시). 추가 시각화는 `GukminStatus.registerMetricRenderer(type, (element,metric)=>{})`로 등록한다. 언변·리더십은 계속 특성이며 상태 스탯으로 추가하지 않는다.

특성 정의 예시(수치는 검증 예시):

```js
traits: {
  '저축습관': {
    modifiers: [{tags:['income'], stats:{money:{multiply:1.1, add:0}}}],
    periodic: {every:2, result:{effects:{stats:{money:100}}}}
  }
}
```

`modifiers`는 태그와 선택적인 `when`으로 적용 상황을 제한한다. 보유 특성 및 정의 배열 순서로 적용한다. 주기 효과는 획득한 턴으로부터 매 `every`턴 실행되며 제거하면 멈춘다. 획득 턴 자체에는 주기 효과를 실행하지 않는다. 무제한 재귀 발동·특성 등급/중첩·복잡한 우선순위는 구현하지 않았다.

조건은 `all/any/not`, `traits/withoutTraits`, `stats: {ID:{gte,lte,eq}}`, `attributes:{ID:값}`, `age/turn:{gte,lte,eq}`, `phase`를 지원한다. 선택지별 `when`도 같은 판정기를 사용하고, 응답 시 다시 확인한다.

## 시간·대기 및 한방 UI 연결

`advance(n)`은 0~10000 정수 턴을 요청받으며 중간 경계를 **한 턴씩** 처리한다. 대기 선택이 시간을 막으면 그 자리에서 멈추고 나머지 요청 턴을 자동 이월하지 않는다. `advance(0)`은 시간을 보내지 않고 현재 조건을 다시 검사한다. 벽시계·실제 연령 배율·자동 진행 속도는 확정하지 않았으므로 타이머를 시작하지 않는다. 후속 시간 드라이버가 `GukminGame.session.advance(n)`으로 진행시킬 수 있다.

인생 기록 타이틀 바로 아래의 진행도는 다음 시간 차단 선택의 실제 예정 턴과 연결된다. `blocksTime:false` 또는 `progress:false`인 선택은 해당 진행도 목표에서 제외되며, 그 사건 자체의 예정 시점에는 독립적으로 발생한다. 예정 선택이 없으면 임의의 가짜 카운트다운을 만들지 않는다.

한방 UI는 현재 `majorView.js`가 다음 인터페이스에 등록되어 있다. 새 UI도 이를 재사용한다:

```js
GukminGame.registerMajorPresenter(({choice, resolve, root}) => {
  // 전용 UI에서 choice.options 표시. resolve(optionId)로 공통 정산.
  // 필요하면 반환 함수에서 해당 UI의 이벤트·DOM 정리.
  return () => {};
});
```

등록 전에는 한방 선택 응답 대기만 표시한다. 표시기를 교체·해제하면 이전 정리 함수를 호출한다. 세션을 dispose하거나 표시기가 교체된 뒤 도착하는 옛 콜백은 무효이고, 종료된 세션의 공개 진행/정산 API는 오류를 낸다. 새로고침 후에도 미응답 선택·토큰·인물 상태가 복구되며 `resolve` 중복 호출은 무효다. 기존 학교/정당 팝업은 여전히 **미리보기**이고 실제 입학·입당을 실행하지 않는다.

## 실행·검증

```sh
node tests/smoke.mjs
node --test tests/systems.mjs
python3 -m http.server 8000
# 선택 사항: 이 개발 머신에는 Playwright와 /usr/bin/chromium이 준비되어 있다.
node tests/browser.mjs
```

브라우저 검증은 Python 서버를 임시 포트로 시작해 실제 `/callOfgukmin/` 하위 경로에서 실행한 후 종료한다. Playwright는 **검증 도구**이며 배포 앱의 의존성이 아니다. 별도 머신에서 실행하려면 Playwright와 Chromium을 개발 도구로 준비하거나 `CHROMIUM_PATH`를 지정한다. 결과 이미지 기본 경로는 `/tmp/callOfgukmin-browser`이며 `BROWSER_ARTIFACTS`로 바꿀 수 있다. `BROWSER_BASE_URL`은 검증 대상 서버를 지정한다. 운영 사이트 검증 시 로컬 소스의 게시 여부는 별도로 확인한다.

로컬 서버의 `html/game.html?systems=1`에서 검증 도구를 명시적으로 연다. 공통 시스템 검증 → 다음 턴 순서로:

1. 1턴: 선택 없는 검증 사건 기록(A).
2. 2턴: 진행도 완료·응답 대기. 일상 선택으로 건강/재산, 검증 집중, 특성, 기록 동시 갱신(B/C/E).
3. 3턴: 재학 강조 학교 토큰, 검증 집중 +2(D/E).
4. 4턴: 특성 반복 효과 재산 +100, 졸업 이력 보존, 검증 집중 종료(C/D/E).
5. 5턴: 검증 수입에 특성의 10% 수정 효과 적용.

검증 데이터도 현재 UI 키 `callOfgukmin__ui__v1`에 저장된다. 처음에는 진행하지 않으며 검증 시작을 명시적으로 눌러야 한다. 과거 플레이 키 `callOfgukmin__playable__v1`은 읽거나 변경하지 않는다. 새 인물 생성은 현재 UI 세이브만 초기화한다.

Chromium에서는 PC 1365×900 / 모바일 390×844·360×640에서 A–F, 새로고침 중복 방지, 화면 이동, 새 인물, 미리보기의 비변경, 기존 세이브 보존과 레이아웃을 확인한다. 한방 UI 연결 테스트는 팝업 없이 대기/복구/콜백 정산만 검증한다. 실기기·다른 브라우저 호환성 전체를 검증한 것은 아니다.

2026-10-19 당시 로컬 검증 기록: Node.js v24.19.0에서 시스템 테스트 16개 및 스모크 통과. 실제 Chromium에서 A–F(PC/모바일 3개 해상도), 한방 대기·복구·중복 콜백 및 표시기 교체·종료 테스트 통과. CI는 Node.js 22에서 스모크와 시스템 테스트를 실행하도록 구성했다. 원격 Pages 검증은 네트워크 정책의 도메인 접근이 허용되어야 한다.

## 기본 인생 관제탑 (2026-10-19)

일반 게임 시작은 `GukminDirector`가 등록된 오퍼레이터들의 결정적 사건 정의를 모아 `GukminTimeline`으로 전달한다. 오퍼레이터의 `when`과 사건별 `when`은 동시에 만족해야 발생한다. 진행 가능한 1회성 사건만 자동으로 처리하고 선택/콘텐츠 소진 시 멈춘다. 실제 나이/시계 속도는 정하지 않는다. 오퍼레이터의 목록은 프로그램 시작 시 고정 정의로 구성하므로 이벤트·선택 ID가 세션 도중 유실되지 않는다. 자세한 데이터 구조는 [LIFE.md](LIFE.md) 참조.

## 생애 자동진행과 한방 UI 확장

기존 `timeline.js`의 수동 `advance(n)` 계약은 유지한다. 게임 기본 관제탑은 `js/life/director.js`가 제시된 사건의 시점까지만 `advance()`를 호출한다. 선택이 발생하면 즉시 중지한다. 고교 졸업 및 대입 진로 결정까지 등록된 사건이 끝나면 추가 턴을 만들지 않는다. 생애 시연의 나이는 각 마일스톤 사건 효과로 **명시적** 변경하고, 정수 턴을 현실 1시간·1일·1년으로 해석하지 않는다.

`GukminStory.exam`은 5단계 준비량과 `presentation.type='exam'`을 가진 데이터 정의를 생성한다. 지역 고교 지원서는 `presentation.type='school'` 및 선택지마다 `school` 메타데이터를 갖는다. `majorView.js`는 데이터만 읽어 UI를 만들고, 유효한 응답을 그대로 `resolve(token,optionId)`에 전달한다. `presentation`이 없는 기존 한방 선택은 과거처럼 외부 표시기를 기다릴 수 있다.

학교 정산에서 `schools:[{kind:'high',status:'graduated'}]`는 **현재 한 개의 재학 고등학교**가 존재할 경우에만 그 학교 ID/이름을 보존하며 졸업 처리한다. 재학 학교가 없거나 여러 개인 경우는 오류로 중단한다. 이 규칙은 동적 학교 선택 직후 향후 고교 졸업을 처리하기 위한 예외적 축약형이다.


## 학년 연간시험·조건부 고교 사건 (2026-10-19)

- 새로운 한방 선택은 고교 학년당 모의고사 종합/내신 종합 각 1회. presentation.annual은 UI 설명용이다.
- 고교 진학 결과에는 schoolTrack과 schoolProgram 정의/값이 포함되어 현재 학교 유형과 확인된 개별 교육과정 조건으로 일상 사건이 실행된다.
- 신규 고교 사건은 발생 턴에만 조건이 맞게 제한하여 이전 세이브에서 오래된 사건이 뒤늦게 재생되지 않게 한다. 기존 대기 중 시험 선택의 ID와 정의는 보존했다.
- 스탯 수치는 원래 게임 정산/저장 계약 그대로이며, 예상 등급은 GukminGrades.report의 읽기 전용 결과다.


## 리뷰 대기·턴 용돈 확장 (2026-10-19)

- `GukminTimeline.create({pauseAfterChoice,onTurn})` 두 옵션은 기본적으로 꺼져 있다. pauseAfterChoice면 `resolve`가 선택을 정산하고 `runtime.awaitingContinuation` 상태로 멈춘다. `resume()`으로 단일 저장 트랜잭션 재개 후 `advance` 가능. 재진입·새로고침 중 대기 상태 유지. 진행 중 강제 `advance`는 거부.
- `onTurn(persona,turn)`은 별도 정산 효과를 만들 수 있으며 `turn:<N>` ID로 해당 턴에 한 번 적용한다. 생애 관제탑은 초등 이후 용돈만 여기서 누적한다. 이전 공통 검증 모드는 영향받지 않는다.
- 선택 결과를 확인하기 전에는 다음 이벤트를 자동 실행하지 않고, UI가 현재 `reviewPending` 플래그를 표시한다. 0~19세 사건·선택 ID 및 저장 키를 변경하지 않는다.


## 2026-10-20 결정적 시나리오 선택·결과 리뷰 추가 계약

선택 정의에 선택적인 `variants: [{id,priority,when,title,body,options}]`를 사용할 수 있다. `when`은 기존 `GukminEffects.matches` 표현식만 받는다. `priority` 내림차순 첫 일치 후보를 사건이 실행되는 `pump()` 시점에 확정하며 기본 후보는 `when` 생략/우선순위 0으로 둔다. `runtime.choices[token].scenarioId`에 저장하고 `choiceId`는 기존 선택 정의 ID로 보존한다. 사건이 열렸을 때 재시작하면 저장된 후보가 그대로 표시·정산된다. 이전 선택에 `scenarioId`가 없다면 해당 기존 선택의 기본 `options` 사용.

`pauseAfterChoice` 모드에서 선택을 해소할 때 `runtime.reviewBefore`에 선택 직전 수치·특성·학교·역할 값을 선택적으로 저장하고 `awaitingContinuation`와 함께 복구한다. 새 리뷰 진행 상태를 만들지 않고 `resume()`에서 `reviewBefore`를 지운다. 과거 리뷰 세이브의 `reviewBefore` 누락은 허용하며 없는 효과를 추정하지 않는다. 데이터와 테스트 상세는 [STORY.md](STORY.md) 참조.

`blocksTime:true`(또는 생략)인 일상·한방 선택은 하나가 대기 중인 동안 같은 턴의 뒤 이벤트·선택을 열지 않는다. 첫 선택의 리뷰가 끝난 뒤 다음 선택과 시나리오를 생성해 이전 결과를 분기 조건에 반영한다. `blocksTime:false` 사건은 뒤의 사건 진행을 막지 않는다. `awaitingContinuation` 중에는 이전 버전에서 이미 열려 있던 다른 선택도 `snapshot().choice`로 노출하지 않는다.

## 선택 결과 이력 확장 (2026-10-20)

- `resolve(token,optionId)`는 기존 `runtime.choices[token]` 항목에 선택적 `outcome`을 기록한다. `label`, `historyFrom`, `historyTo`, `before`, `after`는 선택이 확정된 시점의 실제 관찰값이다.
- 결과 전/후 관찰값은 스탯·특성·학교·역할에 한정되며, 인생 기록에서 나중에 다시 열람해도 이후 턴의 변화를 잘못 표시하지 않도록 한다. `reviewBefore`와 `awaitingContinuation` 의미는 변경하지 않는다.
- `risk`는 `GukminStory.selection`이 복사하는 선택적 콘텐츠 표시 필드이며 확률·조건 판정에는 관여하지 않는다. UI는 실제 정산 효과와 별도로 이를 미리 알 수 있는 부담으로 제시한다.

## 2026-10-20 특성 프리뷰와 선택 진행
- `dailyChoice.showChoice`는 선택 `result`를 `GukminEffects.apply`로 **복사본에만** 계산하여 정산 이후의 스탯 차이 및 신규 특성을 표시한다. 조건부 결과를 무시한 가짜 미리보기나 영향 없는 뱃지 생성을 피한다. 관심- 계열은 가시적 준비 특성으로 표시하지만 정식 특성과 구별한다.
- `director.step()`은 화면 애니메이션에만 쓰는 논리 턴 1회 진행. `run()`은 기존과 같이 동기적으로 미래 선택까지 진행한다. 저장된 턴은 실제로 진행했을 때만 바뀌며 실시간 대기 시간은 게임 사건 조건에 사용하지 않는다.
