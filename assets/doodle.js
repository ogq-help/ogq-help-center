/*
 * OGQ 로고 기념일 장식 (구글 두들처럼)
 * - 한국 시간 날짜를 보고 그날 장식을 로고 위에 얹는다. 날이 지나면 원래 로고.
 * - 원래 로고 그림(assets/img/ogq-logo-brand.png, 838×262)은 그대로 두고, 같은 크기의 SVG를 위에 겹친다.
 *   글자 중심: O(131,131) · G(419,131) · Q(706,131), 글자 위쪽 끝 y=0
 * - 미리 보기: 주소 끝에 ?doodle=police 처럼 붙이면 그 장식으로 보인다(?doodle=off 이면 끔).
 * - 설날·추석·부처님오신날은 음력이라 해마다 날짜를 아래 표에 넣어 둔다(2026~2030).
 */
(function () {
  'use strict';

  /* ── 음력 기념일(양력 날짜) ── */
  var LUNAR = {
    seollal: { 2026: ['02-15', '02-18'], 2027: ['02-05', '02-08'], 2028: ['01-24', '01-27'], 2029: ['02-11', '02-14'], 2030: ['02-01', '02-04'] },
    chuseok: { 2026: ['09-23', '09-26'], 2027: ['09-13', '09-16'], 2028: ['10-01', '10-04'], 2029: ['09-20', '09-23'], 2030: ['09-10', '09-13'] },
    buddha: { 2026: ['05-24', '05-24'], 2027: ['05-13', '05-13'], 2028: ['05-02', '05-02'], 2029: ['05-20', '05-20'], 2030: ['05-09', '05-09'] }
  };

  /* ── 해마다 같은 날(월-일 범위). 위에 있을수록 먼저 ── */
  var FIXED = [
    ['12-31', '12-31', 'newyear'], ['01-01', '01-02', 'newyear'],
    ['02-14', '02-14', 'valentine'],
    ['03-01', '03-01', 'flag'],
    ['03-14', '03-14', 'whiteday'],
    ['04-05', '04-05', 'sprout'],
    ['05-05', '05-05', 'children'],
    ['05-08', '05-08', 'carnation'], ['05-15', '05-15', 'teacher'],
    ['08-15', '08-15', 'flag'],
    ['10-03', '10-03', 'flag'],
    ['10-09', '10-09', 'hangeul'],
    ['10-21', '10-21', 'police'],
    ['10-25', '10-31', 'halloween'],
    ['11-09', '11-09', 'fire'],
    ['11-11', '11-11', 'pepero'],
    ['12-20', '12-26', 'christmas']
  ];
  /* ── 특별한 날이 없을 때의 계절 장식 ── */
  var SEASON = [
    ['12-01', '12-31', 'snow'], ['01-03', '02-28', 'snow'],
    ['03-25', '04-12', 'blossom']
  ];

  var TITLES = {
    newyear: '새해 복 많이 받으세요 🎆', seollal: '즐거운 설날 보내세요 🧧', chuseok: '풍성한 한가위 보내세요 🌕',
    valentine: '해피 밸런타인데이 💝', flag: '태극기를 달아요 🇰🇷', whiteday: '해피 화이트데이 🍭', sprout: '오늘은 식목일 🌱',
    children: '어린이날을 축하해요 🎈', carnation: '어버이날, 감사합니다 💐', teacher: '스승의 날, 감사합니다 💐',
    buddha: '부처님 오신 날 🏮', hangeul: '오늘은 한글날 ㄱㄴㄷ', police: '오늘은 경찰의 날이에요 👮', halloween: '해피 할로윈 🎃',
    fire: '오늘은 소방의 날이에요 🚒', pepero: '빼빼로데이 🍫', christmas: '메리 크리스마스 🎄', snow: '포근한 겨울 보내세요 ❄️', blossom: '봄이 왔어요 🌸'
  };

  function kstToday() {
    var d = new Date(Date.now() + 9 * 3600000);
    var mm = ('0' + (d.getUTCMonth() + 1)).slice(-2), dd = ('0' + d.getUTCDate()).slice(-2);
    return { y: d.getUTCFullYear(), md: mm + '-' + dd };
  }
  function inRange(md, a, b) { return a <= b ? (md >= a && md <= b) : (md >= a || md <= b); }

  function pick() {
    var q = /[?&]doodle=([\w-]+)/.exec(location.search);
    if (q) return q[1] === 'off' ? '' : q[1];
    var t = kstToday(), k;
    for (k in LUNAR) { var r = LUNAR[k][t.y]; if (r && inRange(t.md, r[0], r[1])) return k; }
    for (var i = 0; i < FIXED.length; i++) if (inRange(t.md, FIXED[i][0], FIXED[i][1])) return FIXED[i][2];
    for (var j = 0; j < SEASON.length; j++) if (inRange(t.md, SEASON[j][0], SEASON[j][1])) return SEASON[j][2];
    return '';
  }

  /* ── 그림 조각 ── */
  var O = 131, G = 419, Q = 706;
  function snowCap(cx) {
    return '<path transform="translate(0,10)" d="M' + (cx - 104) + ',44 Q' + (cx - 96) + ',-16 ' + cx + ',-18 Q' + (cx + 96) + ',-16 ' + (cx + 104) + ',44 Q' + (cx + 70) + ',20 ' + (cx + 30) + ',28 Q' + cx + ',16 ' + (cx - 30) + ',26 Q' + (cx - 70) + ',16 ' + (cx - 104) + ',44Z" fill="#f5faff" stroke="#b9d3ee" stroke-width="6"/>';
  }
  function fall(kind, n, color) {
    // 내리는 것(눈·꽃잎·하트): 위치·크기·속도를 고르게 섞는다
    var s = '';
    for (var i = 0; i < n; i++) {
      var x = Math.round(((i * 0.618034) % 1) * 980 - 70), dur = 5 + (i * 37 % 50) / 10, delay = -((i * 53) % 70) / 10, sz = 9 + (i * 13 % 9);
      var shape = kind === 'petal' ? '<ellipse rx="' + sz + '" ry="' + (sz * 0.6) + '" fill="' + color + '" transform="rotate(' + (i * 47 % 180) + ')"/>'
        : kind === 'heart' ? '<path d="M0,6 C-14,-8 -6,-18 0,-9 C6,-18 14,-8 0,6Z" fill="' + color + '" transform="scale(' + (sz / 9) + ')"/>'
        : '<circle r="' + (sz * 0.7) + '" fill="' + color + '"/>';
      s += '<g class="dd-fall' + (kind === 'heart' ? ' up' : '') + '" style="animation-duration:' + dur + 's;animation-delay:' + delay + 's"><g transform="translate(' + x + ',0)">' + shape + '</g></g>';
    }
    return s;
  }
  function hatPolice(cx) {
    return '<g transform="translate(0,20)"><g class="dd-pop"><ellipse cx="' + cx + '" cy="-44" rx="118" ry="36" fill="#25335f"/>' +
      '<rect x="' + (cx - 82) + '" y="-46" width="164" height="46" rx="10" fill="#1b2547"/>' +
      '<rect x="' + (cx - 82) + '" y="-16" width="164" height="9" fill="#d4ac2b"/>' +
      '<path d="M' + (cx - 92) + ',0 Q' + cx + ',44 ' + (cx + 92) + ',0 Q' + cx + ',20 ' + (cx - 92) + ',0Z" fill="#0f1426"/>' +
      '<circle cx="' + cx + '" cy="-50" r="19" fill="#f2c94c" stroke="#b8891a" stroke-width="4"/>' +
      '<path d="M' + cx + ',-63 l4,9 10,1 -8,6 3,10 -9,-6 -9,6 3,-10 -8,-6 10,-1z" fill="#1b2547"/></g></g>';
  }
  function helmetFire(cx) {
    return '<g transform="translate(0,18)"><g class="dd-pop"><path d="M' + (cx - 92) + ',6 Q' + (cx - 92) + ',-92 ' + cx + ',-92 Q' + (cx + 92) + ',-92 ' + (cx + 92) + ',6Z" fill="#e03131"/>' +
      '<rect x="' + (cx - 7) + '" y="-96" width="14" height="100" rx="7" fill="#b72424"/>' +
      '<ellipse cx="' + cx + '" cy="6" rx="122" ry="16" fill="#b72424"/>' +
      '<path d="M' + (cx - 22) + ',-58 h44 v26 q0,18 -22,26 q-22,-8 -22,-26z" fill="#f2c94c" stroke="#a87b12" stroke-width="4"/></g></g>';
  }
  function hatSanta(cx) {
    return '<g transform="translate(0,22)"><g class="dd-pop">' +
      '<path d="M' + (cx - 104) + ',0 C' + (cx - 84) + ',-96 ' + (cx - 6) + ',-132 ' + (cx + 70) + ',-118 C' + (cx + 116) + ',-110 ' + (cx + 142) + ',-78 ' + (cx + 146) + ',-40 L' + (cx + 120) + ',-44 C' + (cx + 112) + ',-72 ' + (cx + 90) + ',-84 ' + (cx + 60) + ',-80 C' + (cx + 86) + ',-52 ' + (cx + 100) + ',-26 ' + (cx + 104) + ',0Z" fill="#e03131"/>' +
      '<path d="M' + (cx - 40) + ',-100 C' + (cx - 10) + ',-118 ' + (cx + 30) + ',-118 ' + (cx + 60) + ',-108" fill="none" stroke="#b72424" stroke-width="6" stroke-linecap="round" opacity=".5"/>' +
      '<circle cx="' + (cx + 134) + '" cy="-36" r="24" fill="#fff" stroke="#d5dbe5" stroke-width="5"/>' +
      '<rect x="' + (cx - 120) + '" y="-16" width="240" height="36" rx="18" fill="#fff" stroke="#d5dbe5" stroke-width="5"/></g></g>';
  }
  function hatWitch(cx) {
    return '<g transform="translate(0,16)"><g class="dd-pop"><ellipse cx="' + cx + '" cy="2" rx="150" ry="20" fill="#2b1a3a"/>' +
      '<path d="M' + (cx - 66) + ',0 L' + (cx - 12) + ',-98 Q' + (cx + 4) + ',-122 ' + (cx + 36) + ',-104 Q' + (cx + 10) + ',-98 ' + (cx + 8) + ',-80 L' + (cx + 66) + ',0Z" fill="#2b1a3a"/>' +
      '<rect x="' + (cx - 60) + '" y="-24" width="120" height="17" fill="#f08c2e"/></g></g>';
  }
  function pumpkin(x, y) {
    return '<g class="dd-pop"><ellipse cx="' + x + '" cy="' + y + '" rx="46" ry="38" fill="#f08c2e"/><ellipse cx="' + x + '" cy="' + y + '" rx="20" ry="38" fill="#e2731d"/>' +
      '<rect x="' + (x - 5) + '" y="' + (y - 50) + '" width="10" height="16" rx="3" fill="#4b7d2a"/>' +
      '<path d="M' + (x - 22) + ',' + (y - 8) + ' l9,-12 9,12z M' + (x + 4) + ',' + (y - 8) + ' l9,-12 9,12z M' + (x - 22) + ',' + (y + 10) + ' q22,16 44,0 q-22,8 -44,0z" fill="#3b2208"/></g>';
  }
  function bat(x, y, s) {
    return '<g class="dd-flap" style="transform-origin:' + x + 'px ' + y + 'px"><path transform="translate(' + x + ',' + y + ') scale(' + s + ')" d="M0,0 C-10,-14 -26,-14 -40,-4 C-30,-4 -26,2 -24,8 C-18,2 -10,2 -6,8 L0,2 L6,8 C10,2 18,2 24,8 C26,2 30,-4 40,-4 C26,-14 10,-14 0,0Z" fill="#2b1a3a"/></g>';
  }
  function balloon(x, y, c, d) {
    return '<g class="dd-bob" style="animation-delay:' + d + 's"><path d="M' + x + ',' + (y + 46) + ' q-10,40 6,80 q14,40 -4,90" fill="none" stroke="#8a8f9c" stroke-width="3"/>' +
      '<ellipse cx="' + x + '" cy="' + y + '" rx="36" ry="44" fill="' + c + '"/><path d="M' + (x - 6) + ',' + (y + 44) + ' l6,9 6,-9z" fill="' + c + '"/>' +
      '<ellipse cx="' + (x - 12) + '" cy="' + (y - 14) + '" rx="8" ry="13" fill="#fff" opacity=".45"/></g>';
  }
  function carnation(x, y) {
    var petals = '';
    for (var i = 0; i < 9; i++) { var a = i * 40 * Math.PI / 180; petals += '<circle cx="' + (x + Math.cos(a) * 20).toFixed(1) + '" cy="' + (y + Math.sin(a) * 14 - 6).toFixed(1) + '" r="17" fill="' + (i % 2 ? '#e8384f' : '#f25c6e') + '"/>'; }
    return '<g class="dd-pop"><path d="M' + x + ',' + (y + 14) + ' q-6,50 4,96" fill="none" stroke="#3f8f3a" stroke-width="7"/>' +
      '<path d="M' + (x + 2) + ',' + (y + 60) + ' q26,-14 34,6 q-22,6 -34,-6z" fill="#4fa64a"/>' + petals +
      '<path d="M' + (x - 16) + ',' + (y + 12) + ' q16,14 32,0 l-4,10 q-12,8 -24,0z" fill="#3f8f3a"/></g>';
  }
  function lantern(x, y, c, d) {
    return '<g class="dd-swing" style="animation-delay:' + d + 's;transform-origin:' + x + 'px -70px"><line x1="' + x + '" y1="-70" x2="' + x + '" y2="' + (y - 40) + '" stroke="#8a6d3b" stroke-width="3"/>' +
      '<ellipse cx="' + x + '" cy="' + y + '" rx="34" ry="42" fill="' + c + '" stroke="#c0392b" stroke-width="3"/>' +
      '<path d="M' + (x - 34) + ',' + y + ' h68 M' + (x - 26) + ',' + (y - 22) + ' h52 M' + (x - 26) + ',' + (y + 22) + ' h52" stroke="#fff" stroke-width="3" opacity=".6"/>' +
      '<path d="M' + (x - 8) + ',' + (y + 42) + ' l-4,26 M' + x + ',' + (y + 42) + ' v28 M' + (x + 8) + ',' + (y + 42) + ' l4,26" stroke="#c0392b" stroke-width="3"/></g>';
  }
  function flag(x, y) {
    // 태극기: 흰 바탕·태극·네 괘(간단히)
    var w = 150, h = 100, cx = x + w / 2, cy = y + h / 2, r = 24;
    function bars(bx, by, rot, pat) {
      var s = '<g transform="translate(' + bx + ',' + by + ') rotate(' + rot + ')">';
      for (var i = 0; i < 3; i++) s += pat[i] ? '<rect x="-14" y="' + (i * 8 - 10) + '" width="28" height="5" fill="#111"/>' : '<rect x="-14" y="' + (i * 8 - 10) + '" width="12" height="5" fill="#111"/><rect x="2" y="' + (i * 8 - 10) + '" width="12" height="5" fill="#111"/>';
      return s + '</g>';
    }
    return '<g class="dd-wave" style="transform-origin:' + x + 'px ' + y + 'px">' +
      '<rect x="' + (x - 10) + '" y="' + (y - 12) + '" width="7" height="' + (h + 190) + '" rx="3" fill="#8a6d3b"/><circle cx="' + (x - 6.5) + '" cy="' + (y - 14) + '" r="8" fill="#d4ac2b"/>' +
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="#fff" stroke="#d9dbe3" stroke-width="2"/>' +
      '<g transform="rotate(33.7 ' + cx + ' ' + cy + ')"><path d="M' + (cx - r) + ',' + cy + ' A' + r + ',' + r + ' 0 0 1 ' + (cx + r) + ',' + cy + 'Z" fill="#cd2e3a"/><path d="M' + (cx - r) + ',' + cy + ' A' + r + ',' + r + ' 0 0 0 ' + (cx + r) + ',' + cy + 'Z" fill="#0047a0"/>' +
      '<circle cx="' + (cx - r / 2) + '" cy="' + cy + '" r="' + (r / 2) + '" fill="#cd2e3a"/><circle cx="' + (cx + r / 2) + '" cy="' + cy + '" r="' + (r / 2) + '" fill="#0047a0"/></g>' +
      bars(x + 26, y + 22, -33.7, [1, 1, 1]) + bars(x + w - 26, y + h - 22, -33.7, [0, 0, 0]) + bars(x + w - 26, y + 22, 33.7, [0, 1, 0]) + bars(x + 26, y + h - 22, 33.7, [1, 0, 1]) + '</g>';
  }
  function firework(x, y, c, d) {
    var s = '<g class="dd-burst" style="animation-delay:' + d + 's;transform-origin:' + x + 'px ' + y + 'px">';
    for (var i = 0; i < 12; i++) { var a = i * 30 * Math.PI / 180; s += '<line x1="' + (x + Math.cos(a) * 12).toFixed(1) + '" y1="' + (y + Math.sin(a) * 12).toFixed(1) + '" x2="' + (x + Math.cos(a) * 40).toFixed(1) + '" y2="' + (y + Math.sin(a) * 40).toFixed(1) + '" stroke="' + c + '" stroke-width="6" stroke-linecap="round"/>'; }
    return s + '<circle cx="' + x + '" cy="' + y + '" r="6" fill="' + c + '"/></g>';
  }
  function pouch(x, y) {
    // 복주머니
    return '<g class="dd-bob"><path d="M' + (x - 44) + ',' + (y + 4) + ' Q' + (x - 60) + ',' + (y + 80) + ' ' + x + ',' + (y + 84) + ' Q' + (x + 60) + ',' + (y + 80) + ' ' + (x + 44) + ',' + (y + 4) + ' Q' + x + ',' + (y - 14) + ' ' + (x - 44) + ',' + (y + 4) + 'Z" fill="#e8384f"/>' +
      '<path d="M' + (x - 30) + ',' + (y - 2) + ' Q' + (x - 36) + ',' + (y - 34) + ' ' + x + ',' + (y - 26) + ' Q' + (x + 36) + ',' + (y - 34) + ' ' + (x + 30) + ',' + (y - 2) + 'Z" fill="#f2c94c"/>' +
      '<rect x="' + (x - 40) + '" y="' + (y - 4) + '" width="80" height="10" rx="5" fill="#2f6fd6"/>' +
      '<text x="' + x + '" y="' + (y + 56) + '" text-anchor="middle" font-size="40" font-weight="700" fill="#f2c94c" font-family="serif">福</text></g>';
  }
  function moon(x, y) {
    return '<g class="dd-pop"><circle cx="' + x + '" cy="' + y + '" r="54" fill="#ffe08a"/><circle cx="' + (x + 16) + '" cy="' + (y - 12) + '" r="10" fill="#f5cf5f"/><circle cx="' + (x - 18) + '" cy="' + (y + 16) + '" r="7" fill="#f5cf5f"/></g>';
  }
  function songpyeon(x, y, c) {
    return '<path class="dd-pop" d="M' + (x - 30) + ',' + y + ' Q' + x + ',' + (y - 40) + ' ' + (x + 30) + ',' + y + 'Z" fill="' + c + '" stroke="#fff" stroke-width="3"/>';
  }
  function lollipop(x, y) {
    var sw = '';
    for (var i = 0; i < 4; i++) sw += '<circle cx="' + x + '" cy="' + y + '" r="' + (40 - i * 10) + '" fill="' + (i % 2 ? '#fff' : ['#ff7eb6', '#7ec8ff'][i / 2]) + '"/>';
    return '<g class="dd-pop"><line x1="' + (x - 10) + '" y1="' + (y + 30) + '" x2="' + (x - 70) + '" y2="' + (y + 190) + '" stroke="#f3f0e8" stroke-width="10" stroke-linecap="round"/>' + sw + '</g>';
  }
  function pepero(x, y, rot) {
    return '<g transform="rotate(' + rot + ' ' + x + ' ' + y + ')"><g class="dd-pop"><rect x="' + (x - 10) + '" y="' + (y - 230) + '" width="20" height="230" rx="10" fill="#d9a35f"/><rect x="' + (x - 13) + '" y="' + (y - 230) + '" width="26" height="170" rx="13" fill="#4a2810"/></g></g>';
  }
  function sprout(x, y) {
    return '<g class="dd-grow" style="transform-origin:' + x + 'px ' + y + 'px"><path d="M' + x + ',' + y + ' q-4,-40 2,-70" fill="none" stroke="#3f8f3a" stroke-width="8" stroke-linecap="round"/>' +
      '<path d="M' + (x + 2) + ',' + (y - 56) + ' q-46,-30 -62,6 q36,14 62,-6z" fill="#5cbf55"/><path d="M' + (x + 2) + ',' + (y - 66) + ' q44,-36 64,0 q-34,18 -64,0z" fill="#4fa64a"/></g>';
  }
  function heartIn(cx) {
    return '<path class="dd-beat" style="transform-origin:' + cx + 'px 131px" d="M' + cx + ',170 C' + (cx - 62) + ',122 ' + (cx - 46) + ',82 ' + cx + ',108 C' + (cx + 46) + ',82 ' + (cx + 62) + ',122 ' + cx + ',170Z" fill="#ff4d6d"/>';
  }
  function blossomOn(cx) {
    var s = '<g class="dd-pop">';
    [[-60, -6], [-20, -22], [24, -16], [64, -2]].forEach(function (p, k) {
      var x = cx + p[0], y = p[1];
      for (var i = 0; i < 5; i++) { var a = (i * 72 - 90) * Math.PI / 180; s += '<ellipse cx="' + (x + Math.cos(a) * 11).toFixed(1) + '" cy="' + (y + Math.sin(a) * 11).toFixed(1) + '" rx="10" ry="8" fill="' + (k % 2 ? '#ffc2d6' : '#ffd6e4') + '" transform="rotate(' + (i * 72) + ' ' + (x + Math.cos(a) * 11).toFixed(1) + ' ' + (y + Math.sin(a) * 11).toFixed(1) + ')"/>'; }
      s += '<circle cx="' + x + '" cy="' + y + '" r="5" fill="#f28fb0"/>';
    });
    return s + '</g>';
  }
  function jamo() {
    var L = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅎ'], C = ['#5b6fe6', '#7a6ce6', '#a877e2', '#f08c2e', '#2bb673', '#e8384f'], s = '';
    L.forEach(function (ch, i) { s += '<text class="dd-bob" style="animation-delay:' + (i * 0.3) + 's" x="' + (40 + i * 150) + '" y="' + (-6 - (i % 2) * 26) + '" font-size="84" font-weight="800" fill="' + C[i] + '" font-family="Pretendard, sans-serif">' + ch + '</text>'; });
    return s;
  }

  var DRAW = {
    police: function () { return '<g transform="rotate(-9 ' + O + ' 0)">' + hatPolice(O) + '</g>'; },
    fire: function () { return '<g transform="rotate(-9 ' + O + ' 0)">' + helmetFire(O) + '</g>'; },
    christmas: function () { return fall('snow', 22, '#a9c8ea') + snowCap(O) + snowCap(G) + hatSanta(Q); },
    snow: function () { return fall('snow', 26, '#a9c8ea') + snowCap(O) + snowCap(G) + snowCap(Q); },
    halloween: function () { return hatWitch(G) + pumpkin(820, 214) + bat(80, -36, 1.2) + bat(270, -60, 0.9) + bat(600, -50, 1); },
    children: function () { return balloon(800, -40, '#ff6b6b', 0) + balloon(870, -56, '#ffd43b', 0.4) + balloon(935, -30, '#4dabf7', 0.8); },
    carnation: function () { return '<g transform="translate(-30,-40) scale(1.4)">' + carnation(40, 10) + '</g>'; },
    teacher: function () { return '<g transform="translate(-30,-40) scale(1.4)">' + carnation(40, 10) + '</g>'; },
    buddha: function () { return '<path d="M-20,-70 Q419,-40 858,-70" fill="none" stroke="#8a6d3b" stroke-width="3"/>' + lantern(131, -2, '#ff9fbf', 0) + lantern(419, 6, '#ffd75e', 0.5) + lantern(706, -2, '#8fd99b', 1); },
    flag: function () { return flag(870, -40); },
    hangeul: function () { return jamo(); },
    pepero: function () { return pepero(860, 262, -12) + pepero(900, 262, 10); },
    valentine: function () { return heartIn(O) + fall('heart', 10, '#ff8fab'); },
    whiteday: function () { return lollipop(830, -40); },
    sprout: function () { return sprout(G, 0); },
    blossom: function () { return fall('petal', 18, '#ffc2d6') + blossomOn(O); },
    newyear: function () { return firework(60, -50, '#ffd43b', 0) + firework(290, -60, '#ff6b6b', 0.6) + firework(560, -55, '#4dabf7', 1.2) + firework(860, -50, '#b197fc', 1.8); },
    seollal: function () { return pouch(880, 40) + firework(290, -60, '#ffd43b', 0.3) + firework(560, -60, '#ff6b6b', 1); },
    chuseok: function () { return moon(565, -40) + songpyeon(830, 250, '#ffd6e4') + songpyeon(890, 250, '#c9f0c5') + songpyeon(860, 222, '#fff1b8'); }
  };

  var CSS = '.dd-wrap{position:relative;display:inline-block;line-height:0}' +
    '.dd-svg{position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible;pointer-events:none}' +
    '.dd-fall{animation:ddFall linear infinite}.dd-fall.up{animation-name:ddRise}' +
    '@keyframes ddFall{from{transform:translateY(-140px)}to{transform:translateY(330px)}}' +
    '@keyframes ddRise{from{transform:translateY(300px);opacity:0}20%{opacity:1}to{transform:translateY(-150px);opacity:0}}' +
    '.dd-pop{animation:ddPop .7s cubic-bezier(.2,1.6,.4,1) both}@keyframes ddPop{from{transform:translateY(-30px);opacity:0}to{transform:none;opacity:1}}' +
    '.dd-bob{animation:ddBob 3s ease-in-out infinite}@keyframes ddBob{50%{transform:translateY(-14px)}}' +
    '.dd-swing{animation:ddSwing 3.4s ease-in-out infinite}@keyframes ddSwing{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}' +
    '.dd-wave{animation:ddWave 2.6s ease-in-out infinite}@keyframes ddWave{50%{transform:skewY(-3deg)}}' +
    '.dd-flap{animation:ddFlap .5s ease-in-out infinite alternate}@keyframes ddFlap{to{transform:scaleY(.7)}}' +
    '.dd-burst{animation:ddBurst 2.4s ease-out infinite}@keyframes ddBurst{0%{transform:scale(.2);opacity:0}25%{opacity:1}70%{transform:scale(1);opacity:1}100%{transform:scale(1.15);opacity:0}}' +
    '.dd-beat{animation:ddBeat 1.2s ease-in-out infinite}@keyframes ddBeat{50%{transform:scale(1.12)}}' +
    '.dd-grow{animation:ddGrow 1.2s ease-out both}@keyframes ddGrow{from{transform:scale(0)}to{transform:scale(1)}}' +
    '.dd-clip{clip-path:inset(-200px -200px -60px -200px)}' +
    '@media (prefers-reduced-motion: reduce){.dd-svg *{animation:none!important}}';

  function render(img, key) {
    var draw = DRAW[key];
    if (!img || !draw) return false;
    var wrap = img.parentNode;
    if (!wrap.classList.contains('dd-wrap')) {
      var w = document.createElement('span');
      w.className = 'dd-wrap';
      img.parentNode.insertBefore(w, img);
      w.appendChild(img);
      wrap = w;
    }
    var old = wrap.querySelector('.dd-svg');
    if (old) old.remove();
    wrap.insertAdjacentHTML('beforeend', '<svg class="dd-svg" viewBox="0 0 838 262" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">' + draw() + '</svg>');
    var a = wrap.closest('a');
    if (a && TITLES[key]) a.title = TITLES[key];
    return true;
  }

  function start() {
    var key = pick();
    if (!key) return;
    if (!document.getElementById('dd-style')) {
      var st = document.createElement('style'); st.id = 'dd-style'; st.textContent = CSS; document.head.appendChild(st);
    }
    var imgs = document.querySelectorAll('.logo img');
    for (var i = 0; i < imgs.length; i++) render(imgs[i], key);
  }

  window.OGQDoodle = { render: function (img, key) {
    if (!document.getElementById('dd-style')) { var st = document.createElement('style'); st.id = 'dd-style'; st.textContent = CSS; document.head.appendChild(st); }
    return render(img, key);
  }, keys: Object.keys(DRAW), pick: pick };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
