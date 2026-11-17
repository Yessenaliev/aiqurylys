/* v1.4: «что мы продаём» по логике презентации (листы 8–9 и 14): пакеты, что в них входит, что подключено.
   Плашка над разделом, бейджи на карточках отдела и подсветка пакета на странице «Цифровой отдел». */
(function () {
  'use strict';
  const AQ = window.AQ, esc = AQ.esc;

  /* продукты (цены с листа «Сколько стоит AIQurylys») */
  const P = {
    project: { n: 'Проект', price: 'от 250 000 ₸ за проект в месяц', who: 'Генподрядчик', d: 'Все альбомы проекта и все разделы' },
    album: { n: 'Альбом', price: '50 000 ₸ за альбом в месяц', who: 'Подрядчик и субподрядчик', d: 'Один альбом одного проекта' },
    tenders: { n: 'Тендеры', price: '50 000 ₸ в месяц', who: 'Для любой компании', d: 'Поиск и подборка тендеров под вашу компанию' },
    calc: { n: 'Расчёты', price: 'от 8 000 ₸ за расчёт', who: 'Для всех одинаково', d: '1 расчёт = 1 альбом проекта, не сгорают' }
  };
  /* какие продукты открывают сотрудника (таблица «Что открывает пакет») */
  const AG = {
    tender: ['tenders'],
    estimator: ['project', 'album', 'calc'],
    supply: ['project', 'album'],
    lawyer: ['project', 'album'],
    site: ['project', 'album'],
    foreman: ['project', 'album'],
    checker: ['project', 'album'],
    docs: ['project', 'album'],
    finance: ['project', 'album'],
    equip: ['project', 'album']
  };
  /* какой сотрудник стоит за вкладкой */
  const SEC = {
    'calc/est': 'estimator', 'calc/svod': 'estimator', 'calc/check': 'estimator', 'calc/offer': 'estimator',
    'calc/vol': 'checker', 'calc/vcmp': 'checker',
    'docs/new': 'docs', 'docs/made': 'docs',
    'legal/contracts': 'lawyer', 'legal/review': 'lawyer', 'legal/letter': 'lawyer', 'legal/chat': 'lawyer',
    'site/chief': 'site', 'site/plan': 'site', 'site/master': 'foreman', 'site/norms': 'foreman', 'site/tech': 'equip',
    'money/fin': 'finance', 'money/budget': 'finance', 'money/sup': 'supply', 'money/price': 'supply', 'money/out': 'supply', 'money/subs': 'supply',
    'sales/tender': 'tender', 'sales/passport': 'tender', 'sales/demand': 'tender'
  };
  AQ.sold = { P, AG, SEC };

  const T = () => AQ.D.tariff;
  const owner = () => AQ.canRoute('company/tariff');
  const cta = (label) => (owner() ? `<a class="btn sm" href="#/company/tariff/up">${label || 'Условия'}</a>` : '');

  /* плашка: compact для карточек, полная для шапки раздела */
  AQ.soldChip = function (id, compact) {
    const pr = AG[id];
    if (!pr) return '';
    const t = T(), left = t.calcTotal - t.calcUsed, demo = AQ.state.demo;
    if (pr.indexOf('tenders') !== -1) {
      return compact
        ? '<p class="sold no"><b>Подписка «Тендеры»</b> · 50 000 ₸ в месяц · не подключена</p>'
        : `<div class="soldline no"><span class="sdot"></span><div><b>Подписка «Тендеры»: 50 000 ₸ в месяц, не подключена.</b> Поиск и подборка тендеров под вашу компанию. Выгоду тендера считают расчёты себестоимости.</div>${cta('Подключить')}</div>`;
    }
    const calc = pr.indexOf('calc') !== -1;
    if (demo) {
      const base = compact
        ? `<p class="sold ok"><b>✓ Входит в «Проект»</b>${calc ? ` · расчётов ${left} из ${t.calcTotal}` : ''}</p>`
        : `<div class="soldline ok"><span class="sdot"></span><div><b>Входит в вашу подписку «Проект» до ${esc(t.until)}.</b> ${calc ? `Расчётов осталось ${left} из ${t.calcTotal}, докупить можно от 8 000 ₸ за расчёт. ` : ''}Подрядчику тот же раздел открывает «Альбом»: 50 000 ₸ за альбом в месяц.</div>${cta()}</div>`;
      return base;
    }
    return compact
      ? `<p class="sold try"><b>Попробуйте бесплатно</b> · «Знакомство»${calc ? ': 1 расчёт' : ': один раз'}</p>`
      : `<div class="soldline try"><span class="sdot"></span><div><b>«Знакомство» — бесплатно:</b> ${calc ? 'один расчёт себестоимости на всё время' : 'раздел можно попробовать один раз'}. Дальше: «Проект» от 250 000 ₸ за проект или «Альбом» 50 000 ₸ за альбом в месяц.</div>${cta('Тарифы')}</div>`;
  };

  /* состояние продуктов для переключателя на странице отдела */
  AQ.soldState = function () {
    const t = T(), demo = AQ.state.demo, left = t.calcTotal - t.calcUsed;
    return {
      project: demo ? ['ok', 'подключён'] : ['try', 'пробуете'],
      album: ['no', 'не подключён'],
      tenders: ['no', 'не подключён'],
      calc: demo ? ['ok', 'осталось ' + left + ' из ' + t.calcTotal] : ['try', '1 бесплатно']
    };
  };

  /* плашка над разделом */
  const prev = AQ.afterRender;
  AQ.afterRender = function (route, view) {
    if (prev) prev(route, view);
    if (route.denied || route.special || !route.sec) return;
    const id = SEC[route.sec + '/' + route.tab];
    if (!id) return;
    const html = AQ.soldChip(id, false);
    if (!html) return;
    const anchor = view.querySelector('.hrow') || view.querySelector('.pdesc') || view.querySelector('.ptitle');
    if (anchor) anchor.insertAdjacentHTML('afterend', html);
  };

  /* подсветка пакета на странице «Цифровой отдел» */
  AQ.acts['lens'] = (t) => {
    const p = t.getAttribute('data-p'), was = AQ.ui.lens === p;
    AQ.ui.lens = was ? '' : p;
    AQ.$$('.pbtn').forEach((b) => b.classList.toggle('on', b.getAttribute('data-p') === AQ.ui.lens));
    AQ.$$('.dcard').forEach((c) => {
      const has = (c.getAttribute('data-prod') || '').split(' ').indexOf(AQ.ui.lens) !== -1;
      c.classList.toggle('lit', !!AQ.ui.lens && has);
      c.classList.toggle('mute', !!AQ.ui.lens && !has);
    });
    const n = AQ.$$('.dcard.lit').length;
    const note = AQ.$('#lensnote');
    if (note) note.textContent = AQ.ui.lens ? `«${P[AQ.ui.lens].n}» открывает ${n} из ${AQ.$$('.dcard').length} сотрудников. ${P[AQ.ui.lens].d}.` : 'Нажмите на пакет, и сотрудники, которых он открывает, подсветятся.';
  };
})();
