# MEVI 웹사이트

<https://mevi-team.github.io/> 에 올라갈 MEVI 팀 소개 사이트입니다. 구성과 디자인은 [SOVIS 사이트](https://sovis-team.github.io/)를 그대로 따르고, 색·로고·사진·내용을 MEVI 것으로 바꿨습니다.

## 화면

한 장짜리 `site/index.html` 안에 화면 일곱 개가 있고, 주소의 `#` 뒤로 화면을 바꿉니다.

| 주소 | 화면 |
| --- | --- |
| `/#/` | 홈: 첫 화면 슬라이드 세 장(MEVI · CampusScanner · SwapStay), 새 소식, 쌓은 커밋, 분야 타일, MEVI 이야기 |
| `/#/about` | 소개: 우리 이야기, 이런 분들을 위해, 우리의 가치, 걸어온 길, 팀, 자주 묻는 질문, 문의 |
| `/#/campusscanner` | CampusScanner 소개 |
| `/#/swapstay` | SwapStay 소개 |
| `/#/tech` | 기술: 만드는 과정, 기술 구성, 설계 원칙 |
| `/#/proof` | 검증: 데이터 검수, 규칙 시험, 화면 점검 |
| `/#/news` | 소식(`/#/news/release`, `/#/news/dev`, `/#/news/team`으로 분류) |

`/about`처럼 `#` 없이 들어온 주소는 `404.html`이 `/#/about`으로 보냅니다.

## 파일

```text
site/                 GitHub Pages로 올라가는 폴더
  index.html          모든 화면의 글
  assets/css/site.css 디자인(색은 맨 위 :root 의 --accent 한 곳에서 바꿉니다)
  assets/js/site.js   화면 전환, 메뉴, 첫 화면 슬라이드와 빛의 선, 타일, 연혁, 소식 분류
  assets/img/         사진(webp), 서비스 화면 캡처(scr-*), 서비스 아이콘(icon-*)
  assets/og.jpg       공유 미리보기 그림(1200×630)
  404.html, robots.txt, sitemap.xml, favicon.svg
.github/workflows/deploy.yml  main에 올리면 site/ 를 GitHub Pages로 배포합니다
```

빌드 과정은 없습니다. 파일을 고치고 커밋하면 됩니다.

## 미리 보기

```bash
cd site
python -m http.server 4321
# http://127.0.0.1:4321/ 을 엽니다
```

## 점검

```bash
python -I tools/check_site.py
```

설치할 것 없이 파이썬과 Chrome(또는 Edge)으로 돌아갑니다. 화면마다 열어 그 화면만 보이는지, `body`에 그 화면 이름 하나만 붙는지(하위 화면으로 바로 들어왔을 때 머리글 아래 여백이 사라지던 결함), 가리키는 파일과 `#구역`이 모두 있는지 봅니다. 배포 워크플로도 이 점검을 통과해야 올립니다.

## 고칠 때 함께 바꿀 것

- **숫자:** 홈의 "지금까지 쌓은 커밋"(613 · 312 · 301)과 검증 화면의 시험 파일 수(113 · 17 · 17, 막대 다섯 개)는 2026년 11월 19일 두 저장소 기준입니다. 숫자를 바꾸면 기준일도 같이 바꿉니다.
  - 커밋: 각 저장소에서 `git rev-list --remotes --no-merges --count`
  - 시험 파일: `main` 기준 `web/test/*.test.mjs`, `web/scripts/*e2e*.mjs`(e2e-shared 제외), `pipeline/**/test_*.py`, SwapStay `*.test.ts`, `supabase/tester/*.test.ts`
- **소식:** 새 소식은 소식 화면 목록 맨 위에 더하고, 최근 세 개는 홈의 "새 소식"에도 넣습니다. 연혁(소개 > 걸어온 길)도 함께 봅니다.
- **서비스 화면 캡처:** `scr-cs-*`는 CampusScanner 개발 화면, `scr-ss-*`는 SwapStay 공개 데모(swapstay.pages.dev)입니다. 화면이 바뀌면 같은 크기(PC 1280×720, 휴대폰 600×1298)로 다시 찍습니다.

## 사진

모두 [Unsplash 라이선스](https://unsplash.com/license) 사진이고, 얼굴을 알아볼 수 있는 인물은 넣지 않았습니다. 작가 이름은 바닥글에 적었습니다.

| 파일 | 작가 | 원본 |
| --- | --- | --- |
| hero-mevi | Yohan Cho | <https://unsplash.com/photos/Mwvhyd22Lyw> |
| hero-cs | Johnny Briggs | <https://unsplash.com/photos/cJ-RyUD2ayc> |
| hero-ss | Danilo Rios | <https://unsplash.com/photos/AgK_XAqSbfk> |
| band-about | Shai Pal | <https://unsplash.com/photos/HIKcSp6F3gg> |
| band-tech | Luca Bravo | <https://unsplash.com/photos/XJXWbfSo2f0> |
| band-proof | Sasun Bughdaryan | <https://unsplash.com/photos/pCwb5OuObls> |
| tile-about | Julien Riedel | <https://unsplash.com/photos/JRXINWRg7IM> |
| tile-service | @felirbe | <https://unsplash.com/photos/uvlvl0XqQl0> |
| tile-tech | Arnold Francisca | <https://unsplash.com/photos/f77Bh3inUpE> |
| tile-proof | Priscilla Du Preez | <https://unsplash.com/photos/ggeZ9oyI-PE> |
| tile-news | Mr Cup / Fabien Barral | <https://unsplash.com/photos/Mwuod2cm8g4> |
| who-1 | Steven Wong | <https://unsplash.com/photos/yYYLbTszuTU> |
| who-2 | Damian Kravchuk | <https://unsplash.com/photos/8RTks6GjG1g> |
| who-3 | Huy Nguyen | <https://unsplash.com/photos/QGxBeUDkeWk> |
| who-4 | Filip Szalbot | <https://unsplash.com/photos/PxiAc1aElFQ> |
| val-1 | Nazrin Babashova | <https://unsplash.com/photos/zzOmEj3rQAE> |
| val-2 | Jakub Żerdzicki | <https://unsplash.com/photos/bqUZEAeWuok> |
| val-3 | Luca Bravo | <https://unsplash.com/photos/t3ItLqF-PPU> |
