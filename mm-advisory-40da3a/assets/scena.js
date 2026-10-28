/* Scena 3D della testata: linee color champagne che da sparse si ricompongono in una struttura ordinata.
   Ogni pagina ha la sua forma (data-forma sul canvas). Niente librerie: WebGL semplice, leggero anche sul telefono.
   Spostamento e grandezza vengono dal CSS (--sx, --sy, --zoom), così si regolano per telefono e computer. */
(function () {
  'use strict';
  var tela = document.querySelector('canvas.scena');
  if (!tela) return;
  var gl = null;
  try { gl = tela.getContext('webgl', { antialias: true, alpha: true, premultipliedAlpha: true, powerPreference: 'low-power' }); } catch (e) {}
  if (!gl) { tela.style.display = 'none'; return; }
  var fermo = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- numeri a caso ma sempre uguali (stessa forma a ogni visita) ---------- */
  function casuale(seme) {
    return function () {
      seme |= 0; seme = seme + 0x6D2B79F5 | 0;
      var t = Math.imul(seme ^ seme >>> 15, 1 | seme);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  /* ---------- forme: cubi (centro, lato, rotazione) ed eventuali segmenti in più ---------- */
  function celle(lista) { return lista.map(function (c) { return [c[0] + 0.5, c[1] + 0.5, c[2] + 0.5, 1, 0]; }); }
  function colonne(alt) {
    var c = [];
    alt.forEach(function (riga, z) { riga.forEach(function (h, x) { for (var y = 0; y < h; y++) c.push([x, y, z]); }); });
    return celle(c);
  }
  var FORME = {
    torre: function () {
      var c = [];
      for (var y = 0; y < 7; y++) {
        var n = y < 4 ? 3 : (y < 6 ? 2 : 1);
        for (var x = 0; x < n; x++) for (var z = 0; z < n; z++) c.push([x, y, z]);
      }
      return { cubi: celle(c) };
    },
    pilastro: function () {
      var c = [];
      for (var x = 0; x < 3; x++) for (var z = 0; z < 3; z++) c.push([x, 0, z]);
      for (var y = 1; y < 6; y++) c.push([1, y, 1]);
      return { cubi: celle(c) };
    },
    ricostruzione: function () { return { cubi: colonne([[2, 1, 3, 1], [1, 4, 2, 2], [3, 2, 5, 1], [1, 2, 1, 3]]) }; },
    ponte: function () {
      var c = [];
      for (var z = 0; z < 2; z++) {
        for (var y = 0; y < 4; y++) { c.push([0, y, z]); c.push([4, y, z]); }
        for (var x = 1; x < 4; x++) c.push([x, 3, z]);
      }
      return { cubi: celle(c) };
    },
    gradini: function () { return { cubi: colonne([[1, 2, 3, 4, 5], [1, 2, 3, 4, 5]]) }; },
    catena: function () {
      // anello di blocchi collegati: la catena di blocchi
      var cubi = [], extra = [], n = 8, R = 3.4;
      for (var i = 0; i < n; i++) {
        var a = i / n * Math.PI * 2;
        cubi.push([Math.cos(a) * R, 0.5, Math.sin(a) * R, 1, -a]);
      }
      for (var j = 0; j < n; j++) {
        var p = cubi[j], q = cubi[(j + 1) % n];
        var dx = q[0] - p[0], dz = q[2] - p[2], l = Math.sqrt(dx * dx + dz * dz);
        dx /= l; dz /= l;
        extra.push([[p[0] + dx * 0.62, 0.5, p[2] + dz * 0.62], [q[0] - dx * 0.62, 0.5, q[2] - dz * 0.62]]);
      }
      return { cubi: cubi, extra: extra };
    },
    porta: function () {
      var c = [];
      for (var z = 0; z < 2; z++) {
        for (var y = 0; y < 3; y++) { c.push([0, y, z]); c.push([2, y, z]); }
        c.push([1, 2, z]);
      }
      return { cubi: celle(c) };
    }
  };

  var nome = tela.getAttribute('data-forma') || 'torre';
  var forma = (FORME[nome] || FORME.torre)();

  /* ---------- spigoli unici ---------- */
  var spigoli = [], visti = {};
  function chiave(p) { return p.map(function (v) { return Math.round(v * 1000); }).join(','); }
  function aggiungi(a, b) {
    var ka = chiave(a), kb = chiave(b), k = ka < kb ? ka + '|' + kb : kb + '|' + ka;
    if (visti[k]) return;
    visti[k] = 1;
    spigoli.push([a, b]);
  }
  forma.cubi.forEach(function (c) {
    var h = c[3] / 2, co = Math.cos(c[4]), si = Math.sin(c[4]), v = [];
    for (var i = 0; i < 8; i++) {
      var x = (i & 1 ? h : -h), y = (i & 2 ? h : -h), z = (i & 4 ? h : -h);
      v.push([c[0] + x * co - z * si, c[1] + y, c[2] + x * si + z * co]);
    }
    for (var a = 0; a < 8; a++) for (var b = a + 1; b < 8; b++) {
      var d = a ^ b;
      if (d === 1 || d === 2 || d === 4) aggiungi(v[a], v[b]);
    }
  });
  (forma.extra || []).forEach(function (e) { aggiungi(e[0], e[1]); });

  /* ---------- misure della forma ---------- */
  var min = [1e9, 1e9, 1e9], max = [-1e9, -1e9, -1e9];
  spigoli.forEach(function (s) { s.forEach(function (p) { for (var i = 0; i < 3; i++) { min[i] = Math.min(min[i], p[i]); max[i] = Math.max(max[i], p[i]); } }); });
  var centro = [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2];
  var raggio = 0;
  spigoli.forEach(function (s) { s.forEach(function (p) {
    var dx = p[0] - centro[0], dy = p[1] - centro[1], dz = p[2] - centro[2];
    raggio = Math.max(raggio, Math.sqrt(dx * dx + dy * dy + dz * dz));
  }); });

  /* ---------- dati per la scheda video: 15 numeri per vertice ---------- */
  var rnd = casuale(nome.length * 7919 + 17), dati = [];
  function vertice(p, c, o, r, d) { dati.push(p[0], p[1], p[2], c[0], c[1], c[2], o[0], o[1], o[2], r[0], r[1], r[2], r[3], d[0], d[1]); }
  spigoli.forEach(function (s) {
    var a = s[0], b = s[1];
    var c = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
    var dir = [c[0] - centro[0] + (rnd() - 0.5) * 1.6, c[1] - centro[1] + (rnd() - 0.5) * 1.6, c[2] - centro[2] + (rnd() - 0.5) * 1.6];
    var l = Math.sqrt(dir[0] * dir[0] + dir[1] * dir[1] + dir[2] * dir[2]) || 1, dist = raggio * (0.55 + rnd() * 1.1);
    var off = [dir[0] / l * dist, dir[1] / l * dist + (rnd() - 0.3) * 1.5, dir[2] / l * dist];
    var ax = [rnd() - 0.5, rnd() - 0.5, rnd() - 0.5], al = Math.sqrt(ax[0] * ax[0] + ax[1] * ax[1] + ax[2] * ax[2]) || 1;
    var rot = [ax[0] / al, ax[1] / al, ax[2] / al, (rnd() - 0.5) * Math.PI * 1.8];
    var alt = (c[1] - min[1]) / ((max[1] - min[1]) || 1);
    var luce = rnd() < 0.12 ? 1 : 0.62 + rnd() * 0.2;
    var d = [alt * 0.35 + rnd() * 0.2, luce];
    vertice(a, c, off, rot, d);
    vertice(b, c, off, rot, d);
  });
  // pavimento a griglia che sfuma: segmenti corti, così la luce cala con la distanza
  var R = Math.ceil(raggio * 1.7), y0 = min[1], zero = [0, 0, 0], fermoRot = [0, 1, 0, 0];
  function luceTerra(x, z) { var t = Math.max(0, 1 - Math.sqrt(x * x + z * z) / R); return 0.34 * t * t; }
  for (var g = -R; g <= R; g++) {
    for (var k = -R; k < R; k++) {
      var p1 = [centro[0] + g, y0, centro[2] + k], p2 = [centro[0] + g, y0, centro[2] + k + 1];
      vertice(p1, p1, zero, fermoRot, [0, luceTerra(g, k)]);
      vertice(p2, p2, zero, fermoRot, [0, luceTerra(g, k + 1)]);
      var q1 = [centro[0] + k, y0, centro[2] + g], q2 = [centro[0] + k + 1, y0, centro[2] + g];
      vertice(q1, q1, zero, fermoRot, [0, luceTerra(k, g)]);
      vertice(q2, q2, zero, fermoRot, [0, luceTerra(k + 1, g)]);
    }
  }
  var nVertici = dati.length / 15;

  /* ---------- programma ---------- */
  var VS = [
    'attribute vec3 aP; attribute vec3 aC; attribute vec3 aO; attribute vec4 aR; attribute vec2 aD;',
    'uniform mat4 uMV; uniform mat4 uPr; uniform float uT; uniform float uTm; uniform vec2 uS; uniform float uVicino; uniform float uLontano;',
    'varying float vA;',
    'vec3 ruota(vec3 v, vec3 k, float a) { float c = cos(a), s = sin(a); return v * c + cross(k, v) * s + k * dot(k, v) * (1.0 - c); }',
    'void main() {',
    '  float k = clamp((uT - aD.x) / 0.6, 0.0, 1.0);',
    '  float e = k < 0.5 ? 4.0 * k * k * k : 1.0 - pow(-2.0 * k + 2.0, 3.0) / 2.0;',
    '  vec3 sparso = aC + aO + ruota(aP - aC, aR.xyz, aR.w);',
    '  vec3 p = mix(sparso, aP, e) + aO * 0.006 * sin(uTm * 0.6 + aD.x * 40.0);',
    '  vec4 mv = uMV * vec4(p, 1.0);',
    '  gl_Position = uPr * mv;',
    '  gl_Position.xy += uS * gl_Position.w;',
    '  float nebbia = clamp((uLontano + mv.z) / (uLontano - uVicino), 0.0, 1.0);',
    '  float onda = 0.8 + 0.2 * sin(p.y * 1.2 + p.x * 0.35 - uTm * 0.9);',
    '  vA = aD.y * mix(0.1, 1.0, e) * mix(0.28, 1.0, nebbia) * onda;',
    '}'
  ].join('\n');
  var FS = 'precision mediump float; uniform vec3 uCol; uniform float uAl; varying float vA; void main() { gl_FragColor = vec4(uCol, vA * uAl); }';

  function shader(tipo, src) { var s = gl.createShader(tipo); gl.shaderSource(s, src); gl.compileShader(s); return s; }
  var prog = gl.createProgram();
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, VS));
  gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { tela.style.display = 'none'; return; }
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dati), gl.STATIC_DRAW);
  var passo = 15 * 4;
  [['aP', 3, 0], ['aC', 3, 3], ['aO', 3, 6], ['aR', 4, 9], ['aD', 2, 13]].forEach(function (a) {
    var loc = gl.getAttribLocation(prog, a[0]);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, a[1], gl.FLOAT, false, passo, a[2] * 4);
  });
  var U = {};
  ['uMV', 'uPr', 'uT', 'uTm', 'uS', 'uVicino', 'uLontano', 'uCol', 'uAl'].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });
  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE);
  gl.clearColor(0, 0, 0, 0);

  /* ---------- matrici ---------- */
  function prospettiva(fy, asp, n, f) { var t = 1 / Math.tan(fy / 2), nf = 1 / (n - f); return new Float32Array([t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) * nf, -1, 0, 0, 2 * f * n * nf, 0]); }
  function per(a, b) {
    var o = new Float32Array(16);
    for (var c = 0; c < 4; c++) for (var r = 0; r < 4; r++) { var s = 0; for (var k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]; o[c * 4 + r] = s; }
    return o;
  }
  function trasla(x, y, z) { return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]); }
  function rotX(a) { var c = Math.cos(a), s = Math.sin(a); return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]); }
  function rotY(a) { var c = Math.cos(a), s = Math.sin(a); return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]); }

  /* ---------- misure dal CSS ---------- */
  var L = 0, H = 0, sx = 0, sy = 0, zoom = 1, alfa = 1;
  function misura() {
    var st = getComputedStyle(tela);
    sx = parseFloat(st.getPropertyValue('--sx')) || 0;
    sy = parseFloat(st.getPropertyValue('--sy')) || 0;
    zoom = parseFloat(st.getPropertyValue('--zoom')) || 1;
    alfa = parseFloat(st.getPropertyValue('--alfa')) || 1;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    L = Math.max(1, Math.round(tela.clientWidth * dpr));
    H = Math.max(1, Math.round(tela.clientHeight * dpr));
    if (tela.width !== L || tela.height !== H) { tela.width = L; tela.height = H; }
    gl.viewport(0, 0, L, H);
  }

  /* ---------- disegno ---------- */
  var FOV = 35 * Math.PI / 180, inizio = 0, mx = 0, my = 0, tx = 0, ty = 0;
  function disegna(ora) {
    var asp = L / H;
    var fx = 2 * Math.atan(Math.tan(FOV / 2) * asp), f = Math.min(FOV, fx);
    var dist = raggio / Math.sin(f / 2) * 1.04 / zoom;
    var t = fermo ? 0 : (ora - inizio) / 1000;
    var montaggio = fermo ? 2 : Math.min(1.3, t / 3.2 * 1.3);
    mx += (tx - mx) * 0.04; my += (ty - my) * 0.04;
    var sc = window.scrollY || 0;
    var giro = 0.62 + (fermo ? 0 : t * 0.045 + sc * 0.0005) + mx * 0.22;
    var incl = 0.36 + my * 0.06 + (fermo ? 0 : Math.min(sc, 900) * 0.00012);
    var mv = per(trasla(0, 0, -dist), per(rotX(incl), per(rotY(giro), trasla(-centro[0], -centro[1], -centro[2]))));
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniformMatrix4fv(U.uMV, false, mv);
    gl.uniformMatrix4fv(U.uPr, false, prospettiva(FOV, asp, 0.1, dist * 4 + 50));
    gl.uniform1f(U.uT, montaggio);
    gl.uniform1f(U.uTm, t);
    gl.uniform2f(U.uS, sx, sy);
    gl.uniform1f(U.uVicino, dist - raggio);
    gl.uniform1f(U.uLontano, dist + raggio * 1.4);
    gl.uniform3f(U.uCol, 0.84, 0.75, 0.58);
    gl.uniform1f(U.uAl, alfa);
    gl.drawArrays(gl.LINES, 0, nVertici);
  }

  var attiva = true, richiesta = 0;
  function ciclo(ora) {
    richiesta = 0;
    if (!attiva || document.hidden) return;
    disegna(ora);
    richiesta = requestAnimationFrame(ciclo);
  }
  function parti() { if (!richiesta && !fermo) richiesta = requestAnimationFrame(ciclo); }

  misura();
  if (fermo) { disegna(0); }
  else {
    inizio = performance.now();
    parti();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { attiva = e[0].isIntersecting; if (attiva) parti(); }).observe(tela);
    }
    document.addEventListener('visibilitychange', function () { if (!document.hidden) parti(); });
    if (window.matchMedia && matchMedia('(pointer: fine)').matches) {
      window.addEventListener('pointermove', function (e) {
        tx = e.clientX / window.innerWidth * 2 - 1;
        ty = e.clientY / window.innerHeight * 2 - 1;
      }, { passive: true });
    }
  }
  var attesa = 0;
  window.addEventListener('resize', function () {
    clearTimeout(attesa);
    attesa = setTimeout(function () { misura(); if (fermo) disegna(0); }, 120);
  });
  tela.classList.add('pronta');
})();
