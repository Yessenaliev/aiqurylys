/* v1.2: «Цифровой отдел» как этаж: у каждого ИИ-сотрудника своя рабочая зона и персонаж, который делает своё дело.
   Сцены нарисованы на SVG и анимированы CSS, работают параллельно и останавливаются, когда не видны. */
(function () {
  'use strict';
  const AQ = window.AQ, S = AQ.screens, esc = AQ.esc;

  /* ---------- кирпичики для рисования ---------- */
  const O = (x, y) => `style="transform-origin:${x}px ${y}px"`;
  const WALL = '#171F2D', FLOOR = '#202B3F', DESK = '#8A5E3C', DESKF = '#5B3F2A';
  const office = (extra) => `<rect width="320" height="200" fill="${WALL}"/><rect y="150" width="320" height="50" fill="${FLOOR}"/><rect y="149" width="320" height="2" fill="#fff" opacity=".06"/>${extra || ''}`;
  const win = (k, x, y, w, h) => `<defs><linearGradient id="${k}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3C5683"/><stop offset="1" stop-color="#D99066"/></linearGradient></defs><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="url(#${k}w)" stroke="#2B3752" stroke-width="3"/><path d="M${x + w / 2} ${y}v${h}M${x} ${y + h / 2}h${w}" stroke="#2B3752" stroke-width="2"/>`;
  const sky = (k) => `<defs><linearGradient id="${k}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1B2844"/><stop offset=".62" stop-color="#5A6A8C"/><stop offset="1" stop-color="#E39A68"/></linearGradient></defs><rect width="320" height="200" fill="url(#${k}s)"/><circle cx="262" cy="118" r="20" fill="#F7C58B" opacity=".55"/><rect y="160" width="320" height="40" fill="#343A47"/><rect y="159" width="320" height="2" fill="#fff" opacity=".08"/>`;
  const desk = (x, w, y) => { y = y || 138; return `<rect x="${x}" y="${y}" width="${w}" height="7" rx="2" fill="${DESK}"/><rect x="${x + 8}" y="${y + 7}" width="${w - 16}" height="${200 - y - 7}" fill="${DESKF}"/>`; };

  function arm(sx, sy, ex, ey, hx, hy, col, cls, extra) {
    return `<g class="arm ${cls || ''}" ${O(sx, sy)}><polyline points="${sx},${sy} ${ex},${ey} ${hx},${hy}" fill="none" stroke="${col}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${hx}" cy="${hy}" r="5" fill="#F1C9A5"/>${extra || ''}</g>`;
  }
  function person(cx, by, o) {
    o = o || {};
    const skin = o.skin || '#F1C9A5', shirt = o.shirt || '#3C6FD8', pants = o.pants || '#2A3346', hy = by - 20, leg = o.leg || 44;
    let s = `<g class="pp" ${O(cx, by + 40)}>`;
    if (o.stand) s += `<rect x="${cx - 15}" y="${by + 38}" width="12" height="${leg}" rx="4" fill="${pants}"/><rect x="${cx + 3}" y="${by + 38}" width="12" height="${leg}" rx="4" fill="${pants}"/><rect x="${cx - 18}" y="${by + 36 + leg}" width="16" height="6" rx="3" fill="#10131B"/><rect x="${cx + 2}" y="${by + 36 + leg}" width="16" height="6" rx="3" fill="#10131B"/>`;
    s += `<path d="M${cx - 20} ${by + 42}V${by + 8}Q${cx - 20} ${by - 2} ${cx - 9} ${by - 2}H${cx + 9}Q${cx + 20} ${by - 2} ${cx + 20} ${by + 8}V${by + 42}Z" fill="${shirt}"/>`;
    if (o.vest) s += `<path d="M${cx - 20} ${by + 42}V${by + 8}Q${cx - 20} ${by - 2} ${cx - 9} ${by - 2}L${cx - 5} ${by + 42}ZM${cx + 20} ${by + 42}V${by + 8}Q${cx + 20} ${by - 2} ${cx + 9} ${by - 2}L${cx + 5} ${by + 42}Z" fill="#F26B1D"/><rect x="${cx - 20}" y="${by + 22}" width="15" height="4" fill="#F5F5F0" opacity=".85"/><rect x="${cx + 5}" y="${by + 22}" width="15" height="4" fill="#F5F5F0" opacity=".85"/>`;
    if (o.suit) s += `<path d="M${cx - 8} ${by - 2}L${cx} ${by + 18}L${cx + 8} ${by - 2}Z" fill="#F4F6FA"/><path d="M${cx - 2.5} ${by + 4}h5l2 22l-4.5 4l-4.5-4z" fill="#C0392B"/>`;
    s += `<rect x="${cx - 4}" y="${by - 8}" width="8" height="8" fill="${skin}"/><circle cx="${cx}" cy="${hy}" r="13" fill="${skin}"/>`;
    if (o.hat) s += `<path d="M${cx - 14} ${hy - 4}Q${cx - 14} ${hy - 19} ${cx} ${hy - 19}Q${cx + 14} ${hy - 19} ${cx + 14} ${hy - 4}Z" fill="${o.hat}"/><rect x="${cx - 17}" y="${hy - 5}" width="34" height="4.5" rx="2.2" fill="${o.hat}"/><rect x="${cx - 2.5}" y="${hy - 22}" width="5" height="6" rx="2" fill="${o.hat}"/><path d="M${cx - 14} ${hy - 11}H${cx + 14}" stroke="#000" opacity=".12"/>`;
    else s += `<path d="M${cx - 13} ${hy}Q${cx - 15} ${hy - 17} ${cx} ${hy - 16}Q${cx + 15} ${hy - 17} ${cx + 13} ${hy}Q${cx + 8} ${hy - 8} ${cx} ${hy - 8}Q${cx - 8} ${hy - 8} ${cx - 13} ${hy}Z" fill="${o.hair || '#3A2A20'}"/>`;
    s += `<g class="blink" ${O(cx, hy + 1)}><circle cx="${cx - 5}" cy="${hy + 1}" r="1.7" fill="#1B1B1F"/><circle cx="${cx + 5}" cy="${hy + 1}" r="1.7" fill="#1B1B1F"/></g><path d="M${cx - 3} ${hy + 7}q3 2.5 6 0" stroke="#7A3E2B" stroke-width="1.4" fill="none" stroke-linecap="round"/>`;
    if (o.glasses) s += `<g fill="none" stroke="#10131B" stroke-width="1.3"><circle cx="${cx - 5}" cy="${hy + 1}" r="4.3"/><circle cx="${cx + 5}" cy="${hy + 1}" r="4.3"/><path d="M${cx - 0.7} ${hy + 1}h1.4"/></g>`;
    return s + '</g>';
  }
  const bricks = (x, y, cols, rows, w, h, fill, anim) => {
    let s = '', n = 0;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const off = (r % 2) * (w / 2), bx = x + c * (w + 1) + off - (r % 2 ? w / 2 : 0), by = y - (r + 1) * (h + 1); if (r % 2 && c === cols - 1) continue; s += `<rect ${anim ? `class="brk" style="animation-delay:${(n * 0.13).toFixed(2)}s"` : ''} x="${bx}" y="${by}" width="${r % 2 && c === 0 ? w / 2 : w}" height="${h}" rx="1" fill="${fill}"/>`; n++; }
    return s;
  };
  const pop = (x, y, w, txt, col, tcol, delay) => `<g class="pop" style="animation-delay:${delay || 0}s"><rect x="${x}" y="${y}" width="${w}" height="15" rx="7.5" fill="${col}"/><text x="${x + w / 2}" y="${y + 10.5}" text-anchor="middle" font-size="8.5" font-weight="700" fill="${tcol || '#fff'}" font-family="Onest,sans-serif">${txt}</text></g>`;

  /* ---------- 11 сцен ---------- */
  const SC = {
    tender: (k) => {
      let rows = '';
      for (let i = 0; i < 10; i++) { const y = 56 + i * 17, g = i % 4 === 1; rows += `<rect x="150" y="${y}" width="130" height="14" rx="3" fill="#1A2438"/><circle cx="158" cy="${y + 7}" r="3" fill="${g ? '#35C47A' : '#6FA3FF'}"/><rect x="166" y="${y + 3}" width="${58 - (i % 3) * 9}" height="3" rx="1.5" fill="#7C8BAA"/><rect x="166" y="${y + 8.5}" width="34" height="2.5" rx="1.2" fill="#3A4764"/><rect x="248" y="${y + 3}" width="26" height="8" rx="4" fill="${g ? '#35C47A' : '#2C3956'}"/>${g ? `<path d="M256 ${y + 7}l2.5 2.5l5-5" stroke="#06240F" stroke-width="1.6" fill="none"/>` : ''}`; }
      return office(win(k, 18, 20, 56, 46)) + `<defs><clipPath id="${k}c"><rect x="146" y="54" width="138" height="70"/></clipPath></defs>` +
        `<rect x="140" y="32" width="150" height="98" rx="7" fill="#0C111B" stroke="#2B3752" stroke-width="2"/><text x="150" y="47" font-size="8" font-weight="700" fill="#9FB3D9" font-family="Onest,sans-serif">Тендеры · лента</text><circle cx="274" cy="43" r="3" fill="#35C47A" class="blinkd"/>` +
        `<g clip-path="url(#${k}c)"><g class="scr">${rows}</g></g>` +
        `<g class="mag"><circle cx="190" cy="80" r="11" fill="rgba(111,163,255,.12)" stroke="#F5C542" stroke-width="2.4"/><path d="M198 88l9 9" stroke="#F5C542" stroke-width="3.4" stroke-linecap="round"/></g>` +
        `<rect x="208" y="130" width="14" height="9" fill="#2B3752"/>` + desk(20, 280) +
        `<rect x="118" y="131" width="24" height="3" fill="#F2F4F8"/><rect x="119" y="128" width="22" height="3" fill="#E1E6EF"/><rect x="117" y="125" width="24" height="3" fill="#F2F4F8"/><rect x="122" y="127" width="14" height="1.5" fill="#B9C1D0"/>` +
        person(78, 98, { shirt: '#2F6FD0', glasses: true }) + arm(94, 104, 112, 122, 128, 135, '#2F6FD0', 'a-type') + arm(62, 104, 56, 124, 66, 135, '#2F6FD0', '') +
        `<rect x="38" y="128" width="9" height="10" rx="1.5" fill="#E8EDF6"/><path d="M41 124q-2-3 0-5M44 124q-2-3 0-5" stroke="#fff" opacity=".5" fill="none" class="steam"/>` +
        pop(228, 12, 62, '+1 тендер', '#35C47A', '#06240F', 0) + pop(188, 8, 68, 'участвовать', '#6FA3FF', '#07152E', 2.2);
    },
    estimator: (k) => {
      let grid = ''; for (let i = 1; i < 12; i++) grid += `<path d="M${24 + i * 12.5} 28v104" stroke="#fff" opacity=".12"/>`; for (let j = 1; j < 8; j++) grid += `<path d="M24 ${28 + j * 12.5}h150" stroke="#fff" opacity=".12"/>`;
      return office() + `<path d="M60 132L48 192M140 132L152 192" stroke="#5B3F2A" stroke-width="4"/><rect x="24" y="28" width="150" height="104" rx="3" fill="#1E4E9C"/>${grid}` +
        `<g stroke="#fff" stroke-width="1.8" fill="none"><rect x="44" y="46" width="110" height="70"/><path d="M84 46V116M44 80H154M118 80V116"/><path d="M84 96a8 8 0 0 1 8-8" opacity=".7"/></g>` +
        [[44, 46], [154, 46], [44, 116], [154, 116], [84, 80], [118, 80]].map((p, i) => `<circle class="dotp" style="animation-delay:${i * 0.5}s" cx="${p[0]}" cy="${p[1]}" r="3.4" fill="#F5C542"/>`).join('') +
        `<g class="scanx"><rect x="24" y="28" width="16" height="104" fill="#6FE3FF" opacity=".18"/><rect x="38" y="28" width="2.4" height="104" fill="#6FE3FF"/></g>` +
        `<text x="99" y="141" text-anchor="middle" font-size="7.5" fill="#9FB3D9" font-family="Onest,sans-serif">Сваи С1: 462 шт</text>` +
        `<g transform="translate(-14 -10)"><rect x="186" y="22" width="84" height="52" rx="4" fill="#F4F7FB"/><rect x="186" y="22" width="84" height="10" rx="4" fill="#1F7A4D"/><text x="192" y="30" font-size="6.5" font-weight="700" fill="#fff" font-family="Onest,sans-serif">Смета.xlsx</text>` +
        [0, 1, 2, 3].map((i) => `<rect x="190" y="${36 + i * 8}" width="${52 - (i % 2) * 14}" height="3" rx="1.5" fill="#B9C1D0"/><rect class="cell" style="animation-delay:${i * 0.7}s" x="246" y="${35 + i * 8}" width="12" height="5" rx="1.5" fill="#35C47A"/>`).join('') +
        `<rect x="188" y="64" width="80" height="8" rx="2" fill="#FFE9A8"/><text x="228" y="70" text-anchor="middle" font-size="5.6" font-weight="700" fill="#5B4300" font-family="Onest,sans-serif">Итого 68 312 049 ₸</text></g>` +
        desk(184, 120) + `<rect x="204" y="125" width="24" height="13" rx="2" fill="#2B3752"/><rect x="207" y="127" width="18" height="4" fill="#35C47A"/><path d="M208 134h2M213 134h2M218 134h2M223 134h2" stroke="#9FB3D9" stroke-width="2"/>` +
        person(262, 98, { shirt: '#7B6AD8' }) + arm(246, 104, 234, 124, 222, 132, '#7B6AD8', 'a-type') + arm(278, 104, 290, 122, 282, 135, '#7B6AD8', '') + `<rect x="274" y="76" width="13" height="2.6" rx="1.3" fill="#F5C542" transform="rotate(-20 280 77)"/>`;
    },
    supply: (k) => {
      const gb = (x, y) => `<rect x="${x}" y="${y - 14}" width="34" height="14" rx="1.5" fill="#D5DBE6"/><g fill="#9AA6BA"><circle cx="${x + 7}" cy="${y - 9}" r="1.2"/><circle cx="${x + 15}" cy="${y - 5}" r="1.2"/><circle cx="${x + 24}" cy="${y - 10}" r="1.2"/><circle cx="${x + 29}" cy="${y - 4}" r="1.2"/></g>`;
      let rebar = ''; for (let i = 0; i < 6; i++) rebar += `<rect x="${24 + (i % 3) * 5}" y="${142 + Math.floor(i / 3) * 5}" width="60" height="3.5" rx="1.7" fill="#7D879B"/>`;
      return `<rect width="320" height="200" fill="#1A2230"/><rect y="156" width="320" height="44" fill="#262E3D"/><path d="M0 40h320M0 80h320M0 120h320" stroke="#fff" opacity=".03"/>` +
        `<rect x="16" y="26" width="5" height="130" fill="#4A5875"/><rect x="196" y="26" width="5" height="130" fill="#4A5875"/><rect x="16" y="70" width="185" height="5" fill="#6B7A99"/><rect x="16" y="112" width="185" height="5" fill="#6B7A99"/>` +
        gb(26, 70) + gb(26, 56) + gb(64, 70) + `<rect x="106" y="46" width="26" height="24" rx="5" fill="#B9A98B"/><rect x="106" y="54" width="26" height="6" fill="#8C7B5E"/><rect x="136" y="48" width="26" height="22" rx="5" fill="#B9A98B"/><rect x="136" y="55" width="26" height="6" fill="#8C7B5E"/><rect x="164" y="48" width="26" height="22" rx="5" fill="#B9A98B"/>` +
        bricks(28, 112, 6, 5, 14, 6, '#B8532E') + bricks(128, 112, 4, 4, 14, 6, '#A24526') + `<rect x="26" y="150" width="66" height="6" fill="#5B3F2A"/>` + rebar +
        `<g class="mag2"><circle cx="70" cy="92" r="12" fill="rgba(245,197,66,.1)" stroke="#F5C542" stroke-width="2.4"/><path d="M79 101l9 9" stroke="#F5C542" stroke-width="3.4" stroke-linecap="round"/></g>` +
        pop(30, 30, 54, '₸ 28 500', '#F5C542', '#2B2100', 0) + pop(108, 26, 74, 'газоблок D500', '#6FA3FF', '#07152E', 2) + pop(60, 96, 52, '₸ 96 / шт', '#35C47A', '#06240F', 3.6) +
        `<g class="drive"><rect x="-76" y="166" width="46" height="20" rx="2" fill="#E8EDF6"/><rect x="-30" y="172" width="20" height="14" rx="2" fill="#F26B1D"/><circle cx="-62" cy="188" r="5.5" fill="#10131B"/><circle cx="-20" cy="188" r="5.5" fill="#10131B"/><text x="-53" y="179" font-size="6" font-weight="700" fill="#2B3752" font-family="Onest,sans-serif">ПОСТАВКА</text></g>` +
        person(256, 86, { shirt: '#2E9D8F', stand: true, hat: '#F5F5F0', vest: false }) + arm(272, 92, 286, 108, 276, 118, '#2E9D8F', '') + arm(240, 92, 226, 80, 218, 66, '#2E9D8F', 'a-point') +
        `<rect x="262" y="104" width="18" height="24" rx="2" fill="#0C111B" stroke="#6FA3FF" stroke-width="1.2" transform="rotate(8 270 116)"/><path d="M265 110h10M265 114h10M265 118h6" stroke="#6FA3FF" stroke-width="1.4" transform="rotate(8 270 116)"/>`;
    },
    lawyer: (k) => {
      let books = ''; const cols = ['#6B3FA0', '#2F6FD0', '#B8532E', '#2E9D8F', '#C9A227', '#8E3B5C', '#3C5683'];
      [28, 56, 90].forEach((y, r) => { for (let i = 0; i < 6; i++) books += `<rect x="${18 + i * 7.4}" y="${y + 8 - (14 + (i * 5 + r * 3) % 9)}" width="6.2" height="${14 + (i * 5 + r * 3) % 9}" rx="1" fill="${cols[(i + r * 2) % 7]}"/>`; });
      let lines = ''; for (let i = 0; i < 9; i++) lines += `<rect x="162" y="${42 + i * 11}" width="${74 - (i % 3) * 12}" height="3" rx="1.5" fill="#B9C1D0"/>`;
      return office() + `<rect x="14" y="26" width="68" height="100" rx="2" fill="#2A3346"/><path d="M14 56h68M14 90h68M14 124h68" stroke="#5B3F2A" stroke-width="3"/>${books}` +
        `<rect x="150" y="22" width="100" height="116" rx="3" fill="#F2F4F8"/><text x="200" y="36" text-anchor="middle" font-size="6.4" font-weight="800" fill="#2B3752" font-family="Onest,sans-serif">ДОГОВОР СУБПОДРЯДА</text>${lines}` +
        [2, 5, 7].map((i, n) => `<rect class="hl" style="animation-delay:${n * 1.1}s;transform-origin:160px ${42 + i * 11 + 1.5}px" x="160" y="${40 + i * 11}" width="82" height="8" rx="2" fill="#FF6262" opacity=".4"/><g class="hlm" style="animation-delay:${n * 1.1 + 0.5}s"><circle cx="244" cy="${44 + i * 11}" r="5.2" fill="#FF6262"/><text x="244" y="${46.6 + i * 11}" text-anchor="middle" font-size="7.5" font-weight="800" fill="#fff" font-family="Onest,sans-serif">!</text></g>`).join('') +
        `<g transform="translate(284 52)" stroke="#C9A227" stroke-width="2" fill="none" stroke-linecap="round"><path d="M0 -20V6M-14 -12H14M-14 -12l-7 12h14zM14 -12l-7 12h14z"/><path d="M-8 10h16"/></g>` +
        desk(60, 244) + person(106, 98, { shirt: '#2B3752', suit: true, glasses: true, hair: '#2A2320' }) + arm(122, 104, 134, 122, 146, 130, '#2B3752', 'a-write', '<rect x="144" y="119" width="2.6" height="12" rx="1.3" fill="#F5C542" transform="rotate(25 146 128)"/>') + arm(90, 104, 84, 122, 96, 134, '#2B3752', '');
    },
    arch: (k) => {
      const P = (d, delay) => `<path class="draw" pathLength="1" style="animation-delay:${delay}s" d="${d}" fill="none" stroke="#2F6FD0" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`;
      let grid = ''; for (let i = 1; i < 12; i++) grid += `<path d="M${140 + i * 12.5} 40v96" stroke="#2F6FD0" opacity=".12"/>`; for (let j = 1; j < 8; j++) grid += `<path d="M140 ${40 + j * 12}h150" stroke="#2F6FD0" opacity=".12"/>`;
      return office() + `<path d="M170 136L160 192M260 136L270 192" stroke="#5B3F2A" stroke-width="4"/><rect x="140" y="40" width="150" height="96" rx="3" fill="#EAEFF7"/>${grid}` +
        P('M168 118H262V86H168Z', 0) + P('M162 86L215 56L268 86Z', 0.9) + P('M200 118V100H220V118', 1.7) + P('M176 92H190V104H176ZM240 92H254V104H240Z', 2.3) + P('M215 56V48', 2.8) +
        `<path d="M168 128H262" stroke="#F26B1D" stroke-width="1.4"/><path d="M168 125v6M262 125v6" stroke="#F26B1D" stroke-width="1.4"/><text x="215" y="134" text-anchor="middle" font-size="7.5" font-weight="700" fill="#F26B1D" font-family="Onest,sans-serif">10 × 12 м</text>` +
        `<g transform="rotate(-18 40 150)"><rect x="22" y="130" width="7" height="24" rx="3" fill="#E8EDF6"/><rect x="31" y="126" width="7" height="28" rx="3" fill="#6FA3FF"/><rect x="40" y="132" width="7" height="22" rx="3" fill="#E8EDF6"/></g><rect x="18" y="148" width="38" height="12" rx="2" fill="#3A4764"/>` +
        `<path d="M150 20V30" stroke="#8A93A6"/><path d="M138 30h24l-4 8h-16z" fill="#F5C542"/>` +
        person(92, 92, { shirt: '#7B52C7', stand: true, glasses: true, hair: '#5A3A25' }) + arm(108, 98, 124, 106, 142, 100, '#7B52C7', 'a-write', '<rect x="140" y="92" width="2.6" height="14" rx="1.3" fill="#F5C542" transform="rotate(35 142 100)"/>') + arm(76, 98, 66, 116, 76, 124, '#7B52C7', '');
    },
    site: (k) => {
      let lat = ''; for (let i = 0; i < 9; i++) lat += `<path d="M186 ${34 + i * 14}l6 14M192 ${34 + i * 14}l-6 14" stroke="#F2B01E" stroke-width="1.2"/>`;
      return sky(k) + `<rect x="186" y="28" width="6" height="132" fill="#F2B01E"/>${lat}` +
        `<g class="jib" ${O(189, 26)}><rect x="104" y="22" width="190" height="5" fill="#F2B01E"/><path d="M104 27l25-22l25 22M189 5l-60 22M189 5l60 22" stroke="#F2B01E" stroke-width="1.4" fill="none"/><rect x="266" y="27" width="22" height="12" fill="#8C95A8"/><g class="hook"><path d="M126 27V70" stroke="#10131B" stroke-width="1.4"/><rect x="119" y="70" width="14" height="9" rx="2" fill="#F26B1D"/></g></g>` +
        `<g fill="#9AA3B2"><rect x="226" y="76" width="6" height="84"/><rect x="256" y="76" width="6" height="84"/><rect x="286" y="76" width="6" height="84"/></g><rect x="222" y="104" width="76" height="6" fill="#B7BFCC"/><rect x="222" y="134" width="76" height="6" fill="#B7BFCC"/><rect x="222" y="76" width="76" height="5" fill="#B7BFCC" opacity=".6"/>` +
        `<path d="M24 160L18 118M96 160L102 118" stroke="#5B3F2A" stroke-width="4"/><rect x="12" y="40" width="96" height="78" rx="3" fill="#EAEFF7"/><text x="20" y="53" font-size="7.5" font-weight="800" fill="#2B3752" font-family="Onest,sans-serif">График работ</text>` +
        [[20, 0.5, '#35C47A', 56], [32, 0.35, '#35C47A', 46], [18, 0.6, '#FF6262', 62], [40, 0.3, '#6FA3FF', 50]].map((b, i) => `<rect x="18" y="${60 + i * 13}" width="84" height="8" rx="2" fill="#D3DAE8"/><rect class="gb" style="animation-delay:${i * 0.6}s;transform-origin:${18 + b[0]}px 0" x="${18 + b[0]}" y="${60 + i * 13}" width="${b[3]}" height="8" rx="2" fill="${b[2]}"/>`).join('') +
        person(150, 92, { shirt: '#3C6FD8', stand: true, hat: '#F5F5F0', vest: true }) + arm(134, 98, 122, 92, 108, 84, '#3C6FD8', 'a-point') + arm(166, 98, 176, 114, 164, 122, '#3C6FD8', '') +
        `<rect x="158" y="106" width="16" height="22" rx="2" fill="#0C111B" stroke="#6FA3FF" stroke-width="1.2"/><path d="M161 112h10M161 116h10M161 120h6" stroke="#6FA3FF" stroke-width="1.4"/>` + pop(112, 124, 60, '4 задачи', '#F26B1D', '#fff', 0.4);
    },
    foreman: (k) => {
      return sky(k) + `<path d="M112 160V62M300 160V62" stroke="#8C95A8" stroke-width="3"/><rect x="108" y="100" width="196" height="4" fill="#B08A5A"/><rect x="108" y="130" width="196" height="4" fill="#B08A5A"/>` +
        bricks(130, 160, 11, 8, 15, 8, '#B8532E', true) +
        `<g class="pop" style="animation-delay:1.2s"><rect x="14" y="20" width="104" height="34" rx="9" fill="#2AABEE"/><path d="M22 30l16-6l-3 14l-5-4l-3 3l-1-5z" fill="#fff"/><text x="46" y="34" font-size="8" font-weight="700" fill="#fff" font-family="Onest,sans-serif">Задача №12</text><text x="46" y="46" font-size="8" fill="#EAF6FF" font-family="Onest,sans-serif">сдано 40 м³ ✓</text></g>` +
        person(70, 92, { shirt: '#8C95A8', stand: true, hat: '#F2B01E', vest: true }) + arm(86, 98, 106, 110, 124, 118, '#8C95A8', 'a-lay', '<path d="M122 118l12 -8l5 6l-12 8z" fill="#C9D0DC" stroke="#8C95A8"/>') + arm(54, 98, 46, 116, 56, 126, '#8C95A8', '');
    },
    checker: (k) => {
      const rowsA = [0, 1, 2, 3, 4, 5].map((i) => `<rect x="30" y="${48 + i * 14}" width="${52 - (i % 2) * 10}" height="3" rx="1.5" fill="#B9C1D0"/><rect x="88" y="${47 + i * 14}" width="16" height="5" rx="1.5" fill="${i === 1 || i === 4 ? '#FFD0D0' : '#DDE3EE'}"/>`).join('');
      let g = ''; for (let i = 1; i < 8; i++) g += `<path d="M${124 + i * 11} 30v108" stroke="#fff" opacity=".12"/>`; for (let j = 1; j < 9; j++) g += `<path d="M124 ${30 + j * 12}h90" stroke="#fff" opacity=".12"/>`;
      return office() + `<rect x="24" y="26" width="88" height="112" rx="3" fill="#F2F4F8"/><text x="68" y="40" text-anchor="middle" font-size="8" font-weight="800" fill="#2B3752" font-family="Onest,sans-serif">АКТ № 7</text>${rowsA}` +
        [1, 4].map((i, n) => `<ellipse class="ring" style="animation-delay:${n * 1.2 + 0.4}s" cx="96" cy="${49.5 + i * 14}" rx="13" ry="6" fill="none" stroke="#FF6262" stroke-width="1.8"/>`).join('') +
        `<rect x="124" y="30" width="90" height="108" rx="3" fill="#1E4E9C"/>${g}<g stroke="#fff" stroke-width="1.6" fill="none"><rect x="138" y="46" width="62" height="70"/><path d="M160 46V116M138 82H200"/></g><text x="169" y="130" text-anchor="middle" font-size="7.5" fill="#BFD2F5" font-family="Onest,sans-serif">Проект</text>` +
        pop(60, 10, 72, '−1,8 млн ₸', '#FF6262', '#fff', 1.6) +
        desk(20, 290) + person(268, 98, { shirt: '#C27A2C', glasses: true }) + arm(250, 104, 214, 108, 176, 100, '#C27A2C', 'a-sweep', '<circle cx="168" cy="96" r="14" fill="rgba(111,163,255,.16)" stroke="#F5C542" stroke-width="2.6"/><path d="M157 106l-9 9" stroke="#F5C542" stroke-width="3.6" stroke-linecap="round"/>') + arm(286, 104, 296, 122, 284, 134, '#C27A2C', '');
    },
    docs: (k) => {
      return office(win(k, 22, 20, 52, 44)) +
        `<rect x="176" y="84" width="96" height="46" rx="7" fill="#D7DCE6"/><rect x="186" y="78" width="76" height="10" rx="3" fill="#B9C1D0"/><rect x="192" y="116" width="64" height="5" rx="2" fill="#3A4764"/><circle cx="262" cy="100" r="3" fill="#35C47A" class="blinkd"/>` +
        `<defs><clipPath id="${k}p"><rect x="180" y="20" width="88" height="62"/></clipPath></defs><g clip-path="url(#${k}p)"><g class="paper"><rect x="194" y="34" width="60" height="48" rx="2" fill="#fff"/><text x="224" y="46" text-anchor="middle" font-size="5.2" font-weight="800" fill="#2B3752" font-family="Onest,sans-serif">АКТ СКРЫТЫХ РАБОТ</text><rect x="200" y="52" width="48" height="2.6" fill="#B9C1D0"/><rect x="200" y="58" width="40" height="2.6" fill="#B9C1D0"/><rect x="200" y="64" width="46" height="2.6" fill="#B9C1D0"/><circle cx="240" cy="74" r="5" fill="none" stroke="#35C47A" stroke-width="1.6"/></g></g>` +
        pop(200, 6, 56, 'Акт готов ✓', '#35C47A', '#06240F', 0.8) +
        `<g><rect x="280" y="118" width="26" height="4" fill="#fff"/><rect x="281" y="114" width="24" height="4" fill="#E8EDF6"/><rect x="280" y="110" width="26" height="4" fill="#fff"/><rect x="282" y="106" width="22" height="4" fill="#E8EDF6"/></g>` +
        desk(20, 290) + `<path d="M104 134h50l6 4h-62z" fill="#2B3752"/><rect x="108" y="102" width="44" height="32" rx="3" fill="#0C111B" stroke="#2B3752" stroke-width="2"/><path d="M114 110h32M114 116h26M114 122h30" stroke="#6FA3FF" stroke-width="2"/><path class="chk" d="M136 126l3 3l6-6" stroke="#35C47A" stroke-width="2" fill="none"/>` +
        person(64, 98, { shirt: '#3A8FB5' }) + arm(80, 104, 96, 122, 108, 130, '#3A8FB5', 'a-type') + arm(48, 104, 40, 122, 50, 134, '#3A8FB5', '');
    },
    finance: (k) => {
      let bars = '', path = 'M44 108';
      const hs = [34, 46, 40, 62, 56, 78];
      hs.forEach((h, i) => { bars += `<rect class="bar" style="animation-delay:${i * 0.25}s;transform-origin:${38 + i * 24}px 124px" x="${38 + i * 24}" y="${124 - h}" width="16" height="${h}" rx="2" fill="${i % 2 ? '#6FA3FF' : '#35C47A'}"/>`; path += ` L${46 + i * 24} ${124 - h - 10}`; });
      let grid = ''; for (let j = 1; j < 5; j++) grid += `<path d="M30 ${124 - j * 20}h140" stroke="#fff" opacity=".08"/>`;
      return office() + `<rect x="16" y="22" width="164" height="112" rx="6" fill="#0C111B" stroke="#2B3752" stroke-width="2"/><text x="28" y="38" font-size="8" font-weight="700" fill="#9FB3D9" font-family="Onest,sans-serif">План и факт, млн ₸</text>${grid}<path d="M30 124h140" stroke="#5B6C8F"/>${bars}<path class="draw" pathLength="1" d="${path}" fill="none" stroke="#F5C542" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>` +
        pop(190, 22, 84, 'Остаток 31,2 млн ₸', '#F5C542', '#2B2100', 1) +
        person(284, 98, { shirt: '#2E9D8F' }) + desk(184, 136) + [[200, 3], [224, 5], [248, 7]].map((c, i) => `<g class="coin" style="animation-delay:${i * 0.5}s;transform-origin:${c[0]}px 138px">` + Array.from({ length: c[1] }, (_, n) => `<rect x="${c[0] - 10}" y="${134 - n * 4.4}" width="20" height="4.2" rx="2" fill="#F5C542" stroke="#B88A1B" stroke-width=".8"/>`).join('') + '</g>').join('') +
        arm(268, 104, 260, 122, 270, 134, '#2E9D8F', 'a-type') + arm(300, 104, 306, 122, 296, 134, '#2E9D8F', '');
    },
    equip: (k) => {
      const wheel = (x) => `<g class="wheel" ${O(x, 146)}><circle cx="${x}" cy="146" r="11" fill="#10131B"/><circle cx="${x}" cy="146" r="5" fill="#8C95A8"/><path d="M${x} 136v20M${x - 10} 146h20" stroke="#8C95A8" stroke-width="1.5"/></g>`;
      let ticks = ''; for (let i = -4; i <= 4; i++) ticks += `<path d="M44 40v4" stroke="#6B7A99" stroke-width="1.4" transform="rotate(${i * 20} 44 52)"/>`;
      return sky(k) + `<rect x="24" y="126" width="150" height="16" rx="3" fill="#F2B01E"/><rect x="132" y="104" width="38" height="38" rx="4" fill="#F2B01E"/><rect x="146" y="110" width="20" height="16" rx="2" fill="#9FC5E8"/>` +
        `<g class="boom" ${O(62, 118)}><path d="M62 118L196 52" stroke="#F2B01E" stroke-width="9" stroke-linecap="round"/><path d="M150 76L204 49" stroke="#D99A0B" stroke-width="6" stroke-linecap="round"/><path d="M204 49V92" stroke="#10131B" stroke-width="1.4"/><rect x="198" y="92" width="12" height="9" rx="2" fill="#F26B1D"/></g>` +
        `<rect x="40" y="118" width="40" height="10" rx="2" fill="#D99A0B"/>` + wheel(48) + wheel(88) + wheel(146) + `<path d="M30 142l-8 18M170 142l8 18" stroke="#8C95A8" stroke-width="3"/>` +
        `<circle cx="44" cy="52" r="26" fill="#0C111B" stroke="#2B3752" stroke-width="2.4"/>${ticks}<g class="needle" ${O(44, 52)}><path d="M44 52L44 32" stroke="#F26B1D" stroke-width="2.4" stroke-linecap="round"/></g><circle cx="44" cy="52" r="3" fill="#F26B1D"/><text x="44" y="68" text-anchor="middle" font-size="6.4" fill="#9FB3D9" font-family="Onest,sans-serif">моточасы</text>` +
        pop(70, 12, 58, 'ТО через 12 ч', '#F26B1D', '#fff', 0.3) +
        person(258, 92, { shirt: '#4A5875', stand: true, hat: '#F26B1D', vest: true }) + arm(274, 98, 288, 112, 278, 122, '#4A5875', '') + arm(242, 98, 232, 84, 222, 72, '#4A5875', 'a-point') +
        `<rect x="264" y="108" width="16" height="22" rx="2" fill="#0C111B" stroke="#6FA3FF" stroke-width="1.2" transform="rotate(8 272 120)"/><path d="M267 114h10M267 118h10M267 122h6" stroke="#6FA3FF" stroke-width="1.4" transform="rotate(8 272 120)"/>`;
    }
  };

  /* ---------- что делает сотрудник прямо сейчас ---------- */
  const LIVE = {
    tender: ['Ищет закупки на сайтах…', 'Нашёл 3 новых тендера', 'Проверяет требования к участнику', 'Считает прибыль по лоту'],
    estimator: ['Читает чертежи КЖ…', 'Считает объёмы: сваи 462 шт', 'Подставляет цены РК 2026', 'Собирает книгу Excel'],
    supply: ['Ищет газоблок D500…', 'Сравнивает цены на кирпич', 'Ждёт ответ от поставщика', 'Обновил цены: бетон и арматура'],
    lawyer: ['Читает договор субподряда…', 'Нашёл риск в п. 7.2', 'Готовит правки со ссылкой на закон', 'Пишет претензию'],
    arch: ['Рисует план дома 10×12 м…', 'Подбирает фасад', 'Считает примерную стоимость', 'Сохраняет концепт'],
    site: ['Рассылает задачи прорабам', 'Сверяет график с фактом', 'Кладка: отставание 11 дн.', 'Проверяет склад проекта'],
    foreman: ['Принимает объём в Telegram', 'Задача №12: сдано 40 м³', 'Собирает отчёт за день', 'Отправляет наряд-задание'],
    checker: ['Сверяет акт №7 с проектом…', 'Нашёл завышение: 1,8 млн ₸', 'Ищет лишние позиции', 'Готовит список расхождений'],
    docs: ['Заполняет акт скрытых работ…', 'Подставляет реквизиты', 'Печатает пакет: 6 актов', 'Кладёт в «Сделанные»'],
    finance: ['Сводит расходы и поступления…', 'Считает остаток денег', 'Считает налоги по ставкам 2026', 'Обновил баланс по проектам'],
    equip: ['Проверяет моточасы автокрана', 'Напомнил о ТО через 12 ч', 'Считает расход топлива', 'Сводит доходы и расходы по технике']
  };
  const ZONE = {
    'До начала строительства': ['Кабинет', 'Здесь готовятся: считают, ищут работу, проверяют договоры и закупают материалы.'],
    'В процессе строительства': ['Площадка', 'Здесь идёт стройка: график, объёмы за день, акты, документы, деньги и техника.']
  };

  /* Сотрудники, для которых лежат ролики «миниатюры» в media/mini/<id>.mp4 (+ <id>.jpg).
     Пока файлов нет, список пуст и показывается нарисованная сцена. Готовый ролик: добавьте id сюда. */
  const MINI = [];
  const miniVideo = (id) => `<video class="mini" muted loop playsinline preload="metadata" poster="../../media/mini/${id}.jpg" src="../../media/mini/${id}.mp4"></video>`;

  /* ---------- страница ---------- */
  S._digital = function (rt, ctx) {
    const D = AQ.D, I = D.agentInfo, list = D.agents, r = AQ.role();
    const mine = list.filter((a) => AQ.can(a.need)).length, total = list.reduce((s, a) => s + a.done, 0);
    AQ.store.set('aq02_dept', '1');
    const first = r.start && r.start[0] ? r.start[0][0] : '';
    const rec = list.filter((a) => AQ.can(a.need) && a.go === first)[0] || list.filter((a) => AQ.can(a.need) && a.id === 'estimator')[0] || list.filter((a) => AQ.can(a.need))[0];
    let h = AQ.head('Цифровой отдел', 'Каждый ИИ-сотрудник работает в своей зоне и занят своим делом. Нажмите кнопку под нужным, и он возьмётся за вашу задачу.', '<a href="#/home/today">Главная</a> / Цифровой отдел');
    h += `<div class="deptstat"><div><b class="mono">${list.length}</b><span>ИИ-сотрудников</span></div><div><b class="mono">${mine}</b><span>доступно вашей роли</span></div><div><b class="mono">${total}</b><span>действий за месяц</span></div><button class="btn" data-act="tour-open">▶ Знакомство · 45 сек</button></div>`;
    const card = (a) => {
      const f = I[a.id] || {}, go = AQ.canRoute(a.go) ? a.go : (a.alt && AQ.canRoute(a.alt) ? a.alt : ''), ok = AQ.can(a.need) && !!go, live = LIVE[a.id] || [a.last];
      const svg = SC[a.id] ? `<svg viewBox="0 0 320 200" role="img" aria-label="${esc(a.n)} за работой" preserveAspectRatio="xMidYMid slice">${SC[a.id](a.id)}</svg>` : '';
      const vid = MINI.indexOf(a.id) !== -1;
      return `<article class="dcard${rec && rec.id === a.id ? ' rec' : ''}${ok ? '' : ' dim'}${vid ? ' has-video' : ''}" id="ag-${a.id}">${rec && rec.id === a.id ? '<span class="atrec">С этого начать</span>' : ''}<div class="dscene">${svg}${vid ? miniVideo(a.id) : ''}</div><div class="dbody"><div class="dh"><h3>${esc(a.n)}</h3><span class="dst ${a.status === 'работает' ? 'on' : ''}"><i></i>${esc(a.status)}</span></div><p class="djob">${esc(f.job || a.role)}</p><p class="dlive" data-id="${a.id}"><span>${esc(live[0])}</span></p><div class="dbtn">${ok ? `<a class="btn pri" href="#/${go}">${esc((go === a.alt && f.verbAlt) ? f.verbAlt : (f.verb || 'Открыть'))} →</a>` : '<button class="btn" disabled>Доступно другой роли</button>'}<button class="btn" data-act="agent-info" data-id="${a.id}">Что умеет</button></div></div></article>`;
    };
    const groups = [];
    list.forEach((a) => { let g = groups.filter((x) => x.n === a.group)[0]; if (!g) { g = { n: a.group, items: [] }; groups.push(g); } g.items.push(a); });
    groups.forEach((g, gi) => {
      const z = ZONE[g.n] || [g.n, ''];
      h += `<section class="dzone ${gi ? 'site' : 'office'}"><div class="dzh"><h2>${esc(g.n)}</h2><span class="tag t-mute">${esc(z[0])} · ${g.items.length}</span><p>${esc(z[1])}</p></div><div class="dgrid">${g.items.map(card).join('')}</div></section>`;
    });
    h += '<div class="tile" style="margin-top:18px"><div class="lbl"><span>Сделано за неделю</span><span class="tag t-ok">в эфире</span></div><div class="feed" id="livefeed">' + D.feed.filter((f) => AQ.canRoute(f.go)).map((f) => `<a class="ln pre" href="#/${f.go}"><time>${f.time}</time><div><b>${esc(f.agent)}</b> · ${esc(f.t)}</div></a>`).join('') + '</div></div>';
    ctx.after = function () {
      /* сцены играют только пока карточка видна */
      const cards = AQ.$$('.dcard');
      cards.forEach((c) => c.classList.add('run'));
      const playVid = (c, on) => { const v = c.querySelector('video.mini'); if (!v) return; if (on && !AQ.reduced) { const p = v.play(); if (p && p.catch) p.catch(() => {}); } else v.pause(); };
      cards.forEach((c) => playVid(c, true));
      if ('IntersectionObserver' in window) { const io = new IntersectionObserver((es) => es.forEach((e) => { e.target.classList.toggle('run', e.isIntersecting); playVid(e.target, e.isIntersecting); }), { rootMargin: '120px' }); cards.forEach((c) => io.observe(c)); }
      /* строка «что делает сейчас» */
      if (!AQ.reduced) {
        const idx = {};
        let tick = 0;
        AQ.every(() => { tick++; AQ.$$('.dlive').forEach((p, n) => { if ((tick + n) % 3) return; const id = p.getAttribute('data-id'), L = LIVE[id]; if (!L) return; idx[id] = ((idx[id] || 0) + 1) % L.length; const s = p.firstElementChild; s.textContent = L[idx[id]]; s.classList.remove('in'); void s.offsetWidth; s.classList.add('in'); }); }, 1500);
      }
      if (AQ.agentVideos) AQ.agentVideos();
      AQ.reveal('#livefeed .ln.pre', 400); AQ.later(() => AQ.liveFeed(AQ.$('#livefeed')), 3200);
    };
    return h;
  };

  /* «Что умеет» */
  AQ.acts['agent-info'] = (t) => {
    const id = t.getAttribute('data-id'), a = AQ.D.agents.filter((x) => x.id === id)[0], f = AQ.D.agentInfo[id] || {};
    const go = AQ.canRoute(a.go) ? a.go : (a.alt && AQ.canRoute(a.alt) ? a.alt : ''), ok = AQ.can(a.need) && !!go, fnd = go ? AQ.findTab(go) : null;
    AQ.overlay(`<div class="mh"><div><h2>${esc(a.n)}</h2><span class="mut" style="font-size:13px">${esc(f.job || a.role)}</span></div><button class="pill ico" data-act="close" aria-label="Закрыть">✕</button></div>` +
      `<div class="mscene${MINI.indexOf(id) !== -1 ? ' has-video' : ''}"><svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">${SC[id] ? SC[id](id + 'm') : ''}</svg>${MINI.indexOf(id) !== -1 ? miniVideo(id).replace('<video ', '<video autoplay ') : ''}</div>` +
      `<h3 style="font-size:14px;margin:12px 0 6px">Что делает</h3><ul class="dlist">${(f.does || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` +
      `<div class="atflow" style="margin:12px 0"><span>${esc(f.giveS || '')}</span><i>→</i><b>${esc(f.getS || '')}</b></div><p class="mut" style="font-size:13px"><b>Недавно:</b> ${esc(f.example || a.last)}</p>` +
      `<div class="btns">${ok ? `<a class="btn pri" href="#/${go}" data-act="close">${esc((go === a.alt && f.verbAlt) ? f.verbAlt : (f.verb || 'Открыть'))} →</a>` : ''}<button class="btn" data-act="close">Закрыть</button></div>${fnd ? `<p class="mut" style="font-size:12px;margin-top:8px">Где найти: ${esc(fnd.s.t)} → ${esc(fnd.t.t)}</p>` : ''}`, 'wide');
  };
  AQ.scenes = SC;
})();
