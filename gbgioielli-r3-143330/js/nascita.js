/* Apertura della home (09/11, quinta versione): «Sotto le Logge», fino alla vetrina di Loggia Uno.
   Daniel al telefono voleva l'anello che si crea mentre si scende. Bocciati: il film 3D dell'anello su fondo nero («fa schifo») e il
   disegno a matita su fondo grigio («l'idea è carina ma si può realizzare molto meglio, devi suggerire lo scroll e deve essere più
   immersiva»). Qui si entra davvero sotto le Logge del Vasari: un plastico d'intonaco e pietra serena, volte a crociera, il sole basso
   che passa fra gli archi e li ridisegna per terra.
   - All'arrivo la camera entra da sola dalla piazza sotto l'arco d'ingresso; poi, finché non si scorre, fa qualche «passo d'invito»
     in avanti. In fondo, a destra, c'è l'unica vetrina accesa: la meta si vede dal primo fotogramma.
   - Scorrendo si cammina in due passi (la camera rallenta sotto gli archi mentre si legge), ci si gira verso la vetrina e ci si
     avvicina al vetro, fino a Loggia Uno sul suo piedistallo, sotto il faretto. Un filo ricalca l'arco della vetrina e scende
     sull'arco sotto la pietra.
   - La vetrina (Niccolò, 09/11: «meno scorrimenti per arrivare alla vetrina, la vetrina deve essere fatta meglio»): finestra ad arco
     con cornice e davanzale di pietra serena, «LOGGIA» inciso sopra, vetro con un riflesso che scorre, nicchia chiara con un arco
     di pietra in fondo, piedistallo di pietra, faretto caldo. L'anello è la foto vera ritagliata (img/serio/loggia-uno-ritaglio.webp,
     prova-anello/disegno/ritaglia-anello.py) e guarda sempre verso chi lo guarda.
   - Sotto il canvas c'è un'immagine ferma del primo fotogramma (img/serio/logge-tel|pc.webp): la scena c'è anche prima che arrivi
     three.js, che entra in dissolvenza appena disegna.
   - La pagina comanda la scena; le ombre del sole si calcolano una volta sola e si disegna solo quando serve.
   - Con «Riduci movimento», o senza WebGL, c'è solo la foto con il suo testo.
   - Il film (09/11 sera, Niccolò: «adesso servirebbe gpt più seedance»): dove c'è, la camminata è un video vero fatto con GPT e
     Seedance partendo da questo 3D (prova-anello/../video-logge/SCHEDA.md), una fila di fotogrammi che segue lo scorrimento.
     Dove non c'è ancora (FILM), resta il 3D.
   - Al telefono, dal 10/11: Daniel ha scelto l'anello che si costruisce da solo (render di Blender, fondo scuro caldo:
     D:\Servizi Niccolò\clienti\gabernardi\ecommerce\anello-3d\v6-film). È un «tema» (TEMI): lo stesso lettore di fotogrammi,
     con testi e tempi suoi e la testata scura finché dura. Al computer e con «Riduci movimento» restano le Logge, com'erano.
   negozio.js usa: Nascita.sezione() (l'HTML), Nascita.avvia(sezione), Nascita.ferma() prima di cambiare pagina, Nascita.cima(). */
(function () {
  'use strict';

  /* ---------------------------------------------------------- LUNGHEZZA E TEMPI: si regolano solo qui */
  // quanto si scorre: col dito poco meno di due schermate; al computer circa 2400 px (una ventina di scatti di rotella: con
  // 1500 la camminata scappava via in un attimo)
  var CORSA_VH = 170, CORSA_PC_VH = 260, CORSA_PC_PX = 2400;
  // la camera: due passi sotto il portico, la girata verso la vetrina (al telefono comincia prima: l'inquadratura è stretta),
  // l'arrivo al vetro
  var T_PASSI = [0, 0.36], T_GIRA = [0.28, 0.52], T_GIRA_TEL = [0.24, 0.5], T_ARRIVA = [0.38, 0.74];
  // il filo dall'arco della vetrina all'arco sotto la pietra; l'anello si sposta dove lascia spazio al testo
  var T_FILO = [0.6, 0.64, 0.74, 0.8], T_INQUADRA = [0.6, 0.76];
  // i testi: [entra, piena, comincia a uscire, uscita]
  var T_TESTI = [[-1, 0, 0.03, 0.07], [0.06, 0.1, 0.17, 0.2], [0.22, 0.26, 0.36, 0.4], [0.6, 0.64, 0.76, 0.8], [0.8, 0.86, 2, 2]];
  // l'avanzamento: dove comincia ogni capitolo (per le tacche e il numero)
  var CAPITOLI = [0, 0.06, 0.22, 0.6, 0.8];

  var FOTO = 'img/serio/apertura-profilo', LARGHEZZE = [600, 820, 984], FW = 984, FH = 1200;
  // l'anello ritagliato (744x931, preso dalla foto a partire da 121,125) e l'arco sotto la pietra in quel ritaglio (pixel)
  var RITAGLIO = 'img/serio/loggia-uno-ritaglio.webp', RW = 744, RH = 931, ARCO_R = { cx: 374, base: 206, mezza: 76, freccia: 54 };
  var TRE = 'vendor/three.module.min.js';
  // il film: i fotogrammi (000.webp…) e le chiavi [punto del racconto, fotogramma], fra le quali si va in linea retta.
  // Telefono (10/11 notte, Niccolò: «toglierei il vetro»): una sola clip di Seedance girata al contrario, dall'anello nella
  // nicchia aperta fino al portico, e rovesciata. I fotogrammi sono scelti fitti dove la camera gira e radi dove cammina; un
  // punto per fotogramma, dal tempo «corretto» del video (gli scatti di Seedance e le esitazioni della camera non si sentono).
  // Si rifanno con video-logge/prepara-film.py.
  // Telefono dal 10/11: l'anello che si costruisce (216 fotogrammi, uno ogni 0,9/215 di corsa; dopo resta l'anello finito).
  // tema = testi e colori (TEMI); spinta = di quanti fotogrammi gira la pietra nei «passi d'invito»; giu = di quanto scende
  // il quadro lungo il racconto [punto, frazione dell'altezza], per lasciare in alto il posto ai testi quando l'anello è intero.
  // cima = dove comincia la pietra nell'ultimo fotogramma (frazione dell'altezza del fotogramma): sugli schermi bassi il quadro
  // scende ancora un poco, quanto basta perché l'ultimo testo (bottone e collegamento) non le finisca sopra.
  // px = misura dei fotogrammi (11/11, Niccolò: «cerca di migliorare la qualità»: sono i render di Blender interi, 1080×1920,
  // non più rimpiccioliti a 810): dove c'è, sui telefoni a 3x la tela cresce fino a disegnarli punto per punto (vedi misura).
  // La camminata sotto le Logge resta qui sotto (logge) e nella sua cartella: per tornare indietro basta chiamarla «tel».
  var FILM = {
    tel: { cartella: 'img/anello-film/tel/', piccola: 'img/anello-film/tel-s/', n: 216, px: [1080, 1920], chiavi: [[0, 0], [0.9, 215]], tema: 'anello', spinta: 8,
      giu: [[0.4, 0], [0.6, 0.07], [0.84, 0.07], [0.9, 0.1]], cima: 0.286 },
    logge: { cartella: 'img/logge-film/tel/', n: 154, chiavi: [0,.0118,.0238,.0334,.0429,.0523,.0613,.0706,.0833,.0951,.1045,.1136,.1228,.1323,.1418,.151,.1601,.1691,.1751,.1813,.1874,.1938,.1999,.2061,.2125,.2186,.2248,.2311,.2371,.2432,.2463,.2492,.2522,.2553,.2585,.2615,.2646,.2678,.2709,.274,.2771,.2803,.2834,.2864,.2896,.2928,.2959,.299,.302,.3051,.3083,.3144,.3173,.3204,.3235,.3265,.3295,.3327,.3359,.3389,.3419,.3451,.3483,.3513,.3544,.3576,.3608,.3638,.3669,.3701,.3733,.3764,.3795,.3827,.3859,.3921,.3952,.3983,.4014,.4045,.4077,.4108,.4139,.4169,.42,.4231,.4264,.4295,.4326,.4357,.4388,.4419,.4458,.4491,.4522,.4585,.4617,.465,.4682,.4713,.4744,.4776,.4808,.4837,.4868,.49,.4931,.4961,.4992,.5024,.5056,.5085,.5116,.5147,.5179,.5208,.5239,.5271,.5303,.5362,.5393,.5425,.5457,.5488,.5519,.555,.5581,.5644,.5706,.5768,.5831,.5893,.5955,.6012,.6074,.6132,.6192,.6254,.6318,.6382,.6443,.6507,.6601,.6693,.6782,.6897,.6993,.709,.7185,.7277,.7374,.7465,.7577,.76].map(function (p, i) { return [p, i]; }) }
  };
  // il portico (metri)
  var CAMPATA = 4.2, CAMPATE = 4, MEZZA = 2.8, PILA = 0.8, ALTO = 6.4, IMPOSTA = 3.3, LUCE = 3.0, FRECCIA_VOLTA = 2.6;
  var PORTA_L = 1.8, PORTA_H = 2.5, MURO = 0.4, FASCIA = 0.17, RILIEVO = 0.05;
  // la vetrina: davanzale, larghezza, imposta dell'arco; la nicchia dietro, il piedistallo, l'anello
  var V_SOTTO = 0.75, V_L = 2.0, V_IMPOSTA = 2.55, NICCHIA = 1.7, PIEDE_H = 1.1, ANELLO_H = 0.6;
  // colori: intonaco e pietra serena, il sole del tardo pomeriggio (caldo) contro il cielo (freddo)
  var C_ARIA = '#F4F2F0', C_INTONACO = '#F2EEE8', C_PIETRA = '#8A8884', C_PAVIMENTO = '#E8E2DA', C_PORTE = '#BDB5AA', C_SOLE = '#FFDDB5', C_NICCHIA = '#F4EDE3';

  function lim(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function liscio(x) { x = lim(x); return x * x * (3 - 2 * x); }
  function morbido(x) { x = lim(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function tra(p, ab) { return liscio((p - ab[0]) / (ab[1] - ab[0])); }
  function mix(a, b, e) { return a + (b - a) * e; }
  function ridotto() { return matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function dito() { return matchMedia('(pointer: coarse)').matches; }

  /* ---------------------------------------------------------- l'HTML */
  function srcset() { return LARGHEZZE.map(function (w) { return FOTO + '-' + w + '.webp ' + w + 'w'; }).join(', '); }
  // i temi: testi, tempi e capitoli di ogni apertura. '' = sotto le Logge (il 3D e la versione ferma); 'anello' = il film
  // dell'anello che si costruisce, su fondo scuro caldo, con la sua corsa (vh). I testi dell'anello sono quelli già approvati
  // per la sua pagina; l'ultimo è uguale nei due temi.
  var FINALE = '<p class="etichetta">Solitario · Oro bianco</p><h2>Loggia Uno</h2><p>Oro bianco 9 kt e diamante di laboratorio da&nbsp;0,50&nbsp;ct.</p>' +
    '<div class="nascita-azioni"><a class="btn" href="#/p/loggia-uno">Scopri Loggia Uno</a><a class="link" href="#/c/tutti">Tutta la collezione</a></div>';
  var TEMI = {
    '': {
      voce: 'Sotto le Logge del Vasari, fino alla vetrina di Loggia Uno', invito: 'Scorri per entrare', tt: T_TESTI, capi: CAPITOLI.slice(0, 4),
      testi: ['<p class="etichetta">Gioielleria · Arezzo</p><h1>Loggia</h1><p>Entra sotto le Logge del Vasari.</p>',
        '<p class="etichetta">Le Logge del Vasari · 1573</p><h2>Una fila di archi<br>sulla Piazza Grande.</h2><p>La luce passa fra gli archi e li ridisegna per terra.</p>',
        '<p class="etichetta">Le botteghe</p><h2>Sotto ogni arco,<br>una bottega.</h2><p>Da secoli, sotto le Logge, si aprono le botteghe.</p>',
        '<p class="etichetta">La firma</p><h2>Sotto la pietra,<br>un arco.</h2><p>Da quegli archi è nata Loggia.</p>',
        FINALE]
    },
    anello: {
      voce: 'Il solitario Loggia Uno si costruisce pezzo per pezzo', invito: 'Scorri', scura: true, corsa: 250,
      tt: [[-1, 0, 0.04, 0.08], [0.09, 0.13, 0.25, 0.29], [0.3, 0.335, 0.44, 0.48], [0.49, 0.53, 0.65, 0.69], [0.7, 0.74, 0.82, 0.86], [0.87, 0.92, 2, 2]],
      capi: [0, 0.09, 0.3, 0.49, 0.7],
      testi: ['<p class="etichetta">Gioielleria · Arezzo</p><h1>Loggia</h1><p>Guarda nascere il solitario Loggia Uno.</p>',
        '<h2>Le griffe a goccia</h2><p>Quattro griffe sottili tengono la pietra: sembra sospesa.</p>',
        '<h2>L’arco</h2><p>Sotto la pietra corre un filo d’oro curvato come gli archi delle Logge del Vasari, ad Arezzo.</p>',
        '<h2>Il gambo</h2><p>Oro bianco 9 kt, sottile: il metallo si fa da parte e lascia parlare la pietra.</p>',
        '<h2>Il punto segreto</h2><p>All’interno, a ore 6, un piccolo diamante di laboratorio: lo vede solo chi porta l’anello.</p>',
        FINALE]
    }
  };
  // quale tema tocca a questo schermo: quello del film che c'è (in piedi o largo); con «Riduci movimento» sempre le Logge ferme
  function tema(largo) { var F = !ridotto() && FILM[largo ? 'pc' : 'tel']; return F && F.tema || ''; }
  function corsa(t) {
    return ridotto() ? '0px' : TEMI[t].corsa ? TEMI[t].corsa + 'vh' : dito() ? CORSA_VH + 'vh' : Math.min(CORSA_PC_PX, Math.round(innerHeight * CORSA_PC_VH / 100)) + 'px';
  }
  function classe(t, fermo) { return 'nascita' + (fermo || ridotto() ? ' ferma' : '') + (t ? ' tema-' + t : ''); }
  function alta(t) { var c = corsa(t); return 'height:calc(100vh - var(--testata) + ' + c + ');height:calc(100lvh - var(--testata) + ' + c + ')'; }
  function dentro(t) {
    var m = TEMI[t], ult = m.testi.length - 1;
    return '<div class="nascita-palco">' +
        '<a class="nascita-salta" href="#/p/loggia-uno">Salta l’introduzione: scopri Loggia Uno</a>' +
        '<canvas class="nascita-3d" aria-hidden="true"></canvas>' +
        // la foto resta solo per «Riduci movimento» e per chi non ha WebGL
        '<div class="nascita-foto"><img class="nascita-img" src="' + FOTO + '-984.webp" srcset="' + srcset() + '" sizes="(orientation:landscape) 60vh, 100vw" width="' + FW + '" height="' + FH + '"' +
          ' alt="Loggia Uno, solitario in oro bianco 9 kt con diamante di laboratorio" decoding="async"></div>' +
        '<svg class="nascita-filo" aria-hidden="true" focusable="false"><path></path></svg>' +
        '<div class="nascita-velo" aria-hidden="true"></div>' +
        // il primo e l'ultimo testo sono per tutti; quelli in mezzo accompagnano solo le immagini
        m.testi.map(function (h, i) { return '<div class="nascita-cap n' + i + '"' + (i && i < ult ? ' aria-hidden="true"' : '') + '>' + h + '</div>'; }).join('') +
        '<div class="nascita-invito" aria-hidden="true"><span>' + m.invito + '</span><i></i></div>' +
        '<div class="nascita-avanza" aria-hidden="true"><span class="nascita-num">01 / 0' + m.capi.length + '</span><b><i></i>' +
          m.capi.slice(1).map(function (c) { return '<u style="top:' + (c * 100).toFixed(1) + '%"></u>'; }).join('') + '</b></div>' +
      '</div>';
  }
  function sezione() {
    // il tema si indovina dalla finestra; avvia() lo controlla sul palco vero e, se serve, riveste la sezione
    var t = tema(innerWidth > innerHeight - 60);
    return '<section class="' + classe(t) + '" id="nascita" data-tema="' + t + '" aria-label="' + TEMI[t].voce + '" style="' + alta(t) + '">' + dentro(t) + '</section>';
  }
  function veste(sez, t, fermo) {
    sez.className = classe(t, fermo); sez.setAttribute('data-tema', t); sez.setAttribute('aria-label', TEMI[t].voce);
    sez.style.cssText = fermo ? '' : alta(t);
    sez.innerHTML = dentro(t);
  }

  /* ---------------------------------------------------------- il plastico */
  function sfumato(T, stop) {
    // una piccola texture a gradiente radiale (luci e ombre finte)
    var c = document.createElement('canvas'); c.width = c.height = 128;
    var x = c.getContext('2d'), g = x.createRadialGradient(stop[0], stop[1], 2, stop[0], stop[1], stop[2]);
    g.addColorStop(0, stop[3]); g.addColorStop(1, stop[4]);
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    return new T.CanvasTexture(c);
  }
  function scena(T, mobile) {
    var sc = new T.Scene();
    sc.background = new T.Color(C_ARIA);
    sc.fog = new T.Fog(C_ARIA, 18, 70);
    var SEG = mobile ? 48 : 64;
    // materiali Lambert (opachi, molto più leggeri dei PBR sul telefono: Niccolò il 09/11 «lagga fino a prima della meta»)
    var mIntonaco = new T.MeshLambertMaterial({ color: C_INTONACO });
    var mPietra = new T.MeshLambertMaterial({ color: C_PIETRA });
    var mPav = new T.MeshLambertMaterial({ color: C_PAVIMENTO });
    var mPorte = new T.MeshBasicMaterial({ color: C_PORTE });   // penombra uniforme: il sole che entra dalle porte la faceva arancione
    var fine = -(CAMPATE - 1) * CAMPATA, inizio = CAMPATA * 1.5, oltre = fine - CAMPATA * 0.5 - 0.6;
    function pezzo(geo, mat, x, y, z, ry, ombra) {
      var m = new T.Mesh(geo, mat);
      m.position.set(x, y, z); m.rotation.y = ry || 0;
      m.castShadow = ombra !== false; m.receiveShadow = true;
      sc.add(m);
      return m;
    }
    function estrudi(forma, prof) { return new T.ExtrudeGeometry(forma, { depth: prof, bevelEnabled: false, curveSegments: SEG }); }
    // un arco «a ferro di cavallo» di pietra (con le lesene fino a «sotto»): fasce sugli archi, sulle porte, sulla vetrina
    function fascia(ri, ro, imposta, sotto) {
      var s = new T.Shape(), y0 = sotto || 0;
      s.moveTo(-ro, y0); s.lineTo(-ro, imposta); s.absarc(0, imposta, ro, Math.PI, 0, true); s.lineTo(ro, y0);
      s.lineTo(ri, y0); s.lineTo(ri, imposta); s.absarc(0, imposta, ri, 0, Math.PI, false); s.lineTo(-ri, y0); s.lineTo(-ro, y0);
      return estrudi(s, RILIEVO);
    }
    // una sagoma lunga lungo il portico con le aperture ad arco incavate dal basso (u = -z, v = y), più un'eventuale finestra
    function fiancata(meta, imposta, campate, finestra) {
      var f = new T.Shape(), u0 = -inizio, u1 = -oltre, k, c;
      f.moveTo(u0, 0); f.lineTo(u0, ALTO); f.lineTo(u1, ALTO); f.lineTo(u1, 0);
      for (k = CAMPATE; k >= -2; k--) {
        c = k * CAMPATA;
        if (campate.indexOf(k) < 0 || c + meta > u1 || c - meta < u0) continue;
        f.lineTo(c + meta, 0); f.lineTo(c + meta, imposta); f.absarc(c, imposta, meta, 0, Math.PI, false); f.lineTo(c - meta, 0);
      }
      f.lineTo(u0, 0);
      if (finestra) {
        var b = new T.Path(), r = V_L / 2;
        b.moveTo(finestra - r, V_SOTTO); b.lineTo(finestra + r, V_SOTTO); b.lineTo(finestra + r, V_IMPOSTA);
        b.absarc(finestra, V_IMPOSTA, r, 0, Math.PI, false); b.lineTo(finestra - r, V_SOTTO);
        f.holes.push(b);
      }
      return f;
    }
    var k, z, archi = [], porte = [];
    for (k = -1; k < CAMPATE; k++) { archi.push(k); if (k < CAMPATE - 1) porte.push(k); }
    // facciata ad archi (a sinistra, verso la piazza) con le sue fasce di pietra
    pezzo(estrudi(fiancata(LUCE / 2, IMPOSTA, archi), PILA), mIntonaco, -MEZZA - PILA, 0, 0, Math.PI / 2);
    var gfA = fascia(LUCE / 2, LUCE / 2 + FASCIA, IMPOSTA);
    archi.forEach(function (k) { pezzo(gfA, mPietra, -MEZZA, 0, -k * CAMPATA, Math.PI / 2, false); });
    // muro delle botteghe (a destra): una porta ad arco per campata con la cornice di pietra; nell'ultima, la nostra vetrina
    pezzo(estrudi(fiancata(PORTA_L / 2, PORTA_H, porte, -fine), MURO), mIntonaco, MEZZA, 0, 0, Math.PI / 2);
    var gfP = fascia(PORTA_L / 2, PORTA_L / 2 + 0.14, PORTA_H);
    porte.forEach(function (k) { pezzo(gfP, mPietra, MEZZA - RILIEVO, 0, -k * CAMPATA, Math.PI / 2, false); });
    // archi trasversali (anche quello d'ingresso dalla piazza), con le fasce di pietra sulle due facce
    var tr = MEZZA - 0.22, t = new T.Shape();
    t.moveTo(-MEZZA, 0); t.lineTo(-MEZZA, ALTO); t.lineTo(MEZZA, ALTO); t.lineTo(MEZZA, 0); t.lineTo(tr, 0); t.lineTo(tr, IMPOSTA);
    t.absarc(0, IMPOSTA, tr, 0, Math.PI, false); t.lineTo(-tr, 0); t.lineTo(-MEZZA, 0);
    var gt = estrudi(t, 0.45), gfT = fascia(tr, tr + 0.18, IMPOSTA);
    for (k = -2; k < CAMPATE; k++) {
      z = -(k + 0.5) * CAMPATA;
      pezzo(gt, mIntonaco, 0, 0, z - 0.225);
      pezzo(gfT, mPietra, 0, 0, z + 0.225, 0, false);
      pezzo(gfT, mPietra, 0, 0, z - 0.225 - RILIEVO, 0, false);
    }
    // in fondo il portico è chiuso: un muro con un arco cieco di pietra (niente vuoto nella nebbia)
    pezzo(new T.BoxGeometry(MEZZA * 2 + PILA, ALTO, 0.4), mIntonaco, -PILA / 2, ALTO / 2, oltre - 0.2);
    pezzo(gfT, mPietra, 0, 0, oltre, 0, false);
    // volte a crociera: in ogni campata la più alta di due volte a botte che si incrociano
    var N = mobile ? 26 : 40, H2 = CAMPATA / 2;
    for (k = -1; k < CAMPATE; k++) {
      var zc = -k * CAMPATA, pos = [], idx = [], i, j;
      for (i = 0; i <= N; i++) for (j = 0; j <= N; j++) {
        var u = -MEZZA + 2 * MEZZA * i / N, w = -H2 + 2 * H2 * j / N;
        var a = Math.sqrt(Math.max(0, 1 - u * u / (MEZZA * MEZZA))), b = Math.sqrt(Math.max(0, 1 - w * w / (H2 * H2)));
        pos.push(u, IMPOSTA + FRECCIA_VOLTA * Math.max(a, b), zc + w);
      }
      for (i = 0; i < N; i++) for (j = 0; j < N; j++) {
        var q = i * (N + 1) + j;
        idx.push(q, q + 1, q + N + 1, q + 1, q + N + 2, q + N + 1);
      }
      var gv = new T.BufferGeometry();
      gv.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); gv.setIndex(idx); gv.computeVertexNormals();
      var volta = new T.Mesh(gv, new T.MeshLambertMaterial({ color: C_INTONACO, side: T.DoubleSide }));
      volta.receiveShadow = true; sc.add(volta);
    }
    // pavimento (anche sulla piazza al sole) e, lontano nella foschia, i palazzi della piazza (senza ombra: col sole basso la
    // stenderebbero su tutto il portico)
    var pav = new T.Mesh(new T.PlaneGeometry(140, 140), mPav);
    pav.rotation.x = -Math.PI / 2; pav.position.set(-30, 0, -10); pav.receiveShadow = true; sc.add(pav);
    [[-24, 11, -6, 6], [-27, 14, -18, 8], [-25, 9, 6, 7], [-30, 16, -32, 10], [-22, 8, 16, 6]].forEach(function (d) {
      pezzo(new T.BoxGeometry(d[3], d[1], 7), mIntonaco, d[0], d[1] / 2, d[2], 0, false);
    });
    // dentro le altre botteghe: penombra chiara, che con la foschia non fa buchi
    var buio = new T.Mesh(new T.PlaneGeometry(inizio - oltre + 8, ALTO), mPorte);
    buio.rotation.y = -Math.PI / 2; buio.position.set(MEZZA + MURO + 2.2, ALTO / 2, (inizio + oltre) / 2 - 4); sc.add(buio);

    /* ---- la vetrina */
    var xV = MEZZA + MURO, xN = xV + NICCHIA / 2, mPietraV = new T.MeshLambertMaterial({ color: '#8E8B86' });
    // cornice ad arco e davanzale di pietra serena, «LOGGIA» inciso sopra
    // (cornice, davanzale e pannello non ricevono l'ombra del sole: a pochi centimetri dal muro le ombre semplici del telefono fanno
    // i quadretti)
    [pezzo(fascia(V_L / 2, V_L / 2 + 0.16, V_IMPOSTA, V_SOTTO), mPietraV, MEZZA - RILIEVO, 0, fine, Math.PI / 2, false),
      pezzo(new T.BoxGeometry(0.34, 0.09, V_L + 0.56), mPietraV, MEZZA - 0.1, V_SOTTO - 0.045, fine, 0, false),
      pezzo(new T.BoxGeometry(0.06, V_SOTTO - 0.09, V_L + 0.32), mPietraV, MEZZA - 0.03, (V_SOTTO - 0.09) / 2, fine, 0, false)
    ].forEach(function (m) { m.receiveShadow = false; });
    // (invisibile finché il carattere non è pronto e la scritta non è disegnata)
    var insegna = new T.Mesh(new T.PlaneGeometry(1.7, 0.26), new T.MeshLambertMaterial({ transparent: true, opacity: 0, color: '#5A5651' }));
    insegna.rotation.y = -Math.PI / 2; insegna.position.set(MEZZA - 0.006, V_IMPOSTA + V_L / 2 + 0.5, fine); sc.add(insegna);
    // la nicchia: chiara e illuminata (luce dipinta: un faretto vero peserebbe su ogni pixel del portico), con un arco di pietra sul
    // fondo dietro l'anello
    var tNicchia = sfumato(T, [64, 30, 118, '#FFF8EE', '#E4D9C9']); tNicchia.colorSpace = T.SRGBColorSpace;
    var mNicchia = new T.MeshBasicMaterial({ map: tNicchia, side: T.BackSide, toneMapped: false });
    var nicchia = new T.Mesh(new T.BoxGeometry(NICCHIA, 3.9, V_L + 1.2), mNicchia);
    nicchia.position.set(xN, 1.95, fine); nicchia.receiveShadow = true; sc.add(nicchia);
    pezzo(fascia(0.62, 0.72, PIEDE_H + 0.75, 0), mPietraV, xV + NICCHIA - 0.06, 0, fine, -Math.PI / 2, false);
    // il piedistallo di pietra, con l'ombra morbida dell'anello sopra
    // (pietra chiara: quello di pietra serena era un blocco scuro che pesava più dell'anello)
    pezzo(new T.BoxGeometry(0.62, PIEDE_H, 0.62), new T.MeshLambertMaterial({ color: '#D6CFC5', emissive: '#6E665C' }), xN + 0.1, PIEDE_H / 2, fine, 0, false);
    var ombra = new T.Mesh(new T.PlaneGeometry(0.5, 0.22), new T.MeshBasicMaterial({ map: sfumato(T, [64, 64, 60, 'rgba(40,32,24,0.55)', 'rgba(40,32,24,0)']), transparent: true, depthWrite: false }));
    ombra.rotation.x = -Math.PI / 2; ombra.position.set(xN + 0.1, PIEDE_H + 0.002, fine); sc.add(ombra);
    // l'anello: la foto vera ritagliata, sempre rivolta verso chi guarda
    var mAnello = new T.MeshBasicMaterial({ transparent: true, toneMapped: false, fog: false, depthWrite: false, opacity: 0 });
    var anello = new T.Mesh(new T.PlaneGeometry(ANELLO_H * RW / RH, ANELLO_H), mAnello);
    anello.position.set(xN + 0.1, PIEDE_H + ANELLO_H / 2 - 0.01, fine); anello.renderOrder = 1; sc.add(anello);
    // il vetro: un velo appena azzurrino e un riflesso che scorre mentre ci si muove
    var vetro = new T.Mesh(new T.PlaneGeometry(V_L + 0.4, 3.4), new T.MeshBasicMaterial({ color: '#DCE6EA', transparent: true, opacity: 0.08, depthWrite: false }));
    vetro.rotation.y = -Math.PI / 2; vetro.position.set(MEZZA + 0.3, 2.2, fine); vetro.renderOrder = 2; sc.add(vetro);
    var cR = document.createElement('canvas'); cR.width = 256; cR.height = 8;
    var xR = cR.getContext('2d'), gR = xR.createLinearGradient(0, 0, 256, 0);
    [[0, 0], [0.38, 0], [0.47, 0.5], [0.5, 0.75], [0.55, 0.35], [0.62, 0], [1, 0]].forEach(function (s) { gR.addColorStop(s[0], 'rgba(255,255,255,' + s[1] + ')'); });
    xR.fillStyle = gR; xR.fillRect(0, 0, 256, 8);
    var tRiflesso = new T.CanvasTexture(cR); tRiflesso.wrapS = T.RepeatWrapping;
    var riflesso = new T.Mesh(new T.PlaneGeometry(V_L + 0.4, 3.4), new T.MeshBasicMaterial({ map: tRiflesso, transparent: true, opacity: 0.35, blending: T.AdditiveBlending, depthWrite: false }));
    riflesso.rotation.y = -Math.PI / 2; riflesso.rotation.z = 0.35; riflesso.position.set(MEZZA + 0.299, 2.2, fine); riflesso.renderOrder = 3; sc.add(riflesso);
    // la luce della vetrina, dipinta: la pozza del faretto sul piedistallo, l'alone sul fondo dietro l'anello, una lama chiara sul
    // pavimento davanti
    function bagliore(w, h, x, y, rx, ry, rz, forza) {
      var b = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map: sfumato(T, [64, 64, 62, 'rgba(255,238,212,1)', 'rgba(255,238,212,0)']), transparent: true, opacity: forza, blending: T.AdditiveBlending, depthWrite: false }));
      b.position.set(x, y, fine); b.rotation.set(rx, ry, rz); sc.add(b);
    }
    bagliore(0.7, 0.7, xN + 0.1, PIEDE_H + 0.003, -Math.PI / 2, 0, 0, 0.55);
    bagliore(1.7, 2.3, xV + NICCHIA - 0.08, PIEDE_H + 0.75, 0, -Math.PI / 2, 0, 0.35);
    var lama = new T.Mesh(new T.PlaneGeometry(2.8, 2.6), new T.MeshBasicMaterial({ map: sfumato(T, [128, 64, 120, 'rgba(255,236,206,1)', 'rgba(255,236,206,0)']), transparent: true, opacity: 0.5, blending: T.AdditiveBlending, depthWrite: false }));
    lama.rotation.x = -Math.PI / 2; lama.position.set(MEZZA - 1.4, 0.01, fine); sc.add(lama);

    // luci del portico: cielo freddo, rimbalzo caldo dal pavimento, sole basso e ambrato da sinistra che passa fra gli archi
    sc.add(new T.HemisphereLight('#E8EDF2', '#D8CDBD', 1.15));
    var sole = new T.DirectionalLight(C_SOLE, 3.3);
    sole.position.set(-20, 12.5, 9); sole.target.position.set(0, 0, -6); sc.add(sole.target);
    sole.castShadow = true;
    sole.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
    var o = sole.shadow.camera; o.left = -20; o.right = 20; o.top = 22; o.bottom = -22; o.near = 1; o.far = 70;
    sole.shadow.bias = -0.0004; sole.shadow.normalBias = 0.05;
    sc.add(sole);
    return { sc: sc, fine: fine, anello: anello, mAnello: mAnello, insegna: insegna, tRiflesso: tRiflesso, riflesso: riflesso };
  }
  // «LOGGIA» per l'insegna, con il carattere del sito (quando è pronto)
  function incidi(T, m) {
    var c = document.createElement('canvas'); c.width = 1024; c.height = 160;
    var x = c.getContext('2d');
    x.font = '400 118px "Cormorant Garamond", Georgia, serif';
    if ('letterSpacing' in x) x.letterSpacing = '42px';
    x.fillStyle = '#ffffff'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText('LOGGIA', 512 + 21, 84);
    var tx = new T.CanvasTexture(c); tx.colorSpace = T.SRGBColorSpace;
    m.insegna.material.map = tx; m.insegna.material.opacity = 1; m.insegna.material.needsUpdate = true;
  }

  /* ---------------------------------------------------------- avvio e fine */
  var S = null, radice = document.documentElement;
  function avvia(sez) {
    ferma();
    if (!sez) return;
    // il tema vero si sa solo col palco misurato (e girando il telefono cambia): se non è quello della sezione, la si riveste
    var p0 = sez.querySelector('.nascita-palco'), tm = tema(p0.clientWidth > p0.clientHeight);
    if (sez.getAttribute('data-tema') !== tm) veste(sez, tm);
    // una tela nuova a ogni avvio: la stessa non può passare dal 3D al film (girando il telefono)
    var t0 = sez.querySelector('.nascita-3d'), t1 = t0.cloneNode(false);
    t0.parentNode.replaceChild(t1, t0);
    var s = S = {
      sez: sez, palco: sez.querySelector('.nascita-palco'), tela: sez.querySelector('.nascita-3d'), filo: sez.querySelector('.nascita-filo'),
      caps: [].slice.call(sez.querySelectorAll('.nascita-cap')), invito: sez.querySelector('.nascita-invito'),
      avanza: sez.querySelector('.nascita-avanza'), num: sez.querySelector('.nascita-num'),
      rid: ridotto(), posa: /[?&]posa(&|$)/.test(location.search), p: 0, pV: -1, raf: 0, tp: 0, top: 0, corsa: 1, ascolti: [],
      pronto: false, mosso: false, off: 0, entra: null, su: null, cap: -1, tm: TEMI[tm]
    };
    if (s.rid) return;
    s.filoP = s.filo.querySelector('path');
    ascolta(window, 'scroll', function () { if (S) { if (scrollY > S.top + 4) S.mosso = true; else if (scrollY <= S.top) S.mosso = false; sveglia(); } }, { passive: true });
    // girando il telefono la corsa cambia (è in vh): si resta allo stesso punto del racconto
    ascolta(window, 'resize', function () {
      if (!S) return;
      var p0 = S.p, c0 = S.corsa, dentro = scrollY > S.top && scrollY < S.top + c0;
      misura();
      if (!S.film !== !FILM[S.largo ? 'pc' : 'tel']) { avvia(S.sez); return; }
      if (dentro && Math.abs(S.corsa - c0) > 1) { window.scrollTo(0, Math.round(S.top + p0 * S.corsa)); S.p = p0; }
      sveglia();
    });
    // tornando sulla pagina dalla cronologia (o dopo che l'iPhone ha tolto la scena) si riparte puliti
    ascolta(window, 'pageshow', function (ev) { if (ev.persisted && S && S.r && S.r.getContext().isContextLost()) avvia(S.sez); });
    misura();
    s.p = s.pV = lim((scrollY - s.top) / s.corsa);
    testi(s.p);
    intesta(s);
    s.film = FILM[s.largo ? 'pc' : 'tel'] || null;
    if (s.film) { film(s); sveglia(); return; }
    import(new URL(TRE, document.baseURI).href).then(function (T) {
      if (S !== s) return;
      try { prepara(T); } catch (e) { senza3d(); return; }
      // ?peso: misura quanto costa un fotogramma della camminata (per le prove, prova-anello/logge3d: _gbg-nascita-peso.mjs)
      if (/[?&]peso(&|$)/.test(location.search)) window.__peso = function (n) {
        var gl = s.r.getContext(), t0 = performance.now();
        for (var i = 0; i < n; i++) { disegna(0.55 * i / n, true); gl.finish(); }
        return (performance.now() - t0) / n;
      };
      var parti = function () {
        if (S !== s) return;
        s.pronto = true;
        // all'arrivo in cima la camera entra da sola dalla piazza
        if (s.p < 0.02 && !s.posa) s.entra = performance.now();
        misura(); sveglia();
      };
      // gli shader si preparano senza bloccare la pagina (dove si può)
      if (s.r.compileAsync) s.r.compileAsync(s.m.sc, s.cam).then(parti, parti); else parti();
    }, function () { if (S === s) senza3d(); });
    sveglia();
  }
  // senza WebGL resta la foto con il suo testo, come con «Riduci movimento»; chi era già sceso torna all'inizio della sezione
  function senza3d() {
    if (!S) return;
    var sez = S.sez, inizio = S.top, sceso = scrollY > inizio;
    ferma();
    // la sezione torna quella ferma delle Logge, con i suoi testi (qualunque tema avesse)
    veste(sez, '', true);
    if (sceso) window.scrollTo(0, inizio);
  }
  function ascolta(o, ev, f, op) { o.addEventListener(ev, f, op); S.ascolti.push([o, ev, f, op]); }
  function ferma() {
    if (!S) return;
    var s = S; S = null;
    cancelAnimationFrame(s.raf);
    s.ascolti.forEach(function (x) { x[0].removeEventListener(x[1], x[2], x[3]); });
    radice.classList.remove('nascita-su');
    if (s.tm.scura) buio(false);
    if (s.r) { s.r.dispose(); if (s.r.forceContextLoss) s.r.forceContextLoss(); }
    if (s.chiudi) s.chiudi();
  }
  function cima() { window.scrollTo(0, 0); }
  // la testata prende il colore dell'apertura finché ce l'ha sotto: quella chiara fino alla fine della corsa, quella scura
  // finché il palco non è uscito del tutto (una testata bianca sopra il film scuro si vedrebbe)
  function intesta(s) {
    var su = scrollY < s.top + s.corsa + (s.tm.scura ? s.H - 8 : 2);
    if (su === s.su) return;
    s.su = su; radice.classList.toggle('nascita-su', su);
    if (s.tm.scura) buio(su);
  }
  // tema scuro: anche il colore della barra del telefono (theme-color) segue la testata
  var barra = null, barraChiara = '';
  function buio(si) {
    if (!barra) { barra = document.querySelector('meta[name="theme-color"]'); barraChiara = barra ? barra.content : ''; }
    radice.classList.toggle('nascita-scura', si);
    if (barra) barra.content = si ? '#2B241F' : barraChiara;
  }

  function prepara(T) {
    var s = S, mobile = dito();
    s.T = T;
    var r = s.r = new T.WebGLRenderer({ canvas: s.tela, antialias: true, powerPreference: 'high-performance' });
    r.outputColorSpace = T.SRGBColorSpace;
    r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 1.0;
    // al telefono ombre PCF semplici (le morbide costano parecchio per pixel)
    r.shadowMap.enabled = true; r.shadowMap.type = mobile ? T.PCFShadowMap : T.PCFSoftShadowMap;
    // sole e portico non si muovono: le ombre si calcolano una volta sola (e di nuovo se l'iPhone ridà la scena)
    r.shadowMap.autoUpdate = false; r.shadowMap.needsUpdate = true;
    ascolta(s.tela, 'webglcontextlost', function () { s.perso = true; });
    ascolta(s.tela, 'webglcontextrestored', function () { s.perso = false; r.shadowMap.needsUpdate = true; s.pV = -1; sveglia(); });
    s.m = scena(T, mobile);
    s.cam = new T.PerspectiveCamera(60, 1, 0.05, 140);
    s.v = new T.Vector3();
    new T.TextureLoader().load(RITAGLIO, function (tx) {
      if (S !== s) return;
      tx.colorSpace = T.SRGBColorSpace; tx.anisotropy = r.capabilities.getMaxAnisotropy();
      s.m.mAnello.map = tx; s.m.mAnello.opacity = 1; s.m.mAnello.needsUpdate = true; s.pV = -1; sveglia();
    });
    var scrivi = function () { if (S === s) { incidi(T, s.m); s.pV = -1; sveglia(); } };
    if (document.fonts && document.fonts.load) document.fonts.load('400 118px "Cormorant Garamond"').then(scrivi, scrivi); else scrivi();
  }

  function misura() {
    var s = S;
    var testata = parseFloat(getComputedStyle(radice).getPropertyValue('--testata')) || 60;
    s.top = s.sez.getBoundingClientRect().top + scrollY - testata;
    s.corsa = Math.max(1, s.sez.offsetHeight - s.palco.offsetHeight);
    s.W = s.palco.clientWidth; s.H = s.palco.clientHeight; s.largo = s.W > s.H;
    s.filo.setAttribute('viewBox', '0 0 ' + s.W + ' ' + s.H);
    if (s.r && (s.W !== s.rW || s.H !== s.rH)) {
      s.rW = s.W; s.rH = s.H;
      // al massimo 1,5 pixel veri per pixel (al telefono 2 voleva dire quasi il doppio del lavoro, e le linee sono morbide comunque)
      s.r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      s.r.setSize(s.W, s.H, false);
      s.cam.aspect = s.W / s.H;
      s.cam.fov = s.largo ? 52 : 64;
      s.cam.updateProjectionMatrix();
    }
    if (s.x && (s.W !== s.rW || s.H !== s.rH)) {
      s.rW = s.W; s.rH = s.H;
      var d = Math.min(window.devicePixelRatio || 1, 2), px = s.film && s.film.px;
      // fotogrammi grandi: la tela sale oltre 2x finché il fotogramma ci sta punto per punto (di più non aggiunge niente)
      if (px) d = Math.min(window.devicePixelRatio || 1, 3, Math.max(d, 1 / Math.max(s.W / px[0], s.H / px[1])));
      s.tela.width = Math.round(s.W * d); s.tela.height = Math.round(s.H * d);
    }
    // dove finisce l'ultimo testo: serve al film per non farlo cadere sulla pietra (FILM.cima)
    var capi = s.palco.querySelectorAll('.nascita-cap'), uc = capi[capi.length - 1];
    s.capGiu = uc ? uc.offsetTop + uc.offsetHeight : 0;
    s.pV = -1;
  }

  /* ---------------------------------------------------------- il film */
  // 10/11, Niccolò al telefono: «lagga». Con <img> il telefono apriva ogni fotogramma nel momento di disegnarlo, dentro lo
  // scorrimento, e buttava via quelli già aperti (154 da 2 MB l'uno). Adesso i file arrivano interi (leggeri) e si aprono
  // prima, fuori dallo scorrimento: solo quelli attorno al punto dove si è (aperti pesano 4-5 MB l'uno), più uno ogni
  // F_ANCORA che resta sempre pronto per chi scorre di colpo. Quando ci si allontana si chiudono.
  var F_RETE = 6, F_APRI = 4, F_ATTORNO = 8, F_ANCORA = 24, F_LARGO = 3;
  // Safari apre un file fuori dallo scorrimento solo con img.decode(); gli altri con createImageBitmap sul file (misurato il
  // 10/11 con motion/_gbg-apri-fotogrammi.mjs: in Chrome il file blocca la pagina 10 volte meno di img.decode()).
  // ?viaimg e ?viablob forzano una strada, per le prove
  var F_IMG = /[?&]viaimg(&|$)/.test(location.search) || (!/[?&]viablob(&|$)/.test(location.search) && (navigator.vendor || '').indexOf('Apple') === 0);
  // un valore che cambia lungo il racconto: tabella [punto, valore], morbido fra un punto e l'altro
  function scala(tab, p) {
    var i = 1;
    while (i < tab.length - 1 && p > tab[i][0]) i++;
    return mix(tab[i - 1][1], tab[i][1], liscio((p - tab[i - 1][0]) / (tab[i][0] - tab[i - 1][0])));
  }
  function fotogramma(s, p) {
    var c = s.film.chiavi, i = 1;
    while (i < c.length - 1 && p > c[i][0]) i++;
    return mix(c[i - 1][1], c[i][1], lim((p - c[i - 1][0]) / (c[i][0] - c[i - 1][0])));
  }
  function film(s) {
    var F = s.film, n = F.n;
    if (!window.createImageBitmap || !window.fetch) { senza3d(); return; }
    s.x = s.tela.getContext('2d');
    s.fot = []; s.file = []; s.qui = Math.round(fotogramma(s, s.p)); s.verso = 1;
    // 11/11, Niccolò: «la prima volta che ci entri lagga tutto». La prima volta i 216 fotogrammi grandi (12 MB) arrivano
    // mentre si scorre già: il film saltava fra i pochi arrivati. Se c'è F.piccola arriva prima tutto il film in piccolo
    // (540×960, circa 2,4 MB) e poi ogni fotogramma grande prende il posto del suo piccolo, a partire da dove si è.
    // liv[k] = 1 piccolo, 2 grande: cosa c'è in s.file[k]; livA[k] = cosa c'è aperto in s.fot[k]
    var chiesto = [], inRete = 0, aprendo = 0, inApertura = [], liv = [], livA = [], chiestoP = [], piccoli = !!F.piccola;
    // l'ordine di arrivo: dove si è, poi a salti larghi (chi scorre subito trova già un fotogramma vicino al punto giusto),
    // poi sempre il più vicino a dove si è, guardando prima avanti
    var larghi = [s.qui, 0, n - 1];
    for (var passo = 32; passo >= 8; passo /= 2) for (var j = 0; j < n; j += passo) larghi.push(j);
    function ancora(k) { return k % F_ANCORA === 0 || k === n - 1; }
    function vicino(ok, raggio) {
      for (var d = 0; d <= raggio; d++) {
        var a = s.qui + d * s.verso, b = s.qui - d * s.verso;
        if (a >= 0 && a < n && ok(a)) return a;
        if (d && b >= 0 && b < n && ok(b)) return b;
      }
      return -1;
    }
    function daAprire(k) { return s.file[k] && (!s.fot[k] || livA[k] < liv[k]) && !inApertura[k]; }
    var larghiP = piccoli ? larghi.slice() : [];
    function scarica() {
      // i piccoli, che sono leggeri, arrivano in tanti insieme
      while (S === s && piccoli && inRete < 2 * F_RETE) {
        var k = -1;
        while (larghiP.length && k < 0) { k = larghiP.shift(); if (chiestoP[k]) k = -1; }
        if (k < 0) k = vicino(function (j) { return !chiestoP[j]; }, n);
        if (k < 0) { piccoli = false; break; }
        chiestoP[k] = true; inRete++;
        prendi(k, false);
      }
      while (S === s && !piccoli && inRete < F_RETE) {
        var k = -1;
        if (!F.piccola) while (larghi.length && k < 0) { k = larghi.shift(); if (chiesto[k]) k = -1; }
        if (k < 0) k = vicino(function (j) { return !chiesto[j]; }, n);
        if (k < 0) return;
        chiesto[k] = true; inRete++;
        prendi(k, true);
      }
    }
    function prendi(k, grande) {
      fetch((grande ? F.cartella : F.piccola) + ('00' + k).slice(-3) + '.webp').then(function (r) { if (!r.ok) throw 0; return r.blob(); }).then(function (f) {
        inRete--; if (S !== s) return;
        var l = grande ? 2 : 1;
        if (!(liv[k] >= l)) { s.file[k] = f; liv[k] = l; }
        apri(); scarica();
      }, function () {
        inRete--; if (S !== s) return;
        if (grande && k === 0 && !s.file[0]) senza3d(); else scarica();
      });
    }
    function apri() {
      while (S === s && aprendo < F_APRI) {
        var k = vicino(daAprire, F_ATTORNO);
        for (var j = 0; j < n && k < 0; j++) if (ancora(j) && daAprire(j)) k = j;
        if (k < 0) return;
        apriUno(k);
      }
    }
    function apriUno(k) {
      inApertura[k] = true; aprendo++;
      var l = liv[k];
      var fatto = function (bm) {
        aprendo--; inApertura[k] = false;
        if (S !== s) { bm.close(); return; }
        // se nel frattempo si è andati lontano non serve più
        if (!ancora(k) && Math.abs(k - s.qui) > F_ATTORNO + F_LARGO) bm.close();
        else {
          if (s.fot[k]) s.fot[k].close();     // il piccolo lascia il posto al grande
          s.fot[k] = bm; livA[k] = l;
          // i «passi d'invito» partono dopo un attimo (l'entrata dalla piazza è solo del 3D)
          if (!s.pronto) { s.pronto = true; s.entra = performance.now() - 1200; misura(); }
          s.pV = -1; sveglia();
        }
        apri();
      }, rotto = function () {
        aprendo--; inApertura[k] = false;
        if (S !== s) return;
        if (s.fot[k]) { livA[k] = liv[k]; apri(); return; }   // il grande non si apre: resta il piccolo
        s.file[k] = null;
        if (k === 0) senza3d(); else apri();
      };
      if (!F_IMG) { createImageBitmap(s.file[k]).then(fatto, rotto); return; }
      var im = new Image(), u = URL.createObjectURL(s.file[k]);
      im.src = u;
      im.decode().then(function () { return createImageBitmap(im); }).then(function (bm) { URL.revokeObjectURL(u); fatto(bm); }, function () { URL.revokeObjectURL(u); rotto(); });
    }
    // quando ci si sposta: si chiudono i fotogrammi rimasti lontano e si aprono quelli attorno
    s.sposta = function (q) {
      if (q === s.qui) return;
      s.verso = q > s.qui ? 1 : -1; s.qui = q;
      for (var j = 0; j < n; j++) if (s.fot[j] && !ancora(j) && Math.abs(j - q) > F_ATTORNO + F_LARGO) { s.fot[j].close(); s.fot[j] = null; }
      apri();
    };
    s.chiudi = function () { for (var j = 0; j < n; j++) if (s.fot[j]) { s.fot[j].close(); s.fot[j] = null; } };
    scarica();
  }
  function disegnaFilm(p, sempre) {
    var s = S, F = s.film;
    // in cima i «passi d'invito» spingono un poco avanti (s.off è negativo quando la camera avanza)
    var f = Math.max(0, Math.min(F.n - 1, fotogramma(s, p) - s.off * (F.spinta || 4)));
    // il quadro può scendere un poco lungo il racconto (F.giu), per lasciare in alto il posto ai testi
    var g = F.giu ? scala(F.giu, p) : 0;
    if (!sempre && Math.abs(f - s.pV) < 0.01 && s.fermo === s.fermoV && g === s.gV) return;
    // fra due fotogrammi si sfuma solo mentre si scorre, e solo a metà strada; da fermi c'è sempre un fotogramma intero
    // (10/11: fermandosi a metà si vedevano due lanterne e LOGGIA scritto due volte)
    var a = Math.floor(f), k = f - a;
    k = s.fermo ? (k < 0.5 ? 0 : 1) : lim((k - 0.3) / 0.4);
    if (k === 1) { a = Math.min(F.n - 1, a + 1); k = 0; }
    var b = Math.min(F.n - 1, a + 1);
    s.sposta(a);
    // se il fotogramma non è ancora aperto si mostra il più vicino che lo è, intero
    if (!s.fot[a]) {
      var q = a; k = 0;
      for (var d = 1; d < F.n; d++) { if (s.fot[q - d]) { a = q - d; break; } if (s.fot[q + d]) { a = q + d; break; } }
      if (!s.fot[a]) return;
    }
    s.pV = f; s.fermoV = s.fermo; s.gV = g;
    var x = s.x, W = s.tela.width, H = s.tela.height, im = s.fot[a];
    var sc = Math.max(W / im.width, H / im.height), w = im.width * sc, h = im.height * sc;
    var ox = (W - w) / 2, oy = (H - h) / 2 + Math.round(g * H);
    // schermi bassi: ancora un poco più giù (al massimo 8% dell'altezza), in proporzione a g, finché la pietra sta sotto l'ultimo testo
    if (F.cima && g > 0 && s.capGiu) {
      var gf = F.giu[F.giu.length - 1][1];
      var manca = (s.capGiu + 18) * W / s.W - ((H - h) / 2 + gf * H + F.cima * h);
      if (manca > 0) oy += Math.round(Math.min(manca, 0.08 * H) * g / gf);
    }
    // se scendendo il quadro lascia una fascia vuota in cima, la riempie la sua prima riga, stirata (il fondo è unito)
    var quadro = function (q) { if (oy > 0) x.drawImage(q, 0, 0, q.width, 2, ox, 0, w, oy + 1); x.drawImage(q, ox, oy, w, h); };
    x.globalAlpha = 1; quadro(im);
    if (k > 0 && b !== a && s.fot[b]) { x.globalAlpha = k; quadro(s.fot[b]); x.globalAlpha = 1; }
    if (!s.viva) { s.viva = true; s.sez.classList.add('viva'); }
  }

  /* ---------------------------------------------------------- ogni fotogramma */
  function sveglia() { if (S && !S.raf) S.raf = requestAnimationFrame(giro); }
  function giro(t) {
    var s = S; if (!s) return;
    s.raf = 0;
    var meta = lim((scrollY - s.top) / s.corsa);
    // la scena segue la pagina con un filo di morbidezza, uguale a 60 e a 120 fotogrammi al secondo. Al computer più lunga:
    // la rotella va a scatti e la camera deve scivolare da uno all'altro. Col dito più stretta: il telefono ha già il suo
    // scorrimento morbido e un inseguimento lungo si sente come ritardo
    var dt = Math.min(50, t - (s.tp || t - 16.7)); s.tp = t;
    s.p += (meta - s.p) * (1 - Math.pow(s.largo ? 0.9 : 0.55, dt / 16.7));
    if (Math.abs(meta - s.p) < 0.0003) s.p = meta;
    // in cima, finché non si scorre: l'entrata dalla piazza, poi tre «passi d'invito» in avanti (poi la camera si ferma)
    var vivo = false, obiettivo = 0;
    if (s.pronto && !s.mosso && s.p < 0.004 && !document.hidden && !s.posa) {
      var dal = t - (s.entra || -1e9);
      if (dal < 2400) { obiettivo = 5 * Math.pow(1 - dal / 2400, 3); vivo = true; }
      else {
        var c = (dal - 2400) / 3200;
        if (c < 3) {
          var f = (c - Math.floor(c)) * 3.2;
          obiettivo = -0.8 * (f < 0.9 ? 1 - Math.pow(1 - f / 0.9, 3) : f < 1.3 ? 1 : f < 2.5 ? 1 - liscio((f - 1.3) / 1.2) : 0);
          vivo = true;
        }
      }
      s.off = obiettivo;
    } else if (s.posa) s.off = 5;   // ?posa: il primo fotogramma dell'entrata, fermo (serve a fare l'immagine sotto il canvas)
    else s.off *= Math.pow(0.85, dt / 16.7);
    if (Math.abs(s.off) > 0.002) vivo = true; else if (!vivo) s.off = 0;
    s.fermo = s.p === meta && !vivo;
    if (s.pronto && !s.perso) (s.film ? disegnaFilm : disegna)(s.p, vivo);
    testi(s.p);
    intesta(s);
    if (s.p !== meta || vivo || !s.pronto) sveglia(); else s.tp = 0;
  }

  // la camera: due passi sotto il portico (rallenta sotto gli archi mentre si legge), poi verso la vetrina
  function passi(p) {
    var q = lim((p - T_PASSI[0]) / (T_PASSI[1] - T_PASSI[0])) * 2, i = Math.min(1, Math.floor(q)), f = q - i;
    return (i + 0.25 * f + 0.75 * liscio(f)) / 2;
  }
  function disegna(p, sempre) {
    var s = S, T = s.T, cam = s.cam, m = s.m;
    if (!sempre && Math.abs(p - s.pV) < 0.00004) return;
    s.pV = p;
    // il cammino si ferma prima dell'ultimo arco trasversale: la vetrina si vede attraverso di lui, senza pilastri davanti
    var zIn = CAMPATA * 1.2, zPassi = m.fine + 3.6;
    var TG = s.largo ? T_GIRA : T_GIRA_TEL;
    var e = morbido((p - T_ARRIVA[0]) / (T_ARRIVA[1] - T_ARRIVA[0])), g = morbido((p - TG[0]) / (TG[1] - TG[0]));
    // al vetro: l'anello sul piedistallo riempie poco meno di metà dell'altezza
    var A = m.anello.position;
    var dFin = (ANELLO_H / 2) / Math.tan(T.MathUtils.degToRad(cam.fov / 2) * (s.largo ? 0.46 : 0.42));
    var z = mix(mix(zIn, zPassi, passi(p)), m.fine, e) + s.off;
    var x = mix(-1.4, A.x - dFin, e), y = mix(1.62, A.y + 0.04, e);
    cam.position.set(x, y, z);
    // lo sguardo si interpola sugli angoli: da davanti (un filo verso le botteghe) all'anello nella vetrina
    function angoli(vx, vy, vz) { return [Math.atan2(vx - x, -(vz - z)), Math.atan2(vy - y, Math.hypot(vx - x, vz - z))]; }
    var a1 = angoli(x + 2.2, 2.1, z - 20), a2 = angoli(A.x, mix(1.9, A.y, e), A.z);
    var yaw = mix(a1[0], a2[0], g), pitch = mix(a1[1], a2[1], g);
    cam.lookAt(x + Math.sin(yaw) * Math.cos(pitch), y + Math.sin(pitch), z - Math.cos(yaw) * Math.cos(pitch));
    // alla fine l'anello va dove lascia spazio al testo: a destra al computer, in basso al telefono
    var iq = tra(p, T_INQUADRA);
    if (iq > 0) cam.setViewOffset(s.W, s.H, s.largo ? -0.16 * s.W * iq : 0, s.largo ? 0 : -0.16 * s.H * iq, s.W, s.H); else cam.clearViewOffset();
    cam.updateMatrixWorld();
    // l'anello guarda sempre verso la camera; il riflesso sul vetro scorre con lei e quasi sparisce quando si è al vetro
    m.anello.rotation.y = Math.atan2(x - A.x, z - A.z);
    m.anello.updateMatrixWorld();
    m.tRiflesso.offset.x = (z - m.fine) * 0.09 + x * 0.05;
    m.riflesso.material.opacity = 0.35 * (1 - 0.7 * e);
    s.r.render(m.sc, cam);
    if (!s.viva) { s.viva = true; s.sez.classList.add('viva'); }
    filo(p);
  }

  // il filo: ricalca l'arco della vetrina e scende sull'arco sotto la pietra (punti 3D proiettati sullo schermo)
  function filo(p) {
    var s = S, m = s.m, a = tra(p, [T_FILO[0], T_FILO[1]]), via = tra(p, [T_FILO[2], T_FILO[3]]);
    if (a <= 0 || via >= 1) { if (s.filoSu) { s.filo.style.opacity = 0; s.filoSu = false; } return; }
    var e = morbido((p - T_FILO[1]) / (T_FILO[2] - T_FILO[1] - 0.02)), pt = [], i, th, v = s.v;
    var aw = ANELLO_H * RW / RH;
    for (i = 0; i <= 16; i++) {
      th = Math.PI * i / 16;
      v.set(MEZZA - RILIEVO, V_IMPOSTA + V_L / 2 * Math.sin(th), m.fine + V_L / 2 * Math.cos(th)).project(s.cam);
      var x1 = (v.x + 1) / 2 * s.W, y1 = (1 - v.y) / 2 * s.H;
      var u = ARCO_R.cx + ARCO_R.mezza * Math.cos(th), w = ARCO_R.base - ARCO_R.freccia * Math.sin(th);
      v.set((u / RW - 0.5) * aw, (0.5 - w / RH) * ANELLO_H, 0.002);
      m.anello.localToWorld(v).project(s.cam);
      var x2 = (v.x + 1) / 2 * s.W, y2 = (1 - v.y) / 2 * s.H;
      pt.push(mix(x1, x2, e).toFixed(1) + ' ' + mix(y1, y2, e).toFixed(1));
    }
    s.filoP.setAttribute('d', 'M' + pt.join('L'));
    // si disegna dal piede destro al sinistro, poi scende; in fondo sparisce
    var L = s.filoP.getTotalLength();
    s.filoP.style.strokeDasharray = L.toFixed(1) + ' ' + (L + 2).toFixed(1);
    s.filoP.style.strokeDashoffset = (L * (1 - a)).toFixed(1);
    s.filo.style.opacity = (1 - via).toFixed(3);
    s.filoSu = true;
  }

  function testi(p) {
    var s = S;
    s.caps.forEach(function (c, i) {
      var q = s.tm.tt[i], o = q[0] < 0 ? 1 - tra(p, [q[2], q[3]]) : tra(p, [q[0], q[1]]) * (1 - tra(p, [q[2], q[3]]));
      if (Math.abs(o - (c._o == null ? -1 : c._o)) < 0.003) return;
      c._o = o;
      c.style.opacity = o.toFixed(3);
      c.style.visibility = o < 0.01 ? 'hidden' : 'visible';
      // sale un poco entrando e continua a salire uscendo («translate» non tocca il centraggio fatto con transform)
      c.style.translate = '0 ' + ((1 - o) * (p < q[1] ? 14 : -10)).toFixed(1) + 'px';
    });
    if (s.invito) s.invito.style.opacity = (1 - tra(p, [0.006, 0.05])).toFixed(3);
    if (s.avanza) {
      s.avanza.style.setProperty('--p', p.toFixed(4));
      s.avanza.style.opacity = (1 - tra(p, [0.96, 1])).toFixed(3);
      var cap = 0;
      var capi = s.tm.capi;
      for (var i = 1; i < capi.length; i++) if (p >= capi[i]) cap = i;
      if (cap !== s.cap) { s.cap = cap; s.num.textContent = '0' + (cap + 1) + ' / 0' + capi.length; }
    }
  }

  window.Nascita = { sezione: sezione, avvia: avvia, ferma: ferma, cima: cima };
})();
