# 선거 모듈 계약

현재 적용 콘텐츠는 초등학교 반장 선거다. 아래 공통 모듈은 지역·정당·후보 종류에 의존하지 않는다. 성인 정치 콘텐츠는 아직 구현하지 않았다.

## 책임과 입력

| 파일 | 소유 책임 |
|---|---|
| `js/election/engine.js` | 파라미터 검증, 시드 선호, 집단/복수 조사 비용 합산, 지지 예상, 투표율·후보 간 표 배분·동률 판정. 인물/저장/DOM 접근 없음 |
| `js/election/view.js` | 지지율 그래픽, 저장 표의 개표 재생, 시즌 진입 버튼, 후보 슬라이드·포스터·민심 탭. 전달받은 읽기 전용 모델 표시 |
| `js/election/choices.js` | 조사 대상 선택과 공약 카드 DOM, 접기/재열기. 확정 시 전달받은 resolve 호출 |
| `js/life/election.js` | 반장 선거 카탈로그·이야기 단계·등장 조건·인물 관계의 수치 변환, 비용/특성/기록 정산 데이터 |
| `js/timeline.js`, `js/effects.js` | 선택 동결·중복 방지·원자적 저장·공통 효과 적용. 선거 UI는 직접 정산하지 않음 |
| `js/game.js`, `js/majorView.js` | 표시기 연결/폐기, 읽는 동안 자동 진행 정지, 공통 dialog·개표 컷신 호스트 |

공통 엔진 사용 예:

```js
const election = GukminElectionEngine.create({
  id: 'district-election', seed: 'saved-seed|district-election', playerId: 'me',
  groups: [{id:'residents', name:'주민', size:100, known:true, undecided:30}],
  pledges: [{id:'bus', name:'교통 개선', scores:{residents:2}, difficulty:0, cost:0}],
  candidates: [
    {id:'me', name:'후보 A', pledges:['bus'], support:{residents:1}},
    {id:'rival', name:'후보 B', pledges:[], support:{residents:2}}
  ],
  rules: {maxPledges:3}
});
election.forecast(); // 읽기 전용 예상: 후보별 지지 + 미결정 합계 100%
election.surveyMany(['residents'], []); // 방문할 ID 배열/이미 방문한 ID 배열 → visits, cost 합계, size 합계
election.survey('residents'); // 해당 집단의 시드 고정 선호; 방문 비용은 스토리 정산
election.count(); // 각 집단 실제 투표수와 후보별 득표 합계 일치
```

`support`는 스토리가 관계/특성/신뢰/공격 등의 상관관계를 계산해 제공하는 집단별 인물 보너스다. 공통 엔진에는 특정 스탯·인물·집단 수·반 인원 30명을 하드코딩하지 않는다. 같은 시드와 입력은 같은 개표를 내며, 조사가 판정을 재추첨하지 않는다. forecast의 `known`은 저장된 방문만 반영한다. 반장 어댑터는 미방문 의견을 null로 숨긴다.

표시 모델은 `GukminElection.model(person)`이 제공한다. `playerId/title/active/groups/pledges/available/chosen/maxPledges/revision/riskLabel/candidates` 및 읽기 전용 `forecast(ids)/opinion(group,id)/wishes(group)/known(group)`을 전달한다. 후보는 이름·소개·공약 객체 목록·기존 portrait 입력·선택적 관계 지표를 갖는다. 표시기는 인물 저장 객체를 받지 않는다. 인원수와 전체 대비 비중 막대를 사용하며 인원별 점 DOM을 만들지 않는다.

## 반장 선거 revision 3

출마 → 전용 첫 조사(또는 건너뛰기) → 임시 공약 → 일상 대응 → 필요 시 전용 추가 조사 → 최종 공약 → 개표 → 당선 시 이행 청구서다. 조사 화면은 기존 **한방 이벤트/한방 선택** 계약을 쓰며 계층을 추가하지 않는다. 일상 대응 종이는 실행 가능성에 대한 짧은 질문과 선택만 담는다. 후보·라이벌 공약·예상 지지율은 별도 후보 패널에서 비교한다.

첫 조사와 추가 조사는 같은 표시기를 사용한다. 집단과 규모를 보고 플레이어가 선택하고, 추가 조사에서 이미 방문한 집단은 금지한다. 방문을 결정하기만 해서는 비용/정보를 적용하지 않는다. 실제 방문 확정 시 규모별 압박1~3(현 모임1/1/2/1, 정신병 상태에서는 공통 위험 변환), 첫 조용한 모임은 학업역량−1을 적용한다. 미방문 정보는 계속 숨긴다.

“어떻게든 해 볼게”는 압박4와 뻔뻔함을 얻는다. 선생님 신뢰가 자동으로 오르거나 권한 밖 공약이 이행되는 효과는 없다. 뻔뻔함은 public-speech 태그의 부담을1 줄이며, 이후 이행 타협에서 실제 적용된다. 비용이 높은 약속은 당선 이후에도 설명·타협·파기의 청구서가 남는다.

진행 중 revision1/2의 동결 선택과 기존 조사 경로는 보존한다. 과거 개표는 저장된 표를 읽으며 재계산하지 않는다. 저장 키/콘텐츠 ID는 그대로다. 후보 패널은 선거 활동 중에만 나타나고 닫기로 턴/선택이 진행되지 않는다.

## 검증

`node tests/smoke.mjs`, `env -u NODE_TEST_CONTEXT node tests/systems.mjs`, `CHROMIUM_PATH=/usr/bin/chromium node tests/election.mjs`. 시스템은 임의 후보/집단 규모·득표 보존·두 번의 조사/복원·특성 비용·구버전 경로를, 브라우저는320×568/390×844/1365×900에서 조사/모바일 공약 고정 영역/후보 슬라이드·탭/읽기 후 상태 보존/개표·이행을 확인한다. 격리 브라우저 컨텍스트만 사용한다.

## 동률과 조사 비용

엔진의 runoff는 1차 최고 득표 동점자만 대상으로 같은 투표 인원에게 다시 표를 받는다. voter 키를 별도로 avalanche 해시하여 인접 번호의 선택이 한쪽에 몰리지 않게 한다. 후보별 1차 표와 결선 표를 구분하며 재동률만 공개 추첨한다. winner/won은 최종 판정이다. 결과를 저장한 뒤에는 정책·화면 변경으로 과거 당선자를 바꾸지 않는다. 학교 이야기의 revision1/2는 기존 판정을 보존한다.

조사 비용은 surveyCost(id)와 survey(id).cost가 제공한다. 기본 rules는 surveyBaseCost=1, surveyGroupStep=8, surveyMaxCost=3이며 정수로 제한한다. skip에는 비용이 없다. 집단 장소/관심사와 공약의 실행 가능성은 스토리 카탈로그에서 공급한다.

## 복수 방문·토큰·개표 재생 (2026-10-22 현행)

첫 조사와 추가 조사 모두 여러 집단을 선택할 수 있다. 엔진 surveyMany(ids, visited)는 중복/미등록/기방문을 거부하고 비용/인원을 합산한다. 스토리는 조용한 집단의 최초 학업 비용과 선거 단계를 정산하고, 타임라인은 groups 입력을 단일 원자적 선택으로 저장한다. electionSurveyed/electionCoreGroups는 숫자 비트마스크이며 기존 단일 방문 속성도 호환한다. 모든 집단을 방문한 뒤에는 추가 조사 선택을 닫는다.

model.riskMetric은 현재 정신 단계의 스탯 ID다. 전용 UI는 공통 토큰 팩토리로 방문 비용을 표시하며 UI에서 임의로 비용을 적용하지 않는다. 후보 화면은 기호·현재 조사 지지 막대·실행 가능성 토큰으로 정보를 구분한다.

GukminElectionView.countScene(report)는 저장된 1차/결선 득표로만 투표지 표시 순서를 만들고 update(elapsed)/finish()를 제공한다. 득표 계산/새 추첨/저장은 하지 않는다. 호스트는 타이머·건너뛰기·결과 기록을 소유한다. 결선은 최종 라운드 후보의 표수를 표시하며 1차 모임별 분석은 별도로 남긴다. reduced-motion/건너뛰기에서는 저장된 최종 표와 당선/낙선을 바로 표시한다.

검증: 시스템126개(복수 합산·잘못된 입력 롤백·재클릭·복원·전 모임 조사 포함), 전용 Chromium 통합은320×568/390×844/1365×900의 조사/후보 스와이프/결선/결과와 시험 노력 토큰·실제 정산을 확인한다.

## 2026-10-23 공약별 통합 이행 결산

이 버전에서 개표한 revision3 당선자는 `electionFulfillmentVersion:1`, `electionFulfilled:false`로 전용 한방 선택 `election:fulfillment`에 진입한다. 실제로 내건 공약 세 개 각각에 이행/조정/철회를 선택하고 한 번 확정한다. 권한 밖 공약의 원안 이행은 금지하며, 직접 이행 비용은 합산 재산으로 검사한다. 서로 다른 공약 ID 세 개와 허용된 방식만 받으며 부족/중복/잘못된 요청은 타임라인 전체를 롤백한다.

`life/election.js`가 선택 가능한 방식·비용·결과와 공통 정산기를 거치는 읽기 전용 preview를 제공한다. 공약별 조정에는 기존 뻔뻔함의 부담 감소를 반영한다. 공약별 변화는 합산한 뒤 공통 정신 단계 변환과 스탯 상한을 한 번 적용한다. 신뢰도 합산 후0~25로 제한한다. `electionFulfillment_<공약ID>`의 scalar 속성에 실제 선택을 보존하고 요약+공약별 기록을 남긴다. UI는 비용을 적용하지 않고 `{plans:[{pledgeId,mode}]}`를 resolve로 전달한다.

결과 전용 서류는 저장된 outcome.before/after의 **실제 변화**와 입력 계획을 보여 준다. 새로고침해도 같은 결과를 복원하고 확인 후 정상 생애 진행으로 복귀한다. 과거에 개표를 마친 세이브 및 대기 중인 `election:bill-0/1`은 기존 두 청구서 경로를 유지한다. 이미 이행한 공약을 새 결산으로 재청구하지 않는다.

공약·조사·결산 서류의 고정 머리와 일상 대응 종이 안에 공통 `navigation()`의 후보 비교/조사 결과 바로가기를 둔다. `session.openElection(tab)`은 이미 대기 중인 선택을 유지하면서 지정 정보 탭만 연다. 조사 결과 열람은 새로운 방문/비용/정보 해금이 아니며 실제 추가 방문은 기존 조사 선택에서 확정한다. 당선 후 결산 전에도 정보 열람이 가능하다. UI/스토리/엔진 소유 범위는 그대로다.

검증은 기존 선거 통합에 통합 결산·결과 복원·중첩 정보 탭을 추가한다. 시스템은 총 재산 부족, 중복/권한 밖 입력, 재클릭 방지, 과거 청구서, 정신 단계 변환을 확인한다.
