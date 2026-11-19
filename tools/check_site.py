# MEVI 사이트 점검. 설치할 것 없이 파이썬과 Chrome(또는 Edge)만 있으면 됩니다.
#   python -I tools/check_site.py            # site/ 를 점검
#   python -I tools/check_site.py 다른/폴더   # 다른 사이트 폴더를 점검
#
# 하는 일
# 1. 화면마다 헤드리스 브라우저로 열어, 스크립트가 바꾼 뒤의 DOM을 읽습니다.
#    - body 에는 그 화면의 view-이름 하나만 있어야 합니다.
#      (2026-11-19 결함: 하위 화면으로 바로 들어오면 HTML에 적힌 view-home 이 남아
#       머리글 아래 여백이 0이 되고, 화면 위쪽이 머리글에 가려졌습니다.)
#    - 그 화면만 보이고 나머지 화면은 hidden 이어야 합니다.
# 2. index.html 이 가리키는 그림·CSS·JS 파일이 모두 있는지 봅니다.
# 3. 페이지 안 링크(#이름)가 가리키는 구역이 모두 있는지 봅니다.
import functools
import http.server
import os
import re
import shutil
import subprocess
import sys
import tempfile
import threading

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.join(ROOT, 'site')
ROUTES = ['', 'about', 'services', 'campusscanner', 'swapstay', 'work', 'people', 'news']
BROWSERS = [
    r'C:\Program Files\Google\Chrome\Application\chrome.exe',
    r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    'google-chrome', 'chromium', 'chromium-browser', 'microsoft-edge',
]

fails = []


def fail(msg):
    fails.append(msg)
    print('  실패:', msg)


def find_browser():
    for b in BROWSERS:
        if os.path.isabs(b) and os.path.exists(b):
            return b
        if not os.path.isabs(b) and shutil.which(b):
            return shutil.which(b)
    return None


def serve(folder):
    handler = functools.partial(QuietHandler, directory=folder)
    httpd = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def dump_dom(browser, url, profile):
    out = subprocess.run(
        [browser, '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
         '--user-data-dir=' + profile, '--virtual-time-budget=3000', '--dump-dom', url],
        capture_output=True, timeout=60)
    return out.stdout.decode('utf-8', 'replace')


def check_views(browser, base):
    profile = tempfile.mkdtemp(prefix='mevi-check-')
    try:
        for r in ROUTES:
            name = r or 'home'
            dom = dump_dom(browser, base + '/#/' + r, profile)
            m = re.search(r'<body[^>]*class="([^"]*)"', dom)
            if not m:
                fail(f'#/{r}: DOM을 읽지 못했습니다')
                continue
            views = [c for c in m.group(1).split() if c.startswith('view-')]
            if views != ['view-' + name]:
                fail(f'#/{r}: body 의 화면 클래스가 {views} 입니다 (기대: view-{name})')
            shown = re.findall(r'<div class="view" data-view="([a-z]+)"(?![^>]*hidden)', dom)
            if shown != [name]:
                fail(f'#/{r}: 보이는 화면이 {shown} 입니다 (기대: {name})')
            print(f'  #/{r or ""}: {views} · 보이는 화면 {shown}')
    finally:
        shutil.rmtree(profile, ignore_errors=True)


def check_files_and_anchors():
    html = open(os.path.join(SITE, 'index.html'), encoding='utf-8').read()
    css = open(os.path.join(SITE, 'assets', 'css', 'site.css'), encoding='utf-8').read()
    refs = set(re.findall(r'(?:src|href)="(/[^"#?]+)"', html))
    refs |= set(re.findall(r'url\("(/[^")]+)"\)', html))
    refs |= {'/assets/' + p.lstrip('./') for p in re.findall(r'url\("\.\./([^")]+)"\)', css)}
    for ref in sorted(refs):
        if ref == '/':
            continue
        if not os.path.exists(os.path.join(SITE, ref.lstrip('/'))):
            fail(f'없는 파일을 가리킵니다: {ref}')
    ids = set(re.findall(r'\sid="([^"]+)"', html))
    for a in sorted(set(re.findall(r'href="#([^/"][^"]*)"', html))):
        if a not in ids:
            fail(f'없는 구역을 가리킵니다: #{a}')
    print(f'  파일 {len(refs)}개, 페이지 안 링크 확인')


# 로고와 아이콘은 먹색과 흰색만 씁니다(2026-11-19: 주황 바탕의 흰 m이 패스트푸드 로고처럼 보였습니다).
# 아이콘 주소에는 ?v= 판 번호를 붙여, 바꿨을 때 브라우저가 예전 아이콘을 캐시에서 계속 쓰지 않게 합니다.
LOGO_COLORS = {'#14171F', '#FFFFFF'}


def check_logo():
    files = [os.path.join(SITE, 'favicon.svg')]
    brand = os.path.join(SITE, 'assets', 'brand')
    if os.path.isdir(brand):
        files += [os.path.join(brand, f) for f in os.listdir(brand) if f.endswith('.svg')]
    for f in files:
        svg = open(f, encoding='utf-8').read()
        for c in set(re.findall(r'#[0-9A-Fa-f]{6}\b', svg)):
            if c.upper() not in LOGO_COLORS:
                fail(f'{os.path.relpath(f, SITE)} 에 먹색·흰색이 아닌 색 {c} 이 있습니다')
    for page in ('index.html', '404.html'):
        html = open(os.path.join(SITE, page), encoding='utf-8').read()
        for href in re.findall(r'<link rel="(?:icon|apple-touch-icon)"[^>]*href="([^"]+)"', html):
            if '?v=' not in href:
                fail(f'{page}: 아이콘 주소 {href} 에 ?v= 판 번호가 없습니다')
    print(f'  로고·아이콘 파일 {len(files)}개 확인')


def main():
    print('사이트 폴더:', SITE)
    print('1. 파일과 링크')
    check_files_and_anchors()
    print('1-2. 로고 색과 아이콘 주소')
    check_logo()
    browser = find_browser()
    print('2. 화면 전환')
    if not browser:
        fail('Chrome이나 Edge를 찾지 못해 화면 전환을 점검하지 못했습니다')
    else:
        httpd = serve(SITE)
        try:
            check_views(browser, f'http://127.0.0.1:{httpd.server_address[1]}')
        finally:
            httpd.shutdown()
    print('결과:', '통과' if not fails else f'실패 {len(fails)}건')
    sys.exit(1 if fails else 0)


if __name__ == '__main__':
    main()
