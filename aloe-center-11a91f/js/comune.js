// Parti comuni a tutte le pagine: testata, barra in basso, link morbidi, rotella morbida al computer
(function(){
  var ridotto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SITO = window.SITO = {ridotto: ridotto, lenis: null};
  if (ridotto || !window.gsap || !window.ScrollTrigger) document.documentElement.classList.add('fermo');

  var testata = document.getElementById('testata'), barra = document.getElementById('barra'), contatti = document.getElementById('contatti');
  function suScorri(){
    testata.classList.toggle('piena', scrollY > 30);
    if (!barra) return;
    var r = contatti ? contatti.getBoundingClientRect() : {top: 1e9, bottom: 1e9};
    barra.classList.toggle('vista', scrollY > innerHeight * 1.1 && !(r.top < innerHeight && r.bottom > 0));
  }
  suScorri(); addEventListener('scroll', suScorri, {passive: true});

  if (!ridotto && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    // al computer la rotella va morbida: certi mouse fanno salti da 300 px a scatto
    if (window.Lenis && matchMedia('(pointer: fine)').matches) {
      SITO.lenis = new Lenis({lerp: .12, wheelMultiplier: .8});
      SITO.lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function(t){ SITO.lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
  }

  // link interni morbidi (niente scroll-behavior nel CSS: dà fastidio a ScrollTrigger)
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var id = a.getAttribute('href'), t = id.length > 1 && document.querySelector(id); if (!t) return;
      e.preventDefault();
      var y = id === '#inizio' ? 0 : t.getBoundingClientRect().top + scrollY - 70;
      if (SITO.lenis) SITO.lenis.scrollTo(y, {duration: 1.3}); else scrollTo({top: y, behavior: ridotto ? 'auto' : 'smooth'});
    });
  });

  // barra dei rivenditori: scorre solo quando si vede
  var nastro = document.getElementById('loghi-nastro');
  if (nastro) {
    var loghi = [{src:'img/logo-erbe-cielo.png',alt:'Erboristeria Le Erbe del Cielo'},{src:'img/logo-barberini.png',alt:'Erboristeria Barberini'},{src:'img/logo-pharmacia.png',alt:'Pharmacia delle Erbe'}];
    var fila = function(nascosta){ var ul = document.createElement('ul'); ul.className = 'loghi-fila'; if (nascosta) ul.setAttribute('aria-hidden', 'true');
      for (var r = 0; r < 3; r++) { loghi.forEach(function(l){ var li = document.createElement('li'), im = document.createElement('img'); im.src = l.src; im.alt = nascosta ? '' : l.alt; im.loading = 'lazy'; li.appendChild(im); ul.appendChild(li); });
        var t = document.createElement('li'); t.className = 't'; t.textContent = 'Rivenditori ufficiali'; ul.appendChild(t); }
      return ul; };
    nastro.appendChild(fila(false)); nastro.appendChild(fila(true));
    new IntersectionObserver(function(e){ document.getElementById('loghi').classList.toggle('attivo', e[0].isIntersecting); }).observe(document.getElementById('loghi'));
  }
})();
