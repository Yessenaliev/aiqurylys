/* Экраны, часть 1: Главная, Цифровой отдел, Проекты, Файлы, Задачи, Расчёты */
(function () {
  'use strict';
  var AQ = window.AQ, S = AQ.screens, esc = AQ.esc, fmt = AQ.fmt;

  function tabHead(rt, extra) {
    var t = rt.tObj;
    return AQ.head(esc(t.t), esc(t.d || ''), AQ.crumbs(), AQ.tabBar(rt.sObj, rt.tab)) + (t.give ? AQ.flow(t) : '') + (extra || '');
  }
  AQ.tabHead = tabHead;
  function tbl(cols, rows, opts) {
    opts = opts || {};
    return '<div class="tbl-wrap"><table><thead><tr>' + cols.map(function (c, i) { return '<th' + ((opts.r || []).indexOf(i) !== -1 ? ' class="r"' : '') + '>' + esc(c) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      rows.map(function (r) { return '<tr' + (opts.go ? ' class="clk" data-go="' + esc(opts.go(r)) + '"' : '') + '>' + r.map(function (c, i) { return '<td' + ((opts.r || []).indexOf(i) !== -1 ? ' class="num"' : '') + '>' + (opts.raw ? c : esc(c)) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
  }
  AQ.tbl = tbl;
  function countUp(el, to, dec, ms) {
    if (AQ.reduced) { el.textContent = to.toFixed(dec).replace('.', ','); return; }
    var n = 0, steps = Math.max(8, Math.round(ms / 40));
    var id = AQ.every(function () { n++; var v = to * (1 - Math.pow(1 - n / steps, 3)); el.textContent = v.toFixed(dec).replace('.', ','); if (n >= steps) clearInterval(id); }, 40);
  }
  AQ.countUp = countUp;
  var statusTag = function (s) { return s === 'В работе' ? 't-blue' : (s.indexOf('Завершён') === 0 ? 't-ok' : 't-mute'); };
  AQ.statusTag = statusTag;

  /* ---------- Главная ---------- */
  S.home = function (rt, ctx) {
    var D = AQ.D, r = AQ.role(), all = r.perms === 'ALL', owner = r.id === 'owner', K = D.kpi, h = '';
    var scene = '../../media/scenes/' + r.scene + '.webp';
    var tb = AQ.tabsOf(rt.sObj).length > 1 ? AQ.tabBar(rt.sObj, rt.tab) : '';
    var first = r.name.split(' ')[0];
    if (owner) {
      var vid = (!AQ.reduced && window.innerWidth > 860) ? '<video class="bgvid" muted loop playsinline preload="auto" src="../../media/scenes/' + r.scene + '.mp4"></video>' : '';
      h += tb + '<section class="hero"><div class="bgphoto" style="background-image:url(' + scene + ')"></div>' + vid +
        '<div class="eyebrow">Главная · за последние 30 дней</div><h1>' + AQ.greet() + ', ' + esc(first) + '.<br><em>Цифровой отдел сэкономил вам</em></h1>' +
        '<p>' + D.agents.length + ' ИИ-сотрудников считают, проверяют и ищут тендеры. Нажмите на любую цифру, чтобы увидеть, откуда она взялась.</p>' +
        '<div class="nums">' +
        '<button class="bignum" data-toast="' + esc(K.sources.saved) + '"><span>Сэкономлено</span><b class="acc"><i data-cnt="6.6" data-dec="1">0</i> <em>млн ₸</em></b><small>завышения в актах и сметах</small></button>' +
        '<button class="bignum" data-toast="' + esc(K.sources.hours) + '"><span>Часов работы</span><b><i data-cnt="41" data-dec="0">0</i> <em>ч</em></b><small>не пришлось делать руками</small></button>' +
        '<button class="bignum" data-toast="' + esc(K.sources.tenders) + '"><span>Тендеры</span><b><em>на</em> <i data-cnt="47" data-dec="0">0</i> <em>млн ₸</em></b><small>3 тендера закрываются на этой неделе</small></button>' +
        '</div></section><div style="height:14px"></div>';
    } else {
      h += AQ.head(AQ.greet() + ', ' + esc(r.name), esc(r.line), '<span>Главная · Сегодня</span>', tb);
    }
    h += '<div class="bento">';

    // требует решения
    var dec = D.decisions.filter(function (d) { return AQ.canRoute(d.go); });
    if (dec.length) {
      h += '<div class="tile s7"><div class="lbl"><span>Требует вашего решения</span><span class="tag t-bad">' + dec.length + '</span></div>' +
        dec.map(function (d) { return '<div class="row"><span class="tag ' + (d.urgent ? 't-bad' : 't-warn') + '">' + (d.urgent ? 'срочно' : 'решить') + '</span><div><b>' + esc(d.t) + '</b><small>' + esc(d.d) + '</small></div><a class="btn sm" href="#/' + d.go + '">' + esc(d.btn) + '</a></div>'; }).join('') + '</div>';
    }
    // не-владелец: с чего начать
    if (!owner) {
      h += '<div class="tile ' + (dec.length ? 's5' : 's12') + '"><div class="lbl"><span>С чего начать</span></div>' + r.start.map(function (s, i) { return '<a class="row" href="#/' + s[0] + '"><span class="tag t-blue">' + (i + 1) + '</span><div><b>' + esc(s[1]) + '</b><small>' + esc(s[2]) + '</small></div><span class="mut">→</span></a>'; }).join('') + '</div>';
    } else {
      // лента за неделю
      h += '<div class="tile s5"><div class="lbl"><span>Сделано за неделю</span><a class="acc" href="#/digital">весь отдел →</a></div><div class="feed">' + D.feed.filter(function (f) { return AQ.canRoute(f.go); }).map(function (f) { return '<a class="ln pre" href="#/' + f.go + '"><time>' + f.time + '</time><div><b>' + esc(f.agent) + '</b> · ' + esc(f.t) + '</div></a>'; }).join('') + '</div></div>';
    }
    // цифровой отдел
    var ag = D.agents.filter(function (a) { return AQ.can(a.need); }).slice(0, 4);
    if (ag.length) {
      h += '<div class="tile s12"><div class="lbl"><span>Цифровой отдел · ' + D.agents.length + ' ИИ-сотрудников</span><a class="acc" href="#/digital">Открыть →</a></div><div class="agents">' + ag.map(agentCard).join('') + '</div></div>';
    }
    // тендеры
    if (AQ.can('tender')) {
      h += '<div class="tile s6"><div class="lbl"><span>Тендеры · закрываются на этой неделе</span><a class="acc" href="#/sales/tender">Все →</a></div><div class="tn">' + D.tenders.slice(0, 3).map(function (t) { return '<a class="t" href="#/sales/tender"><div><b>' + esc(t.n) + '</b><span class="tm">⏱ <span data-cd="' + AQ.cdSecs(t.id, t.left) + '">' + esc(t.left) + '</span></span></div><div><span class="mut">' + esc(t.advice) + ' · совпадение ' + t.match + ' %</span><span class="pf">+' + String(t.profit).replace('.', ',') + ' млн ₸</span></div></a>'; }).join('') + '</div></div>';
    }
    // проекты
    h += '<div class="tile ' + (AQ.can('tender') ? 's6' : 's12') + '"><div class="lbl"><span>Проекты</span><a class="acc" href="#/projects/list">Все →</a></div><div class="prj">' + D.projects.filter(function (p) { return p.status === 'В работе'; }).map(projCard).join('') + '</div></div>';
    // быстрые действия
    var q = D.quick.filter(function (x) { return AQ.can(x[3]); }).slice(0, 6);
    h += '<div class="tile s6"><div class="lbl"><span>Быстрые действия</span></div><div class="quick">' + q.map(function (x) { return '<a href="#/' + x[2] + '">' + esc(x[0]) + '<small>' + esc(x[1]) + '</small></a>'; }).join('') + '</div></div>';
    // путеводитель
    var done = D.guide.filter(function (g) { return g.done; }).length, next = D.guide.filter(function (g) { return !g.done; })[0];
    h += '<div class="tile s6 guide"><div class="lbl"><span>Путеводитель</span><a class="acc" href="#/help">Все шаги →</a></div><b>' + done + ' из ' + D.guide.length + ' шагов</b><div class="bar"><i style="width:' + done / D.guide.length * 100 + '%"></i></div><a class="row" href="#/' + (AQ.canRoute(next.go) ? next.go : 'help') + '"><div><b>Дальше: ' + esc(next.t) + '</b><small>' + esc(next.d) + '</small></div><span class="mut">→</span></a></div>';
    // задачи
    if (!owner) {
      h += '<div class="tile s6"><div class="lbl"><span>Мои задачи</span><a class="acc" href="#/tasks/mine">Все →</a></div>' + D.tasks.slice(0, 3).map(function (t) { return '<a class="row" href="#/tasks/mine"><div><b>' + esc(t.t) + '</b><small>' + esc(t.who) + ' · ' + esc(t.due) + '</small></div><span class="tag t-blue">' + esc(t.status) + '</span></a>'; }).join('') + '</div>';
    }
    h += '</div>';
    if (!AQ.state.demo) {
      h = AQ.head(AQ.greet() + ', ' + esc(first), 'Кабинет пока пустой: как у нового клиента. Начните с первого шага или посмотрите всё на демо-компании.', '<span>Главная · Сегодня</span>', tb) +
        '<div class="tile guide"><div class="lbl"><span>Путеводитель</span></div><b>0 из 10 шагов</b><div class="bar"><i style="width:0"></i></div><div class="btns"><a class="btn pri" href="#/projects/list">Заведите первый проект</a><button class="btn" data-act="demo-on">Показать на демо-компании</button></div></div>';
    }
    ctx.after = function () {
      AQ.$$('[data-cnt]').forEach(function (el) { countUp(el, +el.getAttribute('data-cnt'), +el.getAttribute('data-dec'), 1400); });
      AQ.reveal('.feed .ln.pre', 420); AQ.cdStart();
      var v = AQ.$('.hero .bgvid'); if (v) { v.addEventListener('playing', function () { v.classList.add('on'); }); var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }
    };
    return h;
  };
  function agentCard(a) {
    if (!AQ.can(a.need)) return '<button class="ag" style="opacity:.5;width:100%" data-toast="Этого ИИ-сотрудника видит другая роль. Доступ раздаёт владелец."><div class="n"><span class="pulse w"></span>' + esc(a.n) + '</div><p>' + esc(a.role) + '</p><div class="meta">доступ у другой роли</div></button>';
    return '<a class="ag" href="#/' + (AQ.canRoute(a.go) ? a.go : 'digital') + '"><div class="n"><span class="pulse' + (a.status === 'готов' ? ' w' : '') + '"></span>' + esc(a.n) + '</div><p>' + esc(a.role) + '</p><p>' + esc(a.last) + '</p><div class="meta">сделано за месяц: ' + a.done + '</div></a>';
  }
  function projCard(p) {
    return '<a class="pj' + (p.late ? ' late' : '') + '" href="#/projects/list/p/' + p.id + '"><div class="ph" style="background-image:url(../../img/' + p.img + ')"></div><div class="in"><b>' + esc(p.n) + '</b><small><span>' + esc(p.city) + '</span><span class="tag ' + statusTag(p.status) + '">' + esc(p.status) + '</span></small><div class="bar"><i style="width:' + p.pct + '%"></i></div><small><span>' + p.pct + ' %</span><span>' + AQ.mln(p.spent) + ' из ' + AQ.mln(p.contract) + '</span></small>' + (p.late ? '<small class="bad"><span>Отставание ' + p.late + ' дн.</span></small>' : '') + '</div></a>';
  }
  AQ.projCard = projCard;

  /* ---------- Сводка ---------- */
  S.summary = function (rt) {
    var D = AQ.D, rows = D.summary.map(function (r) { return [r[0], r[1], r[2], r[3], r[4]]; });
    var h = AQ.tabHead(rt);
    h += '<div class="bento"><div class="tile s8"><div class="lbl"><span>Деньги по проектам, млн ₸</span></div>' + tbl(['Проект', 'Договор', 'Освоено', 'Готовность', 'Сроки'], rows, { r: [1, 2, 3] }) + '</div>' +
      '<div class="tile s4"><div class="lbl"><span>Остаток денег</span></div><div class="big ok">31,2 млн ₸</div><p class="mut" style="margin-top:8px">Хватит на 5 недель при текущем темпе расходов. <span class="src" data-toast="Остаток = поступления минус расходы по финансовому отчёту. Источник: «Деньги и снабжение → Финансовый отчёт».">Откуда цифра</span></p><div class="btns"><a class="btn sm" href="#/money/fin">Финансовый отчёт</a></div></div>' +
      '<div class="tile s12"><div class="lbl"><span>Требуют решения</span></div>' + D.decisions.map(function (d) { return '<a class="row" href="#/' + d.go + '"><span class="tag ' + (d.urgent ? 't-bad' : 't-warn') + '">' + (d.urgent ? 'срочно' : 'решить') + '</span><div><b>' + esc(d.t) + '</b><small>' + esc(d.d) + '</small></div><span class="mut">→</span></a>'; }).join('') + '</div></div>';
    return h + AQ.wasBlock(rt.tObj);
  };

  /* ---------- Цифровой отдел (специальная страница) ---------- */
  S._digital = function (rt, ctx) {
    var D = AQ.D, list = D.agents, mine = D.agents.filter(function (a) { return AQ.can(a.need); }).length;
    var h = AQ.head('Цифровой отдел · ' + D.agents.length + ' ИИ-сотрудников', 'Доступно вашей роли: ' + mine + '. Что делает каждый и что сделал последним. Суммы считают формулы, а не ИИ: ИИ читает чертежи и документы, подсчёт делают проверяемые формулы.', '<a href="#/home/today">Главная</a> / Цифровой отдел');
    h += '<div class="agents">' + list.map(agentCard).join('') + '</div>';
    h += '<div class="bento" style="margin-top:14px"><div class="tile s7"><div class="lbl"><span>Лента работы</span><span class="tag t-ok">в эфире</span></div><div class="feed" id="livefeed">' + D.feed.filter(function (f) { return AQ.canRoute(f.go); }).map(function (f) { return '<a class="ln pre" href="#/' + f.go + '"><time>' + f.time + '</time><div><b>' + esc(f.agent) + '</b> · ' + esc(f.t) + '</div></a>'; }).join('') + '</div></div>' +
      '<div class="tile s5"><div class="lbl"><span>Как работает отдел</span></div><div class="row"><div><b>Вы даёте</b><small>Чертежи, акты, договоры, цены</small></div></div><div class="row"><div><b>Сотрудники работают в фоне</b><small>Результат сразу в кабинете и в Telegram</small></div></div><div class="row"><div><b>Вы решаете</b><small>Каждое решение — за вами, ИИ только предлагает</small></div></div><div class="btns"><button class="btn" data-act="ask">Спросить помощника</button></div></div></div>';
    ctx.after = function () { AQ.reveal('#livefeed .ln.pre', 400); AQ.later(function () { AQ.liveFeed(AQ.$('#livefeed')); }, 3200); };
    return h;
  };

  /* ---------- Проекты ---------- */
  S.projects = function (rt, ctx) {
    if (rt.sub[0] === 'p') return projectView(rt, ctx);
    var D = AQ.D;
    var h = AQ.tabHead(rt);
    h += '<div class="btns" style="margin:0 0 14px"><button class="btn pri" data-act="new-project">＋ Новый проект</button><span class="mut" style="align-self:center">Кнопка «Новый проект» здесь одна (раньше было четыре входа).</span></div>';
    h += '<div class="prj" style="grid-template-columns:repeat(auto-fill,minmax(260px,1fr))">' + D.projects.map(projCard).join('') + '</div>' + AQ.wasBlock(rt.tObj);
    return h;
  };
  AQ.acts['new-project'] = function () {
    AQ.overlay('<div class="mh"><h2>Новый проект</h2><button class="pill ico" data-act="close" aria-label="Закрыть">✕</button></div><div style="display:grid;gap:10px"><label>Название<input style="width:100%" value="Склад в Караганде"></label><label>Адрес<input style="width:100%" value="г. Караганда, демо-адрес"></label><label>Стороны договора<input style="width:100%" value="Заказчик: демо · Подрядчик: Демо-компания"></label><label>Папка документов<select style="width:100%"><option>Создать папку на Google Диске</option><option>Выбрать существующую</option></select></label></div><div class="btns"><button class="btn pri" data-toast="В рабочей версии здесь будет: создание проекта и папки документов. В демо ничего не сохраняется.">Создать проект</button><button class="btn" data-act="close">Отмена</button></div>');
  };

  var PTABS = [['overview', 'Обзор', '*'], ['gantt', 'График', 'site'], ['site', 'Площадка', 'site'], ['volumes', 'Объёмы', '*'], ['docs', 'Документы', 'documents'], ['files', 'Файлы', 'files'], ['money', 'Деньги', 'finance'], ['stock', 'Склад', '*'], ['equipment', 'Техника', 'equipment'], ['people', 'Люди', '*']];
  function projectView(rt, ctx) {
    var D = AQ.D, p = D.projects.filter(function (x) { return x.id === rt.sub[1]; })[0] || D.projects[0], tab = rt.sub[2] || 'overview';
    var tabs = PTABS.filter(function (t) { return AQ.can(t[2]); });
    if (!tabs.some(function (t) { return t[0] === tab; })) tab = 'overview';
    var h = AQ.head(esc(p.n), esc(p.city) + ' · заказчик: ' + esc(p.customer) + ' · срок до ' + esc(p.end), '<a href="#/home/today">Главная</a> / <a href="#/projects/list">Проекты</a> / ' + esc(p.n),
      '<div class="tabs sc">' + tabs.map(function (t) { return '<a class="tab' + (t[0] === tab ? ' on' : '') + '" href="#/projects/list/p/' + p.id + '/' + t[0] + '">' + t[1] + '</a>'; }).join('') + '</div>');
    var body = '';
    if (tab === 'overview') {
      body = '<div class="bento"><div class="tile s4"><div class="lbl"><span>Готовность</span></div><div class="big">' + p.pct + ' %</div><div class="bar2" style="margin-top:10px"><i style="width:' + p.pct + '%"></i></div></div>' +
        '<div class="tile s4"><div class="lbl"><span>Освоено</span></div><div class="big">' + AQ.mln(p.spent) + '</div><p class="mut">из ' + AQ.mln(p.contract) + ' по договору</p></div>' +
        '<div class="tile s4"><div class="lbl"><span>Сроки</span></div><div class="big ' + (p.late ? 'bad' : 'ok') + '">' + (p.late ? '−' + p.late + ' дн.' : 'По плану') + '</div><p class="mut">' + (p.late ? 'Отставание по кладке' : 'Отставаний нет') + '</p></div>' +
        '<div class="tile s6"><div class="lbl"><span>Что делать</span></div>' + [['calc/est', 'Посчитать себестоимость'], ['calc/vol', 'Проверить акт подрядчика'], ['docs/new', 'Оформить акт'], ['tasks/issued', 'Выдать задачу прорабу']].filter(function (x) { return AQ.canRoute(x[0]); }).map(function (x) { return '<a class="row" href="#/' + x[0] + '"><div><b>' + x[1] + '</b></div><span class="mut">→</span></a>'; }).join('') + '</div>' +
        '<div class="tile s6" style="padding:0;overflow:hidden;min-height:180px;background:center/cover url(../../img/' + p.img + ')"></div></div>';
    } else if (tab === 'gantt') {
      body = ganttHtml(true);
    } else if (tab === 'site') {
      body = '<div class="tile"><div class="lbl"><span>Площадка сегодня</span></div><p>Кладка 2 этажа: 28 из 40 м³. Арматура: поставка завтра. Автокран на простое.</p><div class="btns"><a class="btn pri" href="#/site/chief">Открыть «Начальник участка»</a><a class="btn" href="#/site/plan">График и выдача работ</a></div></div>';
    } else {
      var d = D.projectTabs[tab];
      if (tab === 'files') d = { cols: d.cols.filter(function (c, i) { return i !== 1; }), rows: d.rows.filter(function (r) { return r[1] === p.n; }).map(function (r) { return r.filter(function (c, i) { return i !== 1; }); }) };
      body = (d.rows.length ? AQ.tbl(d.cols, d.rows) : '<div class="tile"><p class="mut">В этом проекте файлов пока нет.</p></div>') + '<div class="btns"><button class="btn sm" data-toast="В рабочей версии здесь будет: добавление и изменение записей в этой таблице">＋ Добавить</button></div>';
    }
    return h + body;
  }
  function ganttHtml(full) {
    var g = AQ.D.gantt, h = '<div class="tile"><div class="lbl"><span>График работ · ' + esc(g.start) + '</span><span class="tag t-bad">отставание: кладка 11 дн.</span></div><div class="gantt">';
    g.rows.forEach(function (r) {
      var w = r.len / g.weeks * 100, l = r.from / g.weeks * 100;
      h += '<div class="gr"><div class="gl">' + esc(r.t) + '<small>' + esc(r.who) + ' · ' + r.pct + ' %</small></div><div class="gtrack"><div class="gbar' + (r.late ? ' late' : '') + '" style="left:' + l + '%;width:' + w + '%"><i style="width:' + r.pct + '%"></i></div><div class="gtoday" style="left:' + g.today / g.weeks * 100 + '%"></div></div></div>';
    });
    h += '</div><div class="legend"><span><i style="background:var(--blue)"></i>факт</span><span><i style="background:var(--bad)"></i>отставание</span><span><i style="background:var(--acc)"></i>сегодня</span></div>';
    if (full) h += '<div class="btns"><button class="btn" data-toast="В рабочей версии здесь будет: перетаскивание работ по графику и пересчёт сроков">Изменить график</button><a class="btn pri" href="#/tasks/issued">Выдать работы прорабам</a></div>';
    return h + '</div>';
  }
  AQ.ganttHtml = ganttHtml;

  /* ---------- Файлы ---------- */
  S.files = function (rt) {
    var d = AQ.D.projectTabs.files;
    var h = AQ.tabHead(rt) + '<div class="drop" style="margin-bottom:14px">Перетащите файлы сюда: альбомы, сметы, договоры, акты<div class="btns" style="justify-content:center"><button class="btn pri" data-toast="В рабочей версии здесь будет: загрузка файлов с компьютера или с Google Диска. Новые файлы находятся сами, автоматически.">Загрузить файлы</button></div></div>';
    h += AQ.tbl(d.cols, d.rows.map(function (r) { return r.slice(); })) + '<div class="btns">' + AQ.lnk('calc/est', 'Посчитать себестоимость по альбому') + '</div>';
    return h + AQ.wasBlock(rt.tObj);
  };

  /* ---------- Задачи ---------- */
  S.tasks = function (rt) {
    var D = AQ.D;
    var h = AQ.tabHead(rt) + '<div class="tbl-wrap">' + D.tasks.map(function (t) {
      return '<div class="row" style="padding:12px 14px"><span class="tag t-mute">№' + t.id + '</span><div><b>' + esc(t.t) + '</b><small>' + esc(t.who) + ' · срок: ' + esc(t.due) + ' · объём: ' + esc(t.vol) + '</small></div><span class="tag ' + (t.status === 'Сдана' ? 't-ok' : (t.status === 'В работе' ? 't-blue' : 't-warn')) + '">' + esc(t.status) + '</span>' + (t.status === 'Сдана' ? '' : '<button class="btn sm" data-toast="В рабочей версии здесь будет: отметка «Взял в работу» и сдача объёма. Сейчас это делается и в Telegram-боте.">' + (t.status === 'Новая' ? 'Взять в работу' : 'Сдать с объёмом') + '</button>') + '</div>';
    }).join('') + '</div>';
    return h + AQ.wasBlock(rt.tObj);
  };
  S.issued = function (rt) {
    var D = AQ.D;
    var h = AQ.tabHead(rt) + '<div class="bento"><div class="tile s5"><div class="lbl"><span>Новое задание</span></div><div style="display:grid;gap:10px"><label>Кому<select style="width:100%"><option>Ерлан Б. (прораб)</option><option>Мади К. (мастер)</option></select></label><label>Что сделать<input style="width:100%" value="Кладка наружных стен, 2 этаж"></label><label>Объём и срок<input style="width:100%" value="40 м³ · до пятницы"></label></div><div class="btns"><button class="btn pri" data-toast="В рабочей версии здесь будет: задача уйдёт прорабу в Telegram-бот с кнопкой «Взял в работу». В демо ничего не отправляется.">Отправить в Telegram</button></div></div>' +
      '<div class="tile s7"><div class="lbl"><span>Выданные мной</span></div>' + D.tasks.map(function (t) { return '<div class="row"><span class="tag t-mute">№' + t.id + '</span><div><b>' + esc(t.t) + '</b><small>Кому: ' + esc(t.who) + ' · ' + esc(t.due) + '</small></div><span class="tag ' + (t.status === 'Сдана' ? 't-ok' : 't-blue') + '">' + esc(t.status) + '</span></div>'; }).join('') + '</div></div>';
    return h + AQ.wasBlock(rt.tObj);
  };

  /* ---------- Расчёт себестоимости: список → мастер → результат ---------- */
  S.est = function (rt, ctx) {
    var D = AQ.D;
    if (rt.sub[0] === 'new') return estWizard(rt, ctx);
    if (rt.sub[0] === 'result') return estResult(rt, ctx);
    var h = AQ.tabHead(rt) + '<div class="btns" style="margin:0 0 14px"><a class="btn pri" href="#/calc/est/new">＋ Новый расчёт</a></div>';
    h += AQ.tbl(['Расчёт', 'Проект', 'Дата', 'Себестоимость, ₸', 'Статус'], D.estCalcs.map(function (c) { return [c.n, c.project, c.date, fmt(c.cost), c.status]; }), { r: [3], go: function () { return 'calc/est/result'; } });
    return h + '<p class="mut" style="margin-top:10px;font-size:12px">Нажмите на строку, чтобы открыть результат.</p>' + AQ.wasBlock(rt.tObj);
  };
  function estWizard(rt, ctx) {
    var D = AQ.D, W = D.wizard, step = Math.max(1, Math.min(4, +rt.sub[1] || 1));
    var h = AQ.head('Новый расчёт себестоимости', 'Четыре шага. В прототипе всё заполнено примером и ничего не загружается.', '<a href="#/calc/est">Расчёты</a> / Расчёт себестоимости / Новый');
    h += '<div class="wiz">' + W.map(function (w, i) { return '<span class="' + (i + 1 === step ? 'on' : (i + 1 < step ? 'done' : '')) + '"><b>' + (i + 1 < step ? '✓' : i + 1) + '</b>' + esc(w.t) + '</span>'; }).join('') + '</div>';
    var w = W[step - 1];
    h += '<div class="tile"><div class="lbl"><span>Шаг ' + step + ' из 4 · ' + esc(w.t) + '</span></div><p class="mut" style="margin-bottom:12px">' + esc(w.d) + '</p>';
    if (step === 1) h += '<select style="width:100%;max-width:420px">' + D.projects.map(function (p) { return '<option' + (p.id === 'sklad' ? ' selected' : '') + '>' + esc(p.n) + ', ' + esc(p.city) + '</option>'; }).join('') + '</select>';
    if (step === 2) h += '<div class="drop"><b style="color:var(--ink)">' + esc(w.demo) + '</b><br>PDF или DWG, до 200 МБ<div class="btns" style="justify-content:center"><button class="btn" data-toast="В рабочей версии здесь будет: выбор файла на компьютере или в папке проекта">Выбрать другой файл</button></div></div>';
    if (step === 3) {
      var DET = [['Сваи С1', 462, 0, 'шт', 3], ['Ростверк Пр1', 156.5, 1, 'м³', 6], ['Арматура А500С', 15.7, 1, 'т', 9], ['Кладка цоколя · Оценка', 109.2, 1, 'м³', 12]];
      h += '<div class="bento"><div class="tile s7"><div class="sheet" id="sheet"><svg viewBox="0 0 600 240" preserveAspectRatio="xMidYMid slice"><g fill="none" stroke="var(--blue)" stroke-width="1.2"><rect x="60" y="40" width="300" height="150"/><rect x="90" y="70" width="110" height="90"/><rect x="230" y="70" width="100" height="90"/><path d="M60 100H360M200 40V190M400 60h150M400 90h150M400 120h110M400 150h150"/></g><g fill="var(--mute)" font-family="monospace" font-size="9"><text x="64" y="34" id="shTitle">ФП-1</text><text x="404" y="56">Бетон В25</text><text x="404" y="86">Арматура А500С</text><text x="404" y="116">Гидроизоляция</text></g></svg><div class="scan" id="scan"></div><span class="pg" id="pg">Лист 1 из 14</span><span class="ping" style="left:70px;top:48px" id="ping">найдено</span></div><p class="mut" style="margin-top:10px" id="reading">Открываю альбом КЖ…</p><div class="bar2" style="margin-top:8px"><i id="rbar" style="width:0;transition:width .3s"></i></div></div>' +
        '<div class="tile s5"><div class="lbl"><span>Найдено в чертежах</span></div><div class="det" id="det">' + DET.map(function (d, i) { return '<div class="d" id="d' + i + '"><span>' + esc(d[0]) + '</span><b><i data-v="' + d[1] + '" data-dec="' + d[2] + '">0</i> ' + d[3] + '</b></div>'; }).join('') + '</div></div></div>';
      ctx.after = function () {
        var sc = AQ.$('#scan'), sheet = AQ.$('#sheet'), y = 0, pg = 0, TOTAL = 14, pings = [[70, 48], [420, 66], [90, 100], [420, 126]];
        function show(i) {
          var d = DET[i], el = AQ.$('#d' + i); if (!el) return; el.classList.add('on');
          var num = el.querySelector('i'), to = d[1], dec = d[2], n = 0, steps = AQ.reduced ? 1 : 22;
          var id = AQ.every(function () { n++; var v = to * (n / steps); num.textContent = (dec ? v.toFixed(dec).replace('.', ',') : String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')); if (n >= steps) clearInterval(id); }, 40);
          var p = AQ.$('#ping'); if (p) { p.style.left = pings[i][0] + 'px'; p.style.top = pings[i][1] + 'px'; p.textContent = d[0] + ' — ' + d[1] + ' ' + d[3]; p.classList.add('on'); }
        }
        function step1() {
          pg++; var el = AQ.$('#pg'); if (!el) return;
          el.textContent = 'Лист ' + pg + ' из ' + TOTAL; AQ.$('#rbar').style.width = (pg / TOTAL * 100) + '%';
          sheet.classList.add('flip'); setTimeout(function () { sheet.classList.remove('flip'); }, 120);
          var p = AQ.$('#ping'); if (p) p.classList.remove('on');
          DET.forEach(function (d, i) { if (d[4] === pg) show(i); });
          var rd = AQ.$('#reading'); if (rd) rd.textContent = pg < TOTAL ? 'Читаю лист ' + pg + ' из ' + TOTAL + '…' : 'Готово: 14 листов, 4 вида работ. Объёмы посчитаны формулами.';
        }
        if (AQ.reduced) { for (pg = 0; pg < TOTAL;) step1(); return; }
        AQ.every(function () { y = (y + 5) % 240; if (sc) sc.style.top = y + 'px'; }, 40);
        var iv = AQ.every(function () { if (pg >= TOTAL) { clearInterval(iv); return; } step1(); }, 420);
      };
    }
    if (step === 4) h += '<div style="display:grid;gap:10px;max-width:420px"><label>Наценка, %<input value="20" style="width:100%"></label><label>НДС<select style="width:100%"><option>16 %</option><option>Без НДС</option></select></label></div><p class="mut" style="margin-top:10px">Цены берутся из базы и ответов поставщиков. Подсчёт делают формулы, не ИИ.</p>';
    h += '<div class="btns">' + (step > 1 ? '<a class="btn" href="#/calc/est/new/' + (step - 1) + '">← Назад</a>' : '<a class="btn" href="#/calc/est">Отмена</a>') + (step < 4 ? '<a class="btn pri" href="#/calc/est/new/' + (step + 1) + '">Дальше →</a>' : '<a class="btn pri" href="#/calc/est/result">Посчитать</a>') + '</div></div>';
    return h;
  }
  function estResult(rt) {
    var R = AQ.D.estResult;
    var h = AQ.head(esc(R.n), esc(R.project) + ' · результат расчёта', '<a href="#/calc/est">Расчёты</a> / Расчёт себестоимости / Результат');
    h += '<div class="bento"><div class="tile s4"><div class="lbl"><span>Себестоимость для вас</span></div><div class="big">' + fmt(R.cost) + ' ₸</div><p class="mut" style="margin-top:6px">Работы и материалы без наценки.</p></div><div class="tile s4"><div class="lbl"><span>Смета заказчику, с НДС ' + R.vat + ' %</span></div><div class="big acc">' + fmt(R.price) + ' ₸</div><p class="mut" style="margin-top:6px">С прибылью компании и налогами.</p></div><div class="tile s4"><div class="lbl"><span>Разница — прибыль и налоги</span></div><div class="big ok">' + fmt(R.diff) + ' ₸</div></div></div><div style="height:14px"></div>';
    h += '<div class="tbl-wrap"><table><thead><tr><th>Работа</th><th class="r">Кол-во</th><th>Ед.</th><th class="r">Цена, ₸</th><th class="r">Сумма, ₸</th><th></th></tr></thead><tbody>' + R.rows.map(function (r) { return '<tr><td>' + esc(r[0]) + '</td><td class="num">' + (r[1] % 1 ? String(r[1]).replace('.', ',') : fmt(r[1])) + '</td><td>' + esc(r[2]) + '</td><td class="num">' + fmt(r[3]) + '</td><td class="num">' + fmt(r[4]) + '</td><td>' + (r[5] ? '<span class="tag t-warn src" data-toast="Позиция посчитана приблизительно. Проверьте её в «Проверка сметы».">Оценка</span>' : '') + '</td></tr>'; }).join('') + '</tbody><tfoot><tr><td colspan="4">Итого себестоимость</td><td class="num">' + fmt(R.cost) + '</td><td></td></tr></tfoot></table></div>';
    h += '<div class="btns"><button class="btn" data-toast="В рабочей версии здесь будет: скачивание книги Excel с формулами">Скачать Excel</button><button class="btn" data-toast="В рабочей версии здесь будет: скачивание Word">Word</button><button class="btn" data-toast="В рабочей версии здесь будет: скачивание PDF">PDF</button><a class="btn" href="#/calc/check">Проверить спорные позиции</a><a class="btn pri" href="#/calc/offer">Сделать КП заказчику</a></div><p class="mut" style="margin-top:10px;font-size:12px">Суммы считают формулы, а не ИИ. Позиции «Оценка» ИИ определил приблизительно, их нужно проверить.</p>';
    return h;
  }

  /* ---------- Проверка сметы ---------- */
  S.check = function (rt) {
    var F = AQ.D.checkFindings;
    var h = AQ.tabHead(rt) + '<div class="bento"><div class="tile s4"><div class="lbl"><span>Загруженная смета</span></div><b>Смета_общая.xlsx</b><p class="mut">Мебельный цех, v2 · 1 824 строки</p><div class="btns"><button class="btn sm" data-toast="В рабочей версии здесь будет: загрузка вашей сметы в Excel">Загрузить другую</button></div></div>' +
      '<div class="tile s8"><div class="lbl"><span>Найдено ' + F.length + ' замечаний</span></div>' + F.map(function (f) { return '<div class="row"><span class="tag ' + (f.k === 'Пропуск' ? 't-warn' : 't-bad') + '">' + esc(f.k) + '</span><div><b>' + esc(f.t) + '</b></div><span class="num ' + (f.sign === '−' ? 'ok' : 'bad') + '">' + (f.sum ? f.sign + fmt(f.sum) + ' ₸' : '—') + '</span></div>'; }).join('') + '<div class="btns"><a class="btn pri" href="#/calc/offer">Сделать КП</a><button class="btn" data-toast="В рабочей версии здесь будет: список замечаний в Excel с отметками по строкам">Скачать список</button></div></div></div>';
    return h + AQ.wasBlock(rt.tObj);
  };

  /* ---------- Проверка объёмов ---------- */
  S.vol = function (rt) {
    var rows = AQ.D.volRows, total = 0;
    var body = rows.map(function (r) { var d = r[1] - r[2], s = d * r[4]; total += s; return '<tr><td>' + esc(r[0]) + '</td><td class="num">' + fmt(r[1]) + '</td><td class="num">' + fmt(r[2]) + '</td><td>' + esc(r[3]) + '</td><td class="num bad">+' + fmt(d) + '</td><td class="num bad">' + fmt(s) + '</td></tr>'; }).join('');
    var h = AQ.tabHead(rt) + '<div class="bento"><div class="tile s12" style="border-color:rgba(255,98,98,.4)"><div class="lbl"><span>Итог сверки · акт №7</span></div><div class="big bad">Завышено на ' + fmt(total) + ' ₸</div><p class="mut" style="margin-top:6px">Вернуть до подписания. Расхождение по 4 позициям. <span class="src" data-toast="Сумма = (объём в акте − объём по проекту) × цена по договору. Источник: акт №7 и альбом КЖ.">Откуда цифра</span></p></div></div><div style="height:14px"></div>';
    h += '<div class="tbl-wrap"><table><thead><tr><th>Работа</th><th class="r">В акте</th><th class="r">По проекту</th><th>Ед.</th><th class="r">Разница</th><th class="r">Сумма, ₸</th></tr></thead><tbody>' + body + '</tbody><tfoot><tr><td colspan="5">Итого завышение</td><td class="num bad">' + fmt(total) + '</td></tr></tfoot></table></div>';
    h += '<div class="btns"><button class="btn pri" data-toast="В рабочей версии здесь будет: письмо подрядчику с таблицей расхождений">Вернуть подрядчику</button>' + AQ.lnk('legal/letter', 'Составить претензию') + AQ.lnk('calc/vcmp', 'Сравнить предложение подрядчика') + '</div>';
    return h + AQ.wasBlock(rt.tObj);
  };
  S.vcmp = function (rt) {
    var h = AQ.tabHead(rt) + AQ.tbl(['Позиция', 'В проекте', 'В предложении', 'Вывод'], AQ.D.vcmpRows) + '<div class="btns">' + AQ.lnk('money/subs', 'Найти другого подрядчика') + AQ.lnk('legal/review', 'Проверить договор') + '</div>';
    return h + AQ.wasBlock(rt.tObj);
  };
})();
