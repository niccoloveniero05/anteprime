(function () {
  'use strict';
  var radice = document.documentElement;
  var ridotto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var tocco = matchMedia('(pointer: coarse)').matches;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
  var lim = function (v, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return Math.min(b, Math.max(a, v)); };
  var liscio = function (t) { return t * t * (3 - 2 * t); };
  var frena = function (t) { return 1 - Math.pow(1 - t, 3); };
  var mix = function (a, b, t) { return a + (b - a) * t; };
  var GIRO = Math.PI * 2;
  var pad2 = function (n) { return ('0' + n).slice(-2); };

  var lenis = null;
  if (window.Lenis && !ridotto && !tocco) {
    var PASSO = 110, RIGA = 100 / 3, ultA = 0, ultT = -1e9;
    var conta = function (d) {
      var e = d.event;
      if (!e || e.type !== 'wheel') return;
      if (Math.abs(d.deltaX) > Math.abs(d.deltaY)) return false;   // gesto di lato: lo fa il browser
      var a = Math.abs(e.deltaY) * (e.deltaMode === 1 ? RIGA : e.deltaMode === 2 ? innerHeight : 1), t = e.timeStamp;
      var uguale = Math.abs(a - ultA) < 0.01 && t - ultT < 400, q = a / RIGA;
      ultA = a; ultT = t;
      if (e.deltaMode || (a >= 50 && (uguale || Math.abs(q - Math.round(q)) < 0.003))) d.deltaY = (e.deltaY < 0 ? -1 : 1) * Math.min(a, PASSO);
    };
    lenis = new Lenis({ lerp: 0.12, virtualScroll: conta });
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
  }
  function vai(el, id) {
    var extra = id === '#top' ? 0 : -60;
    if (lenis) lenis.scrollTo(id === '#top' ? 0 : el, { offset: extra });
    else el.scrollIntoView({ behavior: ridotto ? 'auto' : 'smooth' });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    var el = id.length > 1 ? $(id) : null;
    if (!el) return;
    e.preventDefault();
    vai(el, id);
    if (id !== '#top') {
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
    }
  });

  var moduli = [], attivo = false, tPrima = 0;
  function sveglia() { if (!attivo) { attivo = true; tPrima = 0; requestAnimationFrame(giro); } }
  function giro(t) {
    var dt = tPrima ? Math.min(0.05, (t - tPrima) / 1000) : 0.016;
    tPrima = t;
    var ancora = false;
    moduli.forEach(function (m) { if (m.passo(dt)) ancora = true; });
    if (ancora) requestAnimationFrame(giro); else attivo = false;
  }
  addEventListener('scroll', sveglia, { passive: true });
  function misuraTutto() {
    moduli.forEach(function (m) { if (m.misura) m.misura(); });
    sveglia();
  }
  var ultimaL = innerWidth, ultimaA = innerHeight;
  addEventListener('resize', function () {
    if (tocco && innerWidth === ultimaL && Math.abs(innerHeight - ultimaA) < 140) return;
    ultimaL = innerWidth; ultimaA = innerHeight;
    misuraTutto();
  });
  addEventListener('load', misuraTutto);
  window.__rdueMisura = misuraTutto;   // per chi cambia l'altezza della pagina dopo il caricamento (gira.js)
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(misuraTutto);
  window.__rdueRegistra = function (m) { moduli.push(m); sveglia(); };

  function insegui(m, bersaglio, dt, tau) {
    m.cur += (bersaglio - m.cur) * (1 - Math.exp(-dt / tau));
    if (Math.abs(bersaglio - m.cur) < 0.0006) m.cur = bersaglio;
    return m.cur !== bersaglio;
  }

  var testata = $('.testata'), viaggio = $('.film');
  moduli.push({
    passo: function () {
      testata.classList.toggle('piena', scrollY > viaggio.offsetTop + viaggio.offsetHeight - innerHeight - 40);
      return false;
    },
  });

  if (ridotto) testata.classList.add('piena');

  var linee = $$('[data-linea]');
  if (!ridotto) {
    var altoL = { cur: 0 };
    moduli.push({
      passo: function () {
        var H = innerHeight;
        linee.forEach(function (l) {
          var r = l.getBoundingClientRect();
          l.style.transform = 'scaleX(' + lim((H * 0.96 - r.top) / (H * 0.5)).toFixed(3) + ')';
        });
        return false;
      },
    });
  }

  var indice = $('#indice'), elenco = $('#elenco');
  var DATI = window.LAVORAZIONI || [];
  DATI.forEach(function (d, i) {
    var n = pad2(i + 1);
    var li = document.createElement('li');
    li.innerHTML = '<a href="#d-' + d.id + '"><b>' + n + '</b>' + d.nome + '</a>';
    indice.appendChild(li);

    var a = document.createElement('article');
    a.className = 'reparto' + (i % 2 ? ' pari' : '');
    a.id = 'd-' + d.id;
    var foto = (d.foto || []).map(function (f, j) {
      return '<figure class="' + (j === 0 ? 'prima' : 'poi') + '"><img src="' + f.src + '" alt="' + f.alt.replace(/"/g, '&quot;') + '" width="' + f.w + '" height="' + f.h + '" loading="lazy"' + (f.pos ? ' style="object-position:' + f.pos + '"' : '') + '><figcaption>' + (f.dida || '') + '</figcaption></figure>';
    }).join('');
    var voci = d.voci.map(function (v) { return '<li>' + v + '</li>'; }).join('');
    a.innerHTML =
      '<header><b class="numero" aria-hidden="true">' + n + '</b><h3>' + d.nome + '</h3><p>' + d.frase + '</p></header>' +
      (foto ? '<div class="foto foto-' + d.foto.length + '">' + foto + '</div>' : '') +
      '<ul class="voci">' + voci + '</ul>' + (d.nota ? '<p class="avviso">' + d.nota + '</p>' : '');
    elenco.appendChild(a);
  });
  var voci = $$('#indice a'), reparti = $$('.reparto'), contaN = $('#conta-n'), contaNome = $('#conta-nome');
  var repartoAttuale = -1;
  function segnaReparto() {
    var c = innerHeight * 0.42, q = 0;
    reparti.forEach(function (r, i) { if (r.getBoundingClientRect().top < c) q = i; });
    if (q !== repartoAttuale) {
      repartoAttuale = q;
      voci.forEach(function (v, i) {
        v.classList.toggle('on', i === q);
        if (i === q) v.setAttribute('aria-current', 'true'); else v.removeAttribute('aria-current');
      });
      contaN.textContent = pad2(q + 1);
      contaNome.textContent = DATI[q].nome;
    }
  }
  moduli.push({ passo: function () { segnaReparto(); return false; } });

  var LAV = window.LAVORI || [];
  var schede = $('#schede'), boxAuto = $('#box-auto'), corsia = $('#corsia'), boxPassi = $('#box-passi');
  LAV.forEach(function (l, i) {
    var a = document.createElement('article');
    a.className = 'scheda' + (l.auto ? '' : ' senza-auto') + (l.w > l.h ? ' larga' : '');
    a.innerHTML =
      '<div class="scheda-testo"><span class="occhiello">' + pad2(i + 1) + ' / ' + pad2(LAV.length) + ' · ' + l.tipo + '</span>' +
      '<h3><small>' + l.marca + '</small>' + l.nome + '</h3><p>' + l.fatto + '</p></div>' +
      '<figure><img src="' + l.foto + '" alt="' + l.alt.replace(/"/g, '&quot;') + '" width="' + l.w + '" height="' + l.h + '" loading="lazy" style="object-position:' + (l.fuoco || '50% 50%') + '"></figure>' +
      (l.auto ? '<img class="auto-ferma" data-src="img/auto/' + l.auto + '.webp" alt="' + l.marca + ' ' + l.nome + ' di profilo">' : '');
    schede.appendChild(a);
    var t = document.createElement('i');
    boxPassi.appendChild(t);
  });
  var schedeEl = $$('.scheda'), passiLav = $$('i', boxPassi);
  var figureEl = schedeEl.map(function (s) { return $('figure', s); });

  function garage(dati) {
    corsia.style.height = (LAV.length * 105 + 30) + 'vh';
    var rigs = [];
    function monta() {
      rigs = LAV.map(function (l) {
        if (!l.auto || !dati[l.auto]) return null;
        var c = document.createElement('div');
        c.className = 'auto auto-lavoro';
        boxAuto.appendChild(c);
        var rig = new Rig(c, ['img/auto/' + l.auto + '.webp'], dati[l.auto], 'img/auto/');
        return { rig: rig, meta: rig.meta, el: c };
      });
      misura();
      sveglia();
    }
    var box = $('.box'), M = {}, stato = { cur: 0 }, attuale = -1;
    function misura() {
      var W = box.clientWidth, H = box.clientHeight;
      var tel = W < 820 && H >= W, basso = H < 520;
      var pad = parseFloat(getComputedStyle(box).paddingBottom) || 0;   // l'altezza della barra in basso, se c'è
      M.top = corsia.offsetTop;
      M.corsa = corsia.offsetHeight - H;
      M.W = W;
      var base = tel ? H - pad - 12 : H - pad - Math.max(26, H * 0.05);
      box.style.setProperty('--base-box', base.toFixed(1) + 'px');
      rigs.forEach(function (r, i) {
        if (!r) return;
        var m = r.meta, occupa = (m.coda - m.muso) / m.larghezza, a = m.altezza / m.larghezza;
        var cw = tel ? (W - 12) / occupa : Math.min(W * 0.8, (H * (basso ? 0.36 : 0.46)) / a);
        r.rig.misura(cw);
        var s = r.rig.scala;
        r.xPark = tel ? W - 6 - m.coda * s : W * 0.97 - m.coda * s;
        r.xVia = W + 40 - m.muso * s;
        r.xFine = -m.coda * s - 40;
        r.y = base - m.base * s;
        var f = figureEl[i];
        f.style.maxHeight = '';
        var tetto = parseFloat(getComputedStyle(f).maxHeight);
        var spazio = r.y - 12 - (f.getBoundingClientRect().top - box.getBoundingClientRect().top);
        f.style.maxHeight = Math.max(0, tetto < spazio ? tetto : spazio).toFixed(1) + 'px';
        r.rad = (m.ruote[0] ? m.ruote[0].gomma : 120) * s;
        r.giriE = Math.max(2, Math.round((r.xVia - r.xPark) / (GIRO * r.rad)));
        r.giriU = Math.max(2, Math.round((r.xPark - r.xFine) / (GIRO * r.rad)));
      });
      M.ultimo = -1;
    }
    function disegna(y) {
      if (y === M.ultimo) return;
      M.ultimo = y;
      var q = Math.min(LAV.length - 1, Math.floor(y + 0.02));
      if (q !== attuale) {
        attuale = q;
        schedeEl.forEach(function (s, i) { s.classList.toggle('on', i === q); });
        passiLav.forEach(function (s, i) { s.classList.toggle('on', i <= q); });
      }
      rigs.forEach(function (r, i) {
        if (!r) return;
        var loc = y - i;
        if (loc < -0.2 || loc > 1.2) { r.el.style.visibility = 'hidden'; return; }
        r.el.style.visibility = 'visible';
        var e = frena(lim((loc + 0.04) / 0.5));
        var u = i === LAV.length - 1 ? 0 : lim((loc - 0.8) / 0.26);
        u = u * u;
        var x = mix(mix(r.xVia, r.xPark, e), r.xFine, u);
        r.el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + r.y.toFixed(1) + 'px,0)';
        r.rig.gira(-360 * (r.giriE * e + r.giriU * u));
      });
    }
    misura();
    var vicino = new IntersectionObserver(function (v) {
      if (!v[0].isIntersecting) return;
      vicino.disconnect();
      monta();
    }, { rootMargin: '200% 0px' });
    vicino.observe(corsia);
    __rdueRegistra({
      misura: misura,
      passo: function (dt) {
        var t = lim((scrollY - M.top) / Math.max(1, M.corsa)) * (LAV.length - 0.02);
        var ancora = insegui(stato, t, dt, 0.12);
        if (Math.abs(t - stato.cur) < 0.002) { stato.cur = t; ancora = false; }
        disegna(stato.cur);
        return ancora;
      },
    });
  }
  if (ridotto) {
    schedeEl.forEach(function (s) { s.classList.add('on'); });
    $$('.scheda [data-src]').forEach(function (i) { i.src = i.dataset.src; });
  } else {
    garage({});
  }

  sveglia();
})();
