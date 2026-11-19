/* MEVI 사이트 동작
   SOVIS 사이트의 동작(화면 전환, 메가 메뉴, 첫 화면 슬라이드, 분야 타일, 가치, 연혁, 소식 분류)을
   그대로 따르고, 첫 화면의 그래픽만 MEVI 것(이어지는 빛의 선)으로 바꿨습니다. */
(function(){
"use strict";
var REDUCE = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function $(s, r){ return (r || document).querySelector(s); }
function $$(s, r){ return [].slice.call((r || document).querySelectorAll(s)); }

/* ============================================================
   1. 알림
   ============================================================ */
var toaster = $("#toaster"), toastTimer = null;
function toast(title, desc){
  var t = document.createElement("div");
  t.className = "toast"; t.setAttribute("role", "status");
  var b = document.createElement("b"); b.textContent = title; t.appendChild(b);
  if(desc){ var s = document.createElement("span"); s.textContent = desc; t.appendChild(s); }
  toaster.textContent = ""; toaster.appendChild(t);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function(){ if(t.parentNode) t.parentNode.removeChild(t); }, 2800);
}

/* ============================================================
   2. 머리글: 메가 메뉴, 첫 화면에서 투명하게, 좁은 화면 메뉴
   ============================================================ */
var gnb = $("#gnb"), gnbNav = $("#gnbNav"), navToggle = $("#navToggle"), navMenu = $("#navmenu");
var currentView = null;
function megaOn(on){ gnb.classList.toggle("mega", on); }
gnbNav.addEventListener("mouseenter", function(){ megaOn(true); });
gnb.addEventListener("mouseleave", function(){ if(!gnb.contains(document.activeElement)) megaOn(false); });
gnb.addEventListener("focusin", function(e){ if(gnbNav.contains(e.target)) megaOn(true); });
gnb.addEventListener("focusout", function(e){ if(!e.relatedTarget || !gnbNav.contains(e.relatedTarget)) megaOn(false); });
/* 메뉴에서 선택하면 마우스가 아직 위에 있어도 닫습니다. */
gnbNav.addEventListener("click", function(e){
  if(!e.target.closest("a")) return;
  megaOn(false);
  if(document.activeElement && gnbNav.contains(document.activeElement)) document.activeElement.blur();
});

function updateTop(){
  var top = currentView === "home" && window.pageYOffset < 40 && !navMenu.classList.contains("open");
  gnb.classList.toggle("is-top", top);
}
window.addEventListener("scroll", updateTop, {passive:true});

function setNav(open){
  navMenu.classList.toggle("open", open);
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
  document.body.classList.toggle("menu-open", open);
  updateTop();
}
navToggle.addEventListener("click", function(){ setNav(!navMenu.classList.contains("open")); });
navMenu.addEventListener("click", function(e){ if(e.target.closest("a")) setNav(false); });
function closeNav(returnFocus){
  if(!navMenu.classList.contains("open")) return;
  setNav(false);
  if(returnFocus) navToggle.focus();
}
document.addEventListener("keydown", function(e){
  if(e.key !== "Escape" && e.key !== "Esc") return;
  if(gnb.classList.contains("mega")){
    megaOn(false);
    if(gnbNav.contains(document.activeElement)) document.activeElement.blur();
    return;
  }
  closeNav(true);
});
window.addEventListener("resize", function(){ if(getComputedStyle(navToggle).display === "none") closeNav(false); });

/* ============================================================
   3. 등장 효과와 숫자 세기
   ============================================================ */
$$("[data-stagger]").forEach(function(box){
  var n = 0;
  [].forEach.call(box.children, function(ch){
    var el = ch.classList.contains("rv") ? ch : ch.querySelector(":scope > .rv");
    if(el){ el.style.setProperty("--rv-delay", String((n % 6) * 80) + "ms"); n++; }
  });
});

function cntFormat(v, to){
  var dec = String(to).indexOf(".") >= 0 ? 1 : 0;
  var s = v.toFixed(dec);
  return to >= 1000 ? Number(s).toLocaleString("ko-KR") : s;
}
function runCount(el){
  if(el._done) return;
  el._done = true;
  var to = parseFloat(el.getAttribute("data-to"));
  if(REDUCE){ el.textContent = cntFormat(to, to); return; }
  var t0 = performance.now(), dur = 1100;
  (function step(now){
    var p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
    el.textContent = cntFormat(to * e, to);
    if(p < 1) requestAnimationFrame(step);
  })(t0);
}
var CNTS = $$(".cnt");
function resetCounts(scope){
  if(REDUCE || !("IntersectionObserver" in window)) return;
  $$(".cnt", scope).forEach(function(el){ el._done = false; el.textContent = "0"; });
}
if("IntersectionObserver" in window){
  var cntIO = new IntersectionObserver(function(en){
    en.forEach(function(x){ if(x.isIntersecting) runCount(x.target); });
  }, {threshold:0.4});
  CNTS.forEach(function(el){ cntIO.observe(el); });
}

function setupReveal(){
  var items = $$(".rv");
  if(!("IntersectionObserver" in window)){ items.forEach(function(el){ el.classList.add("in"); }); return; }
  document.documentElement.classList.add("reveal-ready");
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting) entry.target.classList.add("in");
      /* 위로 지나가 화면 아래에 다시 놓였을 때만 되돌려, 다음에 내려올 때 다시 떠오릅니다. */
      else if(entry.boundingClientRect.top > window.innerHeight) entry.target.classList.remove("in");
    });
  }, {threshold:0});
  items.forEach(function(el){
    if(el.getBoundingClientRect().bottom < 0) el.classList.add("in");
    io.observe(el);
  });
}

/* ============================================================
   4. 하위 페이지 머리말 사진의 시차
   ============================================================ */
var PGBG = $$(".pgbg"), pxQueued = false;
function parallax(){
  pxQueued = false;
  if(REDUCE) return;
  var vh = window.innerHeight;
  PGBG.forEach(function(el){
    var r = el.parentElement.getBoundingClientRect();
    if(!r.height || r.bottom < 0 || r.top > vh) return;
    el.style.setProperty("--py", (-r.top * 0.28).toFixed(1) + "px");
  });
}
window.addEventListener("scroll", function(){
  if(pxQueued) return;
  pxQueued = true; requestAnimationFrame(parallax);
}, {passive:true});

/* ============================================================
   5. 화면 전환
      #/about, #/campusscanner, #/swapstay, #/tech, #/proof, #/news(/분류) 로 화면을 엽니다.
      그 밖의 #이름은 그 구역이 들어 있는 화면을 연 뒤 그 자리로 갑니다.
   ============================================================ */
var VIEWS = {};
$$("[data-view]").forEach(function(v){ VIEWS[v.getAttribute("data-view")] = v; });
var VIEW_TITLE = {
  home: document.title,
  about: "소개 · MEVI",
  campusscanner: "CampusScanner · MEVI",
  swapstay: "SwapStay · MEVI",
  tech: "기술 · MEVI",
  proof: "검증 · MEVI",
  news: "소식 · MEVI"
};
var MENU_OF = {about:"#/about", campusscanner:"#/campusscanner", swapstay:"#/campusscanner", tech:"#/tech", proof:"#/proof", news:"#/news"};
var M1 = $$(".m1");
function jumpTo(y){
  var root = document.documentElement, prev = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollTo(0, Math.max(0, y));
  root.style.scrollBehavior = prev;
}
function markNav(){
  M1.forEach(function(a){
    if(a.getAttribute("href") === MENU_OF[currentView]) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
}
function showView(name){
  if(!VIEWS[name]) name = "home";
  if(name === currentView) return false;
  /* 새 화면의 등장 효과와 숫자를 처음부터 다시 보여 줍니다. */
  $$(".rv.in", VIEWS[name]).forEach(function(el){ el.classList.remove("in"); });
  resetCounts(VIEWS[name]);
  for(var k in VIEWS){
    if(k === name) VIEWS[k].removeAttribute("hidden");
    else VIEWS[k].setAttribute("hidden", "");
  }
  /* HTML에 처음 적힌 view-home까지 지워야, 하위 화면으로 바로 들어왔을 때 머리글 아래 여백이 생깁니다. */
  [].slice.call(document.body.classList).forEach(function(c){ if(c.indexOf("view-") === 0) document.body.classList.remove(c); });
  document.body.classList.add("view-" + name);
  currentView = name;
  document.title = VIEW_TITLE[name] || VIEW_TITLE.home;
  markNav();
  updateTop();
  if(name === "home") sizeHero();
  histState();
  return true;
}
function focusHeading(){
  var h1 = VIEWS[currentView].querySelector("h1");
  if(!h1) return;
  h1.setAttribute("tabindex", "-1");
  try{ h1.focus({preventScroll:true}); }catch(_){ h1.focus(); }
}
var firstRoute = true;
function route(){
  var h = location.hash || "";
  try{ h = decodeURIComponent(h); }catch(_){}
  closeNav(false);
  megaOn(false);
  if(h === "" || h === "#" || h.indexOf("#/") === 0){
    var parts = h.slice(2).split("/"), name = parts[0] || "home";
    var changed = showView(name);
    if(currentView === "news") setNewsFilter(parts[1] || "all");
    jumpTo(0);
    if(changed && !firstRoute) focusHeading();
    firstRoute = false;
    parallax();
    return;
  }
  var id = h.slice(1), target = document.getElementById(id);
  var holder = target ? target.closest("[data-view]") : null;
  /* 화면 밖의 자리(본문 시작 등)로 가는 주소는 화면을 바꾸지 않습니다. */
  if(target && !holder){ parallax(); return; }
  showView(holder ? holder.getAttribute("data-view") : "home");
  if(target){
    var margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    jumpTo(target.getBoundingClientRect().top + window.pageYOffset - margin);
  }
  firstRoute = false;
  parallax();
}
window.addEventListener("hashchange", route);

/* ============================================================
   6. 첫 화면 슬라이드
   ============================================================ */
var mv = $("#mv"), mvTexts = $$(".mvtext"), mvBgs = $$(".mvbg"), mvDots = $$(".mvdot"), mvPause = $("#mvPause");
var MV = {i:0, el:0, dur:7, paused:false, hold:false, seen:true};
function mvGo(k){
  var n = mvTexts.length;
  MV.i = ((k % n) + n) % n;
  MV.el = 0;
  mvBgs.forEach(function(b, j){ b.classList.toggle("is-on", j === MV.i); });
  mvTexts.forEach(function(t, j){
    var on = j === MV.i;
    t.classList.toggle("is-on", on);
    if(on){ t.removeAttribute("inert"); t.removeAttribute("aria-hidden"); }
    else { t.setAttribute("inert", ""); t.setAttribute("aria-hidden", "true"); }
  });
  mvDots.forEach(function(d, j){
    var on = j === MV.i;
    d.classList.toggle("is-on", on);
    if(on) d.setAttribute("aria-current", "true"); else d.removeAttribute("aria-current");
    d.querySelector("i").style.transform = "scaleX(0)";
  });
  setScene(mvTexts[MV.i].getAttribute("data-scene"));
}
function mvSetPaused(p){
  MV.paused = p;
  mvPause.classList.toggle("is-play", p);
  mvPause.setAttribute("aria-label", p ? "자동 넘김 시작" : "자동 넘김 멈추기");
}
mvDots.forEach(function(d, k){ d.addEventListener("click", function(){ mvGo(k); }); });
mvPause.addEventListener("click", function(){ mvSetPaused(!MV.paused); });
mv.addEventListener("focusin", function(){ MV.hold = true; });
mv.addEventListener("focusout", function(e){ if(!mv.contains(e.relatedTarget)) MV.hold = false; });
var swipeX = null;
mv.addEventListener("pointerdown", function(e){ if(e.pointerType !== "mouse") swipeX = e.clientX; });
mv.addEventListener("pointerup", function(e){
  if(swipeX === null) return;
  var dx = e.clientX - swipeX; swipeX = null;
  if(Math.abs(dx) > 50) mvGo(MV.i + (dx < 0 ? 1 : -1));
});
if("IntersectionObserver" in window){
  new IntersectionObserver(function(en){ MV.seen = en[0].isIntersecting; }, {threshold:0.3}).observe(mv);
}
function mvTick(dt){
  if(MV.seen && !MV.paused && !MV.hold && !document.hidden){
    MV.el += dt;
    if(MV.el >= MV.dur) mvGo(MV.i + 1);
  }
  mvDots[MV.i].querySelector("i").style.transform = "scaleX(" + Math.min(1, MV.el / MV.dur).toFixed(4) + ")";
}

/* ============================================================
   7. 첫 화면의 빛의 선
      MEVI: 여러 점이 차례로 이어지는 선(팀이 하는 일, 점과 점을 잇기)
      CampusScanner: 한 점에서 여러 도시로 뻗는 선(떠나는 길)
      SwapStay: 두 집 사이를 서로 반대로 오가는 선(맞교환)
      사진 위에 빛처럼 더해지고(mix-blend-mode: screen), 멈춤 버튼을 누르면 그대로 멈춥니다.
   ============================================================ */
var cv = $("#mvCanvas"), cx = cv.getContext("2d");
var WARM = "255,236,214", GLOW = "255,176,138";
var SC = {kind:"net", t:0, w:0, h:0, arcs:[], nodes:[], next:0, idx:0, seed:7};
function rnd(){ SC.seed = (SC.seed * 16807) % 2147483647; return (SC.seed - 1) / 2147483646; }
function sizeHero(){
  var r = cv.getBoundingClientRect();
  if(!r.width || !r.height) return;
  var dpr = Math.min(window.devicePixelRatio || 1, 2) * 0.7;
  SC.w = r.width; SC.h = r.height;
  cv.width = Math.max(1, Math.round(r.width * dpr));
  cv.height = Math.max(1, Math.round(r.height * dpr));
  cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  setScene(SC.kind);
}
function setScene(kind){
  SC.kind = kind || "net"; SC.t = 0; SC.arcs = []; SC.nodes = []; SC.next = 0.2; SC.idx = 0;
  SC.seed = 7 + MV.i * 101;
  var i;
  if(SC.kind === "net"){
    for(i = 0; i < 16; i++) SC.nodes.push({x:0.06 + rnd() * 0.88, y:0.14 + rnd() * 0.72});
  } else if(SC.kind === "out"){
    SC.origin = {x:0.16, y:0.76};
    for(i = 0; i < 9; i++) SC.nodes.push({x:0.44 + rnd() * 0.48, y:0.14 + rnd() * 0.34});
  } else {
    SC.a = {x:0.2, y:0.64}; SC.b = {x:0.8, y:0.64};
  }
  if(cx) cx.clearRect(0, 0, SC.w, SC.h);
}
function P(n){ return {x:n.x * SC.w, y:n.y * SC.h}; }
/* 두 점 사이의 휘어진 길(2차 베지어). bend가 양수면 위로 휩니다. */
function curve(a, b, bend){
  var dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  var nx = dy / d, ny = -dx / d;
  if(dx < 0){ nx = -nx; ny = -ny; }
  return {a:a, b:b, c:{x:(a.x + b.x) / 2 + nx * bend * d, y:(a.y + b.y) / 2 + ny * bend * d}};
}
function at(q, u){
  var v = 1 - u;
  return {x:v * v * q.a.x + 2 * v * u * q.c.x + u * u * q.b.x, y:v * v * q.a.y + 2 * v * u * q.c.y + u * u * q.b.y};
}
function strokePart(q, u0, u1, col, alpha, width){
  if(u1 <= u0 || alpha <= 0) return;
  var steps = Math.max(2, Math.ceil((u1 - u0) * 40));
  cx.beginPath();
  for(var s = 0; s <= steps; s++){
    var p = at(q, u0 + (u1 - u0) * s / steps);
    if(s === 0) cx.moveTo(p.x, p.y); else cx.lineTo(p.x, p.y);
  }
  cx.strokeStyle = "rgba(" + col + "," + alpha.toFixed(3) + ")";
  cx.lineWidth = width;
  cx.stroke();
}
function dot(p, r, col, alpha){
  if(alpha <= 0) return;
  cx.beginPath(); cx.arc(p.x, p.y, r * 3.2, 0, Math.PI * 2);
  cx.fillStyle = "rgba(" + col + "," + (alpha * 0.16).toFixed(3) + ")"; cx.fill();
  cx.beginPath(); cx.arc(p.x, p.y, r, 0, Math.PI * 2);
  cx.fillStyle = "rgba(" + col + "," + alpha.toFixed(3) + ")"; cx.fill();
}
function drawArc(arc){
  var p = Math.min(1, Math.max(0, (SC.t - arc.t0) / arc.dur));
  var e = 1 - Math.pow(1 - p, 3);
  var age = SC.t - arc.t0 - arc.dur;
  var a = age < 0 ? 1 : Math.max(0, 1 - age / arc.life);
  if(a <= 0){ arc.dead = true; return; }
  strokePart(arc.q, 0, e, arc.col, 0.12 * a, 6);
  strokePart(arc.q, 0, e, arc.col, 0.85 * a, 1.5);
  dot(arc.q.a, 2.2, arc.col, 0.7 * a);
  if(p < 1) dot(at(arc.q, e), 3, arc.col, 1);
  else dot(arc.q.b, 2.6, arc.col, 0.9 * a);
}
function addArc(a, b, bend, dur, life, col){
  SC.arcs.push({q:curve(a, b, bend), t0:SC.t, dur:dur, life:life, col:col});
}
function drawScene(){
  var w = SC.w, h = SC.h, i;
  if(!w) return;
  cx.clearRect(0, 0, w, h);
  if(SC.kind === "net"){
    for(i = 0; i < SC.nodes.length; i++) dot(P(SC.nodes[i]), 1.6, WARM, 0.35);
    if(SC.t >= SC.next){
      var a = SC.nodes[Math.floor(rnd() * SC.nodes.length)], b = null, tries = 0;
      while(tries++ < 12){
        var c = SC.nodes[Math.floor(rnd() * SC.nodes.length)];
        var d = Math.hypot((c.x - a.x) * w, (c.y - a.y) * h);
        if(c !== a && d > w * 0.12 && d < w * 0.42){ b = c; break; }
      }
      if(b) addArc(P(a), P(b), (rnd() - 0.5) * 0.7, 1.2 + rnd() * 0.6, 3.6, SC.arcs.length % 3 === 0 ? GLOW : WARM);
      SC.next = SC.t + 0.42 + rnd() * 0.36;
    }
  } else if(SC.kind === "out"){
    var o = P(SC.origin);
    var pulse = REDUCE ? 1 : 0.75 + 0.25 * Math.sin(SC.t * 3);
    dot(o, 3.4 * pulse, GLOW, 0.95);
    if(SC.t >= SC.next){
      if(SC.idx < SC.nodes.length){
        addArc(o, P(SC.nodes[SC.idx]), 0.3 + rnd() * 0.12, 1.5, 6, SC.idx % 2 ? WARM : GLOW);
        SC.idx++;
        SC.next = SC.t + 0.5;
      } else if(!SC.arcs.length){
        SC.idx = 0; SC.next = SC.t + 0.4;
      }
    }
  } else {
    var A = P(SC.a), B = P(SC.b);
    var top = curve(A, B, 0.3), bottom = curve(A, B, -0.3);
    var f = Math.min(1, SC.t / 1.2);
    strokePart(top, 0, f, WARM, 0.32, 1.4);
    strokePart(bottom, 0, f, GLOW, 0.32, 1.4);
    dot(A, 4, WARM, 0.95 * f); dot(B, 4, GLOW, 0.95 * f);
    if(f >= 1){
      var T = 2.6, u = ((SC.t - 1.2) % T) / T, s = 0.5 - 0.5 * Math.cos(Math.PI * u);
      var tail = 0.2, k;
      for(k = 0; k < 6; k++){
        var u1 = s - tail * k / 6, u0 = s - tail * (k + 1) / 6;
        strokePart(top, Math.max(0, u0), Math.max(0, u1), WARM, 0.9 * (1 - k / 6), 2);
        strokePart(bottom, Math.max(0, 1 - u1), Math.max(0, 1 - u0), GLOW, 0.9 * (1 - k / 6), 2);
      }
      dot(at(top, s), 3, WARM, 1);
      dot(at(bottom, 1 - s), 3, GLOW, 1);
    }
  }
  for(i = 0; i < SC.arcs.length; i++) drawArc(SC.arcs[i]);
  SC.arcs = SC.arcs.filter(function(x){ return !x.dead; });
}
var lastT = performance.now() / 1000;
function frame(){
  requestAnimationFrame(frame);
  var now = performance.now() / 1000, dt = Math.min(0.1, now - lastT); lastT = now;
  if(currentView !== "home" || document.hidden) return;
  mvTick(dt);
  if(MV.paused || !MV.seen) return;
  SC.t += dt;
  drawScene();
}
var rzQueued = false;
window.addEventListener("resize", function(){
  if(rzQueued) return;
  rzQueued = true;
  requestAnimationFrame(function(){ rzQueued = false; if(currentView === "home") sizeHero(); });
});

/* ============================================================
   8. 분야 타일: 3초마다 다음 타일이 색을 되찾습니다(가리키면 그 타일).
   ============================================================ */
var PT = $$(".pt"), ptI = 0, ptHold = false, ptSeen = false;
function ptOn(k){
  ptI = k;
  PT.forEach(function(t, i){ t.classList.toggle("is-on", i === k); });
}
PT.forEach(function(t, k){
  t.addEventListener("mouseenter", function(){ ptHold = true; ptOn(k); });
  t.addEventListener("mouseleave", function(){ ptHold = false; });
  t.addEventListener("focus", function(){ ptHold = true; ptOn(k); });
  t.addEventListener("blur", function(){ ptHold = false; });
});
if(PT.length && "IntersectionObserver" in window){
  new IntersectionObserver(function(en){
    var was = ptSeen; ptSeen = en[0].isIntersecting;
    if(ptSeen && !was && !ptHold) ptOn(0);
  }, {threshold:0.35}).observe(PT[0].parentElement);
}
setInterval(function(){
  if(currentView !== "home" || !ptSeen || ptHold || document.hidden || !PT.length) return;
  ptOn((ptI + 1) % PT.length);
}, 3000);

/* ============================================================
   9. 우리의 가치: 가리키거나 5초가 지나면 다음 가치와 사진으로 바뀝니다.
   ============================================================ */
var vals = $$(".val"), valBgs = $$(".vals-bgs i"), valI = 0, valHold = false, valSeen = false;
function valOn(k){
  valI = k;
  vals.forEach(function(x, i){ x.classList.toggle("is-on", i === k); });
  valBgs.forEach(function(b, i){ b.classList.toggle("is-on", i === k); });
}
vals.forEach(function(v, k){
  v.addEventListener("mouseenter", function(){ valHold = true; valOn(k); });
  v.addEventListener("mouseleave", function(){ valHold = false; });
  v.addEventListener("focus", function(){ valHold = true; valOn(k); });
  v.addEventListener("blur", function(){ valHold = false; });
});
if(vals.length && "IntersectionObserver" in window){
  new IntersectionObserver(function(en){ valSeen = en[0].isIntersecting; }, {threshold:0.4}).observe(vals[0].closest(".vals"));
}
setInterval(function(){
  if(currentView !== "about" || !valSeen || valHold || document.hidden || !vals.length) return;
  valOn((valI + 1) % vals.length);
}, 5000);

/* ============================================================
   10. 소식 분류, 연혁 넘기기, 메일 주소 복사
   ============================================================ */
var nButtons = $$(".nfilter button"), nItems = $$(".nlist > li");
function setNewsFilter(f){
  if(["all", "release", "dev", "team"].indexOf(f) < 0) f = "all";
  nButtons.forEach(function(b){ b.setAttribute("aria-pressed", String(b.getAttribute("data-f") === f)); });
  nItems.forEach(function(li){
    if(f === "all" || li.getAttribute("data-cat") === f) li.removeAttribute("hidden");
    else li.setAttribute("hidden", "");
  });
}
nButtons.forEach(function(b){
  b.addEventListener("click", function(){
    var f = b.getAttribute("data-f");
    try{ history.replaceState(null, "", f === "all" ? "#/news" : "#/news/" + f); }catch(_){}
    setNewsFilter(f);
  });
});

var histList = $("#histList"), histPrev = $("#histPrev"), histNext = $("#histNext");
function histState(){
  if(!histList) return;
  histPrev.disabled = histList.scrollLeft < 4;
  histNext.disabled = histList.scrollLeft + histList.clientWidth >= histList.scrollWidth - 4;
}
function histStep(dir){
  var first = histList.querySelector(":scope > li");
  var step = first ? first.getBoundingClientRect().width + 28 : 300;
  histList.scrollBy({left:dir * step, behavior:REDUCE ? "auto" : "smooth"});
}
histPrev.addEventListener("click", function(){ histStep(-1); });
histNext.addEventListener("click", function(){ histStep(1); });
histList.addEventListener("scroll", histState, {passive:true});
window.addEventListener("resize", histState);

var copyMail = $("#copyMail");
if(copyMail){
  var MAIL = copyMail.getAttribute("data-mail");
  var copied = function(){ toast("메일 주소를 복사했습니다", MAIL); };
  var copyFallback = function(){
    var ta = document.createElement("textarea");
    ta.value = MAIL; ta.setAttribute("readonly", "");
    ta.style.position = "fixed"; ta.style.top = "0"; ta.style.left = "0"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    var ok = false;
    try{ ok = document.execCommand("copy"); }catch(_){}
    document.body.removeChild(ta);
    if(ok) copied(); else toast("주소를 복사하지 못했습니다", MAIL + " 로 메일을 보내 주세요");
  };
  copyMail.addEventListener("click", function(){
    if(navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(MAIL).then(copied, copyFallback);
    else copyFallback();
  });
}

/* 본문으로 건너뛰기: 주소를 바꾸지 않고 지금 화면의 제목으로 갑니다. */
var skip = $(".skip");
if(skip) skip.addEventListener("click", function(e){
  e.preventDefault();
  focusHeading();
});

/* ============================================================
   시작
   ============================================================ */
setupReveal();
route();
updateTop();
parallax();
mvSetPaused(false);
sizeHero();
requestAnimationFrame(frame);
})();
