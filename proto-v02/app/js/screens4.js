/* v0.8: вкладки и функции основного сайта ai-qurylys.kz, которые были потеряны в прототипе.
   Структура меню не меняется: недостающее добавлено вкладками внутри экранов. */
(function () {
  'use strict';
  const AQ = window.AQ, S = AQ.screens, esc = AQ.esc, fmt = AQ.fmt, $ = AQ.$, $$ = AQ.$$;
  const tbl = (...a) => AQ.tbl(...a), head = (rt) => AQ.tabHead(rt), chip = AQ.chip, hb = AQ.hb, donut = AQ.donut, paper = AQ.paper, xl = AQ.xl;
  const mln = (n) => String(n.toFixed(1)).replace('.', ',');
  AQ.ui = AQ.ui || {};
  const old = {}; ['chief', 'master', 'tech', 'sup', 'tender', 'concept', 'tasks', 'docsnew', 'passport', 'req', 'drive', 'demand', 'summary', 'projects', 'norms', 'fin', 'home'].forEach((k) => { old[k] = S[k]; });

  /* вкладки внутри экрана; item = [id, подпись, (необязательно) своя ссылка] */
  const stabs = (base, items, cur) => '<div class="tabs sc" style="margin-top:-6px">' + items.map((i, k) => `<a class="tab${(i[0] === cur) ? ' on' : ''}" href="#/${i[2] || (k === 0 ? base : base + '/' + i[0])}">${esc(i[1])}</a>`).join('') + '</div>';
  const bodyOf = (html) => { const i = html.indexOf('tabs sc'); if (i < 0) return html; const j = html.indexOf('</div>', i); return html.slice(j + 6); };
  const fake = (rt, sub) => Object.assign({}, rt, { sub: sub || [] });
  const tile = (lbl, inner, cls) => `<div class="tile ${cls || ''}"><div class="lbl"><span>${lbl}</span></div>${inner}</div>`;
  const note = (t) => `<p class="mut" style="font-size:12px;margin:8px 0 0">${esc(t)}</p>`;

  /* ---------- документы для превью ---------- */
  const D3 = () => AQ.D;
  AQ.DOCS['svod-xlsx'] = () => { const s = D3().svod, rows = s.sections.map((x) => [x.n, x.missing ? 'Не рассчитан' : x.state, x.missing ? '—' : fmt(x.cost)]), tot = s.sections.reduce((a, x) => a + (x.missing ? 0 : x.cost), 0); rows.push(['Итого по рассчитанным разделам', '', fmt(tot)]); return { file: 'Свод_проекта.xlsx', body: xl('Свод проекта · ' + s.project, ['Раздел', 'Статус', 'Себестоимость, ₸'], rows, { formula: '=СУММ(C3:C6)  →  ' + fmt(tot), tabs: ['Свод', 'КЖ', 'АР', 'ОВ', 'ЭОМ'], boldLast: 1 }) }; };
  AQ.DOCS['area-xlsx'] = () => { const a = D3().area, r = a.rooms, t = [0, 1, 2, 3].map((i) => r.reduce((s, x) => s + (i === 0 ? 0 : x[i]), 0)); const rows = r.map((x) => [x[0], fmt(x[1]), fmt(x[2]), fmt(x[3])]); rows.push(['Итого', fmt(t[1]), fmt(t[2]), fmt(t[3])]); return { file: 'Схема_площадей_отделки.xlsx', body: xl('Схема площадей отделки · Мебельный склад', ['Помещение', 'Пол, м²', 'Стены, м²', 'Потолок, м²'], rows, { formula: 'Площади посчитаны по помещениям', tabs: ['Ведомость'], boldLast: 1 }) }; };
  AQ.DOCS['protocol'] = () => { const C = D3().contract; return { file: 'Протокол_разногласий_14.docx', body: paper(`<div class="ph"><b>Протокол разногласий</b><span>к договору субподряда №14</span></div><h3 class="pt">Предложения по редакции пунктов</h3>` + tbl(['Пункт', 'Редакция контрагента', 'Наша редакция'], C.edits.map((e, i) => [C.clauses[i].h, e.now, e.to]), {}) + '<p class="mut" style="margin-top:10px">Основания: ' + C.edits.map((e) => e.base).join('; ') + '</p>', 'Word · собран из найденных замечаний') }; };

  /* ---------- Расчёты: Свод проекта ---------- */
  S.svod = function (rt) {
    const s = D3().svod, ready = s.sections.filter((x) => !x.missing), tot = ready.reduce((a, x) => a + x.cost, 0);
    return head(rt) + `<div class="bento"><div class="tile s4" style="text-align:center"><div class="lbl"><span>${esc(s.project)}</span></div>${donut(Math.round(ready.length / s.sections.length * 100), 140, ready.length + ' из ' + s.sections.length)}<p class="mut" style="margin-top:6px">разделов рассчитано</p></div>
      <div class="tile s8"><div class="lbl"><span>Разделы проекта</span><span class="tag t-ok">${money(tot)}</span></div>${s.sections.map((x) => `<div class="row"><div><b>${esc(x.n)}</b><small>${x.missing ? 'Файлы раздела ещё не загружены' : (x.estimate ? 'Позиций «Оценка»: ' + x.estimate : 'Спорных позиций нет')}</small></div><span class="num">${x.missing ? '—' : fmt(x.cost) + ' ₸'}</span>${chip(x.state, x.missing ? 't-bad' : x.estimate ? 't-warn' : 't-ok')}${x.missing ? '<a class="btn sm" href="#/calc/est/new">Рассчитать</a>' : ''}</div>`).join('')}<div class="btns"><button class="btn pri" data-doc="svod-xlsx">Собрать свод в Excel</button>${AQ.lnk('calc/offer', 'Сделать КП заказчику')}</div></div></div>` + AQ.wasBlock(rt.tObj);
  };
  const money = (n) => fmt(n) + ' ₸';

  /* ---------- Документы: Сейчас · Этапы строительства · Схема площадей · Комплектность ---------- */
  S.docsnew = function (rt, ctx) {
    const cur = rt.sub[0] || 'now', items = [['now', 'Сейчас'], ['stages', 'Этапы строительства'], ['made', 'Сделанные', 'docs/made'], ['area', 'Схема площадей'], ['complete', 'Комплектность']], d = D3();
    let h = head(rt) + stabs('docs/new', items, cur);
    if (cur === 'now') {
      h += `<div class="bento"><div class="tile s7"><div class="lbl"><span>Что оформить сейчас</span><span class="tag t-warn">${d.docsNow.ready.length}</span></div><p class="mut" style="margin-bottom:8px">Сданные работы без акта и документы по событиям на площадке. Осталось проверить.</p>${d.docsNow.ready.map((r) => `<div class="row"><div><b>${esc(r[0])}</b><small>${esc(r[1])}</small></div><button class="btn sm pri" data-doc="${r[2]}">Оформить</button></div>`).join('')}</div>
        <div class="tile s5"><div class="lbl"><span>Сделать документ</span></div><p class="mut" style="margin-bottom:8px">Выберите, что произошло на площадке, остальное подставится из проекта.</p>${d.docsNow.events.map((e) => `<button class="cit" data-doc="act-2v"><b>${esc(e[0])}</b><small>${esc(e[1])}</small></button>`).join('')}<a class="cit" href="#/docs/new/stages"><b>Другой документ</b><small>Все виды по этапам строительства: до начала, по ходу работ, сдача</small></a></div></div>`;
    } else if (cur === 'stages') {
      h += bodyOf(old.docsnew(fake(rt, []), ctx));
    } else if (cur === 'area') {
      const r = d.area.rooms, t = [1, 2, 3].map((i) => r.reduce((s, x) => s + x[i], 0));
      h += tile('Схема площадей отделки · Мебельный склад', `<p class="mut" style="margin-bottom:10px">${esc(d.area.note)}</p>` + tbl(['Помещение', 'Пол, м²', 'Стены, м²', 'Потолок, м²'], r.map((x) => [x[0], fmt(x[1]), fmt(x[2]), fmt(x[3])]).concat([['Итого', fmt(t[0]), fmt(t[1]), fmt(t[2])]]), { r: [1, 2, 3] }) + '<div class="btns"><button class="btn pri" data-doc="area-xlsx">Скачать ведомость</button></div>');
    } else {
      const c = d.complete;
      h += `<div class="bento"><div class="tile s4" style="text-align:center"><div class="lbl"><span>Комплектность исполнительной</span></div>${donut(c.percent, 150, 'готово')}<p class="mut" style="margin-top:6px">Не хватает 2 документов</p></div><div class="tile s8"><div class="lbl"><span>Что должно быть к сдаче</span></div>${c.items.map((i) => `<div class="row"><span class="tag ${i[1] === 'ok' ? 't-ok' : i[1] === 'warn' ? 't-warn' : 't-bad'}">${i[1] === 'ok' ? '✓' : i[1] === 'warn' ? '!' : '✕'}</span><div><b>${esc(i[0])}</b><small>${i[1] === 'ok' ? 'Есть' : i[1] === 'warn' ? 'Есть не по всем работам' : 'Нет в проекте'}</small></div>${i[1] === 'ok' ? '' : '<button class="btn sm" data-doc="act-2v">Оформить</button>'}</div>`).join('')}</div></div>`;
    }
    return h + AQ.wasBlock(rt.tObj);
  };

  /* ---------- Финансист: По проекту · БДР · БДДС · По всем проектам · Отчёты 1С · Приход материалов ---------- */
  S.fin = function (rt) {
    const cur = rt.sub[0] || 'project', d = D3(), F = d.finance;
    const items = [['project', 'По проекту'], ['budget', 'Бюджет', 'money/budget'], ['bdr', 'БДР'], ['bdds', 'БДДС'], ['all', 'По всем проектам'], ['c1', 'Отчёты 1С'], ['receipts', 'Приход материалов']];
    let h = head(rt) + stabs('money/fin', items, cur);
    const chart = (c) => { const plan = c === 'bdr' ? F.bdrPlan : F.cashPlan, fact = c === 'bdr' ? F.bdrFact : F.cashFact, mx = Math.max.apply(null, plan.concat(fact)) * 1.1; return `<div class="chart">${F.months.map((m, i) => `<div class="col"><i style="height:${plan[i] / mx * 100}%"></i><i class="${i < 5 ? 'f' : ''}" style="height:${fact[i] / mx * 100}%"></i><span>${m}</span></div>`).join('')}</div><div class="legend"><span><i style="background:var(--panelb)"></i>план</span><span><i style="background:var(--blue)"></i>факт</span></div>`; };
    if (cur === 'project') {
      const p = d.finAll[0], f = d.forecast;
      h += `<div class="bento"><div class="tile s7"><div class="lbl"><span>Мебельный цех · деньги по месяцам, млн ₸</span></div>${chart('bdds')}</div><div class="tile s5"><div class="lbl"><span>Договор и баланс</span></div><div class="kpis3"><div><span>Поступило</span><b class="mono ok">${mln(p.in)}</b></div><div><span>Потрачено</span><b class="mono">${mln(p.out)}</b></div><div><span>Баланс</span><b class="mono bad">${mln(p.left)}</b></div></div><div class="lbl" style="margin-top:16px"><span>Прогноз себестоимости</span><span class="tag t-warn">+${mln(f.gap)} млн</span></div>${hb([{ l: 'Принятый расчёт', v: f.accepted, note: mln(f.accepted) }, { l: 'Ожидается по факту', v: f.expected, note: mln(f.expected) }])}${note(f.note)}</div>
        <div class="tile s12"><div class="lbl"><span>Записать</span></div><div class="btns" style="margin-top:0"><button class="btn" data-toast="Реестр расходов загружен: 218 строк, баланс пересчитан">Реестр расходов</button><button class="btn" data-toast="Поступление записано: 14,2 млн ₸ от ТОО «Мебель-Групп»">Поступление</button><button class="btn" data-toast="Договор добавлен: сумма и сроки внесены в проект">Договор</button>${AQ.lnk('money/budget', 'Бюджет проекта')}</div></div></div>`;
    } else if (cur === 'bdr' || cur === 'bdds') {
      h += `<div class="bento"><div class="tile s7"><div class="lbl"><span>${cur === 'bdr' ? 'Доходы и расходы по начислению' : 'Движение денег'} · план и факт, млн ₸</span></div>${chart(cur)}</div><div class="tile s5"><div class="lbl"><span>Остаток денег</span></div><div class="big ok">15,6 млн ₸</div><p class="mut" style="margin-top:8px">Пришло 110,0 млн ₸ − потрачено 94,4 млн ₸.</p><div class="btns"><button class="btn sm" data-doc="fin-xlsx">Скачать Excel</button></div></div><div class="tile s12">${tbl(['Статья', 'План, млн ₸', 'Факт, млн ₸', 'Отклонение'], F.rows, { r: [1, 2, 3] })}</div></div>`;
    } else if (cur === 'all') {
      h += tile('Деньги по всем проектам, млн ₸', tbl(['Проект', 'Поступило', 'Потрачено', 'Баланс', 'Состояние'], d.finAll.map((x) => [x.n, mln(x.in), mln(x.out), mln(x.left), x.state]), { r: [1, 2, 3] }) + hb(d.finAll.map((x) => ({ l: x.n, v: Math.abs(x.left) || 0.1, note: (x.left > 0 ? '+' : '') + mln(x.left), hi: x.left > 0 }))));
    } else if (cur === 'c1') {
      h += `<div class="bento"><div class="tile s7"><div class="lbl"><span>Отчёты 1С</span><span class="tag t-mute">не подключено</span></div><p style="margin-bottom:12px">Бухгалтерия в 1С? Подключите 1С: затраты будут приходить сами, без ручной загрузки реестров.</p><div class="btns" style="margin-top:0"><button class="btn pri" data-toast="1С подключена: выгрузка за октябрь получена, 3 отчёта разобраны">Подключить 1С</button><button class="btn" data-toast="Файл отчёта 1С загружен: оборотно-сальдовая ведомость, 218 строк">Загрузить отчёт файлом</button></div></div><div class="tile s5"><div class="lbl"><span>Разобрано</span></div>${d.c1.map((r) => `<div class="row"><div><b>${esc(r[0])}</b><small>${esc(r[1])} · ${esc(r[2])}</small></div>${chip('прочитан', 't-ok')}</div>`).join('')}</div></div>`;
    } else {
      h += tile('Приход материалов', tbl(['Дата', 'Поставщик', 'Материал', 'Кол-во', 'Сумма, ₸', 'Статус'], d.receipts.map((r) => r.slice()), { r: [4] }) + '<div class="btns"><button class="btn" data-toast="Накладная загружена: БетонЦентр №419, 400 м³ записано на склад">Загрузить накладную</button>' + AQ.lnk('site/chief/stock', 'Склад проекта') + '</div>');
    }
    return h + AQ.wasBlock(rt.tObj);
  };

  /* ---------- Начальник участка: Сегодня · График · Склад · Техника · Подрядчики ---------- */
  S.chief = function (rt, ctx) {
    const cur = rt.sub[0] || 'today', d = D3(), T = d.projectTabs || AQ.D.projectTabs;
    const items = [['today', 'Сегодня'], ['schedule', 'График'], ['stock', 'Склад'], ['tech', 'Техника'], ['subs', 'Подрядчики']];
    let h = head(rt) + stabs('site/chief', items, cur);
    if (cur === 'today') {
      h += `<div class="bento"><div class="tile s7"><div class="lbl"><span>Принять или вернуть</span><span class="tag t-warn" id="cacc">${d.chiefToday.length}</span></div>${d.chiefToday.map((x, i) => `<div class="row" data-i="${i}"><div><b>${esc(x.t)}</b><small>${esc(x.who)}</small></div><button class="btn sm pri" data-act="chief-accept">Принять</button><button class="btn sm" data-act="chief-return">Вернуть</button></div>`).join('')}</div>
        <div class="tile s5"><div class="lbl"><span>Документы к оформлению</span></div>${d.chiefDocs.map((x) => `<div class="row"><div><b>${esc(x[0])}</b><small>${esc(x[1])}</small></div><button class="btn sm" data-doc="act-2v">Оформить</button></div>`).join('')}</div>
        <div class="tile s12"><div class="lbl"><span>Замечания</span><span class="tag t-bad">${d.chiefIssues.length}</span></div>${d.chiefIssues.map((x) => `<div class="row"><div><b>${esc(x[0])}</b><small>Устранить ${esc(x[1])}</small></div><button class="btn sm" data-toast="Замечание передано Ерлану Б. в Telegram">Передать прорабу</button></div>`).join('')}<div class="btns">${AQ.lnk('tasks/issued', 'Выдать задание', 'btn pri')}</div></div></div>`;
    } else if (cur === 'schedule') {
      h += AQ.ganttHtml(true);
    } else if (cur === 'stock') {
      h += AQ.projTab('stock', null);
    } else if (cur === 'tech') {
      h += AQ.projTab('equipment', null) + `<div class="btns">${AQ.lnk('site/tech', 'Реестр техники', 'btn')}</div>`;
    } else {
      h += subsView();
    }
    AQ.acts['chief-accept'] = (t) => { const row = t.closest('.row'); row.innerHTML = '<div><b>' + row.querySelector('b').textContent + '</b><small class="ok">Принято ✓ Акт скрытых работ можно оформить</small></div>'; const c = $('#cacc'); if (c) c.textContent = $$('[data-act=chief-accept]').length; AQ.toast('Принято: прораб видит статус в Telegram'); };
    AQ.acts['chief-return'] = () => AQ.toast('Возвращено прорабу с замечанием: «Проверить армирование, ось Б/3»');
    return h + AQ.wasBlock(rt.tObj);
  };
  function subsView() {
    const d = D3(), st = (s) => chip(s, s === 'Работали' ? 't-ok' : s === 'Кандидат' ? 't-blue' : 't-mute');
    return `<div class="btns" style="margin:0 0 12px">${d.subWorks.map((w, i) => `<button class="btn sm${i === 0 ? ' pri' : ''}" data-toast="Фильтр: ${esc(w)}">${esc(w)}</button>`).join('')}</div><div class="bento"><div class="tile s12"><div class="lbl"><span>Подрядчики компании</span><span><button class="btn sm" data-toast="Подрядчик добавлен: можно назначить исполнителем вида работ в графике">＋ Добавить подрядчика</button></span></div>` + tbl(['Подрядчик', 'Вид работ', 'Статус', 'Контакты'], d.subStatus.map((s) => [s.n, s.work, st(s.state), s.phone || s.mail ? (s.phone + ' ' + s.mail).trim() : 'Без контактов']), { raw: true }) + '<p class="mut" style="font-size:12px;margin-top:8px">Подрядчик, назначенный на вид работ, становится исполнителем этих работ в графике.</p></div></div>';
  }

  /* ---------- Прораб/Мастер: Мои работы · Материалы и нормы · Склад · Техника ---------- */
  S.master = function (rt, ctx) {
    const cur = rt.sub[0] || 'works', items = [['works', 'Мои работы'], ['norms', 'Материалы и нормы'], ['tech', 'Техника']];
    let h = head(rt) + stabs('site/master', items, cur);
    if (cur === 'works') h += bodyOf(old.master(fake(rt, []), ctx)) + `<div class="bento" style="margin-top:14px"><div class="tile s6"><div class="lbl"><span>Отчёт за сегодня</span></div><p class="mut">Люди, техника, фото и чего не хватает — уходит начальнику участка.</p><div class="btns"><button class="btn pri" data-toast="Отчёт за сегодня отправлен начальнику участка: 5 человек, 2 машины, 3 фото, не хватает 4 м³ раствора">Заполнить отчёт</button></div></div></div>`;
    else if (cur === 'norms') h += bodyOf(old.norms(fake(rt, []), ctx));
    else if (cur === 'stock') h += AQ.projTab('stock', null);
    else h += AQ.projTab('equipment', null);
    return h + AQ.wasBlock(rt.tObj);
  };

  /* ---------- Техника ---------- */
  S.tech = function (rt) {
    const cur = rt.sub[0] || 'today', d = D3(), E = AQ.D.equipment, M = d.mapPins;
    const items = [['today', 'Дела на сегодня'], ['reg', 'Реестр'], ['map', 'Карта'], ['to', 'Учёт ТО'], ['remind', 'Напоминания'], ['money', 'Деньги']];
    let h = head(rt) + stabs('site/tech', items, cur) + `<div class="btns" style="margin:0 0 12px"><button class="btn pri" data-act="tech-rec">Записать</button><button class="btn" data-toast="Список техники загружен: 6 машин добавлено в реестр">Импорт списком</button><button class="btn" data-toast="Машина добавлена: Каток дорожный, 0 моточасов">Добавить технику</button></div>`;
    if (cur === 'today') {
      h += tile('Дела на сегодня', d.techToday.map((x) => `<div class="row"><span class="tag ${x[2] === 'bad' ? 't-bad' : 't-warn'}">${x[2] === 'bad' ? 'срочно' : 'внимание'}</span><div><b>${esc(x[0])}</b><small>${esc(x[1])}</small></div><button class="btn sm" data-act="tech-rec">Записать</button></div>`).join(''));
    } else if (cur === 'reg') {
      h += `<div class="btns" style="margin:0 0 10px">${['Все', 'С делами', 'Активна', 'На ремонте', 'Списана'].map((f, i) => `<button class="btn sm${i === 0 ? ' pri' : ''}" data-toast="Фильтр: ${f}">${f}</button>`).join('')}</div>` + tbl(['Машина', 'Госномер', 'Моточасы', 'Следующее ТО', 'Состояние'], E.map((e) => [e.n, e.plate, fmt(e.h), e.to, e.state]), { r: [2] });
    } else if (cur === 'map') {
      h += `<div class="bento"><div class="tile s8"><div class="lbl"><span>Где машины сейчас</span><span class="tag t-ok">онлайн</span></div><div class="sheet" style="height:340px"><svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0"><g fill="none" stroke="var(--blue)" stroke-width=".35" opacity=".55"><path d="M0 62C20 50 38 70 60 52S90 40 100 46"/><path d="M12 0L30 100"/><path d="M0 22L100 30" /><rect x="14" y="48" width="22" height="18"/><rect x="58" y="56" width="22" height="18"/></g></svg>${M.map((p, i) => `<span class="mpin" style="left:${p.x}%;top:${p.y}%" title="${esc(p.n)}">${i + 1}</span>`).join('')}</div></div><div class="tile s4"><div class="lbl"><span>Машины</span></div>${M.map((p, i) => `<div class="row"><span class="mpin st">${i + 1}</span><div><b>${esc(p.n)}</b><small>${esc(p.where)} · ${esc(p.t)}</small></div></div>`).join('')}</div></div>`;
    } else if (cur === 'to') {
      h += tbl(['Машина', 'Следующее ТО', 'Статус'], E.map((e) => [e.n, e.to, e.to.indexOf('просроч') !== -1 ? 'Просрочено' : 'В срок']));
    } else if (cur === 'remind') {
      h += tile('Напоминания о ТО в Telegram', tbl(['Машина', 'Вид', 'Когда', 'Кому'], d.techRemind));
    } else {
      let inc = 0, exp = 0; E.forEach((e) => { inc += e.inc; exp += e.exp; });
      h += `<div class="btns" style="margin:0 0 10px">${AQ.D.equipExpense.map((c) => `<span class="tag ${c === 'Доходы' ? 't-ok' : 't-mute'}">${esc(c)}</span>`).join('')}</div><div class="kpis3" style="margin-bottom:12px"><div><span>Доход по парку</span><b class="mono ok">${money(inc)}</b></div><div><span>Расход по парку</span><b class="mono">${money(exp)}</b></div><div><span>Разница</span><b class="mono">${inc - exp >= 0 ? '+' : ''}${money(inc - exp)}</b></div></div>` + tbl(['Машина', 'Доходы, ₸', 'Расходы, ₸', 'Итог, ₸'], E.map((e) => [e.n, fmt(e.inc), fmt(e.exp), fmt(e.inc - e.exp)]), { r: [1, 2, 3] });
    }
    return h + AQ.wasBlock(rt.tObj);
  };
  AQ.acts['tech-rec'] = () => AQ.overlay('<div class="mh"><h2>Записать</h2><button class="pill ico" data-act="close" aria-label="Закрыть">✕</button></div><div style="display:grid;gap:10px"><label>Что записать<select id="tk" style="width:100%"><option>Заправка</option><option>Моточасы</option><option>ТО</option><option>Поломка</option></select></label><label>Машина<select style="width:100%">' + AQ.D.equipment.map((e) => '<option>' + esc(e.n) + '</option>').join('') + '</select></label><label>Значение<input id="tv" style="width:100%" value="85"></label></div><div class="btns"><button class="btn pri" data-act="tech-save">Записать</button></div>');
  AQ.acts['tech-save'] = () => { const k = $('#tk').value, v = $('#tv').value; AQ.closeLayer(); AQ.toast(({ 'Заправка': 'Заправка записана: ' + v + ' л в расходы. Деньги по машине обновлены', 'Моточасы': 'Моточасы записаны: +' + v + ' ч. Срок следующего ТО пересчитан', 'ТО': 'ТО записано. Следующее ТО через 250 моточасов', 'Поломка': 'Поломка записана: машина на ремонте, механику ушло уведомление' })[k]); };

  /* ---------- Снабженец: Панель управления · Поставщики (+ ссылки на «Поиск цен» и «Запросы и ответы») ---------- */
  const supTabs = (cur) => stabs('money/sup', [['panel', 'Панель управления'], ['price', 'Поиск цен', 'money/price'], ['suppliers', 'Поставщики', 'money/sup/suppliers'], ['out', 'Запросы и ответы', 'money/out']], cur);
  S.sup = function (rt, ctx) {
    const cur = rt.sub[0] || 'panel', d = D3();
    if (cur === 'suppliers') return head(rt) + supTabs('suppliers') + tile('Поставщики компании', tbl(['Поставщик', 'Группа', 'Город', 'Последний ответ', 'Контакты'], d.suppliersReg) + '<div class="btns"><button class="btn pri" data-toast="Поставщик добавлен: письма можно отправлять из «Запросов и ответов»">＋ Добавить поставщика</button></div>') + AQ.wasBlock(rt.tObj);
    const now = tile('Сейчас сделать <span class="tag t-warn" style="margin-left:6px">' + d.supplierNow.length + '</span>', '<p class="mut" style="margin-bottom:8px">Из запросов и прайсов — только то, что система знает точно.</p>' + d.supplierNow.map((x) => `<div class="row"><div><b>${esc(x[0])}</b><small>${esc(x[1])}</small></div><button class="btn sm pri" data-toast="Запрос цен отправлен поставщикам группы: ответы появятся в «Запросах и ответах»">Запросить</button></div>`).join(''), 's12');
    return head(rt) + supTabs('panel') + `<div class="kpis3" style="margin-bottom:14px"><div><span>Заявки с проектов</span><b class="mono">нет</b></div><div><span>Ответы поставщиков</span><b class="mono ok">3 новых</b></div><div><span>Не хватает на проектах</span><b class="mono warn">арматура</b></div></div><div class="bento">${now}</div>` + bodyOf(old.sup(fake(rt, []), ctx)).replace('<div class="bento">', '<div class="bento" style="margin-top:14px">') + AQ.wasBlock(rt.tObj);
  };

  /* ---------- Тендеры: Лента · Проверить своё объявление ---------- */
  S.tender = function (rt, ctx) {
    const sub = rt.sub[0], d = D3(), items = [['feed', 'Лента тендеров'], ['check', 'Проверить своё объявление']];
    if (sub === 'check') {
      const c = d.tenderCheck;
      return head(rt) + stabs('sales/tender', items, 'check') + `<div class="bento"><div class="tile s5"><div class="lbl"><span>Своё объявление</span></div><label>Название или ссылка<input id="tcn" style="width:100%" value="${esc(c.title)}"></label><label style="display:block;margin-top:10px">Сумма лота<input style="width:100%" value="${esc(c.sum)}"></label><div class="drop" style="margin-top:12px;padding:14px">Или перетащите файл объявления: PDF, Word</div><div class="btns"><button class="btn pri" data-act="tender-check">Проверить</button></div></div><div class="tile s7" id="tcr"><p class="mut">Результат появится здесь: сверка требований с тендерной документацией компании и ответ, участвовать или нет.</p></div></div>` + AQ.wasBlock(rt.tObj);
    }
    const body = old.tender(rt, ctx);
    const src = tile('Источники · найдено сегодня', '<div class="btns" style="margin-top:0">' + d.sources.map((s) => `<span class="tag t-mute">${esc(s[0])} · ${s[1]}</span>`).join('') + '</div>' + note('Список целиком загружается раз в день; не ответивший источник запрашивается повторно до трёх раз.'));
    return body.replace(/(<div class="tabs sc"[\s\S]*?<\/div>)/, '$1' + stabs('sales/tender', items, 'feed')) + '<div style="margin-top:14px">' + src + '</div>';
  };
  AQ.acts['tender-check'] = () => { const c = D3().tenderCheck; $('#tcr').innerHTML = `<div class="lbl"><span>${esc($('#tcn').value || c.title)}</span>${chip(c.verdict, 't-warn')}</div>${c.reqs.map((r) => `<div class="row"><div>${esc(r[0])}</div>${chip(r[1], r[1] === 'Есть' ? 't-ok' : r[1].indexOf('Внимание') === 0 ? 't-warn' : 't-bad')}</div>`).join('')}<p style="margin-top:10px"><b>Почему:</b> ${esc(c.why)}</p><div class="btns"><button class="btn pri" data-doc="tender-pack">Подготовить заявку</button>${AQ.lnk('sales/passport', 'Паспорт компании')}</div>`; };

  /* ---------- Спрос по рынку ---------- */
  S.demand = function (rt) {
    const R = D3().demandResult;
    return head(rt) + `<div class="bento"><div class="tile s5"><div class="lbl"><span>Что анализировать</span></div><label>Регион<select style="width:100%">${R.regions.map((r) => `<option>${esc(r)}</option>`).join('')}</select></label><label style="display:block;margin-top:10px">Особый фокус (необязательно)<input style="width:100%" placeholder="Например: склады, реконструкция"></label><div class="btns"><button class="btn pri" data-act="demand-go">Проанализировать спрос</button></div>${note('Глубокий разбор по 3 направлениям поиска и общий вывод. Результат хранится 3 дня. Данные из живых источников.')}</div><div class="tile s7" id="dres"><p class="mut">Нажмите «Проанализировать спрос»: система посмотрит, что сейчас больше всего строят и заказывают, и посоветует, какие проекты выгоднее брать.</p></div></div>` + AQ.wasBlock(rt.tObj);
  };
  AQ.acts['demand-go'] = () => { const R = D3().demandResult; $('#dres').innerHTML = `<div class="lbl"><span>Разбор спроса · 16.11.2026</span><span class="tag t-ok">хранится 3 дня</span></div>${R.dirs.map((x) => `<div class="row"><div><b>${esc(x.t)}</b><small>${esc(x.txt)}</small></div></div>`).join('')}<p style="margin-top:10px"><b>Вывод:</b> ${esc(R.verdict)}</p><div class="btns">${AQ.lnk('sales/tender', 'Смотреть тендеры', 'btn pri')}</div>`; };

  /* ---------- Архитектор: Концепт · Генплан участка · Концепты · 3D-модель ---------- */
  S.concept = function (rt, ctx) {
    const cur = rt.sub[0] || 'concept', d = D3(), items = [['concept', 'Новый концепт'], ['plot', 'Генплан участка'], ['saved', 'Концепты']];
    let h = head(rt) + stabs('sales/concept', items, cur);
    if (cur === 'concept') return h + bodyOf(old.concept(fake(rt, []), ctx)) + AQ.wasBlock(rt.tObj);
    if (cur === 'plot') {
      const p = d.plot, k = 9, b = p.build;
      h += tile('Генплан участка · ' + p.w + '×' + p.h + ' м', `<svg viewBox="0 0 ${p.w * k + 60} ${p.h * k + 60}" class="plansvg" aria-label="Генплан"><g transform="translate(30,30)"><rect width="${p.w * k}" height="${p.h * k}" fill="rgba(53,196,122,.06)" stroke="var(--ok)" stroke-width="1.6"/><rect x="${3 * k}" y="${3 * k}" width="${(p.w - 6) * k}" height="${(p.h - 6) * k}" fill="none" stroke="var(--mute)" stroke-dasharray="5 4"/><rect x="${b[0] * k}" y="${b[1] * k}" width="${b[2] * k}" height="${b[3] * k}" fill="rgba(242,107,29,.18)" stroke="var(--acc)" stroke-width="2"/><text x="${(b[0] + b[2] / 2) * k}" y="${(b[1] + b[3] / 2) * k}" text-anchor="middle" font-size="11" fill="currentColor">Дом ${b[2]}×${b[3]}</text><text x="${p.w * k / 2}" y="-10" text-anchor="middle" font-size="10" fill="var(--mute)" font-family="JetBrains Mono, monospace">${p.w} 000</text><path d="M${p.w * k - 20} ${p.h * k - 10} l0 -24 m-5 8 l5 -8 l5 8" stroke="var(--blue)" fill="none" stroke-width="1.6"/><text x="${p.w * k - 20}" y="${p.h * k + 8}" text-anchor="middle" font-size="10" fill="var(--blue)">С</text></g></svg>` + note(p.note));
    } else if (cur === 'saved') {
      h += tile('Сохранённые концепты', tbl(['Концепт', 'Проект', 'Дата', 'Стоимость'], d.concepts, { r: [3] }) + '<div class="btns"><a class="btn pri" href="#/sales/concept">Новый концепт</a><a class="btn" href="#/sales/concept/3d">3D-модель</a></div>');
    } else {
      const s = 17, X = (x, y, z) => [260 + (x - y) * .866 * s, 210 + (x + y) * .5 * s - z * s], P = (pts, fill, stroke) => `<polygon points="${pts.map((q) => X(...q).map((v) => v.toFixed(1)).join(',')).join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="1.6" stroke-linejoin="round"/>`;
      h += tile('3D-модель концепта · дом 10×12 м', `<svg viewBox="0 0 520 330" class="plansvg" aria-label="3D-модель">${P([[0, 12, 0], [10, 12, 0], [10, 12, 6], [0, 12, 6]], 'rgba(111,163,255,.12)', 'var(--blue)')}${P([[10, 12, 0], [10, 0, 0], [10, 0, 6], [10, 12, 6]], 'rgba(111,163,255,.2)', 'var(--blue)')}${P([[0, 12, 6], [10, 12, 6], [10, 6, 9], [0, 6, 9]], 'rgba(242,107,29,.28)', 'var(--acc)')}${P([[10, 12, 6], [10, 0, 6], [10, 6, 9]], 'rgba(242,107,29,.4)', 'var(--acc)')}</svg>` + note('Вращение и разрезы доступны в Архитекторе. Модель можно сохранить к проекту.') + '<div class="btns"><button class="btn pri" data-toast="Модель сохранена к проекту «Коттедж в BI Village»">Сохранить модель к проекту</button></div>');
    }
    return h + AQ.wasBlock(rt.tObj);
  };

  /* ---------- Задачи: Мои · Команда ---------- */
  S.tasks = function (rt, ctx) {
    const cur = rt.sub[0] || 'mine', d = D3();
    if (cur === 'team') return head(rt) + stabs('tasks/mine', [['mine', 'Мои'], ['issued', 'Выданные мной', 'tasks/issued'], ['team', 'Команда']], 'team') + tile('Задачи команды', d.teamTasks.map((m) => `<div class="stk"><span><b>${esc(m.who)}</b><small class="mut" style="display:block">${esc(m.role)}</small></span><div class="stkb"><i class="f" style="width:${m.done / (m.done + m.open) * 100}%;background:var(--ok)"></i></div><b class="mono">${m.done} сдано · ${m.open} в работе${m.late ? ' · <span class="bad">' + m.late + ' просрочена</span>' : ''}</b></div>`).join('') + '<div class="btns">' + AQ.lnk('tasks/issued', 'Выдать задание', 'btn pri') + '</div>') + AQ.wasBlock(rt.tObj);
    return old.tasks(rt, ctx).replace(/(<div class="tabs sc"[\s\S]*?<\/div>)/, '$1' + stabs('tasks/mine', [['mine', 'Мои'], ['issued', 'Выданные мной', 'tasks/issued'], ['team', 'Команда']], 'mine'));
  };

  /* ---------- Проекты: фильтры и «Сроки по всем проектам» ---------- */
  S.projects = function (rt, ctx) {
    if (rt.sub[0] === 'p') return old.projects(rt, ctx);
    if (rt.sub[0] === 'timeline') {
      const T = D3().timeline;
      return head(rt) + stabs('projects/list', [['list', 'Список'], ['timeline', 'Сроки по всем проектам']], 'timeline') + tile('Сроки по всем проектам', '<div class="gantt">' + T.map((p) => `<div class="gr"><div class="gl">${esc(p.n)}<small>${p.pct} %${p.late ? ' · отставание ' + p.late + ' дн.' : ''}</small></div><div class="gtrack"><div class="gbar${p.late ? ' late' : ''}" style="left:${p.from / 12 * 100}%;width:${p.len / 12 * 100}%"><i style="width:${p.pct}%"></i></div></div></div>`).join('') + '</div>') + AQ.wasBlock(rt.tObj);
    }
    const f = AQ.ui.pf || 'all', D = AQ.D, cnt = { all: D.projects.length, attn: D.projects.filter((p) => p.late).length, ok: D.projects.filter((p) => p.status === 'В работе' && !p.late).length, done: D.projects.filter((p) => p.status !== 'В работе').length };
    const list = D.projects.filter((p) => f === 'all' || (f === 'attn' && p.late) || (f === 'ok' && p.status === 'В работе' && !p.late) || (f === 'done' && p.status !== 'В работе'));
    return head(rt) + stabs('projects/list', [['list', 'Список'], ['timeline', 'Сроки по всем проектам']], 'list') + `<div class="btns" style="margin:0 0 14px"><button class="btn pri" data-act="new-project">＋ Добавить проект</button>${[['all', 'Все'], ['attn', 'Требуют внимания'], ['ok', 'По графику'], ['done', 'Завершённые']].map((x) => `<button class="btn sm${f === x[0] ? ' pri' : ''}" data-act="pf" data-f="${x[0]}">${x[1]} ${cnt[x[0]]}</button>`).join('')}</div><div class="prj" style="grid-template-columns:repeat(auto-fill,minmax(260px,1fr))">${list.map(AQ.projCard).join('') || '<p class="mut">Нет проектов в этой группе.</p>'}</div>` + AQ.wasBlock(rt.tObj);
  };
  AQ.acts['pf'] = (t) => { AQ.ui.pf = t.getAttribute('data-f'); AQ.render(); };

  /* ---------- Сводка по компании ---------- */
  S.summary = function (rt, ctx) {
    const D = AQ.D, d = D3();
    return head(rt) + `<div class="tile" style="margin-bottom:14px"><p>Сводка со всех разделов по проектам: финансы, отклонения, работы, документы, техника. Пока страница открыта, цифры пересчитываются по файлам Google Диска каждую минуту.</p><div class="btns"><button class="btn pri" data-toast="Сводка пересобрана: файлы расходов с Диска прочитаны по 4 проектам">Пересобрать сводку</button><span class="mut" style="align-self:center;font-size:12px">Посчитано 16.11.2026, 15:31 · новое с Диска подгружается каждую минуту</span></div></div><div class="kpis3" style="margin-bottom:14px"><div><span>Баланс портфеля, млн ₸</span><b class="mono warn">−12,1</b><small class="mut">приход 750,3 − расход 763,4</small></div><div><span>Проектов в работе</span><b class="mono">2</b><small class="mut">в минусе 1 · в плюсе 1</small></div><div><span>Техника по ТО</span><b class="mono bad">1</b><small class="mut">просрочено 1 · в ноль 0</small></div></div>` + bodyOf(old.summary(fake(rt, []), ctx)) + AQ.wasBlock(rt.tObj);
  };

  /* ---------- Паспорт, реквизиты: загрузка документов компании ---------- */
  const qual = () => tile('Документы компании для тендеров', `<div class="drop">Перетащите документы сюда: PDF, Word, Excel или фото. Поля заполнятся сами.<div class="btns" style="justify-content:center"><button class="btn pri" data-toast="Документы загружены: лицензия СМР и справка об обороте распознаны, поля заполнены">Выбрать файлы</button></div></div><div class="lbl" style="margin:14px 0 6px"><span>Отбор тендеров ограничен: не хватает сведений</span></div><div class="row"><span class="tag t-warn">!</span><div><b>Лицензия СМР</b><small>номер, категория, подвиды работ: вид работ лота не сверяется, строительные лоты показаны как «возможно подходит»</small></div></div><div class="row"><span class="tag t-warn">!</span><div><b>Годовой оборот</b><small>без него не проверяется требование к обороту участника</small></div></div>${note('Значения берутся только с цитатой из документа; заполненное поле документ не перезаписывает, расхождение показывается на выбор.')}`);
  S.passport = function (rt, ctx) { return old.passport(rt, ctx) + '<div style="margin-top:14px">' + qual() + '</div>'; };
  S.req = function (rt, ctx) { return old.req(rt, ctx) + '<div style="margin-top:14px">' + qual() + '</div>'; };

  /* ---------- Google Диск ---------- */
  S.drive = function (rt, ctx) {
    const d = D3();
    if (AQ.ui.drive) return old.drive(rt, ctx).replace('</div></div>', '</div></div>') + `<div class="btns"><button class="btn pri" data-toast="Диск проверен: найдено 3 новых файла, привязать можно выше">Проверить сейчас</button><button class="btn" data-act="drive-off">Отключить</button></div>`;
    return head(rt) + `<div class="bento"><div class="tile s7"><div class="lbl"><span>Свой Google Диск</span><span class="tag t-mute">не подключён</span></div><p style="margin-bottom:10px">AIQurylys читает ваши ведомости и чертежи прямо из вашего Google Диска. Копировать файлы к нам не нужно, заводить ключи тоже: достаточно поделиться папкой. До подключения проекты можно вести загрузкой файлов вручную.</p>${d.driveSteps.map((s, i) => `<div class="step"><span class="n">${i + 1}</span><div><b>${esc(s[0])}</b><small>${esc(s[1])}</small></div></div>`).join('')}<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap"><input style="flex:1;min-width:220px" value="drive-reader@aiqurylys.example" readonly><button class="btn" data-toast="Адрес робота скопирован">Скопировать</button></div><div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap"><input style="flex:1;min-width:220px" placeholder="Ссылка на папку проекта"><button class="btn pri" data-act="drive-on">Проверить сейчас</button></div></div><div class="tile s5"><div class="lbl"><span>Что видит робот</span></div><p class="mut">Только то, чем вы с ним поделились, и только на чтение. Новые файлы находятся сами, сводка пересчитывается по ним каждую минуту.</p></div></div>` + AQ.wasBlock(rt.tObj);
  };
  AQ.acts['drive-on'] = () => { AQ.ui.drive = true; AQ.render(); AQ.toast('Папка подключена: найдено 137 файлов в 3 проектах'); };
  AQ.acts['drive-off'] = () => { AQ.ui.drive = false; AQ.render(); AQ.toast('Диск отключён'); };

  /* ---------- Помощь: Пошаговая инструкция · Статьи · Словарь · Чеклисты · Курсы ---------- */
  AQ.screens._help = function (rt) {
    const D = AQ.D, cur = rt.sub[0] || 'guide', f = D.faq;
    const items = [['guide', 'Пошаговая инструкция'], ['articles', 'Статьи'], ['glossary', 'Словарь'], ['checklists', 'Чеклисты'], ['courses', 'Курсы']];
    let h = AQ.head('Инструкция', 'Выберите, что хотите сделать: путеводитель покажет, что подготовить, и проверит готовность.', '<a href="#/home/today">Главная</a> / Инструкция', '<div class="tabs sc">' + items.map((t) => `<a class="tab${t[0] === cur ? ' on' : ''}" href="#/help/${t[0]}">${t[1]}</a>`).join('') + '</div>');
    if (cur === 'guide') { const done = D.guide.filter((g) => g.done).length; h += `<div class="tile guide" style="margin-bottom:14px"><b>${done} из ${D.guide.length} шагов</b><div class="bar"><i style="width:${done / D.guide.length * 100}%"></i></div></div><div class="steps">${D.guide.map((g, i) => `<a class="step${g.done ? ' done' : ''}" href="#/${g.go === 'bot' ? 'bot' : (AQ.canRoute(g.go) ? g.go : 'help')}"><span class="n">${g.done ? '✓' : i + 1}</span><div><b>${esc(g.t)}</b><small>${esc(g.d)}</small></div><span class="mut">→</span></a>`).join('')}</div>`; }
    else if (cur === 'articles') h += `<div class="tile">${f.articles.map((a) => `<div class="row"><div><b>${esc(a[0])}</b><small>${esc(a[1])}</small></div><span class="tag t-mute">${esc(a[2])}</span><button class="btn sm" data-toast="Статья открыта: «${esc(a[0])}»">Читать</button></div>`).join('')}</div>`;
    else if (cur === 'glossary') h += tbl(['Термин', 'Что это'], D.glossary);
    else if (cur === 'checklists') h += `<div class="bento">${f.checklists.map((c) => `<div class="tile s4"><div class="lbl"><span>${esc(c[0])}</span></div>${c[1].map((x) => `<label class="row" style="cursor:pointer"><input type="checkbox" style="width:18px;height:18px"><div>${esc(x)}</div></label>`).join('')}</div>`).join('')}</div>`;
    else h += `<div class="prj" style="grid-template-columns:repeat(auto-fill,minmax(240px,1fr))">${f.courses.map((c, i) => `<div class="pj"><div class="in"><b>${esc(c[0])}</b><small><span>${esc(c[1])}</span><span>${esc(c[2])}</span></small><div class="bar"><i style="width:${[0, 25, 100, 0][i]}%"></i></div><div class="btns"><button class="btn sm pri" data-toast="Курс открыт: «${esc(c[0])}»">${i === 2 ? 'Повторить' : 'Начать'}</button></div></div></div>`).join('')}</div>`;
    return h;
  };

  /* ---------- Профиль и настройки ---------- */
  AQ.screens._profile = function () {
    const r = AQ.role(), d = D3(), light = document.documentElement.getAttribute('data-theme') === 'light';
    return AQ.head('Профиль и настройки', 'Вход, вид экранов и Telegram-бот.', '<a href="#/home/today">Главная</a> / Профиль') + `<div class="bento"><div class="tile s6"><div class="lbl"><span>Профиль</span></div><div style="display:grid;gap:10px"><label>Имя<input style="width:100%" value="${esc(r.name)}"></label><label>Почта<input style="width:100%" value="demo@aiqurylys.kz"></label></div><div class="btns"><button class="btn pri" data-toast="Профиль сохранён">Сохранить</button></div></div>
      <div class="tile s6"><div class="lbl"><span>Смена пароля</span></div><div style="display:grid;gap:10px"><label>Текущий пароль<input type="password" style="width:100%"></label><label>Новый пароль<input type="password" style="width:100%"></label><label>Повторите новый<input type="password" style="width:100%"></label></div>${note('Не короче 8 символов. После смены вы выйдете на этом устройстве и войдёте заново.')}<div class="btns"><button class="btn pri" data-toast="Пароль изменён. Войдите заново на этом устройстве">Сменить пароль</button></div></div>
      <div class="tile s6"><div class="lbl"><span>Вид и подсказки</span></div><p class="mut" style="margin-bottom:8px">Настройки привязаны к вам, а не к браузеру.</p><div class="row"><div><b>Тема оформления</b></div><button class="btn sm${light ? '' : ' pri'}" data-act="theme-set" data-t="dark">Ночь</button><button class="btn sm${light ? ' pri' : ''}" data-act="theme-set" data-t="light">День</button></div>${d.profile.hints.map((h) => `<label class="row" style="cursor:pointer"><div><b>${esc(h)}</b></div><input type="checkbox" checked style="width:18px;height:18px"></label>`).join('')}<div class="btns"><button class="btn" data-toast="Инструкции показаны заново: подсказки появятся при открытии разделов">Показать инструкции заново</button></div></div>
      <div class="tile s6"><div class="lbl"><span>Telegram-бот</span></div><p class="mut">Задачи, объёмы и вопросы из мессенджера. Вход по коду от руководителя.</p><div class="btns"><a class="btn pri" href="#/bot">Открыть бот</a></div></div></div>`;
  };
  AQ.acts['theme-set'] = (t) => { document.documentElement.setAttribute('data-theme', t.getAttribute('data-t')); AQ.store.set('aq02_theme', t.getAttribute('data-t')); AQ.render(); };

  /* ---------- Главная без данных: «Начало работы» ---------- */
  S.home = function (rt, ctx) {
    if (AQ.state.demo) return old.home(rt, ctx);
    const r = AQ.role(), s = AQ.D.start3, tb = AQ.tabsOf(rt.sObj).length > 1 ? AQ.tabBar(rt.sObj, rt.tab) : '';
    return AQ.head(AQ.greet() + ', ' + esc(r.name.split(' ')[0]), 'Кабинет пока пустой, как у нового клиента. Начните с первого шага или посмотрите всё на демо-компании.', '<span>Главная · Сегодня</span>', tb) + `<div class="bento"><div class="tile s7"><div class="lbl"><span>Начало работы · шаг 1 из 3</span></div><h2 style="font-size:20px">${esc(s[0][0])}</h2><p class="mut" style="margin:6px 0 12px">${esc(s[0][1])}</p><div class="btns" style="margin-top:0">${AQ.canRoute('calc/est') ? '<a class="btn pri" href="#/calc/est/new">Загрузить файлы раздела</a>' : '<a class="btn pri" href="#/projects/list">Открыть проекты</a>'}<button class="btn" data-act="demo-on">Показать на демо-компании</button></div>${note('Пробный расчёт — один раз: файл до 15 МБ.')}</div><div class="tile s5 guide"><div class="lbl"><span>Как начать работу</span></div><b>0 из 3 готово</b><div class="bar"><i style="width:0"></i></div>${s.map((x, i) => `<div class="step"><span class="n">${i + 1}</span><div><b>${esc(x[0])}</b><small>${esc(x[1])}</small></div></div>`).join('')}</div></div>`;
  };
})();
