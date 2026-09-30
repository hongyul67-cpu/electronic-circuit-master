/* ══════════════════════════════════════════════════════════════
   전자회로 마스터 — 그림 모음 (그림11 · 2026-09-30)
   공용 그리기 도우미 links/fig.js 를 쓴다. index.html 의 배우기 · 수업 슬라이드가 함께 부른다.

   한 칸의 모양
     키: { cap:'캡션 한 줄', draw:function(){ … } }

   어느 그림이 어느 배우기 꼭지 · 슬라이드에 붙는지는 이 파일이 아니라
   암호문(content.js → bank.enc) 안에 적는다.
     · 배우기 — 꼭지 본문 속 <div class="figslot" data-fig="키"></div> 자리에 들어간다
     · 슬라이드 — LESSON 의 fig:'키'
   이 파일에는 직접 그린 그림과 캡션만 있다(교과서 그림을 옮기지 않았다).
   수치는 배우기 본문에 있는 것만 썼다.
   ══════════════════════════════════════════════════════════════ */
var FIGS = (function () {
  var F = window.FIG;
  if (!F) return {};
  var C = F.C;
  var t = F.t, box = F.box, line = F.line, arrow = F.arrow, callout = F.callout, poly = F.poly;
  var FONT = "'Malgun Gothic','맑은 고딕','Apple SD Gothic Neo','Noto Sans KR',system-ui,sans-serif";

  /* ── 작은 도우미 ─────────────────────────── */
  function r1(v) { return Math.round(v * 10) / 10; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function wire(pts, o) { o = o || {}; return poly(pts, { w: o.w || 2, c: o.c, dash: o.dash, flow: o.flow, close: o.close, fill: o.fill }); }
  function dot(x, y, c, r) { return '<circle cx="' + r1(x) + '" cy="' + r1(y) + '" r="' + (r || 3.6) + '" fill="' + (c || C.ink) + '"/>'; }
  function ring(x, y, r, o) {
    o = o || {};
    return '<circle cx="' + r1(x) + '" cy="' + r1(y) + '" r="' + r + '" fill="' + (o.fill || '#fff') + '" stroke="' + (o.c || C.ink) +
      '" stroke-width="' + (o.w || 1.6) + '"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') + '/>';
  }
  function term(x, y) { return ring(x, y, 4, { w: 1.6 }); }   /* 단자 ○ */

  /* 아래 첨자 글자: 'V_CE' · 'I_{B1}' 처럼 쓴다 */
  function tx(x, y, s, o) {
    o = o || {};
    var size = o.size || 16, sub = Math.round(size * 0.72), parts = [], re = /_\{([^}]*)\}|_(\S)/g, last = 0, m;
    while ((m = re.exec(s))) {
      if (m.index > last) parts.push([s.slice(last, m.index), 0]);
      parts.push([m[1] != null ? m[1] : m[2], 1]);
      last = re.lastIndex;
    }
    if (last < s.length) parts.push([s.slice(last), 0]);
    var body = '', down = false;
    parts.forEach(function (p) {
      if (p[1]) { body += '<tspan dy="' + (down ? 0 : 4) + '" font-size="' + sub + '">' + esc(p[0]) + '</tspan>'; down = true; }
      else { body += '<tspan dy="' + (down ? -4 : 0) + '">' + esc(p[0]) + '</tspan>'; down = false; }
    });
    var a = o.a === 'm' ? 'middle' : (o.a === 'e' ? 'end' : 'start');
    var el = '<text x="' + r1(x) + '" y="' + r1(y) + '" font-size="' + size + '" fill="' + (o.c || C.ink) + '" text-anchor="' + a +
      '" dominant-baseline="middle"' + (o.b ? ' font-weight="700"' : '') +
      ' paint-order="stroke" stroke="#fff" stroke-width="4" stroke-linejoin="round">' + body + '</text>';
    if (!o.ans) return el;
    /* 정답 이름표 — 슬라이드(labels:false)에서는 ? 로 가린다 */
    return '<g class="fig-ans">' + el + '</g><text class="fig-q" x="' + r1(x) + '" y="' + r1(y) + '" font-size="' + size +
      '" fill="' + C.orange + '" font-weight="700" text-anchor="' + a + '" dominant-baseline="middle">?</text>';
  }

  /* 부품을 (x1,y1)→(x2,y2) 사이에 놓는다. fn(L,o) 는 (0,0)→(L,0) 가로로 그린 부품 */
  function place(x1, y1, x2, y2, fn, o) {
    var dx = x2 - x1, dy = y2 - y1, L = Math.sqrt(dx * dx + dy * dy), a = Math.atan2(dy, dx) * 180 / Math.PI;
    return '<g transform="translate(' + r1(x1) + ' ' + r1(y1) + ') rotate(' + r1(a) + ')">' + fn(L, o || {}) + '</g>';
  }
  function lead(a, b, o) { return a < b ? line(a, 0, b, 0, { w: 2, c: o.c }) : ''; }
  /* 저항 (지그재그) */
  function resL(L, o) {
    var m = L / 2, h = o.h || 7, p = [[0, 0], [m - 18, 0]];
    for (var i = 0; i < 6; i++) p.push([m - 15 + 6 * i, i % 2 ? h : -h]);
    p.push([m + 18, 0], [L, 0]);
    return poly(p, { w: 2, c: o.c });
  }
  /* 커패시터 */
  function capL(L, o) {
    var m = L / 2, c = o.c || C.ink;
    return lead(0, m - 4, o) + lead(m + 4, L, o) + line(m - 4, -13, m - 4, 13, { w: 2.6, c: c }) + line(m + 4, -13, m + 4, 13, { w: 2.6, c: c });
  }
  /* 인덕터(코일) */
  function indL(L, o) {
    var m = L / 2, s = m - 20, d = 'M0,0 H' + r1(s);
    for (var i = 0; i < 4; i++) d += ' a5,5 0 0 1 10,0';
    d += ' H' + r1(L);
    return F.path(d, { w: 2, c: o.c });
  }
  /* 다이오드 — 시작점이 애노드, 끝점이 캐소드. kind: zener · tunnel · led · photo · varactor */
  function dioL(L, o) {
    var m = L / 2, c = o.c || C.ink, k = o.kind || '', s = '';
    s += lead(0, m - 9, o) + lead(k === 'varactor' ? m + 16 : m + 9, L, o);
    s += poly([[m - 9, -10], [m - 9, 10], [m + 9, 0]], { close: 1, fill: o.fill || c, c: c, w: 1.4 });
    if (k === 'zener') s += poly([[m + 4, -14], [m + 9, -10], [m + 9, 10], [m + 14, 14]], { w: 2.4, c: c });
    else if (k === 'tunnel') s += poly([[m + 4, -11], [m + 9, -11], [m + 9, 11], [m + 4, 11]], { w: 2.4, c: c });
    else s += line(m + 9, -11, m + 9, 11, { w: 2.4, c: c });
    if (k === 'varactor') s += line(m + 16, -11, m + 16, 11, { w: 2.4, c: c });
    if (k === 'led') s += arrow(m - 2, -14, m + 7, -27, { w: 1.4, head: 7, c: C.orange }) + arrow(m + 7, -14, m + 16, -27, { w: 1.4, head: 7, c: C.orange });
    if (k === 'photo') s += arrow(m + 5, -28, m - 3, -15, { w: 1.4, head: 7, c: C.orange }) + arrow(m + 14, -28, m + 6, -15, { w: 1.4, head: 7, c: C.orange });
    return s;
  }
  /* 전지(직류 전원) — 시작점 쪽이 (+) 긴 판 */
  function batL(L, o) {
    var m = L / 2, c = o.c || C.ink;
    return lead(0, m - 4, o) + lead(m + 4, L, o) + line(m - 4, -15, m - 4, 15, { w: 2.2, c: c }) + line(m + 4, -8, m + 4, 8, { w: 4, c: c });
  }
  /* 교류 전원 */
  function acL(L, o) {
    var m = L / 2;
    return lead(0, m - 15, o) + lead(m + 15, L, o) + ring(m, 0, 15, { w: 2 }) +
      F.path('M' + r1(m - 9) + ',0 q4.5,-9 9,0 t9,0', { w: 1.8 });
  }
  /* 스위치 — o.on 이면 닫힘 */
  function swL(L, o) {
    var m = L / 2, c = o.c || C.ink;
    return lead(0, m - 14, o) + lead(m + 14, L, o) + dot(m - 14, 0, c, 3) + dot(m + 14, 0, c, 3) +
      (o.on ? line(m - 14, 0, m + 14, -1, { w: 2.4, c: c }) : line(m - 14, 0, m + 11, -13, { w: 2.4, c: c }));
  }
  function res(x1, y1, x2, y2, o) { return place(x1, y1, x2, y2, resL, o); }
  function cap(x1, y1, x2, y2, o) { return place(x1, y1, x2, y2, capL, o); }
  function ind(x1, y1, x2, y2, o) { return place(x1, y1, x2, y2, indL, o); }
  function dio(x1, y1, x2, y2, o) { return place(x1, y1, x2, y2, dioL, o); }
  function bat(x1, y1, x2, y2, o) { return place(x1, y1, x2, y2, batL, o); }
  function ac(x1, y1, x2, y2, o) { return place(x1, y1, x2, y2, acL, o); }
  function sw(x1, y1, x2, y2, o) { return place(x1, y1, x2, y2, swL, o); }

  /* 접지 */
  function gnd(x, y, c) {
    c = c || C.ink;
    return line(x, y, x, y + 8, { w: 2, c: c }) + line(x - 11, y + 8, x + 11, y + 8, { w: 2, c: c }) +
      line(x - 7, y + 13, x + 7, y + 13, { w: 2, c: c }) + line(x - 3, y + 18, x + 3, y + 18, { w: 2, c: c });
  }
  /* 화살촉 */
  function ahead(x, y, dx, dy, s, c) {
    var a = Math.atan2(dy, dx), a1 = a + Math.PI * 0.85, a2 = a - Math.PI * 0.85;
    return '<polygon points="' + r1(x) + ',' + r1(y) + ' ' + r1(x + s * Math.cos(a1)) + ',' + r1(y + s * Math.sin(a1)) + ' ' +
      r1(x + s * Math.cos(a2)) + ',' + r1(y + s * Math.sin(a2)) + '" fill="' + c + '"/>';
  }
  /* 양극성 트랜지스터 — (x,y) 베이스 막대 부근. 단자 B(x-22,y) · C(x+14,y-34) · E(x+14,y+34)
     o.pnp · o.noBase(포토트랜지스터) · o.flipV(위아래 뒤집기 — E 가 위) */
  function bjt(x, y, o) {
    o = o || {};
    var c = o.c || C.ink, s = '';
    if (o.circle !== false) s += ring(x + 4, y, 23, { w: 1.4, c: c });
    if (!o.noBase) s += line(x - 22, y, x - 6, y, { w: 2, c: c });
    s += line(x - 6, y - 14, x - 6, y + 14, { w: 3.2, c: c }) +
      line(x - 6, y - 7, x + 14, y - 20, { w: 2, c: c }) + line(x + 14, y - 20, x + 14, y - 34, { w: 2, c: c }) +
      line(x - 6, y + 7, x + 14, y + 20, { w: 2, c: c }) + line(x + 14, y + 20, x + 14, y + 34, { w: 2, c: c });
    s += o.pnp ? ahead(x + 1, y + 10.5, -20, -13, 10, c) : ahead(x + 12, y + 18.7, 20, 13, 10, c);
    if (o.flipV) s = '<g transform="translate(0 ' + (2 * y) + ') scale(1 -1)">' + s + '</g>';
    return s;
  }
  /* MOS-FET — 단자 G(x-24,y) · 위(x+14,y-30) · 아래(x+14,y+30). o.p 면 게이트에 동그라미 */
  function mos(x, y, o) {
    o = o || {};
    var c = o.c || C.ink, s = '';
    s += line(o.p ? x - 20 : x - 24, y, x - 12, y, { w: 2, c: c }) + (o.p ? ring(x - 16, y, 4, { w: 1.6, c: c }) + line(x - 24, y, x - 20, y, { w: 2, c: c }) : '');
    s += line(x - 12, y - 15, x - 12, y + 15, { w: 2.6, c: c }) + line(x - 5, y - 18, x - 5, y + 18, { w: 3, c: c });
    s += wire([[x - 5, y - 12], [x + 14, y - 12], [x + 14, y - 30]], { c: c }) + wire([[x - 5, y + 12], [x + 14, y + 12], [x + 14, y + 30]], { c: c });
    return s;
  }
  /* 연산 증폭기 — 입력 위(x-42,y-14) · 아래(x-42,y+14) · 출력(x+44,y). 기본은 위가 (−) */
  function oa(x, y, o) {
    o = o || {};
    var c = o.c || C.ink, top = o.plusTop ? '+' : '−', bot = o.plusTop ? '−' : '+';
    return poly([[x - 30, y - 32], [x - 30, y + 32], [x + 32, y]], { close: 1, fill: o.fill || '#fff', c: c, w: 2 }) +
      line(x - 42, y - 14, x - 30, y - 14, { w: 2, c: c }) + line(x - 42, y + 14, x - 30, y + 14, { w: 2, c: c }) +
      line(x + 32, y, x + 44, y, { w: 2, c: c }) +
      t(x - 23, y - 14, top, { size: 17, b: 1, a: 'm', halo: false }) + t(x - 23, y + 13, bot, { size: 17, b: 1, a: 'm', halo: false }) +
      (o.label ? t(x - 4, y, o.label, { size: 13, a: 'm', halo: false, b: 1 }) : '');
  }
  /* 증폭기 삼각형(블록) */
  function amp(x1, y, x2, label, o) {
    o = o || {};
    var h = o.h || 34;
    return poly([[x1, y - h], [x1, y + h], [x2, y]], { close: 1, fill: o.fill || C.blueL, c: o.c || C.blue, w: 2 }) +
      t(x1 + (x2 - x1) * 0.36, y, label, { size: o.size || 15, b: 1, a: 'm', halo: false, ans: o.ans });
  }
  /* 인버터(NOT) — dir 1 오른쪽, -1 왼쪽. (x,y) = 입력 끝 */
  function inv(x, y, dir, o) {
    o = o || {};
    var d = dir || 1, w = o.w || 34, h = o.h || 16;
    return poly([[x, y - h], [x, y + h], [x + d * w, y]], { close: 1, fill: '#fff', w: 2 }) + ring(x + d * (w + 5), y, 5, { w: 1.8 });
  }
  /* 버퍼(삼각형만) */
  function buf(x, y, o) {
    o = o || {};
    var w = o.w || 32, h = o.h || 16;
    return poly([[x, y - h], [x, y + h], [x + w, y]], { close: 1, fill: o.fill || '#fff', w: 2, c: o.c });
  }
  /* 파형: fn(u) u∈[0,1] → -1~1. (x0..x1, 가운데 y0, 진폭 amp) */
  function plot(fn, x0, x1, y0, amp, o) {
    o = o || {};
    var n = o.n || 240, p = [];
    for (var i = 0; i <= n; i++) { var u = i / n; p.push([x0 + (x1 - x0) * u, y0 - amp * fn(u)]); }
    return poly(p, { w: o.w || 2.4, c: o.c || C.blue, dash: o.dash });
  }
  /* 좌표축 */
  function axes(x0, y0, x1, y1, xl, yl, o) {
    o = o || {};
    return arrow(x0, y0, x1, y0, { w: 1.6, head: 9, c: C.ink }) + arrow(x0, o.yb || y0, x0, y1, { w: 1.6, head: 9, c: C.ink }) +
      (xl ? tx(x1, y0 + 16, xl, { a: 'e', size: 14 }) : '') + (yl ? tx(x0 + 8, y1 + 4, yl, { size: 14 }) : '');
  }
  function sin(u, k) { return Math.sin(2 * Math.PI * u * (k || 1)); }
  function guide(x1, y1, x2, y2) { return line(x1, y1, x2, y2, { w: 1, c: C.sub, dash: '4 4' }); }
  function motor(x, y, r) { return ring(x, y, r || 17, { fill: C.grayL, w: 2 }) + t(x, y + 1, 'M', { a: 'm', b: 1, halo: false }); }
  function cross(x, y, s, c) { s = s || 7; c = c || C.red; return line(x - s, y - s, x + s, y + s, { w: 2.6, c: c }) + line(x - s, y + s, x + s, y - s, { w: 2.6, c: c }); }

  return {

  /* ═════════════ Ⅰ. 반도체 소자와 집적 회로 ═════════════ */

  atom: {
    cap: '원자 — 가장 바깥 궤도(가전자대)의 가전자는 힘이 약해 에너지를 받으면 자유 전자가 된다',
    draw: function () {
      var cx = 150, cy = 150, s = '';
      s += ring(cx, cy, 108, { fill: 'none', c: C.blue, w: 2.4 }) + ring(cx, cy, 72, { fill: 'none', c: C.line, w: 1.4 }) +
        ring(cx, cy, 40, { fill: 'none', c: C.line, w: 1.4 });
      s += ring(cx, cy, 20, { fill: C.redL, c: C.red, w: 1.8 }) + t(cx, cy + 1, '+', { a: 'm', b: 1, c: C.red, size: 20, halo: false });
      function e(r, deg, c) { var a = deg * Math.PI / 180; return dot(cx + r * Math.cos(a), cy + r * Math.sin(a), c || C.ink, 6); }
      s += e(40, 0) + e(40, 180);
      s += e(72, 45) + e(72, 135) + e(72, 225) + e(72, 315);
      s += e(108, 60, C.blue) + e(108, 150, C.blue) + e(108, 230, C.blue);
      var a = -35 * Math.PI / 180, ex = cx + 108 * Math.cos(a), ey = cy + 108 * Math.sin(a);
      s += ring(ex, ey, 6, { fill: '#fff', c: C.blue, dash: '3 2', w: 1.4 });
      s += arrow(ex + 8, ey - 6, 318, 50, { c: C.orange, w: 2.2 }) + dot(330, 44, C.blue, 7);
      s += t(346, 44, '자유 전자', { b: 1, c: C.blue, ans: 1 });
      s += t(300, 92, '에너지를 받아\n궤도를 벗어남', { size: 13, c: C.orange });
      s += callout(cx + 40, cy, 300, 138, '속박 전자', { ans: 1 });
      s += callout(cx + 16, cy + 10, 300, 172, '원자핵 (+)', { ans: 1 });
      s += callout(cx + 101.5, cy + 37, 300, 208, '가전자대 (가장 바깥 궤도)', { c: C.blue, tc: C.blue });
      s += callout(cx + 54, cy + 93.5, 300, 250, '가전자', { c: C.blue, tc: C.blue, b: 1, ans: 1 });
      return F.svg(480, 290, s);
    } },

  band: {
    cap: '에너지 갭 — 도체는 겹쳐 있고, 반도체는 약 1 eV, 부도체는 약 5 eV 로 벌어져 있다',
    draw: function () {
      var s = '', xs = [110, 250, 390], names = ['도체', '반도체', '부도체'];
      s += arrow(26, 232, 26, 40, { w: 1.6, head: 9 }) + t(26, 28, '에너지', { a: 'm', size: 13 });
      var cond = [[130, 188], [104, 150], [44, 84]];
      for (var i = 0; i < 3; i++) {
        var x = xs[i];
        s += t(x, 24, names[i], { a: 'm', b: 1, size: 17 });
        s += box(x - 55, 170, 110, 50, { fill: C.blueL, c: C.blue, r: 4 }) + t(x, 208, '가전자대', { a: 'm', size: 14, c: C.blue, halo: false });
        s += '<g opacity="0.85">' + box(x - 55, cond[i][0], 110, cond[i][1] - cond[i][0], { fill: C.orangeL, c: C.orange, r: 4 }) + '</g>' +
          t(x, cond[i][0] + 16, '전도대', { a: 'm', size: 14, c: C.orange, halo: false });
      }
      /* 도체 — 겹침 */
      s += dot(80, 158, C.blue, 4) + dot(104, 164, C.blue, 4) + dot(132, 156, C.blue, 4) + dot(146, 166, C.blue, 4);
      s += t(110, 250, '갭 없이 겹침', { a: 'm', size: 14, b: 1, ans: 1 }) + t(110, 272, '자유롭게 이동', { a: 'm', size: 13, c: C.sub });
      /* 반도체 */
      s += t(262, 160, '약 1 eV', { size: 14, b: 1, c: C.purple, ans: 1 });
      s += arrow(222, 176, 222, 144, { c: C.green, w: 2, head: 8 }) + dot(222, 180, C.blue, 4);
      s += t(250, 250, '적은 에너지로 이동', { a: 'm', size: 14, b: 1 }) + t(250, 272, 'Si 1.12 · Ge 0.67 eV', { a: 'm', size: 13, c: C.sub });
      /* 부도체 */
      s += line(425, 86, 425, 168, { w: 1.2, c: C.purple }) + t(398, 127, '약 5 eV', { a: 'm', size: 14, b: 1, c: C.purple, ans: 1 });
      s += arrow(362, 176, 362, 128, { c: C.red, w: 2, head: 8, dash: '4 3' }) + cross(362, 116, 6) + dot(362, 180, C.blue, 4);
      s += t(390, 250, '큰 에너지에도', { a: 'm', size: 14, b: 1 }) + t(390, 272, '이동 못 함', { a: 'm', size: 13, c: C.sub });
      return F.svg(480, 290, s);
    } },

  doping: {
    cap: '불순물 반도체 — Ⅴ족을 넣으면 전자가 남고(n형), Ⅲ족을 넣으면 빈자리 정공이 생긴다(p형)',
    draw: function () {
      var s = line(240, 16, 240, 284, { c: C.grayM, w: 1.4, dash: '6 5' });
      function panel(cx, center, cc, fill) {
        var o = '', X = [cx - 58, cx, cx + 58], Y = [96, 154, 212];
        for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) {
          if (j < 2) { var y = Y[i], xa = X[j] + 16, xb = X[j + 1] - 16; o += line(xa, y, xb, y, { c: C.line, w: 2 }); }
          if (i < 2) { var x = X[j], ya = Y[i] + 16, yb = Y[i + 1] - 16; o += line(x, ya, x, yb, { c: C.line, w: 2 }); }
        }
        for (i = 0; i < 3; i++) for (j = 0; j < 2; j++) {
          var mx = (X[j] + X[j + 1]) / 2;
          o += dot(mx - 5, Y[i], C.blue, 3.2) + dot(mx + 5, Y[i], C.blue, 3.2);
          var my = (Y[j] + Y[j + 1]) / 2;
          o += dot(X[i], my - 5, C.blue, 3.2) + dot(X[i], my + 5, C.blue, 3.2);
        }
        for (i = 0; i < 3; i++) for (j = 0; j < 3; j++) {
          var ctr = i === 1 && j === 1;
          o += ring(X[j], Y[i], 16, { fill: ctr ? fill : C.grayL, c: ctr ? cc : C.ink, w: ctr ? 2.2 : 1.4 }) +
            t(X[j], Y[i] + 1, ctr ? center : 'Si', { a: 'm', size: ctr ? 16 : 13, b: ctr, c: ctr ? cc : C.ink, halo: false });
        }
        return o;
      }
      s += panel(120, 'P', C.orange, C.orangeL) + panel(360, 'B', C.purple, C.purpleL);
      s += t(120, 24, 'n형 반도체', { a: 'm', b: 1, size: 17, c: C.blue }) + t(120, 50, 'Ⅴ족(인 P) = 도너', { a: 'm', size: 13, c: C.sub, ans: 1 });
      s += t(360, 24, 'p형 반도체', { a: 'm', b: 1, size: 17, c: C.red }) + t(360, 50, 'Ⅲ족(붕소 B) = 억셉터', { a: 'm', size: 13, c: C.sub, ans: 1 });
      /* 남는 전자 */
      s += ring(148, 182, 9, { fill: 'none', c: C.orange, w: 1.6, dash: '3 2' }) + dot(148, 182, C.blue, 5);
      s += callout(152, 188, 150, 244, '남는 전자', { c: C.blue, tc: C.blue, b: 1, a: 'm', ans: 1 });
      /* 정공 */
      s += '<circle cx="' + 386 + '" cy="154" r="7" fill="#fff"/>' + ring(386, 154, 5, { fill: '#fff', c: C.red, w: 2 });
      s += callout(386, 160, 392, 244, '정공 (빈자리)', { c: C.red, tc: C.red, b: 1, a: 'm', ans: 1 });
      s += t(120, 272, '다수 반송자 = 전자', { a: 'm', b: 1, size: 15, c: C.blue, ans: 1 });
      s += t(360, 272, '다수 반송자 = 정공', { a: 'm', b: 1, size: 15, c: C.red, ans: 1 });
      return F.svg(480, 292, s);
    } },

  'pn-junction': {
    cap: 'p-n 접합 — 접합면에서 전자·정공이 만나 사라진 곳이 공핍층, 거기에 전위 장벽이 생긴다',
    draw: function () {
      var s = '';
      s += box(30, 60, 210, 80, { fill: C.redL, c: C.red, r: 0, w: 1.6 }) + box(240, 60, 210, 80, { fill: C.blueL, c: C.blue, r: 0, w: 1.6 });
      s += '<rect x="204" y="61" width="72" height="78" fill="#fff"/>' + line(204, 60, 204, 140, { w: 1.4, dash: '5 4', c: C.ink }) + line(276, 60, 276, 140, { w: 1.4, dash: '5 4', c: C.ink });
      s += t(118, 42, 'p형', { a: 'm', b: 1, size: 17, c: C.red }) + t(362, 42, 'n형', { a: 'm', b: 1, size: 17, c: C.blue }) +
        t(240, 42, '공핍층', { a: 'm', b: 1, size: 16, c: C.orange, ans: 1 });
      var hp = [[50, 78], [84, 104], [60, 124], [110, 76], [140, 118], [120, 98], [170, 84], [184, 122], [96, 132]];
      hp.forEach(function (p) { s += ring(p[0], p[1], 5, { fill: '#fff', c: C.red, w: 1.8 }); });
      var en = [[296, 80], [330, 110], [310, 128], [352, 78], [380, 120], [372, 96], [410, 84], [430, 118], [344, 132]];
      en.forEach(function (p) { s += dot(p[0], p[1], C.blue, 5); });
      [78, 100, 122].forEach(function (y) {
        s += ring(222, y, 8, { fill: C.grayL, w: 1.2 }) + t(222, y + 1, '−', { a: 'm', size: 15, b: 1, halo: false });
        s += ring(258, y, 8, { fill: C.grayL, w: 1.2 }) + t(258, y, '+', { a: 'm', size: 15, b: 1, halo: false });
      });
      s += t(118, 158, '○ 정공(다수)', { a: 'm', size: 13, c: C.red }) + t(362, 158, '● 전자(다수)', { a: 'm', size: 13, c: C.blue });
      /* 전위 장벽 */
      s += F.path('M30,240 H204 C236,240 244,196 276,196 H450', { w: 2.6, c: C.purple });
      s += arrow(310, 240, 310, 199, { both: 1, w: 1.2, head: 8, c: C.purple }) + guide(276, 240, 330, 240);
      s += t(322, 212, '전위 장벽', { b: 1, c: C.purple, ans: 1 }) + t(322, 234, 'Si 0.7 V · Ge 0.3 V', { size: 13, c: C.purple, ans: 1 });
      s += t(30, 186, '전위', { size: 13, c: C.sub });
      return F.svg(480, 262, s);
    } },

  'pn-bias': {
    cap: '바이어스 — 순방향이면 공핍층이 좁아져 전류가 흐르고(ON), 역방향이면 넓어져 막힌다(OFF)',
    draw: function () {
      var s = '';
      function row(y0, fwd) {
        var o = '', dw = fwd ? 16 : 76, cx = 240;
        o += t(16, y0 + 12, fwd ? '순방향 바이어스' : '역방향 바이어스', { b: 1, size: 16 });
        o += t(464, y0 + 12, fwd ? '공핍층 좁아짐 → 전류 흐름 (ON)' : '공핍층 넓어짐 → 흐르지 못함 (OFF)', { a: 'e', size: 14, b: 1, c: fwd ? C.green : C.red, ans: 1 });
        o += box(110, y0 + 30, 130, 50, { fill: C.redL, c: C.red, r: 0 }) + box(240, y0 + 30, 130, 50, { fill: C.blueL, c: C.blue, r: 0 });
        o += '<rect x="' + (cx - dw / 2) + '" y="' + (y0 + 31) + '" width="' + dw + '" height="48" fill="#fff"/>' +
          line(cx - dw / 2, y0 + 30, cx - dw / 2, y0 + 80, { w: 1.2, dash: '4 3' }) + line(cx + dw / 2, y0 + 30, cx + dw / 2, y0 + 80, { w: 1.2, dash: '4 3' });
        o += t(140, y0 + 44, 'p', { a: 'm', b: 1, c: C.red, size: 17 }) + t(340, y0 + 44, 'n', { a: 'm', b: 1, c: C.blue, size: 17 });
        o += t(cx, y0 + 93, '공핍층', { a: 'm', size: 13, c: C.orange, b: 1 });
        if (fwd) o += arrow(126, y0 + 64, 354, y0 + 64, { c: C.green, w: 3.2, head: 12, flow: true });
        else o += cross(cx, y0 + 60, 9);
        o += wire([[110, y0 + 55], [80, y0 + 55], [80, y0 + 128], [200, y0 + 128]]) + wire([[280, y0 + 128], [400, y0 + 128], [400, y0 + 55], [370, y0 + 55]]);
        o += fwd ? bat(200, y0 + 128, 280, y0 + 128) : bat(280, y0 + 128, 200, y0 + 128);
        o += t(fwd ? 222 : 258, y0 + 114, '+', { a: 'm', b: 1, size: 16, c: C.red, ans: 1 }) + t(fwd ? 258 : 222, y0 + 114, '−', { a: 'm', b: 1, size: 16, c: C.blue, ans: 1 });
        return o;
      }
      s += row(6, true) + line(16, 158, 464, 158, { c: C.edge, w: 1.4 }) + row(164, false);
      return F.svg(480, 314, s);
    } },

  'diode-iv': {
    cap: '다이오드 — 애노드(A)→캐소드(K) 쪽으로만 흐르고, 실리콘은 약 0.7 V 부터 전류가 급증한다',
    draw: function () {
      var s = '';
      s += dio(22, 100, 150, 100, { c: C.ink });
      s += t(22, 124, 'A', { a: 'm', b: 1 }) + t(22, 144, '애노드', { a: 'm', size: 13, c: C.sub }) +
        t(150, 124, 'K', { a: 'm', b: 1 }) + t(150, 144, '캐소드', { a: 'm', size: 13, c: C.sub });
      s += arrow(40, 66, 132, 66, { c: C.green, w: 2.2 }) + t(86, 48, '순방향 전류', { a: 'm', size: 14, c: C.green, b: 1 });
      s += t(86, 188, '정류 작용', { a: 'm', b: 1, size: 16 }) + t(86, 210, '한쪽 방향으로만 흐름', { a: 'm', size: 13, c: C.sub });
      /* 특성 곡선 */
      var ox = 318, oy = 168;
      s += arrow(190, oy, 468, oy, { w: 1.6, head: 9 }) + arrow(ox, 256, ox, 30, { w: 1.6, head: 9 });
      s += t(466, oy + 16, 'V', { a: 'e', size: 14 }) + t(ox + 8, 34, 'I', { size: 14 });
      s += F.path('M' + ox + ',' + oy + ' C340,168 352,166 360,150 C366,136 370,90 374,40', { w: 2.6, c: C.blue });
      s += F.path('M' + ox + ',' + oy + ' L234,171 C224,172 220,190 214,254', { w: 2.6, c: C.red });
      s += guide(360, 150, 360, 168) + t(360, 184, '0.7 V', { a: 'm', size: 13, b: 1 });
      s += t(396, 96, '순방향', { b: 1, size: 14, c: C.blue });
      s += t(272, 150, '역방향 — 거의 0', { a: 'm', size: 13, c: C.red });
      s += callout(218, 214, 250, 232, '항복 전압', { c: C.red, tc: C.red, b: 1 });
      return F.svg(480, 270, s);
    } },

  'diode-syms': {
    cap: '다이오드 기호 모음 — 무슨 성질을 쓰느냐에 따라 기호가 조금씩 다르다',
    draw: function () {
      var s = '', list = [['정류 다이오드', '정류', ''], ['제너 다이오드', '정전압', 'zener'], ['터널(에사키)', '음저항 · 발진', 'tunnel'],
        ['발광 다이오드(LED)', '표시 · 조명', 'led'], ['포토 다이오드', '광 검출', 'photo'], ['버랙터(가변 용량)', '동조 · 주파수 변조', 'varactor']];
      list.forEach(function (d, i) {
        var cx = 80 + (i % 3) * 160, cy = 58 + Math.floor(i / 3) * 118;
        s += dio(cx - 52, cy, cx + 52, cy, { kind: d[2] });
        s += t(cx, cy + 36, d[0], { a: 'm', b: 1, size: 14 }) + t(cx, cy + 56, d[1], { a: 'm', size: 13, c: C.sub });
      });
      s += line(160, 16, 160, 240, { c: C.edge, w: 1.2 }) + line(320, 16, 320, 240, { c: C.edge, w: 1.2 }) + line(16, 124, 464, 124, { c: C.edge, w: 1.2 });
      return F.svg(480, 254, s);
    } },

  bjt: {
    cap: 'BJT — p-n 접합이 2개. 베이스는 아주 좁고, 기호의 이미터 화살표가 전류 방향이다',
    draw: function () {
      var s = t(18, 26, 'npn 구조', { b: 1, size: 16 });
      s += box(40, 90, 80, 50, { fill: C.blueL, c: C.blue, r: 0 }) + box(120, 90, 20, 50, { fill: C.redL, c: C.red, r: 0 }) + box(140, 90, 80, 50, { fill: C.blueL, c: C.blue, r: 0 });
      s += t(80, 115, 'n', { a: 'm', b: 1, c: C.blue, size: 17 }) + t(130, 115, 'p', { a: 'm', b: 1, c: C.red, size: 16, halo: false }) + t(180, 115, 'n', { a: 'm', b: 1, c: C.blue, size: 17 });
      s += wire([[40, 115], [24, 115]]) + wire([[220, 115], [236, 115]]) + wire([[130, 90], [130, 60]]);
      s += t(26, 160, 'E', { a: 'm', b: 1 }) + t(26, 180, '이미터', { a: 'm', size: 13, c: C.sub }) +
        t(234, 160, 'C', { a: 'm', b: 1 }) + t(234, 180, '컬렉터', { a: 'm', size: 13, c: C.sub }) +
        t(130, 48, 'B 베이스', { a: 'm', b: 1, size: 15 });
      s += callout(130, 140, 130, 176, '베이스는 매우 좁다', { a: 'm', c: C.red, tc: C.red });
      s += line(272, 20, 272, 204, { c: C.edge, w: 1.2 });
      [[330, 'npn', false], [424, 'pnp', true]].forEach(function (q) {
        var x = q[0], y = 112;
        s += t(x + 4, 50, q[1], { a: 'm', b: 1, size: 16 });
        s += bjt(x, y, { pnp: q[2] });
        s += t(x + 24, y - 34, 'C', { size: 14, b: 1 }) + t(x - 30, y - 12, 'B', { size: 14, b: 1, a: 'm' }) + t(x + 24, y + 34, 'E', { size: 14, b: 1 });
      });
      s += t(376, 176, '화살표 = 전류 방향', { a: 'm', size: 13, c: C.red, b: 1 }) + t(376, 196, '(npn 과 pnp 는 반대)', { a: 'm', size: 13, c: C.sub });
      s += line(16, 214, 464, 214, { c: C.edge, w: 1.2 });
      s += tx(240, 246, 'I_E = I_C + I_B', { a: 'm', b: 1, size: 20 }) + tx(240, 274, '(I_B 는 아주 작아 보통 무시)', { a: 'm', size: 13, c: C.sub });
      return F.svg(480, 292, s);
    } },

  fet: {
    cap: 'FET — 게이트 전압이 채널 폭을 바꿔 드레인 전류를 조절한다(전압 제어)',
    draw: function () {
      var s = '';
      function panel(y0, dep, title, res, wI, cI) {
        var o = tx(16, y0 + 12, title, { b: 1, size: 15 });
        o += box(90, y0 + 40, 240, 56, { fill: C.blueL, c: C.blue, r: 0 });
        o += box(170, y0 + 26, 80, 14, { fill: C.redL, c: C.red, r: 2, w: 1.2 }) + box(170, y0 + 96, 80, 14, { fill: C.redL, c: C.red, r: 2, w: 1.2 });
        o += F.path('M166,' + (y0 + 41) + ' Q210,' + (y0 + 41 + dep * 2) + ' 254,' + (y0 + 41) + ' Z', { fill: '#fff', c: C.ink, w: 1.2, dash: '4 3' });
        o += F.path('M166,' + (y0 + 95) + ' Q210,' + (y0 + 95 - dep * 2) + ' 254,' + (y0 + 95) + ' Z', { fill: '#fff', c: C.ink, w: 1.2, dash: '4 3' });
        o += wire([[90, y0 + 68], [66, y0 + 68]]) + wire([[330, y0 + 68], [354, y0 + 68]]) + wire([[210, y0 + 26], [210, y0 + 14]]);
        o += t(56, y0 + 68, 'S', { a: 'm', b: 1 }) + t(364, y0 + 68, 'D', { a: 'm', b: 1 }) + t(224, y0 + 12, 'G', { b: 1 });
        o += arrow(104, y0 + 68, 318, y0 + 68, { c: C.green, w: wI, head: 8 + wI });
        o += t(392, y0 + 56, res[0], { size: 14, b: 1, c: cI }) + tx(392, y0 + 80, res[1], { size: 14, b: 1, c: cI });
        return o;
      }
      s += panel(4, 4, '① 게이트 전압 V_{GS} = 0 V', ['채널 넓음', 'I_D 큼'], 4.4, C.green);
      s += line(16, 132, 464, 132, { c: C.edge, w: 1.2 });
      s += panel(136, 11, '② 게이트 역방향 전압 ↑', ['채널 좁음', 'I_D 작음'], 1.6, C.red);
      s += box(40, 262, 400, 38, { fill: C.yellowL, c: C.orange, r: 8, w: 1.2 }) +
        t(240, 281, 'BJT = 전류 제어   ·   FET = 전압 제어', { a: 'm', b: 1, size: 16, halo: false });
      return F.svg(480, 312, s);
    } },

  cmos: {
    cap: 'CMOS — PMOS 와 NMOS 가 짝. 입력이 H 면 출력 L, 입력이 L 면 출력 H (인버터)',
    draw: function () {
      var s = '';
      s += line(150, 36, 230, 36, { w: 2.4 }) + tx(236, 36, 'V_{DD}', { size: 14, b: 1 });
      s += mos(180, 96, { p: true }) + mos(180, 190, {});
      s += wire([[194, 66], [194, 36]]) + wire([[194, 126], [194, 160]]) + wire([[194, 220], [194, 234]]) + gnd(194, 234);
      s += wire([[156, 96], [130, 96], [130, 190], [156, 190]]) + wire([[70, 143], [130, 143]]) + dot(130, 143);
      s += term(66, 143) + t(60, 122, '입력', { a: 'm', b: 1, size: 15 });
      s += wire([[194, 143], [252, 143]]) + dot(194, 143) + term(256, 143) + t(256, 122, '출력', { a: 'm', b: 1, size: 15 });
      s += t(214, 88, 'PMOS', { size: 14, b: 1, c: C.red }) + t(214, 200, 'NMOS', { size: 14, b: 1, c: C.blue });
      /* 표 */
      var X = [306, 356, 410, 456];
      ['입력', 'PMOS', 'NMOS', '출력'].forEach(function (h, i) { s += t(X[i], 76, h, { a: 'm', b: 1, size: 14 }); });
      s += line(284, 90, 474, 90, { w: 1.2, c: C.line });
      var rows = [['H', 'OFF', 'ON', 'L'], ['L', 'ON', 'OFF', 'H']];
      rows.forEach(function (r, j) {
        var y = 114 + j * 34;
        r.forEach(function (v, i) {
          var c = v === 'ON' ? C.green : (v === 'OFF' ? C.sub : C.ink);
          s += t(X[i], y, v, { a: 'm', b: 1, size: 16, c: i === 3 ? C.orange : c });
        });
      });
      s += t(380, 208, '둘이 동시에 ON 인 것은', { a: 'm', size: 13, c: C.sub }) + t(380, 228, '바뀌는 순간뿐', { a: 'm', size: 13, c: C.sub }) +
        t(380, 252, '→ 전력 소모 극히 적음', { a: 'm', size: 14, b: 1, c: C.green });
      return F.svg(480, 272, s);
    } },

  ujt: {
    cap: 'UJT — n형 막대 양끝이 B1·B2, 가운데 p형이 이미터. 부성저항 구간이 생긴다',
    draw: function () {
      var s = t(80, 22, '구조', { a: 'm', b: 1 });
      s += box(62, 48, 30, 164, { fill: C.blueL, c: C.blue, r: 2 }) + box(92, 116, 16, 26, { fill: C.redL, c: C.red, r: 2 });
      s += wire([[77, 48], [77, 34]]) + wire([[77, 212], [77, 230]]) + wire([[108, 129], [136, 129]]);
      s += t(62, 36, 'B2', { a: 'e', b: 1, size: 14 }) + t(62, 226, 'B1', { a: 'e', b: 1, size: 14 }) + t(140, 129, 'E', { b: 1, size: 14 });
      s += callout(70, 90, 30, 90, 'n', { a: 'e', c: C.blue, tc: C.blue, b: 1 }) + callout(100, 142, 124, 170, 'p', { c: C.red, tc: C.red, b: 1 });
      s += t(210, 22, '기호', { a: 'm', b: 1 });
      s += line(215, 84, 215, 156, { w: 3.2 }) + wire([[215, 94], [242, 94], [242, 60]]) + wire([[215, 146], [242, 146], [242, 180]]);
      s += line(172, 168, 212, 134, { w: 2 }) + ahead(212, 134, 40, -34, 10, C.ink);
      s += t(254, 64, 'B2', { size: 14, b: 1 }) + t(254, 176, 'B1', { size: 14, b: 1 }) + t(164, 176, 'E', { size: 14, b: 1, a: 'm' });
      /* 특성 */
      var ox = 300, oy = 226;
      s += arrow(ox, oy, 468, oy, { w: 1.6, head: 9 }) + arrow(ox, oy, ox, 40, { w: 1.6, head: 9 });
      s += tx(466, oy + 16, 'I_E', { a: 'e', size: 14 }) + tx(ox + 8, 44, 'V_E', { size: 14 });
      s += F.path('M300,210 C318,160 326,96 336,86 C344,80 350,96 362,130 C376,170 392,186 404,188 C426,190 444,180 462,168', { w: 2.6, c: C.blue });
      s += F.path('M340,84 C348,92 352,104 362,130 C376,170 392,186 404,188', { w: 5, c: C.orange });
      s += guide(336, 86, ox, 86) + tx(ox - 4, 86, 'V_P', { a: 'e', size: 13, b: 1 });
      s += t(392, 138, '부성저항', { b: 1, c: C.orange, size: 15 });
      s += t(384, 252, '전압↑인데 전류↓ 구간', { a: 'm', size: 13, c: C.sub });
      return F.svg(480, 268, s);
    } },

  scr: {
    cap: 'SCR — pnpn 4층. 게이트에 펄스가 들어오면 도통하고, A-K 극성이 바뀌면 차단된다',
    draw: function () {
      var s = t(140, 30, 'pnpn 4층 구조', { a: 'm', b: 1 });
      var L = [['p', C.redL, C.red], ['n', C.blueL, C.blue], ['p', C.redL, C.red], ['n', C.blueL, C.blue]];
      L.forEach(function (q, i) { s += box(40 + i * 50, 66, 50, 52, { fill: q[1], c: q[2], r: 0 }) + t(65 + i * 50, 92, q[0], { a: 'm', b: 1, c: q[2], size: 17, halo: false }); });
      s += wire([[40, 92], [18, 92]]) + wire([[240, 92], [262, 92]]) + wire([[165, 118], [165, 148]]);
      s += t(18, 74, 'A', { a: 'm', b: 1 }) + t(262, 74, 'K', { a: 'm', b: 1 }) + t(165, 164, 'G', { a: 'm', b: 1 });
      s += line(292, 22, 292, 176, { c: C.edge, w: 1.2 });
      s += t(384, 30, '기호', { a: 'm', b: 1 });
      s += dio(318, 92, 450, 92, {}) + line(393, 102, 412, 136, { w: 2 }) + wire([[412, 136], [436, 136]]);
      s += t(318, 72, 'A 양극', { a: 'm', b: 1, size: 14 }) + t(450, 72, 'K 음극', { a: 'm', b: 1, size: 14 }) + t(444, 152, 'G', { b: 1, size: 14 });
      s += box(24, 190, 432, 40, { fill: C.greenL, c: C.green, r: 8, w: 1.2 }) +
        t(240, 210, '게이트 펄스 → 도통 (ON)  ·  A-K 극성 바뀜 → 차단', { a: 'm', b: 1, size: 15, halo: false });
      return F.svg(480, 246, s);
    } },

  'ic-process': {
    cap: 'IC 제조 공정 5단계 — 회로 설계 → 마스크 제작 → 웨이퍼 가공 → 조립 → 검사',
    draw: function () {
      var s = '', names = ['회로 설계', '마스크 제작', '웨이퍼 가공', '조립', '검사'];
      for (var i = 0; i < 5; i++) {
        var x = 8 + i * 94, cx = x + 40;
        s += box(x, 16, 80, 84, { fill: i % 2 ? C.blueL : C.grayL, c: i % 2 ? C.blue : C.line, r: 8, w: 1.4 });
        s += F.num(x + 10, 16, i + 1, { c: C.blue });
        if (i === 0) s += res(cx - 26, 46, cx + 26, 46, { h: 6 }) + wire([[cx - 26, 46], [cx - 26, 76], [cx + 26, 76], [cx + 26, 46]]) + dot(cx, 76);
        if (i === 1) { s += box(cx - 24, 34, 48, 48, { fill: '#fff', c: C.ink, r: 2, w: 1.4 }); for (var k = 0; k < 3; k++) s += box(cx - 18 + k * 13, 42 + (k % 2) * 8, 9, 24, { fill: C.ink, c: C.ink, r: 1, w: 1 }); }
        if (i === 2) { s += '<circle cx="' + cx + '" cy="58" r="27" fill="' + C.grayM + '" stroke="' + C.ink + '" stroke-width="1.6"/>'; for (k = -2; k <= 2; k++) s += line(cx + k * 10, 36 + Math.abs(k) * 2, cx + k * 10, 80 - Math.abs(k) * 2, { w: 1, c: '#fff' }) + line(cx - 22 + Math.abs(k) * 2, 58 + k * 10, cx + 22 - Math.abs(k) * 2, 58 + k * 10, { w: 1, c: '#fff' }); }
        if (i === 3) { s += box(cx - 20, 36, 40, 44, { fill: C.ink, c: C.ink, r: 3 }); for (k = 0; k < 4; k++) s += line(cx - 28, 42 + k * 10, cx - 20, 42 + k * 10, { w: 2.4 }) + line(cx + 20, 42 + k * 10, cx + 28, 42 + k * 10, { w: 2.4 }); }
        if (i === 4) s += ring(cx - 6, 52, 15, { w: 2.4 }) + line(cx + 5, 63, cx + 20, 80, { w: 4 }) + wire([[cx - 13, 52], [cx - 7, 58], [cx + 2, 45]], { c: C.green, w: 2.6 });
        s += t(cx, 120, names[i], { a: 'm', b: 1, size: 14, ans: i === 1 || i === 2 });
        if (i < 4) s += arrow(x + 81, 58, x + 93, 58, { head: 8, w: 1.8, c: C.orange });
      }
      return F.svg(480, 140, s);
    } },

  'ic-scale': {
    cap: '집적도 — 한 칩에 넣은 소자 수에 따라 SSI → MSI → LSI → VLSI → ULSI',
    draw: function () {
      var s = '', n = ['SSI', 'MSI', 'LSI', 'VLSI', 'ULSI'], c = ['99개\n이하', '100~\n999개', '1,000~\n99,999개', '100,000~\n999,999개', '100만 개\n이상'];
      var h = [44, 74, 104, 134, 164], fill = [C.blueL, C.blueL, C.blueL, C.purpleL, C.purpleL];
      for (var i = 0; i < 5; i++) {
        var x = 26 + i * 90, top = 222 - h[i];
        s += box(x, top, 80, h[i], { fill: fill[i], c: i > 2 ? C.purple : C.blue, r: 4 });
        s += t(x + 40, top - 14, n[i], { a: 'm', b: 1, size: 17 });
        s += t(x + 40, top + 22, c[i], { a: 'm', size: 13, halo: false, v: 'top' });
      }
      s += line(16, 222, 464, 222, { w: 2 });
      s += arrow(40, 246, 440, 246, { c: C.orange, w: 2 }) + t(240, 262, '소자 수가 많아짐 (집적도 ↑)', { a: 'm', size: 13, b: 1, c: C.orange });
      return F.svg(480, 276, s);
    } },

  'sram-dram': {
    cap: 'RAM 의 두 셀 — DRAM 은 커패시터 전하가 새어 리프레시가 필요하고, SRAM 은 플립플롭이 값을 붙잡는다',
    draw: function () {
      var s = t(120, 22, 'DRAM', { a: 'm', b: 1, size: 17, c: C.blue }) + t(120, 44, 'MOS-FET + 커패시터', { a: 'm', size: 13, c: C.sub });
      s += line(40, 64, 40, 214, { w: 2.2 }) + t(40, 226, '비트선', { a: 'm', size: 13 });
      s += mos(130, 116, {}) + wire([[144, 86], [144, 72], [40, 72]]) + dot(40, 72);
      s += wire([[106, 116], [70, 116]]) + t(66, 116, '워드선', { a: 'e', size: 13 });
      s += wire([[144, 146], [144, 160]]) + cap(144, 160, 144, 196) + gnd(144, 196);
      s += arrow(160, 172, 186, 164, { c: C.red, w: 1.6, head: 7 }) + arrow(160, 184, 186, 192, { c: C.red, w: 1.6, head: 7 });
      s += t(192, 160, '전하가', { size: 13, c: C.red }) + t(192, 178, '샌다', { size: 13, c: C.red });
      s += box(102, 214, 136, 30, { fill: C.redL, c: C.red, r: 6, w: 1.2 }) + t(170, 229, '→ 리프레시 필요', { a: 'm', b: 1, size: 14, c: C.red, halo: false, ans: 1 });
      s += line(252, 16, 252, 256, { c: C.edge, w: 1.2 });
      s += t(366, 22, 'SRAM', { a: 'm', b: 1, size: 17, c: C.green }) + t(366, 44, '플립플롭', { a: 'm', size: 13, c: C.sub });
      s += inv(330, 100, 1) + inv(402, 170, -1);
      s += wire([[374, 100], [428, 100], [428, 170], [402, 170]]) + wire([[358, 170], [300, 170], [300, 100], [330, 100]]);
      s += dot(428, 135) + dot(300, 135) + t(440, 135, 'Q', { b: 1, size: 15 }) + t(288, 135, 'Q', { a: 'e', b: 1, size: 15 }) + line(277, 124, 288, 124, { w: 1.6 });
      s += t(366, 136, '서로 붙잡음', { a: 'm', size: 13, c: C.green, b: 1 });
      s += box(292, 214, 148, 30, { fill: C.greenL, c: C.green, r: 6, w: 1.2 }) + t(366, 229, '빠름 → 캐시 메모리', { a: 'm', b: 1, size: 14, c: C.green, halo: false });
      s += t(240, 270, '둘 다 휘발성 — 전원을 끄면 사라진다', { a: 'm', size: 13, c: C.sub });
      return F.svg(480, 286, s);
    } },

  /* ═════════════ Ⅱ. 직류 전원 회로 ═════════════ */

  'dc-supply': {
    cap: '직류 전원 회로 4단계 — 교류가 단계를 지날 때마다 파형이 이렇게 바뀐다',
    draw: function () {
      var s = t(12, 16, '교류 220 V 60 Hz', { size: 13, c: C.sub }) + t(468, 16, '안정된 직류', { a: 'e', size: 13, c: C.sub });
      var names = ['변압 회로', '정류 회로', '평활 회로', '정전압 안정화'], sub = ['작아진 교류', '맥류', '리플이 남음', '일정한 직류'];
      var fn = [
        function (u) { return 0.45 * sin(u, 2); },
        function (u) { return Math.abs(sin(u, 2)); },
        function (u) { var ph = (u * 4) % 1; return 0.78 - 0.14 * (ph < 0.78 ? ph / 0.78 : 1 - (ph - 0.78) / 0.22); },
        function () { return 0.7; }];
      for (var i = 0; i < 4; i++) {
        var x = 8 + i * 118;
        s += box(x, 28, 104, 46, { fill: [C.grayL, C.blueL, C.greenL, C.orangeL][i], c: [C.line, C.blue, C.green, C.orange][i], r: 8 }) +
          t(x + 52, 51, names[i], { a: 'm', b: 1, size: 14, halo: false, ans: 1 });
        if (i < 3) s += arrow(x + 105, 51, x + 117, 51, { head: 8, w: 1.8 });
        s += line(x + 4, 146, x + 100, 146, { w: 1, c: C.line }) + plot(fn[i], x + 6, x + 98, 146, i ? 46 : 30, { w: 2.2, c: [C.ink, C.blue, C.green, C.orange][i] });
        s += arrow(x + 52, 76, x + 52, 92, { head: 7, w: 1.4, c: C.sub });
        s += t(x + 52, 172, sub[i], { a: 'm', size: 13, b: 1, ans: i === 1 });
      }
      return F.svg(480, 188, s);
    } },

  'rect-half': {
    cap: '반파 정류 — 다이오드 1개. 사인파의 양(+) 반주기만 통과한다',
    draw: function () {
      var s = ac(40, 84, 40, 156) + wire([[40, 84], [40, 60], [72, 60]]) + dio(72, 60, 150, 60) + wire([[150, 60], [200, 60], [200, 82]]) +
        res(200, 82, 200, 162) + wire([[200, 162], [200, 184], [40, 184], [40, 156]]);
      s += t(111, 38, 'D', { a: 'm', b: 1 }) + tx(214, 122, 'R_L', { b: 1 }) + t(40, 206, '교류 입력', { a: 'm', size: 13, c: C.sub });
      s += arrow(160, 48, 190, 48, { c: C.orange, w: 2, head: 8 });
      s += line(262, 130, 466, 130, { w: 1.2, c: C.line });
      s += plot(function (u) { return sin(u, 2); }, 266, 462, 130, 48, { c: C.sub, w: 1.6, dash: '5 4' });
      s += plot(function (u) { return Math.max(0, sin(u, 2)); }, 266, 462, 130, 48, { c: C.blue, w: 3 });
      s += t(266, 28, '- - 입력(교류)', { size: 13, c: C.sub }) + t(380, 28, '— 출력(맥류)', { size: 13, b: 1, c: C.blue });
      s += t(300, 204, '음(−) 반주기는 버려짐 · 리플 최대', { a: 'm', size: 13, c: C.red });
      return F.svg(480, 220, s);
    } },

  'rect-full': {
    cap: '전파 정류 — 중간 탭 변압기와 다이오드 2개. 두 반주기를 번갈아 같은 방향으로 보낸다',
    draw: function () {
      var s = ind(40, 70, 40, 170) + ind(74, 194, 74, 46) + line(54, 66, 54, 174, { w: 1.4 }) + line(60, 66, 60, 174, { w: 1.4 });
      s += wire([[40, 70], [20, 70]]) + wire([[40, 170], [20, 170]]) + t(28, 56, '교류', { a: 'm', size: 13, c: C.sub });
      s += wire([[74, 46], [100, 46]]) + dio(100, 46, 164, 46, { c: C.orange, fill: C.orange }) + wire([[164, 46], [196, 46], [196, 194], [164, 194]]) +
        dio(100, 194, 164, 194, { c: C.blue, fill: C.blue }) + wire([[74, 194], [100, 194]]);
      s += dot(196, 120) + res(196, 120, 96, 120) + wire([[96, 120], [74, 120]]) + dot(74, 120);
      s += t(132, 26, 'D1 (+ 반주기)', { a: 'm', size: 13, b: 1, c: C.orange }) + t(132, 216, 'D2 (− 반주기)', { a: 'm', size: 13, b: 1, c: C.blue });
      s += tx(146, 100, 'R_L', { a: 'm', b: 1, size: 15 }) + callout(76, 124, 104, 150, '중간 탭', { b: 1 });
      s += line(242, 170, 466, 170, { w: 1.2, c: C.line });
      for (var k = 0; k < 4; k++) {
        var x0 = 246 + k * 54;
        s += plot(function (u) { return Math.sin(Math.PI * u); }, x0, x0 + 54, 170, 80, { c: k % 2 ? C.blue : C.orange, w: 3 });
      }
      s += t(354, 62, '출력 — 양·음 반주기 모두', { a: 'm', size: 13, b: 1 });
      s += t(354, 196, '출력 주파수 = 입력의 2배', { a: 'm', size: 13, c: C.purple, b: 1 });
      return F.svg(480, 232, s);
    } },

  'rect-bridge': {
    cap: '브리지 정류 — 양(+) 반주기엔 D2·D3, 음(−) 반주기엔 D1·D4 가 ON. 부하 RL 에는 늘 같은 방향',
    draw: function () {
      var T = [190, 58], R = [270, 138], B = [190, 218], L = [110, 138];
      var s = wire([[T[0], T[1]], [190, 32], [40, 32], [40, 118]]) + ac(40, 118, 40, 158) + wire([[40, 158], [40, 246], [190, 246], [B[0], B[1]]]);
      s += dio(L[0], L[1], T[0], T[1], { c: C.blue, fill: C.blue }) + dio(T[0], T[1], R[0], R[1], { c: C.orange, fill: C.orange }) +
        dio(L[0], L[1], B[0], B[1], { c: C.orange, fill: C.orange }) + dio(B[0], B[1], R[0], R[1], { c: C.blue, fill: C.blue });
      s += wire([[L[0], L[1]], [152, 138]]) + res(152, 138, 228, 138) + wire([[228, 138], [R[0], R[1]]]);
      s += dot(T[0], T[1]) + dot(R[0], R[1]) + dot(B[0], B[1]) + dot(L[0], L[1]);
      s += t(134, 84, 'D1', { a: 'm', b: 1, c: C.blue }) + t(248, 84, 'D2', { a: 'm', b: 1, c: C.orange }) +
        t(134, 194, 'D3', { a: 'm', b: 1, c: C.orange }) + t(248, 194, 'D4', { a: 'm', b: 1, c: C.blue });
      s += tx(190, 118, 'R_L', { a: 'm', b: 1, size: 15 }) + arrow(222, 160, 158, 160, { w: 2, head: 8, c: C.green });
      s += t(40, 270, '교류 입력', { a: 'm', size: 13, c: C.sub });
      s += t(300, 44, '① 양(+) 반주기', { b: 1, c: C.orange }) + tx(300, 68, 'D2 → R_L → D3', { size: 15, c: C.orange });
      s += t(300, 110, '② 음(−) 반주기', { b: 1, c: C.blue }) + tx(300, 134, 'D4 → R_L → D1', { size: 15, c: C.blue });
      s += tx(300, 184, 'R_L 에는 두 반주기 모두', { size: 13, c: C.green, b: 1 }) + t(300, 204, '같은 방향 (→ 초록)', { size: 13, c: C.green, b: 1 });
      s += t(300, 244, '다이오드 4개 · 효율 최고', { size: 13, c: C.sub });
      return F.svg(480, 284, s);
    } },

  smoothing: {
    cap: '평활 — 커패시터가 봉우리에서 충전했다가 천천히 방전해 맥류를 거의 평평하게 만든다(남는 흔들림 = 리플)',
    draw: function () {
      var s = box(14, 44, 88, 44, { fill: C.blueL, c: C.blue, label: '정류 회로', size: 14 });
      s += wire([[102, 52], [260, 52]]) + wire([[102, 80], [260, 80]]);
      s += wire([[150, 52], [150, 58]]) + cap(150, 58, 150, 80, { c: C.green }) + wire([[220, 52], [220, 54]]) + res(220, 54, 220, 80);
      s += dot(150, 52) + dot(150, 80) + dot(220, 52) + dot(220, 80);
      s += t(164, 30, 'C', { a: 'm', b: 1, c: C.green }) + tx(236, 30, 'R_L', { a: 'm', b: 1 });
      s += t(276, 58, 'C 가 충전했다가', { size: 13, c: C.sub }) + t(276, 78, '천천히 방전', { size: 13, c: C.sub });
      var x0 = 36, x1 = 456, base = 238, A = 104, p = [], v = 0, N = 400;
      s += line(x0, base, x1, base, { w: 1.2, c: C.line });
      s += plot(function (u) { return Math.abs(Math.sin(Math.PI * 3 * u)); }, x0, x1, base, A, { c: C.sub, w: 1.6, dash: '5 4' });
      for (var i = 0; i <= N; i++) {
        var u = i / N, r = Math.abs(Math.sin(Math.PI * 3 * u));
        v = i ? Math.max(r, v * Math.exp(-1 / 110)) : r;
        p.push([x0 + (x1 - x0) * u, base - A * v]);
      }
      s += poly(p, { w: 3, c: C.green });
      var ymin = 0; p.forEach(function (q) { if (q[0] > 150 && q[0] < 320) ymin = Math.max(ymin, q[1]); });
      s += guide(300, base - A, 462, base - A) + guide(300, ymin, 462, ymin);
      s += arrow(452, base - A, 452, ymin, { both: 1, w: 1.4, head: 7, c: C.red }) + t(446, (base - A + ymin) / 2, '리플', { a: 'e', b: 1, size: 14, c: C.red });
      s += callout(170, 138, 196, 116, '방전', { c: C.green, tc: C.green, b: 1 }) + callout(100, 150, 72, 118, '충전', { c: C.green, tc: C.green, b: 1, a: 'e' });
      return F.svg(480, 256, s);
    } },

  reactance: {
    cap: '리액턴스 — 커패시터는 주파수에 반비례(직류를 막음), 인덕터는 비례(교류를 막음)',
    draw: function () {
      var s = axes(60, 214, 456, 34, 'f (주파수)', 'X (리액턴스)');
      var pc = [], pl = [];
      for (var i = 0; i <= 120; i++) { var x = 70 + i * 3.2; pc.push([x, Math.max(44, 214 - 3000 / (x - 52))]); }
      s += poly(pc, { w: 3, c: C.blue });
      s += line(60, 214, 440, 58, { w: 3, c: C.red });
      s += tx(94, 56, 'X_C = 1 / (2πfC)', { b: 1, c: C.blue, size: 15 }) + t(94, 80, '반비례', { size: 13, c: C.blue });
      s += tx(360, 140, 'X_L = 2πfL', { b: 1, c: C.red, size: 15 }) + t(360, 164, '비례', { size: 13, c: C.red });
      s += t(60, 238, '직류(f = 0)', { a: 'm', size: 13, b: 1 });
      s += tx(156, 238, '→ X_C = ∞ (막음) · X_L = 0 (통과)', { size: 13 });
      return F.svg(480, 254, s);
    } },

  filters: {
    cap: '평활 필터 3종 — 인덕터는 직렬로 고주파를 막고, 커패시터는 병렬로 고주파를 접지로 보낸다',
    draw: function () {
      var s = '';
      function cell(cx, kind) {
        var o = '', xl = cx - 68, xr = cx + 68, y1 = 50, y2 = 118;
        o += wire([[xl, y2], [xr, y2]]) + term(xl, y1) + term(xl, y2) + term(xr, y1) + term(xr, y2);
        function shunt(x, n) { return dot(x, y1) + dot(x, y2) + cap(x, y1, x, y2, { c: C.green }) + t(x + 14, 84, n, { size: 13, b: 1, c: C.green }); }
        if (kind === 0) o += wire([[xl + 4, y1], [cx - 44, y1]]) + ind(cx - 44, y1, cx + 16, y1, { c: C.red }) + wire([[cx + 16, y1], [xr - 4, y1]]) + shunt(cx + 38, 'C') + t(cx - 14, 30, 'L', { a: 'm', b: 1, c: C.red });
        if (kind === 1) o += wire([[xl + 4, y1], [cx - 14, y1]]) + ind(cx - 14, y1, cx + 46, y1, { c: C.red }) + wire([[cx + 46, y1], [xr - 4, y1]]) + shunt(cx - 40, 'C') + t(cx + 16, 30, 'L', { a: 'm', b: 1, c: C.red });
        if (kind === 2) o += wire([[xl + 4, y1], [cx - 30, y1]]) + ind(cx - 30, y1, cx + 30, y1, { c: C.red }) + wire([[cx + 30, y1], [xr - 4, y1]]) + shunt(cx - 46, 'C') + shunt(cx + 46, 'C') + t(cx, 30, 'L', { a: 'm', b: 1, c: C.red });
        return o;
      }
      s += cell(84, 0) + cell(240, 1) + cell(396, 2);
      s += t(84, 150, '인덕터 입력형', { a: 'm', b: 1, size: 14 }) + t(240, 150, '커패시터 입력형', { a: 'm', b: 1, size: 14 }) + t(396, 150, 'π형 (가장 우수)', { a: 'm', b: 1, size: 14, c: C.purple });
      s += t(84, 172, 'L 이 먼저 막음', { a: 'm', size: 13, c: C.sub }) + t(240, 172, 'C 가 먼저 접지로', { a: 'm', size: 13, c: C.sub }) + t(396, 172, 'L 을 R 로 바꾸면 CRC', { a: 'm', size: 13, c: C.sub });
      s += line(162, 20, 162, 180, { c: C.edge, w: 1.2 }) + line(318, 20, 318, 180, { c: C.edge, w: 1.2 });
      return F.svg(480, 190, s);
    } },

  'zener-reg': {
    cap: '제너 정전압 회로 — 역방향 항복을 이용해 출력을 VZ 로 고정한다(VS > VZ 일 때)',
    draw: function () {
      var s = bat(52, 82, 52, 168) + wire([[52, 82], [52, 50], [92, 50]]) + res(92, 50, 172, 50) + wire([[172, 50], [320, 50], [320, 76]]) +
        wire([[230, 50], [230, 72]]) + dio(230, 180, 230, 72, { kind: 'zener', c: C.blue, fill: C.blue }) + res(320, 76, 320, 180) +
        wire([[52, 168], [52, 196], [320, 196], [320, 180]]) + wire([[230, 180], [230, 196]]);
      s += dot(230, 50) + dot(230, 196);
      s += tx(24, 125, 'V_S', { a: 'm', b: 1 }) + t(64, 106, '+', { b: 1, c: C.red });
      s += tx(132, 28, 'R_S', { a: 'm', b: 1 }) + tx(132, 76, 'V_S − V_Z 소모', { a: 'm', size: 13, c: C.orange, b: 1 });
      s += t(244, 110, '제너', { size: 14, b: 1, c: C.blue }) + tx(244, 132, 'V_Z', { size: 14, b: 1, c: C.blue });
      s += tx(336, 128, 'R_L', { b: 1 });
      s += tx(374, 70, 'V_o = V_Z', { b: 1, size: 18, c: C.green }) + t(374, 96, '항상 일정', { size: 14, c: C.green });
      s += tx(240, 224, '기준 전압을 정해 주는 것 = 제너 다이오드  (조건 V_S > V_Z)', { a: 'm', size: 13 });
      return F.svg(480, 240, s);
    } },

  'tr-reg': {
    cap: '트랜지스터를 붙인 정전압 회로 — 출력은 제너 전압에서 VBE 만큼 낮다',
    draw: function () {
      var s = bat(40, 86, 40, 170) + wire([[40, 86], [40, 46], [254, 46], [254, 60]]) + wire([[40, 170], [40, 206], [390, 206]]);
      s += bjt(240, 94, { c: C.ink });
      s += dot(150, 46) + res(150, 46, 150, 94) + wire([[150, 94], [218, 94]]) + dot(150, 94) + wire([[150, 94], [150, 112]]) +
        dio(150, 206, 150, 112, { kind: 'zener', c: C.blue, fill: C.blue }) + dot(150, 206);
      s += wire([[254, 128], [254, 140], [350, 140], [350, 148]]) + res(350, 148, 350, 206) + dot(350, 140) + term(390, 140) + wire([[350, 140], [386, 140]]);
      s += tx(18, 128, 'V_S', { a: 'm', b: 1 }) + t(164, 70, 'R', { b: 1 }) + t(166, 150, '제너', { size: 13, b: 1, c: C.blue }) + tx(166, 170, 'V_Z', { size: 14, b: 1, c: C.blue });
      s += tx(366, 178, 'R_L', { b: 1 }) + tx(394, 120, 'V_o', { b: 1 });
      s += tx(200, 128, 'V_{BE}', { size: 13, c: C.purple, b: 1, a: 'm' });
      s += box(40, 222, 400, 44, { fill: C.greenL, c: C.green, r: 8, w: 1.2 });
      s += tx(240, 236, 'V_o = V_Z − V_{BE}', { a: 'm', b: 1, size: 16 }) + t(240, 256, '예) 5.1 V − 0.7 V = 4.4 V', { a: 'm', size: 13, halo: false });
      return F.svg(480, 280, s);
    } },

  'conv-4': {
    cap: '전원 변환 4가지 — 입력과 출력이 직류(=)인지 교류(∿)인지로 이름이 정해진다',
    draw: function () {
      var s = t(210, 22, '출력 직류', { a: 'm', b: 1 }) + t(378, 22, '출력 교류', { a: 'm', b: 1 }) +
        t(62, 92, '입력\n직류', { a: 'm', b: 1 }) + t(62, 196, '입력\n교류', { a: 'm', b: 1 });
      function dc(x, y) { return line(x, y, x + 40, y, { w: 3, c: C.ink }); }
      function acw(x, y, k) { return plot(function (u) { return sin(u, k || 1.5); }, x, x + 40, y, 11, { w: 2.4, c: C.ink }); }
      var cells = [[130, 40, dc, dc, '직류 변환', '(컨버터)', C.blueL, C.blue], [298, 40, dc, acw, '역변환', '(인버터)', C.orangeL, C.orange],
        [130, 144, acw, dc, '순변환', '(정류 회로)', C.greenL, C.green], [298, 144, acw, function (x, y) { return acw(x, y, 3); }, '주파수 변환', '(주파수 컨버터)', C.purpleL, C.purple]];
      cells.forEach(function (c) {
        var x = c[0], y = c[1];
        s += box(x, y, 160, 96, { fill: c[6], c: c[7], r: 10 });
        s += c[2](x + 18, y + 28) + arrow(x + 66, y + 28, x + 94, y + 28, { head: 8, w: 1.8, c: c[7] }) + c[3](x + 102, y + 28);
        s += t(x + 80, y + 60, c[4], { a: 'm', b: 1, size: 16, halo: false }) + t(x + 80, y + 81, c[5], { a: 'm', size: 13, halo: false });
      });
      return F.svg(480, 252, s);
    } },

  /* ═════════════ Ⅲ. 증폭 회로 ═════════════ */

  'ce-circuit': {
    cap: '이미터 공통(CE) 회로 — 베이스 쪽은 순방향(VBB), 컬렉터 쪽은 역방향(VCC)으로 건다',
    draw: function () {
      var s = t(16, 22, '이미터 공통(CE) 회로', { b: 1 });
      s += bjt(250, 130, {});
      s += wire([[228, 130], [212, 130]]) + res(132, 130, 212, 130) + wire([[132, 130], [80, 130], [80, 150]]) + bat(80, 150, 80, 196) + wire([[80, 196], [80, 216], [430, 216]]);
      s += wire([[264, 164], [264, 216]]) + dot(264, 216) + gnd(264, 216);
      s += wire([[264, 96], [264, 56], [300, 56]]) + res(300, 56, 376, 56) + wire([[376, 56], [410, 56], [410, 110]]) + bat(410, 110, 410, 170) + wire([[410, 170], [410, 216], [430, 216]]);
      s += tx(172, 108, 'R_B', { a: 'm', b: 1 }) + tx(338, 34, 'R_C', { a: 'm', b: 1 });
      s += tx(62, 173, 'V_{BB}', { a: 'e', b: 1 }) + t(62, 196, '순방향', { a: 'e', size: 13, c: C.green, b: 1 });
      s += tx(426, 132, 'V_{CC}', { b: 1 }) + t(426, 155, '역방향', { size: 13, c: C.red, b: 1 });
      s += t(92, 158, '+', { b: 1, c: C.red }) + t(422, 104, '+', { b: 1, c: C.red });
      s += arrow(200, 146, 226, 146, { c: C.orange, w: 1.8, head: 8 }) + tx(212, 162, 'I_B', { a: 'm', size: 14, c: C.orange, b: 1 });
      s += arrow(278, 62, 278, 90, { c: C.orange, w: 1.8, head: 8 }) + tx(284, 78, 'I_C', { size: 14, c: C.orange, b: 1 });
      s += arrow(278, 172, 278, 202, { c: C.orange, w: 1.8, head: 8 }) + tx(284, 188, 'I_E', { size: 14, c: C.orange, b: 1 });
      s += t(264, 246, '이미터가 두 회로에 공통', { a: 'm', size: 13, c: C.sub });
      return F.svg(480, 262, s);
    } },

  'tr-curves': {
    cap: '트랜지스터 특성 — 입력은 약 0.7 V 에서 급증, 출력은 1 V 를 넘으면 IC 가 거의 일정(IB 에 비례)',
    draw: function () {
      var s = t(128, 22, '입력 특성', { a: 'm', b: 1 }) + t(368, 22, '출력 특성', { a: 'm', b: 1 });
      s += axes(40, 210, 222, 40, 'V_{BE}', 'I_B');
      s += F.path('M40,210 C90,210 118,208 132,196 C144,184 150,120 158,52', { w: 2.8, c: C.blue });
      s += guide(134, 194, 134, 210) + t(134, 226, '약 0.7 V', { a: 'm', size: 13, b: 1, ans: 1 });
      s += axes(270, 210, 466, 40, 'V_{CE}', 'I_C');
      [[150, 'I_{B1}'], [112, 'I_{B2}'], [74, 'I_{B3}']].forEach(function (q) {
        var y = q[0], p = [];
        for (var i = 0; i <= 60; i++) { var x = 270 + i * 3.1, v = x - 270; p.push([x, 210 - (210 - y) * (1 - Math.exp(-v / 7)) - v * 0.05]); }
        s += poly(p, { w: 2.4, c: C.blue }) + tx(462, y - 16, q[1], { a: 'e', size: 13, b: 1, c: C.blue });
      });
      s += guide(294, 60, 294, 210) + t(294, 226, '약 1 V', { a: 'm', size: 13, b: 1 });
      s += t(370, 186, '거의 일정', { a: 'm', size: 13, c: C.green, b: 1, ans: 1 });
      s += tx(370, 248, 'I_B 가 클수록 I_C 도 크다', { a: 'm', size: 13 });
      return F.svg(480, 262, s);
    } },

  'tr-regions': {
    cap: '출력 특성의 4개 동작 영역 — 포화(ON)·활성(증폭)·차단(OFF)·항복(파괴)',
    draw: function () {
      var s = '', X0 = 60, Y0 = 232, x1 = 104, x40 = 386;
      s += box(X0, 40, x1 - X0, Y0 - 40, { fill: C.orangeL, c: 'none', r: 0 }) + box(x1, 40, x40 - x1, Y0 - 40, { fill: C.blueL, c: 'none', r: 0 }) +
        box(x40, 40, 462 - x40, Y0 - 40, { fill: C.redL, c: 'none', r: 0 }) + box(x1, Y0 - 14, x40 - x1, 14, { fill: C.grayM, c: 'none', r: 0 });
      s += axes(X0, Y0, 466, 30, 'V_{CE}', 'I_C');
      [72, 110, 148, 186].forEach(function (y) {
        var p = [];
        for (var x = X0; x <= 452; x += 3) {
          var v;
          if (x < x1) v = (Y0 - y) * (1 - Math.exp(-(x - X0) / 9));
          else v = (Y0 - y) + (x - x1) * 0.04;
          if (x > x40) v += Math.pow((x - x40) / 14, 2.2);
          p.push([x, Math.max(44, Y0 - v)]);
        }
        s += poly(p, { w: 2.2, c: C.ink });
      });
      s += t(82, 58, '포화', { a: 'm', b: 1, c: C.orange, size: 15, ans: 1 }) + t(245, 58, '활성 영역 — 증폭', { a: 'm', b: 1, c: C.blue, size: 15, ans: 1 }) +
        t(424, 58, '항복', { a: 'm', b: 1, c: C.red, size: 15, ans: 1 });
      s += t(82, 82, 'ON', { a: 'm', size: 13, c: C.orange, b: 1 }) + t(424, 82, '파괴', { a: 'm', size: 13, c: C.red, b: 1 });
      s += arrow(236, 204, 236, Y0 - 9, { w: 1.2, head: 7, c: C.sub }) + tx(246, 204, '차단 — I_C ≈ 0 (OFF)', { size: 14, b: 1, ans: 1 });
      s += t(x1, Y0 + 18, '약 1 V', { a: 'm', size: 13, b: 1 }) + t(x40, Y0 + 18, '약 40 V', { a: 'm', size: 13, b: 1 });
      s += t(245, 266, '(눈금은 실제 비율이 아님)', { a: 'm', size: 13, c: C.sub });
      return F.svg(480, 280, s);
    } },

  'bias-4': {
    cap: '바이어스 4가지 — 저항을 어디에 다느냐가 다르다. 가장 널리 쓰는 것은 전압 분배 바이어스',
    draw: function () {
      var s = line(240, 10, 240, 370, { c: C.edge, w: 1.2 }) + line(10, 190, 470, 190, { c: C.edge, w: 1.2 });
      function cell(ox, oy, k) {
        var o = '', x = ox + 120, y = oy + 104, B = [x - 22, y], Cc = [x + 14, y - 34], E = [x + 14, y + 34];
        var title = ['고정 바이어스', '이미터 바이어스', '전압 분배 바이어스', '컬렉터 되먹임 바이어스'][k];
        var note = ['온도에 민감', '± 전원 2개', '가장 널리 씀', '매우 안정'][k];
        o += t(ox + 14, oy + 16, title, { b: 1, size: 15, c: k === 2 ? C.blue : C.ink, ans: k === 2 });
        o += line(ox + 40, oy + 36, ox + 200, oy + 36, { w: 2.4 }) + tx(ox + 204, oy + 36, '+V_{CC}', { size: 13, b: 1 });
        o += bjt(x, y, {}) + res(Cc[0], oy + 36, Cc[0], Cc[1]) + dot(Cc[0], oy + 36) + tx(Cc[0] + 14, oy + 54, 'R_C', { size: 13, b: 1 });
        o += t(ox + 164, y + 2, note, { size: 13, b: 1, c: k === 2 ? C.blue : C.sub, ans: k === 0 || k === 2 });
        if (k === 0) o += dot(ox + 60, oy + 36) + res(ox + 60, oy + 36, ox + 60, y) + wire([[ox + 60, y], [B[0], B[1]]]) + tx(ox + 46, oy + 70, 'R_B', { size: 13, b: 1, a: 'e' }) +
          wire([[E[0], E[1]], [E[0], E[1] + 8]]) + gnd(E[0], E[1] + 8);
        if (k === 1) o += wire([[B[0], B[1]], [ox + 60, y]]) + res(ox + 60, y, ox + 60, y + 50) + gnd(ox + 60, y + 50) + tx(ox + 46, y + 25, 'R_B', { size: 13, b: 1, a: 'e' }) +
          res(E[0], E[1], E[0], E[1] + 36) + tx(E[0] + 14, E[1] + 20, 'R_E', { size: 13, b: 1 }) + tx(E[0] + 18, E[1] + 36, '−V_{EE}', { size: 13, b: 1, c: C.blue });
        if (k === 2) o += dot(ox + 60, oy + 36) + res(ox + 60, oy + 36, ox + 60, y) + dot(ox + 60, y) + wire([[ox + 60, y], [B[0], B[1]]]) + res(ox + 60, y, ox + 60, y + 50) + gnd(ox + 60, y + 50) +
          tx(ox + 46, oy + 70, 'R_1', { size: 13, b: 1, a: 'e' }) + tx(ox + 46, y + 25, 'R_2', { size: 13, b: 1, a: 'e' }) +
          res(E[0], E[1], E[0], E[1] + 34) + gnd(E[0], E[1] + 34) + tx(E[0] + 14, E[1] + 18, 'R_E', { size: 13, b: 1 });
        if (k === 3) o += dot(Cc[0], Cc[1] - 4) + wire([[Cc[0], Cc[1] - 4], [ox + 52, Cc[1] - 4], [ox + 52, y]]) + res(ox + 52, y, B[0], B[1]) + tx(ox + 70, y + 20, 'R_B', { size: 13, b: 1, a: 'm' }) +
          wire([[E[0], E[1]], [E[0], E[1] + 8]]) + gnd(E[0], E[1] + 8) + t(ox + 70, oy + 58, '되먹임', { size: 13, c: C.orange, b: 1, a: 'm' });
        return o;
      }
      s += cell(0, 0, 0) + cell(240, 0, 1) + cell(0, 186, 2) + cell(240, 186, 3);
      return F.svg(480, 380, s);
    } },

  loadline: {
    cap: '직류 부하선 — 포화점과 차단점을 이은 선. 동작점 Q 는 한가운데에 둬야 왜곡이 가장 적다',
    draw: function () {
      var s = axes(60, 232, 460, 30, 'V_{CE}', 'I_C');
      [70, 110, 150, 190].forEach(function (y) {
        var p = [];
        for (var x = 60; x <= 440; x += 4) p.push([x, 232 - (232 - y) * (1 - Math.exp(-(x - 60) / 8)) - (x - 60) * 0.02]);
        s += poly(p, { w: 1.6, c: C.line });
      });
      s += line(60, 64, 420, 232, { w: 3, c: C.orange });
      s += dot(60, 64, C.red, 6) + dot(420, 232, C.red, 6);
      s += tx(70, 52, '포화점 I_{C(sat)}', { size: 14, b: 1, c: C.red });
      s += tx(440, 262, '차단점 V_{CE(cutoff)}', { a: 'e', size: 14, b: 1, c: C.red });
      s += dot(240, 148, C.blue, 8) + t(240, 148, 'Q', { a: 'm', size: 12, b: 1, c: '#fff', halo: false });
      s += arrow(252, 154, 310, 181, { c: C.blue, w: 2, head: 9 }) + arrow(228, 142, 170, 115, { c: C.blue, w: 2, head: 9 });
      s += callout(240, 160, 206, 206, '동작점 Q (한가운데)', { c: C.blue, tc: C.blue, b: 1, a: 'e', ans: 1 });
      s += t(330, 124, '직류 부하선', { b: 1, c: C.orange, ans: 1 });
      s += t(318, 76, '위아래로 고르게 흔들림', { size: 13, c: C.sub }) + t(318, 96, '→ 왜곡 최소', { size: 13, c: C.green, b: 1, ans: 1 });
      return F.svg(480, 276, s);
    } },

  equiv: {
    cap: '등가 회로 — 직류로 볼 때는 커패시터를 떼어 내고, 교류로 볼 때는 커패시터와 전원을 선으로 본다',
    draw: function () {
      var s = line(240, 10, 240, 256, { c: C.edge, w: 1.2 });
      s += t(120, 20, '직류 등가 회로', { a: 'm', b: 1, c: C.blue }) + t(360, 20, '교류 등가 회로', { a: 'm', b: 1, c: C.orange });
      /* 직류 */
      s += line(40, 44, 200, 44, { w: 2.4 }) + tx(204, 44, 'V_{CC}', { size: 13, b: 1 });
      s += bjt(126, 132, {}) + dot(60, 44) + res(60, 44, 60, 132) + dot(60, 132) + wire([[60, 132], [104, 132]]) + res(60, 132, 60, 196) + gnd(60, 196);
      s += dot(140, 44) + res(140, 44, 140, 98) + res(140, 166, 140, 210) + gnd(140, 210);
      s += tx(46, 88, 'R_1', { a: 'e', size: 13, b: 1 }) + tx(46, 164, 'R_2', { a: 'e', size: 13, b: 1 }) + tx(154, 70, 'R_C', { size: 13, b: 1 }) + tx(154, 188, 'R_E', { size: 13, b: 1 });
      s += t(120, 236, 'C 는 모두 개방(없는 것으로)', { a: 'm', size: 13, b: 1, ans: 1 }) + tx(120, 256, '→ V_{CE} · I_C · I_E 를 구함', { a: 'm', size: 13, c: C.sub });
      /* 교류 */
      s += bjt(352, 104, {}) + ac(272, 130, 272, 180) + wire([[330, 104], [272, 104], [272, 130]]) + wire([[272, 180], [272, 210], [462, 210]]);
      s += dot(300, 104) + res(300, 120, 300, 190) + wire([[300, 104], [300, 120]]) + wire([[300, 190], [300, 210]]) + dot(300, 210);
      s += tx(290, 88, 'R_1∥R_2', { size: 13, b: 1, a: 'm' });
      s += wire([[366, 138], [366, 210]]) + dot(366, 210) + gnd(366, 210);
      s += wire([[366, 70], [366, 52], [456, 52]]) + dot(414, 52) + res(414, 70, 414, 190) + wire([[414, 52], [414, 70]]) + wire([[414, 190], [414, 210]]) + dot(414, 210) +
        res(456, 70, 456, 190) + wire([[456, 52], [456, 70]]) + wire([[456, 190], [456, 210]]);
      s += tx(404, 120, 'R_C', { a: 'e', size: 13, b: 1 }) + tx(446, 150, 'R_L', { a: 'e', size: 13, b: 1 });
      s += t(360, 236, 'C · 직류 전원 → 단락(선으로)', { a: 'm', size: 13, b: 1, ans: 1 }) + tx(360, 256, 'R_c′ = R_C ∥ R_L 로 이득 계산', { a: 'm', size: 13, c: C.sub });
      return F.svg(480, 270, s);
    } },

  'ce-amp': {
    cap: '공통 이미터 증폭 회로 — C1·C2 는 결합, CE 는 바이패스. 출력은 커지고 위상이 180° 뒤집힌다',
    draw: function () {
      var s = line(96, 34, 330, 34, { w: 2.4 }) + tx(336, 34, '+V_{CC}', { size: 14, b: 1 });
      s += bjt(230, 150, {});
      s += dot(130, 34) + res(130, 34, 130, 150) + dot(130, 150) + res(130, 150, 130, 236) + wire([[130, 150], [208, 150]]);
      s += dot(244, 34) + res(244, 34, 244, 100) + wire([[244, 100], [244, 116]]) + dot(244, 100);
      s += wire([[244, 184], [244, 196]]) + dot(244, 196) + res(244, 196, 244, 236) + wire([[244, 196], [292, 196]]) + cap(292, 196, 292, 236, { c: C.green });
      s += line(60, 236, 330, 236, { w: 2 }) + gnd(190, 236);
      s += wire([[130, 150], [118, 150]]) + cap(76, 150, 118, 150, { c: C.purple }) + wire([[76, 150], [60, 150]]) + term(56, 150);
      s += wire([[244, 100], [300, 100]]) + cap(300, 100, 346, 100, { c: C.purple }) + wire([[346, 100], [366, 100]]) + term(370, 100);
      s += tx(116, 92, 'R_1', { a: 'e', size: 14, b: 1 }) + tx(116, 196, 'R_2', { a: 'e', size: 14, b: 1 }) + tx(258, 66, 'R_C', { size: 14, b: 1 }) +
        tx(230, 218, 'R_E', { a: 'e', size: 14, b: 1 });
      s += tx(306, 208, 'C_E', { size: 14, b: 1, c: C.green }) + t(306, 226, '바이패스', { size: 13, c: C.green });
      s += tx(97, 126, 'C_1', { a: 'm', size: 14, b: 1, c: C.purple }) + tx(323, 76, 'C_2', { a: 'm', size: 14, b: 1, c: C.purple });
      s += t(97, 176, '결합', { a: 'm', size: 13, c: C.purple }) + t(323, 124, '결합', { a: 'm', size: 13, c: C.purple });
      s += plot(function (u) { return sin(u, 2); }, 22, 92, 196, 7, { c: C.blue, w: 2 }) + t(56, 222, '입력(작다)', { a: 'm', size: 13, c: C.blue });
      s += plot(function (u) { return -sin(u, 2); }, 386, 466, 100, 26, { c: C.orange, w: 2.4 }) + t(426, 146, '출력(크다)', { a: 'm', size: 13, c: C.orange, b: 1 }) +
        t(426, 166, '180° 반전', { a: 'm', size: 13, c: C.orange });
      return F.svg(480, 268, s);
    } },

  'amp-3': {
    cap: '증폭 회로 3종 — 입력·출력 단자에 함께 쓰는(접지된) 단자 이름을 붙인다',
    draw: function () {
      var s = '';
      [80, 240, 400].forEach(function (cx, k) {
        var x = cx - 6, y = 96, B = [x - 22, y], Cc = [x + 14, y - 34], E = [x + 14, y + 34];
        s += bjt(x, y, {});
        var inA = function (a, b) { return arrow(a[0], a[1], b[0], b[1], { c: C.green, w: 2.2, head: 9 }); };
        var outA = function (a, b) { return arrow(a[0], a[1], b[0], b[1], { c: C.orange, w: 2.2, head: 9 }); };
        if (k === 0) s += inA([cx - 70, y], B) + wire([Cc, [Cc[0], y - 48]]) + outA([Cc[0], y - 48], [cx + 64, y - 48]) + wire([E, [E[0], E[1] + 8]]) + gnd(E[0], E[1] + 8, C.purple);
        if (k === 1) s += inA([cx - 70, y], B) + wire([E, [E[0], E[1] + 12]]) + outA([E[0], E[1] + 12], [cx + 64, E[1] + 12]) + wire([Cc, [Cc[0], y - 44]]) + '<g transform="translate(0 ' + (2 * (y - 44)) + ') scale(1 -1)">' + gnd(Cc[0], y - 44, C.purple) + '</g>';
        if (k === 2) s += wire([E, [E[0], E[1] + 12]]) + inA([cx - 70, E[1] + 12], [E[0], E[1] + 12]) + wire([Cc, [Cc[0], y - 48]]) + outA([Cc[0], y - 48], [cx + 64, y - 48]) + wire([B, [B[0] - 14, y], [B[0] - 14, y + 6]]) + gnd(B[0] - 14, y + 6, C.purple);
        s += t(cx, 176, ['공통 이미터(CE)', '공통 컬렉터(CC)', '공통 베이스(CB)'][k], { a: 'm', b: 1, size: 14 });
        s += t(cx, 198, ['위상 180° 반전', '위상 0° (동상)', '위상 0° (동상)'][k], { a: 'm', size: 13, c: C.purple, ans: 1 });
        s += t(cx, 218, ['전압 증폭', '버퍼 · 임피던스 정합', '고주파 증폭'][k], { a: 'm', size: 13, b: 1, c: C.sub, ans: 1 });
      });
      s += t(16, 20, '→ 입력', { size: 13, b: 1, c: C.green }) + t(80, 20, '→ 출력', { size: 13, b: 1, c: C.orange }) + t(148, 20, '▼ 공통 단자', { size: 13, b: 1, c: C.purple });
      s += line(160, 34, 160, 226, { c: C.edge, w: 1.2 }) + line(320, 34, 320, 226, { c: C.edge, w: 1.2 });
      return F.svg(480, 234, s);
    } },

  'class-abc': {
    cap: '전력 증폭 A·B·C급 — 동작점 Q 가 내려갈수록 전류가 흐르는 구간이 짧아지고 효율이 높아진다',
    draw: function () {
      var s = '';
      var fns = [function (u) { return 0.45 + 0.4 * sin(u, 2); }, function (u) { return Math.max(0, 0.85 * sin(u, 2)); }, function (u) { return Math.max(0, 1.3 * sin(u, 2) - 0.45); }];
      var q = [0.45, 0, -0.2], col = [C.green, C.blue, C.red];
      [0, 1, 2].forEach(function (k) {
        var x0 = 16 + k * 156, base = 136;
        s += t(x0 + 70, 24, ['A급', 'B급', 'C급'][k], { a: 'm', b: 1, size: 18, c: col[k] });
        s += line(x0, base, x0 + 140, base, { w: 1.2, c: C.line }) + tx(x0 + 2, 46, 'I_C', { size: 13, c: C.sub });
        s += line(x0, base - 100 * q[k], x0 + 140, base - 100 * q[k], { w: 1.2, c: C.purple, dash: '5 4' }) + t(x0 + 142, base - 100 * q[k], 'Q', { size: 13, b: 1, c: C.purple });
        s += plot(fns[k], x0 + 2, x0 + 136, base, 100, { c: col[k], w: 2.6 });
        s += t(x0 + 70, 176, ['전 주기 360°', '반주기 180°', '180° 미만'][k], { a: 'm', size: 14, b: 1, ans: 1 });
        s += t(x0 + 70, 198, ['최대 효율 25%', '최대 효율 79%', '효율 가장 높음'][k], { a: 'm', size: 13, ans: 1 });
        s += t(x0 + 70, 218, ['왜곡 거의 없음', '푸시풀로 씀', '왜곡 심함'][k], { a: 'm', size: 13, c: C.sub, ans: 1 });
      });
      return F.svg(480, 232, s);
    } },

  'push-pull': {
    cap: '푸시풀 — B급 트랜지스터 2개가 양(+)과 음(−) 반주기를 번갈아 맡아 원래 모양을 만든다',
    draw: function () {
      var s = line(170, 30, 280, 30, { w: 2.4 }) + tx(284, 30, '+V_{CC}', { size: 13, b: 1 }) + line(170, 240, 280, 240, { w: 2.4 }) + tx(284, 240, '−V_{CC}', { size: 13, b: 1 });
      s += bjt(200, 86, { c: C.orange }) + bjt(200, 184, { pnp: true, flipV: true, c: C.blue });
      s += wire([[214, 52], [214, 30]]) + wire([[214, 218], [214, 240]]) + wire([[214, 120], [214, 150]]) + dot(214, 135);
      s += wire([[178, 86], [150, 86], [150, 184], [178, 184]]) + dot(150, 135) + wire([[96, 135], [150, 135]]) + term(92, 135);
      s += plot(function (u) { return sin(u, 1); }, 30, 84, 135, 14, { w: 2, c: C.ink }) + t(56, 166, '입력', { a: 'm', size: 13 });
      s += wire([[214, 135], [296, 135], [296, 150]]) + res(296, 150, 296, 210) + gnd(296, 210) + tx(310, 180, 'R_L', { size: 14, b: 1 });
      s += t(236, 70, 'npn', { size: 13, b: 1, c: C.orange }) + t(236, 204, 'pnp', { size: 13, b: 1, c: C.blue });
      var X0 = 352, X1 = 466;
      s += line(X0, 56, X1, 56, { w: 1, c: C.line }) + plot(function (u) { return Math.max(0, sin(u, 2)); }, X0, X1, 56, 24, { c: C.orange, w: 2.4 }) + t(X0, 92, '위 — 양(+) 반주기', { size: 13, c: C.orange, b: 1 });
      s += line(X0, 132, X1, 132, { w: 1, c: C.line }) + plot(function (u) { return Math.min(0, sin(u, 2)); }, X0, X1, 132, 24, { c: C.blue, w: 2.4 }) + t(X0, 116, '아래 — 음(−) 반주기', { size: 13, c: C.blue, b: 1 });
      s += line(X0, 204, X1, 204, { w: 1, c: C.line }) + plot(function (u) { var v = sin(u, 2); return v; }, X0, X1, 204, 24, { c: C.green, w: 2.6 }) + t(X0, 244, '합쳐서 원래 모양', { size: 13, c: C.green, b: 1 });
      return F.svg(480, 260, s);
    } },

  opamp: {
    cap: '연산 증폭기 — 두 입력의 차를 크게 키우는 차동 증폭기. 741 은 8핀(2·3 입력, 6 출력, 7·4 전원)',
    draw: function () {
      var s = oa(160, 118, {});
      s += wire([[118, 104], [30, 104]]) + wire([[118, 132], [30, 132]]) + t(24, 88, '반전 입력(−)', { size: 13, b: 1 }) + t(24, 150, '비반전 입력(+)', { size: 13, b: 1 });
      s += wire([[154, 99], [154, 64]]) + wire([[154, 137], [154, 172]]) + tx(162, 66, '+V_S', { size: 13, b: 1, c: C.red }) + tx(162, 172, '−V_S', { size: 13, b: 1, c: C.blue });
      s += wire([[204, 118], [232, 118]]) + term(236, 118) + tx(236, 98, 'V_O', { a: 'm', b: 1, size: 15 });
      s += tx(140, 216, 'V_O = A (V_+ − V_−)', { a: 'm', b: 1, size: 16 }) + t(140, 240, '두 입력의 차에 비례', { a: 'm', size: 13, c: C.sub });
      /* 741 */
      s += t(392, 24, '741 (8핀)', { a: 'm', b: 1 });
      s += box(354, 44, 76, 150, { fill: C.grayL, c: C.ink, r: 6 }) + F.path('M380,44 a12,12 0 0 0 24,0', { fill: '#fff', w: 1.6 });
      var Ll = ['', '반전 입력', '비반전 입력', '−V_S'], Rl = ['', '+V_S', '출력', ''];
      for (var i = 0; i < 4; i++) {
        var y = 66 + i * 36;
        s += line(338, y, 354, y, { w: 2.4 }) + line(430, y, 446, y, { w: 2.4 });
        s += t(362, y, String(i + 1), { size: 13, b: 1, halo: false }) + t(422, y, String(8 - i), { size: 13, b: 1, a: 'e', halo: false });
        if (Ll[i]) s += tx(334, y, Ll[i], { a: 'e', size: 13, b: 1, c: i === 3 ? C.blue : C.ink });
        if (Rl[i]) s += tx(450, y, Rl[i], { size: 13, b: 1, c: i === 1 ? C.red : C.orange });
      }
      return F.svg(480, 256, s);
    } },

  'opamp-bode': {
    cap: '이득-주파수 — 되먹임 없는 이득(AOL)은 차단 주파수 fC 에서 3 dB 줄고, fT 에서 1(0 dB)이 된다',
    draw: function () {
      var s = axes(60, 214, 460, 30, 'f', '이득 [dB]') + t(280, 238, '주파수 (로그 눈금)', { a: 'm', size: 13, c: C.sub });
      var p = [];
      for (var i = 0; i <= 200; i++) {
        var u = i / 200 * 6.2, g = 100 - 10 * Math.log10(1 + Math.pow(10, 2 * (u - 1)));
        p.push([60 + u / 6.2 * 390, 214 - g * 1.5]);
      }
      s += poly(p.filter(function (q) { return q[1] <= 216; }), { w: 3, c: C.blue });
      var xc = 60 + 1 / 6.2 * 390, xt = 60 + 6 / 6.2 * 390;
      s += guide(60, 64, 460, 64) + tx(70, 86, 'A_{OL}', { size: 15, b: 1, c: C.blue }) + t(70, 106, '수만 배 이상', { size: 13, c: C.blue });
      s += guide(xc, 69, xc, 214) + dot(xc, 68.5, C.orange, 5) + tx(xc, 232, 'f_C', { a: 'm', b: 1, c: C.orange });
      s += t(xc + 8, 46, '3 dB 감소(0.707배)', { size: 13, c: C.orange, b: 1 });
      s += dot(xt, 214, C.red, 5) + tx(xt, 232, 'f_T', { a: 'm', b: 1, c: C.red }) + t(452, 178, '이득 1', { a: 'm', size: 13, c: C.red, b: 1 }) + t(452, 196, '0 dB', { a: 'm', size: 13, c: C.red, b: 1 });
      return F.svg(480, 250, s);
    } },

  'virtual-ground': {
    cap: '가상 접지 — 입력 저항이 ∞ 라 단자로 전류가 안 들어가고, (−) 단자도 0 V 가 된다',
    draw: function () {
      var s = oa(300, 124, {});
      s += term(56, 110) + tx(56, 90, 'V_i', { a: 'm', b: 1 }) + wire([[60, 110], [86, 110]]) + res(86, 110, 170, 110) + wire([[170, 110], [258, 110]]);
      s += dot(212, 110, C.purple, 5) + wire([[212, 110], [212, 52], [236, 52]]) + res(236, 52, 340, 52) + wire([[340, 52], [370, 52], [370, 124]]) + dot(370, 124);
      s += wire([[344, 124], [396, 124]]) + term(400, 124) + tx(400, 104, 'V_o', { a: 'm', b: 1 });
      s += wire([[258, 138], [240, 138], [240, 160]]) + gnd(240, 160);
      s += tx(128, 88, 'R_1', { a: 'm', b: 1 }) + tx(288, 30, 'R_F', { a: 'm', b: 1 });
      s += arrow(100, 132, 158, 132, { c: C.orange, w: 2, head: 8 }) + t(129, 148, 'I', { a: 'm', b: 1, c: C.orange });
      s += arrow(250, 74, 326, 74, { c: C.orange, w: 2, head: 8 }) + t(288, 90, '같은 I', { a: 'm', size: 13, b: 1, c: C.orange });
      s += callout(212, 116, 190, 186, '가상 접지 (0 V)', { c: C.purple, tc: C.purple, b: 1, a: 'e' });
      s += t(340, 186, '단자로 들어가는 전류 = 0', { a: 'm', size: 13, c: C.sub });
      s += tx(240, 226, 'A_V = − R_F / R_1   (180° 반전)', { a: 'm', b: 1, size: 16 });
      return F.svg(480, 244, s);
    } },

  'opamp-3': {
    cap: '연산 증폭기 응용 3가지 — 반전(−RF/R1) · 비반전(1+RF/R1) · 버퍼(1)',
    draw: function () {
      var s = '';
      [80, 240, 400].forEach(function (cx, k) {
        var x = cx + 12, y = 110, it = [x - 42, y - 14], ib = [x - 42, y + 14], out = [x + 44, y];
        s += oa(x, y, {});
        s += t(cx, 22, ['반전 증폭', '비반전 증폭', '버퍼 (전압 폴로어)'][k], { a: 'm', b: 1, size: 15 });
        if (k === 0) s += term(cx - 72, it[1]) + res(cx - 68, it[1], cx - 32, it[1]) + wire([[cx - 32, it[1]], it]) + dot(cx - 36, it[1]) +
          wire([[cx - 36, it[1]], [cx - 36, 64], [cx - 16, 64]]) + res(cx - 16, 64, cx + 44, 64) + wire([[cx + 44, 64], [out[0], 64], out]) +
          wire([ib, [cx - 36, ib[1]], [cx - 36, ib[1] + 12]]) + gnd(cx - 36, ib[1] + 12) +
          tx(cx - 50, 76, 'R_1', { size: 13, b: 1, a: 'm' }) + tx(cx + 14, 46, 'R_F', { size: 13, b: 1, a: 'm' });
        if (k === 1) s += term(cx - 72, ib[1]) + wire([[cx - 68, ib[1]], ib]) + dot(cx - 44, it[1]) + wire([[cx - 44, it[1]], it]) +
          res(cx - 44, it[1], cx - 44, 170) + gnd(cx - 44, 170) + wire([[cx - 44, it[1]], [cx - 44, 64], [cx - 16, 64]]) + res(cx - 16, 64, cx + 44, 64) + wire([[cx + 44, 64], [out[0], 64], out]) +
          tx(cx - 56, 146, 'R_1', { size: 13, b: 1, a: 'e' }) + tx(cx + 14, 46, 'R_F', { size: 13, b: 1, a: 'm' });
        if (k === 2) s += term(cx - 72, ib[1]) + wire([[cx - 68, ib[1]], ib]) + wire([out, [out[0], 64], [cx - 44, 64], [cx - 44, it[1]], it]);
        s += dot(out[0], out[1]);
        s += tx(cx, 196, ['A_V = − R_F / R_1', 'A_V = 1 + R_F / R_1', 'A_V = 1'][k], { a: 'm', b: 1, size: 14, ans: 1 });
        s += t(cx, 218, ['180° 반전', '0° 동상 · 항상 1 보다 큼', '0° 동상 · 임피던스 정합'][k], { a: 'm', size: 13, c: C.purple, ans: 1 });
      });
      s += line(160, 16, 160, 226, { c: C.edge, w: 1.2 }) + line(320, 16, 320, 226, { c: C.edge, w: 1.2 });
      return F.svg(480, 234, s);
    } },

  /* ═════════════ Ⅳ. 발진 회로 및 펄스 회로 ═════════════ */

  'osc-loop': {
    cap: '발진 — 입력 없이 직류 전원만으로, 증폭기 A 와 되먹임 β 가 고리를 이뤄 교류를 스스로 만든다',
    draw: function () {
      var s = amp(62, 92, 172, '증폭기 A', { h: 36, size: 14, ans: 1 });
      s += arrow(150, 34, 150, 82, { c: C.red, w: 2.2, head: 9 }) + t(150, 22, '직류 전원', { a: 'm', size: 13, b: 1, c: C.red, ans: 1 });
      s += wire([[172, 92], [224, 92]]) + dot(206, 92) + arrow(224, 92, 246, 92, { head: 9 }) + t(236, 72, '출력', { a: 'm', size: 13, b: 1 });
      s += box(88, 150, 90, 40, { fill: C.greenL, c: C.green, label: '되먹임 β', size: 14, ans: 1 });
      s += route([[206, 92], [206, 170], [178, 170]], { c: C.green, head: 9 }) + route([[88, 170], [30, 170], [30, 92], [60, 92]], { c: C.green, head: 9 });
      s += cross(26, 36, 6) + t(38, 36, '외부 입력 없음', { size: 13, b: 1, c: C.red, ans: 1 });
      s += t(118, 212, '되먹임 위상차 0° (동위상)', { a: 'm', size: 13, b: 1, c: C.green });
      var X0 = 264, X1 = 466, y0 = 120;
      s += line(X0, y0, X1, y0, { w: 1, c: C.line });
      s += plot(function (u) { var a = Math.min(1, 0.06 * Math.exp(u * 7)); return a * sin(u, 9); }, X0, X1, y0, 58, { c: C.blue, w: 2, n: 500 });
      s += guide(378, 40, 378, 196);
      s += tx(320, 204, 'βA > 1', { a: 'm', b: 1, size: 14, c: C.orange }) + t(320, 224, '점점 커짐', { a: 'm', size: 13, c: C.orange });
      s += tx(424, 204, 'βA = 1', { a: 'm', b: 1, size: 14, c: C.green }) + t(424, 224, '일정하게 유지', { a: 'm', size: 13, c: C.green });
      return F.svg(480, 240, s);
      function route(p, o) { return F.route(p, { c: o.c, head: o.head, w: 2 }); }
    } },

  'rc-phase': {
    cap: '위상 변이 발진 — 반전 증폭기 180° + CR 3단(60° × 3 = 180°) = 0°',
    draw: function () {
      var s = '', X = [30, 110, 190];
      X.forEach(function (x0, i) {
        s += cap(x0, 100, x0 + 50, 100, { c: C.blue }) + wire([[x0 + 50, 100], [x0 + 80, 100]]) + dot(x0 + 64, 100) +
          res(x0 + 64, 100, x0 + 64, 176, { c: C.orange }) + t(x0 + 25, 78, 'C', { a: 'm', b: 1, c: C.blue }) + t(x0 + 78, 140, 'R', { b: 1, c: C.orange });
        s += t(x0 + 30, 136, '60°', { a: 'm', b: 1, size: 14, c: C.purple, ans: 1 });
      });
      s += wire([[94, 176], [254, 176]]) + gnd(174, 176);
      s += wire([[270, 100], [286, 100]]) + amp(286, 100, 352, '−A', { h: 30, fill: C.orangeL, c: C.orange });
      s += wire([[352, 100], [380, 100], [380, 40], [18, 40], [18, 100], [30, 100]]) + dot(380, 100);
      s += t(318, 146, '180°', { a: 'm', b: 1, size: 14, c: C.orange }) + t(318, 164, '반전 증폭', { a: 'm', size: 13, c: C.sub, ans: 1 });
      s += t(424, 80, '180°', { a: 'm', b: 1, c: C.orange }) + t(424, 102, '+ 180°', { a: 'm', b: 1, c: C.purple }) + t(424, 128, '= 0°', { a: 'm', b: 1, size: 17, c: C.green, ans: 1 });
      s += t(140, 24, '되먹임 — CR 3단', { a: 'm', size: 13, b: 1, c: C.purple });
      s += t(240, 222, 'f = 1 / (2π√6 RC)', { a: 'm', b: 1, size: 16, ans: 1 });
      return F.svg(480, 240, s);
    } },

  wien: {
    cap: '빈 브리지 발진 — 비반전 증폭기에 직렬 RC 와 병렬 RC(진상-지상 회로)를 붙인다. A = 3',
    draw: function () {
      var s = amp(282, 120, 356, 'A = 3', { h: 32, size: 14, fill: C.greenL, c: C.green, ans: 1 });
      s += wire([[356, 120], [410, 120], [410, 40], [370, 40]]) + dot(410, 120) + wire([[410, 120], [440, 120]]) + term(444, 120) + t(444, 100, '출력', { a: 'm', size: 13, b: 1 });
      s += res(370, 40, 300, 40) + wire([[300, 40], [290, 40]]) + cap(290, 40, 236, 40) + wire([[236, 40], [200, 40], [200, 120], [282, 120]]);
      s += dot(200, 120) + wire([[200, 120], [120, 120], [120, 136]]) + dot(170, 120) + wire([[170, 120], [170, 144]]) + res(120, 136, 120, 200) + cap(170, 144, 170, 200) + wire([[120, 200], [120, 210], [170, 210], [170, 200]]) + gnd(145, 210);
      s += t(335, 22, 'R', { a: 'm', b: 1 }) + t(263, 22, 'C', { a: 'm', b: 1 }) + t(106, 168, 'R', { a: 'e', b: 1 }) + t(184, 172, 'C', { b: 1 });
      s += t(300, 64, '직렬 RC', { a: 'm', size: 13, b: 1, c: C.blue }) + t(70, 110, '병렬 RC', { a: 'm', size: 13, b: 1, c: C.blue });
      s += box(96, 28, 300, 196, { fill: 'none', c: C.blue, r: 10, w: 1.2 }).replace('stroke-width="1.2"', 'stroke-width="1.2" stroke-dasharray="6 5"');
      s += t(240, 244, '진상-지상 회로', { a: 'm', size: 13, b: 1, c: C.blue, ans: 1 });
      s += t(318, 176, 'f = 1 / (2πRC)', { b: 1, size: 14, ans: 1 }) + t(318, 198, 'β = 1/3', { size: 13, c: C.sub, ans: 1 });
      return F.svg(480, 258, s);
    } },

  'lc-osc': {
    cap: 'LC 발진 — 되먹임 3자리(Z1·Z2·Z3)에 무엇을 넣느냐로 이름이 갈린다. 콜피츠는 C 가 둘, 하틀리는 L 이 둘',
    draw: function () {
      var s = '';
      function cell(cx, colp) {
        var o = '', xl = cx - 66, xr = cx + 66, yt = 64, yb = 150;
        o += t(cx, 22, colp ? '콜피츠' : '하틀리', { a: 'm', b: 1, size: 18, c: colp ? C.blue : C.red });
        o += wire([[xl, yt], [cx - 30, yt]]) + wire([[cx + 30, yt], [xr, yt]]) + wire([[xl, yb], [xr, yb]]) + dot(xl, yt) + dot(xr, yt) + gnd(cx, yb);
        o += colp ? ind(cx - 30, yt, cx + 30, yt, { c: C.red }) : cap(cx - 30, yt, cx + 30, yt, { c: C.blue });
        o += colp ? cap(xl, yt, xl, yb, { c: C.blue }) + cap(xr, yt, xr, yb, { c: C.blue }) : ind(xl, yt, xl, yb, { c: C.red }) + ind(xr, yt, xr, yb, { c: C.red });
        o += tx(cx, 44, colp ? 'Z_3 = L' : 'Z_3 = C', { a: 'm', size: 13, b: 1 });
        o += tx(xl - 16, 108, colp ? 'C_1' : 'L_1', { a: 'e', size: 14, b: 1 }) + tx(xr + 16, 108, colp ? 'C_2' : 'L_2', { size: 14, b: 1 });
        o += t(cx, 190, colp ? 'C 가 둘 · L 하나' : 'L 이 둘 · C 하나', { a: 'm', b: 1, size: 15, c: colp ? C.blue : C.red });
        return o;
      }
      s += cell(120, true) + cell(360, false) + line(240, 14, 240, 200, { c: C.edge, w: 1.2 });
      s += t(240, 226, '증폭기 180° + 되먹임 180° → 위상차 0°', { a: 'm', size: 13, c: C.sub });
      return F.svg(480, 242, s);
    } },

  crystal: {
    cap: '수정 진동자 — 기호와 등가 회로. 직렬 Ls·Cs 로 발진 주파수가 정해지고 매우 안정하다',
    draw: function () {
      var s = t(90, 24, '기호', { a: 'm', b: 1 });
      s += wire([[30, 100], [76, 100]]) + line(78, 78, 78, 122, { w: 2.6 }) + box(84, 72, 16, 56, { fill: '#fff', c: C.ink, r: 1, w: 1.8 }) + line(106, 78, 106, 122, { w: 2.6 }) + wire([[108, 100], [150, 100]]);
      s += t(180, 100, '=', { a: 'm', b: 1, size: 26 });
      s += t(330, 24, '등가 회로', { a: 'm', b: 1 });
      s += wire([[210, 80], [214, 80]]) + res(214, 80, 274, 80, { c: C.sub }) + ind(274, 80, 350, 80, { c: C.blue }) + cap(350, 80, 406, 80, { c: C.blue }) + wire([[406, 80], [450, 80]]);
      s += wire([[210, 80], [210, 150], [300, 150]]) + cap(300, 150, 360, 150, { c: C.sub }) + wire([[360, 150], [450, 150], [450, 80]]) + dot(210, 80) + dot(450, 80);
      s += tx(244, 58, 'R_s', { a: 'm', b: 1, c: C.sub }) + tx(312, 58, 'L_s', { a: 'm', b: 1, c: C.blue }) + tx(378, 58, 'C_s', { a: 'm', b: 1, c: C.blue }) + tx(330, 176, 'C_p', { a: 'm', b: 1, c: C.sub });
      s += box(60, 196, 360, 40, { fill: C.blueL, c: C.blue, r: 8, w: 1.2 }) + tx(240, 216, 'f = 1 / (2π√(L_s C_s))', { a: 'm', b: 1, size: 16, ans: 1 });
      return F.svg(480, 250, s);
    } },

  'ujt-osc': {
    cap: 'UJT 발진 — C 가 R 로 충전되다 VP 에 이르면 순간 방전해 펄스를 낸다. R·C 가 클수록 주파수는 작다',
    draw: function () {
      var s = line(40, 30, 200, 30, { w: 2.4 }) + tx(204, 30, '+V_{BB}', { size: 13, b: 1 });
      s += dot(60, 30) + res(60, 30, 60, 146) + dot(60, 146) + cap(60, 146, 60, 212, { c: C.green }) + gnd(60, 212);
      s += wire([[60, 146], [110, 146]]) + line(110, 146, 142, 128, { w: 2 }) + ahead(142, 128, 32, -18, 9, C.ink);
      s += line(146, 94, 146, 162, { w: 3.2 }) + wire([[146, 104], [176, 104], [176, 92]]) + dot(176, 30) + res(176, 30, 176, 92) + wire([[146, 152], [176, 152], [176, 160]]) + res(176, 160, 176, 212) + gnd(176, 212);
      s += dot(176, 160) + wire([[176, 160], [214, 160]]) + term(218, 160) + t(218, 180, '출력', { a: 'm', size: 13, b: 1 });
      s += t(46, 88, 'R', { a: 'e', b: 1 }) + t(46, 180, 'C', { a: 'e', b: 1, c: C.green }) + tx(190, 62, 'R_2', { size: 13, b: 1 }) + tx(190, 188, 'R_1', { size: 13, b: 1 });
      s += t(98, 132, 'E', { a: 'm', size: 13, b: 1 }) + t(156, 118, 'B2', { size: 12, b: 1 }) + t(156, 142, 'B1', { size: 12, b: 1 });
      var X0 = 256, X1 = 466, yb = 128, top = 50, low = 100, p = [], per = 70;
      for (var x = X0; x <= X1; x += 1) {
        var ph = (x - X0) % per, v = ph < 64 ? low - (low - top) * (1 - Math.exp(-ph / 26)) / (1 - Math.exp(-64 / 26)) : top + (low - top) * (ph - 64) / 6;
        if (x - X0 < 64 && x - X0 >= 0 && (x - X0) < per) v = yb - (yb - top) * (1 - Math.exp(-ph / 26)) / (1 - Math.exp(-64 / 26));
        p.push([x, v]);
      }
      s += line(X0, yb, X1, yb, { w: 1, c: C.line }) + poly(p, { w: 2.4, c: C.green }) + guide(X0, top, X1, top) + tx(X1, top - 12, 'V_P', { a: 'e', size: 13, b: 1 });
      s += tx(X0, 30, 'C 의 전압 V_E', { size: 13, b: 1, c: C.green });
      s += line(X0, 210, X1, 210, { w: 1, c: C.line });
      for (var k = 0; k < 3; k++) { var xp = X0 + 64 + k * per; s += poly([[X0 + k * per, 210], [xp, 210], [xp + 1, 172], [xp + 6, 210], [X0 + (k + 1) * per, 210]], { w: 2.4, c: C.orange }); }
      s += t(X0, 156, '출력 펄스 (방전 순간)', { size: 13, b: 1, c: C.orange });
      s += t(240, 244, 'R·C 가 클수록 주기 ↑ → 발진 주파수 ↓', { a: 'm', size: 14, b: 1, c: C.purple });
      return F.svg(480, 260, s);
    } },

  duty: {
    cap: '듀티비 — 한 주기 T 중 HIGH 인 시간(펄스폭 tw)의 비율',
    draw: function () {
      var s = '', lo = 150, hi = 70, T = 120, tw = 90, x0 = 40, p = [[20, lo]];
      for (var k = 0; k < 3; k++) { var a = x0 + k * T; p.push([a, lo], [a, hi], [a + tw, hi], [a + tw, lo]); }
      p.push([x0 + 3 * T, lo], [x0 + 3 * T, hi], [466, hi]);
      s += poly(p, { w: 2.6, c: C.blue });
      s += guide(x0, hi, x0, 44) + guide(x0 + tw, hi, x0 + tw, 44) + arrow(x0, 50, x0 + tw, 50, { both: 1, w: 1.2, head: 8, c: C.orange });
      s += tx(x0 + tw / 2, 34, '펄스폭 t_w', { a: 'm', b: 1, size: 14, c: C.orange });
      s += guide(x0 + T, lo, x0 + T, 176) + guide(x0, lo, x0, 176) + arrow(x0, 170, x0 + T, 170, { both: 1, w: 1.2, head: 8, c: C.purple });
      s += t(x0 + T / 2, 188, '주기 T', { a: 'm', b: 1, size: 14, c: C.purple });
      s += box(240, 164, 226, 50, { fill: C.yellowL, c: C.orange, r: 8, w: 1.2 });
      s += tx(353, 180, '듀티비 = t_w / T × 100 [%]', { a: 'm', b: 1, size: 14 }) + t(353, 201, '예) 3 ms / 4 ms → 75%', { a: 'm', size: 13, halo: false });
      return F.svg(480, 226, s);
    } },

  'pulse-terms': {
    cap: '실제 펄스 파형 — 상승·하강에 시간이 걸리고, 넘치고(오버슈트) 흔들리고(링잉) 처진다(새그)',
    draw: function () {
      var s = '', y0 = 246, H = 150, yl = function (f) { return y0 - H * f; };
      function ss(u) { u = Math.max(0, Math.min(1, u)); return u * u * (3 - 2 * u); }
      var p = [];
      for (var x = 20; x <= 466; x += 1) {
        var v = 0;
        if (x >= 60 && x < 140) v = ss((x - 60) / 80);
        else if (x >= 140 && x < 320) { var d = x - 140; v = 1 - 0.1 * d / 180 + 0.14 * Math.exp(-d / 16) * Math.cos(d / 5); }
        else if (x >= 320 && x < 390) v = 0.9 * (1 - ss((x - 320) / 70));
        else if (x >= 390) { var e = x - 390; v = -0.1 * Math.exp(-e / 14) * Math.cos(e / 5); }
        p.push([x, yl(v)]);
      }
      [0.1, 0.5, 0.9].forEach(function (f) { s += line(20, yl(f), 466, yl(f), { w: 1, c: C.grayM, dash: '4 4' }) + t(470, yl(f), f * 100 + '%', { a: 'e', size: 12, c: C.sub, ans: 1 }); });
      s += poly(p, { w: 2.8, c: C.blue });
      var r10 = 60 + 80 * 0.196, r90 = 60 + 80 * 0.804, f90 = 320 + 70 * 0.13, f10 = 320 + 70 * 0.81;
      s += guide(r10, yl(0.1), r10, 44) + guide(r90, yl(0.9), r90, 44) + arrow(r10, 50, r90, 50, { both: 1, w: 1.2, head: 7, c: C.orange }) + tx((r10 + r90) / 2, 34, 't_r', { a: 'm', b: 1, c: C.orange });
      s += guide(60, y0, 60, 276) + guide(r10, yl(0.1), r10, 276) + arrow(60, 270, r10, 270, { both: 1, w: 1.2, head: 6, c: C.purple }) + tx(46, 270, 't_d', { a: 'e', b: 1, c: C.purple });
      s += guide(f90, yl(0.88), f90, 276) + guide(f10, yl(0.1), f10, 276) + arrow(f90, 270, f10, 270, { both: 1, w: 1.2, head: 7, c: C.orange }) + tx(f10 + 8, 270, 't_f', { b: 1, c: C.orange });
      s += arrow(100, yl(0.5), 350, yl(0.5), { both: 1, w: 1.4, head: 8, c: C.green }) + tx(226, yl(0.5) + 16, '펄스폭 t_w', { a: 'm', b: 1, c: C.green, size: 14 });
      s += callout(146, yl(1.12), 176, 60, '오버슈트', { c: C.red, tc: C.red, b: 1, ans: 1 }) + callout(170, yl(1.0), 216, 92, '링잉', { c: C.purple, tc: C.purple, b: 1, ans: 1 }) +
        callout(290, yl(0.915), 310, 60, '새그', { c: C.orange, tc: C.orange, b: 1, ans: 1 }) + callout(400, yl(-0.09), 376, 222, '언더슈트', { c: C.red, tc: C.red, b: 1, a: 'e', ans: 1 });
      return F.svg(480, 290, s);
    } },

  tau: {
    cap: '시상수 τ — 최종값의 63.2 % 에 이르는 시간. τ 가 작을수록 충전이 빠르다',
    draw: function () {
      var s = axes(60, 214, 460, 34, 't', '충전 전압');
      var top = 54, H = 160;
      s += guide(60, top, 450, top) + t(54, top, '100%', { a: 'e', size: 12, b: 1 });
      s += plot(function (u) { return 1 - Math.exp(-u * 390 / 70); }, 60, 450, 214, H, { c: C.blue, w: 3 });
      s += plot(function (u) { return 1 - Math.exp(-u * 390 / 32); }, 60, 450, 214, H, { c: C.green, w: 2, dash: '6 4' });
      var y63 = 214 - H * 0.632;
      s += guide(130, 214, 130, y63) + guide(60, y63, 130, y63) + dot(130, y63, C.orange, 5);
      s += t(54, y63, '63.2%', { a: 'e', size: 12, b: 1, c: C.orange, ans: 1 }) + t(130, 230, 'τ', { a: 'm', b: 1, size: 17, c: C.orange });
      s += t(118, 84, 'τ 작음 → 빠름', { size: 13, b: 1, c: C.green, ans: 1 });
      s += box(270, 120, 180, 66, { fill: C.blueL, c: C.blue, r: 8, w: 1.2 });
      s += t(360, 141, 'RC 직렬  τ = RC', { a: 'm', b: 1, size: 14, halo: false, ans: 1 }) + t(360, 166, 'RL 직렬  τ = L / R', { a: 'm', b: 1, size: 14, halo: false, ans: 1 });
      return F.svg(480, 244, s);
    } },

  'rc-pulse': {
    cap: 'RC 회로의 펄스 응답 — 시상수가 작으면 입력 모양을 거의 따라가고, 크면 천천히 오르내린다',
    draw: function () {
      var s = '', X0 = 96, X1 = 466, P = 185;
      function sq(u) { return ((u * (X1 - X0)) % P) < P / 2 ? 1 : 0; }
      function rc(tau) {
        var p = [], v = 0;
        for (var x = X0; x <= X1; x++) { var tgt = sq((x - X0) / (X1 - X0)); v += (tgt - v) * (1 - Math.exp(-1 / tau)); p.push([x, v]); }
        return p;
      }
      var rows = [['입력', null, C.ink], ['τ 작음', 8, C.green], ['τ 큼', 55, C.red]];
      rows.forEach(function (r, i) {
        var base = 76 + i * 74, A = 44;
        s += t(16, base - 20, r[0], { b: 1, size: 15, c: r[2] }) + line(X0, base, X1, base, { w: 1, c: C.line });
        if (!r[1]) s += plot(function (u) { return sq(u); }, X0, X1, base, A, { c: C.ink, w: 2.4, n: 740 });
        else s += poly(rc(r[1]).map(function (q) { return [q[0], base - A * q[1]]; }), { w: 2.6, c: r[2] });
      });
      s += t(16, 90, '(직사각형파)', { size: 12, c: C.sub }) + t(16, 164, '빨리 충·방전', { size: 12, c: C.sub }) + t(16, 238, '천천히', { size: 12, c: C.sub });
      return F.svg(480, 254, s);
    } },

  ic555: {
    cap: '타이머 IC 555 내부 — 같은 저항 3개가 ⅓·⅔VCC 를 만들고, 비교기 2개와 RS 플립플롭이 출력을 정한다',
    draw: function () {
      var s = '', X = 90;
      s += tx(X, 20, '8  V_{CC}', { a: 'm', size: 13, b: 1, ans: 1 }) + term(X, 34) + wire([[X, 38], [X, 48]]);
      s += res(X, 48, X, 100) + res(X, 116, X, 168) + res(X, 184, X, 236) + wire([[X, 100], [X, 116]]) + wire([[X, 168], [X, 184]]) + wire([[X, 236], [X, 250]]) + gnd(X, 250);
      s += t(X - 14, 270, '1 접지', { a: 'e', size: 13, b: 1 });
      s += dot(X, 108) + dot(X, 176) + t(X - 12, 108, '⅔', { a: 'e', size: 14, b: 1, c: C.red, ans: 1 }) + t(X - 12, 176, '⅓', { a: 'e', size: 14, b: 1, c: C.blue, ans: 1 });
      s += wire([[X, 108], [30, 108]]) + term(26, 108) + t(20, 90, '5 제어', { size: 13, b: 1 });
      /* 비교기 1 (스레시홀드) */
      s += oa(210, 108, { plusTop: true }) + wire([[X, 108], [130, 108], [130, 122], [168, 122]]) + wire([[168, 94], [146, 94], [146, 40]]) + term(146, 36) + t(154, 30, '6 스레시홀드', { size: 13, b: 1, ans: 1 });
      /* 비교기 2 (트리거) */
      s += oa(210, 196, { plusTop: true }) + wire([[X, 176], [130, 176], [130, 182], [168, 182]]) + wire([[168, 210], [146, 210], [146, 262]]) + term(146, 266) + t(154, 272, '2 트리거', { size: 13, b: 1, ans: 1 });
      /* 플립플롭 */
      s += box(280, 88, 70, 128, { fill: C.purpleL, c: C.purple, r: 6 }) + t(315, 152, 'RS\nF/F', { a: 'm', b: 1, size: 14, halo: false });
      s += wire([[254, 108], [280, 108]]) + t(288, 108, 'R', { size: 13, b: 1, halo: false }) + wire([[254, 196], [280, 196]]) + t(288, 196, 'S', { size: 13, b: 1, halo: false });
      s += wire([[315, 88], [315, 60]]) + term(315, 56) + t(323, 48, '4 리셋', { size: 13, b: 1 });
      s += buf(372, 130, { w: 30, h: 15 }) + wire([[350, 130], [372, 130]]) + wire([[402, 130], [430, 130]]) + term(434, 130) + t(434, 110, '3 출력', { a: 'm', size: 13, b: 1, c: C.orange });
      s += bjt(392, 234, {}) + wire([[350, 200], [362, 200], [362, 234], [370, 234]]) + wire([[406, 268], [406, 276]]) + gnd(406, 276) + wire([[406, 200], [406, 176], [440, 176]]) + term(444, 176) + t(444, 196, '7 방전', { a: 'm', size: 13, b: 1, c: C.green });
      s += t(210, 62, '비교기 1', { a: 'm', size: 12, c: C.sub }) + t(210, 244, '비교기 2', { a: 'm', size: 12, c: C.sub });
      return F.svg(480, 298, s);
    } },

  schmitt: {
    cap: '슈밋 트리거 — 올라갈 때와 내려갈 때 출력이 바뀌는 입력 전압이 다르다(히스테리시스)',
    draw: function () {
      var s = '', X0 = 110, X1 = 462, c = 92, A = 58, up = 0.35, dn = -0.35;
      function f(u) { return sin(u, 2) + 0.12 * sin(u, 23); }
      s += t(16, 70, '입력', { b: 1, size: 15 });
      s += guide(X0, c - A * up, X1, c - A * up) + guide(X0, c - A * dn, X1, c - A * dn);
      s += tx(X0 - 4, c - A * up, 'V_{UT}', { a: 'e', size: 13, b: 1, c: C.orange }) + tx(X0 - 4, c - A * dn, 'V_{LT}', { a: 'e', size: 13, b: 1, c: C.blue });
      s += plot(f, X0, X1, c, A, { c: C.ink, w: 2.2, n: 600 });
      var state = 0, xs = [], N = 700;
      for (var i = 0; i <= N; i++) { var u = i / N, v = f(u), ns = state; if (!state && v > up) ns = 1; if (state && v < dn) ns = 0; if (ns !== state) xs.push([X0 + (X1 - X0) * u, ns]); state = ns; }
      var lo = 222, hi = 180, p = [[X0, f(0) > 0 ? lo : lo]], cur = lo;
      xs.forEach(function (q) { p.push([q[0], cur]); cur = q[1] ? hi : lo; p.push([q[0], cur]); s += guide(q[0], c - A * (q[1] ? up : dn), q[0], cur); });
      p.push([X1, cur]);
      s += t(16, 200, '출력', { b: 1, size: 15 }) + poly(p, { w: 2.8, c: C.green });
      s += t(286, 18, '↑ 올라갈 땐 V', { a: 'e', size: 13, c: C.orange, b: 1 }) + tx(288, 18, '_{UT} 에서 H', { size: 13, c: C.orange, b: 1 });
      s += t(286, 246, '↓ 내려갈 땐 V', { a: 'e', size: 13, c: C.blue, b: 1 }) + tx(288, 246, '_{LT} 에서 L', { size: 13, c: C.blue, b: 1 });
      return F.svg(480, 262, s);
    } },

  'clip-clamp': {
    cap: '파형 정형 — 클리퍼는 일부를 잘라 내고(위·아래 다 자르면 슬라이서), 클램퍼는 모양은 두고 기준만 옮긴다',
    draw: function () {
      var s = '', X0 = 150, X1 = 466;
      var rows = [['클리퍼', '위를 잘라 냄', function (u) { return Math.min(sin(u, 2), 0.45); }, 0],
        ['슬라이서', '위·아래를 잘라 냄', function (u) { return Math.max(-0.45, Math.min(sin(u, 2), 0.45)); }, 0],
        ['클램퍼', '기준 레벨을 옮김', function (u) { return sin(u, 2) + 1; }, 1]];
      rows.forEach(function (r, i) {
        var c = 58 + i * 86, A = 28;
        if (r[3]) c += 16;
        s += t(16, c - 10, r[0], { b: 1, size: 16 }) + t(16, c + 12, r[1], { size: 13, c: C.sub });
        s += line(X0, c, X1, c, { w: 1, c: C.line });
        s += plot(function (u) { return sin(u, 2); }, X0, X1, c, A, { c: C.sub, w: 1.4, dash: '5 4' });
        s += plot(r[2], X0, X1, c, A, { c: [C.orange, C.purple, C.green][i], w: 3 });
      });
      s += t(X1, 14, '- - 입력   — 출력', { a: 'e', size: 13, c: C.sub });
      return F.svg(480, 276, s);
    } },

  /* ═════════════ Ⅴ. 변복조 회로 ═════════════ */

  'mod-terms': {
    cap: '변조 — 느린 정보 신호를 빠른 반송파에 실은 것이 피변조파. 봉우리를 이은 포락선이 정보 신호 모양이다',
    draw: function () {
      var s = '', X0 = 116, X1 = 466;
      s += t(16, 52, '정보 신호', { b: 1, size: 15, c: C.green }) + t(16, 72, '(저주파)', { size: 12, c: C.sub });
      s += line(X0, 58, X1, 58, { w: 1, c: C.line }) + plot(function (u) { return sin(u, 1); }, X0, X1, 58, 28, { c: C.green, w: 2.6 });
      s += t(16, 134, '반송파', { b: 1, size: 15, c: C.blue }) + t(16, 154, '(고주파)', { size: 12, c: C.sub });
      s += line(X0, 140, X1, 140, { w: 1, c: C.line }) + plot(function (u) { return sin(u, 14); }, X0, X1, 140, 24, { c: C.blue, w: 1.8, n: 700 });
      s += t(16, 226, '피변조파', { b: 1, size: 15, c: C.ink }) + t(16, 246, '(AM)', { size: 12, c: C.sub });
      var env = function (u) { return 0.62 + 0.38 * sin(u, 1); };
      s += line(X0, 232, X1, 232, { w: 1, c: C.line }) + plot(function (u) { return env(u) * sin(u, 14); }, X0, X1, 232, 40, { c: C.ink, w: 1.8, n: 700 });
      s += plot(env, X0, X1, 232, 40, { c: C.orange, w: 2.2, dash: '6 4' }) + plot(function (u) { return -env(u); }, X0, X1, 232, 40, { c: C.orange, w: 2.2, dash: '6 4' });
      s += callout(210, 232 - 40 * env(0.27), 250, 180, '포락선 = 정보 신호 모양', { c: C.orange, tc: C.orange, b: 1 });
      s += t(290, 100, '＋', { a: 'm', b: 1, size: 18, c: C.sub }) + t(56, 190, '↓ 싣는다', { a: 'm', b: 1, size: 13, c: C.sub });
      return F.svg(480, 290, s);
    } },

  'freq-band': {
    cap: '주파수 대역 — AM 라디오는 1 MHz대, FM 라디오는 100 MHz대, 휴대 전화는 1 GHz대(로그 눈금)',
    draw: function () {
      var s = '', y = 96, lg = function (f) { return 40 + 80 * (Math.log10(f) - 5); };
      s += arrow(30, y, 462, y, { w: 1.8, head: 9 });
      [[1e5, '100 kHz'], [1e6, '1 MHz'], [1e7, '10 MHz'], [1e8, '100 MHz'], [1e9, '1 GHz'], [1e10, '10 GHz']].forEach(function (q) {
        var x = lg(q[0]); s += line(x, y - 6, x, y + 6, { w: 1.6 }) + t(x, y + 22, q[1], { a: 'm', size: 13 });
      });
      var am = [lg(535e3), lg(1605e3)], fm = [lg(88e6), lg(108e6)];
      s += box(am[0], y - 26, am[1] - am[0], 18, { fill: C.orange, c: C.orange, r: 3 }) + t((am[0] + am[1]) / 2, y - 44, 'AM 라디오', { a: 'm', b: 1, c: C.orange, size: 15 });
      s += t((am[0] + am[1]) / 2, 22, '535~1,605 kHz', { a: 'm', size: 12, c: C.orange });
      s += box(fm[0] - 3, y - 26, fm[1] - fm[0] + 6, 18, { fill: C.blue, c: C.blue, r: 3 }) + t((fm[0] + fm[1]) / 2, y - 44, 'FM 라디오', { a: 'm', b: 1, c: C.blue, size: 15 });
      s += t((fm[0] + fm[1]) / 2, 22, '88~108 MHz', { a: 'm', size: 12, c: C.blue });
      s += box(lg(8e8), y - 26, lg(2e9) - lg(8e8), 18, { fill: C.green, c: C.green, r: 3 }) + t(lg(1.3e9), y - 44, '휴대 전화', { a: 'm', b: 1, c: C.green, size: 15 });
      s += t(240, 150, '용도별로 대역을 나눔 = 주파수 분배', { a: 'm', size: 13, b: 1, ans: 1 });
      return F.svg(480, 168, s);
    } },

  'am-index': {
    cap: '변조도 m — m < 1 정상, m = 1 최대(왜곡 없는 한계), m > 1 과변조(왜곡)',
    draw: function () {
      var s = '', X0 = 30, X1 = 300, c = 80, A = 48, mm = 0.45;
      var env = function (u) { return (1 + mm * sin(u, 1)) / (1 + mm); };
      s += line(X0, c, X1, c, { w: 1, c: C.line }) + plot(function (u) { return env(u) * sin(u, 12); }, X0, X1, c, A, { c: C.blue, w: 1.8, n: 600 });
      s += plot(env, X0, X1, c, A, { c: C.orange, w: 1.6, dash: '5 4' }) + plot(function (u) { return -env(u); }, X0, X1, c, A, { c: C.orange, w: 1.6, dash: '5 4' });
      var vmin = A * (1 - mm) / (1 + mm);
      s += guide(96, c - A, 336, c - A) + guide(96, c + A, 336, c + A) + arrow(330, c - A, 330, c + A, { both: 1, w: 1.4, head: 7, c: C.red }) + tx(342, c - 8, 'V_{max}', { b: 1, c: C.red });
      s += guide(232, c - vmin, 410, c - vmin) + guide(232, c + vmin, 410, c + vmin) + arrow(402, c - vmin, 402, c + vmin, { both: 1, w: 1.4, head: 7, c: C.purple }) + tx(412, c + 30, 'V_{min}', { b: 1, c: C.purple, size: 15 });
      s += box(40, 146, 400, 36, { fill: C.yellowL, c: C.orange, r: 8, w: 1.2 }) + tx(240, 164, 'm = (V_{max} − V_{min}) / (V_{max} + V_{min})', { a: 'm', b: 1, size: 15, ans: 1 });
      [[0.5, 'm < 1 정상', C.green], [1, 'm = 1 최대(한계)', C.orange], [1.6, 'm > 1 과변조', C.red]].forEach(function (q, i) {
        var x0 = 16 + i * 154, x1 = x0 + 140, cc = 236, m = q[0];
        s += line(x0, cc, x1, cc, { w: 1, c: C.line });
        s += plot(function (u) { return Math.max(0, 1 + m * sin(u, 1)) / (1 + m) * sin(u, 9); }, x0, x1, cc, 34, { c: q[2], w: 1.6, n: 500 });
        s += t(x0 + 70, 290, q[1], { a: 'm', b: 1, size: 14, c: q[2], ans: 1 });
      });
      return F.svg(480, 306, s);
    } },

  'am-detect': {
    cap: '포락선 검파 — 다이오드가 한쪽만 통과시키고, RC 가 충전·방전을 되풀이해 포락선(원래 신호)을 되살린다',
    draw: function () {
      var s = term(36, 60) + wire([[40, 60], [66, 60]]) + dio(66, 60, 136, 60, { c: C.blue, fill: C.blue }) + wire([[136, 60], [226, 60]]) + dot(160, 60) + dot(206, 60);
      s += cap(160, 60, 160, 126, { c: C.green }) + res(206, 60, 206, 126) + wire([[40, 126], [240, 126]]) + term(36, 126) + term(244, 126) + term(244, 60) + wire([[226, 60], [240, 60]]);
      s += t(101, 38, 'D', { a: 'm', b: 1, c: C.blue }) + t(146, 94, 'C', { a: 'e', b: 1, c: C.green }) + t(220, 94, 'R', { b: 1 });
      s += t(30, 92, '입력', { a: 'm', size: 13, b: 1 }) + t(254, 92, '출력', { size: 13, b: 1 });
      s += t(290, 54, 'C 충전 → D OFF', { size: 13, c: C.green, b: 1 }) + t(290, 76, '→ R 로 방전 (반복)', { size: 13, c: C.green, b: 1 }) + t(290, 106, '= 저주파 통과 필터', { size: 13, c: C.sub });
      var env = function (u) { return 0.62 + 0.38 * sin(u, 1); }, cells = [[16, '피변조파'], [172, '다이오드 통과'], [328, '포락선 = 원래 신호']];
      cells.forEach(function (q, i) {
        var x0 = q[0], x1 = x0 + 136, c = 216;
        s += line(x0, c, x1, c, { w: 1, c: C.line }) + t(x0 + 68, 166, q[1], { a: 'm', size: 13, b: 1 });
        if (i === 0) s += plot(function (u) { return env(u) * sin(u, 10); }, x0, x1, c, 34, { w: 1.6, c: C.ink, n: 500 });
        if (i === 1) s += plot(function (u) { return Math.max(0, env(u) * sin(u, 10)); }, x0, x1, c, 34, { w: 1.6, c: C.blue, n: 500 });
        if (i === 2) s += plot(function (u) { return env(u) - 0.05 * Math.abs(sin(u, 10)); }, x0, x1, c, 34, { w: 2.6, c: C.green, n: 500 });
        if (i < 2) s += arrow(x1 + 4, c - 10, x1 + 18, c - 10, { head: 7, w: 1.6 });
      });
      return F.svg(480, 262, s);
    } },

  fm: {
    cap: '주파수 변조(FM) — 진폭은 그대로, 정보 신호가 클 때 촘촘(주파수 ↑), 작을 때 성김(주파수 ↓)',
    draw: function () {
      var s = '', X0 = 116, X1 = 466, ph = [], N = 900;
      s += t(16, 60, '정보 신호', { b: 1, size: 15, c: C.green }) + line(X0, 64, X1, 64, { w: 1, c: C.line }) + plot(function (u) { return sin(u, 1); }, X0, X1, 64, 34, { c: C.green, w: 2.6 });
      s += t(16, 164, 'FM 파', { b: 1, size: 15, c: C.blue });
      var p = [], acc = 0;
      for (var i = 0; i <= N; i++) { var u = i / N; acc += (12 + 7 * sin(u, 1)) / N; p.push([X0 + (X1 - X0) * u, 168 - 32 * Math.sin(2 * Math.PI * acc)]); }
      s += line(X0, 168, X1, 168, { w: 1, c: C.line }) + poly(p, { w: 1.8, c: C.blue });
      var xp = X0 + (X1 - X0) * 0.25, xq = X0 + (X1 - X0) * 0.75;
      s += guide(xp, 30, xp, 206) + guide(xq, 30, xq, 206);
      s += t(xp, 222, '촘촘 — 주파수 ↑', { a: 'm', size: 13, b: 1, c: C.red }) + t(xq, 222, '성김 — 주파수 ↓', { a: 'm', size: 13, b: 1, c: C.blue });
      s += t(16, 190, '진폭 일정', { size: 12, c: C.sub });
      return F.svg(480, 238, s);
    } },

  'digital-mod': {
    cap: '디지털 변조 — 같은 1·0 을 ASK 는 진폭, FSK 는 주파수, PSK 는 위상으로 나타낸다',
    draw: function () {
      var s = '', bits = [1, 0, 1, 1, 0], X0 = 96, W = 72, X1 = X0 + W * 5;
      bits.forEach(function (b, i) { s += t(X0 + W * (i + 0.5), 20, String(b), { a: 'm', b: 1, size: 17, c: b ? C.orange : C.sub }); });
      for (var i = 0; i <= 5; i++) s += line(X0 + W * i, 32, X0 + W * i, 282, { w: 1, c: C.grayM, dash: '4 4' });
      function row(y, name, sub2, col, fn) {
        var p = [], N = 900;
        for (var k = 0; k <= N; k++) { var u = k / N, bi = Math.min(4, Math.floor(u * 5)), ul = u * 5 - bi; p.push([X0 + (X1 - X0) * u, y - 22 * fn(bits[bi], ul)]); }
        return t(14, y - 8, name, { b: 1, size: 15, c: col, ans: name !== '데이터' }) + t(14, y + 12, sub2, { size: 12, c: C.sub, ans: 1 }) + line(X0, y, X1, y, { w: 1, c: C.line }) + poly(p, { w: 1.8, c: col });
      }
      s += row(66, '데이터', '', C.ink, function (b) { return b ? 0.9 : -0.1; });
      s += row(130, 'ASK', '진폭', C.blue, function (b, ul) { return b ? Math.sin(2 * Math.PI * 2 * ul) : 0; });
      s += row(196, 'FSK', '주파수', C.green, function (b, ul) { return Math.sin(2 * Math.PI * (b ? 3 : 1) * ul); });
      s += row(262, 'PSK', '위상', C.purple, function (b, ul) { return (b ? 1 : -1) * Math.sin(2 * Math.PI * 2 * ul); });
      return F.svg(480, 294, s);
    } },

  'pulse-mod': {
    cap: '펄스 변조 — 같은 신호(점선)를 펄스의 진폭(PAM)·폭(PWM)·개수(PNM)·부호(PCM)로 나타낸다',
    draw: function () {
      var s = '', X0 = 110, W = 58, n = 6, H = 40;
      function sig(u) { return 0.5 + 0.4 * Math.sin(2 * Math.PI * u); }
      var rows = [['PAM', '진폭'], ['PWM', '폭'], ['PNM', '개수'], ['PCM', '부호']];
      rows.forEach(function (r, i) {
        var base = 70 + i * 70, col = [C.blue, C.orange, C.green, C.purple][i];
        s += t(14, base - 18, r[0], { b: 1, size: 15, c: col }) + t(14, base + 2, r[1], { size: 12, c: C.sub });
        s += line(X0, base, X0 + W * n, base, { w: 1, c: C.line });
        if (i < 3) s += plot(sig, X0, X0 + W * n, base, H, { c: C.sub, w: 1.2, dash: '4 4' });
        for (var k = 0; k < n; k++) {
          var v = sig((k + 0.5) / n), x = X0 + k * W;
          if (i === 0) s += box(x + 18, base - H * v, 22, H * v, { fill: C.blueL, c: C.blue, r: 1, w: 1.4 });
          if (i === 1) s += box(x + 6, base - H * 0.7, W * 0.85 * v, H * 0.7, { fill: C.orangeL, c: C.orange, r: 1, w: 1.4 });
          if (i === 2) { var m = Math.round(1 + 3 * v); for (var j = 0; j < m; j++) s += box(x + 6 + j * 12, base - H * 0.7, 7, H * 0.7, { fill: C.greenL, c: C.green, r: 1, w: 1.2 }); }
          if (i === 3) {
            var code = Math.round(v * 7), bs = [(code >> 2) & 1, (code >> 1) & 1, code & 1];
            bs.forEach(function (bit, j) { if (bit) s += box(x + 6 + j * 16, base - H * 0.7, 13, H * 0.7, { fill: C.purpleL, c: C.purple, r: 1, w: 1.2 }); });
            s += t(x + 29, base + 14, bs.join(''), { a: 'm', size: 13, b: 1, c: C.purple });
          }
        }
      });
      s += t(470, 332, 'PCM: 표본화 → 양자화 → 부호화', { a: 'e', size: 13, c: C.sub });
      return F.svg(480, 344, s);
    } },

  pll: {
    cap: 'PLL 로 FM 복조 — VCO 가 입력 주파수를 따라가고, 그 오차 전압(필터 통과)이 곧 복조 신호다',
    draw: function () {
      var s = box(80, 48, 116, 50, { fill: C.blueL, c: C.blue, label: '위상 비교기', size: 14 }) + box(236, 48, 110, 50, { fill: C.greenL, c: C.green, label: '저주파 필터', size: 14 }) +
        box(236, 136, 110, 50, { fill: C.orangeL, c: C.orange, label: 'VCO', size: 15 });
      s += arrow(20, 73, 78, 73, { head: 9 }) + t(20, 54, 'FM 입력', { size: 13, b: 1 });
      s += arrow(196, 73, 234, 73, { head: 9 }) + wire([[346, 73], [380, 73]]) + dot(380, 73) + arrow(380, 73, 456, 73, { head: 9, c: C.green, w: 2.4 });
      s += t(456, 54, '복조 출력', { a: 'e', size: 13, b: 1, c: C.green });
      s += F.route([[380, 73], [380, 161], [348, 161]], { head: 9 }) + F.route([[236, 161], [138, 161], [138, 100]], { head: 9 });
      s += t(390, 118, '오차 전압', { size: 13, c: C.sub }) + t(138, 204, '되먹임 — VCO 가 입력을 따라감', { size: 13, c: C.sub });
      return F.svg(480, 220, s);
    } },

  /* ═════════════ Ⅵ. 인터페이스 회로 ═════════════ */

  chattering: {
    cap: '채터링 — 기계식 스위치는 누르고 뗄 때 접점이 튀어 여러 번 눌린 것처럼 읽힌다',
    draw: function () {
      var s = '', X0 = 120, X1 = 466;
      function sig(base, hi, bounce) {
        var p = [[X0, base], [180, base]];
        if (bounce) p.push([180, hi], [186, hi], [186, base], [192, base], [192, hi], [199, hi], [199, base], [204, base], [204, hi]);
        else p.push([206, base], [206, hi]);
        p.push([350, hi]);
        if (bounce) p.push([350, base], [356, base], [356, hi], [362, hi], [362, base], [367, base], [367, hi], [371, hi], [371, base]);
        else p.push([372, hi], [372, base]);
        p.push([X1, base]);
        return p;
      }
      s += t(16, 60, '실제 스위치', { b: 1, size: 15, c: C.red }) + t(16, 80, '(기계식)', { size: 12, c: C.sub });
      s += poly(sig(90, 42, true), { w: 2.4, c: C.red });
      s += callout(192, 44, 226, 22, '접점이 튐 → 여러 번으로 읽힘', { c: C.red, tc: C.red, b: 1, size: 14, ans: 1 });
      s += t(16, 164, '방지 후', { b: 1, size: 15, c: C.green }) + t(16, 184, 'RC 충·방전 ·', { size: 12, c: C.sub, ans: 1 }) + t(16, 200, 'RS F/F 기억', { size: 12, c: C.sub, ans: 1 });
      s += poly(sig(196, 148, false), { w: 2.6, c: C.green });
      s += t(265, 124, '누름', { a: 'm', size: 13, b: 1 }) + t(412, 124, '뗌', { a: 'm', size: 13, b: 1 });
      return F.svg(480, 216, s);
    } },

  pullup: {
    cap: '풀업·풀다운 — 스위치가 열려 있을 때 입력을 H(풀업) 또는 L(풀다운)로 붙잡아 둔다',
    draw: function () {
      var s = line(240, 12, 240, 256, { c: C.edge, w: 1.2 });
      function cell(cx, up) {
        var o = t(cx, 22, up ? '풀업' : '풀다운', { a: 'm', b: 1, size: 17, c: up ? C.orange : C.blue });
        var x = cx - 44, n = 124;
        o += line(x - 26, 46, x + 26, 46, { w: 2.4 }) + tx(x + 30, 46, '+V_{CC}', { size: 13, b: 1 });
        if (up) o += res(x, 46, x, n) + sw(x, n, x, 196) + gnd(x, 196) + t(x - 14, 86, 'R', { a: 'e', b: 1 });
        else o += sw(x, 46, x, n) + res(x, n, x, 196) + gnd(x, 196) + t(x - 14, 160, 'R', { a: 'e', b: 1 });
        o += dot(x, n) + wire([[x, n], [cx + 20, n]]) + buf(cx + 20, n, { w: 34, h: 16 }) + wire([[cx + 54, n], [cx + 70, n]]) + t(cx + 37, n + 30, 'IC 입력', { a: 'm', size: 12, c: C.sub });
        o += t(cx, 234, '스위치 열림 → ' + (up ? 'H' : 'L'), { a: 'm', b: 1, size: 14, c: up ? C.orange : C.blue });
        o += t(cx, 256, '스위치 닫힘 → ' + (up ? 'L' : 'H'), { a: 'm', size: 13, c: C.sub });
        return o;
      }
      s += cell(120, true) + cell(360, false);
      return F.svg(480, 272, s);
    } },

  phototr: {
    cap: '포토트랜지스터 회로(이미터 공통) — 빛을 비추면 ON 이 되어 출력 0 V, 빛을 막으면 OFF 로 출력 VCC',
    draw: function () {
      var s = line(240, 12, 240, 236, { c: C.edge, w: 1.2 });
      function cell(cx, lit) {
        var x = cx - 10, y = 128, o = t(cx, 22, lit ? '빛을 비추면' : '빛을 막으면', { a: 'm', b: 1, size: 16, c: lit ? C.orange : C.sub });
        o += line(x - 16, 46, x + 50, 46, { w: 2.4 }) + tx(x + 54, 46, 'V_{CC}', { size: 13, b: 1 });
        o += bjt(x, y, { noBase: true, c: lit ? C.green : C.ink }) + res(x + 14, 46, x + 14, 94) + wire([[x + 14, 162], [x + 14, 172]]) + gnd(x + 14, 172);
        o += tx(x + 28, 70, 'R_L', { size: 13, b: 1 });
        o += dot(x + 14, 94) + wire([[x + 14, 94], [x + 64, 94]]) + term(x + 68, 94) + tx(x + 68, 74, 'V_{out}', { a: 'm', size: 13, b: 1 });
        if (lit) o += arrow(x - 58, y - 38, x - 30, y - 12, { c: C.orange, w: 2, head: 8 }) + arrow(x - 64, y - 20, x - 36, y + 6, { c: C.orange, w: 2, head: 8 });
        else o += arrow(x - 70, y - 38, x - 58, y - 27, { c: C.grayM, w: 2, head: 8 }) + box(x - 56, y - 44, 10, 46, { fill: C.grayM, c: C.ink, r: 2, w: 1.2 });
        o += tx(cx, 208, lit ? 'ON → V_{out} = 0 V' : 'OFF → V_{out} = V_{CC}', { a: 'm', b: 1, size: 15, c: lit ? C.green : C.red });
        return o;
      }
      s += cell(120, true) + cell(360, false);
      return F.svg(480, 240, s);
    } },

  thermistor: {
    cap: '서미스터 — 온도가 오를 때 저항이 늘면 PTC, 줄면 NTC',
    draw: function () {
      var s = axes(60, 206, 456, 30, '온도', '저항');
      s += F.path('M70,186 C200,184 300,170 350,120 C380,90 400,60 420,44', { w: 3, c: C.red });
      s += F.path('M70,50 C130,120 200,160 300,178 C360,186 410,188 440,188', { w: 3, c: C.blue });
      s += t(412, 76, 'PTC', { a: 'e', b: 1, size: 17, c: C.red }) + t(412, 98, '양의 온도 특성', { a: 'e', size: 13, c: C.red });
      s += t(140, 84, 'NTC', { b: 1, size: 17, c: C.blue }) + t(140, 106, '음의 온도 특성', { size: 13, c: C.blue });
      return F.svg(480, 236, s);
    } },

  hbridge: {
    cap: 'H 브리지 — SW1·SW4 가 닫히면 정회전, SW2·SW3 이 닫히면 전류가 반대로 흘러 역회전',
    draw: function () {
      var s = line(240, 12, 240, 250, { c: C.edge, w: 1.2 });
      function cell(cx, fwd) {
        var xl = cx - 62, xr = cx + 62, top = 50, bot = 212, mid = 132, col = fwd ? C.orange : C.blue, o = '';
        o += t(cx, 22, fwd ? '정회전 — SW1·SW4 ON' : '역회전 — SW2·SW3 ON', { a: 'm', b: 1, size: 15, c: col, ans: !fwd });
        o += line(xl - 10, top, xr + 10, top, { w: 2.4 }) + t(cx, top - 12, '+V', { a: 'm', size: 13, b: 1 }) + line(xl - 10, bot, xr + 10, bot, { w: 2.4 }) + gnd(cx, bot);
        o += sw(xl, top, xl, mid, { on: fwd, c: fwd ? col : C.ink }) + sw(xr, top, xr, mid, { on: !fwd, c: !fwd ? col : C.ink }) +
          sw(xl, mid, xl, bot, { on: !fwd, c: !fwd ? col : C.ink }) + sw(xr, mid, xr, bot, { on: fwd, c: fwd ? col : C.ink });
        o += dot(xl, mid) + dot(xr, mid) + wire([[xl, mid], [cx - 17, mid]]) + wire([[cx + 17, mid], [xr, mid]]) + motor(cx, mid, 17);
        o += tx(xl - 12, 84, 'SW1', { a: 'e', size: 13, b: 1 }) + tx(xr + 12, 84, 'SW2', { size: 13, b: 1 }) + tx(xl - 12, 180, 'SW3', { a: 'e', size: 13, b: 1 }) + tx(xr + 12, 180, 'SW4', { size: 13, b: 1 });
        var path = fwd ? [[xl + 14, top + 10], [xl + 14, mid - 12], [xr - 14, mid - 12], [xr - 14, bot - 10]] : [[xr - 14, top + 10], [xr - 14, mid - 12], [xl + 14, mid - 12], [xl + 14, bot - 10]];
        o += F.route(path, { c: col, w: 2, head: 8, flow: true });
        return o;
      }
      s += cell(120, true) + cell(360, false);
      return F.svg(480, 250, s);
    } },

  fnd: {
    cap: 'FND(7세그먼트) — LED 7개(a~g)와 소수점(dp). 숫자 1 은 b·c 만 켠다. 공통 단자에 따라 두 유형',
    draw: function () {
      var s = '';
      function seg(ox, lit) {
        var o = '', S = { a: [[15, 10], [65, 10]], b: [[72, 16], [72, 70]], c: [[72, 86], [72, 140]], d: [[15, 146], [65, 146]], e: [[8, 86], [8, 140]], f: [[8, 16], [8, 70]], g: [[15, 78], [65, 78]] };
        Object.keys(S).forEach(function (k) {
          var on = lit && lit.indexOf(k) >= 0, p = S[k];
          o += line(ox + p[0][0], 30 + p[0][1], ox + p[1][0], 30 + p[1][1], { w: 10, c: on ? C.red : (lit ? C.grayL : C.grayM) });
        });
        o += '<circle cx="' + (ox + 86) + '" cy="' + 178 + '" r="5.5" fill="' + (lit ? C.grayL : C.grayM) + '"/>';
        return o;
      }
      s += seg(30, null) + seg(160, ['b', 'c']);
      var L = { a: [70, 26], b: [116, 72], c: [116, 144], d: [70, 190], e: [22, 144], f: [22, 72], g: [70, 96] };
      Object.keys(L).forEach(function (k) { s += t(L[k][0], L[k][1], k, { a: 'm', b: 1, size: 15, c: C.blue }); });
      s += t(128, 192, 'dp', { size: 13, b: 1, c: C.blue });
      s += t(70, 222, 'a~g + dp', { a: 'm', b: 1, size: 14 }) + t(200, 222, '숫자 1 = b · c', { a: 'm', b: 1, size: 14, c: C.red, ans: 1 });
      s += line(262, 16, 262, 232, { c: C.edge, w: 1.2 });
      /* 두 유형 */
      s += t(370, 22, '캐소드 공통형', { a: 'm', b: 1, size: 14, ans: 1 });
      [310, 350, 390].forEach(function (x) { s += dio(x, 40, x, 88, { kind: 'led' }) + term(x, 36); });
      s += wire([[310, 88], [310, 96], [430, 96]]) + wire([[350, 88], [350, 96]]) + wire([[390, 88], [390, 96]]) + t(434, 96, '(−)', { b: 1, size: 13, c: C.blue });
      s += t(370, 116, '각 애노드에 (+)', { a: 'm', size: 12, c: C.sub });
      s += t(370, 142, '애노드 공통형', { a: 'm', b: 1, size: 14, ans: 1 });
      s += wire([[310, 160], [430, 160]]) + t(434, 160, '(+)', { b: 1, size: 13, c: C.red });
      [310, 350, 390].forEach(function (x) { s += wire([[x, 160], [x, 168]]) + dio(x, 168, x, 212, { kind: 'led' }) + term(x, 216); });
      s += t(370, 234, '켤 자리에 0 을 준다', { a: 'm', size: 12, c: C.sub, ans: 1 });
      return F.svg(480, 246, s);
    } },

  relay: {
    cap: '릴레이 — 코일에 전류가 흐르면 전자석이 철편을 당겨 접점이 바뀐다. 코일에는 역기전력용 다이오드를 병렬로',
    draw: function () {
      var s = t(128, 20, '동작 원리', { a: 'm', b: 1 });
      s += box(56, 118, 50, 86, { fill: C.orangeL, c: C.orange, r: 4 }) + box(70, 110, 22, 94, { fill: C.grayM, c: C.ink, r: 2, w: 1.2 });
      for (var k = 0; k < 6; k++) s += line(56, 126 + k * 13, 106, 132 + k * 13, { w: 1.4, c: C.orange });
      s += t(40, 160, '코일', { a: 'e', b: 1, size: 14, c: C.orange });
      s += dot(40, 96, C.ink, 5) + F.poly([[40, 96], [200, 82]], { w: 5, c: C.ink });
      s += t(100, 70, '철편', { a: 'm', b: 1, size: 14 });
      s += arrow(150, 100, 150, 122, { c: C.red, w: 2, head: 8 }) + t(160, 130, '당김', { size: 13, c: C.red, b: 1 });
      s += dot(200, 82, C.ink, 4) + line(214, 62, 244, 62, { w: 3 }) + line(214, 110, 244, 110, { w: 3 });
      s += t(250, 62, 'NC', { b: 1, size: 14, c: C.blue }) + t(250, 110, 'NO', { b: 1, size: 14, c: C.green }) + t(200, 100, 'C', { a: 'm', b: 1, size: 14 });
      s += line(206, 80, 216, 64, { w: 3, c: C.blue });
      s += t(128, 232, 'NC 평상시 닫힘 · NO 평상시 열림 · C 공통', { a: 'm', size: 13 });
      s += line(290, 16, 290, 248, { c: C.edge, w: 1.2 });
      s += t(384, 20, '코일 보호', { a: 'm', b: 1 });
      s += line(322, 46, 440, 46, { w: 2.4 }) + tx(444, 46, '+V', { size: 13, b: 1 });
      s += wire([[346, 46], [346, 70]]) + box(332, 70, 28, 80, { fill: C.orangeL, c: C.orange, r: 3, label: '', size: 13 }) + wire([[346, 150], [346, 180]]);
      s += wire([[346, 58], [410, 58], [410, 74]]) + dio(410, 146, 410, 74, { c: C.blue, fill: C.blue }) + wire([[410, 146], [410, 166], [346, 166]]) + dot(346, 58) + dot(346, 166);
      s += t(326, 110, '코일', { a: 'e', size: 13, b: 1, c: C.orange });
      s += t(346, 196, '→ 트랜지스터로 구동', { a: 'm', size: 12, c: C.sub });
      s += t(424, 100, '다이오드', { size: 13, b: 1, c: C.blue }) + t(424, 120, '병렬', { size: 13, c: C.blue });
      s += t(384, 226, '끊을 때 생기는', { a: 'm', size: 13, c: C.red }) + t(384, 244, '수백 V 역기전력 흡수', { a: 'm', size: 13, c: C.red, b: 1 });
      return F.svg(480, 258, s);
    } },

  stepper: {
    cap: '스테핑 모터 — 펄스 1개에 한 스텝씩. 회전 각도는 펄스 수에, 회전 속도는 펄스 주파수에 비례한다',
    draw: function () {
      var s = t(110, 24, '입력 펄스 4개', { a: 'm', b: 1 }), p = [[20, 140]];
      for (var k = 0; k < 4; k++) { var x = 36 + k * 44; p.push([x, 140], [x, 96], [x + 22, 96], [x + 22, 140]); s += F.num(x + 11, 76, k + 1, { c: C.orange, r: 10, size: 12 }); }
      p.push([210, 140]);
      s += poly(p, { w: 2.6, c: C.orange }) + arrow(222, 118, 262, 118, { w: 2.4, head: 10 });
      var cx = 350, cy = 118, R = 70;
      s += ring(cx, cy, R, { fill: C.grayL, w: 2 }) + ring(cx, cy, 8, { fill: C.ink, c: C.ink });
      for (var i = 0; i < 12; i++) {
        var a = -Math.PI / 2 + i * Math.PI / 6, on = i >= 1 && i <= 4;
        s += line(cx + (R - 14) * Math.cos(a), cy + (R - 14) * Math.sin(a), cx + R * Math.cos(a), cy + R * Math.sin(a), { w: on ? 3 : 1.6, c: on ? C.orange : C.ink });
      }
      var a0 = -Math.PI / 2, a4 = a0 + 4 * Math.PI / 6;
      s += line(cx, cy, cx + (R - 22) * Math.cos(a0), cy + (R - 22) * Math.sin(a0), { w: 2, c: C.sub, dash: '4 3' });
      s += line(cx, cy, cx + (R - 20) * Math.cos(a4), cy + (R - 20) * Math.sin(a4), { w: 4, c: C.blue });
      s += F.path('M' + (cx + 30 * Math.cos(a0)) + ',' + (cy + 30 * Math.sin(a0)) + ' A30,30 0 0 1 ' + (cx + 30 * Math.cos(a4)) + ',' + (cy + 30 * Math.sin(a4)), { w: 2, c: C.orange });
      s += t(cx, cy + R + 22, '4 스텝 회전 (눈금은 예)', { a: 'm', size: 13, b: 1 });
      s += t(240, 238, '펄스 수 ∝ 회전 각도  ·  펄스 주파수 ∝ 회전 속도', { a: 'm', size: 14, b: 1, c: C.purple });
      return F.svg(480, 254, s);
    } },

  'noise-margin': {
    cap: '잡음 여유(TTL 예) — 보내는 쪽 출력 전압과 받는 쪽이 인정하는 입력 전압 사이의 여유',
    draw: function () {
      var s = '', yv = function (v) { return 246 - v * 40; };
      function bar(x, hiMin, loMax, name) {
        return box(x, yv(5), 44, yv(hiMin) - yv(5), { fill: C.orangeL, c: C.orange, r: 0, w: 1.2 }) + box(x, yv(hiMin), 44, yv(loMax) - yv(hiMin), { fill: C.grayL, c: C.line, r: 0, w: 1 }) +
          box(x, yv(loMax), 44, yv(0) - yv(loMax), { fill: C.blueL, c: C.blue, r: 0, w: 1.2 }) + t(x + 22, 22, name, { a: 'm', b: 1, size: 14 });
      }
      s += bar(100, 2.7, 0.5, '출력(보내는 쪽)') + bar(318, 2.0, 0.8, '입력(받는 쪽)');
      s += t(122, yv(3.9), 'HIGH', { a: 'm', b: 1, size: 13, c: C.orange, halo: false }) + t(122, yv(0.25), 'LOW', { a: 'm', b: 1, size: 12, c: C.blue, halo: false });
      s += t(340, yv(3.5), 'HIGH', { a: 'm', b: 1, size: 13, c: C.orange, halo: false }) + t(340, yv(0.4), 'LOW', { a: 'm', b: 1, size: 12, c: C.blue, halo: false }) + t(340, yv(1.4), '불확정', { a: 'm', size: 12, c: C.sub, halo: false });
      s += tx(92, yv(2.7), 'V_{OH} 2.7 V', { a: 'e', size: 13, b: 1 }) + tx(92, yv(0.5), 'V_{OL} 0.5 V', { a: 'e', size: 13, b: 1 });
      s += tx(370, yv(2.0), 'V_{IH} 2 V', { size: 13, b: 1 }) + tx(370, yv(0.8), 'V_{IL} 0.8 V', { size: 13, b: 1 });
      s += guide(144, yv(2.7), 318, yv(2.7)) + guide(144, yv(0.5), 318, yv(0.5)) + guide(144, yv(2.0), 318, yv(2.0)) + guide(144, yv(0.8), 318, yv(0.8));
      s += arrow(210, yv(2.7), 210, yv(2.0), { both: 1, w: 1.6, head: 7, c: C.red }) + t(218, yv(2.35), 'H 잡음 여유 0.7 V', { size: 13, b: 1, c: C.red });
      s += arrow(210, yv(0.8), 210, yv(0.5), { both: 1, w: 1.6, head: 5, c: C.red }) + t(218, yv(0.65) - 14, 'L 잡음 여유 0.3 V', { size: 13, b: 1, c: C.red });
      s += tx(240, 272, '(V_{CC} = 5 V, TTL 출력 → TTL 입력)', { a: 'm', size: 13, c: C.sub });
      return F.svg(480, 286, s);
    } },

  fanout: {
    cap: '팬아웃 — 출력 하나가 입력 몇 개까지 연결될 수 있는지(팬인은 입력 가능한 수)',
    draw: function () {
      var s = buf(70, 110, { w: 50, h: 26, fill: C.blueL, c: C.blue }) + wire([[30, 110], [70, 110]]) + wire([[120, 110], [200, 110]]) + dot(200, 110) + t(95, 150, '출력 1개', { a: 'm', b: 1, size: 14, c: C.blue });
      [40, 83, 127, 170].forEach(function (y, i) {
        s += wire([[200, 110], [200, y], [300, y]]) + buf(300, y, { w: 36, h: 16 }) + wire([[336, y], [356, y]]) + t(368, y, '입력 ' + (i + 1), { size: 13 });
      });
      s += t(260, 206, '→ 팬아웃 = 연결할 수 있는 입력 수', { a: 'm', b: 1, size: 14, c: C.orange });
      return F.svg(480, 222, s);
    } },

  photocoupler: {
    cap: '포토커플러 — 발광 다이오드와 포토트랜지스터가 한 몸. 전기적으로는 절연, 빛으로만 신호가 건너간다',
    draw: function () {
      var s = box(120, 44, 240, 136, { fill: C.grayL, c: C.ink, r: 10, w: 1.4 }).replace('stroke-width="1.4"', 'stroke-width="1.4" stroke-dasharray="7 5"');
      s += t(180, 26, '입력 측', { a: 'm', b: 1, size: 14, c: C.orange }) + t(300, 26, '출력 측', { a: 'm', b: 1, size: 14, c: C.green });
      s += dio(180, 74, 180, 150, { c: C.orange, fill: C.orange }) + wire([[180, 74], [180, 60], [96, 60]]) + wire([[180, 150], [180, 164], [96, 164]]) + term(92, 60) + term(92, 164);
      s += t(84, 60, 'A', { a: 'e', b: 1 }) + t(84, 164, 'K', { a: 'e', b: 1 });
      s += arrow(204, 100, 262, 100, { c: C.orange, w: 2.4, head: 9 }) + arrow(204, 122, 262, 122, { c: C.orange, w: 2.4, head: 9 });
      s += bjt(290, 112, { noBase: true, c: C.green }) + wire([[304, 78], [304, 60], [388, 60]]) + wire([[304, 146], [304, 164], [388, 164]]) + term(392, 60) + term(392, 164);
      s += t(400, 60, 'C', { b: 1 }) + t(400, 164, 'E', { b: 1 });
      s += line(240, 50, 240, 176, { w: 1.4, c: C.red, dash: '3 4' });
      s += t(240, 204, '전기적으로 절연 · 빛으로만 전달', { a: 'm', b: 1, size: 14, c: C.red }) + t(240, 226, '→ 잡음 차단 · 전원이 다른 회로끼리 연결', { a: 'm', size: 13, c: C.sub });
      return F.svg(480, 242, s);
    } },

  interrupter: {
    cap: '포토인터럽터 — 투과형은 틈을 막으면, 반사형은 물체에 반사된 빛으로 물체의 유무를 알아낸다',
    draw: function () {
      var s = line(240, 12, 240, 250, { c: C.edge, w: 1.2 });
      s += t(120, 22, '투과형 (마주 봄)', { a: 'm', b: 1, size: 15 });
      s += box(46, 70, 36, 110, { fill: C.grayM, c: C.ink, r: 4 }) + box(158, 70, 36, 110, { fill: C.grayM, c: C.ink, r: 4 }) + box(46, 170, 148, 22, { fill: C.grayM, c: C.ink, r: 4 });
      s += box(70, 104, 12, 22, { fill: C.orange, c: C.orange, r: 2 }) + box(158, 104, 12, 22, { fill: C.green, c: C.green, r: 2 });
      s += arrow(84, 115, 110, 115, { c: C.orange, w: 2.4, head: 8 }) + arrow(128, 115, 154, 115, { c: C.orange, w: 2.4, head: 8, dash: '4 3' });
      s += box(108, 40, 22, 96, { fill: C.blueL, c: C.blue, r: 2 }) + arrow(119, 30, 119, 44, { c: C.blue, w: 1.6, head: 7 });
      s += t(64, 206, '발광', { a: 'm', size: 13, b: 1, c: C.orange }) + t(176, 206, '수광', { a: 'm', size: 13, b: 1, c: C.green });
      s += t(120, 232, '물체가 막음 → 빛 끊김 → OFF', { a: 'm', size: 13, b: 1, c: C.blue });
      s += t(360, 22, '반사형 (나란히)', { a: 'm', b: 1, size: 15 });
      s += box(290, 48, 140, 22, { fill: C.blueL, c: C.blue, r: 3, label: '물체', size: 13 });
      s += box(300, 150, 120, 40, { fill: C.grayM, c: C.ink, r: 4 }) + box(320, 142, 22, 14, { fill: C.orange, c: C.orange, r: 2 }) + box(378, 142, 22, 14, { fill: C.green, c: C.green, r: 2 });
      s += arrow(331, 140, 358, 74, { c: C.orange, w: 2.2, head: 8 }) + arrow(362, 74, 389, 140, { c: C.orange, w: 2.2, head: 8 });
      s += t(331, 206, '발광', { a: 'm', size: 13, b: 1, c: C.orange }) + t(389, 206, '수광', { a: 'm', size: 13, b: 1, c: C.green });
      s += t(360, 232, '반사된 빛의 세기 변화를 검출', { a: 'm', size: 13, b: 1, c: C.blue });
      return F.svg(480, 250, s);
    } },

  /* ═════════════ Ⅶ. 신호 변환 회로 ═════════════ */

  'adda-flow': {
    cap: 'AD·DA 변환 — 마이크의 아날로그를 디지털로 바꿔 처리하고, 다시 아날로그로 되돌려 스피커로 낸다',
    draw: function () {
      var s = '';
      /* 윗줄: 마이크 → ADC → 디지털 */
      s += ring(30, 60, 12, { fill: C.grayM, w: 1.6 }) + line(30, 72, 30, 88, { w: 2 }) + line(20, 88, 40, 88, { w: 2 }) + t(30, 108, '마이크', { a: 'm', size: 12, b: 1 });
      s += plot(function (u) { return 0.8 * sin(u, 1.5) + 0.2 * sin(u, 4); }, 54, 138, 62, 22, { c: C.green, w: 2.4 }) + t(96, 100, '아날로그', { a: 'm', size: 13, c: C.green, b: 1, ans: 1 });
      s += arrow(142, 62, 162, 62, { head: 8 }) + box(164, 40, 60, 44, { fill: C.blueL, c: C.blue, label: 'ADC', size: 16, ans: 1 }) + arrow(226, 62, 246, 62, { head: 8 });
      var bits = [1, 0, 1, 1, 0, 0, 1, 0], p = [[250, 76]];
      bits.forEach(function (b, i) { var x = 250 + i * 13; p.push([x, b ? 50 : 76], [x + 13, b ? 50 : 76]); });
      s += poly(p, { w: 2.2, c: C.purple }) + t(302, 100, '디지털 0·1', { a: 'm', size: 13, c: C.purple, b: 1 });
      s += arrow(358, 62, 378, 62, { head: 8 }) + box(380, 38, 86, 48, { fill: C.grayL, c: C.ink, label: '처리', size: 15 });
      s += F.route([[423, 88], [423, 132]], { head: 8 });
      /* 아랫줄: DAC → 계단 → LPF → 스피커 (오른쪽에서 왼쪽) */
      s += box(394, 134, 60, 44, { fill: C.orangeL, c: C.orange, label: 'DAC', size: 16, ans: 1 }) + arrow(392, 156, 372, 156, { head: 8 });
      var st = [];
      for (var k = 0; k <= 8; k++) { var x = 360 - k * 11, v = Math.round(4 * (0.8 * sin(k / 8 * 0.75, 1) + 0.2)) / 4; st.push([x, 170 - 22 * v], [x - 11, 170 - 22 * v]); }
      s += poly(st, { w: 2.2, c: C.orange }) + t(316, 196, '계단 신호', { a: 'm', size: 13, c: C.orange, b: 1 });
      s += arrow(268, 156, 248, 156, { head: 8 }) + box(200, 136, 46, 40, { fill: C.greenL, c: C.green, label: 'LPF', size: 14, ans: 1 }) + arrow(198, 156, 178, 156, { head: 8 });
      s += plot(function (u) { return 0.8 * sin(1 - u, 1.5) * 0.9; }, 92, 174, 156, 20, { c: C.green, w: 2.4 }) + t(134, 196, '아날로그', { a: 'm', size: 13, c: C.green, b: 1, ans: 1 });
      s += arrow(90, 156, 70, 156, { head: 8 }) + F.poly([[40, 146], [52, 146], [66, 134], [66, 178], [52, 166], [40, 166]], { close: 1, fill: C.grayM, w: 1.6 }) + t(52, 196, '스피커', { a: 'm', size: 12, b: 1 });
      s += t(240, 226, '마이크 출력도, 스피커 입력도 아날로그', { a: 'm', size: 13, c: C.sub, ans: 1 });
      return F.svg(480, 242, s);
    } },

  'dac-weighted': {
    cap: '가산기형 DAC(4비트) — 반전 증폭기 입력에 2ⁿ 비율의 저항. MSB 쪽 저항이 가장 작다',
    draw: function () {
      var s = '', ys = [60, 100, 140, 180], names = ['D (MSB)', 'C', 'B', 'A (LSB)'], vals = ['2 kΩ', '4 kΩ', '8 kΩ', '16 kΩ'];
      ys.forEach(function (y, i) {
        s += term(62, y) + t(54, y, names[i], { a: 'e', size: 13, b: 1, c: i === 0 ? C.red : (i === 3 ? C.blue : C.ink) });
        s += res(66, y, 150, y) + wire([[150, y], [196, y]]) + t(108, y - 16, vals[i], { a: 'm', size: 13, b: 1 });
        if (i !== 1) s += dot(196, y);
      });
      s += wire([[196, 60], [196, 180]]) + dot(196, 106) + wire([[196, 106], [238, 106]]);
      s += oa(280, 120, {}) + wire([[238, 134], [220, 134], [220, 150]]) + gnd(220, 150);
      s += dot(212, 106) + wire([[212, 106], [212, 40], [240, 40]]) + res(240, 40, 320, 40) + wire([[320, 40], [340, 40], [340, 120]]) + dot(340, 120) + wire([[324, 120], [372, 120]]) + term(376, 120);
      s += tx(280, 20, 'R_F  1 kΩ', { a: 'm', size: 13, b: 1 }) + tx(386, 120, 'V_o', { b: 1 });
      s += callout(212, 106, 232, 82, '가상 접지', { c: C.purple, tc: C.purple, b: 1, size: 13 });
      s += box(24, 204, 432, 50, { fill: C.blueL, c: C.blue, r: 8, w: 1.2 });
      s += tx(240, 220, 'V_o = −(1/16) × 5 × (2³D + 2²C + 2¹B + 2⁰A)', { a: 'm', b: 1, size: 14 });
      s += t(240, 242, '입력 5 V · 1스텝 = 0.3125 V · 1111 → −4.6875 V', { a: 'm', size: 13, halo: false });
      return F.svg(480, 266, s);
    } },

  'dac-ladder': {
    cap: '사다리형 DAC — 저항은 R 과 2R 두 가지뿐. 비트가 늘어도 만들기 쉽다',
    draw: function () {
      var s = '', X = [110, 180, 250, 320], bit = ['A', 'B', 'C', 'D'];
      s += gnd(26, 88) + wire([[26, 70], [26, 88]]) + res(26, 70, 110, 70, { c: C.purple }) + t(68, 50, '2R', { a: 'm', size: 13, b: 1, c: C.purple });
      for (var i = 0; i < 4; i++) {
        var x = X[i];
        s += dot(x, 70) + res(x, 70, x, 150, { c: C.purple }) + t(x + 12, 110, '2R', { size: 13, b: 1, c: C.purple }) + term(x, 154);
        s += t(x, 176, bit[i], { a: 'm', b: 1, size: 15 });
        if (i < 3) s += res(x, 70, X[i + 1], 70, { c: C.blue }) + t((x + X[i + 1]) / 2, 50, 'R', { a: 'm', size: 13, b: 1, c: C.blue });
      }
      s += t(110, 196, 'LSB', { a: 'm', size: 12, c: C.sub }) + t(320, 196, 'MSB', { a: 'm', size: 12, c: C.sub });
      s += wire([[320, 70], [350, 70], [350, 96], [368, 96]]) + oa(410, 110, { plusTop: true });
      s += wire([[368, 124], [356, 124], [356, 150], [462, 150], [462, 110]]) + wire([[454, 110], [462, 110]]) + dot(462, 110) + tx(466, 92, 'V_o', { a: 'e', b: 1 });
      s += t(396, 176, '비반전(+) 입력', { a: 'm', size: 12, c: C.sub });
      s += t(240, 224, '저항은 R · 2R 두 가지뿐', { a: 'm', b: 1, size: 15, c: C.purple }) + t(240, 246, '각 비트: 1 → 기준 전압, 0 → 0 V', { a: 'm', size: 13, c: C.sub });
      return F.svg(480, 262, s);
    } },

  'dac-stair': {
    cap: '4비트 DAC 출력 — 0000 → 1111 까지 16단계의 계단파. LPF 를 지나면 매끄러워진다',
    draw: function () {
      var s = axes(60, 214, 460, 30, '', '출력 크기') + t(250, 236, '디지털 입력 →', { a: 'm', size: 13, b: 1 }), p = [[60, 214]], W = 22, H = 10;
      for (var k = 0; k < 16; k++) { var x = 60 + k * W, y = 214 - k * H; p.push([x, y], [x + W, y]); }
      s += poly(p, { w: 2.4, c: C.blue });
      s += line(60, 214, 60 + 16 * W, 214 - 15 * H, { w: 2.4, c: C.orange, dash: '7 5' }).replace('stroke-dasharray="7 5"', 'stroke-dasharray="7 5" opacity="0.9"');
      s += t(71, 232, '0000', { a: 'm', size: 13, b: 1 }) + t(60 + 15.5 * W, 232, '1111', { a: 'm', size: 13, b: 1 });
      var sx = 60 + 8 * W;
      s += arrow(sx + 30, 214 - 7 * H, sx + 30, 214 - 8 * H, { both: 1, w: 1.2, head: 5, c: C.red }) + t(sx + 40, 214 - 7.5 * H, '1스텝 = 0.3125 V', { size: 13, b: 1, c: C.red });
      s += t(150, 80, '16 단계 계단파', { size: 14, b: 1, c: C.blue }) + t(150, 102, '--- LPF 를 지나면 매끄럽게', { size: 13, b: 1, c: C.orange });
      s += t(460, 44, '(가산기형은 − 부호로 나온다)', { a: 'e', size: 12, c: C.sub });
      return F.svg(480, 262, s);
    } },

  'adc-3step': {
    cap: 'AD 변환 3단계 — 일정 간격으로 값을 뽑고(표본화), 가까운 정수로 맞추고(양자화), 2진수로 적는다(부호화)',
    draw: function () {
      var s = '', X0 = 60, Y0 = 222, L = 24, X1 = 450;
      for (var k = 0; k <= 7; k++) { var y = Y0 - k * L; s += line(X0, y, X1, y, { w: 1, c: C.grayL }) + t(X0 - 8, y, String(k), { a: 'e', size: 12, c: C.sub }); }
      s += axes(X0, Y0, 464, 26, '', '');
      var f = function (x) { return 3.6 + 2.6 * Math.sin((x - X0) / 62) + 0.6 * Math.sin((x - X0) / 23); };
      var p = []; for (var x = X0; x <= X1; x += 2) p.push([x, Y0 - L * f(x)]);
      s += poly(p, { w: 2.4, c: C.green });
      for (var i = 0; i < 9; i++) {
        var xs = 84 + i * 44, v = f(xs), q = Math.max(0, Math.min(7, Math.round(v)));
        s += line(xs, Y0, xs, Y0 - L * v, { w: 1.2, c: C.sub, dash: '3 3' }) + dot(xs, Y0 - L * q, C.orange, 5);
        s += t(xs, Y0 + 20, ((q >> 2) & 1) + '' + ((q >> 1) & 1) + (q & 1), { a: 'm', size: 13, b: 1, c: C.purple });
      }
      s += callout(128, Y0 - L * f(128) + 10, 150, 40, '① 표본화', { c: C.sub, tc: C.ink, b: 1, size: 14, ans: 1 });
      s += callout(260, Y0 - L * Math.round(f(260)), 300, 44, '② 양자화', { c: C.orange, tc: C.orange, b: 1, size: 14, ans: 1 });
      s += t(20, Y0 + 20, '③', { a: 'm', b: 1, size: 14, c: C.purple }) + t(20, Y0 + 40, '부호화', { a: 'm', size: 12, b: 1, c: C.purple, ans: 1 });
      s += arrow(456, Y0 - 3 * L, 456, Y0 - 4 * L, { both: 1, w: 1.2, head: 5, c: C.red }) + t(452, Y0 - 3.5 * L - 16, '1스텝 = 분해능', { a: 'e', size: 12, b: 1, c: C.red, ans: 1 });
      s += tx(240, 272, '분해능 = FSR / 2ᴺ  (N = 비트 수)', { a: 'm', size: 13, b: 1, ans: 1 });
      return F.svg(480, 286, s);
    } },

  'adc-flash': {
    cap: '병렬형(플래시) AD 변환 — 저항으로 나눈 기준 전압과 입력을 비교기 2ⁿ−1 개가 한꺼번에 비교한다(3비트 = 7개)',
    draw: function () {
      var s = '', X = 70, taps = [];
      s += tx(X, 20, 'V_{ref}', { a: 'm', b: 1, size: 14 }) + term(X, 32);
      for (var i = 0; i < 8; i++) {
        var y1 = 36 + i * 32, y2 = y1 + 32;
        s += box(X - 6, y1 + 6, 12, 20, { fill: '#fff', c: C.ink, r: 1, w: 1.6 }) + line(X, y1, X, y1 + 6, { w: 2 }) + line(X, y1 + 26, X, y2, { w: 2 });
        if (i < 7) taps.push(y2);
      }
      s += gnd(X, 292);
      s += tx(130, 20, 'V_{in}', { a: 'm', b: 1, size: 14, c: C.green }) + term(130, 32) + line(130, 36, 130, 270, { w: 2, c: C.green });
      taps.forEach(function (y, i) {
        var cy = y;
        s += dot(X, y) + wire([[X, y], [178, y]]) + dot(130, cy + 10, C.green) + wire([[130, cy + 10], [178, cy + 10]], { c: C.green });
        s += poly([[178, y - 8], [178, y + 18], [206, y + 5]], { close: 1, fill: '#fff', w: 1.6 }) + wire([[206, y + 5], [270, y + 5]]);
      });
      s += box(270, 60, 70, 214, { fill: C.purpleL, c: C.purple, r: 6 }) + t(305, 167, '부호기', { a: 'm', b: 1, size: 14, halo: false });
      [120, 167, 214].forEach(function (y, i) { s += arrow(340, y, 372, y, { head: 8, c: C.purple }) + tx(378, y, 'D_' + (2 - i), { b: 1, size: 14, c: C.purple }); });
      s += t(456, 256, '비교기', { a: 'e', size: 13 }) + tx(456, 276, '2³ − 1 = 7개', { a: 'e', size: 15, b: 1, c: C.red, ans: 1 });
      s += t(456, 36, '가장 빠름', { a: 'e', size: 13, b: 1, c: C.green, ans: 1 }) + t(456, 56, '복잡 · 비쌈', { a: 'e', size: 13, c: C.sub });
      return F.svg(480, 314, s);
    } },

  'adc-sar': {
    cap: '축차 근사형 AD 변환 — MSB 부터 1 로 놓고 입력과 비교해, 넘으면 0 으로 되돌리며 아래 비트로 내려간다(예)',
    draw: function () {
      var s = '', X0 = 70, Y0 = 214, U = 10.5, vin = 11.4;
      s += axes(X0, Y0, 464, 30, '', '');
      [0, 4, 8, 12, 15].forEach(function (v) { s += t(X0 - 8, Y0 - v * U, String(v), { a: 'e', size: 12, c: C.sub }); });
      s += line(X0, Y0 - vin * U, 456, Y0 - vin * U, { w: 2, c: C.green, dash: '7 5' }) + t(456, Y0 - vin * U - 14, '입력 전압', { a: 'e', size: 13, b: 1, c: C.green });
      var steps = [['1000', 8, true], ['1100', 12, false], ['1010', 10, true], ['1011', 11, true]], p = [[X0, Y0]];
      steps.forEach(function (q, i) {
        var x = 110 + i * 86, y = Y0 - q[1] * U;
        p.push([x - 30, p[p.length - 1][1]], [x - 30, y], [x + 30, y]);
        s += dot(x, y, q[2] ? C.blue : C.red, 5);
        s += t(x, Y0 + 20, q[0], { a: 'm', b: 1, size: 14 }) + t(x, Y0 + 40, q[2] ? '✓ 유지' : '✕ 넘음 → 0', { a: 'm', size: 12, b: 1, c: q[2] ? C.blue : C.red });
        s += F.num(x, 40, i + 1, { c: C.purple });
      });
      s += poly(p, { w: 2.4, c: C.blue });
      s += box(392, 64, 76, 44, { fill: C.blueL, c: C.blue, r: 8, w: 1.2 }) + t(430, 78, '결과', { a: 'm', size: 12, halo: false }) + t(430, 96, '1011', { a: 'm', b: 1, size: 16, halo: false });
      return F.svg(480, 266, s);
    } }

  };
})();
