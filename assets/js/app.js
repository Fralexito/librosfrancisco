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
     Bolsa de pedido (se guarda en este navegador)
  ------------------------------------------------------------------ */
  var KEY = "fdt-bolsa";
  var bag = (function () { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } })();
  function saveBag() { try { localStorage.setItem(KEY, JSON.stringify(bag)); } catch (e) {} }
  function bagCount() { var n = 0; for (var k in bag) n += bag[k]; return n; }
  function addToBag(id, n) {
    bag[id] = (bag[id] || 0) + (n || 1); saveBag(); renderBag();
    var cnt = $("#bagCount"); if (cnt) { cnt.classList.remove("bump"); void cnt.offsetWidth; cnt.classList.add("bump"); }
    var b = byId(id); toast("Agregaste «" + b.titulo + "» a tu pedido", "Ver pedido", function () { openDrawer("bag"); });
  }
  function renderBag() {
    var n = bagCount(), cnt = $("#bagCount");
    if (cnt) { cnt.textContent = n; cnt.classList.toggle("on", n > 0); }
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
  }
  function orderMessage() {
    var lines = Object.keys(bag).filter(function (k) { return bag[k] > 0 && byId(k); }).map(function (id) { return "• " + bag[id] + " × " + byId(id).titulo; });
    return "Hola, quiero hacer este pedido de libros de " + C.autor + ":\n" + lines.join("\n") + "\n¿Me pueden indicar el precio final, las formas de pago y el envío?";
  }

  /* ------------------------------------------------------------------
     Paneles laterales (menú móvil y pedido)
  ------------------------------------------------------------------ */
  var lastFocus = null;
  function openDrawer(name) {
    var d = $("#drawer-" + name); if (!d) return; lastFocus = document.activeElement;
    d.classList.add("open"); d.removeAttribute("inert"); document.body.style.overflow = "hidden";
    $$(".mnav a", d).forEach(function (a, i) { a.style.transitionDelay = (0.05 + i * 0.04) + "s"; });
    var f = $(".panel button, .panel a", d); if (f) setTimeout(function () { f.focus(); }, 50);
  }
  function closeDrawers() {
    $$(".drawer.open").forEach(function (d) { d.classList.remove("open"); d.setAttribute("inert", ""); });
    document.body.style.overflow = ""; if (lastFocus) lastFocus.focus();
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
      + '<div class="quick"><button class="btn btn-acc btn-sm" type="button" data-add="' + b.id + '">' + BAG + 'Agregar</button><a class="btn btn-light btn-sm" href="' + bookUrl(b) + '">Ver libro</a></div></div>'
      + '<div class="body"><span class="cat">' + esc(b.genero) + '</span><h3><a href="' + bookUrl(b) + '">' + esc(b.titulo) + '</a></h3>'
      + '<span class="by">' + esc(C.autor) + ' · ' + esc(b.edicion) + '</span>'
      + '<div class="pr"><b>' + esc(price(b)) + '</b><span>' + esc(b.salida) + '</span></div></div></article>';
  }
  var soonCard = '<article class="card soon" data-rv><div class="cv"><span>Próximo libro<br>en camino</span></div><div class="body"><span class="cat">Muy pronto</span><h3>Nuevo título</h3><span class="by">Suscríbete para enterarte primero</span><div class="pr"><a class="link" href="index.html#suscribirse">Avisarme <span class="ar">→</span></a></div></div></article>';

  /* ------------------------------------------------------------------
     Formularios de suscripción
  ------------------------------------------------------------------ */
  function bindForms() {
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    $$("form[data-lead]").forEach(function (f) {
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
      if (el.getBoundingClientRect().top < innerHeight * 0.95) return;
      el.classList.add("rv"); io.observe(el);
    });
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
    $$("[data-wa-general]").forEach(function (a) { a.href = wa("Hola, quiero información sobre los libros de " + C.autor + "."); a.target = "_blank"; a.rel = "noopener"; });
    $$("[data-mail]").forEach(function (el) { el.textContent = C.correo; });
    $$("[data-books-list]").forEach(function (el) { el.innerHTML = L.map(function (b) { return '<a href="' + bookUrl(b) + '">' + esc(b.titulo) + "</a>"; }).join(""); });
    $$("[data-nbooks]").forEach(function (el) { el.setAttribute("data-count", L.length); });

    document.addEventListener("click", function (e) {
      var t = e.target;
      var add = t.closest("[data-add]"); if (add) { e.preventDefault(); addToBag(add.getAttribute("data-add"), +(add.getAttribute("data-n") || 1)); return; }
      var od = t.closest("[data-open-drawer]"); if (od) { e.preventDefault(); openDrawer(od.getAttribute("data-open-drawer")); return; }
      if (t.closest("[data-close-drawer]")) { closeDrawers(); return; }
      var q = t.closest("[data-q]"); if (q) { var id = q.getAttribute("data-id"); bag[id] = Math.max(0, (bag[id] || 0) + +q.getAttribute("data-q")); if (!bag[id]) delete bag[id]; saveBag(); renderBag(); return; }
      var rm = t.closest("[data-rm]"); if (rm) { delete bag[rm.getAttribute("data-rm")]; saveBag(); renderBag(); return; }
      if (t.closest("#sendOrder")) { e.preventDefault(); window.open(wa(orderMessage()), "_blank", "noopener"); return; }
      var btn = t.closest(".btn"); if (btn && !reduce) {
        var r = btn.getBoundingClientRect(), s = Math.max(r.width, r.height), sp = document.createElement("span");
        sp.className = "ripple"; sp.style.cssText = "width:" + s + "px;height:" + s + "px;left:" + (e.clientX - r.left - s / 2) + "px;top:" + (e.clientY - r.top - s / 2) + "px";
        btn.appendChild(sp); setTimeout(function () { sp.remove(); }, 650);
      }
      if (t.closest("[data-theme-toggle]")) {
        var root = document.documentElement, cur = root.getAttribute("data-theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
        var next = cur === "dark" ? "light" : "dark"; root.setAttribute("data-theme", next);
        try { localStorage.setItem("fdt-tema", next); } catch (er) {}
        toast(next === "dark" ? "Modo oscuro activado" : "Modo claro activado");
        return;
      }
      var copy = t.closest("[data-copy]"); if (copy) {
        var txt = C.correo, done = function () { copy.textContent = "Copiado"; };
        try { navigator.clipboard.writeText(txt).then(done, function () { copy.textContent = txt; }); } catch (er) { copy.textContent = txt; }
      }
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeDrawers(); });
    renderBag(); bindForms();
  }

  /* ==================================================================
     PÁGINAS
  ================================================================== */
  var pages = {};

  /* ---------- Inicio ---------- */
  pages.inicio = function () {
    var feat = L.filter(function (b) { return b.destacado; }); if (!feat.length) feat = [L[0]];
    var hero = $("#hero"), bg = $("#heroBg"), slot = $("#heroSlot"), prog = $("#heroProg"), cur = 0, timer = null, DUR = 8000;
    bg.innerHTML = feat.map(function (b) { return '<img src="' + (b.fondo || b.portada) + '" alt="">'; }).join("");
    prog.innerHTML = feat.map(function (b, i) { return '<button type="button" aria-label="' + esc(b.titulo) + '"><i></i></button>'; }).join("");
    prog.style.setProperty("--dur", DUR + "ms");
    function words(t) { return t.split(" ").map(function (w) { return '<span class="ln"><span>' + esc(w) + "</span></span>"; }).join(" "); }
    function show(i) {
      cur = (i + feat.length) % feat.length; var b = feat[cur];
      slot.classList.remove("in");
      setTimeout(function () {
        slot.innerHTML = '<div class="hero-copy"><span class="badge">' + (b.disponible ? "Novedad · " + esc(b.salida) : "Preventa") + "</span>"
          + "<h1>" + words(b.titulo) + "</h1><p class='sub'>" + esc(b.subtitulo) + "</p><p class='hook'>" + esc(b.gancho) + "</p>"
          + "<div class='price-line'><b>" + esc(price(b)) + "</b><span>Pago y envío por WhatsApp</span></div>"
          + "<div class='ctas'><button class='btn btn-acc' type='button' data-add='" + b.id + "'>" + BAG + "Agregar al pedido</button><a class='btn btn-ghost-light' href='" + bookUrl(b) + "'>Ver el libro</a></div></div>"
          + book3d(b);
        $$(".hero-copy h1 .ln > span", slot).forEach(function (s, k) { s.style.transitionDelay = (0.08 + k * 0.07) + "s"; });
        tilt($(".stage", slot));
        requestAnimationFrame(function () { requestAnimationFrame(function () { slot.classList.add("in"); }); });
      }, slot.innerHTML ? 260 : 0);
      $$("img", bg).forEach(function (im, k) { im.classList.toggle("on", k === cur); });
      $$("button", prog).forEach(function (p, k) { p.classList.remove("on"); void p.offsetWidth; if (k === cur) p.classList.add("on"); });
    }
    function play() { clearInterval(timer); if (!reduce && feat.length > 1) timer = setInterval(function () { show(cur + 1); }, DUR); }
    $$("button", prog).forEach(function (p, k) { p.addEventListener("click", function () { show(k); play(); }); });
    $("#heroPrev").addEventListener("click", function () { show(cur - 1); play(); });
    $("#heroNext").addEventListener("click", function () { show(cur + 1); play(); });
    if (feat.length < 2) $(".hero-ctrl").hidden = true;
    hero.addEventListener("mouseenter", function () { clearInterval(timer); hero.classList.add("paused"); });
    hero.addEventListener("mouseleave", function () { hero.classList.remove("paused"); show(cur); play(); });
    show(0); play();

    $("#homeGrid").innerHTML = L.map(card).join("") + soonCard;

    var cr = S.criaturas, sizes = ["w7", "w5", "w4", "w4", "w4"];
    $("#homeCreatures").innerHTML = cr.slice(0, 5).map(function (c, i) {
      return '<a class="creature ' + sizes[i] + '" href="universo.html" data-rv data-d="' + (i % 3) + '"><img src="' + c.imagen + '" alt="" loading="lazy"><div class="in"><small>' + esc(c.relato) + "</small><h3>" + esc(c.nombre) + "</h3><p>" + esc(c.texto) + "</p></div></a>";
    }).join("");
    var words2 = S.glosario.slice(0, 14).map(function (g) { return "<span>" + esc(g[0]) + "<i>·</i></span>"; }).join("");
    $("#homeTrack").innerHTML = words2 + (reduce ? "" : words2.replace(/<span>/g, '<span aria-hidden="true">'));
  };

  /* ---------- Catálogo ---------- */
  pages.libros = function () {
    var grid = $("#catGrid"), chips = $("#catChips"), q = $("#catSearch"), sort = $("#catSort"), res = $("#catResult"), active = "Todos";
    var gens = ["Todos"].concat(L.map(function (b) { return b.genero; }).filter(function (g, i, a) { return a.indexOf(g) === i; }));
    chips.innerHTML = gens.map(function (g) { return '<button type="button" aria-pressed="' + (g === "Todos") + '">' + esc(g) + "</button>"; }).join("");
    var norm = function (s) { return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); };
    function render() {
      var term = norm(q.value.trim());
      var list = L.filter(function (b) {
        return (active === "Todos" || b.genero === active) && (!term || norm([b.titulo, b.subtitulo, b.genero, b.gancho].join(" ")).indexOf(term) > -1);
      });
      var s = sort.value;
      if (s === "az") list.sort(function (a, b) { return a.titulo.localeCompare(b.titulo); });
      if (s === "precio") list.sort(function (a, b) { return (a.precio == null ? 1e9 : a.precio) - (b.precio == null ? 1e9 : b.precio); });
      res.textContent = list.length + (list.length === 1 ? " libro" : " libros") + (active !== "Todos" ? " en " + active : "") + (term ? " para «" + q.value.trim() + "»" : "");
      grid.innerHTML = list.length ? list.map(card).join("") + (active === "Todos" && !term ? soonCard : "")
        : '<div class="empty"><b>No encontramos ese libro</b>Prueba con otra palabra o elige «Todos».</div>';
    }
    chips.addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) return; active = b.textContent; $$("button", chips).forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); render(); });
    q.addEventListener("input", render); sort.addEventListener("change", render);
    render();
  };

  /* ---------- Ficha de libro ---------- */
  pages.libro = function () {
    function draw() {
      var id = location.hash.replace("#", ""), b = byId(id) || L[0], qty = 1;
      document.title = b.titulo + " · " + C.autor;
      $("#pdpCrumb").textContent = b.titulo;
      $("#pdpHead").style.setProperty("--tint", b.color || "");
      $("#pdp").innerHTML = '<div class="pdp-media" style="--tint:' + (b.color || "") + '">' + book3d(b) + '<span class="hint">Mueve el mouse sobre el libro</span></div>'
        + '<div class="pdp-info"><span class="kicker">' + esc(b.genero) + " · " + esc(b.edicion) + "</span><h1>" + esc(b.titulo) + "</h1><p class='sub'>" + esc(b.subtitulo) + "</p>"
        + "<p class='by'>de <a href='autor.html'>" + esc(C.autor) + "</a> · Salida: " + esc(b.salida) + "</p>"
        + "<div class='buybox'><div class='price'><b>" + esc(price(b)) + "</b><span>Pago y envío coordinados por WhatsApp</span></div>"
        + "<div class='row'><div class='qty' aria-label='Cantidad'><button type='button' id='qMinus' aria-label='Menos'>−</button><span id='qVal'>1</span><button type='button' id='qPlus' aria-label='Más'>+</button></div>"
        + "<button class='btn btn-acc' type='button' id='pdpAdd'>" + BAG + (b.disponible ? "Agregar al pedido" : "Reservar") + "</button>"
        + "<a class='btn btn-line' target='_blank' rel='noopener' href='" + wa("Hola, quiero comprar el libro «" + b.titulo + "» de " + C.autor + ".") + "'>" + WA + "Comprar ya</a></div>"
        + "<ul class='checks'>" + b.ventajas.map(function (v) { return "<li>" + esc(v) + "</li>"; }).join("") + "</ul></div>"
        + "<div class='tabs' role='tablist'><button role='tab' aria-selected='true' data-tab='s'>Sinopsis</button><button role='tab' aria-selected='false' data-tab='c'>Contenido</button><button role='tab' aria-selected='false' data-tab='f'>Ficha técnica</button></div>"
        + "<div id='tabBox'></div>"
        + (b.fragmento ? "<a class='btn btn-line' href='leer.html#" + b.fragmento + "'>Leer un fragmento gratis <span class='ar'>→</span></a>" : "")
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
      $("#pdpAdd").onclick = function () { addToBag(b.id, qty); };
      tilt($(".pdp-media .stage"));
      $("#related").innerHTML = L.filter(function (x) { return x.id !== b.id; }).map(card).join("") + soonCard;
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
      return '<button type="button" class="creature ' + (sizes[i] || "w4") + '" data-rv data-d="' + (i % 3) + '"><img src="' + c.imagen + '" alt="" loading="lazy"><div class="in"><small>Del relato «' + esc(c.relato) + "»</small><h3>" + esc(c.nombre) + "</h3><p>" + esc(c.texto) + "</p></div></button>";
    }).join("");
    $("#uniCreatures").addEventListener("click", function (e) { var c = e.target.closest(".creature"); if (c) c.classList.toggle("open"); });

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
        return '<button type="button" class="word" aria-label="' + esc(g[0]) + ': ' + esc(g[1]) + '"><div class="inner"><div class="f"><b>' + esc(g[0]) + '</b><small><span>Toca para ver</span><span>' + esc(g[0][0]) + '</span></small></div><div class="b"><b>' + esc(g[0]) + "</b><p>" + esc(g[1]) + "</p></div></div></button>";
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

  /* Transición suave al cambiar de página */
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a"); if (!a || reduce) return;
    var href = a.getAttribute("href") || "";
    if (a.target === "_blank" || e.metaKey || e.ctrlKey || /^(https?:|mailto:|tel:|#)/.test(href) || !/\.html/.test(href)) return;
    if (href.split("#")[0] === location.pathname.split("/").pop()) return;
    e.preventDefault(); document.body.classList.add("leaving"); setTimeout(function () { location.href = href; }, 220);
  });
  addEventListener("pageshow", function () { document.body.classList.remove("leaving"); });
})();
