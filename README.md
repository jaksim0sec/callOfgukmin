# 국민의 부름

한국을 배경으로 출생부터 성장·진학·직업·정치까지 선택으로 이어 가는 인생 게임입니다. **현재 플레이 가능한 범위는 출생~19세 학생 시절**이며 성인·정치·전체 게임 엔딩은 아직 연결하지 않았습니다.

## 현재 플레이

- 이름·출생 지역·가구 재력 생성, 유년기와 초·중·고 이야기, 관심과 적성·장기 특성 획득
- 과거 행동과 현재 상태로 결정되는 시나리오, 학습·관계·건강·스트레스·비용의 선택
- 중학교 시험과 고교 학년별 학업 전략, 지역별 고교 지원 모형
- 일상 선택 팝업과 시험·진학 서류, 접기·재열기, 대화형 선택 결과와 실제 변화 표시
- PC 2열 화면, 모바일의 항상 남아 있는 기록 시트, 저장 복원과 새 인물 재시작

시험 등급·지원 기준·비용은 게임 모형입니다. 실제 모집요강이나 공식 성적을 대신하지 않습니다.

## 실행과 검사

별도 빌드가 없는 정적 HTML/CSS/JavaScript 프로젝트입니다. GitHub Pages의 진입점은 저장소 루트 `index.html`입니다.

```sh
python3 -m http.server 8000
node tests/smoke.mjs
node --test tests/systems.mjs
# Playwright와 Chromium을 개발 환경에 설치한 뒤
node tests/browser.mjs
node tests/experience.mjs
```

`tests/browser.mjs`는 저장·미리보기·시트 제스처와 생애 진행을 검사합니다. `tests/experience.mjs`는 320×568부터 PC까지 선택창·성적표·재열기를 검사하고 화면 버튼만으로 학생 시절을 완주합니다. CI도 세 종류의 검사를 실행하며 브라우저 스크린샷을 남깁니다. 실기기 Safari·삼성 인터넷과 저사양 성능은 별도 확인이 필요합니다.

현행 저장 키는 `callOfgukmin__ui__v1`입니다. 과거 플레이 키 `callOfgukmin__playable__v1`은 덮어쓰지 않습니다. 개발 검증 도구는 인게임의 `?systems=1`에서만 표시합니다.

- [개발 규칙](AGENTS.md)
- [문서 안내](docs/README.md)
- [스토리·분기 계약](docs/developing/STORY.md)
- [정산·시간·저장 계약](docs/developing/SYSTEMS.md)
- [현재 실행 구조](docs/developing/RUNTIME.md)
- [화면 계약](docs/developing/UI.md)
- [CSS 필수 규칙](docs/developing/CSS.md)
