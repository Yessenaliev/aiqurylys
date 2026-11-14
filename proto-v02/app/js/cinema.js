/* Шаг 3: кинематограф для витринных мест. Первый вход: чертёж → каркас здания → город.
   Рисунок целиком зависит от времени t (0..1), поэтому его можно показать сразу в конечном виде. */
(function () {
  'use strict';
  var AQ = window.AQ;
  var DUR = 5200;

  function ease(x) { x = x < 0 ? 0 : x > 1 ? 1 : x; return x * x * (3 - 2 * x); }
  function seg(t, a, b) { return ease((t - a) / (b - a)); }
  function rnd(seed) { var s = seed; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

  // город: детерминированный набор домов вокруг главного здания
  var CITY = (function () {
    var r = rnd(7), list = [];
    for (var i = 0; i < 110; i++) {
      var x = (r() - .5) * 46, y = (r() - .5) * 30;
      if ((Math.abs(x) < 4.6 && Math.abs(y) < 3.6) || x + y < -13 || x + y > 16) continue;
      list.push({ x: x, y: y, w: .9 + r() * 1.5, d: .9 + r() * 1.5, h: 1.0 + r() * 4.8, lag: r() * .22 });
    }
    return list;
  })();

  function intro(canvas, hooks) {
    var ctx = canvas.getContext('2d'), W = 0, H = 0, dpr = Math.min(2, window.devicePixelRatio || 1), done = false, timer = null, t0 = Date.now(), textShown = false;
    function size() { W = canvas.clientWidth || 800; H = canvas.clientHeight || 500; canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    size();
    var BLUE = 'rgba(111,163,255,', ORANGE = '#F26B1D', BG = 'rgba(6,10,17,.94)';

    function frame(t) {
      ctx.clearRect(0, 0, W, H);
      var cam = seg(t, .6, 1), base = Math.min(W / 16, H / 11);
      var s = base * (1.25 - .9 * cam), ox = W / 2, oy = H * (.56 + .35 * cam);
      function P(x, y, z) { return [ox + (x - y) * .866 * s, oy + (x + y) * .5 * s - z * s]; }
      function seg2(a, b, p, col, w) {
        if (p <= 0) return; var q = [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p];
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(q[0], q[1]); ctx.strokeStyle = col; ctx.lineWidth = w || 1; ctx.stroke();
      }
      function poly(pts, fill, stroke, w) {
        ctx.beginPath(); pts.forEach(function (p, i) { i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.closePath();
        if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = w || 1; ctx.stroke(); }
      }
      function label(txt, x, y, a) { ctx.globalAlpha = a; ctx.font = '500 10px "JetBrains Mono", monospace'; ctx.fillStyle = 'rgba(190,205,230,1)'; ctx.fillText(txt, x, y); ctx.globalAlpha = 1; }

      // 1) чертёж на земле: контур, перегородки, размерные линии
      var pa = seg(t, .02, .26), X0 = -3, X1 = 3, Y0 = -2, Y1 = 2, K = 'rgba(111,163,255,.8)';
      var c = [P(X0, Y0, 0), P(X1, Y0, 0), P(X1, Y1, 0), P(X0, Y1, 0)];
      for (var i = 0; i < 4; i++) seg2(c[i], c[(i + 1) % 4], Math.min(1, Math.max(0, pa * 4 - i)), K, 1.2);
      var pp = seg(t, .12, .3);
      seg2(P(-1, Y0, 0), P(-1, Y1, 0), pp, BLUE + '.5)', 1); seg2(P(1.2, Y0, 0), P(1.2, .4, 0), pp, BLUE + '.5)', 1); seg2(P(-3, .4, 0), P(-1, .4, 0), pp, BLUE + '.5)', 1);
      var dm = seg(t, .16, .34);
      seg2(P(X0, Y1 + .9, 0), P(X1, Y1 + .9, 0), dm, 'rgba(242,107,29,.9)', 1);
      seg2(P(X0, Y1 + .6, 0), P(X0, Y1 + 1.2, 0), dm, 'rgba(242,107,29,.9)', 1); seg2(P(X1, Y1 + .6, 0), P(X1, Y1 + 1.2, 0), dm, 'rgba(242,107,29,.9)', 1);
      if (dm > .8) { var lp = P(0, Y1 + 1.3, 0); label('12 000', lp[0] - 18, lp[1] + 8, 1); var zp = P(X0, Y1, 0); label('±0.000', zp[0] - 56, zp[1] + 4, 1); }

      // 2) город и главное здание, по глубине
      var items = CITY.map(function (b) { return { k: 'c', b: b, z: b.x + b.y }; });
      items.push({ k: 'm', z: 0 });
      items.sort(function (a, b) { return a.z - b.z; });
      var ca = seg(t, .6, .92);
      items.forEach(function (it) {
        if (it.k === 'c') {
          var b = it.b, g = Math.max(0, Math.min(1, (ca - b.lag) / .6)); if (g <= 0) return; var h = b.h * ease(g), a = .25 + .45 * g;
          var x0 = b.x, x1 = b.x + b.w, y0 = b.y, y1 = b.y + b.d;
          var top = [P(x0, y0, h), P(x1, y0, h), P(x1, y1, h), P(x0, y1, h)];
          var sil = [P(x0, y1, 0), P(x1, y1, 0), P(x1, y0, 0), P(x1, y0, h), P(x0, y0, h), P(x0, y1, h)];
          poly(sil, BG, null); poly(top, null, BLUE + a + ')', 1);
          [[x0, y1], [x1, y1], [x1, y0]].forEach(function (q) { var A = P(q[0], q[1], 0), B = P(q[0], q[1], h); ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.strokeStyle = BLUE + a + ')'; ctx.lineWidth = 1; ctx.stroke(); });
          var bl = [P(x0, y1, 0), P(x1, y1, 0), P(x1, y0, 0)]; ctx.beginPath(); ctx.moveTo(bl[0][0], bl[0][1]); ctx.lineTo(bl[1][0], bl[1][1]); ctx.lineTo(bl[2][0], bl[2][1]); ctx.strokeStyle = BLUE + a * .6 + ')'; ctx.stroke();
          if (g > .9) for (var wi = 0; wi < 3; wi++) { var wz = h * (.2 + .25 * wi), wp = P(x0 + b.w * .5, y1, wz); if (wz < h - .3 && ((Math.floor(b.x * 7 + wi) & 1) === 0)) { ctx.fillStyle = 'rgba(242,177,52,.55)'; ctx.fillRect(wp[0] - 1.5, wp[1] - 1.5, 3, 3); } }
        } else {
          var FL = 8, FH = .9;
          for (var k = 0; k < FL; k++) {
            var a0 = .22 + k * .05, pr = seg(t, a0, a0 + .08); if (pr <= 0) break;
            var z0 = k * FH, z1 = z0 + FH * pr;
            var front = [P(X0, Y1, z0), P(X1, Y1, z0), P(X1, Y0, z0), P(X1, Y0, z1), P(X0, Y0, z1), P(X0, Y1, z1)];
            poly(front, 'rgba(8,13,22,.78)', null);
            var tp = [P(X0, Y0, z1), P(X1, Y0, z1), P(X1, Y1, z1), P(X0, Y1, z1)];
            ctx.shadowColor = ORANGE; ctx.shadowBlur = pr >= 1 ? 6 : 0;
            poly(tp, null, 'rgba(242,107,29,' + (k === FL - 1 && pr >= 1 ? 1 : .9) + ')', 1.4);
            [[X0, Y1], [X1, Y1], [X1, Y0]].forEach(function (q) { var A = P(q[0], q[1], z0), B = P(q[0], q[1], z1); ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.strokeStyle = 'rgba(242,107,29,.9)'; ctx.lineWidth = 1.4; ctx.stroke(); });
            ctx.shadowBlur = 0;
            if (pr >= .98) {
              for (var wx = 1; wx < 6; wx++) { var wp1 = P(X0 + wx, Y1, z0 + FH * .55), lit = ((wx * 3 + k * 5) % 4) < 2 && cam > .3; ctx.fillStyle = lit ? 'rgba(242,177,52,.85)' : BLUE + '.45)'; ctx.fillRect(wp1[0] - 2, wp1[1] - 2, 4, 4); }
              for (var wy = 1; wy < 4; wy++) { var wp2 = P(X1, Y1 - wy - 0, z0 + FH * .55), lit2 = ((wy * 5 + k * 3) % 4) < 2 && cam > .3; ctx.fillStyle = lit2 ? 'rgba(242,177,52,.85)' : BLUE + '.45)'; ctx.fillRect(wp2[0] - 2, wp2[1] - 2, 4, 4); }
              if ((k === 0 || k === 2 || k === 4 || k === 7) && cam < .5) { var lb = P(X1 + .2, Y0, z1); label('+' + ((k + 1) * 3.6).toFixed(3), lb[0] + 10, lb[1] + 3, 1 - cam * 2); }
            }
          }
        }
      });
      // земля: линия горизонта
      if (cam > 0) { ctx.globalAlpha = cam * .5; ctx.beginPath(); ctx.moveTo(0, oy + 5.2 * s); ctx.lineTo(W, oy + 5.2 * s); ctx.strokeStyle = BLUE + '.25)'; ctx.lineWidth = 1; ctx.stroke(); ctx.globalAlpha = 1; }
    }

    function tick() {
      var t = Math.min(1, (Date.now() - t0) / DUR);
      frame(t);
      if (!textShown && t >= .66) { textShown = true; hooks && hooks.onText && hooks.onText(); }
      if (t >= 1 && !done) { done = true; clearInterval(timer); hooks && hooks.onEnd && hooks.onEnd(); }
    }
    function onResize() { size(); frame(done ? 1 : Math.min(1, (Date.now() - t0) / DUR)); }
    window.addEventListener('resize', onResize);
    if (AQ.reduced) { frame(1); done = true; textShown = true; hooks && hooks.onText && hooks.onText(); }
    else { frame(0); timer = setInterval(tick, 33); }
    return { draw: frame, stop: function () { clearInterval(timer); window.removeEventListener('resize', onResize); }, finish: function () { clearInterval(timer); done = true; frame(1); if (!textShown) { textShown = true; hooks && hooks.onText && hooks.onText(); } } };
  }

  /* таймеры «до окончания подачи» */
  var cdTimer = null;
  function fmtCd(sec) {
    if (sec < 0) sec = 0; var d = Math.floor(sec / 86400), h = Math.floor(sec % 86400 / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60;
    var p = function (n) { return (n < 10 ? '0' : '') + n; };
    return (d ? d + 'д ' : '') + p(h) + ':' + p(m) + ':' + p(s);
  }
  AQ.cdSecs = function (id, left) {
    var days = parseInt(left, 10) || 1, off = { t1: 7 * 3600 + 41 * 60 + 12, t2: 3 * 3600 + 5 * 60 + 48, t3: 11 * 3600 + 22 * 60 + 9, t4: 1 * 3600 + 58 * 60 + 30 }[id] || 3600;
    return days * 86400 - off;
  };
  AQ.cdStart = function () {
    var t0 = Date.now();
    function paint() { AQ.$$('[data-cd]').forEach(function (el) { el.textContent = fmtCd(+el.getAttribute('data-cd') - Math.floor((Date.now() - t0) / 1000)); }); }
    paint(); if (!AQ.reduced) AQ.every(paint, 1000);
  };

  /* строки по одной */
  AQ.reveal = function (sel, gap) {
    var els = AQ.$$(sel);
    els.forEach(function (el, i) { if (AQ.reduced) el.classList.remove('pre'); else AQ.later(function () { el.classList.remove('pre'); }, 300 + i * (gap || 380)); });
  };

  /* живая лента цифрового отдела */
  var POOL = [['Сметчик', 'Нашёл спорную позицию в альбоме АР', 'calc/check'], ['Снабженец', 'Получил ответ от «БетонЦентр»', 'money/price'], ['Юрист', 'Подготовил претензию по просрочке кровли', 'legal/letter'], ['Документовед', 'Собрал акт скрытых работ №6', 'docs/made'], ['Тендерный менеджер', 'Разобрал требования тендера в Костанае', 'sales/tender'], ['Проверяющий актов', 'Сверил акт №8 с проектом: расхождений нет', 'calc/vol']];
  AQ.liveFeed = function (box) {
    if (AQ.reduced || !box) return; var i = 0, h = 8, m = 12;
    AQ.every(function () {
      var p = POOL[i % POOL.length]; i++; m += 3 + i; if (m > 59) { m -= 60; h++; }
      var a = document.createElement('a'); a.className = 'ln pre'; if (AQ.canRoute(p[2])) a.href = '#/' + p[2]; else a.setAttribute('data-toast', 'Это видят другие роли');
      a.innerHTML = '<time>' + (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m + '</time><div><b>' + AQ.esc(p[0]) + '</b> · ' + AQ.esc(p[1]) + '</div>';
      box.insertBefore(a, box.firstChild);
      setTimeout(function () { a.classList.remove('pre'); }, 30);
      while (box.children.length > 9) box.removeChild(box.lastChild);
    }, 3600);
  };

  AQ.cinema = { intro: intro };
})();
