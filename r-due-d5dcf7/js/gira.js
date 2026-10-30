(function () {
  'use strict';
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var sez = document.getElementById('gira'), tela = document.getElementById('tela');
  var rete = navigator.connection || {};
  var lento = !!rete.saveData || /(^|-)[23]g$/.test(rete.effectiveType || '');
  var APERTI = 12;

  fetch('fot/gira/gira.json').then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(parti, function () {});

  function parti(cfg) {
    var N = cfg.n, LATO = cfg.lato || 11;
    var FONDO = 'rgb(' + (cfg.fondo || [11, 11, 12]).join(',') + ')';
    var OCCUPA = cfg.largo ? cfg.largo[1] - cfg.largo[0] : 0.85;
    var ctx = tela.getContext('2d', { alpha: false });
    var blob = new Array(N), foto = new Array(N), griglia = null, aperti = 0, inApertura = {};
    var coda = [], dopo = [], volo = 0, pronti = 0, falliti = 0, attesa = true, tentativi = {}, scorso = false;
    var attuale = 0, tAnte = 0, ultima = null, mostrata = false, acceso = false;
    sez.classList.add('film');
    if (window.__rdueMisura) __rdueMisura();

    function unici(a) { return a.filter(function (v, i) { return a.indexOf(v) === i; }); }
    (function ordine() {
      var o = [0, N - 1, Math.floor(N / 2)];
      [32, 16, 8].forEach(function (p) { for (var i = 0; i < N; i += p) o.push(i); });
      coda = unici(o);
      [4, 2, 1].forEach(function (p) { for (var i = 0; i < N; i += p) if (coda.indexOf(i) < 0) dopo.push(i); });
      dopo = unici(dopo);
    })();
    var totale = coda.length + dopo.length;

    function prossimo() {
      if (dopo.length && (scorso || (!coda.length && !lento))) { coda = coda.concat(dopo); dopo = []; }
      while (!attesa && volo < 8 && coda.length) prendi(coda.shift());
    }
    function prendi(i) {
      volo++;
      fetch('fot/gira/f_' + ('00' + i).slice(-3) + '.webp').then(function (r) {
        if (!r.ok) throw 0;
        return r.blob();
      }).then(function (b) {
        volo--; pronti++; blob[i] = b; prossimo();
      }, function () {
        volo--;
        tentativi[i] = (tentativi[i] || 0) + 1;
        if (tentativi[i] === 1) setTimeout(function () { coda.push(i); prossimo(); }, 1000);
        else {
          falliti++;
          if (!pronti && falliti > 3) {
            sez.classList.remove('film'); coda.length = 0; dopo.length = 0;
            if (window.__rdueMisura) __rdueMisura();
          }
        }
        prossimo();
      });
    }
    function apri(b) {
      if (window.createImageBitmap) return createImageBitmap(b);
      return new Promise(function (ok, no) {
        var im = new Image();
        im.onload = function () { ok(im); }; im.onerror = no; im.src = URL.createObjectURL(b);
      });
    }
    function chiudi(i) { if (foto[i].close) foto[i].close(); foto[i] = null; }
    function tieniAperti(c) {
      for (var i = 0; i < N; i++) if (foto[i] && Math.abs(i - c) > APERTI + 6) chiudi(i);
      function vai(i) {
        if (i < 0 || i >= N || !blob[i] || foto[i] || inApertura[i]) return;
        inApertura[i] = true; aperti++;
        apri(blob[i]).then(function (im) { aperti--; inApertura[i] = false; foto[i] = im; }, function () { aperti--; inApertura[i] = false; });
      }
      for (var d = 0; d <= APERTI && aperti < 3; d++) { vai(c + d); vai(c - d); }
    }
    function misura() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2, Math.max(1, 1600 / Math.max(tela.clientWidth, tela.clientHeight, 1)));
      var w = Math.round(tela.clientWidth * dpr), h = Math.round(tela.clientHeight * dpr);
      if (tela.width !== w || tela.height !== h) { tela.width = w; tela.height = h; ultima = null; }
    }
    function daScorrimento() {
      var r = sez.getBoundingClientRect();
      var corsa = sez.offsetHeight - innerHeight;
      return Math.max(0, Math.min(1, -r.top / Math.max(1, corsa))) * (N - 1);
    }
    function scegli(c, fermo) {
      if (griglia && !fermo && pronti + falliti < totale) return c;
      var f = foto;
      if (f[c] || f[c - 1] || f[c + 1] || f[c - 2] || f[c + 2]) return f[c] || f[c - 1] || f[c + 1] || f[c - 2] || f[c + 2];
      if (griglia) return c;
      for (var d = 0; d < N; d++) { if (f[c - d]) return f[c - d]; if (f[c + d]) return f[c + d]; }
      return null;
    }
    function disegna(sc) {
      var g = typeof sc === 'number', im = g ? griglia : sc;
      var cw = tela.width, ch = tela.height;
      var iw = g ? im.width / LATO : im.width, ih = g ? im.height / LATO : im.height;
      var s = Math.min(Math.max(cw / iw, ch / ih), cw * 0.96 / (iw * OCCUPA));
      var w = iw * s, h = ih * s, x = (cw - w) / 2, y = (ch - h) / 2 - ch * 0.08;
      ctx.fillStyle = FONDO; ctx.fillRect(0, 0, cw, ch);
      if (g) ctx.drawImage(im, (sc % LATO) * iw, Math.floor(sc / LATO) * ih, iw, ih, x, y, w, h);
      else ctx.drawImage(im, x, y, w, h);
      if (!mostrata) { mostrata = true; sez.classList.add('pronta'); }
    }
    function passo(t) {
      var dt = Math.min(0.05, (t - tAnte) / 1000 || 0.016);
      tAnte = t;
      var b = daScorrimento();
      attuale += (b - attuale) * (1 - Math.exp(-dt / 0.14));
      if (Math.abs(b - attuale) < 0.02) attuale = b;
      var c = Math.max(0, Math.min(N - 1, Math.round(attuale)));
      sez.classList.toggle('fine', c > (N - 1) * 0.76);   // il titolo entra quando il giro è finito, non sopra l'auto
      tieniAperti(c);
      var sc = scegli(c, Math.abs(b - attuale) < 0.6);
      if (sc !== null && sc !== ultima) { disegna(sc); ultima = sc; }
      if (acceso) requestAnimationFrame(passo);
    }
    misura();
    addEventListener('resize', misura);
    addEventListener('scroll', function () { scorso = true; prossimo(); }, { once: true, passive: true });
    new IntersectionObserver(function (v) {
      var dentro = v[0].isIntersecting;
      if (dentro && !acceso) { acceso = true; tAnte = 0; misura(); requestAnimationFrame(passo); }
      else if (!dentro) acceso = false;
    }, { rootMargin: '60% 0px' }).observe(sez);

    prendi(coda.shift());
    fetch('fot/gira/griglia.webp').then(function (r) { if (!r.ok) throw 0; return r.blob(); })
      .then(apri).then(function (g) { griglia = g; }, function () {})
      .then(function () { attesa = false; prossimo(); });
  }
})();
