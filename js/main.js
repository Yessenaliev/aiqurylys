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

// Презентация на первом экране: непрерывный фильм.
// Каждый раздел — один ролик: он и есть анимация, пока заполняется ползунок раздела.
// Ролик раздела заканчивается кадром следующего раздела, поэтому, когда ползунок заполнен,
// сразу начинается следующий раздел — без отдельного перехода и без повторной анимации.
(function () {
  var root = document.querySelector('.scenes');
  if (!root) return;

  var RATE = 0.8;          // скорость ролика: 5 секунд видео идут 6,25 секунды, успеваешь прочитать
  var FALLBACK_MS = 6250;  // если ролика нет, раздел держится столько
  var ENDING_S = 0.6;      // за сколько секунд до конца текст раздела плавно уходит

  var scenes = Array.prototype.slice.call(root.querySelectorAll('.scene'));
  var N = scenes.length;
  var dotsBox = document.getElementById('dots');
  var count = document.getElementById('sc-count');
  var pauseBtn = document.getElementById('sc-pause');
  var current = 0;
  var userPaused = false;
  var offscreen = false;
  var timer = null;
  var startedAt = 0;
  var fallbackLeft = FALLBACK_MS;
  var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var portrait = !!(window.matchMedia && window.matchMedia('(max-aspect-ratio: 3/4)').matches);

  // ---------- Ползунки-оглавление ----------
  var dots = scenes.map(function (s, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'dot';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', 'Раздел ' + (i + 1) + ': ' + s.dataset.name);
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

  // ---------- Фоны ----------
  // media/scenes/<имя>.webp|jpg — кадр раздела,
  // media/scenes/<имя>-to.mp4 — ролик раздела (от его кадра к кадру следующего),
  // у последнего раздела ролик <имя>.mp4.
  scenes.forEach(function (s, idx) {
    var name = s.dataset.bg;
    if (!name) return;
    var variants = portrait ? [name + '-m', name] : [name];
    var exts = ['.webp', '.jpg'];
    var tail = idx < N - 1 ? '-to' : '';

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
        v.dataset.src = base + tail + '.mp4';
        v.addEventListener('error', function () { v.remove(); });
        v.addEventListener('loadeddata', function () { v.classList.add('on'); });
        bg.appendChild(v);
        s.insertBefore(bg, s.firstChild);
        // Первый раздел показывается раньше, чем загрузится его фон: запускаем ролик, как только он есть
        if (s === scenes[current] && !suspended()) run(true);
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
  function pauseAll() {
    scenes.forEach(function (s, i) { var v = bgVideo(i); if (v && v.getAttribute('src')) v.pause(); });
  }

  // ---------- Состояние ----------
  function suspended() { return userPaused || offscreen || document.hidden || reduced; }

  function show(n) {
    current = n;
    scenes.forEach(function (s, i) {
      var on = i === current;
      s.classList.toggle('is-active', on);
      s.classList.remove('ending');
      if (on) s.removeAttribute('aria-hidden'); else s.setAttribute('aria-hidden', 'true');
      dots[i].setAttribute('aria-selected', on ? 'true' : 'false');
      dots[i].classList.toggle('done', i < current);
      if (i !== current) dots[i].style.removeProperty('--p');
    });
    dots[current].style.setProperty('--p', 0);
    count.textContent = (current + 1) + ' / ' + N;
  }

  function startSection(i) {
    clearInterval(timer);
    pauseAll();
    show(i);
    warm(i + 1);
    fallbackLeft = FALLBACK_MS;
    if (!suspended()) run(true);
  }

  function run(fresh) {
    var v = bgVideo(current);
    if (v) {
      if (!v.getAttribute('src')) v.src = v.dataset.src;
      v.loop = false;
      v.playbackRate = RATE;
      if (fresh) { try { v.currentTime = 0; } catch (err) {} }
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    }
    if (fresh) fallbackLeft = FALLBACK_MS;
    startedAt = Date.now();
    clearInterval(timer);
    timer = setInterval(step, 60);
    step();
  }

  function step() {
    if (suspended()) return;
    var v = bgVideo(current);
    var p, total;
    if (v && v.getAttribute('src')) {
      total = (v.duration || 5) / RATE;
      p = v.ended ? 1 : (v.duration ? v.currentTime / v.duration : 0);
    } else {
      total = FALLBACK_MS / 1000;
      p = 1 - Math.max(0, fallbackLeft - (Date.now() - startedAt)) / FALLBACK_MS;
    }
    p = Math.max(0, Math.min(1, p));
    dots[current].style.setProperty('--p', p.toFixed(3));
    if ((1 - p) * total <= ENDING_S) scenes[current].classList.add('ending');
    if (p >= 0.995) next();
  }

  function next() {
    startSection(current === N - 1 ? 0 : current + 1);
  }

  function suspend() {
    clearInterval(timer);
    fallbackLeft = Math.max(0, fallbackLeft - (Date.now() - startedAt));
    pauseAll();
  }

  function sync() {
    root.classList.toggle('paused', userPaused);
    root.classList.toggle('offscreen', offscreen);
    if (suspended()) suspend(); else run(false);
  }

  function go(n) {
    startSection((n + N) % N);
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
  startSection(0);
})();
