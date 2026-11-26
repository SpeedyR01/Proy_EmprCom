/* Definición de cada pantalla. Cada función devuelve { clase, html }.
   `clase` fija el modo de color por rol en el contenedor raíz. */

const USUARIO = "Sara";

// ---------- 1. Login ----------
function ScreenLogin() {
  return {
    clase: "role-vendedor",
    html: `
      <div class="login-scene">
        <form class="login-card" id="loginForm">
          <div class="login-mascot">🛍️</div>
          <h1 class="t-h1" style="margin-top:8px">¡Qué bueno verte!</h1>
          <p class="t-body t-soft" style="margin-top:6px">Entra para continuar con tu jornada</p>

          <div class="field">
            <label for="u">Usuario</label>
            <input class="input" id="u" placeholder="Tu usuario" value="sara" />
          </div>
          <div class="field">
            <label for="p">Contraseña</label>
            <input class="input" id="p" type="password" placeholder="••••••••" value="demo1234" />
          </div>

          <div class="error-pill" id="loginError">😕 Usuario o contraseña incorrectos</div>

          <button class="btn btn--block" style="margin-top:20px" type="submit">Entrar</button>

          <p class="login-foot">Cada rol tiene su propio panel 🎨</p>
          <p class="login-foot" style="margin-top:4px;font-size:12px">
            Prueba: escribe <b>mal</b> en contraseña para ver el error.
          </p>
        </form>
      </div>
    `,
  };
}

// ---------- 3. Panel Vendedor ----------
function ScreenVendedor(state) {
  const rol = ROLES.vendedor;
  const items = state.carrito;
  const total = items.reduce((s, it) => s + it.precio * it.cant, 0);

  const cartInner = items.length === 0
    ? `<div class="cart-empty">
         <div class="cart-empty__emoji">🧺</div>
         <p class="t-h3" style="margin-top:8px">Todavía está vacío</p>
         <p class="t-body t-soft">Agrega productos del catálogo</p>
       </div>`
    : items.map(CartRow).join("");

  const productos = state.loading
    ? SkeletonGrid(6)
    : `<div class="product-grid">${PRODUCTOS.map(ProductCard).join("")}</div>`;

  return {
    clase: rol.clase,
    html: `
      ${Topbar(rol, USUARIO)}
      <div class="page">
        ${PageHead(USUARIO, rol.frase)}
        <div class="vendor-grid">
          <section>
            <h2 class="t-h2" style="margin-bottom:16px">🛒 Catálogo</h2>
            ${productos}
          </section>
          <aside>
            <div class="card cart">
              <h3 class="t-h3">Tu pedido</h3>
              <div id="cartBody" style="margin-top:12px">${cartInner}</div>
              <div class="cart__total">
                <span class="t-label t-soft">Total</span>
                <b>${money(total)}</b>
              </div>
              <button class="btn btn--block" data-confirm ${items.length ? "" : "disabled"}>
                Confirmar venta ✨
              </button>
            </div>
          </aside>
        </div>
      </div>
    `,
  };
}

// ---------- 4. Panel Administrador ----------
function ScreenAdmin() {
  const rol = ROLES.admin;
  const filas = PRODUCTOS.map(p => `
    <tr>
      <td style="font-size:22px">${p.emoji}</td>
      <td>${p.nombre}</td>
      <td style="font-weight:800;color:var(--accent)">${money(p.precio)}</td>
    </tr>`).join("");

  return {
    clase: rol.clase,
    html: `
      ${Topbar(rol, "Álvaro")}
      <div class="page">
        ${PageHead("Álvaro", rol.frase)}
        <div class="shortcut-grid">
          ${Shortcut("📚", "Catálogo", "Disponible")}
          ${Shortcut("👥", "Usuarios", "Próximamente")}
          ${Shortcut("🔭", "Supervisión", "Próximamente")}
        </div>
        <div class="card stat-card" style="margin-bottom:24px">
          <div style="font-size:40px">📦</div>
          <div>
            <div class="stat-card__num">${PRODUCTOS.length}</div>
            <div class="t-overline">productos en catálogo</div>
          </div>
        </div>
        <div class="card">
          <h3 class="t-h3" style="margin-bottom:12px">Catálogo</h3>
          <table class="table">
            <thead><tr><th></th><th>Producto</th><th>Precio de lista</th></tr></thead>
            <tbody>${filas}</tbody>
          </table>
        </div>
      </div>
    `,
  };
}

// ---------- 5. Dashboards genéricos por rol (atajos + "Próximamente") ----------
function ScreenDashboard(rolKey, atajos) {
  const rol = ROLES[rolKey];
  return {
    clase: rol.clase,
    html: `
      ${Topbar(rol, USUARIO)}
      <div class="page">
        ${PageHead(USUARIO, rol.frase)}
        <div class="shortcut-grid">
          ${atajos.map(a => Shortcut(a.emoji, a.titulo, a.estado || "Próximamente")).join("")}
        </div>
        <div class="card" style="text-align:center;padding:48px">
          <div style="font-size:48px">${rol.mascota}</div>
          <h3 class="t-h3" style="margin-top:12px">Panel de ${rol.nombre}</h3>
          <p class="t-body t-soft">Elige un atajo para empezar. Las secciones marcadas como
            “Próximamente” estarán disponibles en la siguiente fase.</p>
        </div>
      </div>
    `,
  };
}

const ScreenComprador = () => ScreenDashboard("comprador", [
  { emoji: "🤝", titulo: "Proveedores" },
  { emoji: "📝", titulo: "Órdenes de compra" },
]);

const ScreenBodeguero = () => ScreenDashboard("bodeguero", [
  { emoji: "📊", titulo: "Inventario" },
  { emoji: "🚚", titulo: "Recepciones" },
  { emoji: "🔁", titulo: "Transferencias" },
]);

const ScreenCajero = () => ScreenDashboard("cajero", [
  { emoji: "💵", titulo: "Pagos" },
  { emoji: "↩️", titulo: "Devoluciones" },
]);

const ScreenAuditor = () => ScreenDashboard("auditor", [
  { emoji: "📈", titulo: "Reportes de ventas" },
  { emoji: "🧾", titulo: "Movimientos (solo lectura)" },
]);

// ---------- Pantallas de estado ----------
function StateScreen({ emoji, titulo, texto, extra = "" }) {
  return {
    clase: "role-vendedor",
    html: `
      ${Topbar(ROLES.vendedor, USUARIO)}
      <div class="state-scene">
        <div>
          <div class="state-emoji">${emoji}</div>
          <h2 class="t-h2">${titulo}</h2>
          <p class="t-body t-soft" style="margin-top:8px;max-width:380px;margin-inline:auto">${texto}</p>
          ${extra}
        </div>
      </div>
    `,
  };
}

const ScreenNoAccess = () => StateScreen({
  emoji: "🔒", titulo: "No tienes acceso a esta sección",
  texto: "Tu rol no incluye permisos para ver esto. Si crees que es un error, contacta al administrador.",
  extra: `<button class="btn" style="margin-top:20px" data-go="login">Volver al inicio</button>`,
});

const ScreenEmpty = () => StateScreen({
  emoji: "🫙", titulo: "Aún no hay nada por aquí",
  texto: "Cuando agregues registros, aparecerán en esta lista.",
});

const ScreenNetError = () => StateScreen({
  emoji: "📡", titulo: "Se perdió la conexión",
  texto: "No pudimos contactar al servidor. Revisa tu conexión e inténtalo de nuevo.",
  extra: `<button class="btn" style="margin-top:20px" data-reload>Reintentar</button>`,
});

function ScreenLoading() {
  return {
    clase: "role-vendedor",
    html: `
      ${Topbar(ROLES.vendedor, USUARIO)}
      <div class="page">
        <div class="skeleton" style="height:40px;width:240px;margin-bottom:24px"></div>
        ${SkeletonGrid(6)}
      </div>
    `,
  };
}
