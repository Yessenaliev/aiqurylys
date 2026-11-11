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

// Роли: показываем только разделы выбранной роли
var selectRole = (function () {
  var bar = document.getElementById('rolebar');
  if (!bar) return function () {};

  var INFO = {
    director: ['Директор и владелец', 'Видит деньги по каждому проекту, получает утреннюю сводку в Telegram и понимает, в какие тендеры идти.'],
    gip: ['ГИП — главный инженер проекта', 'Видит объёмы по каждому альбому, спорные места проекта и расхождения между актами подрядчиков и проектом. График работ строится по тем же объёмам.'],
    pto: ['ПТО и сметчик', 'Получает объёмы и смету из чертежей, проверяет акты подрядчика и не заполняет документы вручную.'],
    supply: ['Снабженец', 'Получает список материалов из сметы и цены от поставщиков в одной таблице.'],
    site: ['Начальник участка', 'Получает график работ, раздаёт задачи и каждый день видит факт против плана.'],
    foreman: ['Прораб и мастер', 'Работает в Telegram: получает задачи и сдаёт объём одним сообщением.'],
    fin: ['Финансист', 'Видит план, факт и остаток денег по проекту и расхождения в актах подрядчика.'],
    all: ['Все разделы', 'Одиннадцать разделов — от тендера до сдачи проекта. Каждый отдаёт готовый документ.']
  };
  var tabs = Array.prototype.slice.call(bar.querySelectorAll('[role="tab"]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('#role-cards .card'));

  function select(role) {
    if (!INFO[role]) return;
    tabs.forEach(function (t) {
      var on = t.dataset.role === role;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      if (on && t.scrollIntoView && bar.scrollWidth > bar.clientWidth) {
        bar.scrollLeft = t.offsetLeft - 20;
      }
    });
    cards.forEach(function (c) {
      c.hidden = role !== 'all' && c.dataset.roles.split(' ').indexOf(role) === -1;
    });
    document.getElementById('role-title').textContent = INFO[role][0];
    document.getElementById('role-text').textContent = INFO[role][1];
  }

  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { select(t.dataset.role); });
    t.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      var next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      select(next.dataset.role);
      next.focus();
    });
  });
  // Кнопки в сценах: «Что получит сметчик» и т. п.
  document.querySelectorAll('a[data-role]').forEach(function (a) {
    a.addEventListener('click', function () { select(a.dataset.role); });
  });

  select('director');
  return select;
})();

// Презентация на первом экране
(function () {
  var root = document.querySelector('.scenes');
  if (!root) return;

  var DURATION = 8; // секунд на сцену
  var scenes = Array.prototype.slice.call(root.querySelectorAll('.scene'));
  var dotsBox = document.getElementById('dots');
  var count = document.getElementById('sc-count');
  var pauseBtn = document.getElementById('sc-pause');
  var current = 0;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
      if (i === current) go(current + 1);
    });
    dotsBox.appendChild(b);
    return b;
  });

  // Фон сцены: media/scenes/<имя>.jpg (кадр) и <имя>.mp4 (видео).
  // Для вертикальных экранов — <имя>-m.jpg и <имя>-m.mp4, если они есть.
  // Пока файлов нет, остаётся обычный тёмный фон.
  var portrait = window.matchMedia && window.matchMedia('(max-aspect-ratio: 3/4)').matches;
  scenes.forEach(function (s) {
    var name = s.dataset.bg;
    if (!name) return;
    var variants = portrait ? [name + '-m', name] : [name];

    function attempt(k) {
      if (k >= variants.length) return;
      var base = 'media/scenes/' + variants[k];
      var img = new Image();
      img.alt = '';
      img.onerror = function () { attempt(k + 1); };
      img.onload = function () {
        var bg = document.createElement('div');
        bg.className = 'scene__bg';
        bg.appendChild(img);
        var v = document.createElement('video');
        v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'none';
        v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
        v.dataset.src = base + '.mp4';
        v.addEventListener('error', function () { v.remove(); });
        v.addEventListener('playing', function () { v.classList.add('on'); });
        bg.appendChild(v);
        s.insertBefore(bg, s.firstChild);
        if (s.classList.contains('is-active')) playBg(s);
      };
      img.src = base + '.jpg';
    }
    attempt(0);
  });

  function playBg(s) {
    var v = s.querySelector('.scene__bg video');
    if (!v || reduced) return;
    if (!v.src) v.src = v.dataset.src;
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  }
  function stopBg(s) {
    var v = s.querySelector('.scene__bg video');
    if (v && v.src) v.pause();
  }

  function go(n) {
    current = (n + scenes.length) % scenes.length;
    scenes.forEach(function (s, i) {
      var on = i === current;
      if (on) playBg(s); else stopBg(s);
      s.classList.toggle('is-active', on);
      if (on) s.removeAttribute('aria-hidden'); else s.setAttribute('aria-hidden', 'true');
      dots[i].setAttribute('aria-selected', on ? 'true' : 'false');
      dots[i].classList.toggle('done', i < current);
    });
    count.textContent = (current + 1) + ' / ' + scenes.length;
  }

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

  // Стрелки на клавиатуре, пока презентация на экране
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
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    var dy = e.changedTouches[0].clientY - y0;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(current + (dx < 0 ? 1 : -1));
    x0 = null;
  }, { passive: true });

  // Не листаем, когда презентацию не видно
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      root.classList.toggle('offscreen', entries[0].intersectionRatio < 0.35);
    }, { threshold: [0, 0.35, 1] }).observe(root);
  }

  go(0);
  if (reduced) setPaused(true);
})();
