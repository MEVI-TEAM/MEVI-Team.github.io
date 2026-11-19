# MEVI 웹사이트

<https://mevi-team.github.io/> 에 올라가는 팀 MEVI 소개 사이트입니다. 구성과 디자인은 [SOVIS 사이트](https://sovis-team.github.io/)를 따르고, 로고·색·사진·내용은 MEVI 것입니다.

## 화면

한 장짜리 `site/index.html` 안에 화면 여덟 개가 있고, 주소의 `#` 뒤로 화면을 바꿉니다.

| 주소 | 화면 |
| --- | --- |
| `/#/` | 홈: 첫 화면 슬라이드 세 장(MEVI · More Evolution · Valuable Innovation), 새 소식, MEVI라는 이름, 분야 타일, MEVI가 만드는 서비스, MEVI 이야기 |
| `/#/about` | 소개: 우리 이야기와 MEVI 한눈에, 이름에 담은 뜻, 로고, 우리의 가치, 걸어온 길 |
| `/#/services` | 서비스: 두 서비스 한눈에, 이런 분들을 위해 |
| `/#/campusscanner` | CampusScanner 자세히 |
| `/#/swapstay` | SwapStay 자세히 |
| `/#/work` | 일하는 방식: 일하는 순서, 원칙, 검증, 쓰는 도구 |
| `/#/people` | 사람들: 팀, 함께 일하는 방식, 자주 묻는 질문, 문의 |
| `/#/news` | 소식(`/#/news/release`, `/#/news/dev`, `/#/news/team`으로 분류) |

`/about`처럼 `#` 없이 들어온 주소는 `404.html`이 `/#/about`으로 보냅니다.

## 로고

`site/assets/brand/`에 있습니다. 사이트 소개 화면의 "로고"에서도 내려받을 수 있습니다.

| 파일 | 쓰는 곳 |
| --- | --- |
| `mevi-logo.svg` / `mevi-logo-white.svg` | 심볼 + 글자. 밝은 바탕 / 어두운 바탕·사진 위 |
| `mevi-symbol.svg` / `mevi-symbol-white.svg` | 심볼(m)만 |
| `mevi-symbol-1024.png` | 흰 바탕에 먹색 m. GitHub 조직 프로필 사진 같은 정사각형 자리 |
| `mevi-logo-2000.png` | 심볼 + 글자, 투명 바탕 |

- 심볼은 48 격자 위의 소문자 m입니다. 기둥 x = 7 · 24 · 41, 왼쪽 아치 중심 (15.5, 22), 오른쪽 아치 중심 (32.5, 18), 반지름 8.5, 바닥 y = 38, 선 두께 4.6, 끝은 둥글게. 오른쪽 아치가 한 단(4) 높습니다.
- 글자 MEVI는 Noto Sans KR ExtraBold를 윤곽선으로 바꾼 것이라 글꼴 없이도 똑같이 보입니다. 묶음에서 심볼 높이는 대문자 높이의 1.456배, 심볼과 글자 사이는 대문자 높이의 0.76배입니다.
- 색은 먹색 `#14171F`과 흰색 두 가지만 씁니다. 빨강·주황·노랑 바탕에 올리지 않습니다(둥근 두 획이 패스트푸드 로고처럼 보입니다).
- 16px 같은 아주 작은 크기(파비콘)는 선을 조금 두껍게 한 `site/favicon.svg`를 씁니다.

## 파일

```text
site/                 GitHub Pages로 올라가는 폴더
  index.html          모든 화면의 글
  assets/css/site.css 디자인(색은 맨 위 :root 에서 바꿉니다)
  assets/js/site.js   화면 전환, 메뉴, 첫 화면 슬라이드와 빛의 선, 타일, 연혁, 소식 분류
  assets/brand/       로고 파일
  assets/img/         사진(webp), 서비스 화면 캡처(scr-*), 서비스 아이콘(icon-*)
  assets/og.jpg       공유 미리보기 그림(1200×630)
  404.html, robots.txt, sitemap.xml, favicon.svg, apple-touch-icon.png
tools/check_site.py   점검 스크립트
.github/workflows/deploy.yml  main에 올리면 점검한 뒤 site/ 를 GitHub Pages로 배포합니다
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

- **소식:** 새 소식은 소식 화면 목록 맨 위에 더하고, 최근 세 개는 홈의 "새 소식"에도 넣습니다. 연혁(소개 > 걸어온 길)도 함께 봅니다.
- **서비스 화면 캡처:** `scr-cs-*`는 CampusScanner 개발 화면, `scr-ss-*`는 SwapStay 공개 데모(swapstay.pages.dev)입니다. 화면이 바뀌면 같은 크기(PC 1280×720, 휴대폰 600×1298)로 다시 찍습니다.
- **팀:** 사람이 늘면 사람들 화면의 팀 카드, 소개의 "MEVI 한눈에", 구조화 정보(`index.html` 머리의 `ld+json`)를 함께 고칩니다.

## 사진

모두 [Unsplash 라이선스](https://unsplash.com/license) 사진이고, 얼굴을 알아볼 수 있는 인물은 넣지 않았습니다. 작가 이름은 바닥글에 적었습니다.

| 파일 | 작가 | 원본 |
| --- | --- | --- |
| hero-mevi | Yohan Cho | <https://unsplash.com/photos/Mwvhyd22Lyw> |
| hero-evolution, tile-about | Julien Riedel | <https://unsplash.com/photos/JRXINWRg7IM> |
| hero-valuable | Avtar Singh | <https://unsplash.com/photos/wT0oU24OJYU> |
| hero-cs | Johnny Briggs | <https://unsplash.com/photos/cJ-RyUD2ayc> |
| hero-ss | Danilo Rios | <https://unsplash.com/photos/AgK_XAqSbfk> |
| band-about | Shai Pal | <https://unsplash.com/photos/HIKcSp6F3gg> |
| band-services, tile-service | @felirbe | <https://unsplash.com/photos/uvlvl0XqQl0> |
| band-tech | Luca Bravo | <https://unsplash.com/photos/XJXWbfSo2f0> |
| band-proof | Sasun Bughdaryan | <https://unsplash.com/photos/pCwb5OuObls> |
| band-people, tile-people | Mimi Thian | <https://unsplash.com/photos/ZKBzlifgkgw> |
| tile-work | Kaleidico | <https://unsplash.com/photos/26MJGnCM0Wc> |
| tile-news | Mr Cup / Fabien Barral | <https://unsplash.com/photos/Mwuod2cm8g4> |
| who-1 | Steven Wong | <https://unsplash.com/photos/yYYLbTszuTU> |
| who-2 | Damian Kravchuk | <https://unsplash.com/photos/8RTks6GjG1g> |
| who-3 | Huy Nguyen | <https://unsplash.com/photos/QGxBeUDkeWk> |
| who-4 | Filip Szalbot | <https://unsplash.com/photos/PxiAc1aElFQ> |
| val-1 | Nazrin Babashova | <https://unsplash.com/photos/zzOmEj3rQAE> |
| val-2 | Jakub Żerdzicki | <https://unsplash.com/photos/bqUZEAeWuok> |
| val-3 | Luca Bravo | <https://unsplash.com/photos/t3ItLqF-PPU> |
