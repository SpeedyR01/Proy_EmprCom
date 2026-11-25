/* Librería de componentes reutilizables (funciones que devuelven HTML).
   Equivalen a los componentes de Figma / React. */

const h = (html) => html; // helper semántico

// ---------- Marco común: topbar ----------
function Topbar(rol, usuario) {
  const inicial = usuario.charAt(0).toUpperCase();
  return h(`
    <header class="topbar">
      <div class="topbar__inner">
        <div class="badge-square">${rol.mascota}</div>
        <div>
          <div class="topbar__role">${rol.nombre}</div>
          <div class="topbar__tagline">${rol.tagline}</div>
        </div>
        <div class="topbar__spacer"></div>
        <div class="topbar__user">
          <span class="topbar__username">${usuario}</span>
          <div class="avatar">${inicial}</div>
        </div>
        <button class="btn btn--outline btn--sm" data-go="login">Salir</button>
      </div>
    </header>
  `);
}

function PageHead(usuario, subtitulo) {
  return h(`
    <div class="page__head">
      <h1 class="t-h1">¡Hola, ${usuario}! <span style="font-size:.8em">👋</span></h1>
      <p class="t-body t-soft">${subtitulo}</p>
    </div>
  `);
}

// ---------- Tarjeta de producto ----------
function ProductCard(p) {
  return h(`
    <article class="product">
      <div class="product__media">${p.emoji}</div>
      <div class="product__body">
        <div class="product__name">${p.nombre}</div>
        <div class="product__price">${money(p.precio)}</div>
        <button class="btn btn--sm btn--block" data-add="${p.id}">+ Agregar</button>
      </div>
    </article>
  `);
}

// ---------- Fila de carrito ----------
function CartRow(item) {
  return h(`
    <div class="cart-row">
      <div>
        <div class="cart-row__name">${item.nombre}</div>
        <div class="cart-row__price">${money(item.precio)}</div>
      </div>
      <div class="stepper">
        <button data-dec="${item.id}" aria-label="Menos">−</button>
        <span>${item.cant}</span>
        <button data-inc="${item.id}" aria-label="Más">+</button>
      </div>
      <strong>${money(item.precio * item.cant)}</strong>
    </div>
  `);
}

// ---------- Tarjeta de atajo (dashboards) ----------
function Shortcut(emoji, titulo, estado) {
  const tag = estado === "Disponible"
    ? `<span class="tag tag--success">● Disponible</span>`
    : `<span class="tag tag--muted">Próximamente</span>`;
  return h(`
    <div class="card card--hover shortcut">
      <div class="shortcut__emoji">${emoji}</div>
      <div class="shortcut__title">${titulo}</div>
      ${tag}
    </div>
  `);
}

// ---------- Toast ----------
function showToast(texto, tipo = "success") {
  const layer = document.getElementById("toastLayer");
  const el = document.createElement("div");
  el.className = "toast" + (tipo === "error" ? " toast--error" : "");
  el.innerHTML = texto;
  layer.appendChild(el);
  setTimeout(() => { el.style.opacity = "0"; el.style.transition = "opacity .3s"; }, 2600);
  setTimeout(() => el.remove(), 3000);
}

// ---------- Esqueleto de carga ----------
function SkeletonGrid(n = 6) {
  let out = "";
  for (let i = 0; i < n; i++) {
    out += `<div class="skeleton" style="height:210px"></div>`;
  }
  return `<div class="product-grid">${out}</div>`;
}
