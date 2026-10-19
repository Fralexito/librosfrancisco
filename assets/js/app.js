/* =====================================================================
   FUNCIONES DE LA WEB
   Una parte común (menú, bolsa de pedido, animaciones) y una parte
   para cada página, según el atributo data-page del <body>.
   ===================================================================== */
(function () {
  "use strict";
  var S = window.SITE, C = S.config, L = S.libros;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var byId = function (id) { for (var i = 0; i < L.length; i++) if (L[i].id === id) return L[i]; return null; };
  var price = function (b) { return b.precio != null ? C.moneda + " " + Number(b.precio).toFixed(2) : "Precio por anunciar"; };
  var wa = function (msg) { return "https://wa.me/" + C.whatsapp + "?text=" + encodeURIComponent(msg); };
  var bookUrl = function (b) { return "libro.html#" + b.id; };
  var WA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.7 14.9L2 22l5.2-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3.9 2.5 1.1 2.7.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z"/></svg>';
  var BAG = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h12l-1 13H7L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>';

  document.documentElement.classList.add("js");

  /* ------------------------------------------------------------------
     Libro 3D real (WebGL). Se carga aparte y solo si el equipo lo soporta.
  ------------------------------------------------------------------ */
  var SRC = (document.currentScript && document.currentScript.src) || location.href, glP = null;
  function glOK() { try { var c = document.createElement("canvas"); return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl"))); } catch (e) { return false; } }
  function glViewer(opts, cb) {
    if (!glP) glP = glOK() ? (new Function("u", "return import(u)"))(new URL("book-gl.js", SRC).href).catch(function (e) { console.warn("3D no disponible", e); return null; }) : Promise.resolve(null);
    glP.then(function (m) { if (m) cb(m.createViewer(Object.assign({ reduce: reduce, author: C.autor }, opts))); });
  }

  /* ------------------------------------------------------------------
     Bolsa de pedido (se guarda en este navegador)
  ------------------------------------------------------------------ */
  var KEY = "fdt-bolsa";
  var bag = (function () { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } })();
  function saveBag() { try { localStorage.setItem(KEY, JSON.stringify(bag)); } catch (e) {} }
  function bagCount() { var n = 0; for (var k in bag) n += bag[k]; return n; }
  function flyToBag(src) {
    var target = $('[data-open-drawer="bag"].icon-btn'); if (!src || !target || reduce || !src.animate) return;
    var a = src.getBoundingClientRect(), t = target.getBoundingClientRect(); if (!a.width) return;
    var c = src.cloneNode(true); c.className = "flyer"; c.removeAttribute("loading");
    c.style.cssText = "left:" + a.left + "px;top:" + a.top + "px;width:" + a.width + "px;height:" + a.height + "px";
    document.body.appendChild(c);
    var dx = t.left + t.width / 2 - (a.left + a.width / 2), dy = t.top + t.height / 2 - (a.top + a.height / 2);
    c.animate([{ transform: "translate(0,0) scale(1) rotate(0)", opacity: 1 }, { transform: "translate(" + dx * .55 + "px," + (dy * .55 - 60) + "px) scale(.5) rotate(-8deg)", opacity: 1, offset: .55 }, { transform: "translate(" + dx + "px," + dy + "px) scale(.08) rotate(-14deg)", opacity: .4 }], { duration: 750, easing: "cubic-bezier(.5,0,.2,1)" }).onfinish = function () { c.remove(); };
  }
  function addToBag(id, n, srcEl) {
    bag[id] = (bag[id] || 0) + (n || 1); saveBag();
    flyToBag(srcEl);
    setTimeout(function () {
      renderBag();
      var cnt = $("#bagCount"); if (cnt) { cnt.classList.remove("bump"); void cnt.offsetWidth; cnt.classList.add("bump"); }
    }, reduce ? 0 : 650);
    toast("Libro agregado a tu pedido ✓");
  }
  function srcImg(el) {
    var box = el && el.closest(".card, .hero, .pdp, .qv-box, .ex-book, .band");
    return box ? $(".book3d .front img, .cv img, img", box) : null;
  }
  function renderBag() {
    var n = bagCount(), cnt = $("#bagCount"), pill = $("#orderPill");
    if (cnt) { cnt.textContent = n; cnt.classList.toggle("on", n > 0); }
    if (pill) { pill.hidden = n === 0; $("#opCount").textContent = n; document.body.classList.toggle("has-order", n > 0); }
    var list = $("#bagList"), foot = $("#bagFoot"); if (!list) return;
    var ids = Object.keys(bag).filter(function (k) { return bag[k] > 0 && byId(k); });
    if (!ids.length) {
      list.innerHTML = '<div class="bag-empty"><b>Tu pedido está vacío</b><span>Elige un libro y aparecerá aquí.</span><a class="btn btn-line btn-sm" href="libros.html">Ver los libros</a></div>';
      foot.hidden = true; return;
    }
    var total = 0, known = true;
    list.innerHTML = ids.map(function (id) {
      var b = byId(id); if (b.precio == null) known = false; else total += b.precio * bag[id];
      return '<div class="bag-item"><img src="' + b.portada + '" alt=""><div><b>' + esc(b.titulo) + '</b><small>' + esc(price(b)) + '</small>'
        + '<div class="qty"><button type="button" data-q="-1" data-id="' + id + '" aria-label="Quitar uno">−</button><span>' + bag[id] + '</span><button type="button" data-q="1" data-id="' + id + '" aria-label="Agregar uno">+</button></div></div>'
        + '<button class="rm" type="button" data-rm="' + id + '">Quitar</button></div>';
    }).join("");
    foot.hidden = false;
    $("#bagTotal").textContent = known ? C.moneda + " " + total.toFixed(2) : "Se confirma por WhatsApp";
    if ($("#opTotal")) $("#opTotal").textContent = known ? C.moneda + " " + total.toFixed(2) : n + (n === 1 ? " libro" : " libros");
  }
  var DKEY = "fdt-datos";
  function orderMessage(d) {
    var lines = Object.keys(bag).filter(function (k) { return bag[k] > 0 && byId(k); }).map(function (id) { var b = byId(id); return "• " + bag[id] + " × " + b.titulo + (b.precio != null ? " (" + price(b) + " c/u)" : ""); });
    var msg = "Hola, quiero hacer este pedido de libros de " + C.autor + ":\n" + lines.join("\n");
    if (d) msg += "\n\nNombre: " + d.nombre + "\nCiudad y distrito: " + d.ciudad + "\nEntrega: " + d.entrega + "\nPago: " + d.pago + (d.nota ? "\nNota: " + d.nota : "");
    return msg + "\n\n¿Me confirman el precio final y la entrega? Gracias.";
  }
  function showStep(k) {
    [1, 2, 3].forEach(function (i) { var v = $("#bagView" + i); if (v) v.hidden = i !== k; });
    $$("#bagSteps li").forEach(function (li, i) { li.classList.toggle("on", i < k); li.classList.toggle("now", i === k - 1); });
    var v = $("#bagView" + k); if (v) { var f = $("input, button, a", v); if (f) setTimeout(function () { f.focus(); }, 60); }
    if (k === 2) {
      var ids = Object.keys(bag).filter(function (x) { return bag[x] > 0 && byId(x); });
      $("#bagSum").innerHTML = "<b>Resumen</b>" + ids.map(function (id) { return "<span>" + bag[id] + " × " + esc(byId(id).titulo) + "</span>"; }).join("");
      try { var dd = JSON.parse(localStorage.getItem(DKEY)) || {}; var f2 = $("#bagView2"); if (dd.nombre && !f2.elements.nombre.value) f2.elements.nombre.value = dd.nombre; if (dd.ciudad && !f2.elements.ciudad.value) f2.elements.ciudad.value = dd.ciudad; } catch (e) {}
    }
  }
  function bindCheckout() {
    var f = $("#bagView2"); if (!f) return;
    $("#toCheckout").addEventListener("click", function () { showStep(2); });
    $("#backToBag").addEventListener("click", function () { showStep(1); });
    $$("input[type=text]", f).forEach(function (i) { i.addEventListener("input", function () { var er = i.parentNode.querySelector(".err"); if (er && i.value.trim()) er.textContent = ""; }); });
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = { nombre: f.elements.nombre.value.trim(), ciudad: f.elements.ciudad.value.trim(), entrega: f.elements.entrega.value, pago: f.elements.pago.value, nota: f.elements.nota.value.trim() };
      $(".e-oname", f).textContent = d.nombre ? "" : "Escribe tu nombre para saber a quién enviamos el pedido.";
      $(".e-ocity", f).textContent = d.ciudad ? "" : "Escribe tu ciudad y distrito para coordinar la entrega.";
      if (!d.nombre || !d.ciudad) return;
      try { localStorage.setItem(DKEY, JSON.stringify({ nombre: d.nombre, ciudad: d.ciudad })); } catch (er) {}
      var url = wa(orderMessage(d)); $("#reopenWa").href = url;
      window.open(url, "_blank", "noopener");
      showStep(3);
    });
    $("#clearBag").addEventListener("click", function () { bag = {}; saveBag(); renderBag(); showStep(1); closeDrawers(); toast("Listo para un pedido nuevo"); });
  }
  function buyNow(id, n, srcEl) {
    if (!bag[id]) bag[id] = n || 1; else if (n && n > bag[id]) bag[id] = n;
    saveBag(); renderBag(); closeQV(true); openDrawer("bag"); showStep(2);
  }

  /* ------------------------------------------------------------------
     Paneles laterales (menú móvil y pedido)
  ------------------------------------------------------------------ */
  var lastFocus = null, openD = null;
  function focusables(d) { return $$("a[href], button:not([disabled]), input, select, textarea", $(".panel", d)).filter(function (x) { return x.offsetParent !== null; }); }
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Tab" || !openD) return;
    var f = focusables(openD); if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  function openDrawer(name) {
    var d = $("#drawer-" + name); if (!d) return;
    var a = document.activeElement; lastFocus = (a && !a.closest(".toast") && a !== document.body) ? a : $('[data-open-drawer="' + name + '"]'); openD = d;
    d.classList.add("open"); d.removeAttribute("inert"); document.body.style.overflow = "hidden";
    if (name === "bag" && $("#bagView3") && $("#bagView3").hidden) showStep(1);
    $$(".mnav a", d).forEach(function (a, i) { a.style.transitionDelay = (0.05 + i * 0.04) + "s"; });
    var f = $(".panel button, .panel a", d); if (f) setTimeout(function () { f.focus(); }, 50);
  }
  function closeDrawers() {
    if (!openD) return;
    $$(".drawer.open").forEach(function (d) { d.classList.remove("open"); d.setAttribute("inert", ""); });
    openD = null; document.body.style.overflow = ""; if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  }

  /* ------------------------------------------------------------------
     Vista rápida de un libro
  ------------------------------------------------------------------ */
  var qvFocus = null, qvV = null;
  function openQV(id) {
    var b = byId(id), q = $("#quickview"); if (!b || !q) return; qvFocus = document.activeElement; var qty = 1;
    $("#qvBox").innerHTML = '<button class="icon-btn qv-x" type="button" data-close-qv aria-label="Cerrar">✕</button>'
      + '<div class="qv-media" style="--tint:' + (b.color || "") + '">' + book3d(b) + '</div>'
      + '<div class="qv-info"><span class="kicker">' + esc(b.genero) + " · " + esc(b.edicion) + '</span><h3 id="qvTitle">' + esc(b.titulo) + '</h3><p class="sub">' + esc(b.subtitulo) + '</p>'
      + '<p class="hook">' + esc(b.gancho) + '</p><div class="qv-price"><b>' + esc(price(b)) + '</b><span>Pago y envío por WhatsApp</span></div>'
      + '<div class="qv-row"><div class="qty" aria-label="Cantidad"><button type="button" data-qvq="-1" aria-label="Menos">−</button><span id="qvQty">1</span><button type="button" data-qvq="1" aria-label="Más">+</button></div>'
      + '<button class="btn btn-acc" type="button" id="qvAdd">' + BAG + (b.disponible ? "Agregar al pedido" : "Reservar") + '</button></div>'
      + '<button class="btn btn-line" type="button" id="qvBuy">Comprar ya</button>'
      + '<a class="link" href="' + bookUrl(b) + '">Ver la ficha completa <span class="ar">→</span></a></div>';
    q.hidden = false; document.body.style.overflow = "hidden"; requestAnimationFrame(function () { q.classList.add("open"); });
    tilt($(".qv-media .stage", q));
    if (qvV) qvV.mount($(".qv-media .stage", q)).setBook(b);
    else glViewer({ mode: "drag", baseY: -0.35 }, function (v) { qvV = v; if (!q.hidden) v.mount($(".qv-media .stage", q)).setBook(b); });
    $$("[data-qvq]", q).forEach(function (x) { x.onclick = function () { qty = Math.max(1, qty + +x.getAttribute("data-qvq")); $("#qvQty").textContent = qty; }; });
    $("#qvAdd").onclick = function () { addToBag(b.id, qty, $(".qv-media img", q)); closeQV(); };
    $("#qvBuy").onclick = function () { buyNow(b.id, qty); };
    setTimeout(function () { $("#qvAdd").focus(); }, 60);
  }
  function closeQV(silent) {
    var q = $("#quickview"); if (!q || q.hidden) return;
    q.classList.remove("open"); setTimeout(function () { q.hidden = true; }, reduce ? 0 : 220);
    if (!openD) document.body.style.overflow = "";
    if (!silent && qvFocus && document.contains(qvFocus)) qvFocus.focus();
  }

  /* ------------------------------------------------------------------
     Aviso flotante
  ------------------------------------------------------------------ */
  var tt = null;
  function toast(msg, label, fn) {
    var t = $("#toast"); if (!t) return;
    t.innerHTML = "<span></span>" + (label ? '<button type="button"></button>' : "");
    t.firstChild.textContent = msg;
    if (label) { var b = t.lastChild; b.textContent = label; b.onclick = function () { t.classList.remove("show"); fn(); }; }
    t.classList.add("show"); clearTimeout(tt); tt = setTimeout(function () { t.classList.remove("show"); }, 3800);
  }

  /* ------------------------------------------------------------------
     Libro 3D que sigue al mouse
  ------------------------------------------------------------------ */
  function tilt(stage) {
    if (reduce || !stage || matchMedia("(hover: none)").matches) return;
    var book = $(".book3d", stage); if (!book) return;
    stage.addEventListener("pointermove", function (e) {
      var r = stage.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      book.classList.add("tilting");
      book.style.setProperty("--ry", (-18 + x * 30).toFixed(1) + "deg");
      book.style.setProperty("--rx", (3 - y * 14).toFixed(1) + "deg");
      book.style.setProperty("--shine", (120 - (x + 0.5) * 140).toFixed(0) + "%");
    });
    stage.addEventListener("pointerleave", function () {
      book.classList.remove("tilting"); book.style.removeProperty("--ry"); book.style.removeProperty("--rx"); book.style.removeProperty("--shine");
    });
  }
  function book3d(b, cls) {
    return '<div class="stage ' + (cls || "") + '"><div class="book3d"><div class="pages"></div><div class="front"><img src="' + b.portada + '" alt="Portada de ' + esc(b.titulo) + '"></div></div></div>';
  }

  /* ------------------------------------------------------------------
     Tarjeta de libro (se usa en inicio y catálogo)
  ------------------------------------------------------------------ */
  function card(b, i) {
    return '<article class="card" data-rv data-d="' + (i % 3) + '">'
      + '<div class="cv" style="--tint:' + (b.color || "") + '"><span class="pill">' + (b.disponible ? "Nuevo" : "Preventa") + '</span><img src="' + b.portada + '" alt="" loading="lazy">'
      + '<div class="quick"><button class="btn btn-acc btn-sm" type="button" data-add="' + b.id + '">' + BAG + 'Agregar</button><button class="btn btn-light btn-sm" type="button" data-qv="' + b.id + '">Vista rápida</button></div></div>'
      + '<div class="body"><span class="cat">' + esc(b.genero) + '</span><h3><a href="' + bookUrl(b) + '">' + esc(b.titulo) + '</a></h3>'
      + '<span class="by">' + esc(C.autor) + ' · ' + esc(b.edicion) + '</span>'
      + '<div class="pr"><b>' + esc(b.precio != null ? price(b) : "Por anunciar") + '</b><span>' + esc(b.salida) + '</span></div>'
      + '<div class="tacts"><button class="btn btn-acc btn-sm" type="button" data-add="' + b.id + '">' + BAG + (b.disponible ? "Agregar" : "Reservar") + '</button><button class="btn btn-line btn-sm" type="button" data-qv="' + b.id + '">Ver</button></div></div></article>';
  }
  function slugify(x) { return "tema-" + x.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-"); }
  function themes() {
    var map = {}, order = [];
    L.forEach(function (b) { (b.temas || []).forEach(function (t) { if (!map[t]) { map[t] = []; order.push(t); } map[t].push(b); }); });
    return order.map(function (t) { return { nombre: t, slug: slugify(t), texto: (S.temas && S.temas[t]) || "Libros del autor sobre este tema.", libros: map[t] }; });
  }
  var soonCard = '<article class="card soon" data-rv><div class="cv"><span>Próximo libro<br>en camino</span></div><div class="body"><span class="cat">Muy pronto</span><h3>Nuevo título</h3><span class="by">Suscríbete para enterarte primero</span><div class="pr"><a class="link" href="index.html#suscribirse">Avisarme <span class="ar">→</span></a></div></div></article>';

  /* ------------------------------------------------------------------
     Formularios de suscripción
  ------------------------------------------------------------------ */
  function bindForms() {
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    $$("form[data-lead]").forEach(function (f) {
      $$("input[type=text]", f).forEach(function (i) { i.addEventListener("input", function () { var er = i.parentNode.querySelector(".err"); if (er && i.value.trim()) er.textContent = ""; }); });
    f.addEventListener("submit", function (e) {
        e.preventDefault();
        var nm = f.elements.nombre ? f.elements.nombre.value.trim() : "x", m = f.elements.correo.value.trim();
        var en = $(".e-name", f), em = $(".e-mail", f);
        if (en) en.textContent = nm ? "" : "Escribe tu nombre.";
        em.textContent = re.test(m) ? "" : "Revisa tu correo: debe verse como nombre@gmail.com";
        if (!nm || !re.test(m)) return;
        var d = document.createElement("div"); d.className = "done"; d.setAttribute("role", "status");
        d.innerHTML = "<b></b><p></p><p class='fine' style='margin-top:.6rem'>Vista previa: el envío real se activa al conectar el servicio de correo.</p>";
        d.querySelector("b").textContent = f.elements.nombre ? "Gracias, " + nm + "." : "¡Listo!";
        d.querySelector("p").textContent = f.getAttribute("data-lead") === "relato" ? "Te enviaremos el relato completo a " + m + "." : "Te avisaremos de cada libro nuevo en " + m + ".";
        f.replaceWith(d);
      });
    });
    $$("form[data-wa]").forEach(function (f) {
      $$("input[type=text]", f).forEach(function (i) { i.addEventListener("input", function () { var er = i.parentNode.querySelector(".err"); if (er && i.value.trim()) er.textContent = ""; }); });
    f.addEventListener("submit", function (e) {
        e.preventDefault();
        var v = function (n) { return f.elements[n] ? f.elements[n].value.trim() : ""; };
        if (!v("nombre")) { $(".e-name", f).textContent = "Escribe tu nombre."; return; }
        $(".e-name", f).textContent = "";
        var msg = "Hola, soy " + v("nombre") + (v("institucion") ? " de " + v("institucion") : "") + ".\nMotivo: " + v("motivo") + "\n" + v("mensaje");
        window.open(wa(msg), "_blank", "noopener");
        var d = $(".wa-done", f); if (d) d.hidden = false;
      });
    });
  }

  /* ------------------------------------------------------------------
     Animaciones de aparición y contadores
  ------------------------------------------------------------------ */
  function reveal() {
    var els = $$("[data-rv]");
    if (reduce || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("seen"); io.unobserve(x.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach(function (el) {
      if (el.closest(".shelf") || el.getBoundingClientRect().top < innerHeight * 0.95) return;
      el.classList.add("rv"); io.observe(el);
    });
  }
  /* Movimiento extra: títulos palabra por palabra, imágenes que se descubren, luz que sigue al cursor */
  function dynamics() {
    if (!reduce && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } }); }, { threshold: 0.2 });
      $$(".sec-head h2, .phead h1, .sec h2.split").forEach(function (h) {
        if (h.getBoundingClientRect().top < innerHeight * 0.9 || h.querySelector("*:not(em):not(br)")) return;
        var k = 0;
        (function walk(node) {
          Array.prototype.slice.call(node.childNodes).forEach(function (n) {
            if (n.nodeType === 3) {
              var frag = document.createDocumentFragment();
              n.textContent.split(/(\s+)/).forEach(function (w) {
                if (!w) return; if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
                var o = document.createElement("span"); o.className = "w"; var i = document.createElement("span"); i.textContent = w; i.style.transitionDelay = (k++ * 0.055) + "s"; o.appendChild(i); frag.appendChild(o);
              });
              n.parentNode.replaceChild(frag, n);
            } else if (n.nodeType === 1) walk(n);
          });
        })(h);
        h.classList.add("split"); io.observe(h);
      });
      $$("figure.ph, [data-clip]").forEach(function (el) {
        if (el.getBoundingClientRect().top < innerHeight * 0.9) return; el.classList.add("clip"); io.observe(el);
      });
    }
    if (matchMedia("(hover:hover) and (pointer:fine)").matches) {
      document.addEventListener("pointermove", function (e) {
        var el = e.target.closest && e.target.closest(".band, .ex-panel, .subscribe, .card .cv, .val, .qa details, .lead-card");
        if (!el) return; var r = el.getBoundingClientRect();
        el.style.setProperty("--mx", (e.clientX - r.left) + "px"); el.style.setProperty("--my", (e.clientY - r.top) + "px");
      }, { passive: true });
    }
  }
  function counters() {
    var els = $$("[data-count]"); if (!els.length) return;
    var run = function (el) {
      var to = +el.getAttribute("data-count"), pre = el.getAttribute("data-pre") || "", suf = el.getAttribute("data-suf") || "";
      if (reduce) { el.textContent = pre + to + suf; return; }
      var t0 = null; (function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / 1400, 1); el.textContent = pre + Math.round(to * (1 - Math.pow(1 - p, 3))) + suf; if (p < 1) requestAnimationFrame(step); })(performance.now());
    };
    var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { run(x.target); io.unobserve(x.target); } }); }, { threshold: 0.5 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------------
     Partes comunes: cabecera, enlaces de WhatsApp, eventos globales
  ------------------------------------------------------------------ */
  function common() {
    var nav = $(".nav"), top = $("#totop"), sentinel = $("#topSentinel");
    if (sentinel && "IntersectionObserver" in window) {
      new IntersectionObserver(function (e) { var s = !e[0].isIntersecting; nav.classList.toggle("scrolled", s); if (top) top.classList.toggle("on", s); }).observe(sentinel);
    }
    if (top) top.addEventListener("click", function () { scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); });
    var lastY = scrollY, ticking = false;
    addEventListener("scroll", function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        var y = scrollY, open = document.querySelector(".drawer.open");
        if (!open) nav.classList.toggle("hide", y > lastY && y > 320);
        var bar = $("#scrollbar"), h = document.documentElement.scrollHeight - innerHeight;
        if (bar) bar.style.transform = "scaleX(" + (h > 0 ? Math.min(y / h, 1) : 0) + ")";
        var hb = $("#heroBg"); if (hb && !reduce && y < innerHeight) hb.style.transform = "translateY(" + (y * 0.18) + "px) scale(1.06)";
        lastY = y; ticking = false;
      });
    }, { passive: true });
    $$("[data-wa-general]").forEach(function (a) { a.href = wa("Hola, quiero información sobre los libros de " + C.autor + "."); a.target = "_blank"; a.rel = "noopener"; });
    $$("[data-mail]").forEach(function (el) { var at = C.correo.indexOf("@"); el.innerHTML = esc(C.correo.slice(0, at)) + "<wbr>" + esc(C.correo.slice(at)); });
    $$("[data-fb]").forEach(function (a) { a.href = C.facebookUrl || ("https://www.facebook.com/search/top?q=" + encodeURIComponent(C.facebook)); a.target = "_blank"; a.rel = "noopener"; });
    $$("[data-books-list]").forEach(function (el) { el.innerHTML = L.map(function (b) { return '<a href="' + bookUrl(b) + '">' + esc(b.titulo) + "</a>"; }).join(""); });
    $$("[data-nbooks]").forEach(function (el) { el.setAttribute("data-count", L.length); });

    document.addEventListener("click", function (e) {
      var t = e.target;
      var add = t.closest("[data-add]"); if (add) { e.preventDefault(); addToBag(add.getAttribute("data-add"), +(add.getAttribute("data-n") || 1), srcImg(add)); return; }
      var buy = t.closest("[data-buy]"); if (buy) { e.preventDefault(); buyNow(buy.getAttribute("data-buy"), +(buy.getAttribute("data-n") || 1)); return; }
      var qv = t.closest("[data-qv]"); if (qv) { e.preventDefault(); openQV(qv.getAttribute("data-qv")); return; }
      if (t.closest("[data-close-qv]")) { closeQV(); return; }
      var od = t.closest("[data-open-drawer]"); if (od) { e.preventDefault(); openDrawer(od.getAttribute("data-open-drawer")); return; }
      if (t.closest("[data-close-drawer]")) { closeDrawers(); return; }
      var q = t.closest("[data-q]"); if (q) { var id = q.getAttribute("data-id"); bag[id] = Math.max(0, (bag[id] || 0) + +q.getAttribute("data-q")); if (!bag[id]) delete bag[id]; saveBag(); renderBag(); return; }
      var rm = t.closest("[data-rm]"); if (rm) { delete bag[rm.getAttribute("data-rm")]; saveBag(); renderBag(); return; }
      if (t.closest("[data-theme-toggle]")) {
        var root = document.documentElement, cur = root.getAttribute("data-theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
        var next = cur === "dark" ? "light" : "dark"; root.setAttribute("data-theme", next);
        try { localStorage.setItem("fdt-tema", next); } catch (er) {}
        toast(next === "dark" ? "Modo oscuro activado" : "Modo claro activado");
        return;
      }
      var copy = t.closest("[data-copy]"); if (copy) {
        var label = copy.getAttribute("data-label") || copy.textContent; copy.setAttribute("data-label", label);
        var reset = function () { setTimeout(function () { copy.textContent = label; }, 2000); };
        var selectMail = function () { var el = $("[data-mail]", copy.closest(".ccard") || document); if (el) { var r = document.createRange(); r.selectNodeContents(el); var sl = getSelection(); sl.removeAllRanges(); sl.addRange(r); } copy.textContent = "Correo seleccionado"; reset(); };
        try { navigator.clipboard.writeText(C.correo).then(function () { copy.textContent = "Copiado"; toast("Correo copiado"); reset(); }, selectMail); } catch (er) { selectMail(); }
      }
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") { if (!$("#quickview").hidden) closeQV(); else closeDrawers(); } });
    renderBag(); bindForms(); bindCheckout(); dynamics();
  }

  /* ==================================================================
     PÁGINAS
  ================================================================== */
  var pages = {};

  /* ---------- Inicio ---------- */
  /* Vitrina 3D de la portada: cada libro en su propio recuadro, con su propio libro 3D */
  function showcase() {
    var list = $("#scList"); if (!list) return;
    var two = function (n) { return (n < 10 ? "0" : "") + n; };
    list.innerHTML = L.map(function (b, i) {
      var f = (b.ficha || []).slice(0, 3);
      return '<article class="sc-book' + (i % 2 ? " rev" : "") + '" style="--tint:' + (b.color || "") + '">'
        + '<div class="sc-stage-box"><span class="sc-num" aria-hidden="true">' + two(i + 1) + '</span><div class="stage sc-stage">' + book3d(b).replace(/^<div class="stage[^"]*">/, "").replace(/<\/div>$/, "") + '</div><span class="sc-hint">Arrástralo para girarlo</span></div>'
        + '<div class="sc-txt"><span class="kicker">Libro ' + two(i + 1) + " de " + two(L.length) + " · " + esc(b.genero) + "</span><h3>" + esc(b.titulo) + "</h3>"
        + '<p class="hook">' + esc(b.gancho) + "</p>"
        + (b.sinopsis && b.sinopsis[0] ? "<p class='syn'>" + esc(b.sinopsis[0]) + "</p>" : "")
        + (f.length ? "<dl>" + f.map(function (x) { return "<div><dt>" + esc(x[0]) + "</dt><dd>" + esc(x[1]) + "</dd></div>"; }).join("") + "</dl>" : "")
        + '<div class="ctas"><button class="btn btn-acc" type="button" data-add="' + b.id + '">' + BAG + 'Agregar al pedido</button><button class="btn btn-line" type="button" data-buy="' + b.id + '">Comprar ya</button><a class="link" href="' + bookUrl(b) + '">Ver la ficha <span class="ar">→</span></a></div></div></article>';
    }).join("");
    var blocks = $$(".sc-book", list), views = [];
    function upd() {
      var vh = innerHeight;
      blocks.forEach(function (bl, k) {
        var v = views[k]; if (!v) return;
        var r = bl.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return;
        var p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));

      });
    }
    var io = "IntersectionObserver" in window ? new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (!x.isIntersecting) return; io.unobserve(x.target);
        var k = blocks.indexOf(x.target);
        glViewer({ mode: "drag", still: true, baseY: k % 2 ? 0.38 : -0.38 }, function (v) { views[k] = v; v.mount($(".sc-stage", x.target)).setBook(L[k]); });
      });
    }, { rootMargin: "400px 0px" }) : null;
    blocks.forEach(function (bl) { if (io) io.observe(bl); });
    addEventListener("scroll", function () { requestAnimationFrame(upd); }, { passive: true });
  }

  pages.inicio = function () {
    var feat = L.filter(function (b) { return b.destacado; }); if (!feat.length) feat = [L[0]];
    var hero = $("#hero"), bg = $("#heroBg"), slot = $("#heroSlot"), prog = $("#heroProg"), cur = 0, timer = null, DUR = 8000;
    bg.innerHTML = feat.map(function (b) { return '<img src="' + (b.fondo || b.portada) + '" alt="">'; }).join("");
    prog.innerHTML = feat.map(function (b, i) { return '<button type="button" aria-label="' + esc(b.titulo) + '"><i></i></button>'; }).join("");
    prog.style.setProperty("--dur", DUR + "ms");
    function words(t) { return t.split(" ").map(function (w) { return '<span class="ln"><span>' + esc(w) + "</span></span>"; }).join(" "); }
    var heroV = null, heroWait = false;
    function show(i, dir) {
      cur = (i + feat.length) % feat.length; var b = feat[cur];
      slot.classList.remove("in");
      setTimeout(function () {
        slot.innerHTML = '<div class="hero-copy"><span class="badge">' + (b.disponible ? "Novedad · " + esc(b.salida) : "Preventa") + "</span>"
          + "<h1" + (b.titulo.length > 22 ? " class='long'" : "") + ">" + words(b.titulo) + "</h1><p class='sub'>" + esc(b.subtitulo) + "</p><p class='hook'>" + esc(b.gancho) + "</p>"
          + "<div class='price-line'><b>" + esc(price(b)) + "</b><span>Pago y envío por WhatsApp</span></div>"
          + "<div class='ctas'><button class='btn btn-acc' type='button' data-add='" + b.id + "'>" + BAG + "Agregar al pedido</button><button class='btn btn-ghost-light' type='button' data-buy='" + b.id + "'>Comprar ya</button><a class='link light' href='" + bookUrl(b) + "'>Ver el libro <span class='ar'>→</span></a></div></div>"
          + book3d(b);
        $$(".hero-copy h1 .ln > span", slot).forEach(function (s, k) { s.style.transitionDelay = (0.08 + k * 0.07) + "s"; });
        tilt($(".stage", slot));
        var stg = $(".stage", slot);
        if (heroV) heroV.mount(stg).setBook(b, dir || 1);
        else if (!heroWait) { heroWait = true; setTimeout(function () { glViewer({ mode: "hover" }, function (v) { heroV = v; v.mount($(".stage", slot)).setBook(feat[cur]); }); }, 700); }
        requestAnimationFrame(function () { requestAnimationFrame(function () { slot.classList.add("in"); }); });
      }, slot.innerHTML ? 260 : 0);
      $$("img", bg).forEach(function (im, k) { im.classList.toggle("on", k === cur); });
      $$("button", prog).forEach(function (p, k) { p.classList.remove("on"); void p.offsetWidth; if (k === cur) p.classList.add("on"); });
    }
    function play() { clearInterval(timer); if (!reduce && feat.length > 1) timer = setInterval(function () { show(cur + 1, 1); }, DUR); }
    function go(i, d) { show(i, d || (i < cur ? -1 : 1)); if (!hero.classList.contains("paused")) play(); }
    $$("button", prog).forEach(function (p, k) { p.addEventListener("click", function () { go(k); }); });
    $("#heroPrev").addEventListener("click", function () { go(cur - 1, -1); });
    $("#heroNext").addEventListener("click", function () { go(cur + 1, 1); });
    if (feat.length < 2) $(".hero-ctrl").hidden = true;
    hero.addEventListener("mouseenter", function () { clearInterval(timer); hero.classList.add("paused"); });
    function restartBar() { $$("button", prog).forEach(function (p, k) { p.classList.remove("on"); void p.offsetWidth; if (k === cur) p.classList.add("on"); }); }
    hero.addEventListener("mouseleave", function () { hero.classList.remove("paused"); restartBar(); play(); });
    document.addEventListener("visibilitychange", function () { if (document.hidden) clearInterval(timer); else { restartBar(); play(); } });
    show(0); play();

    /* Estantería deslizable */
    var shelf = $("#homeShelf"), bar = $("#shelfBar"), sp = $("#shelfPrev"), sn = $("#shelfNext");
    shelf.innerHTML = L.map(card).join("") + soonCard;
    function step() { var c = shelf.firstElementChild; return c ? c.getBoundingClientRect().width + 24 : 300; }
    function syncShelf() {
      var max = shelf.scrollWidth - shelf.clientWidth, x = shelf.scrollLeft, vis = shelf.clientWidth / (shelf.scrollWidth || 1);
      bar.style.width = Math.max(vis * 100, 12) + "%";
      bar.style.transform = "translateX(" + (max > 0 ? (x / max) * ((1 / Math.max(vis, .12)) - 1) * 100 : 0) + "%)";
      sp.disabled = x <= 2; sn.disabled = x >= max - 2;
      bar.parentNode.hidden = max <= 2;
      sp.parentNode.hidden = max <= 2;
    }
    sp.addEventListener("click", function () { shelf.scrollBy({ left: -step(), behavior: reduce ? "auto" : "smooth" }); });
    sn.addEventListener("click", function () { shelf.scrollBy({ left: step(), behavior: reduce ? "auto" : "smooth" }); });
    shelf.addEventListener("scroll", function () { requestAnimationFrame(syncShelf); }, { passive: true });
    addEventListener("resize", syncShelf); syncShelf();
    shelf.addEventListener("keydown", function (e) { if (e.key === "ArrowRight") { e.preventDefault(); sn.click(); } if (e.key === "ArrowLeft") { e.preventDefault(); sp.click(); } });
    /* Arrastrar con el mouse (en pantallas táctiles se desliza con el dedo) */
    var drag = null;
    shelf.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse" || e.button !== 0) return; drag = { x: e.clientX, left: shelf.scrollLeft, moved: false }; });
    addEventListener("pointermove", function (e) { if (!drag) return; var dx = e.clientX - drag.x; if (Math.abs(dx) > 5 && !drag.moved) { drag.moved = true; shelf.classList.add("dragging"); } if (drag.moved) shelf.scrollLeft = drag.left - dx; });
    addEventListener("pointerup", function () { if (!drag) return; var moved = drag.moved; drag = null; if (moved) { shelf.classList.remove("dragging"); var w = step(); shelf.scrollTo({ left: Math.round(shelf.scrollLeft / w) * w, behavior: reduce ? "auto" : "smooth" }); shelf.addEventListener("click", function stop(ev) { ev.stopPropagation(); ev.preventDefault(); shelf.removeEventListener("click", stop, true); }, true); } });

    /* Vitrina: cada libro en su propio recuadro */
    showcase();
  };

  /* ---------- Catálogo ---------- */
  pages.libros = function () {
    var grid = $("#catGrid"), chips = $("#catChips"), q = $("#catSearch"), sort = $("#catSort"), res = $("#catResult"), active = "Todos", tema = null;
    var T = themes(), tbox = $("#catThemes");
    tbox.innerHTML = T.map(function (th) { return '<a href="#' + th.slug + '" data-slug="' + th.slug + '">' + esc(th.nombre) + "</a>"; }).join("");
    function readHash() { var h = location.hash.replace("#", ""); tema = null; T.forEach(function (th) { if (th.slug === h) tema = th; }); $$("a", tbox).forEach(function (a) { a.setAttribute("aria-current", tema && a.getAttribute("data-slug") === tema.slug ? "true" : "false"); }); }
    addEventListener("hashchange", function () { readHash(); render(); });
    tbox.addEventListener("click", function (e) { var a = e.target.closest("a"); if (a && tema && a.getAttribute("data-slug") === tema.slug) { e.preventDefault(); history.replaceState(null, "", location.pathname); readHash(); render(); } });
    readHash();
    var gens = ["Todos"].concat(L.map(function (b) { return b.genero; }).filter(function (g, i, a) { return a.indexOf(g) === i; }));
    chips.innerHTML = gens.map(function (g) { return '<button type="button" aria-pressed="' + (g === "Todos") + '">' + esc(g) + "</button>"; }).join("");
    var norm = function (s) { return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); };
    function render() {
      var term = norm(q.value.trim());
      var list = L.filter(function (b) {
        return (active === "Todos" || b.genero === active) && (!tema || (b.temas || []).indexOf(tema.nombre) > -1) && (!term || norm([b.titulo, b.subtitulo, b.genero, b.gancho, (b.temas || []).join(" ")].join(" ")).indexOf(term) > -1);
      });
      var s = sort.value;
      if (s === "az") list.sort(function (a, b) { return a.titulo.localeCompare(b.titulo); });
      if (s === "precio") list.sort(function (a, b) { return (a.precio == null ? 1e9 : a.precio) - (b.precio == null ? 1e9 : b.precio); });
      res.textContent = list.length + (list.length === 1 ? " libro publicado" : " libros publicados") + (active !== "Todos" ? " en " + active : "") + (tema ? " sobre " + tema.nombre : "") + (term ? " para «" + q.value.trim() + "»" : "");
      grid.innerHTML = list.length ? list.map(card).join("") + (active === "Todos" && !term && !tema ? soonCard : "")
        : '<div class="empty"><b>No encontramos ese libro</b>Prueba con otra palabra o elige «Todos».</div>';
    }
    if (!L.some(function (b) { return b.precio != null; })) { var op = $('option[value="precio"]', sort); if (op) op.remove(); }
    chips.addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) return; active = b.textContent; $$("button", chips).forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); render(); });
    q.addEventListener("input", render); sort.addEventListener("change", render);
    render();
  };

  /* ---------- Ficha de libro ---------- */
  pages.libro = function () {
    var pdpV = null, curB = null, cur0 = function () { return curB; };
    function draw() {
      var id = location.hash.replace("#", ""), b = id ? byId(id) : L[0], qty = 1; curB = b;
      if (!b) {
        document.title = "Libro no encontrado · " + C.autor; $("#pdpCrumb").textContent = "No encontrado";
        $("#pdp").innerHTML = "<div class='notfound' style='grid-column:1/-1'><h1>No encontramos ese libro</h1><p class='muted'>Puede que el enlace esté mal escrito o que el libro aún no se haya publicado.</p><a class='btn btn-acc' href='libros.html'>Ver todos los libros</a></div>";
        $("#related").innerHTML = L.map(card).join(""); return;
      }
      document.title = b.titulo + " · " + C.autor;
      $("#pdpCrumb").textContent = b.titulo;
      $("#pdpHead").style.setProperty("--tint", b.color || "");
      $("#pdp").innerHTML = '<div class="pdp-media" style="--tint:' + (b.color || "") + '">' + book3d(b) + '<span class="hint">Mueve el mouse sobre el libro</span></div>'
        + '<div class="pdp-info"><span class="kicker">' + esc(b.genero) + " · " + esc(b.edicion) + "</span><h1>" + esc(b.titulo) + "</h1><p class='sub'>" + esc(b.subtitulo) + "</p>"
        + "<p class='by'>de <a href='autor.html'>" + esc(C.autor) + "</a> · Salida: " + esc(b.salida) + "</p>"
        + "<div class='buybox'><div class='price'><b>" + esc(price(b)) + "</b><span>Pago y envío coordinados por WhatsApp</span></div>"
        + "<div class='row'><div class='qty' aria-label='Cantidad'><button type='button' id='qMinus' aria-label='Menos'>−</button><span id='qVal'>1</span><button type='button' id='qPlus' aria-label='Más'>+</button></div>"
        + "<button class='btn btn-acc' type='button' id='pdpAdd'>" + BAG + (b.disponible ? "Agregar al pedido" : "Reservar") + "</button>"
        + "<button class='btn btn-line' type='button' id='pdpBuy'>" + WA + "Comprar ya</button></div>"
        + "<ul class='checks'>" + b.ventajas.map(function (v) { return "<li>" + esc(v) + "</li>"; }).join("") + "</ul></div>"
        + "<div class='tabs' role='tablist'><button role='tab' aria-selected='true' data-tab='s'>Sinopsis</button><button role='tab' aria-selected='false' data-tab='c'>Contenido</button><button role='tab' aria-selected='false' data-tab='f'>Ficha técnica</button></div>"
        + "<div id='tabBox'></div>"
        + "<div class='ctas'>" + (b.fragmento ? "<a class='btn btn-line' href='leer.html#" + b.fragmento + "'>Leer un fragmento gratis <span class='ar'>→</span></a>" : "") + "</div>"
        + (b.extra ? "<a class='extra' href='" + esc(b.extra.url) + "'><b>" + esc(b.extra.titulo) + "</b><span>" + esc(b.extra.texto) + "</span><span class='ar'>→</span></a>" : "")
        + "</div>";
      var panes = {
        s: "<div class='syn'>" + b.sinopsis.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") + "</div>" + (b.cita ? "<blockquote class='pull' style='margin-top:1.5rem'>«" + esc(b.cita.texto) + "»<cite>" + esc(b.cita.autor) + "</cite></blockquote>" : ""),
        c: "<ol class='toc'>" + b.contenido.map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("") + "</ol>",
        f: "<dl class='specs'>" + b.ficha.map(function (f) { return "<div><dt>" + esc(f[0]) + "</dt><dd>" + esc(f[1]) + "</dd></div>"; }).join("") + "</dl>" + (b.nota ? "<p class='note' style='margin-top:1rem'>" + esc(b.nota) + "</p>" : "")
      };
      var box = $("#tabBox"); box.innerHTML = "<div class='tabpanel'>" + panes.s + "</div>";
      $$("[data-tab]").forEach(function (t) { t.addEventListener("click", function () { $$("[data-tab]").forEach(function (x) { x.setAttribute("aria-selected", x === t); }); box.innerHTML = "<div class='tabpanel'>" + panes[t.getAttribute("data-tab")] + "</div>"; }); });
      $("#qMinus").onclick = function () { qty = Math.max(1, qty - 1); $("#qVal").textContent = qty; };
      $("#qPlus").onclick = function () { qty++; $("#qVal").textContent = qty; };
      $("#pdpAdd").onclick = function () { addToBag(b.id, qty, $(".pdp-media img")); };
      $("#pdpBuy").onclick = function () { buyNow(b.id, qty); };
      tilt($(".pdp-media .stage"));
      var ps = $(".pdp-media .stage");
      if (pdpV) pdpV.mount(ps).setBook(b, 1);
      else glViewer({ mode: "drag", baseY: -0.35 }, function (v) { pdpV = v; v.mount($(".pdp-media .stage")).setBook(cur0()); $(".pdp-media .hint").textContent = "Arrastra el libro para girarlo"; });
      $("#related").innerHTML = L.filter(function (x) { return x.id !== b.id; }).map(card).join("");
      scrollTo(0, 0);
    }
    addEventListener("hashchange", draw); draw();
  };

  /* ---------- Lectura gratis ---------- */
  pages.leer = function () {
    var F = S.fragmentos, keys = Object.keys(F), tabs = $("#readTabs"), page = $("#readPage"), size = 1.25;
    tabs.innerHTML = keys.map(function (k) { var b = byId(F[k].libro); return '<button type="button" role="tab" data-k="' + k + '">' + esc(b ? b.titulo : F[k].titulo) + "</button>"; }).join("");
    function show(k) {
      if (!F[k]) k = keys[0]; var fr = F[k], b = byId(fr.libro);
      $$("button", tabs).forEach(function (x) { x.setAttribute("aria-selected", x.getAttribute("data-k") === k); });
      $(".content", page).innerHTML = "<p class='p-book'>Fragmento de " + esc(b.titulo) + "</p><h2 class='p-title'>" + esc(fr.titulo) + "</h2><div class='text'>" + fr.parrafos.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") + "</div><div class='fade'></div>";
      $("#gateBook").textContent = b.titulo;
      $("#gateBuy").setAttribute("data-add", b.id);
      $("#gateLink").href = bookUrl(b);
      if (location.hash !== "#" + k) history.replaceState(null, "", "#" + k);
    }
    tabs.addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) show(b.getAttribute("data-k")); });
    $("#fsMinus").onclick = function () { size = Math.max(1, size - 0.125); page.style.setProperty("--fs", size + "rem"); };
    $("#fsPlus").onclick = function () { size = Math.min(1.75, size + 0.125); page.style.setProperty("--fs", size + "rem"); };
    $$("[data-theme-btn]").forEach(function (t) { t.addEventListener("click", function () { page.className = "page " + t.getAttribute("data-theme-btn"); $$("[data-theme-btn]").forEach(function (x) { x.setAttribute("aria-pressed", x === t); }); }); });
    var bar = $("#readbar");
    function onScroll() { var r = page.getBoundingClientRect(), h = r.height - innerHeight * 0.5; var p = Math.min(Math.max(-r.top / (h || 1), 0), 1); bar.style.width = (p * 100) + "%"; }
    addEventListener("scroll", function () { requestAnimationFrame(onScroll); }, { passive: true });
    show(location.hash.replace("#", ""));
  };

  /* ---------- Universo amazónico ---------- */
  pages.universo = function () {
    var cr = S.criaturas, sizes = ["w7", "w5", "w4", "w4", "w4", "w6", "w6"];
    $("#uniCreatures").innerHTML = cr.map(function (c, i) {
      return '<button type="button" class="creature ' + (sizes[i] || "w4") + '" aria-expanded="false" data-rv data-d="' + (i % 3) + '"><img src="' + c.imagen + '" alt="" loading="lazy"><span class="in"><small>Del relato «' + esc(c.relato) + '»</small><span class="h">' + esc(c.nombre) + '</span><span class="p">' + esc(c.texto) + "</span></span></button>";
    }).join("");
    $("#uniCreatures").addEventListener("click", function (e) { var c = e.target.closest(".creature"); if (c) { var o = c.classList.toggle("open"); c.setAttribute("aria-expanded", o); } });

    var G = S.glosario.slice().sort(function (a, b) { return a[0].localeCompare(b[0]); }), letter = "", q = $("#gSearch"), box = $("#gloss"), az = $("#az");
    var norm = function (s) { return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); };
    var have = {}; G.forEach(function (g) { have[norm(g[0])[0].toUpperCase()] = 1; });
    az.innerHTML = '<button type="button" aria-pressed="true" data-l="">Todas</button>' + "ABCDEFGHIJLMNOPQRSTUVY".split("").map(function (l) { return '<button type="button" aria-pressed="false" data-l="' + l + '"' + (have[l] ? "" : " disabled") + ">" + l + "</button>"; }).join("");
    az.querySelector("button").style.width = "auto"; az.querySelector("button").style.padding = "0 .9rem"; az.querySelector("button").style.borderRadius = "999px";
    function render() {
      var t = norm(q.value.trim());
      var list = G.filter(function (g) { var n = norm(g[0]); return (!letter || n[0].toUpperCase() === letter) && (!t || n.indexOf(t) > -1 || norm(g[1]).indexOf(t) > -1); });
      $("#gCount").textContent = list.length + (list.length === 1 ? " palabra" : " palabras");
      box.innerHTML = list.length ? list.map(function (g) {
        return '<button type="button" class="word" aria-label="' + esc(g[0]) + ': ' + esc(g[1]) + '"><span class="inner"><span class="f"><b>' + esc(g[0]) + '</b><small><span>Ver significado</span><span>' + esc(g[0][0]) + '</span></small></span><span class="b"><b>' + esc(g[0]) + '</b><span class="p">' + esc(g[1]) + "</span></span></span></button>";
      }).join("") : '<div class="empty"><b>No está en el glosario</b>Prueba con otra palabra.</div>';
    }
    box.addEventListener("click", function (e) { var w = e.target.closest(".word"); if (w) w.classList.toggle("flip"); });
    az.addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b || b.disabled) return; letter = b.getAttribute("data-l"); $$("button", az).forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); render(); });
    q.addEventListener("input", render); render();
  };

  /* ---------- Autor ---------- */
  pages.autor = function () {
    var tl = $("#timeline"); if (!tl) return;
    var fill = $(".fill", tl), items = $$(".t-item", tl);
    function upd() {
      var r = tl.getBoundingClientRect(), mid = innerHeight * 0.6, h = Math.min(Math.max(mid - r.top, 0), r.height);
      fill.style.height = h + "px";
      items.forEach(function (it) { it.classList.toggle("lit", it.getBoundingClientRect().top < mid); });
    }
    addEventListener("scroll", function () { requestAnimationFrame(upd); }, { passive: true }); upd();
    $("#autorBooks").innerHTML = L.map(card).join("");
  };

  /* ---------- Noticias ---------- */
  pages.noticias = function () {
    var N = S.noticias;
    $("#newsGrid").innerHTML = N.map(function (n, i) {
      var b = n.libro ? byId(n.libro) : null;
      var foot = b ? '<a class="link" href="' + bookUrl(b) + '">Ver el libro <span class="ar">→</span></a>' : '<a class="link" href="index.html#suscribirse">Quiero enterarme <span class="ar">→</span></a>';
      if (i === 0) return '<article class="post big" data-rv><div class="im"><img src="' + (b ? b.fondo : "assets/img/paisaje-rio-atardecer.jpg") + '" alt=""></div><div class="tx"><div class="k"><i>' + esc(n.tipo) + "</i><span>" + esc(n.fecha) + "</span></div><h3>" + esc(n.titulo) + "</h3><p>" + esc(n.texto) + "</p>" + foot + "</div></article>";
      return '<article class="post" data-rv data-d="' + i + '"><div class="k"><i>' + esc(n.tipo) + "</i><span>" + esc(n.fecha) + "</span></div><h3>" + esc(n.titulo) + "</h3><p>" + esc(n.texto) + "</p>" + foot + "</article>";
    }).join("");
  };

  /* ---------- Contacto ---------- */
  pages.contacto = function () {};

  /* ---------- Arranque ---------- */
  common();
  var pm = document.querySelector('meta[name="page"]'), p = document.body.getAttribute("data-page") || (pm && pm.content); if (pages[p]) pages[p]();
  reveal(); counters();

})();
