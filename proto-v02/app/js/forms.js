/* v1.0: формы и мастера документов основного сайта (те же шаги и поля). */
(function () {
  'use strict';
  const AQ = window.AQ, esc = AQ.esc, $ = AQ.$, $$ = AQ.$$, S = AQ.screens;
  AQ.ui = AQ.ui || {};

  /* ---------- поля ---------- */
  function field(f, vals) {
    const k = f[0], l = f[1], t = f[2] || 'text', x = f[3], v = vals && vals[k] != null ? vals[k] : null;
    const lab = (inner) => `<label class="ff">${esc(l)}${inner}</label>`;
    if (t === 'project') { const cur = v || (AQ.projName ? AQ.projName() : ''); return lab(`<select data-k="${k}">${AQ.D.projects.map((p) => `<option${p.n === cur ? ' selected' : ''}>${esc(p.n)}</option>`).join('')}<option>Новый проект (без сохранения)</option></select>`); }
    if (t === 'select') return lab(`<select data-k="${k}">${x.map((o) => `<option${v === o ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select>`);
    if (t === 'area') return lab(`<textarea data-k="${k}" rows="3">${esc(v != null ? v : (x || ''))}</textarea>`);
    if (t === 'date') return lab(`<input type="date" data-k="${k}" value="${esc(v != null ? v : '2026-11-16')}">`);
    if (t === 'number') return lab(`<input type="number" step="any" data-k="${k}" value="${esc(v != null ? v : (x || ''))}">`);
    if (t === 'check') return `<label class="ff chk"><input type="checkbox" data-k="${k}" ${(v != null ? v : x) ? 'checked' : ''}> ${esc(l)}</label>`;
    if (t === 'file') return `<div class="ff"><span>${esc(l)}</span><div class="drop" style="padding:12px"><button type="button" class="btn sm" data-toast="Файл выбран: Договор_17.pdf">Загрузить файл</button> <button type="button" class="btn sm" data-toast="Файл взят из «Файлов проекта»: Договор_17.pdf">Взять из «Файлов проекта»</button></div></div>`;
    if (t === 'rows') {
      const cols = x, rows = v || [cols.map((c, i) => (i === 0 ? 'Пример' : '')), cols.map(() => '')];
      return `<div class="ff"><span>${esc(l)}</span><div class="tbl-wrap"><table data-rows="${k}"><thead><tr>${cols.map((c) => `<th>${esc(c)}</th>`).join('')}<th></th></tr></thead><tbody>${rows.map((r) => rowHtml(cols, r)).join('')}</tbody></table></div><button type="button" class="btn sm" data-act="row-add" data-k="${k}">+ Строка</button></div>`;
    }
    return lab(`<input data-k="${k}" value="${esc(v != null ? v : (x || ''))}">`);
  }
  function rowHtml(cols, r) { return '<tr>' + cols.map((c, i) => `<td data-label="${esc(c)}"><input value="${esc(r[i] || '')}" aria-label="${esc(c)}"></td>`).join('') + '<td><button type="button" class="btn sm ghost" data-act="row-del" aria-label="Удалить">✕</button></td></tr>'; }
  function read(root) {
    const o = {};
    $$('[data-k]', root).forEach((e) => { if (e.tagName === 'TABLE') return; o[e.getAttribute('data-k')] = e.type === 'checkbox' ? e.checked : e.value; });
    $$('table[data-rows]', root).forEach((t) => { o[t.getAttribute('data-rows')] = $$('tbody tr', t).map((tr) => $$('input', tr).map((i) => i.value)); });
    return o;
  }
  AQ.form = { field, read };
  AQ.acts['row-add'] = (t) => { const tb = $('table[data-rows="' + t.getAttribute('data-k') + '"]'), cols = $$('thead th', tb).slice(0, -1).map((h) => h.textContent); $('tbody', tb).insertAdjacentHTML('beforeend', rowHtml(cols, [])); };
  AQ.acts['row-del'] = (t) => { const tr = t.closest('tr'), tb = tr.parentNode; if (tb.children.length > 1) tr.remove(); };

  /* ---------- модальная форма ---------- */
  AQ.formModal = function (cfg) {
    AQ.overlay(`<div class="mh"><h2>${esc(cfg.title)}</h2><button class="pill ico" data-act="close" aria-label="Закрыть">✕</button></div>${cfg.lead ? `<p class="mut" style="margin-bottom:10px">${esc(cfg.lead)}</p>` : ''}<div class="fgrid" id="mfb">${cfg.fields.map((f) => field(f)).join('')}</div><div class="btns"><button class="btn pri" data-act="mf-submit">${esc(cfg.submit || 'Готово')}</button><button class="btn" data-act="close">Отмена</button></div>`);
    AQ.ui.mf = cfg;
  };
  AQ.acts['mf-submit'] = () => { const cfg = AQ.ui.mf, v = read($('#mfb')); AQ.closeLayer(); if (cfg.done) cfg.done(v); };

  /* ---------- мастер документов ---------- */
  AQ.projName = () => (AQ.D.projects.filter((p) => p.id === (AQ.ui.proj || 'ceh'))[0] || AQ.D.projects[0]).n;
  function company() { return (AQ.D.requisites && AQ.D.requisites[0] ? AQ.D.requisites[0][1] : 'Демо-компания, ТОО'); }
  function wizDoc(form, v) {
    const paper = AQ.paper, tbl = AQ.tbl;
    const flat = [], rowsBlocks = [];
    form.steps.forEach((s) => s.f.forEach((f) => { const t = f[2]; if (t === 'rows') { rowsBlocks.push([f[1], f[3], (v[f[0]] || []).filter((r) => r.some((c) => c))]); } else if (t !== 'file' && v[f[0]] !== undefined && v[f[0]] !== '' && v[f[0]] !== false) flat.push([f[1].replace(/\s*\*$/, ''), v[f[0]] === true ? 'Да' : String(v[f[0]])]); }));
    if (/\.xlsx$/.test(form.file) && rowsBlocks[0]) {
      const rb = rowsBlocks[0], rows = rb[2].length ? rb[2] : [rb[1].map((c, i) => (i ? '' : '—'))];
      const nums = rows.map((r) => r.map((c) => c));
      return { file: form.file, body: AQ.xl(form.title, rb[1], nums, { formula: 'Реквизиты и подписи подставлены из карточки компании', tabs: ['Лист1'] }) };
    }
    const body = AQ.paper(`<div class="ph"><b>${esc(company())}</b><span>${esc(String(v.date || '16.11.2026'))}</span></div><h3 class="pt">${esc(form.title)}</h3>` + (flat.length ? tbl(['Поле', 'Значение'], flat) : '') + rowsBlocks.filter((r) => r[2].length).map((r) => `<p class="mut" style="margin:10px 0 4px">${esc(r[0])}</p>` + tbl(r[1], r[2])).join('') + '<div class="sign"><div><span>Подрядчик</span><i></i>Есеналиев Д.</div><div><span>Заказчик</span><i></i>_______________</div></div>', 'Реквизиты и подписи подставлены автоматически');
    return { file: form.file, body };
  }

  S.docwiz = function (rt) {
    const id = rt.sub[1], F = AQ.D.docforms.forms[id];
    if (!F) return AQ.head('Документ не найден', '', AQ.crumbs()) + '<div class="empty"><h2>Такого вида документа нет</h2><a class="btn pri" href="#/docs/new/stages">К списку видов</a></div>';
    if (!AQ.ui.wiz || AQ.ui.wiz.id !== id) AQ.ui.wiz = { id, step: 0, vals: {}, all: false };
    const W = AQ.ui.wiz, n = F.steps.length, last = W.step === n - 1;
    const stepHtml = (s, i) => `<div class="tile" style="margin-bottom:14px"><div class="lbl"><span>Шаг ${i + 1} из ${n}</span></div><h2 style="font-size:19px">${esc(s.t)}</h2>${s.note ? `<p class="mut" style="margin:4px 0 12px">${esc(s.note)}</p>` : ''}<div class="fgrid">${s.f.map((f) => field(f, W.vals)).join('')}</div></div>`;
    let h = AQ.head(esc(F.title), 'Отвечайте по шагам: реквизиты и данные проекта подставятся сами.', AQ.crumbs() + ' / <a href="#/docs/new/stages">По этапам</a>', '') +
      `<div class="wiz">${F.steps.map((s, i) => `<span class="${i === W.step ? 'on' : (i < W.step ? 'done' : '')}"><b>${i < W.step ? '✓' : i + 1}</b>${esc(s.t.length > 26 ? s.t.slice(0, 24) + '…' : s.t)}</span>`).join('')}</div><div id="wizbody">`;
    h += W.all ? F.steps.map(stepHtml).join('') : stepHtml(F.steps[W.step], W.step);
    h += '</div><div class="btns">';
    if (!W.all && W.step > 0) h += '<button class="btn" data-act="wiz-prev">← Назад</button>';
    if (W.all || last) h += F.out.map((o, i) => `<button class="btn pri" data-act="wiz-out" data-i="${i}">${esc(o[0])}</button>`).join('');
    else h += '<button class="btn pri" data-act="wiz-next">Дальше →</button>';
    h += `<button class="btn ghost" data-act="wiz-all">${W.all ? 'По шагам' : 'Все шаги на одной странице'}</button><a class="btn ghost" href="#/docs/new/stages">Отмена</a></div>`;
    return h;
  };
  const save = () => { const W = AQ.ui.wiz; if (W && $('#wizbody')) Object.assign(W.vals, read($('#wizbody'))); };
  AQ.acts['wiz-next'] = () => { save(); AQ.ui.wiz.step++; AQ.render(); };
  AQ.acts['wiz-prev'] = () => { save(); AQ.ui.wiz.step--; AQ.render(); };
  AQ.acts['wiz-all'] = () => { save(); AQ.ui.wiz.all = !AQ.ui.wiz.all; AQ.render(); };
  AQ.acts['wiz-out'] = (t) => { save(); const W = AQ.ui.wiz, F = AQ.D.docforms.forms[W.id], d = wizDoc(F, W.vals); const first = t.getAttribute('data-i') === '0'; AQ.overlay(`<div class="mh"><div><h2 style="font-size:16px">${esc(d.file)}</h2><span class="mut" style="font-size:12px">Сохранено в «Загрузки» и в «Сделанные документы»</span></div><button class="pill ico" data-act="close" aria-label="Закрыть">✕</button></div>${d.body}`, 'wide'); AQ.D.docsMade.unshift([F.title, AQ.projName(), '16.11.2026', 'Вы']); };
  AQ.acts['wiz-start'] = (t) => { AQ.ui.wiz = null; AQ.go('docs/new/f/' + t.getAttribute('data-id')); };
})();
