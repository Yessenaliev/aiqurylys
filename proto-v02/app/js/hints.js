/* v1.1: мягкие подсказки. Ничего не блокируется: это короткие пояснения, «что дальше» на главной,
   пошаговое «Как пользоваться» по каждому инструменту и сворачивание редких разделов в меню. */
(function () {
  'use strict';
  const AQ = window.AQ, esc = AQ.esc, store = AQ.store;
  const H = () => AQ.H || { sections: {}, tabs: {}, paths: {} };
  const list = (k) => { try { return JSON.parse(store.get(k) || '[]'); } catch (e) { return []; } };
  const add = (k, v) => { const a = list(k); if (a.indexOf(v) === -1) { a.push(v); store.set(k, JSON.stringify(a)); } };

  const q = /[?&]hints=(0|1)/.exec(location.search);
  if (q) store.set('aq_hints', q[1]);

  AQ.hints = {
    on: () => store.get('aq_hints') !== '0',
    seen: (k) => list('aq_seen').indexOf(AQ.alias(k)) !== -1,
    expanded: () => store.get('aq_more') === '1'
  };

  const TABS = () => { if (!AQ._ht) { AQ._ht = {}; Object.keys(H().tabs).forEach((k) => { AQ._ht[AQ.alias(k)] = H().tabs[k]; }); } return AQ._ht; };
  AQ.hints.steps = (k) => TABS()[k] || null;
  const slot = (view, html) => {
    const anchor = view.querySelector('.hrow') || view.querySelector('.pdesc') || view.querySelector('.ptitle') || view.querySelector('.tabs.sc');
    if (anchor) anchor.insertAdjacentHTML('afterend', html); else view.insertAdjacentHTML('afterbegin', html);
  };

  /* вызывается после отрисовки каждого экрана */
  AQ.afterRender = function (route, view) {
    if (route.denied || route.special || !route.sec) return;
    const test = AQ._h != null;              // самопроверка: ничего не запоминаем
    const key = route.sec + '/' + route.tab;
    if (AQ.hints.on()) {
      if (route.sec === 'home') {
        /* у главной свой чек-лист «Как начать работу» */
      } else if (H().sections[route.sec] && (test || list('aq_hd').indexOf(route.sec) === -1)) {
        const s = route.sObj ? route.sObj.t : '';
        slot(view, `<div class="hint" data-hint="${esc(route.sec)}"><span class="hi" aria-hidden="true">i</span><p><b>${esc(s)}.</b> ${esc(H().sections[route.sec])}</p><div class="hb">${TABS()[key] ? '<button class="btn sm" data-act="howto">Показать, как</button>' : ''}<button class="btn sm ghost" data-act="hint-ok">Понятно</button></div></div>`);
        if (!test) add('aq_hd', route.sec);
      }
    }
    if (!test) { add('aq_seen', route.sec); add('aq_seen', key); }
  };

  /* «Как пользоваться» с шагами именно этого инструмента */
  const oldHowto = AQ.acts['howto'];
  AQ.acts['howto'] = function (t) {
    const r = AQ.curRoute(), key = r.sec + '/' + r.tab, st = TABS()[key];
    if (!st) { oldHowto(t); return; }
    const tab = r.tObj || {};
    AQ.overlay(`<div class="mh"><h2>${esc(tab.t || '')}: как пользоваться</h2><button class="pill ico" data-act="close" aria-label="Закрыть">✕</button></div>${tab.d ? `<p class="mut" style="margin-bottom:10px">${esc(tab.d)}</p>` : ''}<div class="steps">${st.map((s, i) => `<div class="step"><span class="n">${i + 1}</span><div><b>${esc(s[0])}</b><small>${esc(s[1])}</small></div></div>`).join('')}</div>${tab.get ? `<p style="margin-top:12px"><b>Результат:</b> ${esc(tab.get)}</p>` : ''}<div class="btns"><a class="btn" href="#/help/guide" data-act="close">Пошаговая инструкция</a><button class="btn pri" data-act="close">Понятно</button></div>`);
  };

  AQ.acts['hint-ok'] = (t) => { const c = t.closest('.hint'); if (c) { add('aq_hd', c.getAttribute('data-hint')); c.remove(); } };
  AQ.acts['more-secs'] = () => { store.set('aq_more', AQ.hints.expanded() ? '0' : '1'); AQ.render(); };
  const setOn = (v) => { store.set('aq_hints', v ? '1' : '0'); AQ.render(); AQ.toast(v ? 'Подсказки включены' : 'Подсказки скрыты. Вернуть: значок профиля → Подсказки'); };
  AQ.acts['hints-off'] = () => setOn(false);
  AQ.acts['hints-toggle'] = () => { AQ.closePop && AQ.closePop(); setOn(!AQ.hints.on()); };
})();
