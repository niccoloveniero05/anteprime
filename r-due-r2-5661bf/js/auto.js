(function () {
  'use strict';

  function el(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }

  function norma(m) {
    var W = m.larghezza, H = m.altezza;
    function ruota(w) {
      if (w.cx === undefined) return { x: w.x, y: w.y, r: w.r, gomma: w.gomma || w.r * 1.22, file: w.file, pinza: w.pinza };
      return { x: w.cx / 100 * W, y: w.cy / 100 * H, r: w.raggio_x / 100 * W, gomma: (w.raggio_gomma_x || w.raggio_x * 1.1) / 100 * W, file: w.file, pinza: w.pinza };
    }
    var ruote = (m.ruote || []).map(ruota), per = null;
    if (m.per_foto) { per = {}; Object.keys(m.per_foto).forEach(function (k) { per[k] = m.per_foto[k].map(ruota); }); }
    var base = m.base;
    if (base === undefined) base = ruote.reduce(function (b, w) { return Math.max(b, w.y + w.gomma); }, 0) || H;
    return {
      larghezza: W, altezza: H, ruote: ruote, per_foto: per, punti: m.punti, base: base,
      muso: m.muso === undefined ? W * 0.03 : m.muso, coda: m.coda === undefined ? W * 0.97 : m.coda,
    };
  }

  function Rig(cont, srcs, grezzo, cartella) {
    var meta = norma(grezzo);
    cartella = cartella || '';
    this.cont = cont;
    this.meta = meta;
    this.cw = 0; this.scala = 1;
    this.visibili = '';
    var self = this;
    this.strati = srcs.map(function (src, i) {
      var s = el('div', 'strato'), d = el('div', 'strato-in');
      var im = new Image();
      if (i) im.fetchPriority = 'low';
      im.alt = ''; im.draggable = false; im.decoding = 'async'; im.src = src; im.className = 'scatto';
      var r = el('img', 'riflesso'); r.alt = ''; if (i) r.fetchPriority = 'low'; r.src = src; r.decoding = 'async';
      d.appendChild(r); d.appendChild(im);
      var lista = (meta.per_foto && meta.per_foto['f' + i]) || meta.ruote || [];
      var ruote = lista.map(function (w) {
        var sotto = null;
        if (w.pinza) {
          sotto = el('div', 'pinza');
          sotto.style.backgroundImage = 'url("' + cartella + w.pinza + '")';
          d.appendChild(sotto);
        }
        var div = el('div', 'ruota');
        div.style.backgroundImage = 'url("' + (w.file ? cartella + w.file : src) + '")';
        d.appendChild(div);
        return { div: div, sotto: sotto, x: w.x, y: w.y, r: w.r, solo: !!w.file };
      });
      s.appendChild(d);
      cont.appendChild(s);
      return { s: s, d: d, im: im, r: r, ruote: ruote };
    });
    this.scan = el('i', 'scan');
    this.scia = el('b');
    this.scan.appendChild(this.scia);
    cont.appendChild(this.scan);
    this.etichette = [];
    this.mostra(0, 0, 0);
  }

  Rig.prototype.misura = function (cw) {
    var m = this.meta, s = cw / m.larghezza, ch = m.altezza * s;
    this.cw = cw; this.ch = ch; this.scala = s;
    this.cont.style.width = cw + 'px';
    this.cont.style.height = ch + 'px';
    var alto = ch * 1.5;
    this.strati.forEach(function (st) {
      st.s.style.height = alto + 'px';
      st.d.style.height = alto + 'px';
      st.im.style.height = ch + 'px';
      st.r.style.height = ch + 'px';
      st.r.style.transformOrigin = '50% ' + (m.base * s) + 'px';
      st.ruote.forEach(function (w) {
        var d = 2 * w.r * s;
        w.div.style.width = d + 'px';
        w.div.style.height = d + 'px';
        w.div.style.left = (w.x - w.r) * s + 'px';
        w.div.style.top = (w.y - w.r) * s + 'px';
        w.div.style.backgroundSize = w.solo ? '100% 100%' : cw + 'px ' + ch + 'px';
        w.div.style.backgroundPosition = w.solo ? '0 0' : -(w.x - w.r) * s + 'px ' + -(w.y - w.r) * s + 'px';
        if (w.sotto) {
          w.sotto.style.width = d + 'px';
          w.sotto.style.height = d + 'px';
          w.sotto.style.left = (w.x - w.r) * s + 'px';
          w.sotto.style.top = (w.y - w.r) * s + 'px';
        }
      });
    });
    this.ultimo = null;
  };

  Rig.prototype.mostra = function (da, a, p) {
    var m = this.meta, cw = this.cw, s = this.scala;
    var chiave = da + '|' + a + '|' + p + '|' + cw;
    if (chiave === this.ultimo) return;
    this.ultimo = chiave;
    var taglia = p > 0 && p < 1 && da !== a;
    var solo = p >= 1 ? a : da;
    var taglio = taglia ? ((m.muso - 30) + (m.coda - m.muso + 60) * p) * s : 0;
    this.taglio = taglio;
    this.strati.forEach(function (st, i) {
      var vedi = taglia ? (i === da || i === a) : i === solo;
      st.s.style.visibility = vedi ? 'visible' : 'hidden';
      if (!vedi) return;
      var t = 0;
      if (taglia) t = i === a ? taglio - cw : taglio;
      st.s.style.transform = 'translate3d(' + t + 'px,0,0)';
      st.d.style.transform = 'translate3d(' + (-t) + 'px,0,0)';
    });
    this.scan.style.opacity = taglia ? 1 : 0;
    this.scan.style.transform = 'translate3d(' + taglio + 'px,0,0)';
    if (taglia) this.scia.style.transform = 'scaleX(' + Math.min(1, Math.max(0, (taglio - m.muso * s) / (cw * 0.16))).toFixed(3) + ')';
  };

  Rig.prototype.gira = function (gradi) {
    var t = 'rotate(' + gradi.toFixed(2) + 'deg)';
    this.strati.forEach(function (st) {
      if (st.s.style.visibility === 'hidden') return;
      st.ruote.forEach(function (w) { w.div.style.transform = t; });
    });
  };

  Rig.prototype.etichetta = function (testo, punto) {
    var e = el('div', 'etichetta');
    var t = el('span');
    t.textContent = testo;
    e.appendChild(t);
    if (punto[0] / this.meta.larghezza > 0.62) e.classList.add('dx');
    e.dataset.x = punto[0]; e.dataset.y = punto[1];
    this.cont.appendChild(e);
    this.etichette.push(e);
    return e;
  };

  Rig.prototype.misuraEtichette = function (sopra) {
    var s = this.scala;
    this.etichette.forEach(function (e) {
      var y = +e.dataset.y * s;
      e.style.left = (+e.dataset.x * s) + 'px';
      e.style.top = -sopra + 'px';
      e.style.height = (y + sopra) + 'px';
    });
  };

  window.Rig = Rig;
})();
