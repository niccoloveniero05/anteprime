(function () {
  'use strict';
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var film = document.querySelector('.film'), quadro = document.getElementById('quadro'), dentro = document.getElementById('dentro');
  var scan = document.getElementById('scan-film'), passi = document.getElementById('passi-film');
  var capitoli = [].slice.call(document.querySelectorAll('.capitolo'));
  var blocchi = [].slice.call(document.querySelectorAll('.blocco'));
  var tacche = [].slice.call(passi.children);
  var S = {};
  [].forEach.call(document.querySelectorAll('.strato-film'), function (e) { S[e.dataset.s] = e; });
  var lim = function (v) { return Math.min(1, Math.max(0, v)); };
  var liscio = function (x) { x = lim(x); return x * x * (3 - 2 * x); };
  var dolce = function (x) { x = lim(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  var tra = function (t, a, b) { return (t - a) / (b - a); };
  function neon(x) { x = lim(x); if (x <= 0) return 0; if (x < 0.14) return 0.75; if (x < 0.24) return 0.05; if (x < 0.36) return 0.9; if (x < 0.44) return 0.2; return liscio((x - 0.44) / 0.56) * 0.25 + 0.75; }

  var PEZZI = {
    cofano: { x: 357, y: 160, w: 651, dx: 120, dy: 197, s: 0.99 },
    paraurti: { x: 48, y: 487, w: 562, dx: 365, dy: -30, s: 1.04 },
    portiera: { x: 1154, y: 275, w: 249, dx: -28, dy: 5, s: 1 },
    ruota1: { x: 919, y: 507, w: 205, dx: 34, dy: -27, s: 0.95 },
    ruota2: { x: 1399, y: 440, w: 129, dx: -31, dy: 5, s: 1 },
  };
  [].forEach.call(document.querySelectorAll('.pezzo'), function (e) {
    var p = PEZZI[e.dataset.p];
    p.e = e;
    e.style.left = p.x / 15.57 + '%';
    e.style.top = p.y / 8.76 + '%';
    e.style.width = p.w / 15.57 + '%';
  });

  var CAM = [[0, 1.08, 2, 0], [1, 1, 0, 0], [2, 1.03, 0, 0], [3, 0.98, 0, 1], [4, 1, 0, 0], [4.75, 1.14, -5, -2], [5.3, 1.03, 0, 0], [5.95, 2.2, -55, 28], [5.96, 1, 0, 0], [8, 1, 0, 1], [9, 1.06, -1, 0]];
  var CAM_TEL = [[0, 1.06, 0, 0], [1, 1, 0, 0], [2, 1.02, 0, 0], [3, 0.72, 5, 3], [4, 1, 0, 0], [4.75, 1.16, -8, 2], [5.3, 1, 0, 0], [5.95, 2.2, -55, 28], [5.96, 1, 0, 0], [8, 0.8, 3, 2], [9, 1.02, 0, 0]];
  function camera(k, t) {
    var i = 0;
    while (i < k.length - 2 && t > k[i + 1][0]) i++;
    var a = k[i], b = k[i + 1], u = liscio(tra(t, a[0], b[0]));
    return [a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u, a[3] + (b[3] - a[3]) * u];
  }

  var M = { off: [], tel: false, H: 1 }, stato = { cur: 0 };
  function misura() {
    M.H = innerHeight;
    M.tel = innerWidth < 820 && innerHeight >= innerWidth;
    var su = scrollY;
    M.off = capitoli.map(function (c) { return c.getBoundingClientRect().top + su; });
    M.fine = film.offsetTop + film.offsetHeight - M.H;
    M.ultimoT = -1;
  }
  function daScroll(y) {
    var o = M.off, n = capitoli.length - 1, i = 0;
    while (i < n - 1 && y >= o[i + 1]) i++;
    var a = o[i], b = i === n - 1 ? M.fine : o[i + 1];
    return Math.min(n, i + lim((y - a) / Math.max(1, b - a)));
  }
  function vedi(e, o) {
    var v = o > 0.002;
    if (e.__v !== v) { e.__v = v; e.style.visibility = v ? 'visible' : 'hidden'; }
    if (v && e.__o !== o) { e.__o = o; e.style.opacity = o.toFixed(3); }
  }
  function taglio(e, x) {
    e.style.clipPath = x >= 1 ? 'none' : 'inset(0 ' + ((1 - x) * 100).toFixed(2) + '% 0 0)';
  }
  function disegna(t) {
    if (t === M.ultimoT) return;
    M.ultimoT = t;
    var linea = -1;

    vedi(S.rossa, neon(tra(t, 0.5, 1.02)));

    var xr = dolce(tra(t, 1.5, 2.05));
    vedi(S.raggi, t > 3.15 ? 0 : xr > 0 ? 1 : 0);
    taglio(S.raggi, xr);
    if (xr > 0 && xr < 1) linea = xr;

    var u = t < 3.3 ? dolce(tra(t, 2.5, 3.1)) : 1 - dolce(tra(t, 3.55, 4.05));
    var oBase = t < 3.3 ? liscio(tra(t, 2.55, 2.9)) : 1 - liscio(tra(t, 3.75, 4.05));
    vedi(S.base, oBase);
    var oP = t < 3.3 ? lim(tra(t, 2.5, 2.62)) : 1 - lim(tra(t, 3.92, 4.05));
    Object.keys(PEZZI).forEach(function (n, i) {
      var p = PEZZI[n], g = lim(u * 1.25 - i * 0.05), k = 1 - dolce(g);
      vedi(p.e, oP);
      if (oP > 0.002) p.e.style.transform = 'translate3d(' + (p.dx * k / p.w * 100).toFixed(2) + '%,' + (p.dy * k / (p.w * (p.e.naturalHeight / p.e.naturalWidth || 1)) * 100).toFixed(2) + '%,0) scale(' + (1 + (p.s - 1) * k).toFixed(4) + ')';
    });

    var xs = dolce(tra(t, 4.05, 4.6));
    vedi(S.siriano, xs > 0 ? 1 : 0);
    taglio(S.siriano, xs);
    if (xs > 0 && xs < 1) linea = xs;

    var xg = dolce(tra(t, 5.1, 5.6));
    vedi(S.grigia, xg > 0 ? 1 : 0);
    taglio(S.grigia, 0.5 + xg * 0.5);
    if (xg > 0 && xg < 1) linea = 0.5 + xg * 0.5;

    var oDentro = t < 7 ? liscio(tra(t, 5.78, 5.95)) : 1 - liscio(tra(t, 7.55, 7.8));
    vedi(dentro, oDentro);
    if (oDentro > 0.002) {
      var zd = 1.22 - 0.2 * liscio(tra(t, 5.78, 7.5));
      dentro.style.transform = 'scale(' + zd.toFixed(4) + ')';
    }
    vedi(S.intbuio, 1);
    vedi(S.interni, neon(tra(t, 6.2, 6.65)));
    vedi(S.cruscotto, liscio(tra(t, 6.75, 7.1)));
    vedi(S.showroom, t < 7.5 ? 0 : neon(tra(t, 7.6, 8.05)) * 0.999 + 0.001);
    vedi(S.strada, liscio(tra(t, 8.55, 9)));

    if (linea >= 0) { scan.style.opacity = 1; scan.style.left = (linea * 100).toFixed(2) + '%'; } else scan.style.opacity = 0;

    var c = camera(M.tel ? CAM_TEL : CAM, t);
    quadro.style.transform = 'translate3d(' + c[1].toFixed(2) + '%,' + c[2].toFixed(2) + '%,0) scale(' + c[0].toFixed(4) + ')';

    var q = Math.round(t);
    tacche.forEach(function (e, i) { e.classList.toggle('on', i <= q); });
    passi.classList.toggle('vis', t > 0.25 && scrollY < M.fine);

    blocchi.forEach(function (e) {
      var su = e.getBoundingClientRect().top, u = parseFloat(getComputedStyle(e).top) || 0;
      var o = Math.min(lim((su - (u - M.H * 0.12)) / (M.H * 0.1)), lim(((u + M.H * 0.3) - su) / (M.H * 0.18)));
      if (e.__o !== o) { e.__o = o; e.style.opacity = o.toFixed(3); }
    });
  }
  misura();
  [].forEach.call(document.images, function (i) { if (!i.complete) i.addEventListener('load', function () { M.ultimoT = -1; }, { once: true }); });
  window.__rdueRegistra({
    misura: misura,
    passo: function (dt) {
      var y = scrollY;
      if (y > M.fine + M.H) return false;
      var b = daScroll(y), ancora = true;
      stato.cur += (b - stato.cur) * (1 - Math.exp(-dt / 0.1));
      if (Math.abs(b - stato.cur) < 0.0008) { stato.cur = b; ancora = false; }
      disegna(stato.cur);
      return ancora;
    },
  });
})();
