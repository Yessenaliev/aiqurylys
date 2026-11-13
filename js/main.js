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

// Презентация на первом экране: идёт сама, как фильм.
// Сцена играет своё видео и держит текст, затем включается переход к следующей сцене:
// текст уходит, остаётся только фильм, в конце перехода возвращается текст новой сцены.
// Прокрутка страницы обычная, презентация стоит в первом экране.
(function () {
  var root = document.querySelector('.scenes');
  if (!root) return;

  var HOLD_MS = 6500;     // сколько сцена держится с текстом (видео сцены играет 5 с и замирает на последнем кадре)
  var TEXT_BACK = 1.3;    // за сколько секунд до конца перехода возвращается текст новой сцены
  var LAST_HOLD_MS = 5000; // последняя сцена стоит и затем плавно возвращается к первой

  var stage = root.querySelector('.scenes__stage');
  var scenes = Array.prototype.slice.call(root.querySelectorAll('.scene'));
  var N = scenes.length;
  var dotsBox = document.getElementById('dots');
  var count = document.getElementById('sc-count');
  var pauseBtn = document.getElementById('sc-pause');
  var current = 0;
  var phase = 'hold';
  var userPaused = false;
  var offscreen = false;
  var holdTimer = null, holdLeft = HOLD_MS, holdStart = 0, raf = 0;
  var activeTrans = null, textSwitched = false;
  var trans = [];
  var transBox = null;
  var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var portrait = !!(window.matchMedia && window.matchMedia('(max-aspect-ratio: 3/4)').matches);

  // ---------- Точки-оглавление ----------
  var dots = scenes.map(function (s, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'dot';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', 'Сцена ' + (i + 1) + ': ' + s.dataset.name);
    b.style.setProperty('--dur', ((HOLD_MS / 1000) + 5) + 's');
    var label = document.createElement('span');
    label.textContent = s.dataset.name;
    var track = document.createElement('i');
    track.appendChild(document.createElement('b'));
    b.appendChild(label);
    b.appendChild(track);
    b.addEventListener('click', function () { go(i); });
    dotsBox.appendChild(b);
    return b;
  });

  // ---------- Фоны сцен ----------
  // media/scenes/<имя>.webp|jpg — кадр, <имя>.mp4 — видео сцены, <имя>-to.mp4 — переход к следующей.
  scenes.forEach(function (s) {
    var name = s.dataset.bg;
    if (!name) return;
    var variants = portrait ? [name + '-m', name] : [name];
    var exts = ['.webp', '.jpg'];

    function attempt(k, e) {
      if (k >= variants.length) return;
      var base = 'media/scenes/' + variants[k];
      var img = new Image();
      img.alt = '';
      img.onerror = function () {
        if (e + 1 < exts.length) attempt(k, e + 1); else attempt(k + 1, 0);
      };
      img.onload = function () {
        var bg = document.createElement('div');
        bg.className = 'scene__bg';
        bg.appendChild(img);
        var v = document.createElement('video');
        v.muted = true; v.playsInline = true; v.preload = 'none'; v.loop = false;
        v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
        v.dataset.src = base + '.mp4';
        v.addEventListener('error', function () { v.remove(); });
        v.addEventListener('loadeddata', function () { v.classList.add('on'); });
        bg.appendChild(v);
        s.insertBefore(bg, s.firstChild);
      };
      img.src = base + exts[e];
    }
    attempt(0, 0);
  });

  function bgVideo(i) {
    return scenes[i] ? scenes[i].querySelector('.scene__bg video') : null;
  }
  function warm(i) {
    var v = bgVideo(i);
    if (v && !v.getAttribute('src')) { v.preload = 'auto'; v.src = v.dataset.src; }
  }
  function playScene(i) {
    var v = bgVideo(i);
    if (!v || reduced) return;
    if (!v.getAttribute('src')) v.src = v.dataset.src;
    v.loop = false;
    try { v.currentTime = 0; } catch (err) {}
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  }
  function pauseAll() {
    scenes.forEach(function (s, i) { var v = bgVideo(i); if (v && v.getAttribute('src')) v.pause(); });
  }

  // Ролики-переходы
  function ensureTrans(i) {
    if (i < 0 || i >= N - 1 || trans[i] || !scenes[i].dataset.bg) return;
    if (!transBox) {
      transBox = document.createElement('div');
      transBox.className = 'scenes__trans';
      stage.insertBefore(transBox, stage.firstChild);
    }
    var t = { el: document.createElement('video'), ok: false };
    trans[i] = t;
    t.el.muted = true; t.el.playsInline = true; t.el.preload = 'auto'; t.el.loop = false;
    t.el.setAttribute('muted', ''); t.el.setAttribute('playsinline', '');
    t.el.addEventListener('canplaythrough', function () { t.ok = true; });
    t.el.addEventListener('loadeddata', function () { t.ok = true; });
    t.el.addEventListener('error', function () { t.ok = false; t.el.remove(); });
    t.el.src = 'media/scenes/' + scenes[i].dataset.bg + '-to.mp4';
    transBox.appendChild(t.el);
  }

  // ---------- Состояние ----------
  function suspended() { return userPaused || offscreen || document.hidden || reduced; }

  function show(n) {
    current = n;
    scenes.forEach(function (s, i) {
      var on = i === current;
      s.classList.toggle('is-active', on);
      if (on) s.removeAttribute('aria-hidden'); else s.setAttribute('aria-hidden', 'true');
      dots[i].setAttribute('aria-selected', on ? 'true' : 'false');
      dots[i].classList.toggle('done', i < current);
    });
    count.textContent = (current + 1) + ' / ' + N;
  }

  function clearTimers() {
    clearTimeout(holdTimer);
    cancelAnimationFrame(raf);
  }

  function stopTrans() {
    cancelAnimationFrame(raf);
    if (activeTrans) {
      activeTrans.el.pause();
      activeTrans.el.classList.remove('on');
      activeTrans = null;
    }
    root.classList.remove('in-trans', 'text-out');
  }

  function startHold(i) {
    stopTrans();
    clearTimers();
    pauseAll();
    phase = 'hold';
    show(i);
    ensureTrans(i);
    warm(i + 1);
    holdLeft = (i === N - 1) ? LAST_HOLD_MS : HOLD_MS;
    holdStart = Date.now();
    if (!suspended()) {
      playScene(i);
      holdTimer = setTimeout(afterHold, holdLeft);
    }
  }

  function afterHold() {
    if (current === N - 1) { startHold(0); return; }
    var t = trans[current];
    if (t && t.ok) startTrans(current); else startHold(current + 1);
  }

  function startTrans(i) {
    var t = trans[i];
    clearTimers();
    phase = 'trans';
    activeTrans = t;
    textSwitched = false;
    var v = bgVideo(i);
    if (v) v.pause();
    try { t.el.currentTime = 0; } catch (err) {}
    t.el.classList.add('on');
    root.classList.add('in-trans', 'text-out');
    t.el.onended = function () { if (phase === 'trans') startHold(i + 1); };
    if (!suspended()) { runTrans(); }
  }

  function runTrans() {
    var t = activeTrans;
    if (!t) return;
    var p = t.el.play();
    if (p && p.catch) p.catch(function () {});
    (function tick() {
      if (phase !== 'trans' || !activeTrans) return;
      var d = t.el.duration || 5;
      var k = Math.min(1, t.el.currentTime / d);
      if (transBox) transBox.style.setProperty('--ov', (0.2 + 0.8 * Math.abs(2 * k - 1)).toFixed(3));
      if (!textSwitched && d - t.el.currentTime <= TEXT_BACK) {
        textSwitched = true;
        show(current + 1);
        root.classList.remove('text-out');
      }
      raf = requestAnimationFrame(tick);
    })();
  }

  function suspend() {
    clearTimeout(holdTimer);
    cancelAnimationFrame(raf);
    if (phase === 'hold') holdLeft = Math.max(0, holdLeft - (Date.now() - holdStart));
    pauseAll();
    if (activeTrans) activeTrans.el.pause();
  }

  function resume() {
    if (suspended()) return;
    if (phase === 'hold') {
      holdStart = Date.now();
      var v = bgVideo(current);
      if (v && v.getAttribute('src')) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else playScene(current);
      holdTimer = setTimeout(afterHold, holdLeft);
    } else if (phase === 'trans') {
      runTrans();
    }
  }

  function sync() {
    root.classList.toggle('paused', userPaused);
    root.classList.toggle('offscreen', offscreen);
    if (suspended()) suspend(); else resume();
  }

  function go(n) {
    startHold((n + N) % N);
  }

  // ---------- Управление ----------
  pauseBtn.addEventListener('click', function () {
    userPaused = !userPaused;
    pauseBtn.textContent = userPaused ? '▶' : '❚❚';
    pauseBtn.setAttribute('aria-label', userPaused ? 'Продолжить' : 'Пауза');
    sync();
  });
  document.getElementById('sc-prev').addEventListener('click', function () { go(current - 1); });
  document.getElementById('sc-next').addEventListener('click', function () { go(current + 1); });
  root.querySelectorAll('[data-go="next"]').forEach(function (b) {
    b.addEventListener('click', function () { go(current + 1); });
  });

  document.addEventListener('keydown', function (e) {
    if (offscreen) return;
    if (e.target.closest && e.target.closest('#roles')) return;
    if (e.key === 'ArrowRight') go(current + 1);
    if (e.key === 'ArrowLeft') go(current - 1);
  });

  var x0 = null, y0 = null;
  root.addEventListener('touchstart', function (e) {
    x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
  }, { passive: true });
  root.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    var dy = e.changedTouches[0].clientY - y0;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(current + (dx < 0 ? 1 : -1));
    x0 = null;
  }, { passive: true });

  // Не крутим фильм, когда презентацию не видно
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      var off = entries[0].intersectionRatio < 0.3;
      if (off !== offscreen) { offscreen = off; sync(); }
    }, { threshold: [0, 0.3, 1] }).observe(root);
  }
  document.addEventListener('visibilitychange', sync);

  if (reduced) { userPaused = true; pauseBtn.textContent = '▶'; root.classList.add('paused'); }
  startHold(0);
})();
