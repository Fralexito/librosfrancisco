/* =====================================================================
   MOVIMIENTO DE LA WEB (GSAP + ScrollTrigger + Lenis)
   - Desplazamiento suave
   - Elementos que entran en 3D al bajar
   - Tarjetas que se inclinan con el mouse
   - Botones "magnéticos"
   - Cortina suave al cambiar de página
   Si el visitante pidió "reducir movimiento" en su equipo, se deja
   solo lo suave (aparecer sin grandes desplazamientos).
   ===================================================================== */
(function () {
  "use strict";
  var gsap = window.gsap, ST = window.ScrollTrigger;
  var html = document.documentElement;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Cortina entre páginas ---------- */
  function curtain() {
    var c = document.querySelector(".curtain"); if (!c) return;
    if (html.classList.contains("pase-in")) {
      requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add("pase-out"); setTimeout(function () { html.classList.remove("pase-in", "pase-out"); }, 900); }); });
    }
    if (reduce) return;
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a[href]"); if (!a || e.defaultPrevented) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
      if (a.target && a.target !== "_self") return; if (a.hasAttribute("download")) return;
      var u; try { u = new URL(a.href, location.href); } catch (er) { return; }
      if (u.origin !== location.origin || !/\.html$|\/$/.test(u.pathname)) return;
      if (u.pathname === location.pathname) return;          // misma página (anclas): sin cortina
      e.preventDefault();
      try { sessionStorage.setItem("fdt-pase", "1"); } catch (er) {}
      html.classList.add("pase-go");
      setTimeout(function () { location.href = u.href; }, 520);
    });
    addEventListener("pageshow", function (e) { if (e.persisted) html.classList.remove("pase-go", "pase-in", "pase-out"); });
  }
  curtain();

  if (!gsap || !ST) return;
  gsap.registerPlugin(ST);
  html.classList.add("motion");

  /* ---------- Desplazamiento suave ---------- */
  var lenis = null;
  if (!reduce && window.Lenis && fine) {
    lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on("scroll", ST.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    $$(".drawer .panel, .qv-box, .shelf").forEach(function (el) { el.setAttribute("data-lenis-prevent", ""); });
    new MutationObserver(function () {
      if (document.body.style.overflow === "hidden") lenis.stop(); else lenis.start();
    }).observe(document.body, { attributes: true, attributeFilter: ["style"] });
    var top = document.getElementById("totop");
    if (top) top.addEventListener("click", function (e) { e.stopImmediatePropagation(); lenis.scrollTo(0); }, true);
  }
  window.FDT_LENIS = lenis;

  var D = reduce ? 0.5 : 1;            // intensidad
  var far = reduce ? 14 : 70;

  /* ---------- Tarjetas que entran en 3D ---------- */
  function cardsIn(scope) {
    var cards = $$(".card", scope).filter(function (c) { return !c.__in; });
    cards.forEach(function (c) { c.__in = true; c.classList.remove("rv"); c.classList.add("seen"); });
    if (!cards.length) return;
    gsap.set(cards, { opacity: 0, y: far, rotateX: reduce ? 0 : -22, transformPerspective: 1100, transformOrigin: "50% 100%" });
    ST.batch(cards, {
      start: "top 92%",
      onEnter: function (b) { gsap.to(b, { opacity: 1, y: 0, rotateX: 0, duration: 1.1 * D + .3, ease: "expo.out", stagger: .09, clearProps: "transform,opacity" }); },
      once: true
    });
  }
  cardsIn(document);
  // el catálogo vuelve a dibujar tarjetas al filtrar: las animamos al aparecer
  $$("#catGrid, #related, #autorBooks").forEach(function (g) {
    new MutationObserver(function () { $$(".card", g).forEach(function (c) { if (!c.__in) { c.__in = true; c.classList.add("seen"); gsap.fromTo(c, { opacity: 0, y: 30, rotateX: reduce ? 0 : -14, transformPerspective: 1000 }, { opacity: 1, y: 0, rotateX: 0, duration: .8, ease: "expo.out", delay: [].indexOf.call(g.children, c) * .06, clearProps: "transform,opacity" }); } }); }).observe(g, { childList: true });
  });

  /* ---------- Entradas con profundidad ---------- */
  function rise(sel, extra) {
    $$(sel).forEach(function (el) {
      el.classList.remove("rv"); el.classList.add("seen");
      gsap.from(el, Object.assign({ opacity: 0, y: far * .8, duration: 1.2 * D + .2, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } }, extra || {}));
    });
  }
  rise(".howto", { rotateX: reduce ? 0 : 16, transformPerspective: 1200, transformOrigin: "50% 0%" });
  rise(".duo > *", { rotateY: reduce ? 0 : -10, transformPerspective: 1400, stagger: .12 });
  $$(".pdp-info > *").forEach(function (el, i) { el.classList.add("seen"); gsap.from(el, { opacity: 0, y: reduce ? 8 : 24, duration: .8, delay: .1 + i * .05, ease: "expo.out" }); });
  $$(".howto-steps li").forEach(function (li, i) {
    gsap.from(li, { opacity: 0, x: reduce ? 0 : -30, duration: .9, delay: .15 + i * .12, ease: "expo.out", scrollTrigger: { trigger: li.parentNode, start: "top 85%", once: true } });
  });

  if (!reduce) {
    /* Portada: el texto sube y se aleja al bajar */
    var hs = document.getElementById("heroSlot");
    if (hs) gsap.to(hs, { yPercent: -12, opacity: .25, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    /* Retrato del autor en 3D */
    $$(".author .ph").forEach(function (ph) {
      ph.classList.remove("rv", "clip"); ph.classList.add("seen", "in");
      gsap.fromTo(ph, { rotateY: 12, scale: .9, transformPerspective: 1200 }, { rotateY: 0, rotateX: 0, scale: 1, ease: "none", scrollTrigger: { trigger: ph, start: "top 95%", end: "center 55%", scrub: .8 } });
      var im = ph.querySelector("img"); if (im) gsap.fromTo(im, { yPercent: -6, scale: 1.12 }, { yPercent: 6, scale: 1.12, ease: "none", scrollTrigger: { trigger: ph, start: "top bottom", end: "bottom top", scrub: true } });
    });
    /* Vitrina: el escenario aparece desde lejos */
    $$(".sc-book").forEach(function (bk) {
      var rev = bk.classList.contains("rev"), wide = innerWidth > 900;
      var tl = gsap.timeline({ scrollTrigger: { trigger: bk, start: "top 80%", once: true } });
      tl.from(bk.querySelector(".sc-stage-box"), { opacity: 0, x: wide ? (rev ? 80 : -80) : 0, y: wide ? 0 : 40, rotateY: wide ? (rev ? 14 : -14) : 0, scale: .94, transformPerspective: 1400, duration: 1.2, ease: "expo.out" })
        .from(bk.querySelectorAll(".sc-txt > *"), { opacity: 0, y: 30, duration: .9, stagger: .07, ease: "expo.out" }, "-=.9");
    });
    /* Encabezados de página interior */
    $$(".phead .wrap > *").forEach(function (el, i) { gsap.from(el, { opacity: 0, y: 40, duration: 1.1, delay: .1 + i * .08, ease: "expo.out" }); });
    /* Nombre grande del pie: letra por letra */
    $$(".wordmark").forEach(function (w) {
      w.innerHTML = w.textContent.split("").map(function (ch) { return ch === " " ? " " : '<span class="ch">' + ch + "</span>"; }).join("");
      gsap.from($$(".ch", w), { yPercent: 110, rotateX: -80, opacity: 0, stagger: .025, ease: "expo.out", duration: 1.2, scrollTrigger: { trigger: w, start: "top 98%", once: true } });
    });
  }

  /* ---------- Inclinación 3D con el mouse ---------- */
  if (fine) {
    function tiltable(el, max, lift) {
      if (el.__tilt) return; el.__tilt = true;
      var rx = gsap.quickTo(el, "rotateX", { duration: .6, ease: "power3" }), ry = gsap.quickTo(el, "rotateY", { duration: .6, ease: "power3" }), yy = gsap.quickTo(el, "y", { duration: .6, ease: "power3" });
      gsap.set(el, { transformPerspective: 1000 });
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
        rx(-py * max); ry(px * max); yy(-lift);
        el.style.setProperty("--gx", (px + .5) * 100 + "%"); el.style.setProperty("--gy", (py + .5) * 100 + "%");
      });
      el.addEventListener("pointerleave", function () { rx(0); ry(0); yy(0); });
    }
    function tiltAll() {
      $$(".card").forEach(function (c) { tiltable(c, 9, 8); });
      $$(".howto, .duo > *, .qa details").forEach(function (c) { tiltable(c, 3, 0); });
      $$(".author .ph").forEach(function (c) { tiltable(c, 8, 0); });
    }
    tiltAll();
    new MutationObserver(tiltAll).observe(document.querySelector("main") || document.body, { childList: true, subtree: true });

    /* Botones magnéticos */
    function magnet(el) {
      if (el.__mag) return; el.__mag = true;
      var x = gsap.quickTo(el, "x", { duration: .5, ease: "power3" }), y = gsap.quickTo(el, "y", { duration: .5, ease: "power3" });
      el.addEventListener("pointermove", function (e) { var r = el.getBoundingClientRect(); x((e.clientX - r.left - r.width / 2) * .28); y((e.clientY - r.top - r.height / 2) * .38); });
      el.addEventListener("pointerleave", function () { gsap.to(el, { x: 0, y: 0, duration: .9, ease: "elastic.out(1,.4)" }); });
    }
    function magAll() { $$(".hero .btn, .sec .btn-acc, .sc-txt .btn, .nav .icon-btn, .totop, .op-go").forEach(magnet); }
    magAll();
    new MutationObserver(magAll).observe(document.body, { childList: true, subtree: true });
  }

  addEventListener("load", function () { ST.refresh(); setTimeout(function () { ST.refresh(); }, 1500); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ST.refresh(); });
})();
