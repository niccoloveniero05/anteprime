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
  var dolce = function (t) { return t * t * t * (t * (6 * t - 15) + 10); };
  var mix = function (a, b, t) { return a + (b - a) * t; };
  var GIRO = Math.PI * 2;
  var pad2 = function (n) { return ('0' + n).slice(-2); };

  var lenis = null;
  if (window.Lenis && !ridotto && !tocco) {
    var PASSO = 110, RIGA = 100 / 3, ultA = 0, ultT = -1e9;
    var conta = function (d) {
      var e = d.event;
      if (!e || e.type !== 'wheel') return;
      if (Math.abs(d.deltaX) > Math.abs(d.deltaY)) return false;
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
  window.__rdueMisura = misuraTutto;
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(misuraTutto);
  window.__rdueRegistra = function (m) { moduli.push(m); sveglia(); };

  function insegui(m, bersaglio, dt, tau) {
    m.cur += (bersaglio - m.cur) * (1 - Math.exp(-dt / tau));
    if (Math.abs(bersaglio - m.cur) < 0.0006) m.cur = bersaglio;
    return m.cur !== bersaglio;
  }

  var TAU_DITO = 0.06;
  function fermate(sez, punti) {
    if (!tocco || ridotto) return;
    $$('.fermata', sez).forEach(function (f) { f.parentNode.removeChild(f); });
    punti.forEach(function (p) {
      var f = document.createElement('i');
      f.className = 'fermata' + (p[1] ? ' sempre' : '');
      f.style.top = p[0].toFixed(1) + 'px';
      sez.appendChild(f);
    });
  }
  window.__rdueFermate = fermate;

  var testata = $('.testata'), viaggio = $('.viaggio');
  moduli.push({
    passo: function () {
      testata.classList.toggle('piena', scrollY > viaggio.offsetTop + viaggio.offsetHeight - innerHeight - 40);
      return false;
    },
  });

  var META_FERRARI = { larghezza: 1688, altezza: 460, base: 447, muso: 42, coda: 1640, ruote: [{ x: 443, y: 325, r: 107.6, gomma: 127 }, { x: 1386, y: 325, r: 108, gomma: 132 }], punti: {} };
  var PUNTI = { f0: [.56, .38], f1: [.2, .5], f2: [.5, .86], f3: [.5, .5], f4: [.54, .25], f5: [.08, .9] };
  var TESTI = ['Di serie', 'Cerchi nuovi', 'Assetto più basso', 'Verde inglese', 'Fanali e vetri scuri', 'Splitter e pinze'];
  var GIRI_STORIA = 7;
  var CAMBIO = tocco ? 0.34 : 0.06, FINE_STORIA = tocco ? 6.1 : 6.5;

  function ferrari(meta) {
    var palco = $('.palco'), autoEl = $('#ferrari'), apertura = $('.apertura'), giu = $('.giu');
    var frasi = $$('.frase'), parole = $$('.parole span'), passi = $$('.passi i'), storiaEl = $('.storia'), passiEl = $('.passi');
    var srcs = [0, 1, 2, 3, 4, 5].map(function (i) { return 'img/ferrari/f' + i + '.webp'; });
    var rig = new Rig(autoEl, srcs, meta, 'img/ferrari/');
    meta = rig.meta;
    var punti = TESTI.map(function (t, i) {
      var p = (meta.punti && meta.punti['f' + i]) || [PUNTI['f' + i][0] * meta.larghezza, PUNTI['f' + i][1] * meta.altezza];
      return rig.etichetta(t, p);
    });
    var M = {}, stato = { cur: 0 }, frase = -2, etic = -2;

    function misura() {
      var W = palco.clientWidth, H = palco.clientHeight;
      var tel = W < 820 && H >= W, basso = H < 520;
      var occupa = (meta.coda - meta.muso) / meta.larghezza, a = meta.altezza / meta.larghezza;
      var cw;
      if (tel) cw = (W - 12) / occupa;
      else if (basso) cw = Math.min(W * 0.62, (H * 0.66) / a);
      else cw = Math.min((W * 0.66) / occupa, (H * 0.6) / a);
      rig.misura(cw);
      var s = rig.scala, ch = rig.ch;
      var margine = tel ? 6 : basso ? 12 : Math.max(16, W * 0.018);
      M.xPark = W - margine - meta.coda * s;
      M.xVia = W - meta.muso * s - (tel ? W * 0.24 : W * 0.15);
      var base;
      if (tel || basso) {
        var altaF = frasi.reduce(function (h, f) { return Math.max(h, f.offsetHeight); }, 0);
        var sotto = parseFloat(getComputedStyle(storiaEl).paddingBottom) || 0;
        base = tel ? Math.min(H * 0.55, H - sotto - altaF - 40) : H - 22;
        base = Math.max(base, 150);
      } else {
        base = H * 0.5 + ch * 0.62;
      }
      M.y = base - meta.base * s;
      M.r = meta.ruote[0] ? meta.ruote[0].gomma * s : 60;
      M.tel = tel;
      palco.style.setProperty('--base', base.toFixed(1) + 'px');
      palco.style.setProperty('--cx', ((meta.muso + meta.coda) / 2 * s + M.xPark).toFixed(1) + 'px');
      palco.style.setProperty('--cy', (base - ch * (tel ? 1.02 : 1.02)).toFixed(1) + 'px');
      palco.style.setProperty('--ty', (base - ch * 0.42).toFixed(1) + 'px');
      var sx = tel ? 0 : Math.max(0, M.xPark + meta.muso * s - 30);
      palco.style.setProperty('--sx', sx.toFixed(1) + 'px');
      var rg = document.createRange();
      rg.selectNodeContents($('.apertura p'));
      var fr = rg.getBoundingClientRect(), su = palco.getBoundingClientRect().top;
      M.taglio = fr.bottom - su > base - 6 && fr.top - su < base + 8 ? Math.max(0, fr.right + 16 - sx) : 0;
      rig.misuraEtichette(tel ? 30 : 42);
      M.giriArrivo = Math.max(1, Math.round((M.xVia - M.xPark) / (GIRO * M.r)));
      M.top = viaggio.offsetTop;
      M.corsa = viaggio.offsetHeight - H;
      M.ultimoX = -1;
      fermate(viaggio, [0, 1, 2, 3, 4, 5, 6].map(function (k) {
        return [k ? M.corsa * (k - 0.02) / FINE_STORIA : 0, k === 1 || k === 6];
      }));
    }

    function disegna(x) {
      if (x === M.ultimoX) return;
      M.ultimoX = x;
      var arr = frena(lim(x / 0.92));
      var px = mix(M.xVia, M.xPark, arr);
      autoEl.style.transform = 'translate3d(' + px.toFixed(1) + 'px,' + M.y.toFixed(1) + 'px,0)';

      var k = Math.max(1, Math.min(5, Math.floor(x)));
      var p = x < 1 ? 0 : liscio(lim((x - k - CAMBIO) / 0.62));
      rig.mostra(k - 1, k, p);
      rig.scan.classList.toggle('chiara', k >= 3);

      var u = lim((x - 1) / 4.75);
      var giri = M.giriArrivo * arr + GIRI_STORIA * (1 - Math.pow(1 - u, 2));
      var gradi = -360 * giri;
      rig.gira(gradi);
      if (suolo) suolo.style.transform = 'translate3d(' + (((-gradi / 360 * GIRO * M.r) % 96) - 96).toFixed(1) + 'px,0,0)';

      var f = x < 0.5 ? -1 : x < 1 ? 0 : k;
      if (f !== frase) {
        frase = f;
        frasi.forEach(function (e, i) { e.classList.toggle('on', i === f); });
        parole.forEach(function (e, i) { e.classList.toggle('on', i === f); });
      }
      var e = -1;
      if (x >= 0.86) e = x < 1 ? 0 : (p > 0 && rig.taglio > +punti[k].dataset.x * rig.scala) || p >= 1 ? k : (x - k < CAMBIO + 0.02 ? k - 1 : -1);
      if (e !== etic) {
        etic = e;
        punti.forEach(function (n, i) { n.classList.toggle('on', i === e); });
      }
      var fatti = x < 0.86 ? -1 : Math.max(e, x < 1 ? 0 : k - 1);
      if (fatti !== M.fatti) { M.fatti = fatti; passi.forEach(function (n, i) { n.classList.toggle('on', i <= fatti); }); }

      passiEl.classList.toggle('vis', x > 0.3);
      var ap = 1 - lim((x - 0.04) / 0.3);
      apertura.style.opacity = ap.toFixed(3);
      apertura.style.visibility = ap <= 0 ? 'hidden' : 'visible';
      if (suolo) suolo.parentNode.style.setProperty('--taglio', (M.taglio * ap).toFixed(1) + 'px');
      if (giu) giu.style.opacity = Math.max(0, 1 - x * 8).toFixed(3);
    }

    var suolo = $('.suolo i');
    misura();
    __rdueRegistra({
      misura: misura,
      passo: function (dt) {
        var t = lim((scrollY - M.top) / Math.max(1, M.corsa)) * FINE_STORIA;
        var ancora = insegui(stato, t, dt, tocco ? TAU_DITO : 0.11);
        if (Math.abs(t - stato.cur) < 0.002) { stato.cur = t; ancora = false; }
        disegna(stato.cur);
        return ancora;
      },
    });
  }

  function leggiMeta(url, riserva) {
    return fetch(url).then(function (r) { if (!r.ok) throw 0; return r.json(); }).catch(function () { return riserva; });
  }

  if (ridotto) {
    $$('[data-src]').forEach(function (i) { i.loading = 'lazy'; i.src = i.dataset.src; });
    testata.classList.add('piena');
  } else {
    leggiMeta('img/ferrari/ruote.json', META_FERRARI).then(ferrari);
  }

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

  if (!ridotto) {
    var parole = [];
    $$('[data-accende]').forEach(function (t) {
      (function spezza(el) {
        [].slice.call(el.childNodes).forEach(function (c) {
          if (c.nodeType === 1) { spezza(c); return; }
          var fr = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { fr.appendChild(document.createTextNode(p)); return; }
            var s = document.createElement('span');
            s.textContent = p;
            fr.appendChild(s);
          });
          c.parentNode.replaceChild(fr, c);
        });
      })(t);
      parole.push({ el: t, voci: $$('span', t) });
    });
    moduli.push({
      passo: function () {
        var H = innerHeight;
        parole.forEach(function (f) {
          var r = f.el.getBoundingClientRect();
          if (r.bottom < -H * 0.2 || r.top > H * 1.2) return;
          var p = lim((H * 0.92 - r.top) / (H * 0.5)) * (f.voci.length + 2);
          f.voci.forEach(function (s, i) { s.style.opacity = (0.14 + 0.86 * lim(p - i)).toFixed(3); });
        });
        return false;
      },
    });
  }

  var griglia = $('#griglia'), foglio = $('#foglio'), DATI = window.LAVORAZIONI || [];
  function virgolette(t) { return t.replace(/"/g, '&quot;'); }
  DATI.forEach(function (d, i) {
    var a = document.createElement('article');
    a.className = 'lav';
    a.id = 'd-' + d.id;
    a.innerHTML =
      '<figure><img src="' + d.foto + '" alt="' + virgolette(d.alt) + '" width="960" height="720" loading="lazy">' +
      '<figcaption><b>' + d.auto + '</b><span>' + d.quando + '</span></figcaption></figure>' +
      '<h3><button type="button" data-lav="' + i + '">' + d.nome + '</button></h3>' +
      '<p class="lav-frase">' + d.frase + '</p><span class="lav-piu" aria-hidden="true">Cosa comprende</span>';
    griglia.appendChild(a);
  });
  griglia.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-lav]');
    if (!b) return;
    var d = DATI[+b.dataset.lav], foto = $('#foglio-foto');
    foto.src = d.foto;
    foto.alt = d.alt;
    $('#foglio-auto').innerHTML = '<b>' + d.auto + '</b><span>' + d.quando + '</span>';
    $('#foglio-titolo').textContent = d.nome;
    $('#foglio-descrizione').textContent = d.testo;
    $('#foglio-lavoro').innerHTML = '<b>' + d.auto + ', ' + d.quando + ':</b> ' + d.fatto.charAt(0).toLowerCase() + d.fatto.slice(1) + (d.altro ? '<br><br>' + d.altro.replace(/^([^:]+:)/, '<b>$1</b>') : '');
    $('#foglio-voci').innerHTML = d.voci.map(function (v) { return '<li>' + v + '</li>'; }).join('');
    $('#foglio-nota').textContent = d.nota || '';
    foglio.showModal();
    $('.foglio-dentro', foglio).scrollTop = 0;
    if (lenis) lenis.stop();
  });
  foglio.addEventListener('close', function () { if (lenis) lenis.start(); });
  foglio.addEventListener('click', function (e) {
    if (e.target === foglio || e.target.closest('.foglio-chiudi')) foglio.close();
  });

  var storie = $('#storie');
  (window.STORIE || []).forEach(function (s) {
    var a = document.createElement('article');
    a.className = 'lavoro';
    a.innerHTML =
      '<header><h3>' + s.nome + '</h3><span>' + s.auto + ' · ' + s.quando + '</span><p>' + s.fatto + '</p></header>' +
      '<div class="striscia" tabindex="0" role="group" aria-label="' + s.nome + ', le fasi del lavoro">' + s.fasi.map(function (f, i) {
        return '<figure><img src="' + f.foto + '" alt="' + virgolette(f.alt) + '" width="720" height="540" loading="lazy"><figcaption><b>' + (i + 1) + '</b>' + f.testo + '</figcaption></figure>';
      }).join('') + '</div>';
    storie.appendChild(a);
  });

  if (!ridotto && window.IntersectionObserver) {
    var inVista = [];
    var guarda = new IntersectionObserver(function (v) {
      v.forEach(function (e) {
        var i = inVista.indexOf(e.target);
        if (e.isIntersecting && i < 0) inVista.push(e.target);
        if (!e.isIntersecting && i >= 0) inVista.splice(i, 1);
      });
      sveglia();
    }, { rootMargin: '12% 0px' });
    $$('.lav figure').forEach(function (f) { guarda.observe(f); });
    moduli.push({
      passo: function () {
        var H = innerHeight;
        inVista.forEach(function (f) {
          var r = f.getBoundingClientRect();
          f.firstChild.style.transform = 'translate3d(0,' + ((0.5 - (r.top + r.height / 2) / H) * 4).toFixed(2) + '%,0) scale(1.06)';
        });
        return false;
      },
    });
  }

  var LAV = window.LAVORI || [];
  var schede = $('#schede'), boxAuto = $('#box-auto'), corsia = $('#corsia'), boxPassi = $('#box-passi'), strisce = $('.box-suolo i');
  LAV.forEach(function (l, i) {
    var a = document.createElement('article');
    a.className = 'scheda' + (l.auto ? '' : ' senza-auto') + (l.w > l.h ? ' larga' : '');
    a.innerHTML =
      '<div class="scheda-testo"><span class="occhiello">' + pad2(i + 1) + ' / ' + pad2(LAV.length) + ' · ' + l.tipo + '</span>' +
      '<h3><small>' + l.marca + '</small>' + l.nome + '</h3>' +
      '<p class="stato-auto"><span class="st-prima"><b>Prima</b>' + l.prima + '</span><span class="st-dopo"><b>Dopo</b>' + l.dopo + '</span></p>' +
      '<p class="fatto">' + l.fatto + '</p></div>' +
      '<figure><img src="' + l.foto + '" alt="' + l.alt.replace(/"/g, '&quot;') + '" width="' + l.w + '" height="' + l.h + '" loading="lazy" style="object-position:' + (l.fuoco || '50% 50%') + '">' +
      (l.fotoPrima ? '<div class="foto-prima"><img src="' + l.fotoPrima + '" alt="' + l.altPrima.replace(/"/g, '&quot;') + '" width="960" height="720" loading="lazy"></div><figcaption><span class="st-prima">Prima</span><span class="st-dopo">Dopo</span></figcaption>' : '') +
      '</figure>' +
      (l.auto ? '<img class="auto-ferma" data-src="img/auto/' + l.auto + '.webp" alt="' + l.marca + ' ' + l.nome + ' di profilo">' : '');
    schede.appendChild(a);
    var t = document.createElement('i');
    boxPassi.appendChild(t);
  });
  var schedeEl = $$('.scheda'), passiLav = $$('i', boxPassi);
  var figureEl = schedeEl.map(function (s) { return $('figure', s); });
  var testiEl = schedeEl.map(function (s) { return $('.scheda-testo', s); });
  var fotoPrima = schedeEl.map(function (s) { return $('.foto-prima', s); });

  var ENTRA = tocco ? 0.5 : 0.34, LINEA_DA = tocco ? 0.03 : 0.1, LINEA_A = tocco ? 0.47 : 0.56, FERMA = tocco ? 0.52 : 0.68;
  var viaggia = tocco ? function (u) { return mix(u, liscio(u), 0.55); } : dolce;
  function fila(t) {
    if (t < ENTRA) return frena(t / ENTRA) - 1;
    var f = t - ENTRA, i = Math.floor(f);
    if (i >= LAV.length - 1) return LAV.length - 1;
    var p = f - i;
    return i + (p < FERMA ? 0 : viaggia((p - FERMA) / (1 - FERMA)));
  }
  function lavoro(t, i) { return lim((t - ENTRA - i - LINEA_DA) / (LINEA_A - LINEA_DA)); }
  var PARCHEGGIATA = 0.01;
  function rullo(t) {
    if (!tocco || t < ENTRA) return 0;
    var f = Math.min(t - ENTRA, LAV.length - 0.5), i = Math.floor(f);
    return i + Math.min(1, (f - i) / 0.5);
  }

  function garage(dati) {
    corsia.style.height = (LAV.length * (tocco ? 90 : 100) + 100) + 'vh';
    if (tocco) corsia.style.height = 'calc(100svh + ' + LAV.length * 90 + 'vh)';
    var rigs = [];
    function crea(l) {
      if (!l.auto || !dati[l.auto]) return null;
      var c = document.createElement('div');
      c.className = 'auto auto-lavoro';
      c.style.display = 'none';
      boxAuto.appendChild(c);
      var cartella = M.tel ? 'img/auto-tel/' : 'img/auto/';
      var rig = new Rig(c, l.stati.map(function (n) { return cartella + n + '.webp'; }), dati[l.auto], 'img/auto/', true);
      rig.scan.classList.toggle('chiara', !!l.chiara);
      var punti = (l.punti || []).map(function (p) { return rig.etichetta(p[0], [p[1], p[2]]); });
      if (l.film) {
        rig.scan.classList.add('film');
        rig.scan.insertAdjacentHTML('beforeend', '<span class="con">Con pellicola</span><span class="senza">Senza</span>');
      }
      return { rig: rig, meta: rig.meta, el: c, punti: punti, vicina: false };
    }
    function monta() {
      $$('.scheda figure img').forEach(function (im) {
        im.loading = 'eager';
        if (im.decode) im.decode().catch(function () {});
      });
      var i = 0;
      (function prossima() {
        if (i >= LAV.length) return;
        var r = crea(LAV[i]);
        if (r) { rigs[i] = r; misuraAuto(r, i); M.ultimo = -1; sveglia(); }
        i++;
        requestAnimationFrame(prossima);
      })();
    }
    var box = $('.box'), M = {}, stato = { cur: 0 }, attuale = -2;
    var dasola = { i: -1, v: 0 }, posata = 0, ATTESA_LINEA = 550, DURATA_LINEA = 1.2;
    function partiLinea() {
      var s = fila(stato.cur), i = Math.round(s);
      if (i < 0 || Math.abs(s - i) > PARCHEGGIATA || !rigs[i] || lavoro(stato.cur, i) >= 1) return;
      if (!rigs[i].rig.pronto) { posata = setTimeout(partiLinea, 300); return; }
      dasola.v = Math.max(dasola.i === i ? dasola.v : 0, lavoro(stato.cur, i));
      dasola.i = i;
      sveglia();
    }
    if (tocco) addEventListener('scroll', function () {
      clearTimeout(posata);
      posata = setTimeout(partiLinea, ATTESA_LINEA);
    }, { passive: true });
    function misuraAuto(r, i) {
      var m = r.meta, occupa = (m.coda - m.muso) / m.larghezza, a = m.altezza / m.larghezza, W = M.W, H = M.H;
      var cw = M.tel ? (W - 12) / occupa : Math.min(W * 0.8, (H * (M.basso ? 0.36 : 0.46)) / a);
      r.rig.misura(cw);
      var s = r.rig.scala;
      r.xPark = M.tel ? W - 6 - m.coda * s : W * 0.97 - m.coda * s;
      r.muso = m.muso * s;
      r.coda = m.coda * s;
      r.y = M.base - m.base * s;
      var f = figureEl[i];
      f.style.maxHeight = '';
      var tetto = parseFloat(getComputedStyle(f).maxHeight);
      var spazio = r.y - 12 - (f.getBoundingClientRect().top - box.getBoundingClientRect().top);
      f.style.maxHeight = Math.max(0, tetto < spazio ? tetto : spazio).toFixed(1) + 'px';
      r.fotoL = f.clientWidth;
      r.rad = (m.ruote[0] ? m.ruote[0].gomma : 120) * s;
      var alto = M.tel ? 30 : 40;
      r.punti.forEach(function (e) {
        e.style.left = (+e.dataset.x * s) + 'px';
        e.style.top = (+e.dataset.y * s - alto) + 'px';
        e.style.height = alto + 'px';
      });
    }
    function misura() {
      var W = box.clientWidth, H = box.clientHeight;
      var pad = parseFloat(getComputedStyle(box).paddingBottom) || 0;
      M.tel = W < 820 && H >= W;
      M.basso = H < 520;
      M.top = corsia.offsetTop;
      M.corsa = corsia.offsetHeight - H;
      M.W = W;
      M.H = H;
      M.D = W * (M.tel ? 1.12 : 1.04);
      M.base = M.tel ? H - pad - 12 : H - pad - Math.max(26, H * 0.05);
      box.style.setProperty('--base-box', M.base.toFixed(1) + 'px');
      rigs.forEach(misuraAuto);
      M.ultimo = -1;
      var tratto = M.corsa / LAV.length, punti = [];
      LAV.forEach(function (l, i) { punti.push([(ENTRA + i) * tratto, false], [(ENTRA + i + 0.5) * tratto, true]); });
      fermate(corsia, punti);
    }
    function disegna(t) {
      if (t === M.ultimo && dasola.v === M.ultimaL) return;
      M.ultimo = t;
      M.ultimaL = dasola.v;
      var s = fila(t), strada = (s + 1) * M.D + rullo(t) * M.W * 0.3;
      var q = s < -0.5 ? -1 : Math.round(s);
      if (q !== attuale) {
        attuale = q;
        schedeEl.forEach(function (e, i) { e.classList.toggle('on', i === q); });
        passiLav.forEach(function (e, i) { e.classList.toggle('on', i <= q); });
      }
      schedeEl.forEach(function (e, i) {
        var d = s - i;
        if (Math.abs(d) > 1) return;
        testiEl[i].style.transform = 'translate3d(' + (-d * M.W * 0.1).toFixed(1) + 'px,0,0)';
        figureEl[i].style.transform = 'translate3d(' + (-d * M.W * 0.2).toFixed(1) + 'px,0,0)';
      });
      rigs.forEach(function (r, i) {
        var vicina = Math.abs(i - s) < 1.6;
        if (vicina !== r.vicina) { r.vicina = vicina; r.el.style.display = vicina ? '' : 'none'; }
        if (!vicina) return;
        var x = r.xPark + (i - s) * M.D;
        r.el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + r.y.toFixed(1) + 'px,0)';
        if (x + r.coda < -40 || x + r.muso > M.W + 40) return;
        var u = r.rig.pronto ? Math.max(lavoro(t, i), i === dasola.i ? dasola.v : 0) : 0, p = liscio(u), ferma = Math.abs(s - i) < PARCHEGGIATA;
        r.rig.mostra(0, 1, p);
        r.rig.gira(-strada / r.rad * 180 / Math.PI);
        var tg = r.rig.taglio, sc = r.rig.scala;
        r.punti.forEach(function (e) { e.classList.toggle('on', ferma && (u >= 1 || tg > +e.dataset.x * sc)); });
        schedeEl[i].classList.toggle('fatta', u >= 0.5);
        var fp = fotoPrima[i];
        if (fp) {
          var fx = Math.round(p * r.fotoL);
          fp.style.transform = 'translate3d(' + fx + 'px,0,0)';
          fp.firstChild.style.transform = 'translate3d(' + (-fx) + 'px,0,0)';
        }
      });
      strisce.style.transform = 'translate3d(' + (-(strada % 96)).toFixed(1) + 'px,0,0)';
    }
    misura();
    var vicino = new IntersectionObserver(function (v) {
      if (!v[0].isIntersecting) return;
      vicino.disconnect();
      monta();
    }, { rootMargin: '500% 0px' });
    vicino.observe(corsia);
    __rdueRegistra({
      misura: misura,
      passo: function (dt) {
        var t = lim((scrollY - M.top) / Math.max(1, M.corsa)) * LAV.length;
        var ancora = insegui(stato, t, dt, tocco ? TAU_DITO : 0.14);
        if (Math.abs(t - stato.cur) < 0.001) { stato.cur = t; ancora = false; }
        if (dasola.i >= 0) {
          if (Math.abs(fila(stato.cur) - dasola.i) >= 1) { dasola.i = -1; dasola.v = 0; }
          else if (dasola.v < 1) { dasola.v = Math.min(1, dasola.v + dt / DURATA_LINEA); ancora = true; }
        }
        disegna(stato.cur);
        return ancora;
      },
    });
  }
  if (ridotto) {
    schedeEl.forEach(function (s) { s.classList.add('on', 'fatta'); });
    $$('.scheda [data-src]').forEach(function (i) { i.src = i.dataset.src; });
  } else {
    leggiMeta('img/auto/ruote.json', {}).then(function (d) { garage(d.auto || d); });
  }

  sveglia();
})();
