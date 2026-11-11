/* Negozio di prova GB Gioielli: pagine, scheda prodotto e carrello in una sola pagina (indirizzi con #). */
(function () {
  'use strict';

  /* ---------------------------------------------------------- la prima schermata della home
     Telefono: Loggia Uno di profilo (l’arco sotto la pietra, il punto segreto a ore 6).
     Computer: due pannelli affiancati. A sinistra lo stesso anello; a destra una foto vera delle Logge del Vasari, la luce
     del sole che entra da un arco e ne disegna la curva sul pavimento: «la luce che attraversa l’arco», alla lettera
     (Sailko, CC BY 3.0, modificata: credito nel piede). Il pannello di destra al telefono non si vede e non si scarica.
     Per la foto di campagna vera: nome e larghezze in foto.sinistra e «riempi: true» (riempie il riquadro).
     Per un video in loop basta mettere qui i file (mp4 H.264, senza audio): la foto resta come copertina finché il video
     non parte, e con «Riduci movimento» si vede sempre e solo la foto. */
  var APERTURA = {
    video: { tel: '', pc: '' },            // es. 'video/apertura-tel.mp4' (verticale) e 'video/apertura-pc.mp4' (16:9)
    // foto di campagna a tutta larghezza (06/11, fatta con ChatGPT dalle immagini della linea): se c’è, prende il posto dei pannelli qui sotto.
    // tel in 4:5, pc in 16:9; larghezze dei file .webp in img/serio
    campagna: {
      tel: { nome: 'img/serio/campagna-tel', larghezze: [800, 1120] },
      pc: { nome: 'img/serio/campagna-pc', larghezze: [1200, 1540] },
      alt: 'Una ragazza sotto le Logge del Vasari nel sole del pomeriggio, con Loggia Uno al dito'
    },
    foto: {
      sinistra: { nome: 'img/serio/apertura-profilo', larghezze: [600, 820, 984], alt: 'Anello Loggia Uno in oro bianco di profilo: l’arco sotto il diamante di laboratorio' },
      destra: { nome: 'img/serio/apertura-luce', larghezze: [700, 1050], riempi: true,
        alt: 'Le Logge del Vasari ad Arezzo: la luce del sole entra da un arco e ne disegna la curva sul pavimento di pietra' }
    },
    titolo: 'Loggia',
    riga: 'La luce che attraversa l’arco.',
    link: ['Scopri Loggia Uno', '#/p/loggia-uno'],
    // con la foto di campagna (08/11, sito ripensato per il telefono): il testo sta sopra la foto, con due bottoni per comprare subito
    bottoni: [['Anelli', '#/c/anelli'], ['Orecchini', '#/c/orecchini']]
  };

  // Collane: nascosta finché non c’è una foto vera della collana (l’unica era indossata, con un collo fatto con l’IA).
  // Per rimetterla: togli «nascosto» alla collana qui sotto, rimetti la riga qui e la voce in testata, menu e piede (index.html).
  var CATEGORIE = [
    { id: 'anelli', nome: 'Anelli' },
    { id: 'orecchini', nome: 'Orecchini' }
  ];

  var OPZIONI = {
    misura: { nome: 'Misura', valori: ['10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'], base: '14', guida: true },
    chiusura: { nome: 'Chiusura', valori: ['A vite', 'Farfallina'], base: 'A vite', larghe: true },
    barretta: { nome: 'Lunghezza', valori: ['15 mm', '25 mm'], base: '15 mm', larghe: true },
    quanti: { nome: 'Quanti', valori: ['Singolo', 'Coppia'], base: 'Singolo', larghe: true }
  };

  // i diamanti sono sempre «di laboratorio», anche nei filtri
  var PIETRE = { diamante: 'Diamanti di laboratorio', giallo: 'Diamanti gialli di laboratorio', rubino: 'Rubini' };

  // Linea Loggia (04/11). I prezzi sono d’esempio: quelli veri li dà GB Gioielli.
  // prezzi: prezzo per ogni scelta, quando la scelta lo cambia.
  var PRODOTTI = [
    { id: 'loggia-uno', breve: 'Solitario', nome: 'Loggia Uno', tipo: 'Solitario', cat: 'anelli', pietra: 'diamante', prezzo: 690, opz: 'misura',
      materiale: 'Oro bianco 9 kt · diamante di laboratorio 0,50 ct', misure: 'Brillante da 0,50 ct (su richiesta fino a 1,50 ct), gambo 1,6 mm',
      desc: 'Il diamante di laboratorio sta su un cestello a tulipano in filo sottile, stretto da quattro griffe: sembra sospeso. All’interno, a ore 6, c’è il punto segreto, un piccolo diamante di laboratorio che vede solo chi lo indossa.' },
    { id: 'loggia-sole', breve: 'Diamante giallo di laboratorio', nome: 'Loggia Sole', tipo: 'Anello con diamante giallo di laboratorio', cat: 'anelli', pietra: 'giallo', prezzo: 1290, opz: 'misura',
      materiale: 'Oro bianco 9 kt · diamante giallo di laboratorio 1,10 ct circa', misure: 'Taglio radiant 7 × 5 mm, alone di 28 brillanti da 1,3 mm',
      desc: 'Il diamante giallo di laboratorio al centro e un alone sottile di brillanti che segue gli angoli smussati. Le quattro griffe a goccia stanno sugli angoli e proteggono gli spigoli della pietra.' },
    { id: 'loggia-rubino', breve: 'Anello con rubino', nome: 'Loggia Rubino', tipo: 'Anello con rubino', cat: 'anelli', pietra: 'rubino', prezzo: 1190, opz: 'misura',
      materiale: 'Oro bianco 9 kt · rubino 1,00 ct circa · brillanti di laboratorio', misure: 'Rubino ovale 7 × 5 mm, alone di 20 brillanti da 1,3 mm',
      desc: 'Rubino ovale con quattro griffe a goccia in diagonale, così l’ovale resta slanciato. Ha la stessa montatura del Loggia Sole.' },
    { id: 'loggia-luce-orecchini', breve: 'Orecchini punto luce', nome: 'Loggia Luce', tipo: 'Orecchini punto luce · unisex', cat: 'orecchini', anche: 'uomo', pietra: 'diamante', prezzo: 490, opz: 'chiusura',
      materiale: 'Oro bianco 9 kt · diamanti di laboratorio 2 × 0,25 ct', misure: 'Cestello a tulipano, 4 griffe a goccia; su richiesta 2 × 0,50 o 2 × 1,00 ct',
      desc: 'Il castone del solitario diventa un punto luce da portare ogni giorno, per lei e per lui. Sul retro del cestello c’è il punto segreto.' },
    { id: 'loggia-tre', breve: 'Trilogy', nome: 'Loggia Tre', tipo: 'Trilogy', cat: 'anelli', pietra: 'diamante', prezzo: 890, opz: 'misura',
      materiale: 'Oro bianco 9 kt · diamanti di laboratorio 0,90 ct', misure: 'Centrale 0,50 ct, laterali 2 × 0,20 ct',
      desc: 'Tre cestelli a tulipano uniti da un arco morbido, con un profilo basso che non si impiglia. Stesso gambo del solitario e stesso punto segreto; si porta anche insieme alla Veretta.' },
    { id: 'loggia-colore', breve: 'Pendenti con rubino', nome: 'Loggia Colore', tipo: 'Orecchini pendenti con rubino', cat: 'orecchini', pietra: 'rubino', prezzo: 790, opz: null,
      materiale: 'Oro bianco 9 kt · rubini · brillanti di laboratorio', misure: 'Lunghezza totale circa 22 mm',
      desc: 'Un punto luce al lobo, un filo sottile e una goccia di rubino che oscilla. È la versione da sera della linea, da abbinare al Loggia Rubino.' },
    { id: 'loggia-colonna', breve: 'Orecchini a barretta', nome: 'Loggia Colonna', tipo: 'Orecchini a barretta', cat: 'orecchini', pietra: 'diamante', prezzo: 390, prezzi: { '15 mm': 390, '25 mm': 490 }, opz: 'barretta',
      materiale: 'Oro bianco 9 kt · diamanti di laboratorio', misure: 'Brillanti da 1,8 mm: circa 0,25 ct la coppia (15 mm), 0,40 ct (25 mm)',
      desc: 'Una barretta verticale sottile, con le estremità arrotondate. Il perno sta in alto: la barretta scende dritta sotto il lobo.' },
    { id: 'loggia-infinito', breve: 'Eternity', nome: 'Loggia Infinito', tipo: 'Eternity', cat: 'anelli', pietra: 'diamante', prezzo: 1190, opz: 'misura',
      materiale: 'Oro bianco 9 kt · diamanti di laboratorio 1,2 ct circa', misure: 'Circa 20 brillanti da 2,5 mm (misura 14)',
      desc: 'Un giro completo di brillanti di laboratorio su un binario sottile dai bordi arrotondati; di fianco una fila di archi alleggerisce l’anello. Si realizza su misura e non si può ridimensionare.' },
    { id: 'loggia-uomo', breve: 'Orecchino baguette', nome: 'Loggia Uomo', tipo: 'Orecchino con baguette', cat: 'orecchini', anche: 'uomo', pietra: 'diamante', prezzo: 450, prezzi: { 'Singolo': 450, 'Coppia': 850 }, opz: 'quanti',
      materiale: 'Oro bianco 9 kt · diamante di laboratorio 0,80 ct circa', misure: 'Baguette circa 9 × 4,5 mm, chiusura a vite',
      desc: 'Castone a cassetta sottile, linee nette con spigoli appena smussati. Di profilo si vede un solo arco aperto: la firma Loggia, discreta.' },
    { id: 'loggia-luce-collana', nascosto: true, breve: 'Collana punto luce', nome: 'Loggia Luce', tipo: 'Collana punto luce', cat: 'collane', pietra: 'diamante', prezzo: 390, opz: null,
      materiale: 'Oro bianco 9 kt · diamante di laboratorio 0,30 ct', misure: 'Catena forzatina 42 cm, con anello anche a 40 cm',
      desc: 'La catena scorre dentro un piccolo arco: nessun anellino in vista. Il castone è lo stesso degli orecchini Loggia Luce, da prendere in set.' }
  ].filter(function (p) { return !p.nascosto; });

  // foto in img/serio/ (ID-K-480/800/1200.webp, quadrate), preparate da prova-anello/sito-serio/prepara-foto-g2.py (e g3)
  // dagli originali di Daniel: la 1 è la tessera (fondo #F3F2F0, senza specchio), poi le altre viste.
  // Niente indossati fatti con l’IA. Poche foto ma tutte dello stesso pezzo e senza errori di costruzione (giro 3: tolte
  // le viste che mostravano un anello diverso o una pietra impossibile). Loggia Uno: solo il profilo, come la prima schermata.
  var FOTO = { 'loggia-uno': 1, 'loggia-tre': 1, 'loggia-infinito': 2, 'loggia-sole': 2, 'loggia-rubino': 1, 'loggia-luce-orecchini': 1,
    'loggia-colonna': 1, 'loggia-colore': 3, 'loggia-uomo': 2 };
  // tessera diversa dalla foto 1 (e prima foto della galleria): Loggia Uomo di tre quarti, perché si capisca che è un
  // orecchino (pietra e perno a vite); di fronte, da solo, sembrava una pietra sospesa
  var TESSERA = { 'loggia-uomo': 'loggia-uomo-t' };
  var ORDINE = ['loggia-uno', 'loggia-tre', 'loggia-luce-orecchini', 'loggia-infinito', 'loggia-rubino', 'loggia-sole', 'loggia-colore', 'loggia-colonna', 'loggia-uomo'];
  // foto indossate della campagna (fatte con l’IA dalle immagini dei pezzi), in fondo alla galleria della scheda
  var INDOSSATI = {
    'loggia-uno': { nome: 'img/serio/campagna-tel', larghezze: [800, 1120], alt: 'Loggia Uno al dito, sotto le Logge del Vasari' },
    'loggia-tre': { nome: 'img/serio/cat-anelli', larghezze: [480, 800], alt: 'Loggia Tre alla mano, al caffè sotto le Logge' },
    'loggia-infinito': { nome: 'img/serio/ed-archi-g', larghezze: [480, 800, 1100], alt: 'Loggia Infinito alla mano, appoggiata alla pietra delle Logge' },
    'loggia-luce-orecchini': { nome: 'img/serio/cat-orecchini', larghezze: [480, 800], alt: 'Orecchino Loggia Luce, al sole contro una colonna delle Logge' }
  };

  var vista = document.getElementById('vista');
  var radice = document.documentElement;
  var fermo = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // le foto compaiono in dissolvenza quando sono arrivate; quelle già in memoria subito
  radice.classList.add('foto-dolci');
  function fotoPronte(el) {
    el.querySelectorAll('.ph img').forEach(function (im) { if (im.complete && im.naturalWidth) im.classList.add('vista'); });
  }
  function fotoArrivata(e) {
    var t = e.target;
    if (t && t.tagName === 'IMG' && t.parentNode && t.parentNode.classList && t.parentNode.classList.contains('ph')) t.classList.add('vista');
  }
  document.addEventListener('load', fotoArrivata, true);
  document.addEventListener('error', fotoArrivata, true);

  function trova(id) { for (var i = 0; i < PRODOTTI.length; i++) if (PRODOTTI[i].id === id) return PRODOTTI[i]; return null; }
  function euro(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' €'; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function sorgenti(nome) {
    var b = 'img/serio/' + nome;
    return 'src="' + b + '-800.webp" srcset="' + b + '-480.webp 480w, ' + b + '-800.webp 800w, ' + b + '-1200.webp 1200w"';
  }
  function img(nome, alt, sizes, pigra, classe) {
    return '<img ' + (classe ? 'class="' + classe + '" ' : '') + sorgenti(nome) + ' sizes="' + sizes + '" width="1200" height="1200" alt="' + esc(alt) + '"' +
      (pigra ? ' loading="lazy"' : '') + ' decoding="async">';
  }
  function immagine(nome, alt, sizes, pigra) { return '<div class="ph">' + img(nome, alt, sizes, pigra) + '</div>'; }
  function prezzoDi(p, scelto) { return (p.prezzi && p.prezzi[scelto]) || p.prezzo; }
  function inCategoria(p, id) { return p.cat === id || p.anche === id; }
  var SIZES_GRIGLIA = '(min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw';
  // la foto della tessera (anche nel carrello) e la galleria della scheda: se la tessera è a parte, apre la galleria
  function fotoTessera(p) { return TESSERA[p.id] || p.id + '-1'; }
  function galleria(p) {
    var n = FOTO[p.id] || 1, g = TESSERA[p.id] ? [TESSERA[p.id]] : [];
    for (var k = 1; k <= n; k++) g.push(p.id + '-' + k);
    return g;
  }
  function scheda(p) {
    var g = galleria(p);
    // al passaggio del mouse (solo computer) la seconda vista, come nelle boutique online
    var seconda = g.length > 1 ? img(g[1], '', SIZES_GRIGLIA, true, 'seconda') : '';
    return '<a class="card" href="#/p/' + p.id + '"><div class="ph">' + img(g[0], p.nome + ', ' + p.tipo, SIZES_GRIGLIA, true) + seconda + '</div>' +
      '<div class="card-testo"><h3>' + esc(p.nome) + '</h3><p class="tipo">' + esc(p.breve || p.tipo) + '</p>' +
      '<p class="prezzo">' + (p.prezzi ? 'da ' : '') + euro(p.prezzo) + '</p></div></a>';
  }

  /* ---------------------------------------------------------- pagine */
  // riempi: true per una foto che non è sul fondo #F3F2F0 (per esempio la foto vera delle Logge): riempie il riquadro
  function fotoApertura(f, sizes, extra) {
    var l = f.larghezze;
    return '<img ' + (f.riempi ? 'class="pieno" ' : '') + 'src="' + f.nome + '-' + l[l.length - 1] + '.webp" srcset="' + l.map(function (w) { return f.nome + '-' + w + '.webp ' + w + 'w'; }).join(', ') +
      '" sizes="' + sizes + '" alt="' + esc(f.alt) + '"' + extra + '>';
  }
  function srcset(f) { return f.larghezze.map(function (w) { return f.nome + '-' + w + '.webp ' + w + 'w'; }).join(', '); }
  function apertura() {
    var a = APERTURA, f = a.foto;
    var video = !fermo && (a.video.tel || a.video.pc);
    if (a.campagna) {
      var c = a.campagna, t = c.tel.larghezze;
      return '<section class="apertura campagna" data-video="' + (video ? 'si' : 'no') + '"><div class="apertura-foto"><picture>' +
        '<source media="(min-width:900px)" srcset="' + srcset(c.pc) + '" sizes="100vw">' +
        '<img src="' + c.tel.nome + '-' + t[t.length - 1] + '.webp" srcset="' + srcset(c.tel) + '" sizes="100vw" alt="' + esc(c.alt) + '" fetchpriority="high">' +
        '</picture><div class="apertura-testo"><p class="etichetta">Oro bianco e diamanti di laboratorio</p><h1>' + a.titolo + '</h1><p>' + a.riga + '</p>' +
        '<div class="apertura-bottoni">' + a.bottoni.map(function (b) { return '<a class="btn chiaro" href="' + b[1] + '">' + b[0] + '</a>'; }).join('') +
        '</div></div></div></section>';
    }
    // l’anello sta «contenuto» al centro del riquadro (stesso grigio della foto): al computer è alto circa 60 svh, nitido
    // il pannello di destra (se un giorno c’è) si vede solo al computer: al telefono è nascosto e non si scarica (loading lazy)
    return '<section class="apertura' + (f.destra ? ' doppia' : '') + '" data-video="' + (video ? 'si' : 'no') + '"><div class="apertura-foto">' +
      '<div class="pannello pannello-anello">' + fotoApertura(f.sinistra, f.destra ? '(min-width:900px) 46vw, 100vw' : '(min-width:900px) 58vh, 100vw', ' fetchpriority="high"') + '</div>' +
      (f.destra ? '<div class="pannello pannello-dettaglio">' + fotoApertura(f.destra, '(min-width:900px) 46vw, 1px', ' loading="lazy"') + '</div>' : '') + '</div>' +
      '<div class="apertura-testo"><h1>' + a.titolo + '</h1><p>' + a.riga + '</p><a class="link" href="' + a.link[1] + '">' + a.link[0] + '</a></div></section>';
  }
  // il video (se c’è) si aggiunge dopo, sopra la foto, e compare solo quando parte davvero
  function avviaVideo() {
    var s = vista.querySelector('.apertura[data-video="si"]');
    if (!s) return;
    var largo = matchMedia('(min-width:900px)').matches;
    var src = largo ? (APERTURA.video.pc || APERTURA.video.tel) : (APERTURA.video.tel || APERTURA.video.pc);
    if (!src) return;
    var v = document.createElement('video');
    v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true; v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true');
    v.preload = 'auto'; v.src = src;
    v.addEventListener('playing', function () { v.classList.add('parte'); });
    s.querySelector('.apertura-foto').appendChild(v);
    var p = v.play(); if (p && p.catch) p.catch(function () { /* senza autoplay resta la foto */ });
  }

  function sorgentiLibere(f, sizes) {
    var l = f.larghezze;
    return 'src="' + f.nome + '-' + l[l.length - 1] + '.webp" srcset="' + l.map(function (w) { return f.nome + '-' + w + '.webp ' + w + 'w'; }).join(', ') +
      '" sizes="' + sizes + '" width="' + f.misure[0] + '" height="' + f.misure[1] + '" alt="' + esc(f.alt) + '" loading="lazy" decoding="async"';
  }

  // blocco editoriale: una grande foto, due righe e un link. f = { nome, larghezze, misure, alt }
  function editoriale(f, etichetta, titolo, testo, link, classi) {
    return '<section class="sezione editoriale' + (classi ? ' ' + classi : '') + '"><figure class="ed-foto"><div class="ph"><img ' +
      sorgentiLibere(f, '(min-width:900px) 50vw, 100vw') + '></div></figure>' +
      '<div class="editoriale-testo"><p class="etichetta">' + etichetta + '</p><h2>' + titolo + '</h2><p>' + testo + '</p>' +
      '<a class="link" href="' + link[1] + '">' + link[0] + '</a></div></section>';
  }

  // dittico: due foto 4:5 affiancate (anche al telefono), una parola, una riga e un link
  function dittico(a, b, etichetta, parola, riga, link) {
    var sz = '(min-width:1120px) 540px, 50vw';
    return '<section class="sezione dittico"><div class="dittico-foto"><figure class="ph"><img ' + sorgentiLibere(a, sz) + '></figure>' +
      '<a class="ph" href="' + link[1] + '" tabindex="-1" aria-hidden="true"><img ' + sorgentiLibere(b, sz) + '></a></div>' +
      '<div class="dittico-testo"><p class="etichetta">' + etichetta + '</p><h2>' + parola + '</h2><p>' + riga + '</p>' +
      '<a class="link" href="' + link[1] + '">' + link[0] + '</a></div></section>';
  }

  // le volte delle Logge e Loggia Infinito indossato: foto della campagna di giorno (06/11, fatte con ChatGPT,
  // prepara-foto-gpt.py). Le vecchie foto di Sailko (logge-volte, apertura-luce) non si usano più: niente credito nel piede.
  var VOLTE = { nome: 'img/serio/logge-volte-g', larghezze: [480, 800, 1100], misure: [1100, 1375],
    alt: 'Le volte delle Logge del Vasari ad Arezzo nel sole del pomeriggio, una ragazza che cammina in fondo' };
  var ARCHI = { nome: 'img/serio/ed-archi-g', larghezze: [480, 800, 1100], misure: [1100, 1375],
    alt: 'Loggia Infinito alla mano, appoggiata alla pietra delle Logge: sotto i diamanti di laboratorio, una fila di archi' };
  var SEGRETO = { nome: 'img/serio/ed-segreto-g3', larghezze: [480, 800], misure: [800, 640],
    alt: 'L’interno di Loggia Uno: il piccolo diamante di laboratorio incastonato nel gambo, a ore 6' };

  // le categorie in home (06/11: tolta «Uomo», Niccolò: «non è roba da uomo»), con foto diverse dalle tessere (06/11, fatte con ChatGPT): 4:5, file in img/serio
  var FOTO_CATEGORIE = {
    anelli: { nome: 'img/serio/cat-anelli', larghezze: [480, 800], misure: [800, 1000], alt: 'Loggia Tre alla mano, al caffè sotto le Logge' },
    orecchini: { nome: 'img/serio/cat-orecchini', larghezze: [480, 800], misure: [800, 1000], alt: 'Orecchino Loggia Luce, al sole contro una colonna delle Logge' }
  };
  function categorieHome() {
    return '<section class="sezione categorie-home contenitore"><div class="testa-sezione"><h2>Scegli per categoria</h2></div><div class="cat-righe">' +
      CATEGORIE.map(function (c) {
        var f = FOTO_CATEGORIE[c.id];
        return '<a class="cat-tessera" href="#/c/' + c.id + '"><div class="ph"><img ' + sorgentiLibere(f, '(min-width:900px) 31vw, 72vw') + '></div>' +
          '<span>' + c.nome + '</span></a>';
      }).join('') + '</div></section>';
  }

  /* ---------------------------------------------------------- i due racconti (07/11)
     Le scene 16:9 fatte con ChatGPT per i video (prepara-foto-racconti.py: img/serio/storia-a1…b6), messe nel sito come
     foto al posto dei video (Niccolò: «rifai il sito senza i video, con le immagini che abbiamo fatto»). In home un banner
     per racconto, che porta alla sua pagina con tutti i passi (#/storia, #/diamanti).
     banner.video: loop muto 16:9 in video/ (vuoto = la foto); parte solo quando si vede, con «Riduci movimento» resta la foto.
     pos: dove tagliare la foto al telefono (lì i passi sono 4:3; al computer si vedono interi, 16:9). */
  var RACCONTI = {
    storia: {
      etichetta: 'Dalle Logge del Vasari', titolo: 'Come nasce Loggia',
      intro: 'Da un arco del Cinquecento a un anello da portare ogni giorno.',
      banner: { foto: 'storia-a3', video: '', testo: 'Un arco, un foglio, una lima e le pietre una alla volta.', link: 'Scopri la storia' },
      passi: [
        { f: 'storia-a1', titolo: 'Le Logge', pos: '45% 50%',
          testo: 'Ad Arezzo, sotto le Logge progettate da Giorgio Vasari nel Cinquecento, la luce passa da un arco all’altro. È qui che nasce la linea.',
          alt: 'Le Logge del Vasari ad Arezzo nel sole del pomeriggio: una lunga fila di archi e di lanterne' },
        { f: 'storia-a2', titolo: 'Il ricalco', pos: '62% 50%',
          testo: 'Sulla foto delle Logge si posa un foglio sottile e, a matita, si segue la curva di un arco.',
          alt: 'Una mano ricalca a matita un arco delle Logge da una fotografia, su un tavolo di legno al sole' },
        { f: 'storia-a3', titolo: 'Il disegno', pos: '55% 50%',
          testo: 'Quell’arco si ripete, piccolo, in una fila: diventa il fianco dell’anello, sotto le pietre.',
          alt: 'Il disegno a matita di un arco e, accanto, dell’anello con la fila di archetti sotto i diamanti' },
        // 08/11: tolto il passo «La lima» (storia-a4): nelle due foto fatte con l’IA l’anello non era Loggia Infinito
        // (Niccolò: «è diverso l’anello»). Si rimette con una foto vera dell’anello al banco.
        { f: 'storia-a5', titolo: 'Le pietre', pos: '50% 50%',
          testo: 'Con le pinzette, un diamante di laboratorio alla volta entra tra le sue griffe. Poi le griffe si chiudono.',
          alt: 'Un diamante di laboratorio tenuto con le pinzette sopra l’anello, con la fila di archi sotto le pietre' },
        { f: 'storia-a6', titolo: 'Al dito', pos: '72% 50%',
          testo: 'Loggia Infinito, nel sole delle Logge: un giro di diamanti di laboratorio e, di fianco, la fila di archi.',
          alt: 'Una ragazza sorride appoggiata a una colonna delle Logge, con Loggia Infinito al dito' }
      ],
      fine: ['Scopri Loggia Infinito', '#/p/loggia-infinito'],
      prodotti: ['loggia-infinito', 'loggia-uno', 'loggia-tre', 'loggia-luce-orecchini']
    },
    diamanti: {
      etichetta: 'Diamanti di laboratorio', titolo: 'Nati in laboratorio',
      intro: 'Un diamante di laboratorio è un diamante vero: stessa materia, stessa durezza, stessa luce. Cambia solo il luogo in cui cresce.',
      // video: Seedance gratis 08/11, una sola generazione da 15 s con le 5 foto approvate come riferimenti (seme, plasma, grezzo, lucidatura, al dito)
      banner: { foto: 'storia-b3', video: 'video/diamante.mp4', testo: 'Stessa materia, stessa durezza e stessa luce di un diamante estratto.', link: 'Come nasce un diamante' },
      passi: [
        { f: 'storia-b1', titolo: 'Il seme', pos: '55% 50%',
          testo: 'Tutto parte da un seme: una lamina sottile di diamante, posata su un piatto d’acciaio.',
          alt: 'Con le pinzette, i semi di diamante si posano su un piatto d’acciaio accanto al reattore' },
        { f: 'storia-b2', titolo: 'Il reattore', pos: '45% 50%',
          testo: 'Il piatto entra nel reattore. Dentro, un gas ricco di carbonio si accende e diventa plasma.',
          alt: 'Il reattore d’acciaio con l’oblò acceso di rosa, in un laboratorio luminoso' },
        { f: 'storia-b3', titolo: 'Il plasma', pos: '50% 50%',
          testo: 'Nella luce rosa il carbonio si posa sul seme, strato dopo strato, per settimane. Cresce un diamante.',
          alt: 'Dall’oblò del reattore, il plasma rosa sopra il piatto con i diamanti che crescono' },
        { f: 'storia-b4', titolo: 'Il grezzo', pos: '68% 50%',
          testo: 'Esce un cristallo grezzo: è già diamante, ancora senza la sua luce.',
          alt: 'Un cristallo grezzo di diamante di laboratorio tenuto con le pinzette, appena uscito dal reattore' },
        { f: 'storia-b5', titolo: 'La lucidatura', pos: '50% 50%',
          testo: 'Sulla mola, faccetta dopo faccetta, il cristallo diventa un brillante.',
          alt: 'Il diamante sulla mola di lucidatura, tenuto dalla pinza del tagliatore' },
        { f: 'storia-b6', titolo: 'Al dito', pos: '70% 50%',
          testo: 'Lo stesso diamante, nel sole delle Logge. Cambia solo il luogo in cui è nato.',
          alt: 'Una ragazza guarda il suo anello con diamante di laboratorio sotto le Logge' }
      ],
      fine: ['Scopri Loggia Uno', '#/p/loggia-uno'],
      prodotti: ['loggia-uno', 'loggia-luce-orecchini', 'loggia-tre', 'loggia-colonna']
    }
  };
  function fotoRacconto(nome, alt, sizes, pos, subito) {
    var b = 'img/serio/' + nome;
    return '<img src="' + b + '-1456.webp" srcset="' + b + '-720.webp 720w, ' + b + '-1100.webp 1100w, ' + b + '-1456.webp 1456w" sizes="' + sizes +
      '" width="1456" height="819" alt="' + esc(alt) + '"' + (pos ? ' style="object-position:' + pos + '"' : '') +
      (subito ? ' fetchpriority="high"' : ' loading="lazy"') + ' decoding="async">';
  }
  // riga che scorre col dito (al computer anche con le frecce): titolo a sinistra, link a destra
  function carosello(classe, etichetta, titolo, link, schede) {
    return '<section class="sezione carosello ' + classe + '"><div class="testa-riga contenitore"><div>' +
      (etichetta ? '<p class="etichetta">' + etichetta + '</p>' : '') + '<h2>' + titolo + '</h2></div><div class="testa-azioni">' +
      '<div class="frecce"><button type="button" data-scorri="-1" aria-label="Indietro">←</button><button type="button" data-scorri="1" aria-label="Avanti">→</button></div>' +
      '<a class="link" href="' + link[1] + '">' + link[0] + '</a></div></div><div class="riga-scorre">' + schede + '</div></section>';
  }
  // i passi di un racconto da sfogliare in home, come le storie: ognuno porta alla pagina intera
  function passiInRiga(id) {
    var r = RACCONTI[id];
    return carosello('racconto-riga', r.etichetta, r.titolo, ['Leggi tutto', '#/' + id], r.passi.map(function (p, i) {
      return '<a class="passo-scheda" href="#/' + id + '"><div class="ph">' + fotoRacconto(p.f, p.alt, '(min-width:900px) 30vw, 82vw', p.pos) + '</div>' +
        '<span class="passo-num">0' + (i + 1) + '</span><h3>' + p.titolo + '</h3><p>' + p.testo + '</p></a>';
    }).join(''));
  }
  // le quattro cose che una cliente vuole sapere prima di comprare, in poche parole (solo cose già scritte nel sito)
  function fiducia() {
    return '<section class="fiducia contenitore"><ul>' + [
      ['Oro bianco 9 kt', 'Con il certificato di garanzia'],
      ['Diamanti di laboratorio', 'Stessa materia e stessa luce'],
      ['Spedizione assicurata', 'In tutta Italia'],
      ['Reso entro 14 giorni', 'Nella confezione originale']
    ].map(function (f) { return '<li><strong>' + f[0] + '</strong><span>' + f[1] + '</span></li>'; }).join('') + '</ul></section>';
  }
  // in home: la foto (domani il video) a tutta larghezza, il testo sopra la foto; tutto porta alla pagina del racconto
  function bannerRacconto(id) {
    var r = RACCONTI[id], b = r.banner;
    return '<section class="sezione banner-video' + (b.video ? ' con-video' : '') + '"><a class="banner-media" href="#/' + id + '" tabindex="-1" aria-hidden="true"' +
      (b.video && !fermo ? ' data-video="' + b.video + '"' : '') + '>' + fotoRacconto(b.foto, '', '100vw') + '</a>' +
      '<div class="dittico-testo"><p class="etichetta">' + r.etichetta + '</p><h2>' + r.titolo + '</h2><p>' + b.testo + '</p>' +
      '<a class="link" href="#/' + id + '">' + b.link + '</a></div></section>';
  }
  // la pagina: un passo per foto; in fondo il gioiello, la collezione e l’altro racconto
  function racconto(id) {
    var r = RACCONTI[id], altro = id === 'storia' ? 'diamanti' : 'storia';
    document.title = r.titolo + ' · GB Gioielli';
    return '<div class="contenitore"><nav class="briciole"><a href="#/">Home</a> / ' + r.titolo + '</nav>' +
      '<div class="titolo-pagina racconto-testa"><p class="etichetta">' + r.etichetta + '</p><h1>' + r.titolo + '</h1><p>' + r.intro + '</p></div></div>' +
      '<ol class="passi">' + r.passi.map(function (p, i) {
        return '<li class="passo"><figure class="ph passo-foto">' + fotoRacconto(p.f, p.alt, '(min-width:900px) 58vw, 100vw', p.pos, i === 0) + '</figure>' +
          '<div class="passo-testo"><span class="passo-num">' + (i < 9 ? '0' : '') + (i + 1) + '</span><h2>' + p.titolo + '</h2><p>' + p.testo + '</p></div></li>';
      }).join('') + '</ol>' +
      '<div class="racconto-fine"><a class="link" href="' + r.fine[1] + '">' + r.fine[0] + '</a></div>' +
      '<section class="sezione contenitore"><div class="testa-sezione"><h2>La collezione</h2><p>Oro bianco e diamanti di laboratorio</p></div>' +
      '<div class="griglia">' + r.prodotti.map(function (pid) { return scheda(trova(pid)); }).join('') + '</div></section>' +
      bannerRacconto(altro);
  }
  function avviaBanner() {
    var box = vista.querySelectorAll('.banner-media[data-video]');
    if (!box.length) return;
    function parti(m) {
      if (m.querySelector('video')) return;
      var v = document.createElement('video');
      v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true; v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true');
      v.preload = 'auto'; v.src = m.getAttribute('data-video');
      v.addEventListener('playing', function () { v.classList.add('parte'); });
      m.appendChild(v);
      var p = v.play(); if (p && p.catch) p.catch(function () { /* senza autoplay resta la foto */ });
    }
    if (!('IntersectionObserver' in window)) { box.forEach(parti); return; }
    var io = new IntersectionObserver(function (voci) {
      voci.forEach(function (e) { if (e.isIntersecting) { parti(e.target); io.unobserve(e.target); } });
    }, { rootMargin: '300px' });
    box.forEach(function (m) { io.observe(m); });
  }

  function home() {
    document.title = 'GB Gioielli · Loggia, oro bianco e diamanti di laboratorio';
    // 09/11, l'ordine chiesto da Daniel al telefono: animazione iniziale, i più venduti, il video sulla linea e i diamanti di
    // laboratorio, il catalogo completo e in fondo le garanzie. Categorie, Archi, passi della storia e punto segreto non sono più
    // in home: la storia resta nelle pagine «Come nasce Loggia» e «Nati in laboratorio» del menu.
    // In apertura «Sotto le Logge» (js/nascita.js: si cammina sotto il portico delle Logge del Vasari fino alla bottega con Loggia Uno;
    // il film 3D di js/anello.js è stato bocciato il 09/11); senza lo script resta la foto di campagna.
    return (window.Nascita ? window.Nascita.sezione() : apertura()) +
      carosello('prodotti', '', 'I più venduti', ['Vedi tutti', '#/c/tutti'], PIU_VENDUTI.map(function (id) { return scheda(trova(id)); }).join('')) +
      bannerRacconto('diamanti') +
      '<section class="sezione contenitore catalogo"><div class="testa-sezione"><h2>Tutta la collezione</h2><p>Oro bianco e diamanti di laboratorio</p></div>' +
      '<div class="griglia">' + ORDINE.map(function (id) { return scheda(trova(id)); }).join('') + '</div></section>' +
      fiducia();
  }
  // il negozio non ha ancora vendite: per ora i quattro con le foto indossate migliori, da cambiare con i dati veri
  // (Loggia Uno è già protagonista dell'apertura: qui non per primo, critica del 09/11)
  var PIU_VENDUTI = ['loggia-luce-orecchini', 'loggia-tre', 'loggia-infinito', 'loggia-uno'];

  var filtro = { pietra: 'tutti', ordine: 'evidenza' };

  function collezione(id) {
    var cat = null;
    CATEGORIE.forEach(function (c) { if (c.id === id) cat = c; });
    var titolo = cat ? cat.nome : 'Tutti i gioielli';
    document.title = titolo + ' · GB Gioielli';
    var nellaCat = ORDINE.map(trova).filter(function (p) { return !cat || inCategoria(p, id); });
    if (!nellaCat.some(function (p) { return p.pietra === filtro.pietra; })) filtro.pietra = 'tutti';
    var lista = nellaCat.filter(function (p) { return filtro.pietra === 'tutti' || p.pietra === filtro.pietra; });
    if (filtro.ordine === 'su') lista.sort(function (a, b) { return a.prezzo - b.prezzo; });
    if (filtro.ordine === 'giu') lista.sort(function (a, b) { return b.prezzo - a.prezzo; });
    // solo le pietre che ci sono in questa categoria
    var schede = [['tutti', 'Tutti']].concat(Object.keys(PIETRE).filter(function (k) {
      return nellaCat.some(function (p) { return p.pietra === k; });
    }).map(function (k) { return [k, PIETRE[k]]; }));
    var n = nellaCat.length;
    // al telefono la categoria si apre con la sua foto di campagna (al computer no: la foto è larga solo 800 px)
    var fc = cat && FOTO_CATEGORIE[cat.id];
    return (fc ? '<div class="testa-cat"><img ' + sorgentiLibere(fc, '100vw') + '></div>' : '') +
      '<div class="contenitore"><nav class="briciole"><a href="#/">Home</a> / ' + titolo + '</nav>' +
      '<div class="titolo-pagina"><h1>' + titolo + '</h1><p>' + n + (n === 1 ? ' gioiello' : ' gioielli') + ' · Loggia</p></div>' +
      '<div class="filtri"><div class="schede" role="group" aria-label="Pietra">' +
      (schede.length > 2 ? schede.map(function (s) { return '<button type="button" data-pietra="' + s[0] + '" aria-pressed="' + (filtro.pietra === s[0]) + '">' + s[1] + '</button>'; }).join('') : '') +
      '</div>' + (schede.length > 2 ? '<label class="ordina pietra-tel">Pietra <select id="pietra">' + schede.map(function (s) {
        return '<option value="' + s[0] + '"' + (filtro.pietra === s[0] ? ' selected' : '') + '>' + (s[0] === 'tutti' ? 'Tutte' : s[1]) + '</option>';
      }).join('') + '</select></label>' : '') +
      '<label class="ordina">Ordina <select id="ordina">' +
      [['evidenza', 'In evidenza'], ['su', 'Prezzo crescente'], ['giu', 'Prezzo decrescente']].map(function (o) {
        return '<option value="' + o[0] + '"' + (filtro.ordine === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
      }).join('') + '</select></label></div>' +
      (lista.length ? '<div class="griglia">' + lista.map(scheda).join('') + '</div>'
        : '<p class="vuoto-lista">Nessun gioiello con questa pietra in questa categoria.</p>') +
      '</div>';
  }

  var scelta = {};

  function prodotto(id) {
    var p = trova(id);
    if (!p) return null;
    document.title = p.nome + ' · GB Gioielli';
    var o = p.opz ? OPZIONI[p.opz] : null;
    if (o && !scelta[p.id]) scelta[p.id] = o.base;
    var cat = CATEGORIE.filter(function (c) { return c.id === p.cat; })[0];
    var simili = ORDINE.map(trova).filter(function (q) { return q.cat === p.cat && q.id !== p.id; })
      .concat(ORDINE.map(trova).filter(function (q) { return q.cat !== p.cat; })).slice(0, 4);
    var g = galleria(p), ind = INDOSSATI[p.id], n = g.length + (ind ? 1 : 0), slides = '', punti = '';
    for (var k = 1; k <= n; k++) {
      // al computer la prima su tutta la larghezza, le altre a metà; tutte subito (al telefono si passano col dito, niente attese)
      var sz = k === 1 || n === 1 ? '(min-width:900px) 55vw, 100vw' : '(min-width:900px) 28vw, 100vw';
      slides += k <= g.length ? immagine(g[k - 1], p.nome + ', foto ' + k + ' di ' + n, sz, false)
        : '<div class="ph indossato"><img src="' + ind.nome + '-' + ind.larghezze[ind.larghezze.length - 1] + '.webp" srcset="' + srcset(ind) +
          '" sizes="' + sz + '" alt="' + esc(ind.alt) + '" decoding="async"></div>';
      punti += '<i' + (k === 1 ? ' class="on"' : '') + '></i>';
    }
    return '<div class="contenitore"><nav class="briciole"><a href="#/">Home</a> / <a href="#/c/' + cat.id + '">' + cat.nome + '</a> / ' + esc(p.nome) + '</nav>' +
      '<div class="pd"><div class="galleria">' +
      (n === 1 ? '<div class="slides sola">' + slides + '</div>'
        : '<div class="slides' + (n % 2 ? '' : ' pari') + '" id="slides">' + slides + '</div><div class="punti" id="punti">' + punti + '</div>') + '</div>' +
      '<div class="info"><p class="etichetta">' + esc(p.tipo) + '</p><h1>' + esc(p.nome) + '</h1><p class="prezzo" id="prezzo">' + euro(prezzoDi(p, scelta[p.id])) + '</p><p class="mat">' + p.materiale + '</p>' +
      (o ? '<div class="opz"><div class="opz-testa"><span class="etichetta">' + o.nome + '</span>' +
        (o.guida ? '<button class="link-testo" type="button" data-info="misure">Guida alle misure</button>' : '') + '</div>' +
        '<div class="scelte' + (o.larghe ? ' larghe' : '') + '" role="group" aria-label="' + o.nome + '">' +
        o.valori.map(function (v) { return '<button type="button" data-scelta="' + v + '" aria-pressed="' + (scelta[p.id] === v) + '">' + v + '</button>'; }).join('') +
        '</div></div>' : '') +
      '<button class="btn pieno largo" type="button" data-aggiungi="' + p.id + '">Aggiungi al carrello</button>' +
      '<p class="rassicura">Spedizione assicurata · Reso entro 14 giorni</p>' +
      '<details open><summary>Dettagli</summary><div class="corpo"><p>' + p.desc + '</p><dl class="dati">' +
      '<dt>Materiale</dt><dd>' + p.materiale + '</dd><dt>Misure</dt><dd>' + p.misure + '</dd>' +
      '<dt>Diamanti</dt><dd>Di laboratorio (CVD), taglio brillante, colore D–F, purezza VS1 o superiore. ' +
      '<a class="link-testo" href="#/diamanti">Come nascono</a></dd>' +
      '<dt>Oro</dt><dd>Bianco 9 kt (375‰), rodiato</dd></dl></div></details>' +
      '<details><summary>Spedizioni e resi</summary><div class="corpo">' + TESTI.spedizioni + '</div></details>' +
      '<details><summary>Garanzia</summary><div class="corpo">' + TESTI.garanzia + '</div></details>' +
      '</div></div>' +
      '<section class="sezione"><div class="testa-sezione"><h2>Della stessa collezione</h2></div><div class="griglia">' + simili.map(scheda).join('') + '</div></section>' +
      '</div>' +
      // al telefono il bottone resta sempre a portata di pollice, finché quello vero non è sullo schermo
      '<div class="barra-compra" id="barra-compra"><div><strong>' + esc(p.nome) + '</strong><span id="prezzo-barra">' + euro(prezzoDi(p, scelta[p.id])) + '</span></div>' +
      '<button class="btn pieno" type="button" data-aggiungi="' + p.id + '">Aggiungi</button></div>';
  }

  var TESTI = {
    spedizioni: '<p>Spediamo in tutta Italia con corriere espresso assicurato. Tempi e costi: <em class="dc">da completare</em></p>' +
      '<p>Puoi restituire un gioiello entro 14 giorni dalla consegna, nella confezione originale e con il certificato. I gioielli incisi o fatti su misura non si possono restituire.</p>',
    garanzia: '<p>Ogni gioiello arriva con il suo certificato di garanzia.</p><p>Per legge sei coperto per due anni dalla consegna se il gioiello ha un difetto.</p>'
  };

  function tabellaMisure() {
    var r = '';
    for (var m = 8; m <= 22; m++) {
      var circ = 40 + m;
      r += '<tr><td>' + m + '</td><td>' + circ + ' mm</td><td>' + (circ / Math.PI).toFixed(1).replace('.', ',') + ' mm</td></tr>';
    }
    return '<p>Prendi un anello che porti già sullo stesso dito e misura il diametro interno, oppure avvolgi un filo attorno al dito e misura la circonferenza.</p>' +
      '<table class="misure"><thead><tr><th>Misura</th><th>Circonferenza</th><th>Diametro</th></tr></thead><tbody>' + r + '</tbody></table>' +
      '<p><strong>Loggia Infinito</strong> si realizza sulla tua misura e poi non si può ridimensionare: se hai dubbi, scrivici prima di ordinare.</p>';
  }

  var INFO = {
    spedizioni: ['Spedizioni e resi', function () { return TESTI.spedizioni; }],
    garanzia: ['Garanzia', function () { return TESTI.garanzia; }],
    misure: ['Guida alle misure', tabellaMisure],
    contatti: ['Contatti', function () {
      return '<p><strong>Email</strong> <em class="dc">da completare</em></p><p><strong>WhatsApp</strong> <em class="dc">da completare</em></p>' +
        '<p><strong>Instagram e TikTok</strong> <em class="dc">da completare</em></p>';
    }],
    cassa: ['Cassa', function () {
      return '<p>Nel negozio vero qui si apre la cassa sicura di Shopify: carta di credito o di debito, Apple Pay e Google Pay.</p>' +
        '<p>In questa anteprima il pagamento è spento.</p>';
    }]
  };

  /* ---------------------------------------------------------- carrello */
  var CHIAVE = 'gbg-carrello';
  var carrello = [];
  try { carrello = JSON.parse(localStorage.getItem(CHIAVE)) || []; } catch (e) { carrello = []; }
  if (!Array.isArray(carrello)) carrello = [];
  carrello = carrello.filter(function (r) { return r && trova(r.id); });
  function salva() { try { localStorage.setItem(CHIAVE, JSON.stringify(carrello)); } catch (e) { /* senza memoria va bene lo stesso */ } }

  function aggiungi(id) {
    var opz = scelta[id] || '';
    var r = carrello.filter(function (x) { return x.id === id && x.opz === opz; })[0];
    if (r) r.qta += 1; else carrello.push({ id: id, opz: opz, qta: 1 });
    salva();
    disegnaCarrello();
    apri('carrello');
  }

  function disegnaCarrello() {
    var n = carrello.reduce(function (s, r) { return s + r.qta; }, 0);
    var num = document.querySelector('.num');
    num.textContent = n;
    if (n) num.removeAttribute('data-zero'); else num.setAttribute('data-zero', '');
    var righe = document.getElementById('righe');
    var piede = document.getElementById('piede-carrello');
    if (!carrello.length) {
      righe.innerHTML = '<div class="vuoto"><p>Il carrello è vuoto.</p><a class="btn" href="#/c/tutti" data-chiudi>Scopri la collezione</a></div>';
      piede.style.display = 'none';
      return;
    }
    piede.style.display = '';
    righe.innerHTML = carrello.map(function (r, i) {
      var p = trova(r.id);
      var o = p.opz ? OPZIONI[p.opz].nome + ' ' + r.opz : '';
      return '<div class="riga"><a href="#/p/' + p.id + '" data-chiudi>' + immagine(fotoTessera(p), p.nome, '76px', false) + '</a><div>' +
        '<h3>' + esc(p.nome) + '</h3><p class="det">' + esc(p.tipo) + (o ? ' · ' + o : '') + '</p>' +
        '<p class="det">' + euro(prezzoDi(p, r.opz)) + '</p><div class="riga-sotto"><div class="qta">' +
        '<button type="button" data-qta="' + i + '" data-d="-1" aria-label="Uno in meno">−</button><span>' + r.qta + '</span>' +
        '<button type="button" data-qta="' + i + '" data-d="1" aria-label="Uno in più">+</button></div>' +
        '<button class="togli" type="button" data-togli="' + i + '">Rimuovi</button></div></div></div>';
    }).join('');
    fotoPronte(righe);
    document.getElementById('subtotale').textContent = euro(carrello.reduce(function (s, r) { return s + prezzoDi(trova(r.id), r.opz) * r.qta; }, 0));
  }

  /* ---------------------------------------------------------- finestre */
  var velo = document.querySelector('.velo');
  var aperto = null, ultimoFuoco = null;

  function apri(quale, info) {
    var el = document.getElementById(quale === 'info' ? 'foglio' : quale);
    if (aperto && aperto !== el) chiudi(true);
    if (quale === 'info') {
      document.getElementById('foglio-titolo').textContent = INFO[info][0];
      document.getElementById('foglio-corpo').innerHTML = INFO[info][1]();
    }
    ultimoFuoco = document.activeElement;
    el.classList.add('on');
    el.setAttribute('aria-hidden', 'false');
    velo.classList.add('on');
    radice.classList.add('blocca');
    aperto = el;
    var b = el.querySelector('[data-chiudi]');
    if (b) setTimeout(function () { b.focus({ preventScroll: true }); }, 60);
  }

  function chiudi(senzaFuoco) {
    if (!aperto) return;
    aperto.classList.remove('on');
    aperto.setAttribute('aria-hidden', 'true');
    velo.classList.remove('on');
    radice.classList.remove('blocca');
    aperto = null;
    if (!senzaFuoco && ultimoFuoco && ultimoFuoco.focus) ultimoFuoco.focus({ preventScroll: true });
  }

  var toastTimer;
  function avviso(testo) {
    var t = document.getElementById('toast');
    t.textContent = testo;
    t.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('on'); }, 2600);
  }

  /* ---------------------------------------------------------- indirizzi */
  var osservaBarra = null;
  // y: dove mettere la pagina appena cambiata (null = dove è)
  function mostra(y) {
    var h = location.hash.replace(/^#\/?/, '').split('/');
    var html = null;
    if (h[0] === 'c') html = collezione(h[1] || 'tutti');
    else if (h[0] === 'p') html = prodotto(h[1]);
    else if (RACCONTI.hasOwnProperty(h[0])) html = racconto(h[0]);
    // l'animazione dell'apertura si ferma prima di cambiare pagina (ascolti) e riparte quando si torna alla home
    if (window.Nascita) window.Nascita.ferma();
    if (html === null) html = home();
    vista.innerHTML = html;
    fotoPronte(vista);
    avviaVideo();
    avviaBanner();
    var barra = document.getElementById('barra-compra'), bottone = vista.querySelector('.info .btn.largo');
    radice.classList.toggle('con-barra', !!barra);
    if (osservaBarra) { osservaBarra.disconnect(); osservaBarra = null; }
    if (barra && bottone) {
      if ('IntersectionObserver' in window) {
        osservaBarra = new IntersectionObserver(function (v) { barra.classList.toggle('su', !v[0].isIntersecting); });
        osservaBarra.observe(bottone);
      } else barra.classList.add('su');
    }
    // la posizione prima di avviare l'animazione, così parte già dal punto giusto (niente riavvolgimento dalla cima)
    if (y != null) window.scrollTo(0, y);
    var nascita = document.getElementById('nascita');
    if (nascita && window.Nascita) window.Nascita.avvia(nascita);
    document.querySelectorAll('.nav-pc a').forEach(function (a) {
      a.classList.toggle('attivo', h[0] !== '' && a.getAttribute('href') === '#/' + h.slice(0, 2).join('/'));
    });
    var sl = document.getElementById('slides');
    if (sl) {
      var punti = document.querySelectorAll('#punti i');
      sl.addEventListener('scroll', function () {
        var i = Math.round(sl.scrollLeft / sl.clientWidth);
        punti.forEach(function (p, k) { p.classList.toggle('on', k === i); });
      }, { passive: true });
    }
  }

  // la posizione di ogni pagina della cronologia: con «indietro» (o «avanti») si torna dove si era; le pagine nuove partono
  // dalla cima. Si sposta la pagina solo al cambio di pagina, mai mentre si scorre.
  var POS = 'gbg-posizioni', posizioni = {}, voceOra = null;
  try { posizioni = JSON.parse(sessionStorage.getItem(POS)) || {}; } catch (e) { posizioni = {}; }
  function voce() { var s = history.state; return s && s.gbg ? s.gbg : null; }

  var ultimoHash = null;
  function cambia() {
    chiudi(true);
    var prima = ultimoHash;
    ultimoHash = location.hash;
    if (voceOra) posizioni[voceOra] = Math.round(window.scrollY);
    var id = voce(), y = 0;
    if (id && posizioni[id] != null) y = posizioni[id];
    else if (!id) {
      id = 'v' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      try { history.replaceState({ gbg: id }, ''); } catch (e) { /* senza cronologia si riparte dalla cima */ }
    }
    voceOra = id;
    try { sessionStorage.setItem(POS, JSON.stringify(posizioni)); } catch (e) { /* va bene lo stesso */ }
    mostra(prima !== null ? y : null);
  }
  // filtro e ordine restano solo passando da una collezione all’altra
  window.addEventListener('hashchange', function () {
    var a = (ultimoHash || '').split('/')[1], b = location.hash.split('/')[1];
    if (a !== 'c' || b !== 'c') filtro = { pietra: 'tutti', ordine: 'evidenza' };
    cambia();
  });

  /* ---------------------------------------------------------- tocchi */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('button, a');
    if (!t) return;
    if (t.hasAttribute('data-apri')) { apri(t.getAttribute('data-apri')); return; }
    if (t.hasAttribute('data-info')) { apri('info', t.getAttribute('data-info')); return; }
    if (t.hasAttribute('data-chiudi')) {
      if (t.tagName === 'A' && t.getAttribute('href') === location.hash) chiudi();
      else if (t.tagName !== 'A') chiudi();
      return;
    }
    // un link alla pagina in cui si è già (il marchio sulla home): niente cambio di pagina, si torna in cima
    if (t.tagName === 'A' && (t.getAttribute('href') === location.hash || (t.getAttribute('href') === '#/' && !location.hash))) {
      e.preventDefault();
      chiudi(true);
      if (window.Nascita && document.getElementById('nascita')) window.Nascita.cima(); else window.scrollTo(0, 0);
      return;
    }
    if (t.hasAttribute('data-aggiungi')) { aggiungi(t.getAttribute('data-aggiungi')); return; }
    if (t.hasAttribute('data-scelta')) {
      var id = location.hash.split('/')[2];
      scelta[id] = t.getAttribute('data-scelta');
      t.parentNode.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b === t)); });
      document.getElementById('prezzo').textContent = document.getElementById('prezzo-barra').textContent = euro(prezzoDi(trova(id), scelta[id]));
      return;
    }
    if (t.hasAttribute('data-scorri')) {
      var riga = t.closest('.carosello').querySelector('.riga-scorre');
      riga.scrollBy({ left: +t.getAttribute('data-scorri') * riga.clientWidth * 0.8, behavior: fermo ? 'auto' : 'smooth' });
      return;
    }
    if (t.hasAttribute('data-pietra')) { filtro.pietra = t.getAttribute('data-pietra'); mostra(); return; }
    if (t.hasAttribute('data-qta')) {
      var r = carrello[+t.getAttribute('data-qta')];
      r.qta += +t.getAttribute('data-d');
      if (r.qta < 1) carrello.splice(carrello.indexOf(r), 1);
      salva(); disegnaCarrello(); return;
    }
    if (t.hasAttribute('data-togli')) { carrello.splice(+t.getAttribute('data-togli'), 1); salva(); disegnaCarrello(); }
  });
  velo.addEventListener('click', function () { chiudi(); });
  document.addEventListener('change', function (e) {
    if (e.target.id === 'ordina') { filtro.ordine = e.target.value; mostra(); }
    if (e.target.id === 'pietra') { filtro.pietra = e.target.value; mostra(); }
  });
  document.addEventListener('submit', function (e) {
    if (e.target.id === 'iscrizione') { e.preventDefault(); avviso('Anteprima: l’iscrizione è spenta.'); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') chiudi(); });

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  disegnaCarrello();
  cambia();
})();
