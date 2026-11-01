(function () {
  'use strict';
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var sez = document.getElementById('gira'), tela = document.getElementById('tela');
  var rete = navigator.connection || {};
  var lento = !!rete.saveData || /(^|-)[23]g$/.test(rete.effectiveType || '');
  var APERTI = 12;
  var DURATA = 2.8;
  var SOGLIA = 0.72;
  var GUARDIA = 40;

  fetch('fot/gira/gira.json').then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(parti, function () {});

  function parti(cfg) {
    var N = cfg.n, LATO = cfg.lato || 11;
    var FONDO = 'rgb(' + (cfg.fondo || [11, 11, 12]).join(',') + ')';
    var OCCUPA = cfg.largo ? cfg.largo[1] - cfg.largo[0] : 0.85;
    var ctx = tela.getContext('2d', { alpha: false });
    var blob = new Array(N), foto = new Array(N), griglia = null, aperti = 0, inApertura = {};
    var coda = [], dopo = [], volo = 0, pronti = 0, falliti = 0, attesa = true, tentativi = {}, scorso = false;
    var attuale = 0, tAnte = 0, ultima = null, mostrata = false, acceso = false;
    var fase = 0, t0 = 0, bloccato = false, sicura = 0, saltoFino = 0, ditoGiu = false, yPrima = scrollY;
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
    function tieniAperti(c, avanti) {
      for (var i = 0; i < N; i++) if (foto[i] && Math.abs(i - c) > APERTI + 6) chiudi(i);
      function vai(i) {
        if (i < 0 || i >= N || !blob[i] || foto[i] || inApertura[i]) return;
        inApertura[i] = true; aperti++;
        apri(blob[i]).then(function (im) { aperti--; inApertura[i] = false; foto[i] = im; }, function () { aperti--; inApertura[i] = false; });
      }
      for (var d = 0; d <= APERTI && aperti < 3; d++) { vai(c + d); if (!avanti) vai(c - d); }
    }
    function misura() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2, Math.max(1, 1600 / Math.max(tela.clientWidth, tela.clientHeight, 1)));
      var w = Math.round(tela.clientWidth * dpr), h = Math.round(tela.clientHeight * dpr);
      if (tela.width !== w || tela.height !== h) { tela.width = w; tela.height = h; ultima = null; }
    }
    function scegli(c) {
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

    function ferma(e) { if (e.cancelable) e.preventDefault(); }
    function vaiA(y) {
      var l = window.__rdueLenis;
      if (l) l.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y);
      yPrima = y;
    }
    function blocca(top) {
      bloccato = true;
      addEventListener('wheel', ferma, { passive: false });
      addEventListener('touchmove', ferma, { passive: false });
      var l = window.__rdueLenis;
      if (l) l.scrollTo(top, { duration: 0.75, lock: true, force: true, easing: function (t) { return 1 - Math.pow(1 - t, 3); }, onComplete: function () { if (bloccato) l.stop(); } });
      sicura = setTimeout(function () { libera(); }, (DURATA + 2) * 1000);
    }
    function libera(fine) {
      if (!bloccato) return;
      bloccato = false;
      clearTimeout(sicura);
      removeEventListener('wheel', ferma);
      removeEventListener('touchmove', ferma);
      var l = window.__rdueLenis;
      if (l) l.start();
      var r = sez.getBoundingClientRect();
      if (fine && r.top <= 1) vaiA(scrollY + r.top + Math.max(0, sez.offsetHeight - innerHeight));
    }
    window.__rdueSalto = function () {
      saltoFino = performance.now() + 1800;
      if (fase === 1) { fase = 2; attuale = N - 1; }
      libera();
    };

    function passo(t) {
      var dt = Math.min(0.05, (t - tAnte) / 1000 || 0.016);
      tAnte = t;
      var r = sez.getBoundingClientRect(), H = innerHeight, y = scrollY, d = y - yPrima;
      var a = y + r.top, b = a + Math.max(0, sez.offsetHeight - H);
      var balzo = Math.abs(d) > H * 0.7, saltando = performance.now() < saltoFino;
      yPrima = y;
      if (fase === 0) {
        if (r.top < -H * 0.25) { fase = 2; attuale = N - 1; }
        else if (d > 0.5 && !balzo && !saltando && r.top < H * SOGLIA && (griglia || foto[0])) {
          fase = 1; t0 = performance.now();
          blocca(a);
        }
      }
      if (fase === 1) {
        var p = Math.min(1, (performance.now() - t0) / 1000 / DURATA);
        attuale = (1 - Math.pow(1 - p, 2.2)) * (N - 1);
        if (!window.__rdueLenis) {
          if (!ditoGiu && r.top > 0.5) scrollTo(0, y + r.top * (1 - Math.exp(-dt / 0.11)) + 0.5);
          else if (r.top <= 0 && y > b - GUARDIA) scrollTo(0, a + (b - a) * 0.4);
        } else if (r.top <= 0 && y > b - GUARDIA) scrollTo(0, a);
        if (p >= 1) { fase = 2; libera(true); }
      } else if (fase === 2) {
        if (r.top > H * 0.96) { fase = 0; attuale = 0; }
        else if (!saltando && r.top < -1 && r.bottom > H + 1) {
          if (d > 0.5) vaiA(b); else if (d < -0.5) vaiA(a);
        }
      }
      var c = Math.max(0, Math.min(N - 1, Math.round(attuale)));
      sez.classList.toggle('fine', c > (N - 1) * 0.76);
      tieniAperti(c, fase === 1);
      var sc = scegli(c);
      if (sc !== null && sc !== ultima) { disegna(sc); ultima = sc; }
      if (acceso) requestAnimationFrame(passo);
    }
    misura();
    addEventListener('resize', misura);
    addEventListener('scroll', function () { scorso = true; prossimo(); }, { once: true, passive: true });
    addEventListener('touchstart', function () { ditoGiu = true; }, { passive: true });
    addEventListener('touchend', function () { ditoGiu = false; }, { passive: true });
    addEventListener('touchcancel', function () { ditoGiu = false; }, { passive: true });
    new IntersectionObserver(function (v) {
      var dentro = v[0].isIntersecting;
      if (dentro && !acceso) { acceso = true; tAnte = 0; yPrima = scrollY; misura(); requestAnimationFrame(passo); }
      else if (!dentro) acceso = false;
    }, { rootMargin: '60% 0px' }).observe(sez);

    prendi(coda.shift());
    fetch('fot/gira/griglia.webp').then(function (r) { if (!r.ok) throw 0; return r.blob(); })
      .then(apri).then(function (g) { griglia = g; }, function () {})
      .then(function () { attesa = false; prossimo(); });
  }
})();
