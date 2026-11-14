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
  AQ.reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    x: 'M6 6l12 12M18 6L6 18'
  };
  var ico = AQ.ico = function (k) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + (ICO[k] || ICO.more) + '"/></svg>'; };

  /* ---------- права ---------- */
  function role() { return AQ.M.roles.filter(function (r) { return r.id === AQ.state.role; })[0]; }
  AQ.role = role;
  var can = AQ.can = function (need) { var r = role(); return need === '*' || r.perms === 'ALL' || r.perms.indexOf(need) !== -1; };
  var tabsOf = AQ.tabsOf = function (s) { return s.tabs.filter(function (t) { return can(t.need); }); };
  var secs = AQ.secs = function () { return AQ.M.sections.filter(function (s) { return (!s.owner || role().company) && tabsOf(s).length; }); };
  var findTab = AQ.findTab = function (r) {
    var p = (r || '').split('/');
    var s = AQ.M.sections.filter(function (x) { return x.id === p[0]; })[0];
    if (!s || (s.owner && !role().company)) return null;
    var t = s.tabs.filter(function (x) { return x.id === p[1] && can(x.need); })[0] || (p[1] ? null : tabsOf(s)[0]);
    return t ? { s: s, t: t } : null;
  };
  AQ.canRoute = function (r) {
    var p = String(r).split('/');
    if (['digital', 'help', 'bot', 'profile', 'notif', 'support', 'welcome'].indexOf(p[0]) !== -1) return true;
    return !!findTab(p[0] + '/' + (p[1] || ''));
  };
  AQ.href = function (r) { return '#/' + r; };
  AQ.lnk = function (r, label, cls) { return AQ.canRoute(r) ? '<a class="' + (cls || 'btn') + '" href="#/' + r + '">' + label + '</a>' : ''; };
  AQ.go = function (r) { var h = '#/' + r; if (location.hash === h) render(); else location.hash = h; };

  /* ---------- маршрут ---------- */
  var route = { key: 'home/today', sec: 'home', tab: 'today', sub: [], special: null };
  function parseRoute() {
    var p = (AQ._h != null ? AQ._h : location.hash).replace(/^#\/?/, '').split('/').filter(Boolean);
    var r = { sub: [], special: null, p: p };
    if (!p.length) p = ['home'];
    if (['digital', 'help', 'bot', 'profile', 'notif', 'support', 'welcome'].indexOf(p[0]) !== -1) {
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

  /* ---------- боковое меню ---------- */
  function renderSide() {
    var r = role(), h = '', lastGroup = null, cur = route;
    h += '<a class="logo" href="#/home/today" aria-label="AIQurylys — Главная"><svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x=".5" y=".5" width="27" height="27" rx="7" stroke="#F26B1D"/><path d="M7 20V9l7-3 7 3v11M11 20v-6h6v6" stroke="#EAF0FA" stroke-width="1.4"/></svg><span>AI<i>Qurylys</i><small>кабинет</small></span></a>';
    secs().forEach(function (s) {
      if (s.group && s.group !== lastGroup) h += '<div class="grp">' + esc(s.group) + '</div>';
      if (!s.group) lastGroup = null; else lastGroup = s.group;
      var on = cur.sec === s.id && !cur.special;
      var first = tabsOf(s)[0];
      h += '<a class="nav' + (on ? ' on' : '') + '" href="#/' + s.id + '/' + first.id + '">' + ico(s.ico) + '<span>' + esc(s.t) + '</span>' + (s.id === 'tasks' ? '<span class="badge">3</span>' : '') + '</a>';
      if (on) {
        h += '<div class="subs">';
        tabsOf(s).forEach(function (t) { h += '<a class="sub' + (cur.tab === t.id ? ' on' : '') + '" href="#/' + s.id + '/' + t.id + '">' + esc(t.t) + '</a>'; });
        h += '</div>';
      }
    });
    if (r.company) {
      var u = AQ.D.tariff;
      h += '<a class="foot" href="#/company/tariff"><b>' + esc(u.plan) + '</b><div class="bar"><i style="width:' + (u.used / u.limit * 100) + '%"></i></div>Расчётов в пакете: ' + u.used + ' из ' + u.limit + '<br>До ' + esc(u.until) + ' · <span class="acc">Подключить тариф</span></a>';
    } else {
      h += '<div class="foot" style="margin-top:auto"><b>Ваша роль: ' + esc(r.n) + '</b><br>Видны только ваши разделы. Права выдаёт владелец.</div>';
    }
    $('#side').innerHTML = h;
  }

  /* ---------- верхняя панель ---------- */
  function renderTop() {
    var r = role();
    var opts = AQ.M.roles.map(function (x) { return '<option value="' + x.id + '"' + (x.id === r.id ? ' selected' : '') + '>' + esc(x.n) + '</option>'; }).join('');
    $('#top').innerHTML =
      '<button class="pill ico menu-btn" data-act="menu" aria-label="Меню">' + ico('menu') + '</button>' +
      '<button class="search" data-act="palette">' + ico('search') + '<span>Спросить или найти</span><span class="kbd">Ctrl K</span></button>' +
      '<span class="sp"></span>' +
      '<label class="pill hide-m" title="Прототип показывает кабинет глазами разных ролей">Смотреть как&nbsp;<select id="roleSel" aria-label="Смотреть как">' + opts + '</select></label>' +
      '<span class="demo-toggle hide-m' + (AQ.state.demo ? ' on' : '') + '" data-act="demo" role="switch" aria-checked="' + AQ.state.demo + '" tabindex="0"><span class="sw"></span>Демо-данные</span>' +
      '<button class="pill cr" data-act="create">' + ico('plus') + '<span>Создать</span></button>' +
      '<button class="pill ico" data-act="bell" aria-label="Уведомления">' + ico('bell') + '<span class="dot"></span></button>' +
      '<a class="pill hide-m" href="#/help">' + ico('help') + '<span>Помощь</span></a>' +
      '<button class="ava" data-act="profile" aria-label="Профиль">' + esc(r.name.charAt(0)) + '</button>';
    var sel = $('#roleSel');
    if (sel) sel.addEventListener('change', function () { setRole(sel.value); });
  }

  function renderBnav() {
    var vis = secs().filter(function (s) { return ['home', 'projects', 'tasks'].indexOf(s.id) !== -1 || true; }).slice(0, 3);
    var h = '';
    vis.forEach(function (s) { h += '<button data-go="' + s.id + '/' + tabsOf(s)[0].id + '" class="' + (route.sec === s.id && !route.special ? 'on' : '') + '">' + ico(s.ico) + s.t.split(' ')[0] + '</button>'; });
    h += '<button data-act="create">' + ico('plus') + 'Создать</button><button data-act="menu">' + ico('menu') + 'Меню</button>';
    $('#bnav').innerHTML = h;
  }

  /* ---------- общий каркас экрана ---------- */
  AQ.head = function (title, desc, crumbs, tabsHtml) {
    return '<div class="crumbs">' + (crumbs || '') + '</div><h1 class="ptitle">' + title + '</h1>' + (desc ? '<p class="pdesc">' + desc + '</p>' : '') + (tabsHtml || '');
  };
  AQ.tabBar = function (s, activeTab) {
    return '<div class="tabs sc" role="tablist">' + tabsOf(s).map(function (t) { return '<a class="tab' + (t.id === activeTab ? ' on' : '') + '" role="tab" href="#/' + s.id + '/' + t.id + '">' + esc(t.t) + '</a>'; }).join('') + '</div>';
  };
  AQ.flow = function (t) {
    var nx = (t.next || []).filter(function (n) { return AQ.canRoute(n[0]); }).map(function (n) { return '<a href="#/' + n[0] + '">→ ' + esc(n[1]) + '</a>'; }).join('') || '<span class="mut">—</span>';
    return '<div class="flow"><div><b>Вы даёте</b>' + esc(t.give || '—') + '</div><div class="ar">→</div><div><b>Получаете</b>' + esc(t.get || '—') + '</div><div class="ar">→</div><div class="nx"><b>Дальше</b>' + nx + '</div></div>';
  };
  AQ.wasBlock = function (t) { return t.was ? '<div class="was"><b>Где это было раньше:</b> ' + esc(t.was) + '</div>' : ''; };
  AQ.ext = function (t) { return t.url ? '<button class="btn sm ghost" data-ext="' + esc(t.url) + '">Открыть в рабочей версии ↗</button>' : ''; };
  AQ.empty = function (title, text) {
    return '<div class="empty"><h2>' + esc(title) + '</h2><p>' + esc(text) + '</p><div class="btns" style="justify-content:center"><button class="btn pri" data-act="demo-on">Показать на демо-компании</button><button class="btn" data-toast="В рабочей версии здесь будет: загрузка ваших файлов или подключение Google Диска">Загрузить свои данные</button></div></div>';
  };

  var DATA_SCREENS = ['projects', 'files', 'tasks', 'issued', 'est', 'check', 'offer', 'vol', 'vcmp', 'docsmade', 'chief', 'plan', 'master', 'norms', 'tech', 'fin', 'budget', 'sup', 'price', 'out', 'subs', 'contracts', 'review', 'letter', 'lchat', 'tender', 'passport', 'demand', 'concept', 'summary'];
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
      title = ({ digital: 'Цифровой отдел', help: 'Помощь', bot: 'Telegram-бот и телефон', profile: 'Профиль и вход', notif: 'Уведомления', support: 'Поддержка' })[route.special] || 'Страница';
    } else {
      var fn2 = AQ.screens[route.tObj.screen] || AQ.screens._generic;
      if (!AQ.state.demo && DATA_SCREENS.indexOf(route.tObj.screen) !== -1) {
        var et = EMPTY_TEXT[route.tObj.screen] || ['Здесь пока пусто', 'Данные появятся, когда вы загрузите свои файлы. Или включите демо-компанию, чтобы увидеть экран заполненным.'];
        html = AQ.head(esc(route.tObj.t), esc(route.tObj.d || ''), crumbs(), AQ.tabBar(route.sObj, route.tab)) + AQ.flow(route.tObj) + AQ.empty(et[0], et[1]) + AQ.wasBlock(route.tObj);
      } else {
        html = fn2(route, ctx);
      }
      title = route.tObj.t + ' — ' + route.sObj.t;
    }
    view.innerHTML = html;
    document.title = title + ' — AIQurylys (прототип v0.2)';
    renderSide(); renderBnav();
    $('#side').classList.remove('open');
    window.scrollTo(0, 0);
    if (ctx.after) ctx.after();
  }
  function crumbs() {
    return '<a href="#/home/today">Главная</a>' + (route.sObj && route.sec !== 'home' ? ' / <a href="#/' + route.sec + '/' + tabsOf(route.sObj)[0].id + '">' + esc(route.sObj.t) + '</a>' : '');
  }
  AQ.crumbs = crumbs;
  AQ.render = render;

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
    var n = 0, total = 0, h = '<div class="mh"><h2>＋ Создать <span class="mut" style="font-weight:400;font-size:13px">действий: ' + '<span id="cn"></span></span></h2>' + closeBtn + '</div><div class="cgrid">';
    AQ.C.groups.forEach(function (g) {
      var items = g.items.filter(function (i) { total++; return can(i[2]); });
      if (!items.length) return;
      n += items.length;
      h += '<div class="cgrp"><h3>' + esc(g.t) + '</h3>' + items.map(function (i) { return '<a class="cit" href="#/' + i[3] + '" data-act="close"><b>' + esc(i[0]) + '</b><small>' + esc(i[1]) + '</small></a>'; }).join('') + '</div>';
    });
    h += '</div>';
    overlay(h);
    $('#cn').textContent = n + ' из ' + total + ' доступно роли «' + role().n + '»';
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

  function openAsk(q) {
    var d = AQ.D.assistant, r = role();
    layer.innerHTML = '<aside class="drawer" role="dialog" aria-label="Помощник"><div class="dh"><b>✦ Помощник AIQurylys</b>' + closeBtn + '</div><div class="db"><div class="chat" id="achat"></div><div class="sugg" id="asugg"></div></div><form class="df" id="aform"><input id="ain" placeholder="Задайте вопрос" autocomplete="off"><button class="btn pri sm" type="submit">Спросить</button></form></aside>';
    var chat = $('#achat');
    function say(who, t, go) { var div = document.createElement('div'); div.className = 'msg ' + who; div.innerHTML = esc(t) + (go && AQ.canRoute(go) ? '<br><a class="mb" href="#/' + go + '" data-act="close">Открыть →</a>' : ''); chat.appendChild(div); chat.parentNode.scrollTop = 1e6; }
    function answer(text) {
      var low = text.toLowerCase(), hit = d.answers.filter(function (a) { return a.k.some(function (k) { return low.indexOf(k) !== -1; }); })[0];
      say('me', text);
      AQ.later(function () { hit ? say('bot', hit.a, hit.go) : say('bot', d.fallback); }, 450);
    }
    say('bot', 'Здравствуйте! Вы смотрите кабинет как «' + r.n + '». ' + d.hello);
    $('#asugg').innerHTML = ['Что с актом подрядчика?', 'Какие тендеры закрываются?', 'Хватит ли денег?', 'Что с договором?'].map(function (s) { return '<button data-q="' + esc(s) + '">' + esc(s) + '</button>'; }).join('');
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

  function openProfile(anchor) {
    var r = role(), P = AQ.M.profile;
    var h = '<div style="padding:8px 12px 6px"><b>' + esc(r.name) + '</b><div class="mut" style="font-size:12px">' + esc(r.n) + ' · demo@aiqurylys.kz</div></div><hr>';
    h += '<a class="it" href="#/profile">Профиль и вход<small>' + esc(P[0].d) + '</small></a>';
    h += '<a class="it" href="#/notif">Уведомления<small>' + esc(P[1].d) + '</small></a>';
    h += '<a class="it" href="#/support">Поддержка<small>' + esc(P[2].d) + '</small></a>';
    h += '<a class="it" href="#/bot">Telegram-бот<small>' + esc(P[3].d) + '</small></a>';
    h += '<button class="it" data-act="theme">Тема: ' + (document.documentElement.getAttribute('data-theme') === 'light' ? 'светлая → тёмная' : 'тёмная → светлая') + '<small>' + esc(P[4].d) + '</small></button>';
    h += '<button class="it" data-toast="В рабочей версии здесь будет: переключение языка Русский / Қазақша">Язык<small>' + esc(P[5].d) + '</small></button><hr>';
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
    var w = document.createElement('div'); w.className = 'welcome'; w.id = 'welcome';
    w.innerHTML = scenes.map(function (s, i) { return '<div class="wbg' + (i === 0 ? ' on' : '') + '" style="background-image:url(../../media/scenes/' + s + '.webp)"></div>'; }).join('') +
      '<button class="skip" data-act="welcome-end">Пропустить →</button>' +
      '<div class="wc"><div class="eyebrow">AIQurylys · ' + esc(AQ.D.company.name) + '</div><h1>Ваш цифровой отдел<br><em>готов к работе</em></h1><p>Сметчик, юрист, снабженец и ещё пять ИИ-сотрудников уже на местах. Суммы считают формулы, а не ИИ.</p><div class="chips">' + chips.map(function (c) { return '<span>' + c + '</span>'; }).join('') + '</div><div class="btns" style="justify-content:center;margin-top:26px"><button class="btn pri" data-act="welcome-end">Войти в кабинет</button></div></div>';
    document.body.appendChild(w);
    var bgs = $$('.wbg', w), cs = $$('.chips span', w), i = 0;
    cs.forEach(function (c, k) { setTimeout(function () { c.classList.add('on'); }, AQ.reduced ? 0 : 500 + k * 450); });
    if (!AQ.reduced) w._int = setInterval(function () { bgs[i].classList.remove('on'); i = (i + 1) % bgs.length; bgs[i].classList.add('on'); }, 2600);
    w.querySelector('.btn').focus();
  }
  function endWelcome() {
    var w = $('#welcome'); if (!w) return;
    clearInterval(w._int); w.style.transition = 'opacity .5s'; w.style.opacity = '0';
    setTimeout(function () { w.remove(); }, 500);
    store.set('aq02_seen', '1');
    if (location.hash === '#/welcome') history.replaceState(null, '', '#/home/today');
    render();
  }

  /* ---------- события ---------- */
  function onClick(e) {
    var t = e.target.closest('[data-act],[data-go],[data-toast],[data-ext],[data-role],[data-q],[data-ask],a[href^="#/"]');
    if (!t) { if (!e.target.closest('#pop')) closePop(); return; }
    if (!t.closest('#pop')) closePop();
    if (t.hasAttribute('data-toast')) { e.preventDefault(); AQ.toast(t.getAttribute('data-toast')); return; }
    if (t.hasAttribute('data-ext')) { e.preventDefault(); var u = t.getAttribute('data-ext'); window.open(AQ.M.base + u, '_blank', 'noopener'); AQ.toast('Откроется действующая версия: ' + AQ.M.base + u + ' (нужен вход)'); return; }
    if (t.hasAttribute('data-role')) { e.preventDefault(); setRole(t.getAttribute('data-role')); return; }
    if (t.hasAttribute('data-q')) { e.preventDefault(); layer._answer && layer._answer(t.getAttribute('data-q')); return; }
    if (t.hasAttribute('data-ask')) { e.preventDefault(); openAsk(t.getAttribute('data-ask')); return; }
    if (t.hasAttribute('data-go')) { e.preventDefault(); closeLayer(); AQ.go(t.getAttribute('data-go')); return; }
    var a = t.getAttribute('data-act');
    if (a) {
      if (t.tagName === 'A') { closeLayer(); return; }
      e.preventDefault();
      switch (a) {
        case 'close': closeLayer(); break;
        case 'close-bg': if (e.target === t) closeLayer(); break;
        case 'menu': $('#side').classList.toggle('open'); break;
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
    else if (e.key === 'Escape') { closeLayer(); closePop(); $('#side').classList.remove('open'); }
    else if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('demo-toggle')) { e.preventDefault(); setDemo(!AQ.state.demo); }
  }

  /* ---------- запуск ---------- */
  AQ.start = function () {
    layer = $('#layer');
    var q = new URLSearchParams(location.search);
    var base = 'data/';
    Promise.all([load(base + 'menu.json'), load(base + 'create.json'), load(base + 'demo.json')]).then(function (a) {
      AQ.M = a[0]; AQ.C = a[1]; AQ.D = a[2];
      var rid = q.get('role') || store.get('aq02_role') || 'owner';
      if (!AQ.M.roles.some(function (r) { return r.id === rid; })) rid = 'owner';
      AQ.state.role = rid;
      var dm = q.get('demo'); AQ.state.demo = dm != null ? dm !== '0' : store.get('aq02_demo') !== '0';
      var th = q.get('theme') || store.get('aq02_theme'); if (th === 'light' || th === 'dark') setTheme(th);
      renderTop();
      document.addEventListener('click', onClick);
      document.addEventListener('keydown', onKey);
      window.addEventListener('hashchange', render);
      if (q.get('embed') === '1') { var pb = $('#proto'); if (pb) pb.style.display = 'none'; }
      var seen = store.get('aq02_seen') === '1' || q.get('embed') === '1' || q.get('welcome') === '0';
      if (!seen && !location.hash) showWelcome();
      render();
      document.body.setAttribute('data-ready', '1');
    }).catch(function (err) {
      $('#view').innerHTML = '<div class="empty"><h2>Данные не загрузились</h2><p>Прототип читает файлы из папки data/ и должен открываться по адресу (GitHub Pages или локальный сервер), а не двойным щелчком по файлу. ' + esc(err.message) + '</p></div>';
    });
  };
  AQ.acts = {};
  AQ.openAsk = openAsk;
})();
