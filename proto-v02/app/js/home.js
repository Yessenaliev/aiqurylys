/* v1.5: «Главная» по оригиналу ai-qurylys.kz: «Начало работы», «Шаг N из 3», «Как начать работу», «Готовые расчёты».
   Улучшено оформлением: анимации появления, живые цифры, блок решений и лента для рабочей компании. */
(function () {
  'use strict';
  const AQ = window.AQ, S = AQ.screens, esc = AQ.esc, fmt = AQ.fmt;
  const MON = ['янв.', 'февр.', 'марта', 'апр.', 'мая', 'июня', 'июля', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'];
  const short = (d) => { const p = String(d).split('.'); return (+p[0]) + ' ' + (MON[+p[1] - 1] || ''); };
  const seen = (r) => !!(AQ.hints && AQ.hints.seen(AQ.alias(r).split('/').slice(0, 2).join('/')));

  function stepsFor(role, calcs) {
    if (AQ.can('estimate')) {
      return [
        { t: 'Рассчитайте себестоимость раздела', d: 'Загрузите файлы одного раздела проекта, например только ОВ или только ЭОМ. PDF или DWG, можно несколько файлов.', go: 'calc/est/new', btn: 'Загрузить файлы раздела', done: calcs.length > 0 },
        { t: 'Рассчитайте остальные разделы', d: 'Каждый раздел — отдельный расчёт: ОВ и ВК — два расчёта. Файлы каждого раздела загружаются отдельно.', go: 'calc/est/new', btn: 'Рассчитать следующий раздел', done: calcs.length > 1 },
        { t: 'Соберите свод проекта', d: 'Все разделы проекта — в одном файле Excel: свод и листы разделов.', go: 'calc/svod', btn: 'Собрать свод проекта', done: calcs.length > 2 && seen('calc/svod') }
      ];
    }
    return (role.start || []).filter((s) => AQ.canRoute(s[0])).slice(0, 4).map((s) => ({ t: s[1], d: s[2], go: s[0], btn: 'Открыть', done: seen(s[0]) }));
  }

  S.home = function (rt, ctx) {
    const D = AQ.D, demo = AQ.state.demo, role = AQ.role();
    const calcs = demo ? D.estCalcs : [];
    const steps = stepsFor(role, calcs), N = steps.length, k = steps.filter((s) => s.done).length;
    const curI = steps.findIndex((s) => !s.done), cur = steps[curI];
    const first = (role.name || '').split(' ')[0];
    let h = `<div class="hm"><div class="hmain">`;
    h += `<p class="eyebrow">${esc(AQ.greet())}${first ? ', ' + esc(first) : ''}</p><h1 class="ptitle">Начало работы</h1>`;

    /* карточка текущего шага */
    if (N) {
      h += cur
        ? `<section class="card hstep rv" style="--d:0"><span class="eyebrow acc">Шаг ${curI + 1} из ${N}</span><h2>${esc(cur.t)}</h2><p>${esc(cur.d)}</p><a class="btn pri big" href="#/${cur.go}">${esc(cur.btn)}</a>${AQ.canRoute('calc/est') ? '<a class="lnk" href="#/calc/est">Готовые расчёты</a>' : ''}</section>`
        : `<section class="card hstep ok rv" style="--d:0"><span class="eyebrow ok">Всё готово</span><h2>Основные шаги пройдены</h2><p>Дальше можно оформить акты, проверить КП подрядчика или посмотреть деньги проекта. Цифровой отдел подскажет, с чего начать.</p><a class="btn pri big" href="#/digital">Открыть цифровой отдел</a></section>`;

      /* чек-лист */
      h += `<section class="card rv" style="--d:1"><div class="chead"><b>Как начать работу</b><span>${k} из ${N} готово</span></div>` + steps.map((s, i) => {
        const st = s.done ? 'done' : i === curI ? 'cur' : 'todo';
        return `<a class="stp ${st}" href="#/${s.go}"><span class="sn">${s.done ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path class="tick" d="M5 12.5l4.5 4.5L19 7.5"/></svg>' : i + 1}</span><span class="sb"><b>${esc(s.t)}</b>${s.done ? '<small class="ok">Готово</small>' : st === 'todo' ? '<small>' + esc(s.d) + '</small>' : ''}</span>${st === 'cur' ? '<span class="now">сейчас</span>' : ''}</a>`;
      }).join('') + '</section>';
    }

    /* готовые расчёты */
    if (AQ.canRoute('calc/est')) {
      h += `<section class="card rv" style="--d:2"><div class="chead"><b>Готовые расчёты</b><a href="#/calc/est">Все расчёты</a></div>` + (calcs.length ? calcs.map((c) => `<div class="calcrow"><div class="ci"><b title="${esc(c.n)}">${esc(c.n)}</b><small>${esc(c.project)} · ${short(c.date)} · ${c.pos || 12} позиций</small></div><div class="cb"><button class="btn sm" data-doc="est-xlsx">${AQ.ico('doc')}<span>Excel</span></button>${AQ.canRoute('site/plan') ? `<a class="btn sm" href="#/site/plan">${AQ.ico('site')}<span>График</span></a>` : ''}</div></div>`).join('') : '<p class="mut" style="padding:6px 0 2px">Расчётов пока нет. Первый расчёт бесплатно: загрузите файлы одного раздела проекта.</p>') + '</section>';
    }
    h += '</div>';

    /* боковая колонка: только когда есть данные */
    const dec = (D.decisions || []).filter((d) => AQ.canRoute(d.go));
    if (demo && AQ.canRoute('summary/summary')) {
      h += `<aside class="haside">`;
      h += `<section class="card rv" style="--d:1"><div class="chead"><b>Цифровой отдел сэкономил вам</b><span class="mut">за 30 дней</span></div><div class="hstats"><div><b class="mono acc" data-cnt="${D.kpi.saved}" data-dec="1">0</b><span>млн ₸ · завышения в актах и сметах</span></div><div><b class="mono" data-cnt="${D.kpi.hours}" data-dec="0">0</b><span>часов не пришлось делать руками</span></div></div></section>`;
      if (dec.length) h += `<section class="card rv" style="--d:2"><div class="chead"><b>Что требует решения</b><span class="tag ${dec.some((d) => d.urgent) ? 't-bad' : 't-warn'}">${dec.length}</span></div>` + dec.map((d) => `<a class="dec" href="#/${d.go}"><span class="tag ${d.urgent ? 't-bad' : 't-warn'}">${d.urgent ? 'срочно' : 'решить'}</span><span class="db"><b>${esc(d.t)}</b><small>${esc(d.d)}</small></span></a>`).join('') + '</section>';
    } else if (demo) { h += '<aside class="haside">'; }
    if (demo) {
      h += `<a class="card dept rv" style="--d:3" href="#/digital"><span class="dtop"><span class="dpl"></span><b>Цифровой отдел</b></span><small>${D.agents.length} ИИ-сотрудников работают на вас</small><span class="davs">${D.agents.map((a) => AQ.agIcon(a.id, 'xs', a.n)).join('')}</span></a>`;
      h += `<section class="card rv" style="--d:4"><div class="chead"><b>Сделано за неделю</b><span class="tag t-ok">в эфире</span></div><div class="feed" id="livefeed">` + D.feed.filter((f) => AQ.canRoute(f.go)).map((f) => `<a class="ln pre" href="#/${f.go}"><time>${f.time}</time><div><b>${esc(f.agent)}</b> · ${esc(f.t)}</div></a>`).join('') + '</div></section></aside>';
    }
    h += '</div>';
    ctx.after = function () {
      AQ.$$('[data-cnt]').forEach((el) => AQ.countUp(el, +el.getAttribute('data-cnt'), +el.getAttribute('data-dec'), 1200));
      if (AQ.$('#livefeed')) { AQ.reveal('#livefeed .ln.pre', 360); AQ.later(() => AQ.liveFeed(AQ.$('#livefeed')), 3200); }
    };
    return h;
  };
})();
