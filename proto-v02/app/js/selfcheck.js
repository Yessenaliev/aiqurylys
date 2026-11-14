/* Самопроверка прототипа: обходит все экраны всех ролей и ищет мёртвые кнопки и ссылки.
   Запуск: открыть index.html?selfcheck=1 (результат на экране и в консоли) или вызвать AQ.selfcheck() */
(function () {
  'use strict';
  var AQ = window.AQ;
  var EXTRA = ['digital', 'help', 'help/glossary', 'help/faq', 'bot', 'profile', 'notif', 'support', 'projects/list/p/bi', 'projects/list/p/ceh/gantt', 'projects/list/p/ceh/site', 'projects/list/p/ceh/volumes', 'projects/list/p/ceh/docs', 'projects/list/p/ceh/files', 'projects/list/p/ceh/money', 'projects/list/p/ceh/stock', 'projects/list/p/ceh/equipment', 'projects/list/p/ceh/people', 'calc/est/new', 'calc/est/new/2', 'calc/est/new/3', 'calc/est/new/4', 'calc/est/result', 'site/tech/map', 'site/tech/to', 'site/tech/fuel', 'site/tech/money', 'money/fin/bdds', 'sales/tender/t2', 'sales/tender/t3', 'company/tariff/up'];

  AQ.selfcheck = function () {
    var out = { roles: 0, screens: 0, controls: 0, problems: [] }, saveRole = AQ.state.role, saveDemo = AQ.state.demo, saveH = AQ._h;
    function note(s) { if (out.problems.indexOf(s) === -1) out.problems.push(s); }
    [true, false].forEach(function (demo) {
      AQ.state.demo = demo;
      AQ.M.roles.forEach(function (role) {
        AQ.state.role = role.id; out.roles++;
        var list = [];
        AQ.secs().forEach(function (s) { AQ.tabsOf(s).forEach(function (t) { list.push(s.id + '/' + t.id); }); });
        EXTRA.forEach(function (x) { if (AQ.canRoute(x.split('/').slice(0, 2).join('/')) || /^(digital|help|bot|profile|notif|support)/.test(x)) list.push(x); });
        list.forEach(function (rt) {
          var tag = (demo ? '' : '[пусто] ') + role.n + ' · ' + rt;
          AQ._h = '#/' + rt;
          try { AQ.render(); } catch (e) { note(tag + ': ошибка ' + e.message); return; }
          out.screens++;
          var v = AQ.$('#view'), txt = v.innerText;
          if (txt.length < 40) note(tag + ': пустой экран');
          if (/undefined|NaN|\[object/.test(txt)) note(tag + ': в тексте undefined/NaN');
          if (v.querySelector('.empty h2') && /не открывается/.test(txt)) note(tag + ': экран закрыт для роли, но доступен из меню или ссылки');
          AQ.$$('#view a, #view button, #view tr.clk, #side a, #top a, #top button, #bnav button').forEach(function (el) {
            out.controls++;
            var ok = false, label = (el.innerText || el.getAttribute('aria-label') || '').trim().slice(0, 36);
            if (el.tagName === 'A') {
              var h = el.getAttribute('href') || '';
              if (/^#\//.test(h)) {
                ok = true;
                var p = h.slice(2).split('/');
                if (!AQ.canRoute(p[0] + '/' + (p[1] || '')) && !/^(digital|help|bot|profile|notif|support)$/.test(p[0])) note(tag + ': ссылка «' + label + '» ведёт на закрытый экран ' + h);
              } else if (el.hasAttribute('data-act') || el.hasAttribute('data-toast')) ok = true;
            } else {
              ok = ['data-act', 'data-toast', 'data-ext', 'data-go', 'data-role', 'data-q'].some(function (a) { return el.hasAttribute(a); }) || el.type === 'submit' || el.tagName === 'SELECT';
            }
            if (!ok) note(tag + ': кнопка «' + label + '» ничего не делает');
          });
        });
      });
    });
    AQ._h = saveH; AQ.state.role = saveRole; AQ.state.demo = saveDemo; AQ.render();
    return out;
  };

  if (/[?&]selfcheck=1/.test(location.search)) {
    var t = setInterval(function () {
      if (!document.body.getAttribute('data-ready')) return;
      clearInterval(t);
      var r = AQ.selfcheck(), d = document.createElement('div');
      d.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:200;max-width:520px;max-height:60vh;overflow:auto;background:#10151F;color:#EAF0FA;border:1px solid ' + (r.problems.length ? '#FF6262' : '#35C47A') + ';border-radius:12px;padding:12px 14px;font:12px/1.4 monospace';
      d.innerHTML = '<b>Самопроверка:</b> ролей ' + r.roles + ', экранов ' + r.screens + ', элементов ' + r.controls + '<br><b>' + (r.problems.length ? 'Проблем: ' + r.problems.length : 'Проблем нет') + '</b><br>' + r.problems.slice(0, 40).join('<br>');
      document.body.appendChild(d); window.__selfcheck = r; console.log(r);
    }, 200);
  }
})();
