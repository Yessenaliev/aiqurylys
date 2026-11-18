/* v1.7: формы внутри вкладок по оригиналу ai-qurylys.kz: поля, подсказки и тексты сняты с сайта (только чтение). */
(function () {
  'use strict';
  const AQ = window.AQ, S = AQ.screens, esc = AQ.esc, fmt = AQ.fmt, $ = AQ.$, $$ = AQ.$$, F = AQ.form;
  const tile = (lbl, inner) => `<div class="tile"><div class="lbl"><span>${lbl}</span></div>${inner}</div>`;
  const after = (html, marker, add) => { const i = html.indexOf(marker); return i < 0 ? html + add : html.slice(0, i) + add + html.slice(i); };
  const tabsEnd = (html, nth) => { let i = -1; for (let n = 0; n <= (nth || 0); n++) i = html.indexOf('tabs sc', i + 1); return i < 0 ? 0 : html.indexOf('</div>', i) + 6; };
  const stabs2 = (base, items, cur) => '<div class="tabs sc" style="margin-top:-6px">' + items.map((i, k) => `<a class="tab${i[0] === cur ? ' on' : ''}" href="#/${i[2] || (k === 0 ? base : base + '/' + i[0])}">${esc(i[1])}</a>`).join('') + '</div>';

  /* ---------- Проекты: «Новый проект» ---------- */
  AQ.acts['new-project'] = () => AQ.formModal({
    title: 'Новый проект',
    top: '<div class="tile" style="margin-bottom:12px"><b>Из папки или архива .zip</b> <span class="tag t-mute">По подписке</span><p class="mut" style="margin-top:4px">Договор, ведомость объёмов, график, акты и накладные разложатся сами. Или заполните вручную ниже.</p></div>',
    submit: 'Создать проект', req: ['n', 'r'],
    fields: [['n', 'Название проекта *', 'text', '', 'Коротко и узнаваемо — это имя будет во всех документах и списках.'], ['a', 'Адрес', 'text', ''], ['r', 'Роль вашей компании на проекте *', 'radio', ['генподрядчик', 'субподрядчик'], 'Обязательно и без умолчания: от этого зависит, кем ваша компания подставится в договорах и актах.'], ['c', 'Заказчик или генподрядчик', 'text', ''], ['s', 'Субподрядчик', 'text', ''], ['t', 'Технадзор', 'text', ''], ['p', 'Проектная организация', 'text', ''], ['d', 'Примечание', 'area', '']],
    foot: 'Сумма договора вносится отдельно — в карточке проекта, вместе с обоснованием.',
    done: (v) => { const n = v.n || 'Новый проект'; AQ.D.projects.unshift({ id: 'new' + Date.now() % 1000, n, city: (v.a || '').replace(/^г\.\s*/, '').split(',')[0] || 'Астана', fresh: true, status: 'В работе', pct: 0, contract: 0, spent: 0, late: 0, img: 'cottage.jpg', customer: v.c || '—', end: '—' }); AQ.render(); AQ.toast('Проект «' + n + '» создан. Сумма договора вносится в карточке проекта'); }
  });

  /* ---------- Задачи: «Выдать задание» ---------- */
  const issued0 = S.issued;
  S.issued = (rt, ctx) => issued0(rt, ctx)
    .replace('<div class="lbl"><span>Выдать задание</span></div>', '<div class="lbl"><span>Выдать задание</span></div><p class="mut" style="margin-bottom:8px">Человек увидит задание у себя в «Задачах» и получит сообщение в Telegram-бот</p>')
    .replace('Задание придёт прорабу в Telegram с кнопкой «Взял в работу».', 'Исполнитель видит задание у себя на сайте и в Telegram-боте.');

  /* ---------- Сотрудники и доступ ---------- */
  AQ.acts['invite'] = () => {
    const roles = AQ.M.roles.filter((r) => r.id !== 'owner'), demo = AQ.state.demo;
    const acc = (n) => { const a = AQ.M.access.filter((x) => x[0] === n)[0]; return a ? a[1] : ''; };
    AQ.overlay(`<div class="mh"><div><h2>Пригласить сотрудника</h2><span class="mut" style="font-size:13px">Человек входит по коду: на сайте или в Telegram-боте</span></div><button class="pill ico" data-act="close" aria-label="Закрыть">✕</button></div>${demo ? '' : '<div class="trialbar">Мест по тарифу «Знакомство»: занято 1 из 1. Чтобы приглашать сотрудников, улучшите план: в подписке людей без ограничения.</div>'}<div class="fgrid" id="invf"><label class="ff">Должность<select data-k="role" id="invrole">${roles.map((r) => `<option>${esc(r.n)}</option>`).join('')}</select><small class="fh" id="invhint">${esc(acc(roles[0].n))}</small></label><div class="ff"><span>Проекты</span><div class="seg2"><label class="rad"><input type="radio" name="invp" data-k="proj" value="Все проекты компании" checked> Все проекты компании</label><label class="rad"><input type="radio" name="invp" data-k="proj" value="Только отмеченные"> Только отмеченные</label></div><div id="invpl" style="display:none;margin-top:6px">${AQ.D.projects.map((p) => `<label class="rad" style="display:block"><input type="checkbox"> ${esc(p.n)}</label>`).join('')}<small class="fh">Ничего не отмечено: после входа человек не увидит ни одного проекта, пока их не отметит владелец.</small></div></div><label class="ff">Имя<input data-k="name" placeholder="Например: Ерлан Б."><small class="fh">Для себя: так приглашение будет подписано в списке.</small></label><label class="ff">Почта<input data-k="mail" type="email"><small class="fh">Необязательно.</small></label></div><div class="btns"><button class="btn pri" data-act="invite-go">Выписать код</button><button class="btn" data-act="close">Отмена</button></div>`);
    const sel = $('#invrole'); if (sel) sel.addEventListener('change', () => { $('#invhint').textContent = acc(sel.value); });
    $$('#invf input[name="invp"]').forEach((r) => r.addEventListener('change', () => { $('#invpl').style.display = r.checked && r.value === 'Только отмеченные' ? 'block' : 'none'; }));
  };
  AQ.acts['invite-go'] = () => {
    const v = F.read($('#invf')), code = 'AQ-' + Math.random().toString(36).slice(2, 6).toUpperCase() + '-' + (100 + Math.floor(Math.random() * 900));
    if (AQ.state.demo) AQ.D.team.push({ n: v.name || 'Новый сотрудник', role: v.role, mail: v.mail || '—', state: 'Приглашён', last: '—' });
    AQ.overlay(`<div class="mh"><h2>Код приглашения</h2><button class="pill ico" data-act="close" aria-label="Закрыть">✕</button></div><p class="mut">${esc(v.name || 'Сотрудник')} · ${esc(v.role)}</p><div class="tile" style="text-align:center;margin:10px 0"><b class="mono" style="font-size:28px;letter-spacing:.1em">${code}</b></div><p class="mut" style="font-size:13px">Человек вводит код на сайте или в Telegram-боте @AIQurylys_Bot. В прототипе код условный.</p><div class="btns"><button class="btn pri" data-act="close">Готово</button></div>`);
    if (AQ.state.demo) setTimeout(() => AQ.render(), 0);
  };
  const team0 = S.team;
  const SEC_GROUPS = [['Главное', ['Главная', 'Сводка по компании', 'Инструкция']], ['Продажи и продвижение', ['Тендеры и закупки']], ['Себестоимость и объёмы', ['Себестоимость']], ['Финансы и снабжение', ['Финансист', 'Снабженец']], ['Договоры', ['Юрист']], ['Строительная площадка', ['Начальник участка', 'Прораб/Мастер участка', 'ПТО', 'Инженер тех документации', 'Инспектор техники', 'ГИП']], ['Проекты и документы', ['Проекты компании', 'Хранилище']]];
  const MODULES = [['Сводка по компании', 'Деньги, сроки и отставания по всем проектам'], ['Инженер тех документации', 'Акты Р-1 и 2В, наряды, акты скрытых работ'], ['Юрист', 'Договоры, проверка договоров, претензии и письма'], ['Себестоимость', 'Расчёт по чертежам, свод проекта, проверка КП от подрядчика'], ['Сверка акта с проектом', 'Акт подрядчика и КП в сравнении с проектом'], ['Финансист', 'План и факт расходов, себестоимость, прогноз по бюджету'], ['Снабженец', 'Цены материалов, поставщики и запросы цен'], ['Строительная площадка', 'Начальник участка, прораб/мастер и заведующий складом: график, задания, объём за день, склад проекта, подрядчики'], ['Инспектор техники', 'Парк техники, обслуживание, доходы и расходы'], ['ГИП — главный инженер проекта', 'Концепт проекта: планы, фасады, генплан'], ['Тендеры и закупки', 'Список тендеров, подходящих вашей компании, и разбор объявления'], ['Telegram-бот', 'Бот компании целиком: задачи, объём за день, вопросы по проекту']];
  S.team = function (rt, ctx) {
    const cur = rt.sub[0] || 'people';
    if (cur === 'sections') {
      const items = [['people', 'Сотрудники'], ['sections', 'Список разделов'], ['access', 'Доступ по должностям']];
      return AQ.tabHead(rt) + stabs2('company/team', items, cur) + tile('Список разделов', `<p class="mut" style="margin-bottom:10px">Какие разделы видят сотрудники компании в «Ещё». У всех сотрудников компании: на странице «Ещё», в поиске и на главной. Снимите галочку у разделов, которыми не пользуетесь, и расставьте стрелками: наверху — то, что открываете каждый день. Скрытый раздел остаётся доступным по ссылке и из карточки проекта.</p>` + SEC_GROUPS.map((g) => `<div class="row" style="display:block"><div style="display:flex;gap:8px;align-items:center"><b style="flex:1">${esc(g[0])}</b><button class="btn sm ghost" data-toast="Группа сдвинута выше">▲</button><button class="btn sm ghost" data-toast="Группа сдвинута ниже">▼</button></div>${g[1].map((s) => `<label style="display:flex;gap:8px;align-items:center;margin:8px 0 0 12px;cursor:pointer"><input type="checkbox" checked style="width:16px;height:16px"><span style="flex:1">${esc(s)}</span><button type="button" class="btn sm ghost" data-toast="Раздел сдвинут выше">▲</button><button type="button" class="btn sm ghost" data-toast="Раздел сдвинут ниже">▼</button></label>`).join('')}</div>`).join('') + '<div class="btns"><button class="btn" data-toast="Возвращено как было">Вернуть как было</button></div><p class="mut" style="font-size:12px">Галочка — показывать в меню; стрелки — порядок. Сохраняется сразу.</p>') +
        tile('Выключить раздел целиком', '<p class="mut" style="margin-bottom:8px">Снятая галочка закрывает раздел у всех сотрудников компании — из меню, с главной, по ссылке и из бота; роли решают уже внутри включённого. Вернуть можно в любой момент.</p>' + MODULES.map((s) => `<label class="row" style="cursor:pointer"><div><b>${esc(s[0])}</b><small>${esc(s[1])}</small></div><input type="checkbox" checked style="width:18px;height:18px"></label>`).join(''));
    }
    let h = team0(rt, ctx);
    if (cur === 'people') {
      const used = AQ.state.demo ? AQ.D.team.length : 1;
      h = h.replace('<div><span>Хранилище</span><b class="mono">0,3 из 1 ГБ</b></div>', `<div><span>Места по тарифу «${AQ.state.demo ? 'Проект' : 'Знакомство'}»</span><b class="mono">${AQ.state.demo ? used + ' · без ограничения' : '1 из 1'}</b><small class="mut">${AQ.state.demo ? 'людей в подписке без ограничения' : 'свободных мест нет'}</small></div>`);
      h += '<p class="mut" style="font-size:12.5px;margin-top:10px">Нажмите на строку — откроются должность, проекты, дополнительные разделы. Изменения действуют сразу: на сайте со следующего действия, в боте со следующего сообщения. Какие разделы видны всем сотрудникам — в «Списке разделов».</p>';
    }
    return h;
  };

  /* ---------- Юрист ---------- */
  AQ.acts['contract-new'] = () => AQ.formModal({
    title: 'Новый договор', lead: 'Договор и приложения из реквизитов компании.', submit: 'Составить договор', req: ['kind'],
    fields: [
      ['kind', 'Вид договора', 'select', ['Договор подряда · СМР-…', 'Договор на проектирование · ПИР-…', 'Договор поставки · ТМЦ-…', 'Договор оказания услуг · УСЛ-…']],
      ['tpl', 'Образец договора', 'select', ['Стандартный · текст AIQurylys', 'Загрузить свой образец (.docx)'], 'Договор собирается стандартным текстом. Загрузите договор вашей компании в Word — система найдёт в нём номер, дату, контрагента и сумму и будет собирать новые договоры в вашем виде.'],
      ['proj', 'Проект', 'project', '', 'Из проекта берётся номер договора (продолжаем серию реестра) и адрес.'],
      ['num', '№ договора', 'text', 'СМР-001', 'Проект не выбран: номер по общей серии СМР-…; выберите проект, и номер продолжит его реестр'],
      ['city', 'Город', 'text', 'Астана'], ['dt', 'Дата заключения', 'date'], ['pname', 'Проект (как печатать в договоре)', 'text', ''],
      ['subj', 'Предмет — какие работы', 'area', ''],
      ['side', 'Стороны — кто мы в этом договоре', 'radio', ['Мы — Заказчик', 'Мы — Подрядчик'], ''],
      ['cp', 'Подрядчик — контрагент', 'text', '', 'Карточка предприятия, счёт']
    ],
    foot: AQ.state.demo ? '' : 'В реквизитах компании не заполнено: юр. наименование, БИН, адрес, банк и ИИК, подписант. Эти поля выйдут в договоре прочерком — выдумывать БИН и ИИК система не станет. Заполнить один раз.',
    done: (v) => { const q = AQ.D.requisites, kind = (v.kind || '').split(' · ')[0]; AQ.overlay(`<div class="mh"><h2 style="font-size:16px">${esc(kind)}.docx</h2><button class="pill ico" data-act="close" aria-label="Закрыть">✕</button></div>` + AQ.paper(`<div class="ph"><b>${esc(kind)} № ${esc(v.num || 'СМР-001')}</b><span>г. ${esc(v.city || 'Астана')}</span></div><p><b>${esc(AQ.state.demo ? q[0][1] : 'Yessenaliev')}</b>, БИН ${AQ.state.demo ? esc(q[1][1]) : '—'}, и <b>${esc(v.cp || 'контрагент')}</b> заключили договор.</p><p><b>1. Предмет.</b> ${esc(v.subj || '—')}</p><p><b>2. Стороны.</b> ${esc(v.side || '—')}</p><p><b>3. Реквизиты.</b> ${AQ.state.demo ? esc(q[2][1]) + '. ' + esc(q[3][1]) : 'не заполнены: выйдут прочерком'}.</p>`, 'Реквизиты подставлены из карточки компании'), 'wide'); }
  });

  const review0 = S.review;
  S.review = function (rt, ctx) {
    let h = review0(rt, ctx).replace(/<div class="btns"><button class="btn" data-doc="protocol">Составить протокол разногласий<\/button><button class="btn" data-toast="Договор загружен[^>]*>Загрузить другой договор<\/button><\/div>/, '');
    const j = tabsEnd(h, h.split('tabs sc').length > 2 ? 1 : 0);
    const intro = `<details class="tile" open style="margin-bottom:12px"><summary style="cursor:pointer;font-weight:700">Как читать проверку</summary><p class="mut" style="margin-top:6px">Загрузите договор, который прислали на подпись. Ядро проверки — код: пороги и цитаты, одинаковые при каждой проверке. AIQurylys добавляет отдельным блоком то, чего в списке нет. Из найденных замечаний ниже собирается протокол разногласий — документ для контрагента.</p></details>${tile('Проверить договор', '<div class="drop">Word (.docx, .doc) или PDF — подойдёт и скан подписанного договора. Проверка занимает до минуты, скан читается дольше — до 2–3 минут.<div class="btns" style="justify-content:center"><button class="btn pri" data-toast="Договор загружен: Договор_17.docx, проверка займёт до минуты">Выбрать файл</button></div></div><div class="btns"><button class="btn" data-doc="protocol">Составить протокол разногласий без загрузки договора</button></div>')}`;
    return h.slice(0, j) + intro + h.slice(j);
  };

  const LS = () => AQ.ui.letter2 || (AQ.ui.letter2 = { kind: 'Претензия', reason: 'Не оплатили' });
  S.letter = function (rt, ctx) {
    const st = LS(), reasons = ['Не оплатили', 'Сорвали срок', 'Брак или не то поставили', 'Другое'];
    const body = () => { const v = F.read($('#lf3')) || {}, q = AQ.D.requisites, txt = ({ 'Не оплатили': `Работы по договору выполнены и приняты${v.act ? ', акт подписан ' + v.act.split('-').reverse().join('.') : ''}. Оплата в срок не поступила. Просим оплатить ${fmt(+v.sum || 0)} ₸ и неустойку.`, 'Сорвали срок': 'Срок выполнения работ по договору нарушен. Просим завершить работы в течение 5 рабочих дней и уплатить неустойку.', 'Брак или не то поставили': 'Поставленный товар или выполненная работа не соответствуют договору. Просим устранить недостатки или заменить в течение 5 рабочих дней.', 'Другое': 'Просим рассмотреть настоящее письмо.' })[st.reason]; return AQ.paper(`<div class="ph"><b>${esc(AQ.state.demo ? q[0][1] : 'Yessenaliev')}</b><span>Исх. № 2 от 18.11.2026</span></div><h3 class="pt">${esc(st.kind)}</h3><p>${esc(txt)}</p><p>${esc(v.words || '')}</p><div class="sign"><div><span>Директор</span><i></i>${esc(AQ.state.demo ? q[5][1] : '—')}</div></div>`, 'Word'); };
    AQ.acts['l3-upd'] = () => { $('#ldoc3').innerHTML = body(); };
    const h = AQ.tabHead(rt) + `<div class="bento"><div class="tile s5"><div class="btns" style="margin:0 0 12px">${['Претензия', 'Ответ на претензию'].map((k) => `<button class="btn sm${st.kind === k ? ' pri' : ''}" data-act="l3-kind" data-v="${k}">${k}</button>`).join('')}</div><div class="lbl"><span>1 · Договор — из «Хранилища»</span></div><div class="drop" style="padding:12px">Подходит PDF, скан, Word. Договор читается целиком.<div class="btns" style="justify-content:center"><button class="btn sm" data-toast="Договор взят из «Хранилища»: Договор_субподряда_14.pdf">Взять из «Хранилища»</button><button class="btn sm ghost" data-toast="Файл выбран: Договор_14.docx">Загрузить файл</button></div></div><p class="mut" style="font-size:12.5px;margin:8px 0 14px">Из договора заполнится само: адресат, его адрес и директор — из реквизитов; пункты, которые нарушены, с цитатами; пеня контрагента и её предел; срок ответа на претензию.</p><div class="lbl"><span>2 · Что случилось</span></div><div class="btns" style="margin:6px 0 10px">${reasons.map((r) => `<button class="btn sm${st.reason === r ? ' pri' : ''}" data-act="l3-reason" data-v="${r}">${r}</button>`).join('')}</div><div class="fgrid" id="lf3">${[['sum', 'Сумма долга, ₸', 'number', '12400000'], ['act', 'Акт подписан', 'date', '2026-09-30'], ['due', 'Срок по договору — если знаете точную дату', 'date', '', 'Пусто — срок посчитается по пункту договора от даты выше.'], ['words', 'Своими словами — необязательно', 'area', '']].map((f) => F.field(f)).join('')}</div><div class="btns"><button class="btn pri" data-act="l3-upd">${st.kind === 'Претензия' ? 'Написать претензию' : 'Написать ответ'}</button><span class="mut" style="align-self:center">≈ 1 минута</span></div><p style="margin-top:8px"><button class="lnk" data-toast="Форма открыта для ручного заполнения" style="color:var(--acc)">Нет договора под рукой — заполнить письмо вручную</button></p></div><div class="tile s7"><div class="lbl"><span>Предпросмотр</span><button class="btn sm" data-doc="contract-docx">Скачать Word</button></div><div id="ldoc3"></div></div></div>`;
    ctx.after = () => { $('#ldoc3').innerHTML = body(); $$('#lf3 input,#lf3 textarea').forEach((e) => e.addEventListener('input', () => { $('#ldoc3').innerHTML = body(); })); };
    return h + AQ.wasBlock(rt.tObj);
  };
  AQ.acts['l3-kind'] = (t) => { LS().kind = t.getAttribute('data-v'); AQ.render(); };
  AQ.acts['l3-reason'] = (t) => { LS().reason = t.getAttribute('data-v'); AQ.render(); };

  const lchat0 = S.lchat;
  S.lchat = function (rt, ctx) {
    AQ.D.docforms.helpers['Юрист'] = ['Поставщик привёз некачественный бетон на 600 тысяч. Что делать?', 'Заказчик не подписывает акт третью неделю — как быть?', 'Нам выставили пеню 0,5% в день. Насколько это нормально?', 'Субподрядчик срывает срок. Какие у нас рычаги?', 'Чем опасен договор с арбитражем в Лондоне?'];
    let h = lchat0(rt, ctx).replace(/<div class="chat" id="lc"><div class="msg bot">[^<]*<\/div><\/div>/, '<p class="mut" style="margin-bottom:8px">Что делать при браке, срыве срока, неоплате, невыставленном акте, претензии. Порядок действий — принятый в компании, не импровизация. Для разбора конкретного договора — Проверка договора.</p><div class="lbl"><span>Спросите, например:</span></div><div class="chat" id="lc"></div>');
    return h.replace(AQ.wasBlock(rt.tObj) || '\u0000', '') + '<p class="mut" style="font-size:12.5px;margin-top:10px">Это разбор для принятия решения, а не юридическое заключение. Ссылок на номера статей AIQurylys намеренно не даёт: неверная ссылка попадёт в письмо контрагенту — сути правила достаточно.</p>';
  };

  /* ---------- Инспектор техники ---------- */
  AQ.acts['tech-add'] = () => AQ.formModal({
    title: 'Новая техника', submit: 'Сохранить', req: ['n', 't'],
    fields: [['n', 'Название *', 'text', ''], ['t', 'Тип *', 'text', ''], ['m', 'Модель', 'text', ''], ['y', 'Год', 'number', ''], ['sn', 'Серийный номер', 'text', ''], ['pl', 'Гос/инв. номер', 'text', ''], ['h', 'Моточасы', 'number', '0'], ['st', 'Статус', 'radio', ['Активна', 'На ремонте', 'Списана']], ['note', 'Примечания', 'area', '']],
    done: (v) => { AQ.D.equipment.unshift({ n: v.n, plate: v.pl || '—', h: +v.h || 0, to: 'ТО не назначено', state: v.st || 'Активна', inc: 0, exp: 0 }); AQ.render(); AQ.toast('Техника «' + v.n + '» добавлена в реестр'); }
  });
  AQ.acts['tech-import'] = () => {
    AQ.overlay('<div class="mh"><h2>Импорт списком</h2><button class="pill ico" data-act="close" aria-label="Закрыть">✕</button></div><p class="mut" style="margin-bottom:8px">Вставьте строки: поля через Tab (или ; , |): Название · Тип · Модель · Год · Моточасы · Гос.номер. Обязательно только Название (тип по умолчанию «Техника»).</p><textarea id="impta" rows="7" style="width:100%" placeholder="Экскаватор JCB 3CX; Экскаватор; 3CX; 2020; 1840; 123ABC01"></textarea><div class="btns"><button class="btn pri" id="impbtn" data-act="tech-import-go">Импортировать (0)</button><button class="btn" data-act="close">Отмена</button></div>');
    const ta = $('#impta'); ta.addEventListener('input', () => { $('#impbtn').textContent = 'Импортировать (' + ta.value.split('\n').filter((x) => x.trim()).length + ')'; });
  };
  AQ.acts['tech-import-go'] = () => {
    const rows = $('#impta').value.split('\n').map((x) => x.trim()).filter(Boolean); if (!rows.length) { AQ.toast('Вставьте хотя бы одну строку'); return; }
    rows.forEach((r) => { const c = r.split(/\t|;|,|\|/).map((x) => x.trim()); AQ.D.equipment.unshift({ n: c[0], plate: c[5] || '—', h: +c[4] || 0, to: 'ТО не назначено', state: 'Активна', inc: 0, exp: 0 }); });
    AQ.closeLayer(); AQ.render(); AQ.toast('Список техники загружен: ' + rows.length + ' машин добавлено в реестр');
  };

  /* ---------- Снабженец ---------- */
  const price0 = S.price;
  S.price = function (rt, ctx) {
    let h = price0(rt, ctx);
    const mats = AQ.state.demo ? (AQ.D.estResult.rows || []).filter((r) => r[6] === 'm') : [];
    return h + tile('Материалы проекта', '<p class="mut" style="margin-bottom:8px">Список собирается по проекту: позиции свода, склад и запросы поставщикам.</p>' + (mats.length ? AQ.tbl(['Материал', 'Кол-во', 'Цена, ₸'], mats.map((r) => [r[0], (r[1] % 1 ? String(r[1]).replace('.', ',') : fmt(r[1])) + ' ' + r[2], fmt(r[3])]), { r: [1, 2] }) : '<p class="mut">Проектов пока нет. Завести проект — и список материалов соберётся по его своду.</p>'));
  };
  const out0 = S.out;
  S.out = function (rt, ctx) { return out0(rt, ctx).replace('Как это работает · почта компании', 'Как это работает'); };

  /* ---------- ГИП: «Новый концепт», этап 1 · параметры участка ---------- */
  const concept0 = S.concept;
  const PL = () => AQ.ui.plot2 || (AQ.ui.plot2 = { L: 50, W: 40, side: 'с юга', front: 5, nb: 3, rear: 3, addr: '' });
  const PRESETS = [['6 соток · 20×30', 20, 30], ['10 соток · 25×40', 25, 40], ['15 соток · 30×50', 30, 50], ['20 соток · 50×40', 50, 40], ['50 соток · 100×50', 100, 50], ['1 га · 100×100', 100, 100]];
  function stage1() {
    const p = PL(), area = p.L * p.W, bw = Math.max(0, p.L - 2 * p.nb), bh = Math.max(0, p.W - p.front - p.rear), ba = bw * bh;
    const stp = (k, lbl, hint, d) => `<div class="ff"><span>${lbl}</span><div class="stp2"><button type="button" class="btn sm" data-act="pl-step" data-k="${k}" data-d="${-(d || 1)}">−</button><input type="number" value="${p[k]}" data-pk="${k}"><button type="button" class="btn sm" data-act="pl-step" data-k="${k}" data-d="${d || 1}">+</button></div>${hint ? `<small class="fh">${hint}</small>` : ''}</div>`;
    const k = Math.min(250 / p.L, 150 / p.W), X = 25, Y = 22, w = p.L * k, hh = p.W * k;
    const svg = `<svg viewBox="0 0 300 200" class="plansvg" aria-label="Генплан участка"><rect x="${X}" y="${Y}" width="${w}" height="${hh}" fill="rgba(53,196,122,.06)" stroke="var(--ok)" stroke-width="1.6"/><rect x="${X + p.nb * k}" y="${Y + p.front * k}" width="${bw * k}" height="${bh * k}" fill="rgba(242,107,29,.18)" stroke="var(--acc)" stroke-width="1.8"/><text x="${X + w / 2}" y="${Y + hh / 2}" text-anchor="middle" font-size="9" fill="currentColor">пятно застройки ${bw} × ${bh} м</text><text x="${X + w / 2}" y="${Y - 6}" text-anchor="middle" font-size="8" fill="var(--mute)">длина ${p.L} м</text><text x="${X - 6}" y="${Y + hh / 2}" font-size="8" fill="var(--mute)" transform="rotate(-90 ${X - 6} ${Y + hh / 2})" text-anchor="middle">ширина ${p.W} м</text><text x="${X + w / 2}" y="${Y + hh + 12}" text-anchor="middle" font-size="8" fill="var(--blue)">улица · подъезд ${esc(p.side)}</text><path d="M${X + w + 14} ${Y + 26}v-20m-4 7l4-7l4 7" stroke="var(--blue)" fill="none" stroke-width="1.5"/><text x="${X + w + 14}" y="${Y + 38}" text-anchor="middle" font-size="8" fill="var(--blue)">С</text></svg>`;
    return `<div id="pl1"><div class="stagebar"><b>Этап 1 · Параметры участка</b><button class="btn sm ghost" data-act="pl-reset">Начать заново</button></div>` +
      `<div class="bento"><div class="tile s6"><p class="mut" style="margin-bottom:10px">Сначала земля, потом здание: от размеров участка и отступов зависит, что на нём поместится. Введённое сохраняется само — можно уйти на второй этап и вернуться.</p><div class="fgrid">${stp('L', 'Длина участка, м', 'сторона вдоль улицы', 5)}${stp('W', 'Ширина участка, м', 'сторона вглубь от улицы', 5)}</div><div class="lbl" style="margin:10px 0 6px"><span>Типовые участки:</span></div><div class="btns" style="margin:0">${PRESETS.map((x) => `<button class="btn sm${p.L === x[1] && p.W === x[2] ? ' pri' : ''}" data-act="pl-preset" data-l="${x[1]}" data-w="${x[2]}">${x[0]}</button>`).join('')}</div><p style="margin:10px 0"><b>Площадь:</b> ${fmt(area)} м² · ${Math.round(area / 100)} сот. · ${(area / 10000).toLocaleString('ru-RU', { maximumFractionDigits: 2 })} га</p><div class="lbl"><span>Улица (подъезд) подходит</span></div><div class="btns" style="margin:6px 0">${['с юга', 'с севера', 'с востока', 'с запада'].map((s) => `<button class="btn sm${p.side === s ? ' pri' : ''}" data-act="pl-side" data-v="${s}">${s}</button>`).join('')}</div><small class="fh">от этого зависит стрелка севера на генплане</small><div class="lbl" style="margin:12px 0 6px"><span>Отступы здания от границ участка, м</span></div><div class="fgrid">${stp('front', 'от улицы', '')}${stp('nb', 'от соседей', '')}${stp('rear', 'сзади', '')}</div><small class="fh">Планировочные ориентиры. Точные значения — в АПЗ / ГПЗУ вашего участка: если они известны, впишите их.</small><label class="ff" style="margin-top:10px">Адрес участка — необязательно, пойдёт в штамп генплана<input data-pk="addr" value="${esc(p.addr)}"></label></div><div class="tile s6">${svg}<p style="margin-top:8px"><b>Пятно возможной застройки:</b> ${bw} × ${bh} м = ${fmt(ba)} м² — участок за вычетом отступов</p><p class="mut" style="font-size:12.5px;margin-top:6px">Ориентир плотности застройки: жилой дом — до 30% (${fmt(area * .3)} м²) · офис, магазин, автосервис — до 50% (${fmt(area * .5)} м²) · склад, цех — до 60% (${fmt(area * .6)} м²)</p></div></div>` +
      `<div class="btns"><button class="btn pri" data-act="pl-next">Далее: параметры и проектирование здания →</button></div><p class="mut" style="font-size:12.5px">Размеры участка потом можно поправить, вернувшись на этот этап.</p>` +
      `<details class="tile" open style="margin-top:12px"><summary style="cursor:pointer;font-weight:700">Зачем начинать с участка</summary><p class="mut" style="margin-top:6px">Габариты здания сами по себе не говорят, влезет ли проект: влезает не «36 × 18», а «36 × 18 на участке 50 × 40 с отступами и проездом». На втором этапе здание сверяется с этим участком — по сторонам, по проценту застройки и по озеленению, а генплан строится на тех же размерах без повторного ввода.</p></details>` +
      `<div class="tile" style="margin-top:12px"><div class="lbl"><span>На участке несколько зданий?</span></div><p class="mut">Генплан площадки по осям: цех, склад, АБК на одной земле — баланс территории, благоустройство и оценка по площадке целиком. Любое здание отсюда открывается на втором этапе. Для одного здания этот шаг не нужен.</p><div class="btns"><button class="btn" data-toast="Генплан площадки по осям: откроется в рабочей версии">Расставить здания по осям</button></div></div></div>`;
  }
  S.concept = function (rt, ctx) {
    const cur = rt.sub[0] || 'concept', full = concept0(rt, ctx);
    if (cur !== 'concept') return full;
    const j = tabsEnd(full, (full.split('tabs sc').length > 2) ? 1 : 0), head = full.slice(0, j), body = full.slice(j);
    if (AQ.ui.stage2) return head + `<div class="stagebar"><button class="btn sm" data-act="pl-back">← Этап 1 · участок</button><b>Этап 2 · Здание</b><button class="btn sm ghost" data-act="pl-reset">Начать заново</button></div>` + body;
    ctx.after = bindPl;
    return head + stage1();
  };
  function bindPl() {
    $$('[data-pk]').forEach((inp) => inp.addEventListener('input', () => { const p = PL(), k = inp.getAttribute('data-pk'); p[k] = k === 'addr' ? inp.value : (+inp.value || 0); if (k !== 'addr') redraw(); }));
  }
  function redraw() {
    const ae = document.activeElement, key = ae && ae.getAttribute && ae.getAttribute('data-pk'), pos = ae && ae.selectionStart;
    $('#pl1').outerHTML = stage1(); bindPl();
    if (key) { const el = $('[data-pk="' + key + '"]'); if (el) { el.focus(); try { el.setSelectionRange(pos, pos); } catch (e) { /* у числового поля нет выделения */ } } }
  }
  AQ.acts['pl-step'] = (t) => { const p = PL(), k = t.getAttribute('data-k'); p[k] = Math.max(0, (+p[k] || 0) + (+t.getAttribute('data-d'))); redraw(); };
  AQ.acts['pl-preset'] = (t) => { const p = PL(); p.L = +t.getAttribute('data-l'); p.W = +t.getAttribute('data-w'); redraw(); };
  AQ.acts['pl-side'] = (t) => { PL().side = t.getAttribute('data-v'); redraw(); };
  AQ.acts['pl-next'] = () => { AQ.ui.stage2 = true; AQ.render(); };
  AQ.acts['pl-back'] = () => { AQ.ui.stage2 = false; AQ.render(); };
  AQ.acts['pl-reset'] = () => { AQ.ui.plot2 = null; AQ.ui.stage2 = false; AQ.render(); };
})();
