/* v1.5: страница «Ещё» («Кабинет и настройки») и экран «Заведующий складом» по структуре и терминам ai-qurylys.kz. */
(function () {
  'use strict';
  const AQ = window.AQ, S = AQ.screens, esc = AQ.esc;

  const link = (href, t, d, extra) => `<a class="mi" href="${href}"><span class="mt"><b>${esc(t)}</b>${d ? `<small>${esc(d)}</small>` : ''}</span>${extra || ''}<i class="mch">›</i></a>`;
  const secOf = (id) => AQ.M.sections.filter((s) => s.id === id)[0];

  S._more = function (rt, ctx) {
    const M = AQ.M, r = AQ.role(), owner = r.company;
    let h = `<div class="more"><h1 class="ptitle">Ещё</h1><p class="mut">Вы вошли как: ${esc(r.n)} · ${esc(r.name)}</p>`;
    h += `<div class="mtop"><button class="btn" data-act="palette">${AQ.ico('search')}<span>Поиск по системе</span></button><button class="btn pri" data-act="new-project">Завести проект</button></div>`;

    /* проект выбирается здесь и действует во всех разделах */
    h += AQ.state.demo ? `<div class="card" style="margin-top:12px"><div class="chead"><b>Проект</b><span class="mut">действует во всех разделах</span></div><select id="projSel" style="width:100%">${AQ.D.projects.map((p) => `<option value="${p.id}"${p.id === (AQ.ui.proj || 'ceh') ? ' selected' : ''}>${esc(p.n)}</option>`).join('')}</select></div>` : '<div class="card" style="margin-top:12px"><div class="chead"><b>Проект</b></div><p class="mut">Проект не выбран. Заведите первый проект: к нему привяжутся расчёты, акты, задачи и деньги.</p></div>';

    /* разделы: то, что было в левом меню */
    h += `<div class="mh2"><h2>Разделы</h2>${owner ? '<a class="lnk" href="#/company/team/sections">Убрать лишние</a>' : ''}</div><p class="mut" style="margin:-4px 0 10px">Рабочие места по должностям — то, что было в левом меню</p>`;
    M.more.forEach((g) => {
      const items = g.items.map((id) => {
        if (id === 'help') return link('#/help', 'Инструкция', M.helpSd);
        const s = secOf(id); if (!s || AQ.tabsOf(s).length === 0 || AQ.hiddenFor(s)) return '';
        return link('#/' + id + '/' + AQ.tabsOf(s)[0].id, s.t === 'Проекты' ? 'Проекты компании' : s.t, s.sd);
      }).join('') + (g.g === 'Главное' ? link('#/digital', 'Цифровой отдел', AQ.D.agents.length + ' ИИ-сотрудников: кто что делает и что вы получаете', '<span class="tag t-mute">прототип</span>') : '');
      if (items) h += `<div class="mg"><div class="grp">${esc(g.g)}</div><div class="mlist">${items}</div></div>`;
    });

    /* личный кабинет */
    h += `<div class="mh2"><h2>Личный кабинет</h2></div><div class="mlist">` +
      link('#/profile', 'Профиль и вход', 'Имя, почта, пароль, язык и тема') + link('#/tasks/mine', 'Мои задачи', 'Поручения, сроки и отметки о сдаче') + link('#/notif', 'Уведомления', 'О чём сообщать на сайте') + link('#/support', 'Мои обращения', 'Вопросы в поддержку и ответы на них') + link('#/bot', 'Telegram-бот', 'Задачи и отчёты с телефона') + '</div>';

    /* мой доступ */
    const mine = M.access.filter((a) => a[0] === r.n)[0];
    h += `<div class="mh2"><h2>Мой доступ</h2></div><div class="card"><p>${owner ? 'Владелец: открыто всё, включая деньги компании и людей.' : esc(r.n) + ': ' + esc(mine ? mine[1] : '')}</p></div>`;

    /* кабинет компании */
    if (owner) {
      h += `<div class="mh2"><h2>Кабинет компании</h2><span class="tag t-mute">Видит только владелец</span></div><div class="mlist">` +
        link('#/company/req', 'Реквизиты компании', 'Реквизиты для договоров, актов и тендеров') + link('#/company/team', 'Сотрудники и доступ', 'Приглашения, должности и разделы людей') + link('#/company/tariff', 'Тарифный пакет', 'Доля предела и срок продления') + link('#/company/tariff/up', 'Улучшить план', 'Цена для своей компании и заявка') + link('#/company/drive', 'Google Диск', 'Папки проектов, ночной поиск новых файлов') + link('#/company/team/sections', 'Список разделов', 'Какие разделы показывать сотрудникам') + '</div>';
    }

    /* доступ по должностям */
    h += `<div class="mh2"><h2>Доступ по должностям</h2></div><p class="mut" style="margin:-4px 0 10px">Что видит каждая должность. Деньги компании и сотрудники — только у владельца.</p><div class="roles">` +
      M.access.filter((a) => a[0] !== 'Владелец').map((a) => `<div class="card rc"><div class="chead"><b>${esc(a[0])}</b><span class="tag t-mute">${a[2] || ''}</span></div><p class="mut">${esc(a[1])}</p></div>`).join('') + '</div>';

    /* помощь */
    h += `<div class="mh2"><h2>Помощь</h2></div><div class="mlist">` + link('#/help', 'Инструкция', 'Пошаговая инструкция, статьи, словарь, чек-листы и курсы по ролям') + link('#/support', 'Поддержка', 'Написать вопрос или сообщить об ошибке') + '</div>';

    /* язык, тема, выход */
    const light = document.documentElement.getAttribute('data-theme') === 'light';
    h += `<div class="mfoot"><div class="seg"><button class="on" data-toast="Язык интерфейса: русский">Рус</button><button data-toast="Қазақша — скоро, в рабочей версии">Қаз</button></div><div class="seg"><button class="${light ? 'on' : ''}" data-act="theme-day">День</button><button class="${light ? '' : 'on'}" data-act="theme-night">Ночь</button></div><button class="btn" data-act="logout">Выйти</button></div>`;

    /* режим прототипа */
    h += `<div class="card protocard"><div class="chead"><b>Режим прототипа</b><span class="tag t-mute">не часть сайта</span></div><div class="pc"><label>Смотреть как <select id="roleSel3">${M.roles.map((x) => `<option value="${x.id}"${x.id === r.id ? ' selected' : ''}>${esc(x.n)}</option>`).join('')}</select></label><span class="demo-toggle${AQ.state.demo ? ' on' : ''}" data-act="demo" role="switch" aria-checked="${AQ.state.demo}" tabindex="0"><span class="sw"></span>Демо-данные</span><span class="demo-toggle${AQ.state.trial ? ' on' : ''}" data-act="trial-toggle" role="switch" aria-checked="${!!AQ.state.trial}" tabindex="0" title="Работает без демо-данных: как у нового клиента после первого расчёта"><span class="sw"></span>Проба использована</span></div></div></div>`;
    ctx.after = () => { const rs = AQ.$('#roleSel3'); if (rs) rs.addEventListener('change', () => AQ.setRole(rs.value)); const ps = AQ.$('#projSel'); if (ps) ps.addEventListener('change', () => { AQ.ui.proj = ps.value; AQ.toast('Проект: ' + AQ.projName()); }); };
    return h;
  };
  AQ.acts['trial-toggle'] = () => { AQ.state.trial = !AQ.state.trial; AQ.store.set('aq02_trial', AQ.state.trial ? '1' : '0'); AQ.render(); AQ.toast(AQ.state.trial ? (AQ.state.demo ? 'Проба использована: включите «Демо-данные» выключенными, чтобы увидеть как у нового клиента' : 'Проба использована: Тендеры и закупки и Себестоимость закрыты до подключения тарифа') : 'Проба снова доступна'); };
  AQ.acts['theme-day'] = () => { document.documentElement.setAttribute('data-theme', 'light'); AQ.store.set('aq02_theme', 'light'); AQ.render(); };
  AQ.acts['theme-night'] = () => { document.documentElement.setAttribute('data-theme', 'dark'); AQ.store.set('aq02_theme', 'dark'); AQ.render(); };

  /* у пробного аккаунта над разделом полоса, как на оригинале */
  const TRIAL = ['sales', 'calc', 'money', 'supply', 'legal', 'site', 'master', 'warehouse', 'pto', 'docs', 'tech', 'arch'];
  const prevAR = AQ.afterRender;
  AQ.afterRender = function (route, view) {
    if (prevAR) prevAR(route, view);
    if (!AQ.state.demo && !route.special && route.sObj && TRIAL.indexOf(route.sec) !== -1 && AQ.role().company && !AQ.locked(route.sec)) view.insertAdjacentHTML('afterbegin', `<div class="trialbar">Пробный доступ: раздел «${esc(route.sObj.trial || route.sObj.t)}» можно попробовать один раз, файлы — до 2 МБ за один раз.</div>`);
  };

  /* Заведующий складом: склад проекта, приход, остатки */
  S.warehouse = function (rt, ctx) {
    const D = AQ.D, p = D.projects.filter((x) => x.id === (AQ.ui.proj || 'ceh'))[0] || D.projects[0];
    let h = AQ.tabHead(rt) + `<div class="bento"><div class="tile s7"><div class="lbl"><span>Остатки · ${esc(p.n)}</span></div>${AQ.projTab('stock', p) || ''}</div>` +
      `<div class="tile s5"><div class="lbl"><span>Принять приход</span></div><p class="mut">Накладная с подписью «накладная»: фото или файл. Приход попадёт на склад проекта и в финансы.</p><div class="btns"><button class="btn pri" data-toast="Приход принят: Бетон В25, 400 м³ записан на склад проекта">Принять приход</button><button class="btn" data-toast="Списано по норме: кладка 28 м³, кирпич 1 100 шт.">Списать по норме</button></div></div></div>`;
    h += `<div class="tile" style="margin-top:14px"><div class="lbl"><span>Приход материалов</span></div>${AQ.tbl(['Дата', 'Поставщик', 'Материал', 'Кол-во', 'Сумма, ₸', 'Статус'], D.receipts, { r: [4] })}</div>`;
    return h + AQ.wasBlock(rt.tObj);
  };
})();
