/* v1.6: детали шапок разделов по оригиналу ai-qurylys.kz: «Задачи», «Проекты», прокрутка к нужному блоку. */
(function () {
  'use strict';
  const AQ = window.AQ, esc = AQ.esc;
  const prev = AQ.afterRender;
  AQ.afterRender = function (route, view) {
    if (prev) prev(route, view);
    if (route.denied || route.special || !route.sec) return;
    if (AQ.locked && AQ.locked(route.sec)) return;
    const h1 = view.querySelector('.ptitle');
    if (!h1) return;
    const demo = AQ.state.demo;
    if (route.sec === 'tasks') {
      const me = (AQ.role().name || '').split(' ')[0];
      h1.insertAdjacentHTML('afterend', `<p class="tsum"><b>${esc(me)}: ${demo ? 3 : 0}</b> · Выдано команде: ${demo ? 4 : 0}</p><p class="mut" style="margin:-2px 0 10px">Внесённый объём сразу попадает в график и в акт за месяц</p>`);
    } else if (route.sec === 'projects' && route.tab === 'list') {
      const n = demo ? AQ.D.projects.filter((p) => p.status === 'В работе').length : 0;
      h1.insertAdjacentHTML('afterend', `<p class="tsum">${AQ.plural(n, 'проект', 'проекта', 'проектов')} в работе</p>`);
    }
  };
  AQ.acts['scrollto'] = (t) => { const el = document.querySelector(t.getAttribute('data-t')); if (el) el.scrollIntoView({ behavior: AQ.reduced ? 'auto' : 'smooth', block: 'start' }); };
})();
