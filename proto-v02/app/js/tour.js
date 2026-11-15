/* v0.5: «Знакомство с отделом» — цепочка роликов лендинга по ролям + карточки ИИ-сотрудников с видео. */
(function () {
  'use strict';
  const AQ = window.AQ, esc = AQ.esc, $ = AQ.$, $$ = AQ.$$;
  const BASE = '../../media/scenes/';
  const clip = (name) => BASE + (name === 'finance' ? 'finance.mp4' : name + '-to.mp4');
  let state = null;

  function close(markSeen) {
    const el = $('#tour'); if (!el) return;
    if (state) { clearTimeout(state.timer); document.removeEventListener('keydown', state.key); window.removeEventListener('hashchange', state.hash); }
    el.classList.remove('on'); setTimeout(() => el.remove(), 350);
    state = null; AQ.store.set('aq02_tour', '1');
  }

  function open() {
    close();
    const T = AQ.D.tour, scenes = T.scenes, N = scenes.length;
    const video = !AQ.reduced && window.innerWidth > 860;
    const el = document.createElement('div'); el.className = 'tour'; el.id = 'tour';
    el.innerHTML = `<div class="tstage"><div class="tbg"></div><div class="tbg"></div>${video ? '<video class="tv" muted playsinline preload="auto"></video><video class="tv" muted playsinline preload="auto"></video>' : ''}</div><div class="tshade"></div>
      <button class="skip tskip" data-act="tour-end">Пропустить →</button><div class="tbody" id="tbody" aria-live="polite"></div>
      <div class="tnav"><button data-act="tour-prev" aria-label="Назад">←</button><div class="tdots" id="tdots">${scenes.map((s, i) => `<button data-act="tour-go" data-i="${i}" aria-label="Сцена ${i + 1}"></button>`).join('')}</div><button data-act="tour-next" aria-label="Дальше">→</button></div>`;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('on'));
    const bgs = $$('.tbg', el), vids = $$('.tv', el);
    state = { i: -1, tok: 0, cur: 0, timer: null, bg: 0 };
    state.key = (e) => { if (e.key === 'Escape') close(); else if (e.key === 'ArrowRight') go(state.i + 1); else if (e.key === 'ArrowLeft') go(state.i - 1); };
    state.hash = () => close();
    document.addEventListener('keydown', state.key); window.addEventListener('hashchange', state.hash);

    function setBg(name) {
      const nb = bgs[1 - state.bg]; nb.style.backgroundImage = `url(${BASE}${name}.webp)`; nb.classList.add('on'); bgs[state.bg].classList.remove('on'); state.bg = 1 - state.bg;
    }
    function body(s, n) {
      const go = s.go && AQ.canRoute(s.go.split('/').slice(0, 2).join('/')) ? s.go : (s.go ? 'home/today' : '');
      const chips = (s.agents || []).length ? `<div class="tchips"><span>Работает:</span>${s.agents.map((a) => `<b>${esc(a)}</b>`).join('')}</div>` : '';
      $('#tbody').innerHTML = `<div class="tt"><div class="eyebrow">${esc(s.eyebrow)}</div><h2>${esc(s.title)}</h2><p class="tlead">${esc(s.lead)}</p>${s.proof ? `<p class="tproof">${esc(s.proof)}</p>` : ''}${chips}<div class="btns">${n === 0 ? '<button class="btn pri" data-act="tour-next">Поехали →</button>' : (go ? `<button class="btn" data-go="${go}">${esc(s.goLabel || 'Открыть в кабинете')} ↗</button>` : '')}</div></div>`;
      const tt = $('.tt', el); setTimeout(() => tt && tt.classList.add('on'), 40);
    }
    function dots(i) { $$('#tdots button', el).forEach((b, k) => b.classList.toggle('on', k === i)); }
    function playScene(n) {
      const s = scenes[n], tok = ++state.tok; clearTimeout(state.timer);
      const advance = () => { if (state && state.tok === tok) go(n + 1); };
      if (video) {
        const v = vids[1 - state.cur], old = vids[state.cur];
        const want = clip(s.name);
        if (!v.src.endsWith(want.replace('../../', ''))) { v.src = want; }
        v.currentTime = 0; v.onended = advance; v.onloadedmetadata = () => { clearTimeout(state.timer); state.timer = setTimeout(advance, Math.max(6000, (v.duration || 6) * 1000 + 1200)); };
        const pr = v.play(); if (pr && pr.catch) pr.catch(() => { });
        v.onplaying = () => { v.classList.add('on'); old.classList.remove('on'); old.pause(); state.cur = 1 - state.cur; const nx = scenes[n + 1]; if (nx) { old.src = clip(nx.name); old.load(); } };
        state.timer = setTimeout(advance, 9000);
      } else if (!AQ.reduced) { state.timer = setTimeout(advance, 6500); }
    }
    function go(n) {
      if (!state) return;
      if (n < 0) n = 0;
      if (n >= N) { end(); return; }
      state.i = n; $('#tbody').classList.remove('end'); const tb = $('#tbody'); tb.innerHTML = '';
      setBg(scenes[n].name); body(scenes[n], n); dots(n); playScene(n);
    }
    function end() {
      state.i = N; clearTimeout(state.timer); state.tok++; vids.forEach((v) => v.pause()); setBg('finance'); dots(-1);
      const A = AQ.D.agents;
      $('#tbody').classList.add('end');
      $('#tbody').innerHTML = `<div class="tt"><div class="eyebrow">Знакомство завершено</div><h2>${A.length} ИИ-сотрудников на месте</h2><p class="tlead">Каждый видит только то, что доступно роли. Юрист и Документовед — без отдельной сцены: они проверяют договоры и оформляют акты.</p><div class="tag-grid">${A.map((a) => `<div><i>✓</i><b>${esc(a.n)}</b><small>${esc(a.role)}</small></div>`).join('')}</div><div class="btns"><button class="btn pri" data-go="digital">Познакомиться с каждым подробнее</button><button class="btn" data-act="tour-end">Войти в кабинет</button><button class="btn" data-act="tour-again">Посмотреть ещё раз</button></div></div>`;
      setTimeout(() => { const tt = $('.tt', el); tt && tt.classList.add('on'); }, 40);
    }
    state.go = go; go(0);
  }

  AQ.tour = { open, close };
  Object.assign(AQ.acts, {
    'tour-open': () => open(),
    'tour-start': () => { AQ.endWelcome(); open(); },
    'tour-end': () => close(true),
    'tour-next': () => state && state.go(state.i + 1),
    'tour-prev': () => state && state.go(state.i - 1),
    'tour-go': (t) => state && state.go(+t.getAttribute('data-i')),
    'tour-again': () => state && state.go(0)
  });

  /* ---------- карточки ИИ-сотрудников с видео ---------- */
  AQ.agentCardV = function (a) {
    const sc = AQ.D.tour.sceneOf[a.id] || 'intro', ok = AQ.can(a.need);
    const inner = `<div class="agv-bg" style="background-image:url(${BASE}${sc}.webp)"></div><div class="agv-t"><div class="n"><span class="pulse${a.status === 'готов' ? ' w' : ''}"></span>${esc(a.n)}</div><p>${esc(a.role)}</p><p class="agv-last">${esc(a.last)}</p><div class="meta">${ok ? 'сделано за месяц: ' + a.done : 'доступ у другой роли'}</div></div>`;
    return ok ? `<button class="agv" data-scene="${sc}" data-act="agent-scroll" data-id="${a.id}">${inner}</button>` : `<button class="agv dim" data-scene="${sc}" data-toast="Этого ИИ-сотрудника видит другая роль. Доступ раздаёт владелец.">${inner}</button>`;
  };
  AQ.acts['agent-scroll'] = (t) => { const d = document.getElementById('ag-' + t.getAttribute('data-id')); if (d) { d.scrollIntoView({ behavior: AQ.reduced ? 'auto' : 'smooth', block: 'center' }); d.classList.add('flash'); setTimeout(() => d.classList.remove('flash'), 1600); } };
  AQ.agentVideos = function () {
    if (AQ.reduced || window.innerWidth <= 860) return;
    $$('.agv:not(.dim)').forEach((c) => {
      let v = null;
      c.addEventListener('mouseenter', () => { if (!v) { v = document.createElement('video'); v.muted = true; v.loop = true; v.playsInline = true; v.className = 'agv-v'; v.src = BASE + c.getAttribute('data-scene') + '.mp4'; c.insertBefore(v, c.firstChild.nextSibling); } v.play().then(() => v.classList.add('on')).catch(() => { }); });
      c.addEventListener('mouseleave', () => { if (v) { v.classList.remove('on'); v.pause(); } });
    });
  };
})();
