/* Menu, comparsa dei blocchi, conteggio dei numeri e modulo di contatto. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var fermo = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var io = 'IntersectionObserver' in window;

  /* testata: diventa un'isola sospesa appena si scorre */
  var testata = d.querySelector('.testata');
  if (testata && io) {
    var sentinella = d.createElement('div');
    sentinella.setAttribute('aria-hidden', 'true');
    sentinella.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:48px;pointer-events:none';
    d.body.insertBefore(sentinella, d.body.firstChild);
    new IntersectionObserver(function (e) { testata.classList.toggle('scorsa', !e[0].isIntersecting); }).observe(sentinella);
  }

  /* menu a schermo intero */
  var bottone = d.querySelector('.apri-menu'), menu = d.getElementById('menu');
  if (bottone && menu) {
    var etichetta = bottone.querySelector('.etichetta');
    var imposta = function (aperto) {
      html.classList.toggle('menu-aperto', aperto);
      bottone.setAttribute('aria-expanded', aperto ? 'true' : 'false');
      etichetta.textContent = aperto ? bottone.getAttribute('data-chiudi') : bottone.getAttribute('data-apri');
      if (aperto) { menu.removeAttribute('inert'); } else { menu.setAttribute('inert', ''); }
      if (aperto) { var primo = menu.querySelector('a'); if (primo) setTimeout(function () { primo.focus({ preventScroll: true }); }, 60); }
    };
    bottone.addEventListener('click', function () { imposta(!html.classList.contains('menu-aperto')); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) imposta(false); });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && html.classList.contains('menu-aperto')) { imposta(false); bottone.focus(); }
    });
  }

  /* blocchi che salgono quando arrivano */
  var blocchi = d.querySelectorAll('.reveal');
  if (!io || fermo) {
    blocchi.forEach(function (b) { b.classList.add('visto'); });
  } else {
    var osserva = new IntersectionObserver(function (voci) {
      voci.forEach(function (v) { if (v.isIntersecting) { v.target.classList.add('visto'); osserva.unobserve(v.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    blocchi.forEach(function (b) { osserva.observe(b); });
  }

  /* numeri che contano fino al valore */
  d.querySelectorAll('[data-conta]').forEach(function (el) {
    var fine = parseInt(el.getAttribute('data-conta'), 10), resto = el.getAttribute('data-resto') || '';
    if (fermo || !io) return;
    el.textContent = '0' + resto;
    var parti = function () {
      var t0 = performance.now(), durata = 1600;
      var passo = function (ora) {
        var k = Math.min(1, (ora - t0) / durata), e = 1 - Math.pow(1 - k, 3);
        el.textContent = Math.round(fine * e) + resto;
        if (k < 1) requestAnimationFrame(passo);
      };
      requestAnimationFrame(passo);
    };
    var o = new IntersectionObserver(function (v) { if (v[0].isIntersecting) { o.disconnect(); parti(); } }, { threshold: 0.6 });
    o.observe(el);
  });

  /* modulo di richiesta: controllo, campo trappola per lo spam, invio a Netlify */
  var modulo = d.querySelector('form.modulo');
  if (modulo) {
    var aperto = Date.now(), esito = modulo.querySelector('.esito');
    var scrivi = function (testo, tipo) { esito.textContent = testo; esito.setAttribute('data-tipo', tipo || ''); };
    modulo.addEventListener('submit', function (e) {
      e.preventDefault();
      var trappola = modulo.querySelector('[name="bot-field"]');
      if ((trappola && trappola.value) || Date.now() - aperto < 2500) { scrivi(modulo.getAttribute('data-ok'), 'ok'); return; }
      if (!modulo.checkValidity()) { modulo.reportValidity(); return; }
      if (/github\.io$|^localhost$|^127\./.test(location.hostname)) { scrivi(modulo.getAttribute('data-anteprima'), 'info'); return; }
      var invia = modulo.querySelector('[type="submit"]');
      invia.disabled = true;
      scrivi(modulo.getAttribute('data-inviando'), 'info');
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(modulo)).toString()
      }).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        modulo.reset();
        scrivi(modulo.getAttribute('data-ok'), 'ok');
      }).catch(function () {
        scrivi(modulo.getAttribute('data-errore'), 'errore');
      }).then(function () { invia.disabled = false; });
    });
  }
})();
