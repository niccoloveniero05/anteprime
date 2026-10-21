// Animazioni della home: copertina, muro di foto, parole, dalla pianta alla tazza, Aloe Code, pila, binario
(function(){
  var SITO = window.SITO || {ridotto: true};

  // muro: le colonne di foto vere
  var IMG = []; for (var k = 0; k < 18; k++) IMG.push('m' + (k < 10 ? '0' : '') + k);
  var cols = document.getElementById('scena-cols'), N = matchMedia('(min-width:900px)').matches ? 5 : 3;
  for (var c = 0; c < N; c++) { var col = document.createElement('div'); col.className = 'col';
    var lista = IMG.filter(function(_, i){ return i % N === c; }); lista = lista.concat(lista, lista).slice(0, 8);
    lista.forEach(function(n){ var im = document.createElement('img'); im.src = 'img/muro/' + n + '.jpg'; im.alt = ''; im.decoding = 'async'; col.appendChild(im); });
    cols.appendChild(col); }
  var frasi = document.querySelectorAll('.frase');
  function mostraFrase(p){ var k = p < .34 ? 0 : p < .67 ? 1 : 2; frasi.forEach(function(f, i){ f.classList.toggle('visibile', i === k); }); }

  // dichiarazione: ogni parola in uno span
  var dich = document.getElementById('dichiara');
  dich.innerHTML = dich.innerHTML.replace(/(<em>|<\/em>)/g, function(m){ return m === '<em>' ? '\u0001' : '\u0002'; }).split(' ').map(function(w){ return '<span class="w">' + w + '</span>'; }).join(' ').replace(/\u0001/g, '<em>').replace(/\u0002/g, '</em>');
  var parole = dich.querySelectorAll('.w');

  if (SITO.ridotto || !window.gsap || !window.ScrollTrigger) return;
  var scena = document.querySelector('.scena'), fasi = document.querySelector('.fasi'), binario = document.querySelector('.binario');
  var fasiT = document.querySelectorAll('.fase-t'), fasiS = document.querySelectorAll('.fase-s');
  function clamp(x){ return Math.max(0, Math.min(1, x)); }

  // la copertina entra una volta sola
  gsap.from('#copVaso', {y: 60, autoAlpha: 0, duration: 1.2, ease: 'power3.out'});
  gsap.from('#riga1', {x: -40, autoAlpha: 0, duration: 1.1, ease: 'power3.out', delay: .1});
  gsap.from('#riga2', {x: 40, autoAlpha: 0, duration: 1.1, ease: 'power3.out', delay: .2});

  function imposta(){
    ScrollTrigger.getAll().forEach(function(t){ t.kill(); });
    var pc = matchMedia('(min-width:900px)').matches;

    // 0. copertina: il titolo si apre e il barattolo si raddrizza e sale
    var cop = document.querySelector('.copertina');
    gsap.fromTo('#riga1', {xPercent: 0}, {xPercent: -14, ease: 'none', scrollTrigger: {trigger: cop, start: 'top top', end: 'bottom top', scrub: .5}});
    gsap.fromTo('#riga2', {xPercent: 0}, {xPercent: 14, ease: 'none', scrollTrigger: {trigger: cop, start: 'top top', end: 'bottom top', scrub: .5}});
    gsap.fromTo('#copVaso', {rotate: -9, scale: 1}, {rotate: 3, scale: 1.12, yPercent: -10, ease: 'none', scrollTrigger: {trigger: cop, start: 'top top', end: 'bottom top', scrub: .5}});

    // 1. muro di foto
    var S = scena.querySelector('.scena-stage').clientHeight;
    document.querySelectorAll('.col').forEach(function(col, i){
      var H = col.scrollHeight, d = Math.max(0, H - S), su = i % 2 === 0;
      gsap.fromTo(col, {y: su ? 0 : -d}, {y: su ? -d : 0, ease: 'none', scrollTrigger: {trigger: scena, start: 'top top', end: 'bottom bottom', scrub: .4}});
    });
    ScrollTrigger.create({trigger: scena, start: 'top top', end: 'bottom bottom', onUpdate: function(s){ mostraFrase(s.progress); }});

    // 2. le parole si accendono
    ScrollTrigger.create({trigger: dich, start: 'top 80%', end: 'bottom 45%', onUpdate: function(s){ var n = parole.length; parole.forEach(function(w, i){ w.style.opacity = .16 + .84 * clamp((s.progress * n - i) * 1.6); }); }});

    // 3. dalla pianta alla tazza
    ScrollTrigger.create({trigger: fasi, start: 'top top', end: 'bottom bottom', onUpdate: function(s){
      var p = s.progress, k = p < 1/3 ? 0 : p < 2/3 ? 1 : 2;
      fasiT.forEach(function(t, i){ t.classList.toggle('visibile', i === k); });
      fasiS.forEach(function(t, i){ t.classList.toggle('visibile', i === k); });
    }});

    // 4. Aloe Code: il filo d'oro dei nove anni si disegna mentre scorri
    gsap.fromTo('#lineaOro', {scaleX: 0}, {scaleX: 1, ease: 'none', scrollTrigger: {trigger: '#linea', start: 'top 85%', end: 'top 45%', scrub: .5}});

    // 5. pila: la carta sotto si restringe quando la copre la successiva
    var carte = document.querySelectorAll('.carta-s');
    carte.forEach(function(c, i){ var next = carte[i + 1]; if (!next) return;
      gsap.fromTo(c, {scale: 1}, {scale: .95, ease: 'none', scrollTrigger: {trigger: next, start: 'top bottom', end: 'top top+=90', scrub: true}});
    });

    // 6. binario: i tre motivi scorrono di lato (solo da telefono)
    if (!pc) {
      var vag = document.getElementById('vagoni'), dist = vag.scrollWidth - innerWidth + 20;
      gsap.fromTo(vag, {x: 0}, {x: -dist, ease: 'none', scrollTrigger: {trigger: binario, start: 'top top', end: 'bottom bottom', scrub: .4, onUpdate: function(s){ document.getElementById('progresso').style.width = (s.progress * 100) + '%'; }}});
    }
  }
  var pronte = 0, imgs = document.querySelectorAll('.col img'), tot = imgs.length;
  imgs.forEach(function(im){ var ok = function(){ if (++pronte === tot) imposta(); }; if (im.complete) ok(); else { im.addEventListener('load', ok, {once: true}); im.addEventListener('error', ok, {once: true}); } });
  var t, w = innerWidth; addEventListener('resize', function(){ if (Math.abs(innerWidth - w) < 40) return; w = innerWidth; clearTimeout(t); t = setTimeout(imposta, 200); });
})();
