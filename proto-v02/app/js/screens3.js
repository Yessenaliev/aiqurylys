/* v0.4: законченные экраны. Расчёты, деньги и снабжение, договоры, тендеры, компания, документы-превью. */
(function () {
  'use strict';
  const AQ = window.AQ, S = AQ.screens, esc = AQ.esc, fmt = AQ.fmt;
  const $ = AQ.$, $$ = AQ.$$, tbl = (...a) => AQ.tbl(...a);
  const head = (rt) => AQ.tabHead(rt);
  const mln = (n) => String(n.toFixed(1)).replace('.', ',');
  const money = (n) => fmt(n) + ' ₸';

  /* ---------- графические элементы ---------- */
  function hb(rows) {
    const max = Math.max.apply(null, rows.map((r) => r.v));
    return '<div class="hbs">' + rows.map((r) => `<div class="hb${r.hi ? ' hi' : ''}"><span>${esc(r.l)}</span><div class="hbt"><i style="width:${(r.v / max * 100).toFixed(1)}%"></i></div><b>${r.note}</b></div>`).join('') + '</div>';
  }
  function spark(vals, w, h, col) {
    w = w || 180; h = h || 44; const mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals), sp = mx - mn || 1;
    const pts = vals.map((v, i) => [i / (vals.length - 1) * (w - 6) + 3, h - 4 - (v - mn) / sp * (h - 10)]);
    const last = pts[pts.length - 1];
    return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true"><polyline fill="none" stroke="${col || 'var(--blue)'}" stroke-width="2" points="${pts.map((p) => p.join(',')).join(' ')}"/><circle cx="${last[0]}" cy="${last[1]}" r="3.5" fill="var(--acc)"/></svg>`;
  }
  function donut(pct, size, label, col) {
    const r = 42, c = 2 * Math.PI * r;
    return `<svg width="${size || 120}" height="${size || 120}" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="${r}" fill="none" stroke="var(--panelb)" stroke-width="10"/><circle cx="50" cy="50" r="${r}" fill="none" stroke="${col || 'var(--acc)'}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${(c * pct / 100).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 50 50)"/><text x="50" y="${label ? 49 : 56}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="700" font-size="19" fill="currentColor">${pct}%</text>${label ? `<text x="50" y="64" text-anchor="middle" font-size="8.5" fill="var(--mute)">${esc(label)}</text>` : ''}</svg>`;
  }
  const paper = (inner, foot) => `<div class="paper">${inner}${foot ? `<div class="pfoot">${foot}</div>` : ''}</div>`;
  const chip = (t, cls) => `<span class="tag ${cls || 't-mute'}">${esc(t)}</span>`;
  const stars = (r) => `<span class="stars" title="${r}">${'★'.repeat(Math.round(r))}<i>${'★'.repeat(5 - Math.round(r))}</i></span> <b class="mono">${String(r).replace('.', ',')}</b>`;
  const req = () => AQ.D.requisites;

  /* ---------- документы-превью (модальное окно) ---------- */
  function xl(title, cols, rows, opts) {
    opts = opts || {};
    const L = 'ABCDEFGH'.split('');
    return `<div class="xl"><div class="xlbar"><b>fx</b><span>${esc(opts.formula || '')}</span></div><div class="xlw"><table><thead><tr><th></th>${cols.map((c, i) => `<th>${L[i]}</th>`).join('')}</tr></thead><tbody><tr><td class="rn">1</td><td colspan="${cols.length}" class="xt">${esc(title)}</td></tr><tr><td class="rn">2</td>${cols.map((c) => `<td class="xh">${esc(c)}</td>`).join('')}</tr>${rows.map((r, i) => `<tr><td class="rn">${i + 3}</td>${r.map((c, j) => `<td class="${typeof c === 'number' || /^[\d\s,. %+−-]+$/.test(String(c)) ? 'r' : ''}${opts.boldLast && i >= rows.length - (opts.boldLast) ? ' xb' : ''}">${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div><div class="xtabs">${(opts.tabs || ['Лист1']).map((t, i) => `<span class="${i === 0 ? 'on' : ''}">${esc(t)}</span>`).join('')}</div></div>`;
  }
  const R = () => AQ.D.estResult;
  const DOCS = {
    'est-xlsx': () => {
      const r = R(), rows = r.rows.map((x, i) => [i + 1, x[0] + (x[5] ? ' (Оценка)' : ''), (x[1] % 1 ? String(x[1]).replace('.', ',') : fmt(x[1])) + ' ' + x[2], fmt(x[3]), fmt(x[4])]);
      rows.push(['', 'Итого по разделу КЖ', '', '', fmt(r.cost)], ['', 'Наценка 20 %', '', '', fmt(Math.round(r.cost * .2))], ['', 'НДС 16 %', '', '', fmt(r.price - Math.round(r.cost * 1.2))], ['', 'Цена для заказчика', '', '', fmt(r.price)]);
      return { file: 'КЖ_Фундаменты_смета.xlsx', body: xl('Локальная смета · КЖ · Фундаменты — Складской комплекс', ['№', 'Работы и материалы', 'Кол-во', 'Цена, ₸', 'Стоимость, ₸'], rows, { formula: '=СУММ(E3:E11)  →  ' + fmt(r.cost), tabs: ['Смета', 'Ведомость материалов', 'Сводка'], boldLast: 4 }) };
    },
    'est-docx': () => ({ file: 'КЖ_Фундаменты_смета.docx', body: estPaper('Word') }),
    'est-pdf': () => ({ file: 'КЖ_Фундаменты_смета.pdf', body: estPaper('PDF · стр. 1 из 3') }),
    'check-xlsx': () => ({ file: 'Замечания_к_смете.xlsx', body: xl('Замечания к смете «КП_подрядчика.xlsx»', ['№', 'Вид', 'Замечание', 'Сумма, ₸'], AQ.D.checkFindings.map((f, i) => [i + 1, f.k, f.t, f.sum ? f.sign + fmt(f.sum) : '—']), { formula: 'Итого к исправлению: 622 400 ₸', tabs: ['Замечания', 'Строки со ссылками'] }) }),
    'fin-xlsx': () => { const F = AQ.D.finance; return { file: 'Финансовый_отчёт.xlsx', body: xl('Финансовый отчёт · БДР и БДДС, млн ₸', ['Месяц', 'БДР план', 'БДР факт', 'БДДС план', 'БДДС факт'], F.months.map((m, i) => [m, F.bdrPlan[i], F.bdrFact[i] || '—', F.cashPlan[i], F.cashFact[i] || '—']), { formula: '=СУММ(C3:C7)  →  ' + F.bdrFact.reduce((a, b) => a + b, 0), tabs: ['БДР', 'БДДС', 'Налоги 2026'] }) }; },
    'contract-docx': () => ({ file: 'Договор_субподряда_14_с_правками.docx', body: contractPaper() }),
    'act-2v': () => ({ file: 'Акт_2В_октябрь_2026.docx', body: actPaper() }),
    'naryad': () => ({ file: 'Наряд-задание_14.11.2026.docx', body: naryadPaper() }),
    'pay-pack': () => ({ file: 'Пакет_на_оплату_октябрь.xlsx', body: xl('Пакет на оплату · Мебельный цех · октябрь 2026', ['Документ', 'Номер', 'Дата', 'Сумма, ₸'], [['Акт приёмки (2В)', '8', '31.10.2026', '41 200 000'], ['Справка об объёмах', '8', '31.10.2026', '—'], ['Справка о стоимости', '8', '31.10.2026', '41 200 000'], ['Счёт на оплату', '118', '31.10.2026', '41 200 000']], { formula: 'Реквизиты подставлены из карточки компании', tabs: ['Акт 2В', 'Справка об объёмах', 'Справка о стоимости'] }) }),
    'hidden-pack': () => ({ file: 'Акты_скрытых_работ_пакет.zip', body: `<div class="ziplist">${['Армирование колонн, оси А–Д', 'Бетонирование плиты перекрытия', 'Гидроизоляция фундамента', 'Кладка 1 этажа', 'Монтаж перемычек', 'Устройство ростверка'].map((t, i) => `<div class="row"><span class="tag t-ok">✓</span><div><b>Акт скрытых работ №${i + 1}</b><small>${t} · подписи: прораб, технадзор, заказчик</small></div><span class="mono mut">${(180 + i * 12)} КБ</span></div>`).join('')}</div>` }),
    'tender-pack': () => ({ file: 'Заявка_Склад_Караганда.zip', body: tenderPack() })
  };
  function estPaper(kind) {
    const r = R();
    return paper(`<div class="ph"><b>${esc(req()[0][1])}</b><span>БИН ${esc(req()[1][1])}</span></div><h3 class="pt">Локальная смета · КЖ · Фундаменты</h3><p class="mut">Объект: Складской комплекс (Мебельный склад), Астана</p>` + tbl(['Работы и материалы', 'Кол-во', 'Цена', 'Стоимость, ₸'], r.rows.slice(0, 5).map((x) => [x[0], (x[1] % 1 ? String(x[1]).replace('.', ',') : fmt(x[1])) + ' ' + x[2], fmt(x[3]), fmt(x[4])]), { r: [1, 2, 3] }) + `<p class="mut" style="margin:8px 0">… ещё 4 строки, всего 9 позиций</p><div class="ptot"><span>Итого по разделу</span><b>${money(r.cost)}</b></div><div class="ptot acc"><span>Цена для заказчика, с НДС 16 %</span><b>${money(r.price)}</b></div>`, kind);
  }
  function actPaper() {
    return paper(`<div class="ph"><b>${esc(req()[0][1])}</b><span>БИН ${esc(req()[1][1])} · ${esc(req()[2][1])}</span></div><h3 class="pt">АКТ № 8 приёмки выполненных работ (форма 2В)</h3><p class="mut">Объект: Мебельный цех, Астана · Период: 01.10.2026 — 31.10.2026 · Заказчик: ТОО «Мебель-Групп»</p>` + tbl(['Работа', 'Ед.', 'Объём', 'Цена, ₸', 'Стоимость, ₸'], [['Кладка наружных стен', 'м³', '246', '38 000', '9 348 000'], ['Армирование колонн', 'т', '1,2', '385 000', '462 000'], ['Устройство перемычек', 'шт.', '38', '14 500', '551 000']], { r: [2, 3, 4] }) + `<div class="ptot"><span>Итого по акту</span><b>${money(10361000)}</b></div><div class="sign"><div><span>Подрядчик</span><i></i>${esc(req()[5][1])}</div><div><span>Заказчик</span><i></i>_______________</div></div>`, 'Реквизиты подставлены автоматически · Word');
  }
  function naryadPaper() {
    const m = AQ.D.master;
    return paper(`<div class="ph"><b>${esc(req()[0][1])}</b><span>Наряд-задание № 14 от ${m.date}</span></div><h3 class="pt">Наряд-задание бригаде · ${esc(m.brigade)}</h3><p class="mut">Ответственный: ${esc(m.foreman)}</p>` + tbl(['Работа', 'План', 'Ед.'], m.works.map((w) => [w.t, String(w.plan).replace('.', ','), w.unit]), { r: [1] }) + `<p class="mut" style="margin-top:10px">Состав бригады: ${m.crew.map((c) => c[0]).join(', ')}</p><div class="sign"><div><span>Выдал</span><i></i>Начальник участка</div><div><span>Принял</span><i></i>${esc(m.foreman)}</div></div>`, 'Word');
  }
  function contractPaper() {
    const C = AQ.D.contract;
    return paper(`<h3 class="pt">${esc(C.n)}</h3><p class="mut">г. Астана · с правками юриста</p>` + C.clauses.map((c, i) => { const e = C.edits[i]; return `<p><b>${esc(c.h)}.</b> <del>${esc(e.now)}</del> <ins>${esc(e.to)}</ins></p><p class="mut" style="font-size:11px">Основание правки: ${esc(e.base)}</p>`; }).join(''), 'Word · показаны отметки правок');
  }
  function tenderPack() {
    const items = [['Заявка на участие', 'ok'], ['Лицензия II категории', 'ok'], ['Опыт: 2 объекта на сумму от 100 млн ₸', 'ok'], ['Справка об обороте за 3 года', 'miss'], ['Справка об отсутствии налоговой задолженности', 'warn'], ['Ценовое предложение (смета, 142 млн ₸)', 'ok']];
    return `<div class="ziplist">${items.map((i) => `<div class="row"><span class="tag ${i[1] === 'ok' ? 't-ok' : i[1] === 'warn' ? 't-warn' : 't-bad'}">${i[1] === 'ok' ? '✓' : i[1] === 'warn' ? '!' : '✕'}</span><div><b>${esc(i[0])}</b>${i[1] === 'miss' ? '<small class="bad">Не хватает: загрузите до подачи заявки</small>' : i[1] === 'warn' ? '<small class="warn">Срок справки истекает 30.11.2026</small>' : ''}</div></div>`).join('')}</div><p class="mut" style="margin-top:10px">Готово 4 из 6 документов. Подача до 16.11.2026, 18:00.</p>`;
  }
  AQ.DOCS = DOCS; AQ.xl = xl; AQ.paper = paper; AQ.hb = hb; AQ.donut = donut; AQ.stars = stars; AQ.chip = chip; AQ.spark = spark;
  AQ.openDoc = function (kind) {
    const d = DOCS[kind]; if (!d) return; const x = d();
    AQ.overlay(`<div class="mh"><div><h2 style="font-size:16px">${esc(x.file)}</h2><span class="mut" style="font-size:12px">Сохранено в «Загрузки» · ${AQ.reduced ? '' : ''}демо-документ</span></div><button class="pill ico" data-act="close" aria-label="Закрыть">✕</button></div>${x.body}`, 'wide');
  };
  AQ.acts['stage'] = function (t) {
    const s = t.getAttribute('data-s'), list = AQ.D.stages[s] || [];
    AQ.overlay(`<div class="mh"><h2>Этап «${esc(s)}»</h2><button class="pill ico" data-act="close" aria-label="Закрыть">✕</button></div><p class="mut" style="margin-bottom:10px">Виды документов этапа. Выберите вид, реквизиты подставятся сами.</p>${list.map((x) => `<button class="cit" data-doc="act-2v"><b>${esc(x)}</b><small>Word и Excel · по форме РК</small></button>`).join('')}`);
  };

  /* ---------- КП заказчику ---------- */
  S.offer = function (rt, ctx) {
    const O = AQ.D.offer, r = R();
    const calc = (m) => { const base = Math.round(r.cost * (1 + m / 100)), price = Math.round(base * (1 + O.vat / 100)); return { base, price, vat: price - base, margin: base - r.cost }; };
    const doc = (m) => {
      const k = 1 + m / 100;
      const c = calc(m);
      return paper(`<div class="ph"><b>${esc(req()[0][1])}</b><span>${esc(O.number)} от ${esc(O.date)}</span></div><h3 class="pt">Коммерческое предложение</h3><p class="mut">Заказчик: ${esc(O.customer)} · Объект: ${esc(O.object)} · Действует ${esc(O.valid)}</p>` +
        tbl(['Работы и материалы', 'Кол-во', 'Стоимость, ₸'], r.rows.slice(0, 5).map((x) => [x[0], (x[1] % 1 ? String(x[1]).replace('.', ',') : fmt(x[1])) + ' ' + x[2], fmt(Math.round(x[4] * k))]), { r: [1, 2] }) +
        `<p class="mut" style="margin:6px 0">… ещё 4 позиции</p><div class="ptot"><span>Стоимость работ</span><b>${money(c.base)}</b></div><div class="ptot"><span>НДС ${O.vat} %</span><b>${money(c.vat)}</b></div><div class="ptot acc"><span>Итого с НДС</span><b>${money(c.price)}</b></div>`, 'Версия v3 · PDF');
    };
    const c0 = calc(O.markup);
    let h = head(rt) + `<div class="bento"><div class="tile s5"><div class="lbl"><span>Условия</span></div>
      <label>Наценка: <b class="mono acc" id="mk">${O.markup} %</b></label><input id="mkr" type="range" min="0" max="40" step="1" value="${O.markup}" style="width:100%;accent-color:var(--acc);padding:0;margin:8px 0 14px">
      <div class="kpis3"><div><span>Себестоимость</span><b class="mono">${money(r.cost)}</b></div><div><span>Прибыль до налогов</span><b class="mono ok" id="kmg">${money(c0.margin)}</b></div><div><span>Итого с НДС ${O.vat} %</span><b class="mono acc" id="kpr">${money(c0.price)}</b></div></div>
      <div class="lbl" style="margin-top:18px"><span>Версии</span></div>${O.versions.map((v) => `<div class="row"><span class="tag ${v[0] === 'v3' ? 't-ok' : 't-mute'}">${v[0]}</span><div><b>Наценка ${v[2]} %</b><small>${v[1]} · ${esc(v[3])}</small></div></div>`).join('')}
      <div class="btns"><button class="btn pri" data-doc="est-pdf">Скачать PDF</button><button class="btn" data-toast="КП-2026/117 отправлено на почту ТОО «Мебель-Групп»: info@mebel-group.demo">Отправить заказчику</button></div></div>
      <div class="tile s7"><div class="lbl"><span>Предпросмотр</span></div><div id="offDoc">${doc(O.markup)}</div></div></div>`;
    ctx.after = () => {
      const sl = $('#mkr'); sl.addEventListener('input', () => { const m = +sl.value, c = calc(m); $('#mk').textContent = m + ' %'; $('#kmg').textContent = money(c.margin); $('#kpr').textContent = money(c.price); $('#offDoc').innerHTML = doc(m); });
    };
    return h + AQ.wasBlock(rt.tObj);
  };

  /* ---------- Прораб/Мастер ---------- */
  S.master = function (rt, ctx) {
    const M = AQ.D.master;
    const pct = () => { const t = M.works.reduce((a, w) => a + Math.min(1, w.done / w.plan), 0) / M.works.length; return Math.round(t * 100); };
    const row = (w, i) => { const p = Math.min(100, Math.round(w.done / w.plan * 100)); return `<div class="mw" data-i="${i}"><div class="mwh"><b>${esc(w.t)}</b><span class="mono"><i class="mwd">${String(w.done).replace('.', ',')}</i> / ${String(w.plan).replace('.', ',')} ${w.unit}</span></div><div class="bar2"><i class="mwb" style="width:${p}%;background:${p >= 100 ? 'var(--ok)' : 'var(--blue)'}"></i></div><div class="mwa"><input type="number" step="any" min="0" placeholder="Объём за день" aria-label="Объём"><button class="btn sm" data-act="mw-add">Сдать объём</button></div></div>`; };
    let h = head(rt) + `<div class="bento"><div class="tile s7"><div class="lbl"><span>Мои работы · ${esc(M.date)} · ${esc(M.foreman)}</span><span class="tag t-blue" id="mwp">выполнено ${pct()} %</span></div>${M.works.map(row).join('')}<div class="btns"><button class="btn pri" data-doc="naryad">Наряд-задание бригаде</button><button class="btn" data-toast="Отчёт за день отправлен начальнику участка: выполнено ${pct()} %">Отправить отчёт</button></div></div>
      <div class="tile s5"><div class="lbl"><span>Бригада на смене</span></div>${tbl(['Работник', 'Должность', 'Часы'], M.crew, { r: [2] })}<div class="lbl" style="margin-top:16px"><span>Нагрузка на неделю</span></div>${hb([{ l: 'Пн', v: 38, note: '38 м³' }, { l: 'Вт', v: 42, note: '42 м³' }, { l: 'Ср', v: 35, note: '35 м³' }, { l: 'Чт', v: 40, note: '40 м³' }, { l: 'Пт', v: 28, note: '28 м³', hi: true }])}</div></div>`;
    ctx.after = () => { };
    AQ.acts['mw-add'] = (t) => {
      const box = t.closest('.mw'), i = +box.getAttribute('data-i'), inp = $('input', box), v = parseFloat(inp.value);
      if (!(v > 0)) { AQ.toast('Введите объём за день'); return; }
      const w = M.works[i]; w.done = Math.round((w.done + v) * 100) / 100;
      const p = Math.min(100, Math.round(w.done / w.plan * 100)); $('.mwd', box).textContent = String(w.done).replace('.', ','); const b = $('.mwb', box); b.style.width = p + '%'; b.style.background = p >= 100 ? 'var(--ok)' : 'var(--blue)';
      $('#mwp').textContent = 'выполнено ' + pct() + ' %'; inp.value = '';
      AQ.toast('Принято: ' + w.t + ', +' + String(v).replace('.', ',') + ' ' + w.unit + '. Начальник участка видит сразу');
    };
    return h + AQ.wasBlock(rt.tObj);
  };

  /* ---------- Нормы расхода ---------- */
  S.norms = function (rt, ctx) {
    const N = AQ.D.norms.works;
    let h = head(rt) + `<div class="bento"><div class="tile s4"><div class="lbl"><span>Расчёт</span></div><label>Работа<select id="nw" style="width:100%">${N.map((w) => `<option value="${w.id}">${esc(w.t)}</option>`).join('')}</select></label><label style="display:block;margin-top:12px">Объём, <span id="nu">${N[0].unit}</span><input id="nv" type="number" step="any" value="${N[0].def}" style="width:100%"></label><p class="mut" style="margin-top:12px;font-size:12px">Нормы на единицу работы по ССЦ РК 2026. Цены из базы и ответов поставщиков.</p></div>
      <div class="tile s8"><div class="lbl"><span>Потребность в материалах</span><span class="tag t-ok" id="nt"></span></div><div id="nres"></div></div></div>`;
    ctx.after = () => {
      const sel = $('#nw'), vol = $('#nv');
      const draw = () => {
        const w = N.filter((x) => x.id === sel.value)[0], v = parseFloat(vol.value) || 0; $('#nu').textContent = w.unit;
        const rows = w.mats.map((m) => ({ n: m[0], unit: m[1], q: m[2] * v, sum: m[2] * v * m[3], p: m[3] })), tot = rows.reduce((a, r) => a + r.sum, 0);
        $('#nt').textContent = 'Итого ' + money(Math.round(tot));
        $('#nres').innerHTML = tbl(['Материал', 'Расход', 'Цена, ₸', 'Сумма, ₸'], rows.map((r) => [r.n, (r.q % 1 ? r.q.toFixed(1).replace('.', ',') : fmt(r.q)) + ' ' + r.unit, fmt(r.p), fmt(Math.round(r.sum))]), { r: [1, 2, 3] }) +
          '<div class="lbl" style="margin-top:16px"><span>Доля в стоимости</span></div>' + hb(rows.map((r) => ({ l: r.n, v: r.sum, note: tot ? Math.round(r.sum / tot * 100) + ' %' : '0 %' }))) +
          '<div class="btns">' + (AQ.can('supplier') ? '<a class="btn pri" href="#/money/out">Запросить цены у поставщиков</a>' : '<button class="btn pri" data-toast="Расчёт сохранён и передан снабженцу">Передать снабженцу</button>') + '</div>';
        AQ.tblLabels && AQ.tblLabels($('#nres'));
      };
      sel.addEventListener('change', () => { vol.value = N.filter((x) => x.id === sel.value)[0].def; draw(); }); vol.addEventListener('input', draw); draw();
    };
    return h + AQ.wasBlock(rt.tObj);
  };

  /* ---------- Бюджет проекта ---------- */
  S.budget = function (rt) {
    const B = AQ.D.budgetCats, P = AQ.D.budgetPay;
    const plan = B.reduce((a, c) => a + c.plan, 0), fact = B.reduce((a, c) => a + c.fact, 0), obl = B.reduce((a, c) => a + c.obl, 0), left = plan - fact - obl;
    let h = head(rt) + `<div class="bento"><div class="tile s4" style="display:flex;gap:16px;align-items:center"><div>${donut(Math.round(fact / plan * 100), 124, 'освоено')}</div><div><div class="lbl"><span>Мебельный цех</span></div><div class="mono"><b>${mln(fact)}</b> из ${mln(plan)} млн ₸</div><p class="mut" style="font-size:12px;margin-top:4px">Остаток после обязательств: <b class="ok">${mln(left)} млн ₸</b></p></div></div>
      <div class="tile s8"><div class="lbl"><span>План, факт и обязательства по статьям, млн ₸</span></div>${B.map((c) => { const lf = Math.max(0, c.plan - c.fact - c.obl); return `<div class="stk"><span>${esc(c.c)}</span><div class="stkb"><i class="f" style="width:${c.fact / c.plan * 100}%"></i><i class="o" style="width:${c.obl / c.plan * 100}%"></i></div><b class="mono">${mln(c.fact)} + ${mln(c.obl)} / ${mln(c.plan)}</b></div>`; }).join('')}<div class="legend" style="margin-top:12px"><span><i style="background:var(--blue)"></i>факт</span><span><i style="background:var(--warn)"></i>обязательства</span><span><i style="background:var(--panelb)"></i>свободно</span></div></div>
      <div class="tile s12"><div class="lbl"><span>Платежи</span></div>${tbl(['Дата', 'Кому', 'За что', 'Сумма, млн ₸', 'Статус'], P, { r: [3] })}</div></div>`;
    return h + AQ.wasBlock(rt.tObj);
  };

  /* ---------- Снабженец: сегодня ---------- */
  S.sup = function (rt, ctx) {
    const U = AQ.D.sup;
    let h = head(rt) + `<div class="bento"><div class="tile s5"><div class="lbl"><span>Сделать сейчас</span><span class="tag t-warn" id="stc">${U.todo.filter((t) => !t[2]).length} открыто</span></div>${U.todo.map((t, i) => `<label class="row todo" style="cursor:pointer"><input type="checkbox" ${t[2] ? 'checked' : ''} data-i="${i}" style="width:18px;height:18px"><div><b>${esc(t[0])}</b><small>${esc(t[1])}</small></div></label>`).join('')}</div>
      <div class="tile s7"><div class="lbl"><span>Переписка · СтройБетон</span></div><div class="chat" id="sm">${U.msgs.map((m) => `<div class="msg ${m[3] === 'in' ? 'bot' : 'me'}">${esc(m[1])}<br><small style="opacity:.6">${m[2]}</small></div>`).join('')}</div><form id="sf" style="display:flex;gap:8px;margin-top:12px"><input id="si" style="flex:1" placeholder="Написать поставщику" autocomplete="off"><button class="btn pri" type="submit">Отправить</button></form></div>
      <div class="tile s12"><div class="lbl"><span>Заказы в пути</span></div>${U.orders.map((o) => `<div class="stk"><span>${esc(o[0])}<small class="mut" style="display:block">${esc(o[1])} · до ${o[2]}</small></span><div class="stkb"><i class="f" style="width:${o[3]}%;background:${o[3] >= 100 ? 'var(--ok)' : 'var(--blue)'}"></i></div><b class="mono">${o[3]} %</b></div>`).join('')}</div></div>`;
    ctx.after = () => {
      $$('.todo input').forEach((c) => c.addEventListener('change', () => { $('#stc').textContent = $$('.todo input:not(:checked)').length + ' открыто'; }));
      $('#sf').addEventListener('submit', (e) => { e.preventDefault(); const v = $('#si').value.trim(); if (!v) return; const box = $('#sm'); box.insertAdjacentHTML('beforeend', `<div class="msg me">${esc(v)}<br><small style="opacity:.6">сейчас</small></div>`); $('#si').value = ''; AQ.later(() => box.insertAdjacentHTML('beforeend', '<div class="msg bot">Принято, вернёмся с ценой до конца дня.<br><small style="opacity:.6">сейчас</small></div>'), 700); });
    };
    return h + AQ.wasBlock(rt.tObj);
  };

  /* ---------- Цена материала ---------- */
  let priceSel = 'concrete';
  S.price = function (rt, ctx) {
    const P = AQ.D.prices.items, it = P.filter((x) => x.id === priceSel)[0] || P[0];
    const offers = it.offers.slice().sort((a, b) => a[1] - b[1]), best = offers[0][1], avg = offers.reduce((a, o) => a + o[1], 0) / offers.length;
    let h = head(rt) + `<div class="btns" style="margin:0 0 14px">${P.map((x) => `<button class="btn sm${x.id === it.id ? ' pri' : ''}" data-act="price-pick" data-id="${x.id}">${esc(x.n)}</button>`).join('')}</div>
      <div class="bento"><div class="tile s7"><div class="lbl"><span>${esc(it.n)} · цена за ${esc(it.unit)}, ₸</span><span class="tag t-ok">лучшая ${fmt(best)}</span></div>${hb(offers.map((o, i) => ({ l: o[0], v: o[1], hi: i === 0, note: fmt(o[1]) + (i === 0 ? ' · минимум' : ' · +' + ((o[1] / best - 1) * 100).toFixed(1).replace('.', ',') + ' %') })))}
        <div class="lbl" style="margin-top:16px"><span>Источники</span></div>${tbl(['Поставщик', 'Цена, ₸', 'Источник'], offers.map((o) => [o[0], fmt(o[1]), o[2]]), { r: [1] })}</div>
      <div class="tile s5"><div class="lbl"><span>Динамика за 6 месяцев</span></div><div style="color:var(--blue)">${spark(it.hist, 300, 90)}</div><div class="kpis3" style="margin-top:12px"><div><span>Сейчас</span><b class="mono">${fmt(best)}</b></div><div><span>Среднее по рынку</span><b class="mono">${fmt(Math.round(avg))}</b></div><div><span>Рост за 6 мес.</span><b class="mono warn">+${((it.hist[5] / it.hist[0] - 1) * 100).toFixed(1).replace('.', ',')} %</b></div></div>
        <div class="btns">${AQ.lnk('money/out', 'Запросить цены у поставщиков', 'btn pri')}<button class="btn" data-toast="Цена ${fmt(best)} ₸ записана в смету по позиции «${esc(it.n)}»">Записать в смету</button></div></div></div>`;
    AQ.acts['price-pick'] = (t) => { priceSel = t.getAttribute('data-id'); AQ.render(); };
    return h + AQ.wasBlock(rt.tObj);
  };

  /* ---------- Запросы поставщикам ---------- */
  S.out = function (rt) {
    const O = AQ.D.outreach;
    const rows = O.rows.map((r) => [r[0], r[1] === 'Ответил' ? chip('Ответил', 't-ok') : chip('Ждём', 't-warn'), r[2], r[3], r[4]]);
    let h = head(rt) + `<div class="bento"><div class="tile s7"><div class="lbl"><span>${esc(O.material)} · отправлено ${esc(O.sent)}</span><span class="tag t-ok">ответили 4 из 5</span></div>
      <div class="tbl-wrap"><table><thead><tr><th>Поставщик</th><th>Статус</th><th class="r">Цена, ₸/м³</th><th>Ответ</th><th>Условия</th></tr></thead><tbody>${rows.map((r, i) => `<tr${i === 0 ? ' style="background:rgba(53,196,122,.08)"' : ''}><td>${esc(r[0])}${i === 0 ? ' ' + chip('минимум', 't-ok') : ''}</td><td>${r[1]}</td><td class="num">${esc(r[2])}</td><td>${esc(r[3])}</td><td>${esc(r[4])}</td></tr>`).join('')}</tbody></table></div>
      <div class="btns"><button class="btn pri" data-toast="Цена БетонЦентр 31 400 ₸/м³ записана, заказ на 400 м³ подготовлен">Выбрать БетонЦентр</button><button class="btn" data-toast="Напоминание отправлено в «ГородБетон»">Напомнить «ГородБетон»</button></div></div>
      <div class="tile s5"><div class="lbl"><span>Текст запроса</span></div>${paper(`<p>${esc(O.letter)}</p><p class="mut" style="margin-top:8px">${esc(req()[0][1])} · ${esc(req()[7][1])}</p>`, 'Отправлено 5 поставщикам')}</div></div>`;
    return h + AQ.wasBlock(rt.tObj);
  };

  /* ---------- Подрядчики ---------- */
  let subFilter = 'all';
  S.subs = function (rt) {
    const L = AQ.D.subs.filter((s) => subFilter === 'all' || s.work === subFilter), best = Math.min.apply(null, L.map((s) => s.bid));
    let h = head(rt) + `<div class="btns" style="margin:0 0 14px">${['all', 'Кровля', 'Отделка'].map((f) => `<button class="btn sm${f === subFilter ? ' pri' : ''}" data-act="sub-f" data-f="${f}">${f === 'all' ? 'Все виды работ' : f}</button>`).join('')}</div>
      <div class="prj" style="grid-template-columns:repeat(auto-fill,minmax(280px,1fr))">${L.map((s) => `<div class="pj"><div class="in"><div style="display:flex;justify-content:space-between;gap:8px"><b>${esc(s.n)}</b>${s.bid === best ? chip('лучшая цена', 't-ok') : ''}</div><small><span>${esc(s.work)} · ${esc(s.city)}</span><span>${stars(s.rating)}</span></small><div class="kpis3" style="margin-top:10px"><div><span>Предложение</span><b class="mono">${mln(s.bid / 1e6)} млн ₸</b></div><div><span>Срок</span><b class="mono">${s.days} дн.</b></div><div><span>Объектов</span><b class="mono">${s.objects}</b></div></div><div class="btns"><button class="btn sm pri" data-toast="Запрос предложения отправлен: ${esc(s.n)}">Запросить предложение</button></div></div></div>`).join('')}</div>`;
    AQ.acts['sub-f'] = (t) => { subFilter = t.getAttribute('data-f'); AQ.render(); };
    return h + AQ.wasBlock(rt.tObj);
  };

  /* ---------- Договоры ---------- */
  S.contracts = function (rt) {
    const C = AQ.D.contracts, id = rt.sub[0] || 'c7', cur = C.filter((c) => c.id === id)[0] || C[0], q = req();
    const body = paper(`<div class="ph"><b>${esc(cur.n)}</b><span>г. Астана · ${esc(cur.date)}</span></div><p><b>${esc(q[0][1])}</b>, БИН ${esc(q[1][1])}, в лице директора ${esc(q[5][1])}, именуемое «Подрядчик», и <b>${esc(cur.side)}</b>, именуемое «Контрагент», заключили договор о нижеследующем.</p><p><b>1. Предмет.</b> Подрядчик выполняет строительно-монтажные работы на объекте «Мебельный цех, Астана».</p><p><b>2. Цена.</b> ${money(cur.sum)} с учётом НДС 16 %.</p><p><b>3. Сроки.</b> Начало: ${esc(cur.date)}. Окончание: по графику, 15.03.2027.</p><p><b>4. Реквизиты Подрядчика.</b> ${esc(q[2][1])}. ${esc(q[3][1])}. ${esc(q[4][1])}.</p>`, 'Реквизиты подставлены из карточки компании');
    let h = head(rt) + `<div class="bento"><div class="tile s4"><div class="lbl"><span>Договоры</span></div>${C.map((c) => `<a class="row" href="#/legal/contracts/${c.id}" style="${c.id === cur.id ? 'background:var(--panel2)' : ''}"><div><b>${esc(c.n)}</b><small>${esc(c.side)} · ${money(c.sum)}</small></div>${chip(c.status, c.status === 'Подписан' ? 't-ok' : c.status === 'Черновик' ? 't-mute' : 't-warn')}</a>`).join('')}<div class="btns"><button class="btn pri" data-doc="contract-docx">＋ Подготовить договор</button></div></div><div class="tile s8"><div class="lbl"><span>${esc(cur.n)}</span><span>${AQ.lnk('legal/review', 'Проверить на риски', 'btn sm')}</span></div>${body}<div class="btns"><button class="btn" data-doc="contract-docx">Скачать Word</button></div></div></div>`;
    return h + AQ.wasBlock(rt.tObj);
  };

  /* ---------- Письма и претензии ---------- */
  S.letter = function (rt, ctx) {
    const L = AQ.D.letters, q = req();
    const doc = (days, sum) => { const pen = Math.min(sum * .1, Math.round(sum * .005 * days)); return paper(`<div class="ph"><b>${esc(q[0][1])}</b><span>Исх. № 2 от 14.11.2026</span></div><p class="mut">Кому: ТОО «Строй-Монтаж», директору</p><h3 class="pt">Претензия</h3><p>По договору субподряда №14 работы по устройству кровли должны были быть завершены 08.11.2026. Фактическая просрочка составляет <b>${days}</b> дн.</p><p>На основании п. 5.2 договора и ст. 349 ГК РК требуем уплатить неустойку в размере 0,5 % за каждый день просрочки: <b>${money(pen)}</b> (не более 10 % от суммы договора ${money(sum)}).</p><p>Просим завершить работы в течение 5 рабочих дней и перечислить неустойку на счёт ${esc(q[3][1])}.</p><div class="sign"><div><span>Директор</span><i></i>${esc(q[5][1])}</div></div>`, 'Word'); };
    let h = head(rt) + `<div class="bento"><div class="tile s5"><div class="lbl"><span>Новое письмо</span></div><label>Вид<select style="width:100%"><option>Претензия по просрочке</option><option>Письмо о продлении срока</option><option>Уведомление о недостатках</option></select></label><label style="display:block;margin-top:10px">Дней просрочки<input id="ld" type="number" min="1" value="6" style="width:100%"></label><label style="display:block;margin-top:10px">Сумма договора, ₸<input id="ls" type="number" value="14200000" style="width:100%"></label><div class="btns"><button class="btn pri" data-toast="Претензия №2 отправлена в ТОО «Строй-Монтаж» по почте и в Telegram директору">Отправить</button><button class="btn" data-doc="contract-docx">Скачать Word</button></div>
      <div class="lbl" style="margin-top:18px"><span>Мои письма</span></div>${L.map((l) => `<div class="row"><div><b>${esc(l[0])}</b><small>${esc(l[1])} · ${esc(l[2])}</small></div>${chip(l[3], l[3] === 'Отправлено' ? 't-ok' : l[3] === 'Закрыта' ? 't-mute' : 't-warn')}</div>`).join('')}</div>
      <div class="tile s7"><div class="lbl"><span>Предпросмотр</span></div><div id="ldoc">${doc(6, 14200000)}</div></div></div>`;
    ctx.after = () => { const upd = () => { $('#ldoc').innerHTML = doc(Math.max(1, +$('#ld').value || 1), +$('#ls').value || 0); }; $('#ld').addEventListener('input', upd); $('#ls').addEventListener('input', upd); };
    return h + AQ.wasBlock(rt.tObj);
  };

  /* ---------- Паспорт компании ---------- */
  S.passport = function (rt) {
    const P = AQ.D.passport;
    let h = head(rt) + `<div class="bento"><div class="tile s4" style="text-align:center"><div class="lbl"><span>Готовность паспорта</span></div>${donut(P.score, 150, 'заполнено')}<p class="mut" style="margin-top:8px">Не хватает 1 документа и 1 скоро истекает</p></div>
      <div class="tile s8"><div class="lbl"><span>Документы для заявок</span></div>${P.items.map((i) => `<div class="row"><span class="tag ${i[2] === 'ok' ? 't-ok' : i[2] === 'warn' ? 't-warn' : 't-bad'}">${i[2] === 'ok' ? '✓' : i[2] === 'warn' ? '!' : '✕'}</span><div><b>${esc(i[0])}</b><small>${esc(i[1])}</small></div>${i[2] === 'ok' ? '' : '<button class="btn sm" data-toast="Файл загружен: ' + esc(i[0]) + '. Паспорт обновлён: 100 %">Загрузить</button>'}</div>`).join('')}</div>
      <div class="tile s12"><div class="lbl"><span>Опыт: объекты в паспорте</span></div><div class="prj" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr))">${P.projects.map((p, i) => `<div class="pj"><div class="ph" style="background-image:url(../../img/${['sklad', 'damba', 'ceh', 'cottage'][i]}.jpg)"></div><div class="in"><b>${esc(p[0])}</b><small><span>${esc(p[1])}</span><span class="mono">${esc(p[2])}</span></small></div></div>`).join('')}</div></div></div>`;
    return h + AQ.wasBlock(rt.tObj);
  };

  /* ---------- Спрос по рынку ---------- */
  S.demand = function (rt) {
    const D = AQ.D.demand, mx = Math.max.apply(null, [].concat.apply([], D.grid));
    let h = head(rt) + `<div class="bento"><div class="tile s7"><div class="lbl"><span>Тендеров за месяц · город × вид работ</span></div><div class="tbl-wrap heat"><table><thead><tr><th></th>${D.works.map((w) => `<th class="r">${esc(w)}</th>`).join('')}</tr></thead><tbody>${D.cities.map((c, i) => `<tr><td>${esc(c)}</td>${D.grid[i].map((v) => `<td class="num" style="background:rgba(242,107,29,${(.08 + v / mx * .55).toFixed(2)})">${v}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>
      <div class="tile s5"><div class="lbl"><span>Средняя сумма, млн ₸</span></div>${hb(D.works.map((w, i) => ({ l: w, v: D.avg[i], note: D.avg[i] })))}<div class="btns">${AQ.lnk('sales/tender', 'Смотреть тендеры', 'btn pri')}</div></div></div>`;
    return h + AQ.wasBlock(rt.tObj);
  };

  /* ---------- Концепт проекта ---------- */
  function plan(rooms, k, label) {
    const W = 10 * k + 40, H = 12 * k + 44;
    return `<svg viewBox="0 0 ${W} ${H}" class="plansvg" aria-label="${label}"><g transform="translate(20,22)"><rect x="0" y="0" width="${10 * k}" height="${12 * k}" fill="none" stroke="var(--acc)" stroke-width="2.4"/>${rooms.map((r) => `<rect x="${r[1] * k}" y="${r[2] * k}" width="${r[3] * k}" height="${r[4] * k}" fill="rgba(111,163,255,.07)" stroke="var(--blue)" stroke-width="1.2"/><text x="${(r[1] + r[3] / 2) * k}" y="${(r[2] + r[4] / 2) * k - 2}" text-anchor="middle" font-size="9.5" fill="currentColor">${esc(r[0])}</text><text x="${(r[1] + r[3] / 2) * k}" y="${(r[2] + r[4] / 2) * k + 11}" text-anchor="middle" font-size="8.5" fill="var(--mute)" font-family="JetBrains Mono, monospace">${r[5]} м²</text>`).join('')}<line x1="0" y1="-10" x2="${10 * k}" y2="-10" stroke="var(--acc)" stroke-width="1"/><text x="${5 * k}" y="-13" text-anchor="middle" font-size="9" fill="var(--mute)" font-family="JetBrains Mono, monospace">10 000</text><text x="-8" y="${6 * k}" font-size="9" fill="var(--mute)" font-family="JetBrains Mono, monospace" transform="rotate(-90 -8 ${6 * k})" text-anchor="middle">12 000</text></g></svg>`;
  }
  function facade() {
    return `<svg viewBox="0 0 340 190" class="plansvg" aria-label="Фасад"><g fill="none" stroke="var(--blue)" stroke-width="1.5"><path d="M20 170H320"/><rect x="40" y="70" width="260" height="100" /><path d="M30 70L170 22L310 70Z" stroke="var(--acc)" stroke-width="2.2"/><rect x="62" y="92" width="42" height="34"/><rect x="62" y="136" width="42" height="26" opacity=".0"/><rect x="236" y="92" width="42" height="34"/><rect x="150" y="104" width="40" height="66" stroke="var(--acc)"/><rect x="62" y="40" width="0" height="0"/><rect x="108" y="92" width="0" height="0"/><rect x="198" y="92" width="30" height="34"/><rect x="70" y="140" width="80" height="30" opacity=".5"/></g><g fill="var(--mute)" font-family="JetBrains Mono, monospace" font-size="8"><text x="22" y="186">±0.000</text><text x="304" y="70">+6.200</text><text x="172" y="20">+9.100</text></g></svg>`;
  }
  S.concept = function (rt, ctx) {
    const C = AQ.D.concept, tot = C.cost.reduce((a, c) => a + c[1], 0);
    let h = head(rt) + `<div class="tile" style="margin-bottom:14px"><div class="lbl"><span>Описание дома</span></div><div style="display:flex;gap:10px;flex-wrap:wrap"><input id="cp" style="flex:1;min-width:240px" value="${esc(C.prompt)}"><button class="btn pri" data-act="concept-go">Построить концепт</button></div></div>
      <div class="bento"><div class="tile s4"><div class="lbl"><span>План 1 этажа · 120 м²</span></div>${plan(C.rooms1, 28, 'План 1 этажа')}</div><div class="tile s4"><div class="lbl"><span>План 2 этажа · 120 м²</span></div>${plan(C.rooms2, 28, 'План 2 этажа')}</div><div class="tile s4"><div class="lbl"><span>Фасад</span></div>${facade()}<p class="mut" style="font-size:12px">Кирпич, кровля 30°, 2 этажа, высота 9,1 м</p></div>
      <div class="tile s7"><div class="lbl"><span>Примерная стоимость · ~ ${mln(tot)} млн ₸</span></div>${hb(C.cost.map((c) => ({ l: c[0], v: c[1], note: mln(c[1]) + ' млн ₸' })))}</div><div class="tile s5"><div class="lbl"><span>Дальше</span></div><div class="btns" style="margin-top:0"><button class="btn pri" data-toast="Концепт сохранён и привязан к проекту «Коттедж в BI Village»">Привязать к проекту</button>${AQ.lnk('calc/est', 'Посчитать себестоимость', 'btn')}<button class="btn" data-doc="est-pdf">Скачать PDF</button></div></div></div>`;
    AQ.acts['concept-go'] = () => AQ.toast('Концепт построен: 2 этажа, 4 спальни, гараж, ~ ' + mln(tot) + ' млн ₸');
    return h + AQ.wasBlock(rt.tObj);
  };

  /* ---------- Реквизиты ---------- */
  S.req = function (rt, ctx) {
    const Q = req();
    let h = head(rt) + `<div class="bento"><div class="tile s6"><div class="lbl"><span>Карточка компании</span></div><div style="display:grid;gap:10px">${Q.map((q, i) => `<label>${esc(q[0])}<input data-q="${i}" style="width:100%" value="${esc(q[1])}"></label>`).join('')}</div><div class="btns"><button class="btn pri" data-toast="Реквизиты сохранены. Они подставятся в новые акты, договоры и заявки">Сохранить</button></div></div>
      <div class="tile s6"><div class="lbl"><span>Так это выглядит в документах</span></div><div id="rq">${rqDoc(Q)}</div></div></div>`;
    ctx.after = () => { $$('[data-q]').forEach((i) => i.addEventListener('input', () => { Q[+i.getAttribute('data-q')][1] = i.value; $('#rq').innerHTML = rqDoc(Q); })); };
    return h + AQ.wasBlock(rt.tObj);
  };
  function rqDoc(Q) { return paper(`<div class="ph"><b>${esc(Q[0][1])}</b><span>БИН ${esc(Q[1][1])}</span></div><p class="mut">${esc(Q[2][1])} · ${esc(Q[6][1])} · ${esc(Q[7][1])}</p><h3 class="pt">АКТ № 8 приёмки выполненных работ</h3><p>Подрядчик: ${esc(Q[0][1])}, ${esc(Q[3][1])}, ${esc(Q[4][1])}</p><div class="sign"><div><span>Директор</span><i></i>${esc(Q[5][1])}</div></div>`, 'Акт · шапка и подпись'); }

  /* ---------- Google Диск ---------- */
  S.drive = function (rt) {
    const G = AQ.D.drive;
    let h = head(rt) + `<div class="bento"><div class="tile s5"><div class="lbl"><span>Подключено</span><span class="tag t-ok">работает</span></div><div class="row"><div><b>${esc(G.account)}</b><small>Автоматический поиск новых файлов · последний ${esc(G.last)}</small></div></div><div class="lbl" style="margin-top:14px"><span>Папки проектов</span></div>${G.folders.map((f) => `<div class="row"><div><b>${esc(f[0])}</b><small>${esc(f[1])} · ${f[2]} файлов · ${esc(f[3])}</small></div><span class="tag t-ok">синхронизировано</span></div>`).join('')}<div class="btns"><button class="btn pri" data-toast="Папка «Дамба / Архив» подключена: найдено 54 файла">＋ Подключить папку</button></div></div>
      <div class="tile s7"><div class="lbl"><span>Новые файлы, найденные автоматически</span><span class="tag t-blue">${G.found.length}</span></div>${G.found.map((f) => `<div class="row"><div><b>${esc(f[0])}</b><small>${esc(f[1])} · ${esc(f[2])} · ${esc(f[3])}</small></div><button class="btn sm" data-toast="Файл «${esc(f[0])}» привязан к проекту">Привязать к проекту</button></div>`).join('')}</div></div>`;
    return h + AQ.wasBlock(rt.tObj);
  };

  /* ---------- Предложение подрядчика ---------- */
  S.vcmp = function (rt) {
    const rows = AQ.D.vcmpRows;
    const kind = (v) => /Не хватает/.test(v) ? ['t-bad', 'Не хватает'] : /Лишнее/.test(v) ? ['t-warn', 'Лишнее'] : /выше рынка/.test(v) ? ['t-warn', 'Дорого'] : ['t-ok', 'Сходится'];
    let h = head(rt) + `<div class="kpis3" style="margin-bottom:14px"><div><span>Позиций сверено</span><b class="mono">${rows.length}</b></div><div><span>Не хватает</span><b class="mono bad">1</b></div><div><span>Лишнее</span><b class="mono warn">1</b></div><div><span>Цена выше рынка</span><b class="mono warn">+12 %</b></div></div>
      <div class="tbl-wrap"><table><thead><tr><th>Позиция</th><th>В проекте</th><th>В предложении</th><th>Вывод</th></tr></thead><tbody>${rows.map((r) => { const k = kind(r[3]); return `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td><td>${chip(k[1], k[0])} <span class="mut">${r[3] === '—' ? '' : esc(r[3])}</span></td></tr>`; }).join('')}</tbody></table></div>
      <div class="btns"><button class="btn pri" data-toast="Подрядчику отправлен список замечаний: гидроизоляция, вывоз грунта, цена на опалубку">Отправить замечания подрядчику</button>${AQ.lnk('money/subs', 'Найти другого подрядчика')}${AQ.lnk('legal/review', 'Проверить договор')}</div>`;
    return h + AQ.wasBlock(rt.tObj);
  };

  /* ---------- Сделанные документы ---------- */
  S.docsmade = function (rt) {
    const kind = ['Акт скрытых работ', 'Акт 2В', 'Дефектный акт', 'Акт простоя'];
    let h = head(rt) + AQ.D.docsMade.map((r, i) => `<div class="row" style="padding:12px 4px"><span class="tag t-blue">${esc(kind[i] || 'Документ')}</span><div><b>${esc(r[0])}</b><small>${esc(r[1])} · ${esc(r[2])} · сделал(а) ${esc(r[3])}</small></div><button class="btn sm" data-doc="act-2v">Открыть</button></div>`).join('') + `<div class="btns">${AQ.lnk('docs/new', 'Сделать новый', 'btn pri')}</div>`;
    return h + AQ.wasBlock(rt.tObj);
  };

  /* ---------- вкладки проекта с графикой ---------- */
  AQ.projTab = function (tab, p) {
    const T = AQ.D.projectTabs;
    if (tab === 'volumes') return `<div class="tile">${T.volumes.rows.map((r) => { const pl = parseFloat(String(r[1]).replace(/\s/g, '').replace(',', '.')), dn = parseFloat(String(r[2]).replace(/\s/g, '').replace(',', '.')), pc = Math.round(dn / pl * 100); return `<div class="stk"><span>${esc(r[0])}</span><div class="stkb"><i class="f" style="width:${pc}%;background:${pc >= 100 ? 'var(--ok)' : 'var(--blue)'}"></i></div><b class="mono">${esc(r[2])} / ${esc(r[1])} ${esc(r[3])} · ${pc} %</b></div>`; }).join('')}</div>`;
    if (tab === 'docs') return `<div class="tile">${T.docs.rows.map((r) => `<div class="row"><span class="tag t-mute">${esc(r[1])}</span><div><b>${esc(r[0])}</b><small>${esc(r[2])}</small></div>${chip(r[3], r[3] === 'Подписан' ? 't-ok' : r[3] === 'Черновик' ? 't-mute' : 't-warn')}<button class="btn sm" data-doc="act-2v">Открыть</button></div>`).join('')}</div>`;
    if (tab === 'money') { const B = AQ.D.budgetCats; return `<div class="tile">${B.map((c) => `<div class="stk"><span>${esc(c.c)}</span><div class="stkb"><i class="f" style="width:${c.fact / c.plan * 100}%"></i><i class="o" style="width:${c.obl / c.plan * 100}%"></i></div><b class="mono">${mln(c.fact)} / ${mln(c.plan)} млн ₸</b></div>`).join('')}<div class="btns">${AQ.lnk('money/budget', 'Бюджет проекта', 'btn')}${AQ.lnk('money/fin', 'Финансовый отчёт', 'btn')}</div></div>`; }
    if (tab === 'stock') return `<div class="tile">${T.stock.rows.map((r) => { const d = parseInt(r[3], 10); return `<div class="stk"><span>${esc(r[0])}<small class="mut" style="display:block">остаток ${esc(r[1])} ${esc(r[2])}</small></span><div class="stkb"><i class="f" style="width:${Math.min(100, d * 10)}%;background:${d <= 5 ? 'var(--bad)' : 'var(--ok)'}"></i></div><b class="mono">хватит на ${esc(r[3])}</b></div>`; }).join('')}<div class="btns">${AQ.lnk('money/out', 'Запросить поставку', 'btn pri')}</div></div>`;
    if (tab === 'equipment') return `<div class="tile">${T.equipment.rows.map((r) => `<div class="row"><div><b>${esc(r[0])}</b><small>${esc(r[1])}</small></div><span class="mono">${esc(r[2])} ч за неделю</span>${chip(r[3], r[3] === 'Работает' ? 't-ok' : 't-warn')}</div>`).join('')}</div>`;
    if (tab === 'people') return `<div class="tile">${T.people.rows.map((r) => `<div class="row"><span class="ava" style="width:34px;height:34px;font-size:13px">${esc(r[0].charAt(0))}</span><div><b>${esc(r[0])}</b><small>${esc(r[1])} · ${esc(r[2])}</small></div>${chip(r[3], r[3] === 'В сети' ? 't-ok' : 't-mute')}</div>`).join('')}</div>`;
    return null;
  };
})();
