/* =====================================================================
   LIBRO EN 3D REAL (WebGL con Three.js)
   Dibuja cada libro como un objeto de verdad: portada, lomo,
   contraportada y hojas. Se puede girar con el mouse o con el dedo.
   ===================================================================== */
import * as THREE from "../vendor/three.module.min.js";
import { RoomEnvironment } from "../vendor/RoomEnvironment.js";

const W = 1.42, H = 2;                       // proporción de la portada
const loader = new THREE.TextureLoader();
const texCache = {};

function canvasTex(w, h, draw) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
function pagesTex(vertical) {
  return canvasTex(vertical ? 256 : 32, vertical ? 32 : 256, (g, w, h) => {
    g.fillStyle = "#F3EEDF"; g.fillRect(0, 0, w, h);
    const n = 90;
    for (let i = 0; i < n; i++) {
      g.fillStyle = i % 2 ? "rgba(120,100,70,.10)" : "rgba(255,255,255,.35)";
      if (vertical) g.fillRect(i * w / n, 0, 1.2, h); else g.fillRect(0, i * h / n, w, 1.2);
    }
  });
}
function wrap(g, text, x, y, maxW, lh, maxLines) {
  const words = String(text || "").split(" "); let line = "", n = 0;
  for (let i = 0; i < words.length; i++) {
    const test = line ? line + " " + words[i] : words[i];
    if (g.measureText(test).width > maxW && line) {
      g.fillText(line, x, y); y += lh; n++; line = words[i];
      if (maxLines && n >= maxLines - 1) { line = words.slice(i).join(" "); while (g.measureText(line + "…").width > maxW && line.length) line = line.slice(0, -1); g.fillText(line + (i < words.length ? "…" : ""), x, y); return y + lh; }
    } else line = test;
  }
  if (line) g.fillText(line, x, y);
  return y + lh;
}
function spineTex(b, author) {
  const L = b.lomo || {}, bg = L.fondo || "#1F5C4A", fg = L.texto || "#FFFFFF";
  return canvasTex(160, 1024, (g, w, h) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.save(); g.translate(w / 2, 40); g.rotate(Math.PI / 2);
    g.fillStyle = fg; g.textBaseline = "middle";
    g.font = "600 62px 'Cormorant Garamond', Georgia, serif";
    let t = b.titulo; while (g.measureText(t).width > 640 && t.length > 4) t = t.slice(0, -1);
    g.fillText(t, 30, 0);
    g.globalAlpha = .75; g.font = "500 30px Geist, Arial, sans-serif";
    g.fillText(author.toUpperCase(), 700, 0);
    g.restore();
  });
}
function backTex(b, author) {
  const L = b.lomo || {}, bg = L.fondo || "#1F5C4A", fg = L.texto || "#FFFFFF";
  return canvasTex(710, 1000, (g, w, h) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.fillStyle = fg; g.textBaseline = "top";
    g.font = "600 54px 'Cormorant Garamond', Georgia, serif";
    let y = wrap(g, b.titulo, 70, 90, w - 140, 58, 3) + 20;
    g.globalAlpha = .9; g.font = "400 30px 'EB Garamond', Georgia, serif";
    y = wrap(g, b.gancho || "", 70, y, w - 140, 42, 6) + 24;
    g.globalAlpha = .75; g.font = "400 25px 'EB Garamond', Georgia, serif";
    const syn = (b.sinopsis && b.sinopsis[0]) || "";
    wrap(g, syn, 70, y, w - 140, 36, 9);
    g.globalAlpha = 1; g.font = "600 26px Geist, Arial, sans-serif";
    g.fillText(author.toUpperCase(), 70, h - 110);
    g.globalAlpha = .6; g.font = "500 20px Geist, Arial, sans-serif";
    g.fillText((b.edicion || "") + (b.salida ? " · " + b.salida : ""), 70, h - 70);
  });
}
function coverTex(src) {
  if (texCache[src]) return texCache[src];
  const t = loader.load(src); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return (texCache[src] = t);
}
function shadowTex() {
  return canvasTex(256, 256, (g, w, h) => {
    const r = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    r.addColorStop(0, "rgba(0,0,0,.55)"); r.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = r; g.fillRect(0, 0, w, h);
  });
}

export function createViewer(opt) {
  opt = Object.assign({ mode: "hover", reduce: false, author: "", baseY: -0.42 }, opt || {});
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  const canvas = renderer.domElement; canvas.className = "gl-book"; canvas.setAttribute("aria-hidden", "true");

  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);

  const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(-2.5, 3, 4); scene.add(key);
  const rim = new THREE.DirectionalLight(0xfff1dd, 1.1); rim.position.set(3, 1.5, -3); scene.add(rim);
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));

  const holder = new THREE.Group(); scene.add(holder);
  const book = new THREE.Group(); holder.add(book);
  let mesh = null, depth = 0.24;
  const pagesV = pagesTex(true), pagesH = pagesTex(false);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.1), new THREE.MeshBasicMaterial({ map: shadowTex(), transparent: true, depthWrite: false, opacity: .55 }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = -H / 2 - 0.12; holder.add(shadow);

  function build(b) {
    if (mesh) { book.remove(mesh); mesh.geometry.dispose(); mesh.material.forEach(m => { if (m.map && m.map !== pagesV && m.map !== pagesH && !Object.values(texCache).includes(m.map)) m.map.dispose(); m.dispose(); }); }
    depth = b.grosor || 0.24;
    const cover = (map, rough) => new THREE.MeshPhysicalMaterial({ map, roughness: rough, metalness: 0, clearcoat: .35, clearcoatRoughness: .45 });
    const paper = (map) => new THREE.MeshStandardMaterial({ map, roughness: .95, metalness: 0 });
    // Orden de caras de la caja: derecha, izquierda, arriba, abajo, frente, atrás
    const mats = [paper(pagesV), cover(spineTex(b, opt.author), .5), paper(pagesH), paper(pagesH), cover(coverTex(b.portada), .42), cover(backTex(b, opt.author), .5)];
    mesh = new THREE.Mesh(new THREE.BoxGeometry(W, H, depth, 1, 1, 1), mats);
    book.add(mesh);
  }

  // Estado del movimiento
  const st = { tx: 0, ty: 0, rx: 0, ry: 0, drag: null, spin: 0, spinV: 0, userY: 0, scrollY: 0, t0: performance.now(), hover: false, lastUser: 0 };
  let host = null, visible = true, raf = 0, ro = null, io = null;

  function fit() {
    if (!host) return;
    const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const need = Math.max(H * (opt.fill || 1.2), (W * 1.9) / camera.aspect);
    camera.position.set(0, 0.05, (need / 2) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    camera.lookAt(0, -0.05, 0); camera.updateProjectionMatrix();
  }
  function onMove(e) {
    if (!host) return;
    const r = host.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
    if (st.drag) {
      const dx = e.clientX - st.drag.x; st.userY = st.drag.y0 + dx * 0.012; st.spinV = (e.clientX - st.drag.lx) * 0.012; st.drag.lx = e.clientX; st.lastUser = performance.now();
      return;
    }
    if (opt.mode !== "scroll") { st.tx = py * -0.35; st.ty = px * 0.7; }
  }
  function onDown(e) {
    if (e.button && e.button !== 0) return;
    st.drag = { x: e.clientX, lx: e.clientX, y0: st.userY }; host.classList.add("grabbing");
    try { host.setPointerCapture(e.pointerId); } catch (er) {}
  }
  function onUp() {
    if (!st.drag) return; st.drag = null; host && host.classList.remove("grabbing");
  }
  function onLeave() { if (!st.drag) { st.tx = 0; st.ty = 0; } }

  function frame(now) {
    raf = 0;
    if (!visible || !host) return;
    const t = (now - st.t0) / 1000, dt = Math.min(0.1, (now - (st.last || now)) / 1000) || 0.016, k = dt * 60; st.last = now;
    // inercia al soltar
    if (!st.drag && Math.abs(st.spinV) > 0.0005) { st.userY += st.spinV * k; st.spinV *= Math.pow(0.93, k); }
    // en portada, vuelve a su sitio poco a poco tras girarlo
    if (opt.mode === "hover" && !st.drag && now - st.lastUser > 2200) {
      const k0 = Math.round(st.userY / (Math.PI * 2)) * Math.PI * 2; st.userY += (k0 - st.userY) * (1 - Math.pow(0.95, k));
    }
    if (st.spin) { st.spin *= Math.pow(0.89, k); if (Math.abs(st.spin) < 0.002) st.spin = 0; }
    const e8 = 1 - Math.pow(0.92, k); st.rx += (st.tx - st.rx) * e8; st.ry += (st.ty - st.ry) * e8;
    st.sy = (st.sy == null ? st.scrollY : st.sy) + (st.scrollY - (st.sy == null ? st.scrollY : st.sy)) * e8;
    const idle = opt.reduce ? 0.5 : 1;
    holder.position.y = Math.sin(t * 1.1) * 0.05 * idle;
    shadow.position.y = -H / 2 - 0.12 - holder.position.y;
    shadow.scale.setScalar(1 - holder.position.y * 0.6);
    book.rotation.x = st.rx + Math.sin(t * 0.7) * 0.02 * idle;
    book.rotation.y = opt.baseY + st.ry + st.userY + st.sy + st.spin + Math.sin(t * 0.5) * 0.06 * idle;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf && visible && host) raf = requestAnimationFrame(frame); }

  const api = {
    canvas,
    mount(el) {
      if (host === el) return api;
      if (host) unbind();
      host = el; el.appendChild(canvas); el.classList.add("gl-on");
      el.addEventListener("pointermove", onMove); el.addEventListener("pointerdown", onDown);
      el.addEventListener("pointerup", onUp); el.addEventListener("pointercancel", onUp); el.addEventListener("pointerleave", onLeave);
      ro = new ResizeObserver(fit); ro.observe(el); ro.observe(canvas);
      io = new IntersectionObserver(en => { visible = en[0].isIntersecting && !document.hidden; kick(); }); io.observe(el);
      fit(); kick();
      return api;
    },
    setBook(b, animate) {
      if (!b) return api;
      if (animate && mesh && !opt.reduce) {
        st.spin = Math.PI * 2 * (animate < 0 ? -1 : 1);   // da una vuelta completa mientras cambia
        setTimeout(() => build(b), 140);
      } else build(b);
      kick(); return api;
    },
    setScroll(y) { st.scrollY = y; kick(); },
    spinBy(a) { st.spinV += a; kick(); },
    dispose() { unbind(); renderer.dispose(); }
  };
  function unbind() {
    if (!host) return;
    host.removeEventListener("pointermove", onMove); host.removeEventListener("pointerdown", onDown);
    host.removeEventListener("pointerup", onUp); host.removeEventListener("pointercancel", onUp); host.removeEventListener("pointerleave", onLeave);
    host.classList.remove("gl-on"); ro && ro.disconnect(); io && io.disconnect(); host = null;
  }
  document.addEventListener("visibilitychange", () => { visible = !document.hidden; kick(); });
  return api;
}
