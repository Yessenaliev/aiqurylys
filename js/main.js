// Меню на телефоне и планшете
(function () {
  var nav = document.getElementById('nav');
  var burger = document.getElementById('burger');
  if (!nav || !burger) return;

  function setOpen(open) {
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  burger.addEventListener('click', function () {
    setOpen(!nav.classList.contains('open'));
  });
  nav.querySelectorAll('.nav__links a').forEach(function (a) {
    a.addEventListener('click', function () { setOpen(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setOpen(false);
  });
})();

// Роли: плитка роли открывает личный экран — что получит именно этот человек
var selectRole = (function () {
  var bar = document.getElementById('roles');
  var panel = document.getElementById('role-panel');
  if (!bar || !panel) return function () {};

  // [заголовок, описание, три результата, откуда взять экран продукта]
  var INFO = {
    director: ['Директор и владелец', 'Вся картина по каждому проекту — без звонков и сводных таблиц.',
      ['Себестоимость, смета заказчику и прибыль по каждому проекту', 'Утренняя сводка в Telegram', 'По каждому тендеру ответ: участвовать или нет'], 'scene:director'],
    manager: ['Руководитель', 'Ведёт работу наравне с владельцем.',
      ['Проекты, деньги и отчёты — как у владельца', 'Приглашает людей и раздаёт роли', 'Работает на сайте и в Telegram-боте'], 'scene:director'],
    gip: ['ГИП — главный инженер проекта', 'Видит, где проект расходится с фактом.',
      ['Объёмы по каждому альбому проекта', 'Спорные места помечены статусом «Оценка»', 'Акты подрядчиков сверяются с проектом'], 'scene:gip'],
    pto: ['ПТО и сметчик', 'Объёмы и смета — прямо из чертежей.',
      ['Объёмы и смета из чертежей PDF и DWG', 'Проверка готовой сметы: арифметика, двойной счёт, пропуски', 'АОСР, акты 2В и дефектные акты заполняются сами'], 'scene:estimator'],
    supply: ['Снабженец', 'Цены поставщиков — без обзвона.',
      ['Список материалов прямо из сметы', 'Запросы поставщикам уходят сами', 'Цены в одной таблице — записать в базу решаете вы'], 'scene:supply'],
    site: ['Начальник участка', 'План и факт — в одной таблице.',
      ['График работ по объёмам проекта', 'Задачи прорабам и мастерам', 'Факт против плана каждый день, моточасы техники'], 'scene:site'],
    foreman: ['Прораб и мастер', 'Вся работа — в Telegram, с телефона.',
      ['Задачи приходят в Telegram', 'Объём сдаётся одним сообщением', 'Вход в бот — по коду от руководителя'], 'scene:foreman'],
    fin: ['Финансист', 'Деньги проекта: пришло, потрачено, осталось.',
      ['План, факт и остаток по каждому проекту', 'Налоги Казахстана по ставкам 2026 года', 'Расхождения в актах подрядчика'], 'scene:finance'],
    lawyer: ['Юрист', 'Договоры и претензии — быстрее и без пропущенных рисков.',
      ['Проверка присланных договоров', 'Рискованные пункты и готовые правки', 'Претензионные письма'], 'tpl:mock-lawyer'],
    marketer: ['Маркетолог', 'Тендеры и продвижение компании.',
      ['Одна лента госзакупок и площадок застройщиков', 'Расчёт прибыли до подачи заявки', 'Посты, кейсы проектов и коммерческие предложения'], 'tpl:mock-tender']
  };

  var tabs = Array.prototype.slice.call(bar.querySelectorAll('[data-role]'));
  var mockBox = document.getElementById('role-mock');
  var list = document.getElementById('role-list');
  var exBtn = document.getElementById('show-example');
  var example = document.getElementById('example');

  function mockFor(src) {
    var parts = src.split(':');
    var node = null;
    if (parts[0] === 'scene') {
      var m = document.querySelector('.scene[data-bg="' + parts[1] + '"] .mock');
      if (m) node = m.cloneNode(true);
    } else {
      var t = document.getElementById(parts[1]);
      if (t && t.content) node = t.content.firstElementChild.cloneNode(true);
    }
    return node;
  }

  function select(role) {
    var info = INFO[role];
    if (!info) return;
    tabs.forEach(function (t) {
      var on = t.dataset.role === role;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
    });
    document.getElementById('role-title').textContent = info[0];
    document.getElementById('role-text').textContent = info[1];
    list.textContent = '';
    info[2].forEach(function (line) {
      var li = document.createElement('li');
      li.textContent = line;
      list.appendChild(li);
    });
    mockBox.textContent = '';
    var node = mockFor(info[3]);
    if (node) mockBox.appendChild(node);
    if (exBtn) exBtn.hidden = role !== 'pto';
    if (example && role !== 'pto') example.hidden = true;
  }

  function reveal() {
    var target = document.getElementById('result');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { select(t.dataset.role); reveal(); });
    t.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      var next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      select(next.dataset.role);
      next.focus();
    });
  });

  // Кнопки в сценах: «Что получит сметчик» и т. п.
  document.querySelectorAll('.scene a[data-role]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      select(a.dataset.role);
      reveal();
    });
  });

  // Полная смета — только по кнопке у сметчика
  if (exBtn && example) {
    exBtn.addEventListener('click', function () {
      example.hidden = false;
      example.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // Полный список разделов
  var allBtn = document.getElementById('show-all');
  var allWrap = document.getElementById('all-wrap');
  if (allBtn && allWrap) {
    allBtn.addEventListener('click', function () {
      var open = allWrap.hidden;
      allWrap.hidden = !open;
      allBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      allBtn.textContent = open ? 'Скрыть все разделы' : 'Показать все разделы системы';
    });
  }

  select('director');
  return select;
})();

// Путь по странице: четыре шага справа и кнопка внизу на телефоне
(function () {
  var nav = document.getElementById('steps-nav');
  var cta = document.getElementById('sticky-cta');
  var scenes = document.querySelector('.scenes');
  if (!scenes) return;
  var links = nav ? Array.prototype.slice.call(nav.querySelectorAll('a')) : [];
  var targets = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });

  function update() {
    var past = scenes.getBoundingClientRect().bottom < window.innerHeight * 0.5;
    if (nav) nav.classList.toggle('on', past);
    if (cta) cta.classList.toggle('on', past);
    var active = -1;
    targets.forEach(function (t, i) {
      if (t && !t.hidden && t.getBoundingClientRect().top < window.innerHeight * 0.5) active = i;
    });
    links.forEach(function (a, i) { a.classList.toggle('is-on', i === active); });
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

// Презентация на первом экране.
// Десктоп: сцены листаются прокруткой страницы, экран при этом закреплён.
// Телефон и планшет: сцены сменяются сами и по свайпу.
(function () {
  var root = document.querySelector('.scenes');
  if (!root) return;

  var DURATION = 8;   // секунд на сцену в автопоказе
  var UNIT = 0.75;    // сколько экранов прокрутки занимает одна сцена
  var HOLD = 0.6;     // доля сцены, когда она стоит на месте; остальное — переход к следующей
  var NAV_H = 64;

  var stage = root.querySelector('.scenes__stage');
  var scenes = Array.prototype.slice.call(root.querySelectorAll('.scene'));
  var N = scenes.length;
  var dotsBox = document.getElementById('dots');
  var count = document.getElementById('sc-count');
  var pauseBtn = document.getElementById('sc-pause');
  var down = document.getElementById('sc-down');
  var downText = down ? down.textContent : '';
  var current = 0;
  var scrolly = false;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var wide = window.matchMedia ? window.matchMedia('(min-width: 961px)') : { matches: false };
  var portrait = window.matchMedia && window.matchMedia('(max-aspect-ratio: 3/4)').matches;

  var dots = scenes.map(function (s, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'dot';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', 'Сцена ' + (i + 1) + ': ' + s.dataset.name);
    b.style.setProperty('--dur', DURATION + 's');
    var label = document.createElement('span');
    label.textContent = s.dataset.name;
    var track = document.createElement('i');
    var fill = document.createElement('b');
    track.appendChild(fill);
    b.appendChild(label);
    b.appendChild(track);
    b.addEventListener('click', function () { go(i); });
    fill.addEventListener('animationend', function () {
      if (!scrolly && i === current) go(current + 1);
    });
    dotsBox.appendChild(b);
    return b;
  });

  // ---------- Фоны сцен ----------
  // media/scenes/<имя>.jpg — кадр, <имя>.mp4 — видео сцены,
  // <имя>-to.mp4 — переход от этой сцены к следующей (только для прокрутки).
  // Для вертикальных экранов: <имя>-m.jpg и <имя>-m.mp4, если они есть.
  // Пока файлов нет, остаётся обычный тёмный фон.
  scenes.forEach(function (s) {
    var name = s.dataset.bg;
    if (!name) return;
    var variants = portrait ? [name + '-m', name] : [name];

    function attempt(k) {
      if (k >= variants.length) return;
      var base = 'media/scenes/' + variants[k];
      var img = new Image();
      img.alt = '';
      img.onerror = function () {
        if (img.src.indexOf('.webp') !== -1) { img.src = base + '.jpg'; return; }
        attempt(k + 1);
      };
      img.onload = function () {
        var bg = document.createElement('div');
        bg.className = 'scene__bg';
        bg.appendChild(img);
        var v = document.createElement('video');
        v.muted = true; v.playsInline = true; v.preload = 'none';
        v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
        v.dataset.src = base + '.mp4';
        v.addEventListener('error', function () { v.remove(); });
        v.addEventListener('loadeddata', function () { v.classList.add('on'); });
        bg.appendChild(v);
        s.insertBefore(bg, s.firstChild);
        if (!scrolly && s.classList.contains('is-active')) playBg(s);
      };
      img.src = base + '.webp';
    }
    attempt(0);
  });

  function bgVideo(i) {
    return scenes[i] ? scenes[i].querySelector('.scene__bg video') : null;
  }
  function playBg(s) {
    var v = s.querySelector('.scene__bg video');
    if (!v || reduced) return;
    v.loop = true;
    if (!v.getAttribute('src')) v.src = v.dataset.src;
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  }
  function stopBg(s) {
    var v = s.querySelector('.scene__bg video');
    if (v && v.getAttribute('src')) v.pause();
  }
  // Ставит видео на нужную долю длительности (0..1) — так прокрутка «двигает фильм»
  function scrub(v, f) {
    if (!v) return;
    if (!v.getAttribute('src')) { v.preload = 'auto'; v.src = v.dataset.src; return; }
    if (!v.duration || v.seeking) return;
    var target = Math.max(0, Math.min(1, f)) * Math.max(0, v.duration - 0.05);
    if (Math.abs(v.currentTime - target) > 0.03) v.currentTime = target;
  }

  // Ролики-переходы между сценами
  var transBox = null;
  var trans = [];
  function ensureTrans(i) {
    if (i < 0 || i >= N - 1 || trans[i] || !scenes[i].dataset.bg) return;
    if (!transBox) {
      transBox = document.createElement('div');
      transBox.className = 'scenes__trans';
      stage.insertBefore(transBox, stage.firstChild);
    }
    var t = { el: document.createElement('video'), ok: false };
    trans[i] = t;
    t.el.muted = true; t.el.playsInline = true; t.el.preload = 'auto';
    t.el.setAttribute('muted', ''); t.el.setAttribute('playsinline', '');
    t.el.dataset.src = 'media/scenes/' + scenes[i].dataset.bg + '-to.mp4';
    t.el.addEventListener('loadeddata', function () { t.ok = true; });
    t.el.addEventListener('error', function () { t.ok = false; t.el.remove(); });
    t.el.src = t.el.dataset.src;
    transBox.appendChild(t.el);
  }
  function showTrans(i) {
    trans.forEach(function (t, k) { if (t && t.el) t.el.classList.toggle('on', k === i); });
    root.classList.toggle('in-trans', i >= 0);
  }

  // ---------- Смена сцен ----------
  function show(n) {
    current = n;
    scenes.forEach(function (s, i) {
      var on = i === current;
      if (!scrolly) { if (on) playBg(s); else stopBg(s); }
      s.classList.toggle('is-active', on);
      if (on) s.removeAttribute('aria-hidden'); else s.setAttribute('aria-hidden', 'true');
      dots[i].setAttribute('aria-selected', on ? 'true' : 'false');
      dots[i].classList.toggle('done', i < current);
    });
    count.textContent = (current + 1) + ' / ' + N;
  }

  function unitPx() { return window.innerHeight * UNIT; }
  function startY() { return root.getBoundingClientRect().top + window.scrollY - NAV_H; }

  function go(n) {
    if (scrolly) {
      n = Math.max(0, Math.min(N - 1, n));
      window.scrollTo({ top: startY() + (n === 0 ? 0 : (n + 0.04) * unitPx()), behavior: 'smooth' });
      return;
    }
    show((n + N) % N);
  }

  // ---------- Режим прокрутки ----------
  var ticking = false;
  function frame() {
    ticking = false;
    if (!scrolly) return;
    var maxP = N - 1 + HOLD;
    var raw = (window.scrollY - startY()) / unitPx();
    var P = Math.max(0, Math.min(maxP, raw));
    var a = Math.min(N - 1, Math.floor(P));
    var t = P - a;
    var k = (a < N - 1 && t > HOLD) ? (t - HOLD) / (1 - HOLD) : 0;
    var act = k > 0.5 ? a + 1 : a;
    if (act !== current) show(act);

    dots.forEach(function (d, i) {
      var p = i < act ? 1 : (i === act && act === a ? Math.min(1, t / HOLD) : 0);
      d.style.setProperty('--p', p);
    });
    scenes.forEach(function (s, i) {
      s.style.setProperty('--k', i === a ? k : (i === a + 1 ? k - 1 : 0));
    });

    scrub(bgVideo(a), t / HOLD);
    if (a + 1 < N && k > 0) scrub(bgVideo(a + 1), 0);
    ensureTrans(a);
    if (k > 0 && trans[a] && trans[a].ok) {
      showTrans(a);
      scrub(trans[a].el, k);
    } else {
      showTrans(-1);
    }
    root.classList.toggle('offscreen', raw > maxP + 0.6);
  }
  function onScroll() {
    if (!scrolly || ticking) return;
    ticking = true;
    window.requestAnimationFrame(frame);
  }

  function setMode() {
    var want = wide.matches && !reduced;
    if (want !== scrolly) {
      scrolly = want;
      root.classList.toggle('scrolly', scrolly);
      if (scrolly) {
        root.classList.remove('paused');
        scenes.forEach(stopBg);
        if (down) down.textContent = '↓ Листайте вниз · пропустить к подробностям';
      } else {
        root.style.height = '';
        showTrans(-1);
        scenes.forEach(function (s) { s.style.removeProperty('--k'); });
        if (down) down.textContent = downText;
        show(current);
      }
    }
    if (scrolly) {
      root.style.height = Math.round(stage.offsetHeight + (N - 1 + HOLD) * unitPx()) + 'px';
      frame();
    }
  }

  // ---------- Управление ----------
  function setPaused(p) {
    root.classList.toggle('paused', p);
    pauseBtn.textContent = p ? '▶' : '❚❚';
    pauseBtn.setAttribute('aria-label', p ? 'Продолжить' : 'Пауза');
  }
  pauseBtn.addEventListener('click', function () { setPaused(!root.classList.contains('paused')); });
  document.getElementById('sc-prev').addEventListener('click', function () { go(current - 1); });
  document.getElementById('sc-next').addEventListener('click', function () { go(current + 1); });
  root.querySelectorAll('[data-go="next"]').forEach(function (b) {
    b.addEventListener('click', function () { go(current + 1); });
  });

  document.addEventListener('keydown', function (e) {
    if (root.classList.contains('offscreen')) return;
    if (e.target.closest && e.target.closest('#rolebar')) return;
    if (e.key === 'ArrowRight') go(current + 1);
    if (e.key === 'ArrowLeft') go(current - 1);
  });

  // Свайп на телефоне
  var x0 = null, y0 = null;
  root.addEventListener('touchstart', function (e) {
    x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
  }, { passive: true });
  root.addEventListener('touchend', function (e) {
    if (x0 === null || scrolly) { x0 = null; return; }
    var dx = e.changedTouches[0].clientX - x0;
    var dy = e.changedTouches[0].clientY - y0;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(current + (dx < 0 ? 1 : -1));
    x0 = null;
  }, { passive: true });

  // В автопоказе не листаем, когда презентацию не видно
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      if (scrolly) return;
      root.classList.toggle('offscreen', entries[0].intersectionRatio < 0.35);
    }, { threshold: [0, 0.35, 1] }).observe(root);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', setMode);
  if (wide.addEventListener) wide.addEventListener('change', setMode);

  show(0);
  if (reduced) setPaused(true);
  setMode();
})();
