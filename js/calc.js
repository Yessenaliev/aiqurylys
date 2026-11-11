// Калькулятор цены. Все цены — из действующего прайса AIQurylys, тенге в месяц.
(function () {
  var PRICE = {
    gc: 250000,          // генподрядчик, за проект (цена «от»)
    sub: 50000,          // подрядчик, за альбом
    tenders: 50000,
    packs: { 1: 8000, 5: 40000, 10: 76000, 20: 144000, 30: 204000, 40: 256000, 50: 300000 },
    over50: 5600,        // за каждый расчёт сверх 50
    storage: [
      ['1 ГБ', 0], ['5 ГБ', 1500], ['10 ГБ', 2500], ['50 ГБ', 7500],
      ['100 ГБ', 12000], ['500 ГБ', 39000], ['1 ТБ', 65000], ['2 ТБ', 110000]
    ]
  };

  var state = { role: 'gc', units: 1, calcs: 10, tenders: true, storage: 3 };

  // Самый выгодный набор пакетов на n расчётов
  function calcsCost(n) {
    if (n <= 0) return 0;
    if (n > 50) return PRICE.packs[50] + (n - 50) * PRICE.over50;
    var sizes = Object.keys(PRICE.packs).map(Number);
    var best = [0];
    for (var i = 1; i <= n; i++) {
      best[i] = Infinity;
      sizes.forEach(function (s) {
        if (s <= i && best[i - s] + PRICE.packs[s] < best[i]) best[i] = best[i - s] + PRICE.packs[s];
      });
    }
    return best[n];
  }

  function money(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₸';
  }
  function plural(n, one, few, many) {
    var a = n % 10, b = n % 100;
    if (a === 1 && b !== 11) return one;
    if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return few;
    return many;
  }

  function lines() {
    var gc = state.role === 'gc';
    var out = [];
    var unitWord = gc ? plural(state.units, 'проект', 'проекта', 'проектов')
                      : plural(state.units, 'альбом', 'альбома', 'альбомов');
    out.push({
      name: (gc ? 'Генподрядчик' : 'Подрядчик') + ' · ' + state.units + ' ' + unitWord,
      hint: gc ? 'все альбомы и все разделы' : 'один альбом одного проекта',
      sum: state.units * (gc ? PRICE.gc : PRICE.sub),
      from: gc
    });
    if (state.calcs > 0) out.push({
      name: 'Себестоимость · ' + state.calcs + ' ' + plural(state.calcs, 'расчёт', 'расчёта', 'расчётов'),
      hint: '1 расчёт = 1 альбом',
      sum: calcsCost(state.calcs)
    });
    if (state.tenders) out.push({ name: 'Тендеры', hint: 'поиск и подборка', sum: PRICE.tenders });
    var st = PRICE.storage[state.storage];
    out.push({ name: 'Хранилище · ' + st[0], hint: 'на всю компанию', sum: st[1] });
    return out;
  }

  function press(group, value) {
    document.querySelectorAll('#' + group + ' .opt').forEach(function (b) {
      b.setAttribute('aria-pressed', b.dataset.v === String(value) ? 'true' : 'false');
    });
  }

  function render() {
    var gc = state.role === 'gc';
    document.getElementById('units-title').textContent =
      gc ? '2. Сколько проектов ведёте одновременно' : '2. Сколько альбомов ведёте одновременно';
    document.getElementById('units-hint').textContent =
      gc ? 'Один проект — все его альбомы. Сдали проект — место освобождается для нового.'
         : 'Каждый альбом каждого проекта считается отдельно.';
    document.getElementById('units-out').textContent = state.units;
    document.getElementById('calcs-out').textContent = state.calcs;
    press('role', state.role);
    press('calcs', state.calcs);
    press('storage', state.storage);

    var ls = lines(), total = 0, from = false;
    var ul = document.getElementById('bill-lines');
    ul.textContent = '';
    ls.forEach(function (l) {
      total += l.sum;
      if (l.from) from = true;
      var li = document.createElement('li');
      var span = document.createElement('span');
      span.textContent = l.name;
      var small = document.createElement('small');
      small.textContent = l.hint;
      span.appendChild(small);
      var b = document.createElement('b');
      b.textContent = l.sum === 0 ? 'входит' : (l.from ? 'от ' : '') + money(l.sum);
      li.appendChild(span);
      li.appendChild(b);
      ul.appendChild(li);
    });
    document.getElementById('bill-total').textContent = (from ? 'от ' : '') + money(total);

    document.querySelectorAll('#pack-table tbody tr').forEach(function (tr) {
      var n = Number(tr.dataset.n);
      tr.classList.toggle('on', n === state.calcs || (n === 51 && state.calcs > 50));
    });
  }

  document.getElementById('role').addEventListener('click', function (e) {
    var b = e.target.closest('.opt');
    if (b) { state.role = b.dataset.v; render(); }
  });
  document.getElementById('calcs').addEventListener('click', function (e) {
    var b = e.target.closest('.opt');
    if (b) { state.calcs = Number(b.dataset.v); render(); }
  });
  document.getElementById('storage').addEventListener('click', function (e) {
    var b = e.target.closest('.opt');
    if (b) { state.storage = Number(b.dataset.v); render(); }
  });
  document.getElementById('tenders').addEventListener('change', function (e) {
    state.tenders = e.target.checked; render();
  });
  document.querySelectorAll('.stepper').forEach(function (s) {
    var key = s.dataset.step;
    var min = key === 'units' ? 1 : 0, max = 200;
    s.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      state[key] = Math.min(max, Math.max(min, state[key] + Number(b.dataset.d)));
      render();
    });
  });

  document.getElementById('copy').addEventListener('click', function () {
    var btn = this;
    var text = 'AIQurylys — расчёт цены в месяц\n' + lines().map(function (l) {
      return l.name + ': ' + (l.sum === 0 ? 'входит' : (l.from ? 'от ' : '') + money(l.sum));
    }).join('\n') + '\nИтого: ' + document.getElementById('bill-total').textContent;
    function done(ok) {
      btn.textContent = ok ? 'Скопировано' : 'Не удалось скопировать';
      setTimeout(function () { btn.textContent = 'Скопировать расчёт'; }, 2000);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
    } else { done(false); }
  });

  render();
})();
