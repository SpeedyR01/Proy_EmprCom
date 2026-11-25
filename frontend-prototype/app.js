/* Controlador del prototipo: enrutamiento entre pantallas, estado del
   carrito e interacciones. */

const app = document.getElementById("app");

// Estado efímero
const state = {
  carrito: [],      // [{id, nombre, precio, cant}]
  loading: false,
};

// Registro de pantallas navegables
const SCREENS = {
  login:      ScreenLogin,
  vendedor:   () => ScreenVendedor(state),
  admin:      ScreenAdmin,
  comprador:  ScreenComprador,
  bodeguero:  ScreenBodeguero,
  cajero:     ScreenCajero,
  auditor:    ScreenAuditor,
  noaccess:   ScreenNoAccess,
  empty:      ScreenEmpty,
  neterror:   ScreenNetError,
  loading:    ScreenLoading,
};

// Menú del navegador del prototipo
const NAV_ITEMS = [
  ["login", "1 · Login"],
  ["vendedor", "3 · Vendedor"],
  ["admin", "4 · Administrador"],
  ["comprador", "5 · Comprador"],
  ["bodeguero", "5 · Bodeguero"],
  ["cajero", "5 · Cajero"],
  ["auditor", "5 · Auditor"],
  ["noaccess", "Estado · Sin acceso"],
  ["empty", "Estado · Lista vacía"],
  ["neterror", "Estado · Error de red"],
  ["loading", "Estado · Cargando"],
];

let current = "login";

function render(name) {
  current = name;
  const screen = SCREENS[name]();
  app.className = "app " + screen.clase;
  app.innerHTML = screen.html;
  bindScreen(name);
  updateNavActive();
  window.scrollTo({ top: 0, behavior: "instant" });
}

// ---------- Interacciones por pantalla ----------
function bindScreen(name) {
  // Navegación genérica data-go
  app.querySelectorAll("[data-go]").forEach(el =>
    el.addEventListener("click", () => render(el.dataset.go)));

  app.querySelectorAll("[data-reload]").forEach(el =>
    el.addEventListener("click", () => { render("loading"); setTimeout(() => render("vendedor"), 1200); }));

  if (name === "login") bindLogin();
  if (name === "vendedor") bindVendedor();
}

function bindLogin() {
  const form = document.getElementById("loginForm");
  const err = document.getElementById("loginError");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const pass = document.getElementById("p").value;
    if (pass !== "demo1234") {
      err.classList.remove("show");       // reinicia animación
      void err.offsetWidth;
      err.classList.add("show");
      return;
    }
    // Simula carga y entra al panel vendedor
    render("loading");
    setTimeout(() => render("vendedor"), 1000);
  });
}

function bindVendedor() {
  // Agregar al carrito
  app.querySelectorAll("[data-add]").forEach(btn =>
    btn.addEventListener("click", () => addToCart(+btn.dataset.add)));
  // + / -
  app.querySelectorAll("[data-inc]").forEach(btn =>
    btn.addEventListener("click", () => changeQty(+btn.dataset.inc, +1)));
  app.querySelectorAll("[data-dec]").forEach(btn =>
    btn.addEventListener("click", () => changeQty(+btn.dataset.dec, -1)));
  // Confirmar
  const conf = app.querySelector("[data-confirm]");
  if (conf) conf.addEventListener("click", () => {
    if (!state.carrito.length) return;
    showToast("🎉 Venta confirmada");
    state.carrito = [];
    render("vendedor");
  });
}

function addToCart(id) {
  const prod = PRODUCTOS.find(p => p.id === id);
  const existing = state.carrito.find(i => i.id === id);
  if (existing) existing.cant++;
  else state.carrito.push({ id, nombre: prod.nombre, precio: prod.precio, cant: 1 });
  render("vendedor");
}

function changeQty(id, delta) {
  const item = state.carrito.find(i => i.id === id);
  if (!item) return;
  item.cant += delta;
  if (item.cant <= 0) state.carrito = state.carrito.filter(i => i.id !== id);
  render("vendedor");
}

// ---------- Navegador del prototipo ----------
function buildNav() {
  const list = document.getElementById("protoNavList");
  list.innerHTML = NAV_ITEMS.map(([k, label]) =>
    `<button data-nav="${k}">${label}</button>`).join("");
  list.querySelectorAll("[data-nav]").forEach(b =>
    b.addEventListener("click", () => render(b.dataset.nav)));

  const toggle = document.getElementById("protoNavToggle");
  toggle.addEventListener("click", () => {
    list.classList.toggle("hidden");
    toggle.setAttribute("aria-expanded", String(!list.classList.contains("hidden")));
  });
}
function updateNavActive() {
  document.querySelectorAll("[data-nav]").forEach(b =>
    b.classList.toggle("active", b.dataset.nav === current));
}

// ---------- Arranque ----------
buildNav();
render("login");
