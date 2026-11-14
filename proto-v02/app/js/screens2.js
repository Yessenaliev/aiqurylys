/* Экраны, часть 2: документы, площадка, техника, деньги, тендеры, договоры, компания, помощь, бот */
(function () {
  'use strict';
  var AQ = window.AQ, S = AQ.screens, esc = AQ.esc, fmt = AQ.fmt, tbl = AQ.tbl, tabHead = AQ.tabHead;

  function subTabs(base, items, cur) {
    return '<div class="tabs sc" style="margin-top:-6px">' + items.map(function (i) { return '<a class="tab' + (i[0] === cur ? ' on' : '') + '" href="#/' + base + '/' + i[0] + '">' + esc(i[1]) + '</a>'; }).join('') + '</div>';
  }

  /* ---------- общий шаблон вкладки ---------- */
  S._generic = function (rt) {
    var t = rt.tObj, key = rt.sec + '/' + rt.tab, d = AQ.D.tabs[key];
    var h = tabHead(rt);
    if (d) {
      h += tbl(d.cols, d.rows) + '<div class="btns"><button class="btn pri" data-toast="В рабочей версии здесь будет: ' + esc(d.act.toLowerCase()) + '. В демо ничего не сохраняется.">' + esc(d.act) + '</button>' + AQ.ext(t) + '</div>';
    } else {
      h += '<div class="tile"><p>' + esc(t.d || '') + '</p><div class="btns">' + AQ.ext(t) + '</div></div>';
    }
    var sib = AQ.tabsOf(rt.sObj).filter(function (x) { return x.id !== rt.tab; });
    if (sib.length) h += '<div class="was" style="border-style:solid"><b>В этом же разделе:</b> ' + sib.map(function (x) { return '<a class="acc" href="#/' + rt.sec + '/' + x.id + '">' + esc(x.t) + '</a>'; }).join(' · ') + '</div>';
    return h + AQ.wasBlock(t);
  };

  /* ---------- Документы ---------- */
  S.docsnew = function (rt, ctx) {
    var D = AQ.D;
    var h = tabHead(rt) + '<div style="display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap"><input id="dq" type="search" placeholder="Найти среди 140 видов документов: акт, дефект, простой…" style="flex:1;min-width:220px"><select style="min-width:180px">' + D.projects.map(function (p) { return '<option>' + esc(p.n) + '</option>'; }).join('') + '</select></div>';
    h += '<div class="prj" id="dgrid" style="grid-template-columns:repeat(auto-fill,minmax(250px,1fr))">' + D.docTypes.map(function (d, i) { return '<button class="ag dcard" data-act="doc-open" data-i="' + i + '" data-k="' + esc((d[0] + ' ' + d[1]).toLowerCase()) + '"><div class="n">' + esc(d[0]) + '</div><p>' + esc(d[1]) + '</p></button>'; }).join('') +
      '<button class="ag dcard" data-act="docs-all" data-k="все виды документов 140 этапы псд" style="border-color:var(--acc)"><div class="n acc">Все виды документов</div><p>140 видов по этапам строительства и разделам ПСД</p></button></div>';
    h += '<div id="dall" class="tile" style="margin-top:14px" hidden><div class="lbl"><span>140 видов по этапам</span></div><div class="btns" style="margin-top:0">' + D.docStages.map(function (s) { return '<button class="btn sm" data-toast="В рабочей версии здесь будет: список документов этапа «' + esc(s) + '» (около 18 видов)">' + esc(s) + '</button>'; }).join('') + '</div></div>';
    h += '<div class="tile" style="margin-top:14px"><div class="lbl"><span>Пакеты</span></div><div class="row"><div><b>Пакет на оплату</b><small>Акт 2В + справка об объёмах + справка о стоимости</small></div><button class="btn sm" data-toast="В рабочей версии здесь будет: формирование пакета на оплату из выбранного проекта">Собрать пакет</button></div><div class="row"><div><b>Пакет актов скрытых работ</b><small>Несколько актов по работам проекта сразу</small></div><button class="btn sm" data-toast="В рабочей версии здесь будет: пакет актов скрытых работ">Собрать пакет</button></div></div>';
    ctx.after = function () {
      var q = AQ.$('#dq');
      q.addEventListener('input', function () { var v = q.value.trim().toLowerCase(); AQ.$$('.dcard').forEach(function (c) { c.style.display = !v || c.getAttribute('data-k').indexOf(v) !== -1 ? '' : 'none'; }); });
    };
    return h + AQ.wasBlock(rt.tObj);
  };
  AQ.acts['doc-open'] = function (t) {
    var d = AQ.D.docTypes[+t.getAttribute('data-i')];
    AQ.overlay('<div class="mh"><h2>' + esc(d[0]) + '</h2><button class="pill ico" data-act="close" aria-label="Закрыть">✕</button></div><p class="mut" style="margin-bottom:12px">' + esc(d[1]) + '. Реквизиты подставятся сами.</p><div style="display:grid;gap:10px"><label>Проект<select style="width:100%"><option>Мебельный цех, Астана</option><option>Коттедж в BI Village</option></select></label><label>Период<input style="width:100%" value="01.10.2026 — 31.10.2026"></label><label>Что сделано<input style="width:100%" value="Армирование колонн, оси А–Д"></label></div><div class="btns"><button class="btn pri" data-toast="В рабочей версии здесь будет: готовый документ в Word и Excel. В демо ничего не формируется.">Сформировать</button><button class="btn" data-act="close">Отмена</button></div>');
  };
  AQ.acts['docs-all'] = function () { var e = AQ.$('#dall'); e.hidden = !e.hidden; };
  S.docsmade = function (rt) {
    return tabHead(rt) + tbl(['Документ', 'Проект', 'Дата', 'Сделал'], AQ.D.docsMade) + '<div class="btns"><a class="btn pri" href="#/docs/new">Сделать новый</a></div>' + AQ.wasBlock(rt.tObj);
  };

  /* ---------- Площадка ---------- */
  S.chief = function (rt) {
    var D = AQ.D;
    var h = tabHead(rt) + '<div class="bento"><div class="tile s6"><div class="lbl"><span>Что сделать сегодня</span></div>' + D.tasks.slice(0, 3).map(function (t) { return '<div class="row"><span class="tag t-mute">№' + t.id + '</span><div><b>' + esc(t.t) + '</b><small>' + esc(t.who) + ' · ' + esc(t.due) + '</small></div></div>'; }).join('') + '<div class="btns"><a class="btn sm pri" href="#/tasks/issued">Выдать задачу</a></div></div>' +
      '<div class="tile s6"><div class="lbl"><span>Склад проекта</span></div>' + tbl(D.projectTabs.stock.cols, D.projectTabs.stock.rows) + '</div><div class="s12" style="grid-column:span 12">' + AQ.ganttHtml(false) + '</div></div>';
    return h + AQ.wasBlock(rt.tObj);
  };
  S.plan = function (rt) {
    return tabHead(rt) + AQ.ganttHtml(true) + '<div class="tile" style="margin-top:14px"><div class="lbl"><span>Выдача работ</span></div><div class="row"><div><b>Кладка наружных стен, 2 этаж → Ерлан Б.</b><small>40 м³ · придёт в Telegram с кнопкой «Взял в работу»</small></div><button class="btn sm pri" data-toast="В рабочей версии здесь будет: работа из графика уйдёт прорабу в Telegram. В демо ничего не отправляется.">Выдать</button></div></div>' + AQ.wasBlock(rt.tObj);
  };
  S.tech = function (rt) {
    var D = AQ.D, cur = rt.sub[0] || 'reg';
    var h = tabHead(rt) + subTabs('site/tech', [['reg', 'Реестр'], ['map', 'Карта · скоро'], ['to', 'ТО'], ['fuel', 'Топливо · скоро'], ['money', 'Доходы и расходы']], cur);
    if (cur === 'reg') {
      h += tbl(['Машина', 'Госномер', 'Моточасы', 'Следующее ТО', 'Состояние'], D.equipment.map(function (e) { return [e.n, e.plate, fmt(e.h), e.to, e.state]; }), { r: [2] }) + '<div class="btns"><button class="btn pri" data-toast="В рабочей версии здесь будет: добавление машины в реестр">＋ Добавить машину</button><button class="btn" data-toast="В рабочей версии здесь будет: запись наработки за смену">Записать наработку</button></div>';
    } else if (cur === 'map' || cur === 'fuel') {
      h += '<div class="tile"><span class="tag t-warn">скоро</span><h2 style="margin-top:10px">' + (cur === 'map' ? 'Карта техники' : 'Топливо по литрам') + '</h2><p class="mut" style="max-width:560px">' + (cur === 'map' ? 'Положение машин по GPS на карте проекта. Разработчик ещё подтверждает источник данных, поэтому в прототипе здесь только макет.' : 'Расход топлива в литрах по машинам. Разработчик ещё подтверждает источник данных. Сейчас топливо учитывается как расход в деньгах: см. «Доходы и расходы».') + '</p>' + (cur === 'map' ? '<div class="sheet" style="margin-top:14px"><svg viewBox="0 0 600 240"><g fill="none" stroke="var(--blue)" stroke-width="1.2"><path d="M20 200C120 120 220 220 320 110S520 90 580 40"/></g><g fill="var(--acc)"><circle cx="150" cy="150" r="6"/><circle cx="330" cy="108" r="6"/><circle cx="470" cy="84" r="6"/></g></svg></div>' : '') + '<div class="btns"><a class="btn" href="#/site/tech/money">Доходы и расходы</a></div></div>';
    } else if (cur === 'to') {
      h += tbl(['Машина', 'Следующее ТО', 'Статус'], D.equipment.map(function (e) { return [e.n, e.to, e.to.indexOf('просроч') !== -1 ? 'Просрочено' : 'В срок']; })) + '<div class="btns"><button class="btn" data-toast="В рабочей версии здесь будет: напоминание о ТО в Telegram">Напомнить в Telegram</button></div>';
    } else {
      var inc = 0, exp = 0; D.equipment.forEach(function (e) { inc += e.inc; exp += e.exp; });
      h += '<div class="btns" style="margin:0 0 12px">' + D.equipExpense.map(function (c) { return '<span class="tag ' + (c === 'Доходы' ? 't-ok' : 't-mute') + '">' + esc(c) + '</span>'; }).join('') + '</div>' +
        tbl(['Машина', 'Доходы, ₸', 'Расходы, ₸', 'Итог, ₸'], D.equipment.map(function (e) { return [e.n, fmt(e.inc), fmt(e.exp), fmt(e.inc - e.exp)]; }), { r: [1, 2, 3] }) + '<p class="mut" style="margin-top:8px">За неделю: доходы ' + fmt(inc) + ' ₸, расходы ' + fmt(exp) + ' ₸.</p><div class="btns"><button class="btn pri" data-toast="В рабочей версии здесь будет: запись дохода или расхода по технике">＋ Записать</button></div>';
    }
    return h + AQ.wasBlock(rt.tObj);
  };

  /* ---------- Деньги: финансовый отчёт ---------- */
  S.fin = function (rt) {
    var F = AQ.D.finance, cur = rt.sub[0] || 'bdr';
    var plan = cur === 'bdr' ? F.bdrPlan : F.cashPlan, fact = cur === 'bdr' ? F.bdrFact : F.cashFact, max = Math.max.apply(null, plan.concat(fact)) * 1.1;
    var h = tabHead(rt) + subTabs('money/fin', [['bdr', 'БДР (прибыль)'], ['bdds', 'БДДС (деньги)']], cur);
    h += '<div class="bento"><div class="tile s7"><div class="lbl"><span>' + (cur === 'bdr' ? 'Доходы и расходы по начислению' : 'Движение денег') + ' · план и факт, млн ₸</span></div><div class="chart">' + F.months.map(function (m, i) { return '<div class="col"><i style="height:' + plan[i] / max * 100 + '%"></i><i class="' + (i < 5 ? 'f' : '') + '" style="height:' + (fact[i] / max * 100) + '%"></i><span>' + m + '</span></div>'; }).join('') + '</div><div class="legend"><span><i style="background:var(--panelb)"></i>план</span><span><i style="background:var(--blue)"></i>факт</span></div></div>' +
      '<div class="tile s5"><div class="lbl"><span>Остаток денег</span></div><div class="big ok">31,2 млн ₸</div><p class="mut" style="margin-top:8px">Хватит на 5 недель. <span class="src" data-toast="Остаток = поступления минус расходы. Налоги по ставкам 2026 года считаются формулами. Источник: ваша таблица доходов и расходов.">Откуда цифра</span></p><div class="btns"><a class="btn sm" href="#/money/budget">Бюджет проекта</a></div></div></div><div style="height:14px"></div>';
    h += '<div class="tbl-wrap"><table><thead><tr><th>Статья</th><th class="r">План, млн ₸</th><th class="r">Факт, млн ₸</th><th class="r">Отклонение</th></tr></thead><tbody>' + F.rows.map(function (r) { return '<tr><td>' + esc(r[0]) + '</td><td class="num">' + r[1] + '</td><td class="num">' + r[2] + '</td><td class="num ' + (r[3].charAt(0) === '+' ? (r[0] === 'Выручка (акты)' ? 'ok' : 'bad') : (r[0] === 'Прибыль' || r[0] === 'Выручка (акты)' ? 'bad' : 'ok')) + '">' + r[3] + '</td></tr>'; }).join('') + '</tbody></table></div>';
    h += '<div class="btns"><button class="btn" data-toast="В рабочей версии здесь будет: загрузка вашей таблицы доходов и расходов и скачивание отчёта в Excel">Загрузить таблицу</button><button class="btn" data-toast="В рабочей версии здесь будет: отчёт в Excel">Скачать Excel</button></div>';
    return h + AQ.wasBlock(rt.tObj);
  };

  /* ---------- Тендеры ---------- */
  S.tender = function (rt, ctx) {
    var D = AQ.D, id = rt.sub[0] || D.tenders[0].id, cur = D.tenders.filter(function (t) { return t.id === id; })[0] || D.tenders[0];
    var good = D.tenders.filter(function (t) { return t.advice === 'Участвовать'; }).length;
    var h = tabHead(rt) + '<div class="tile prof" style="margin-bottom:14px"><div class="lbl"><span>Подходящие тендеры</span><span class="tag t-bad">закрываются на этой неделе: 3</span></div><div style="display:flex;gap:28px;align-items:flex-end;flex-wrap:wrap"><div class="big ok">Тендеры на <i data-cnt="' + D.kpi.tenders + '" data-dec="0">0</i> млн ₸</div><div class="mut">Ожидаемая прибыль по ним. Подходят ' + good + ' из ' + D.tenders.length + ' закупок. <span class="src" data-toast="' + esc(D.kpi.sources.tenders) + '">Откуда цифра</span></div></div></div><div class="bento"><div class="tile s5"><div class="lbl"><span>Лента · подобрано под ваш профиль</span></div><div class="tn">' + D.tenders.map(function (t) { return '<a class="t" href="#/sales/tender/' + t.id + '" style="' + (t.id === cur.id ? 'border-color:var(--acc)' : '') + '"><div><b>' + esc(t.n) + '</b><span class="tm">⏱ <span data-cd="' + AQ.cdSecs(t.id, t.left) + '">' + esc(t.left) + '</span></span></div><div><span class="mut">' + t.match + ' % · ' + esc(t.advice) + '</span><span class="pf">+' + String(t.profit).replace('.', ',') + ' млн</span></div></a>'; }).join('') + '</div></div>' +
      '<div class="tile s7"><div class="lbl"><span>Разбор объявления</span><span class="tag ' + (cur.advice === 'Участвовать' ? 't-ok' : (cur.advice === 'Подумать' ? 't-warn' : 't-bad')) + '">' + esc(cur.advice) + '</span></div><h2>' + esc(cur.n) + '</h2><div class="bento" style="grid-template-columns:repeat(3,1fr);margin-bottom:12px"><div><div class="mut" style="font-size:12px">Сумма</div><b class="mono">' + cur.sum + ' млн ₸</b></div><div><div class="mut" style="font-size:12px">Ожидаемая прибыль</div><b class="mono ok">+' + String(cur.profit).replace('.', ',') + ' млн ₸</b></div><div><div class="mut" style="font-size:12px">Закрывается через</div><b class="mono acc" data-cd="' + AQ.cdSecs(cur.id, cur.left) + '">' + esc(cur.left) + '</b></div></div><p style="margin-bottom:12px"><b>Почему:</b> ' + esc(cur.why) + '</p><div class="lbl"><span>Требования к участнику</span></div>' +
      D.tenderReq.map(function (r) { return '<div class="row"><div>' + esc(r[0]) + '</div><span class="tag ' + (r[1] === 'Есть' ? 't-ok' : 't-bad') + '">' + esc(r[1]) + '</span></div>'; }).join('') +
      '<div class="btns"><a class="btn pri" href="#/calc/est">Посчитать себестоимость по тендеру</a><a class="btn" href="#/sales/passport">Паспорт компании</a><button class="btn" data-toast="В рабочей версии здесь будет: подготовка заявки и пакета документов для подачи">Подготовить заявку</button></div></div></div>';
    ctx.after = function () { AQ.$$('[data-cnt]').forEach(function (el) { AQ.countUp(el, +el.getAttribute('data-cnt'), +el.getAttribute('data-dec'), 1200); }); AQ.cdStart(); };
    return h + AQ.wasBlock(rt.tObj);
  };

  /* ---------- Договоры: проверка (wow-момент) ---------- */
  S.review = function (rt, ctx) {
    var C = AQ.D.contract;
    var h = tabHead(rt) + '<div class="contract"><div class="doc"><div class="lbl"><span>Присланный договор</span><span class="tag t-mute">' + esc(C.n) + '</span></div>' + C.clauses.map(function (c) { return '<div class="clause" id="cl' + c.id + '"><b>' + esc(c.h) + '</b>' + esc(c.text) + '</div>'; }).join('') + '</div>' +
      '<div class="doc"><div class="lbl"><span>Правки юриста</span><span id="ecount" class="tag t-bad">ищу риски…</span></div><div id="edits"></div></div></div>' +
      '<div class="btns"><button class="btn pri" data-toast="В рабочей версии здесь будет: договор с принятыми правками в Word">Принять все правки</button><button class="btn" data-toast="В рабочей версии здесь будет: скачивание договора с отметками правок">Скачать с правками</button><a class="btn" href="#/legal/letter">Составить письмо контрагенту</a><a class="btn" href="#/legal/chat">Вопрос юристу</a></div>';
    ctx.after = function () {
      var box = AQ.$('#edits'), cnt = AQ.$('#ecount');
      function add(e) {
        var d = document.createElement('div'); d.className = 'edit';
        d.innerHTML = '<div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:6px"><b>' + esc(e.t) + '</b><span class="tag ' + (e.risk === 'Высокий' ? 't-bad' : 't-warn') + '">' + esc(e.risk) + '</span></div><del>' + esc(e.now) + '</del><br><ins>' + esc(e.to) + '</ins><div class="src2">Основание: ' + esc(e.base) + '</div>';
        box.appendChild(d); var cl = AQ.$('#cl' + e.id); if (cl) cl.classList.add('hit');
        cnt.textContent = 'найдено: ' + box.children.length + ' из ' + C.edits.length;
      }
      C.edits.forEach(function (e, i) { if (AQ.reduced) add(e); else AQ.later(function () { add(e); }, 900 + i * 1100); });
      if (AQ.reduced) cnt.textContent = 'найдено: ' + C.edits.length;
    };
    return h + AQ.wasBlock(rt.tObj);
  };

  /* ---------- Вопрос юристу ---------- */
  S.lchat = function (rt, ctx) {
    var L = AQ.D.lawyerAnswers;
    var h = tabHead(rt) + '<div class="tile"><div class="chat" id="lc"><div class="msg bot">Здравствуйте! Спросите по договору или закону. Я отвечаю со ссылкой на пункт договора и статью закона.</div>' + '<div class="msg me">' + esc(L[0].q) + '</div><div class="msg bot">' + esc(L[0].a) + '</div></div><form id="lf" style="display:flex;gap:8px;margin-top:14px"><input id="li" style="flex:1" placeholder="Ваш вопрос юристу" autocomplete="off"><button class="btn pri" type="submit">Спросить</button></form><div class="sugg"><button data-q2="' + esc(L[1].q) + '">' + esc(L[1].q) + '</button></div></div>';
    ctx.after = function () {
      var lc = AQ.$('#lc');
      function ask(q) { var m = document.createElement('div'); m.className = 'msg me'; m.textContent = q; lc.appendChild(m); var hit = L.filter(function (x) { return x.q === q; })[0]; AQ.later(function () { var b = document.createElement('div'); b.className = 'msg bot'; b.textContent = hit ? hit.a : 'В рабочей версии здесь ответит юрист-помощник со ссылкой на пункт договора и закон. В демо заготовлены два вопроса.'; lc.appendChild(b); }, 500); }
      AQ.$('#lf').addEventListener('submit', function (e) { e.preventDefault(); var v = AQ.$('#li').value.trim(); if (v) { ask(v); AQ.$('#li').value = ''; } });
      AQ.$$('[data-q2]').forEach(function (b) { b.addEventListener('click', function () { ask(b.getAttribute('data-q2')); }); });
    };
    return h + AQ.wasBlock(rt.tObj);
  };

  /* ---------- Компания ---------- */
  S.team = function (rt) {
    var D = AQ.D, M = AQ.M;
    var h = tabHead(rt) + '<div class="bento"><div class="tile s12"><div class="lbl"><span>1 · Сотрудники</span></div>' + tbl(['Имя', 'Должность', 'Почта', 'Статус', 'Был'], D.team.map(function (m) { return [m.n, m.role, m.mail, m.state, m.last]; })) + '<div class="btns"><button class="btn pri" data-act="invite">＋ Пригласить сотрудника</button></div></div>' +
      '<div class="tile s6"><div class="lbl"><span>2 · Список разделов по должностям</span></div>';
    M.roles.forEach(function (r) {
      var names = M.sections.filter(function (s) { return (!s.owner || r.company) && s.tabs.some(function (t) { return t.need === '*' || r.perms === 'ALL' || r.perms.indexOf(t.need) !== -1; }); }).map(function (s) { return s.t; });
      h += '<div class="row"><div><b>' + esc(r.n) + '</b><small>' + esc(names.join(' · ')) + '</small></div><button class="btn sm" data-role="' + r.id + '">Смотреть как</button></div>';
    });
    h += '</div><div class="tile s6"><div class="lbl"><span>3 · Доступ по должностям</span></div>' + M.access.map(function (a) { return '<div class="row"><div><b>' + esc(a[0]) + '</b><small>' + esc(a[1]) + '</small></div></div>'; }).join('') + '<p class="mut" style="margin-top:10px;font-size:12px">Раздел виден, если у роли есть хотя бы одна его вкладка. «Задачи» видят все.</p></div></div>';
    return h + AQ.wasBlock(rt.tObj);
  };
  AQ.acts['invite'] = function () {
    AQ.overlay('<div class="mh"><h2>Пригласить сотрудника</h2><button class="pill ico" data-act="close" aria-label="Закрыть">✕</button></div><div style="display:grid;gap:10px"><label>Почта<input style="width:100%" value="new@demo.kz"></label><label>Должность<select style="width:100%">' + AQ.M.roles.filter(function (r) { return r.id !== 'owner'; }).map(function (r) { return '<option>' + esc(r.n) + '</option>'; }).join('') + '</select></label></div><div class="btns"><button class="btn pri" data-toast="В рабочей версии здесь будет: письмо с приглашением, вход по коду. В демо ничего не отправляется.">Отправить приглашение</button></div>');
  };
  S.tariff = function (rt) {
    var T = AQ.D.tariff, cur = rt.sub[0] || 'mine';
    var h = tabHead(rt) + subTabs('company/tariff', [['mine', 'Мой пакет'], ['up', 'Улучшить']], cur);
    if (cur === 'mine') {
      h += '<div class="bento"><div class="tile s6"><div class="lbl"><span>' + esc(T.plan) + '</span></div><div class="big">' + T.used + ' из ' + T.limit + '</div><p class="mut">' + esc(T.per) + '. Действует до ' + esc(T.until) + '.</p><div class="bar2" style="margin-top:10px"><i style="width:' + T.used / T.limit * 100 + '%"></i></div><div class="btns"><a class="btn pri" href="#/company/tariff/up">Улучшить пакет</a></div></div><div class="tile s6"><div class="lbl"><span>Что считается</span></div>' + T.price.map(function (p) { return '<div class="row"><div>' + esc(p[0]) + '</div><b class="mono">' + esc(p[1]) + '</b></div>'; }).join('') + '</div></div>';
    } else {
      h += '<div class="bento"><div class="tile s6"><div class="lbl"><span>Пакеты расчётов</span></div>' + T.pack.map(function (p) { return '<div class="row"><div>' + esc(p[0]) + '</div><b class="mono">' + esc(p[1]) + '</b></div>'; }).join('') + '</div><div class="tile s6"><div class="lbl"><span>Заявка на тариф</span></div><p class="mut">Цена считается для вашей компании. Счёт приходит после звонка.</p><div class="btns"><button class="btn pri" data-toast="В рабочей версии здесь будет: заявка на тариф. Счёт придёт после звонка. В демо ничего не отправляется.">Оставить заявку</button></div></div></div>';
    }
    return h + AQ.wasBlock(rt.tObj);
  };

  /* ---------- Специальные страницы ---------- */
  S._help = function (rt) {
    var D = AQ.D, cur = rt.sub[0] || 'guide';
    var h = AQ.head('Помощь', 'Один вход вместо трёх: путеводитель, словарь и ответы на вопросы.', '<a href="#/home/today">Главная</a> / Помощь', '<div class="tabs sc">' + [['guide', 'Путеводитель'], ['glossary', 'Словарь'], ['faq', 'Вопросы']].map(function (t) { return '<a class="tab' + (t[0] === cur ? ' on' : '') + '" href="#/help/' + t[0] + '">' + t[1] + '</a>'; }).join('') + '</div>');
    if (cur === 'guide') {
      var done = D.guide.filter(function (g) { return g.done; }).length;
      h += '<div class="tile guide" style="margin-bottom:14px"><b>' + done + ' из ' + D.guide.length + ' шагов</b><div class="bar"><i style="width:' + done / D.guide.length * 100 + '%"></i></div></div><div class="steps">' + D.guide.map(function (g, i) { return '<a class="step' + (g.done ? ' done' : '') + '" href="#/' + (g.go === 'bot' ? 'bot' : (AQ.canRoute(g.go) ? g.go : 'help')) + '"><span class="n">' + (g.done ? '✓' : i + 1) + '</span><div><b>' + esc(g.t) + '</b><small>' + esc(g.d) + '</small></div><span class="mut">→</span></a>'; }).join('') + '</div>';
    } else if (cur === 'glossary') {
      h += tbl(['Термин', 'Что это'], D.glossary);
    } else {
      h += '<div class="tile">' + [['Что считает ИИ, а что формулы?', 'ИИ читает чертежи и документы. Суммы считают проверяемые формулы: каждую цифру можно проследить до источника.'], ['Где мои данные?', 'В вашей папке на Google Диске и в кабинете. Новые файлы находятся сами, автоматически.'], ['Как пригласить сотрудника?', 'Компания → Сотрудники и доступ. Человек получает вход по коду и видит только свои разделы.'], ['Что значит «Оценка»?', 'Позиция посчитана приблизительно. Проверьте её в «Проверка сметы».']].map(function (q) { return '<div class="row"><div><b>' + esc(q[0]) + '</b><small>' + esc(q[1]) + '</small></div></div>'; }).join('') + '<div class="btns"><a class="btn" href="#/support">Задать вопрос в поддержку</a></div></div>';
    }
    return h;
  };
  S._bot = function () {
    var D = AQ.D;
    var h = AQ.head('Telegram-бот и телефон', 'Прораб работает в Telegram, руководитель смотрит кабинет с телефона. Макеты ниже.', '<a href="#/home/today">Главная</a> / Telegram-бот');
    h += '<div class="bento"><div class="tile s5"><div class="phone"><div class="hd">AIQurylys · бот</div><div class="chat">' + D.telegram.map(function (m) { return '<div class="msg ' + (m.from === 'me' ? 'me' : 'bot') + '">' + esc(m.t) + (m.btn ? '<br><span class="mb">' + esc(m.btn) + '</span>' : '') + '</div>'; }).join('') + '</div></div></div>' +
      '<div class="tile s7"><div class="lbl"><span>Что умеет бот</span></div>' + [['Приносит задачи', 'С кнопкой «Взял в работу»'], ['Принимает объём одним сообщением', '«готово 12 40 м3»'], ['Отвечает на вопросы про цены', 'С предложением запросить у поставщиков'], ['Присылает утреннюю сводку', 'В 07:00: деньги, тендеры, решения']].map(function (x) { return '<div class="row"><div><b>' + x[0] + '</b><small>' + x[1] + '</small></div></div>'; }).join('') +
      '<div class="btns"><button class="btn pri" data-ext-tg="1" data-toast="В рабочей версии здесь откроется Telegram: t.me/AIQurylys_Bot. Прототип только показывает макет.">Открыть @AIQurylys_Bot</button><button class="btn" data-act="phone">Кабинет на телефоне</button></div></div></div>';
    return h;
  };
  AQ.acts['phone'] = function () {
    var role = AQ.state.role;
    AQ.overlay('<div class="mh"><h2>Кабинет на телефоне</h2><button class="pill ico" data-act="close" aria-label="Закрыть">✕</button></div><div class="phone" style="width:min(400px,92%);padding:6px"><iframe title="Кабинет на телефоне" src="index.html?embed=1&welcome=0&role=' + esc(role) + '#/home/today" style="width:100%;height:68vh;border:0;border-radius:24px;background:var(--bg)"></iframe></div>');
  };
  S._profile = function () {
    var r = AQ.role();
    return AQ.head('Профиль и вход', 'Имя, почта и вход по коду. Пароль не нужен.', '<a href="#/home/today">Главная</a> / Профиль') +
      '<div class="tile" style="max-width:560px"><div style="display:grid;gap:10px"><label>Имя<input style="width:100%" value="' + esc(r.name) + '"></label><label>Почта<input style="width:100%" value="demo@aiqurylys.kz"></label><label>Роль<input style="width:100%" value="' + esc(r.n) + '" disabled></label></div><div class="btns"><button class="btn pri" data-toast="В рабочей версии здесь будет: сохранение профиля. В демо ничего не сохраняется.">Сохранить</button><button class="btn" data-toast="В рабочей версии здесь будет: вход по коду из письма или Telegram">Сменить способ входа</button></div></div>';
  };
  S._notif = function () {
    var D = AQ.D;
    return AQ.head('Уведомления', 'Что приходит и куда. Колокольчик и эта страница — одно и то же.', '<a href="#/home/today">Главная</a> / Уведомления') +
      '<div class="bento"><div class="tile s7"><div class="lbl"><span>Последние</span></div>' + D.notifs.filter(function (n) { return AQ.canRoute(n.go); }).map(function (n) { return '<a class="row" href="#/' + n.go + '">' + (n.new ? '<span class="tag t-bad">новое</span>' : '<span class="tag t-mute">прочитано</span>') + '<div><b>' + esc(n.t) + '</b><small>' + esc(n.time) + '</small></div></a>'; }).join('') + '</div>' +
      '<div class="tile s5"><div class="lbl"><span>Настройки</span></div>' + ['Утренняя сводка в Telegram', 'Завышение в акте', 'Тендер закрывается', 'Задача просрочена'].map(function (x) { return '<label class="row" style="cursor:pointer"><div>' + x + '</div><input type="checkbox" checked style="width:18px;height:18px"></label>'; }).join('') + '<div class="btns"><button class="btn pri" data-toast="В рабочей версии здесь будет: сохранение настроек уведомлений">Сохранить</button></div></div></div>';
  };
  S._support = function () {
    return AQ.head('Поддержка', 'Вопрос в поддержку и «Мои обращения» на одной странице.', '<a href="#/home/today">Главная</a> / Поддержка') +
      '<div class="bento"><div class="tile s5"><div class="lbl"><span>Новое обращение</span></div><div style="display:grid;gap:10px"><label>Тема<select style="width:100%"><option>Вопрос по расчёту</option><option>Ошибка в акте</option><option>Тариф</option></select></label><label>Сообщение<textarea rows="4" style="width:100%">Не сходится сумма по кладке</textarea></label></div><div class="btns"><button class="btn pri" data-toast="В рабочей версии здесь будет: обращение уйдёт в поддержку, ответ придёт на почту и в Telegram. В демо ничего не отправляется.">Отправить</button></div></div>' +
      '<div class="tile s7"><div class="lbl"><span>Мои обращения</span></div>' + tbl(['№', 'Тема', 'Дата', 'Статус'], [['41', 'Не сходится сумма по кладке', '10.11.2026', 'В работе'], ['38', 'Как добавить подрядчика', '02.11.2026', 'Закрыто']]) + '</div></div>';
  };
})();
