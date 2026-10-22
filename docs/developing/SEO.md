# 검색 노출 설정

대표 주소: https://jaksim0sec.github.io/callOfgukmin/html/waiting.html

## 현재 설정

- 루트 index는 기존처럼 시작 화면으로 이동한다. 두 HTML의 canonical은 쿼리 없는 시작 화면 주소로 통일한다.
- 시작 화면의 제목/설명, 한국어 지정, index/follow, Open Graph/Twitter 로고 미리보기, VideoGame/WebApplication JSON-LD를 정적 HTML에 둔다. 자바스크립트 실행 전에도 읽을 수 있다.
- 게임/결과 화면은 noindex/follow다. 임의 생성 인물이나 비어 있는 결과 대신 게임의 시작 화면을 검색 결과로 안내한다. 공유 메타데이터는 공통 게임 소개이며 개인 저장을 공개하지 않는다.
- 사이트맵: https://jaksim0sec.github.io/callOfgukmin/sitemap.xml . 대표 화면만 포함한다. 검색 제목/설명은 현재 구현된 학생기·반장 선거·입시를 설명하며 성인 정치 콘텐츠가 완료됐다고 표시하지 않는다.
- GitHub Pages 프로젝트 경로의 robots.txt는 검색엔진의 도메인 루트 규칙이 아니다. 무효한 프로젝트 전용 robots.txt를 추가하지 않는다. 설정 시점의 https://jaksim0sec.github.io/robots.txt 는404였으며 별도 크롤링 차단이 없었다.

## Google Search Console 등록

이 절차는 소유자의 Google 계정이 필요하다. 저장소의 SEO 설정만으로 계정 소유권이 인증되지는 않는다.

1. https://search.google.com/search-console 에서 **URL 접두어** 속성 `https://jaksim0sec.github.io/callOfgukmin/`을 추가한다. github.io 전체 도메인의 DNS 인증을 선택하지 않는다.
2. 제공받은 HTML 인증 파일을 저장소 루트에 원본 그대로 배포하거나, 발급된 인증 메타 태그를 안내에 맞춰 추가한다. 임의의 인증 코드를 만들지 않는다. 인증이 끝나도 파일/태그는 유지한다.
3. 사이트맵 메뉴에서 `https://jaksim0sec.github.io/callOfgukmin/sitemap.xml`을 제출한다.
4. URL 검사에서 대표 시작 화면을 검사하고 색인 생성을 요청한다.

검색엔진이 크롤링·색인·표시 시점을 결정하므로 배포 직후 검색에 바로 나오는 것은 아니다. Search Console에서 발견/색인 상태를 확인한다.

## 유지 관리

배포 주소를 바꾸면 canonical, og:url/image, Twitter 이미지, JSON-LD의 id/url/image, sitemap을 함께 바꾼다. 홈 내용이 실질적으로 바뀐 날짜만 sitemap의 lastmod에 기록한다. 게임 기능 변경 때마다 검색 등록이나 인증을 반복할 필요는 없다. 허위 별점/후기/검색 키워드 나열은 사용하지 않는다.
