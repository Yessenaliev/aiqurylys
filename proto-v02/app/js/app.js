/* AIQurylys · прототип v0.2 · ядро: данные, маршруты, меню, верхняя панель, окна */
(function () {
  'use strict';
  var AQ = window.AQ = { D: {}, M: null, C: null, screens: {}, state: { role: 'owner', demo: true }, timers: [] };

  /* ---------- утилиты ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = AQ.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  AQ.$ = $; AQ.$$ = $$;
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  AQ.store = store;
  AQ.fmt = function (n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); };
  AQ.mln = function (n) { return String(n).replace('.', ',') + ' млн ₸'; };
  AQ.tg = function (t) { return t; };
  AQ.later = function (fn, ms) { var id = setTimeout(fn, ms); AQ.timers.push(id); return id; };
  AQ.every = function (fn, ms) { var id = setInterval(fn, ms); AQ.timers.push(id); return id; };
  function clearTimers() { AQ.timers.forEach(function (t) { clearTimeout(t); clearInterval(t); }); AQ.timers = []; }
  AQ.greet = function () {
    var q = new URLSearchParams(location.search).get('hour'), h = q != null && q !== '' ? +q : new Date().getHours();
    return h >= 5 && h < 12 ? 'Доброе утро' : h >= 12 && h < 18 ? 'Добрый день' : h >= 18 && h < 23 ? 'Добрый вечер' : 'Доброй ночи';
  };
  AQ.reduced =window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var ICO = {
    home: 'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
    folder: 'M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
    check: 'M4 12l5 5L20 6',
    calc: 'M5 3h14v18H5zM8 7h8M8 12h2M12 12h2M16 12h0M8 16h2M12 16h2M16 16h0',
    doc: 'M7 3h8l4 4v14H7zM15 3v4h4M10 12h6M10 16h6',
    site: 'M3 21h18M5 21V9l7-5 7 5v12M10 21v-6h4v6',
    money: 'M12 3v18M16 7.5c0-1.7-1.8-3-4-3s-4 1.3-4 3 1.8 2.5 4 3 4 1.3 4 3-1.8 3-4 3-4-1.3-4-3',
    legal: 'M12 3v18M5 7h14M5 7l-3 7a3.5 3.5 0 0 0 6 0zM19 7l-3 7a3.5 3.5 0 0 0 6 0zM8 21h8',
    tender: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
    company: 'M4 21V5l8-2v18M12 9h8v12M7 9h2M7 13h2M7 17h2M15 13h2M15 17h2',
    plus: 'M12 5v14M5 12h14',
    bell: 'M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4',
    help: 'M12 17h.01M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7',
    menu: 'M4 7h16M4 12h16M4 17h16',
    search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-4.5-4.5',
    more: 'M5 12h.01M12 12h.01M19 12h.01',
    x: 'M6 6l12 12M18 6L6 18',
    checkdoc: 'M7 3h8l4 4v14H7zM15 3v4h4M9.5 14.5l2 2 3.8-4.4',
    cart: 'M3 4h2.2l2.3 11h10.3L20 8H6M9.5 20h.01M17 20h.01',
    target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM12 12h.01',
    hardhat: 'M3 18h18M5 18v-2a7 7 0 0 1 14 0v2M12 9V6M9.3 9.6L7.8 7M14.7 9.6L16.2 7',
    send: 'M21 4L3 11l6.5 2.5L12 20l3-5 6-11zM9.5 13.5L21 4',
    panel: 'M4 5h16v14H4zM9 5v14',
    chev: 'M6 9l6 6 6-6',
    user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
    lock: 'M7 11V8a5 5 0 0 1 10 0v3M5 11h14v9H5zM12 15v2',
    house: 'M3.5 11.5L12 4l8.5 7.5M6 10v10h12V10M10 20v-5h4v5',
    truck: 'M2.5 7h11v9h-11zM13.5 10h4l3 3v3h-7M7 18.5h.01M17 18.5h.01'
  };
  var ico = AQ.ico = function (k) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + (ICO[k] || ICO.more) + '"/></svg>'; };
  AQ.AGI = { estimator: 'calc', checker: 'checkdoc', docs: 'doc', lawyer: 'legal', supply: 'cart', tender: 'target', finance: 'money', site: 'hardhat', foreman: 'send', arch: 'house', equip: 'truck' };
  AQ.agIcon = function (id, cls, title) { return '<span class="agi ' + (cls || '') + '"' + (title ? ' title="' + esc(title) + '"' : '') + '>' + ico(AQ.AGI[id] || 'more') + '</span>'; };

  /* ---------- права ---------- */
  function role() { return AQ.M.roles.filter(function (r) { return r.id === AQ.state.role; })[0]; }
  AQ.role = role;
  var can = AQ.can = function (need) { var r = role(); return need === '*' || r.perms === 'ALL' || r.perms.indexOf(need) !== -1; };
  var tabsOf = AQ.tabsOf = function (s) { return s.tabs.filter(function (t) { return can(t.need); }); };
  var secs = AQ.secs = function () { return AQ.M.sections.filter(function (s) { return (!s.owner || role().company) && tabsOf(s).length; }); };
  var SPECIAL = ['digital', 'help', 'bot', 'profile', 'notif', 'support', 'welcome', 'more'];
  AQ.SPECIAL = SPECIAL;
  /* старые адреса вкладок продолжают работать: переходят на новое место по структуре оригинала */
  AQ.alias = function (r) { var a = AQ.M && AQ.M.alias; if (!a) return r; var q = String(r || '').split('/'), k = q[0] + '/' + (q[1] || ''); return a[k] ? a[k] + (q.length > 2 ? '/' + q.slice(2).join('/') : '') : r; };
  var findTab = AQ.findTab = function (r) {
    var p = AQ.alias(r || '').split('/');
    var s = AQ.M.sections.filter(function (x) { return x.id === p[0]; })[0];
    if (!s || (s.owner && !role().company)) return null;
    var t = s.tabs.filter(function (x) { return x.id === p[1] && can(x.need); })[0] || (p[1] ? null : tabsOf(s)[0]);
    return t ? { s: s, t: t } : null;
  };
  AQ.canRoute = function (r) {
    var p = String(r).split('/');
    if (SPECIAL.indexOf(p[0]) !== -1) return true;
    return !!findTab(p[0] + '/' + (p[1] || ''));
  };
  AQ.href = function (r) { return '#/' + r; };
  AQ.lnk = function (r, label, cls) { return AQ.canRoute(r) ? '<a class="' + (cls || 'btn') + '" href="#/' + r + '">' + label + '</a>' : ''; };
  /* «Назад»: свой стек переходов; без истории ведёт на уровень выше */
  var navStack = [location.hash || '#/home/today'];
  window.addEventListener('hashchange', function () {
    var h = location.hash, n = navStack.length;
    if (n > 1 && navStack[n - 2] === h) navStack.pop(); else if (navStack[n - 1] !== h) navStack.push(h);
    if (navStack.length > 60) navStack.shift();
  });
  function parentHash() {
    var p = (location.hash || '').replace(/^#\/?/, '').split('/').filter(Boolean);
    if (p.length > 2) return '#/' + p.slice(0, -1).join('/');
    return '#/home/today';
  }
  function isHome() { var h = (location.hash || '').replace(/^#\/?/, ''); return !h || h === 'home' || h === 'home/today'; }
  AQ.back = function () {
    if (document.querySelector('#layer .overlay')) { AQ.closeLayer(); return; }
    if (navStack.length > 1) { history.back(); return; }
    if (!isHome()) location.hash = parentHash();
  };
  function updateBack() { var b = document.querySelector('.back-btn'); if (b) b.hidden = isHome() && navStack.length <= 1; }
  AQ.go = function (r) { var h = '#/' + r; if (location.hash === h) render(); else location.hash = h; };

  /* ---------- маршрут ---------- */
  var route = { key: 'home/today', sec: 'home', tab: 'today', sub: [], special: null };
  function parseRoute() {
    var p = (AQ._h != null ? AQ._h : location.hash).replace(/^#\/?/, '').split('/').filter(Boolean);
    var r = { sub: [], special: null, p: p };
    if (!p.length) p = ['home'];
    p = AQ.alias(p.join('/')).split('/').filter(Boolean);
    if (SPECIAL.indexOf(p[0]) !== -1) {
      r.special = p[0]; r.sub = p.slice(1); r.key = p[0]; return r;
    }
    var f = findTab(p[0] + '/' + (p[1] || ''));
    if (!f) { r.denied = true; r.sec = p[0]; r.key = p[0] + '/' + (p[1] || ''); return r; }
    r.sec = f.s.id; r.tab = f.t.id; r.key = f.s.id + '/' + f.t.id; r.sub = p.slice(2); r.sObj = f.s; r.tObj = f.t;
    return r;
  }

  /* ---------- данные ---------- */
  function load(url) { return fetch(url).then(function (r) { if (!r.ok) throw new Error(url + ' ' + r.status); return r.json(); }); }

  /* ---------- сообщения ---------- */
  AQ.toast = function (msg) {
    var t = $('#toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(AQ._tt); AQ._tt = setTimeout(function () { t.hidden = true; }, 3600);
  };
  AQ.stub = function (what) { AQ.toast('В рабочей версии здесь будет: ' + what); };

﻿  /* ---------- левая панель: порядок и названия как на ai-qurylys.kz ---------- */
  var plural = AQ.plural = function (n, a, b, c) { var m = n % 10, k = n % 100; return n + ' ' + (m === 1 && k !== 11 ? a : (m >= 2 && m <= 4 && (k < 10 || k >= 20) ? b : c)); };
  /* «Проба использована»: Тендеры и закупки и Себестоимость закрыты до подключения тарифа */
  AQ.locked = function (sec) { return !AQ.state.demo && !!AQ.state.trial && (sec === 'sales' || sec === 'calc'); };
  AQ.lockedHtml = function (route) { var nm = route.sec === 'calc' ? 'Расчёт себестоимости' : (route.sObj ? route.sObj.t : ''); return '<div class="empty lock"><h2>Раздел «' + esc(nm) + '» закрыт</h2><p>Проба раздела «' + esc(nm) + '» использована. Чтобы работать дальше, подключите тариф.</p><div class="btns" style="justify-content:center"><a class="btn pri" href="#/company/tariff/up">Улучшить план</a><a class="btn" href="#/home/today">На главную</a></div></div>'; };
  AQ.hiddenFor = function (s) { return !!(s.hideFor && s.hideFor.indexOf(role().id) !== -1); };
  function secById(id) { return AQ.M.sections.filter(function (s) { return s.id === id; })[0]; }
  var navLink = AQ.navLink = function (id, cur) {
    if (id === 'help') return '<a class="nav' + (cur.special === 'help' ? ' on' : '') + '" href="#/help" title="Инструкция">' + ico('help') + '<span>Инструкция</span></a>';
    var s = secById(id);
    if (!s || (s.owner && !role().company) || AQ.hiddenFor(s)) return '';
    var ts = tabsOf(s);
    if (!ts.length) return '';
    var lk = AQ.locked(id);
    return '<a class="nav' + (cur.sec === id && !cur.special ? ' on' : '') + (lk ? ' locked' : '') + '" href="#/' + id + '/' + ts[0].id + '" title="' + esc(s.t) + '">' + ico(s.ico) + '<span>' + esc(s.t) + '</span>' + (lk ? '<i class="lk">' + ico('lock') + '</i>' : '') + '</a>';
  };
  /* блок «Осталось расчётов» внизу панели */
  var usage = AQ.usage = function () {
    var r = role(), u = AQ.D.tariff, demo = AQ.state.demo;
    if (!r.company) return '<div class="usage plain"><b>Ваша роль: ' + esc(r.n) + '</b><span>Видны только ваши разделы. Права выдаёт владелец.</span></div>';
    var used = !demo && !!AQ.state.trial, left = demo ? u.calcTotal - u.calcUsed : (used ? 0 : 1), total = demo ? u.calcTotal : 1, pct = demo ? Math.round(u.calcUsed / u.calcTotal * 100) : (used ? 85 : 0);
    return '<a class="usage" href="#/company/tariff"><div class="u1"><span>Осталось расчётов</span><b class="' + (left === 0 ? 'bad' : '') + '">' + left + ' из ' + total + '</b></div><div class="bar"><i style="width:' + pct + '%"></i></div>' +
      (demo ? '<div class="u2">' + esc(u.plan) + '<br>Оплачено до ' + esc(u.until) + ' · <span class="acc">Улучшить план</span></div>' : (used ? '<div class="u2"><b>Пробный доступ ' + pct + ' %</b><br>Пробный доступ почти израсходован.<br>Расчёты в пакете закончились. Чтобы считать дальше, подключите тариф. <span class="acc">Улучшить план</span></div>' : '<div class="u2"><b>Пробный доступ ' + pct + ' %</b><br>Пробный расчёт ещё не использован. <span class="acc">Выбрать пакет расчётов</span></div>')) + '</a>';
  };
  function renderSide() {
    var r = role(), cur = route, demo = AQ.state.demo, h = '';
    var sub = r.company ? plural(demo ? AQ.D.projects.length : 0, 'проект', 'проекта', 'проектов') + ' · ' + (demo ? 'Подписка «Проект»' : 'пробный доступ') : r.n;
    h += '<div class="shead"><a class="logo" href="#/home/today" aria-label="AIQurylys — Главная"><span class="lmark"><svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x=".5" y=".5" width="27" height="27" rx="7" stroke="#F26B1D"/><path d="M7 20V9l7-3 7 3v11M11 20v-6h6v6" stroke="currentColor" stroke-width="1.4"/></svg></span><span class="lt"><b>AI<i>Qurylys</i></b><small>Платформа для строительства</small></span></a><button class="sbtn" data-act="side-collapse" aria-label="Свернуть панель" title="Свернуть панель">' + ico('panel') + '</button></div>';
    h += '<a class="ucard" href="#/more" title="Кабинет и настройки"><span class="ava">' + esc(r.name.charAt(0)) + '</span><span class="ut"><b>' + esc(r.name) + '</b><small>' + esc(sub) + '</small></span></a>';
    h += '<button class="screate" data-act="create" title="Создать">' + ico('plus') + '<span>Создать</span></button>';
    h += '<nav class="snav" aria-label="Разделы">';
    AQ.M.nav.forEach(function (n) {
      if (n.sec) { h += navLink(n.sec, cur); return; }
      var items = n.items.map(function (id) { return navLink(id, cur); }).join('');
      if (items) h += '<div class="grp">' + esc(n.g) + '</div>' + items;
    });
    h += '</nav>';
    h += '<a class="nav sfoot' + (cur.special === 'more' ? ' on' : '') + '" href="#/more" title="Кабинет и настройки">' + ico('user') + '<span>Кабинет и настройки</span></a>' + usage();
    $('#side').innerHTML = h;
  }
  function applySide() { var c = store.get('aq_side') === '1'; document.body.classList.toggle('side-min', c); var b = document.querySelector('.sbtn'); if (b) b.setAttribute('aria-expanded', String(!c)); }

  /* ---------- верхняя панель ---------- */
  function renderTop() {
    var r = role(), nn = AQ.D.notifs.filter(function (n) { return n.new; }).length;
    var opts = AQ.M.roles.map(function (x) { return '<option value="' + x.id + '"' + (x.id === r.id ? ' selected' : '') + '>' + esc(x.n) + '</option>'; }).join('');
    $('#top').innerHTML =
      '<a class="mlogo" href="#/home/today" aria-label="AIQurylys — Главная">AI<i>Qurylys</i></a>' +
      '<button class="pill back-btn" data-act="back" aria-label="Назад" title="Назад (Alt + ←)" hidden>←<span class="hide-m">&nbsp;Назад</span></button>' +
      '<button class="search" data-act="palette" aria-label="Поиск">' + ico('search') + '<span>Поиск</span><span class="kbd">Ctrl K</span></button>' +
      '<span class="sp"></span>' +
      '<label class="pill hide-m" title="Прототип показывает кабинет глазами разных ролей">Смотреть как&nbsp;<select id="roleSel" aria-label="Смотреть как">' + opts + '</select></label>' +
      '<span class="demo-toggle hide-m' + (AQ.state.demo ? ' on' : '') + '" data-act="demo" role="switch" aria-checked="' + AQ.state.demo + '" tabindex="0"><span class="sw"></span>Демо-данные</span>' +
      '<a class="pill hide-m" href="#/digital" title="Цифровой отдел: 11 ИИ-сотрудников">' + ico('hardhat') + '<span>Цифровой отдел</span></a>' +
      '<a class="pill hide-m" href="#/help">' + ico('help') + '<span>Инструкция</span></a>' +
      '<button class="pill ico" data-act="bell" aria-label="Уведомления">' + ico('bell') + (nn ? '<span class="cnt">' + nn + '</span>' : '') + '</button>' +
      '<button class="umenu" data-act="profile" aria-label="Меню профиля"><span class="ava">' + esc(r.name.charAt(0)) + '</span><span class="un hide-m">' + esc(r.name) + '</span><span class="hide-m">' + ico('chev') + '</span></button>';
    var sel = $('#roleSel');
    if (sel) sel.addEventListener('change', function () { setRole(sel.value); });
  }

  /* нижняя панель телефона: Главная · Проекты · Создать · Задачи · Ещё */
  function renderBnav() {
    var s = route.special, sec = route.sec;
    var hm = !s && sec === 'home', pj = !s && sec === 'projects', tk = !s && sec === 'tasks', mo = !(hm || pj || tk);
    $('#bnav').innerHTML =
      '<button data-go="home/today" class="' + (hm ? 'on' : '') + '">' + ico('home') + '<span>Главная</span></button>' +
      '<button data-go="projects/list" class="' + (pj ? 'on' : '') + '">' + ico('company') + '<span>Проекты</span></button>' +
      '<button class="bcreate" data-act="create" aria-label="Создать"><i>' + ico('plus') + '</i><span>Создать</span></button>' +
      '<button data-go="tasks/mine" class="' + (tk ? 'on' : '') + '">' + ico('check') + '<span>Задачи</span></button>' +
      '<button data-go="more" class="' + (mo ? 'on' : '') + '">' + ico('more') + '<span>Ещё</span></button>';
  }

  /* ---------- общий каркас экрана ---------- */
  AQ.head = function (title, desc, crumbs, tabsHtml) {
    return '<div class="crumbs">' + (crumbs || '') + '</div><h1 class="ptitle">' + title + '</h1>' + (desc ? '<p class="pdesc">' + desc + '</p>' : '') + (tabsHtml || '');
  };
  AQ.tabBar = function (s, activeTab) {
    if (tabsOf(s).length < 2) return '<div class="tabs sc" style="display:none"></div>';
    return '<div class="tabs sc" role="tablist">' + tabsOf(s).map(function (t) { return '<a class="tab' + (t.id === activeTab ? ' on' : '') + '" role="tab" href="#/' + s.id + '/' + t.id + '">' + esc(t.t) + '</a>'; }).join('') + '</div>';
  };
  AQ.flow = function (t) {
    if (!AQ.dev) return '';
    var nx = (t.next || []).filter(function (n) { return AQ.canRoute(n[0]); }).map(function (n) { return '<a href="#/' + n[0] + '">→ ' + esc(n[1]) + '</a>'; }).join('') || '<span class="mut">—</span>';
    return '<div class="flow"><div><b>Вы даёте</b>' + esc(t.give || '—') + '</div><div class="ar">→</div><div><b>Получаете</b>' + esc(t.get || '—') + '</div><div class="ar">→</div><div class="nx"><b>Дальше</b>' + nx + '</div></div>';
  };
  AQ.wasBlock = function (t) { return AQ.dev && t.was ? '<div class="was"><b>Где это было раньше:</b> ' + esc(t.was) + '</div>' : ''; };
  AQ.ext = function (t) { return AQ.dev && t.url ? '<button class="btn sm ghost" data-ext="' + esc(t.url) + '">Открыть в рабочей версии ↗</button>' : ''; };
  AQ.empty = function (title, text) {
    return '<div class="empty"><h2>' + esc(title) + '</h2><p>' + esc(text) + '</p><div class="btns" style="justify-content:center"><button class="btn pri" data-act="demo-on">Показать на демо-компании</button></div></div>';
  };

  var DATA_SCREENS = ['projects', 'files', 'tasks', 'issued', 'est', 'check', 'offer', 'vol', 'vcmp', 'docsmade', 'chief', 'plan', 'master', 'norms', 'tech', 'fin', 'budget', 'sup', 'price', 'out', 'subs', 'contracts', 'review', 'letter', 'lchat', 'tender', 'passport', 'demand', 'concept', 'summary', 'warehouse'];
  var EMPTY_TEXT = {
    projects: ['Проектов пока нет', 'Добавьте первый проект: адрес, стороны договора и папка документов. Или посмотрите, как всё выглядит на демо-компании.'],
    est: ['Расчётов пока нет', 'Загрузите чертежи проекта, и сметчик посчитает объёмы и себестоимость.'],
    tender: ['Лента тендеров пуста', 'Заполните паспорт компании, и тендерный менеджер подберёт закупки по вашему профилю.']
  };

  /* ---------- отрисовка ---------- */
  function render() {
    clearTimers();
    route = parseRoute();
    var view = $('#view'), ctx = { after: null };
    var r = role(), html = '', title = 'Главная';
    if (route.special === 'welcome') { showWelcome(); route = { key: 'home/today', sec: 'home', tab: 'today', sub: [], special: null, sObj: AQ.M.sections[0], tObj: AQ.M.sections[0].tabs[0] }; }
    if (route.denied) {
      html = '<div class="empty"><h2>Для роли «' + esc(r.n) + '» этот раздел не открывается</h2><p>Раздел виден, если у роли есть хотя бы одна его вкладка. Это решает владелец в «Компания → Сотрудники и доступ».</p><div class="btns" style="justify-content:center"><a class="btn pri" href="#/home/today">На главную</a><button class="btn" data-role="owner">Смотреть как владелец</button></div></div>';
    } else if (route.special) {
      var fn = AQ.screens['_' + route.special];
      html = fn ? fn(route, ctx) : '';
      title = ({ digital: 'Цифровой отдел', more: 'Ещё', help: 'Инструкция', bot: 'Telegram-бот и телефон', profile: 'Профиль и вход', notif: 'Уведомления', support: 'Поддержка' })[route.special] || 'Страница';
    } else {
      var fn2 = AQ.screens[route.tObj.screen] || AQ.screens._generic;
      if (!AQ.state.demo && DATA_SCREENS.indexOf(route.tObj.screen) !== -1) {
        var et = EMPTY_TEXT[route.tObj.screen] || ['Здесь пока пусто', 'Данные появятся, когда вы загрузите свои файлы. Или включите демо-компанию, чтобы увидеть экран заполненным.'];
        html = AQ.tabHead(route) + AQ.empty(et[0], et[1]) + AQ.wasBlock(route.tObj);
      } else {
        html = fn2(route, ctx);
      }
      title = route.tObj.t + ' — ' + route.sObj.t;
    }
    if (!route.denied && !route.special && AQ.locked(route.sec)) { html = AQ.lockedHtml(route); ctx.after = null; }
    view.innerHTML = html;
    /* две строки вкладок подряд: если вторая уже содержит все пункты первой, первую убираем */
    var bars = $$('#view .tabs.sc');
    if (bars.length > 1) { var lab = function (b) { return $$('.tab', b).map(function (x) { return x.textContent.trim(); }); }, l1 = lab(bars[0]), l2 = lab(bars[1]); if (l1.length && l1.every(function (x) { return l2.indexOf(x) !== -1; })) bars[0].remove(); }
    $$('#view .tabs.sc').forEach(function (t) { var a = t.querySelector('.tab.on'); if (a) t.scrollLeft = Math.max(0, a.offsetLeft - 16); });
    AQ.tblLabels(view);
    if (!AQ.reduced) { view.classList.remove('vin'); void view.offsetWidth; view.classList.add('vin'); }
    document.title = title + ' — AIQurylys (прототип v1.0)';
    if (AQ.afterRender) AQ.afterRender(route, view);
    renderSide(); renderBnav(); updateBack();
    $('#side').classList.remove('open');
    window.scrollTo(0, 0);
    if (ctx.after) ctx.after();
  }
  function crumbs() {
    return '<a href="#/home/today">Главная</a>' + (route.sObj && route.sec !== 'home' ? ' / <a href="#/' + route.sec + '/' + tabsOf(route.sObj)[0].id + '">' + esc(route.sObj.t) + '</a>' : '');
  }
  AQ.crumbs = crumbs;
  AQ.render = render;
  AQ.curRoute = function () { return route; };
  AQ.tblLabels = function (root) {
    $$('table', root).forEach(function (tb) {
      var heads = $$('thead th', tb).map(function (th) { return th.textContent.trim(); });
      $$('tbody tr, tfoot tr', tb).forEach(function (tr) { Array.prototype.forEach.call(tr.children, function (td, i) { if (!td.hasAttribute('colspan') && heads[i]) td.setAttribute('data-label', heads[i]); }); });
    });
  };

  function setRole(id) {
    AQ.state.role = id; store.set('aq02_role', id);
    var f = parseRoute();
    if (f.denied) { location.hash = '#/home/today'; } else render();
    renderTop();
    AQ.toast('Смотрите кабинет глазами роли «' + role().n + '»');
  }
  AQ.setRole = setRole;
  function setDemo(on) {
    AQ.state.demo = on; store.set('aq02_demo', on ? '1' : '0');
    renderTop(); render();
    AQ.toast(on ? 'Демо-компания включена' : 'Демо выключено: так экран выглядит у нового клиента');
  }

  /* ---------- окна ---------- */
  var layer;
  function closeLayer() { layer.innerHTML = ''; document.body.style.overflow = ''; }
  AQ.closeLayer = closeLayer;
  function overlay(inner, cls) {
    layer.innerHTML = '<div class="overlay" data-act="close-bg"><div class="modal ' + (cls || '') + '" role="dialog" aria-modal="true">' + inner + '</div></div>';
    document.body.style.overflow = 'hidden';
  }
  AQ.overlay = overlay;
  var closeBtn = '<button class="pill ico" data-act="close" aria-label="Закрыть">' + ico('x') + '</button>';

  function openCreate() {
    var n = 0, total = 0, h = '<div class="mh"><h2>＋ Создать <span class="mut" style="font-weight:400;font-size:13px">действий: ' + '<span id="cn"></span></span></h2>' + closeBtn + '</div><input id="cq" type="search" placeholder="Найти дело" style="width:100%;margin-bottom:10px" autocomplete="off"><div class="btns" id="cchips" style="margin:0 0 6px"></div><div class="cgrid">';
    AQ.C.groups.forEach(function (g) {
      var items = g.items.filter(function (i) { total++; return can(i[2]); });
      if (!items.length) return;
      n += items.length;
      h += '<div class="cgrp" data-g="' + esc(g.t) + '"><h3>' + esc(g.t) + '</h3>' + items.map(function (i) { return '<a class="cit" data-k="' + esc((i[0] + ' ' + i[1]).toLowerCase()) + '" href="#/' + i[3] + '" data-act="close"><b>' + esc(i[0]) + (i[4] ? ' <span class="tag t-mute" style="float:right">' + esc(i[4]) + '</span>' : '') + '</b><small>' + esc(i[1]) + '</small></a>'; }).join('') + '</div>';
    });
    h += '</div>';
    overlay(h);
    $('#cn').textContent = n + ' из ' + total + ' доступно роли «' + role().n + '»';
    var chips = ['Все'].concat(AQ.C.groups.filter(function (g) { return g.items.some(function (i) { return can(i[2]); }); }).map(function (g) { return g.t; })), cur = 'Все';
    function applyF() { var q = ($('#cq').value || '').toLowerCase().trim(); $$('.cgrp').forEach(function (g) { var vis = 0; $$('.cit', g).forEach(function (a) { var ok = (!q || a.getAttribute('data-k').indexOf(q) !== -1) && (cur === 'Все' || g.getAttribute('data-g') === cur); a.style.display = ok ? '' : 'none'; if (ok) vis++; }); g.style.display = vis ? '' : 'none'; }); }
    $('#cchips').innerHTML = chips.map(function (c, i) { return '<button class="btn sm' + (i === 0 ? ' pri' : '') + '" data-chip="' + esc(c) + '">' + esc(c.split(' ')[0]) + '</button>'; }).join('');
    $$('[data-chip]').forEach(function (b) { b.addEventListener('click', function () { cur = b.getAttribute('data-chip'); $$('[data-chip]').forEach(function (x) { x.classList.toggle('pri', x === b); }); applyF(); }); });
    $('#cq').addEventListener('input', applyF);
  }

  function openPalette(prefill) {
    overlay('<div class="mh"><h2>Спросить или найти</h2>' + closeBtn + '</div><input id="pq" type="search" placeholder="Например: акт, смета, тендеры, цена бетона" style="width:100%" autocomplete="off"><div class="palres" id="pr"></div>');
    var inp = $('#pq'); inp.value = prefill || ''; inp.focus();
    var items = [];
    secs().forEach(function (s) { tabsOf(s).forEach(function (t) { items.push({ t: t.t, d: (t.d || s.t), s: s.t, r: s.id + '/' + t.id, k: (t.t + ' ' + (t.d || '') + ' ' + s.t).toLowerCase() }); }); });
    AQ.C.groups.forEach(function (g) { g.items.forEach(function (i) { if (can(i[2])) items.push({ t: i[0], d: i[1], s: 'Создать', r: i[3], k: (i[0] + ' ' + i[1]).toLowerCase() }); }); });
    items.push({ t: 'Цифровой отдел', d: 'ИИ-сотрудники и их работа', s: 'Главная', r: 'digital', k: 'цифровой отдел ии сотрудники' }, { t: 'Помощь: путеводитель и словарь', d: '10 шагов, термины', s: 'Помощь', r: 'help', k: 'помощь путеводитель словарь справка faq' }, { t: 'Telegram-бот', d: 'Задачи и объёмы из мессенджера', s: 'Профиль', r: 'bot', k: 'telegram бот телеграм' });
    function draw() {
      var q = inp.value.trim().toLowerCase(), res = q ? items.filter(function (i) { return i.k.indexOf(q) !== -1; }) : items.slice(0, 8);
      var h = res.slice(0, 12).map(function (i) { return '<a class="cit" href="#/' + i.r + '" data-act="close"><b>' + esc(i.t) + '</b> <span class="tag t-mute">' + esc(i.s) + '</span><small>' + esc(i.d) + '</small></a>'; }).join('');
      h += '<button class="cit" data-ask="' + esc(inp.value) + '"><b>✦ Спросить помощника' + (q ? ': «' + esc(inp.value) + '»' : '') + '</b><small>Ответ по вашим данным (в демо — заготовленный)</small></button>';
      $('#pr').innerHTML = h;
    }
    inp.addEventListener('input', draw);
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { var a = $('#pr .cit'); if (a) a.click(); } });
    draw();
  }

  function openAsk(q, helper) {
    var d = AQ.D.assistant, r = role();
    layer.innerHTML = '<aside class="drawer" role="dialog" aria-label="Помощник"><div class="dh"><b>✦ ' + esc(helper ? 'Спросить AIQurylys: ' + helper : 'Помощник AIQurylys') + '</b>' + closeBtn + '</div><div class="db"><div class="chat" id="achat"></div><div class="sugg" id="asugg"></div></div><form class="df" id="aform"><input id="ain" placeholder="Задайте вопрос" autocomplete="off"><button class="btn pri sm" type="submit">Спросить</button></form></aside>';
    var chat = $('#achat');
    function say(who, t, go) { var div = document.createElement('div'); div.className = 'msg ' + who; div.innerHTML = esc(t) + (go && AQ.canRoute(go) ? '<br><a class="mb" href="#/' + go + '" data-act="close">Открыть →</a>' : ''); chat.appendChild(div); chat.parentNode.scrollTop = 1e6; }
    function answer(text) {
      var low = text.toLowerCase(), hit = d.answers.filter(function (a) { return a.k.some(function (k) { return low.indexOf(k) !== -1; }); })[0];
      say('me', text);
      AQ.later(function () { hit ? say('bot', hit.a, hit.go) : say('bot', d.fallback); }, 450);
    }
    say('bot', helper ? 'Здравствуйте! Я — ' + helper + '. Спросите по этому разделу, отвечу по вашим данным.' : 'Здравствуйте! Вы смотрите кабинет как «' + r.n + '». ' + d.hello);
    $('#asugg').innerHTML = ((helper && d.byHelper && d.byHelper[helper]) || ['Что с актом подрядчика?', 'Какие тендеры закрываются?', 'Хватит ли денег?', 'Что с договором?']).map(function (s) { return '<button data-q="' + esc(s) + '">' + esc(s) + '</button>'; }).join('');
    $('#aform').addEventListener('submit', function (e) { e.preventDefault(); var v = $('#ain').value.trim(); if (v) { answer(v); $('#ain').value = ''; } });
    if (q) answer(q);
    else $('#ain').focus();
    layer._answer = answer;
  }

  function popover(anchor, html) {
    closePop();
    var p = document.createElement('div'); p.className = 'pop'; p.id = 'pop'; p.innerHTML = html;
    document.body.appendChild(p);
    var b = anchor.getBoundingClientRect(), w = p.offsetWidth;
    p.style.top = (b.bottom + 8) + 'px';
    p.style.left = Math.max(8, Math.min(window.innerWidth - w - 8, b.right - w)) + 'px';
  }
  function closePop() { var p = $('#pop'); if (p) p.remove(); }
  AQ.closePop = closePop;

﻿  function openProfile(anchor) {
    var r = role();
    var h = '<div class="pmh"><span class="ava">' + esc(r.name.charAt(0)) + '</span><div><b>' + esc(r.name) + '</b><small>' + esc(r.n) + ' · demo@aiqurylys.kz</small></div></div><hr>';
    h += '<a class="it" href="#/profile">Профиль и вход<small>Имя, почта, пароль, язык и тема</small></a>';
    h += '<a class="it" href="#/tasks/mine">Мои задачи<small>Поручения, сроки и отметки о сдаче</small></a>';
    h += '<a class="it" href="#/notif">Уведомления<small>О чём сообщать на сайте</small></a>';
    h += '<a class="it" href="#/support">Мои обращения<small>Вопросы в поддержку и ответы на них</small></a>';
    h += '<a class="it" href="#/bot">Telegram-бот<small>Задачи и отчёты с телефона</small></a>';
    h += '<a class="it" href="#/more">Кабинет и настройки<small>Разделы, доступ по должностям, тариф</small></a><hr>';
    h += '<button class="it" data-act="hints-toggle">Подсказки: ' + (AQ.hints && AQ.hints.on() ? 'включены → скрыть' : 'скрыты → включить') + '<small>Короткие пояснения к разделам</small></button>';
    h += '<button class="it" data-act="theme">Тема: ' + (document.documentElement.getAttribute('data-theme') === 'light' ? 'День → Ночь' : 'Ночь → День') + '<small>Тёмная или светлая</small></button>';
    h += '<button class="it" data-toast="Язык интерфейса: русский. Қазақша — скоро">Язык: Рус · Қаз<small>Русский · Қазақша (в рабочей версии)</small></button><hr>';
    h += '<button class="it" data-act="logout">Выйти<small>В прототипе вход не нужен: вернёт на первый экран</small></button>';
    popover(anchor, h);
  }

  function openBell(anchor) {
    var h = '<div style="padding:8px 12px"><b>Уведомления</b></div>' + AQ.D.notifs.filter(function (n) { return AQ.canRoute(n.go); }).map(function (n) { return '<a class="it" href="#/' + n.go + '">' + (n.new ? '<span class="tag t-bad">новое</span> ' : '') + esc(n.t) + '<small>' + esc(n.time) + '</small></a>'; }).join('') + '<hr><a class="it" href="#/notif">Все уведомления и настройки</a>';
    popover(anchor, h);
  }

  function setTheme(t) {
    document.documentElement.setAttribute('data-theme', t); store.set('aq02_theme', t);
  }

  /* ---------- первый вход ---------- */
  var scenes = ['intro', 'director', 'estimator', 'site', 'supply', 'gip'];
  var chips = ['Считает смету', 'Проверяет акты', 'Ищет тендеры', 'Ведёт график', 'Пишет документы', 'Читает договоры'];
  function showWelcome() {
    if (document.getElementById('welcome')) return;
    var w = document.createElement('div'); w.className = 'welcome'; w.id = 'welcome';
    w.innerHTML = '<div class="wbg" style="background-image:url(../../media/scenes/intro.webp)"></div><canvas class="wcv" aria-hidden="true"></canvas>' +
      '<button class="skip" data-act="welcome-end">Пропустить →</button>' +
      '<div class="wc"><div class="eyebrow">AIQurylys · ' + esc(AQ.D.company.name) + '</div><h1>Ваш цифровой отдел<br><em>готов к работе</em></h1><p>' + AQ.D.agents.length + ' ИИ-сотрудников уже на местах: от тендера до сдачи объекта. Суммы считают формулы, а не ИИ.</p><div class="chips">' + chips.map(function (c) { return '<span>' + c + '</span>'; }).join('') + '</div><div class="btns" style="justify-content:center;margin-top:26px"><button class="btn pri" data-act="tour-start">Познакомиться с отделом · 45 сек</button><button class="btn" data-act="welcome-end">Войти в кабинет</button></div></div>';
    document.body.appendChild(w);
    var cs = $$('.chips span', w), bg = $('.wbg', w);
    function showText() {
      w.classList.add('show'); bg.classList.add('on');
      cs.forEach(function (c, k) { setTimeout(function () { c.classList.add('on'); }, AQ.reduced ? 0 : 500 + k * 380); });
    }
    if (AQ.cinema) w._cin = AQ.cinema.intro($('.wcv', w), { onText: showText });
    else showText();
    w.querySelector('.btn').focus();
  }
  AQ.endWelcome = function () { endWelcome(); };
  function endWelcome() {
    var w = $('#welcome'); if (!w) return;
    if (w._cin) w._cin.stop(); w.style.transition = 'opacity .5s'; w.style.opacity = '0';
    setTimeout(function () { w.remove(); }, 500);
    store.set('aq02_seen', '1');
    if (location.hash === '#/welcome') { try { history.replaceState(null, '', '#/home/today'); } catch (e) {} if (location.hash === '#/welcome') { location.hash = '#/home/today'; return; } }
    render();
  }

  /* ---------- события ---------- */
  function onClick(e) {
    var t = e.target.closest('[data-act],[data-go],[data-toast],[data-ext],[data-role],[data-q],[data-ask],[data-doc],a[href^="#/"]');
    if (!t) { if (!e.target.closest('#pop')) closePop(); return; }
    if (!t.closest('#pop')) closePop();
    if (t.hasAttribute('data-toast')) { e.preventDefault(); AQ.toast(t.getAttribute('data-toast')); return; }
    if (t.hasAttribute('data-doc')) { e.preventDefault(); closePop(); if (AQ.openDoc) AQ.openDoc(t.getAttribute('data-doc')); return; }
    if (t.hasAttribute('data-ext')) { e.preventDefault(); var u = t.getAttribute('data-ext'); window.open(AQ.M.base + u, '_blank', 'noopener'); AQ.toast('Откроется действующая версия: ' + AQ.M.base + u + ' (нужен вход)'); return; }
    if (t.hasAttribute('data-role')) { e.preventDefault(); setRole(t.getAttribute('data-role')); return; }
    if (t.hasAttribute('data-q')) { e.preventDefault(); layer._answer && layer._answer(t.getAttribute('data-q')); return; }
    if (t.hasAttribute('data-ask')) { e.preventDefault(); openAsk(t.getAttribute('data-ask')); return; }
    if (t.hasAttribute('data-go')) { e.preventDefault(); closeLayer(); if (AQ.tour) AQ.tour.close(); AQ.go(t.getAttribute('data-go')); return; }
    var a = t.getAttribute('data-act');
    if (a) {
      if (t.tagName === 'A') { closeLayer(); return; }
      e.preventDefault();
      switch (a) {
        case 'close': closeLayer(); break;
        case 'close-bg': if (e.target === t) closeLayer(); break;
        case 'menu': $('#side').classList.toggle('open'); break;
        case 'back': AQ.back(); break;
        case 'side-collapse': store.set('aq_side', store.get('aq_side') === '1' ? '0' : '1'); applySide(); break;
        case 'create': openCreate(); break;
        case 'palette': openPalette(); break;
        case 'ask': openAsk(); break;
        case 'bell': openBell(t); break;
        case 'profile': openProfile(t); break;
        case 'demo': setDemo(!AQ.state.demo); break;
        case 'demo-on': setDemo(true); break;
        case 'theme': setTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light'); closePop(); break;
        case 'logout': closePop(); showWelcome(); break;
        case 'welcome-end': endWelcome(); break;
        default: if (AQ.acts && AQ.acts[a]) AQ.acts[a](t, e); break;
      }
      return;
    }
    if (t.tagName === 'A') { closeLayer(); }
  }
  function onKey(e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K' || e.key === 'л' || e.key === 'Л')) { e.preventDefault(); openPalette(); }
    else if (e.altKey && e.key === 'ArrowLeft') { e.preventDefault(); AQ.back(); }
    else if (e.key === 'Escape') { closeLayer(); closePop(); $('#side').classList.remove('open'); }
    else if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('demo-toggle')) { e.preventDefault(); setDemo(!AQ.state.demo); }
  }

  /* ---------- запуск ---------- */
  AQ.start = function () {
    layer = $('#layer');
    var q = new URLSearchParams(location.search);
    var base = 'data/';
    Promise.all([load(base + 'menu.json'), load(base + 'create.json'), load(base + 'demo.json'), load(base + 'demo2.json'), load(base + 'demo3.json'), load(base + 'docforms.json'), load(base + 'hints.json')]).then(function (a) {
      AQ.H = a[6];
      AQ.M = a[0]; AQ.C = a[1]; AQ.D = Object.assign(a[2], a[3], a[4]); AQ.D.docforms = a[5]; AQ.D.assistant.byHelper = a[5].helpers; AQ.D.assistant.answers = a[5].askAnswers.concat(AQ.D.assistant.answers);
      AQ.D.assistant.answers = AQ.D.assistant.answers.concat(AQ.D.assistantMore);
      AQ.dev = q.get('dev') === '1' || store.get('aq02_dev') === '1'; if (q.get('dev') === '0') { AQ.dev = false; store.set('aq02_dev', '0'); } else if (q.get('dev') === '1') store.set('aq02_dev', '1');
      var rid = q.get('role') || store.get('aq02_role') || 'owner';
      if (!AQ.M.roles.some(function (r) { return r.id === rid; })) rid = 'owner';
      AQ.state.role = rid;
      var dm = q.get('demo'); AQ.state.demo = dm != null ? dm !== '0' : store.get('aq02_demo') !== '0';
      var tr = q.get('trial'); AQ.state.trial = tr != null ? tr === 'used' : store.get('aq02_trial') === '1'; if (tr != null) store.set('aq02_trial', tr === 'used' ? '1' : '0');
      var th = q.get('theme') || store.get('aq02_theme'); if (th === 'light' || th === 'dark') setTheme(th);
      renderTop(); applySide();
      document.addEventListener('click', onClick);
      document.addEventListener('keydown', onKey);
      window.addEventListener('hashchange', render);
      if (q.get('embed') === '1') { var pb = $('#proto'); if (pb) pb.style.display = 'none'; }
      var seen = store.get('aq02_seen') === '1' || q.get('embed') === '1' || q.get('welcome') === '0';
      if (q.get('welcome') === '1') showWelcome(); else if (!seen && !location.hash) showWelcome();
      render();
      document.body.setAttribute('data-ready', '1');
    }).catch(function (err) {
      $('#view').innerHTML = '<div class="empty"><h2>Данные не загрузились</h2><p>Прототип читает файлы из папки data/ и должен открываться по адресу (GitHub Pages или локальный сервер), а не двойным щелчком по файлу. ' + esc(err.message) + '</p></div>';
    });
  };
  AQ.acts = {};
  AQ.openAsk = openAsk;
})();
