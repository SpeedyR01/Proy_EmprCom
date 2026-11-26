# Proy_EmprCom · Prototipo de interfaces

Prototipo navegable del frontend de gestión comercial. Implementa el sistema de
diseño completo (cálido, amigable, con carisma) en HTML/CSS/JS sin dependencias,
para usarse como **prototipo clickeable** y como **referencia 1:1** al pasar a
Figma o a React.

## Cómo abrirlo

Abre `index.html` en cualquier navegador. No requiere servidor ni instalación.
Arriba a la derecha hay un **navegador de pantallas** (herramienta del prototipo,
no es parte del producto) para saltar entre todas las vistas.

## Flujo navegable

- **Login** → contraseña `demo1234` entra al panel Vendedor (pantalla de carga de por medio).
  Escribe cualquier otra contraseña para ver el **error con shake**.
- **Vendedor** → agrega productos, ajusta cantidades con − / +, **Confirmar venta** lanza el toast 🎉.
- El selector lateral permite ver Administrador, Comprador, Bodeguero, Cajero, Auditor y los 4 estados.

## Sistema de diseño (tokens)

Todo está en variables CSS al inicio de `styles.css`:

| Token | Valor |
|---|---|
| Fondo crema | `#FFF8F0` |
| Tarjeta | `#FFFFFF` |
| Borde suave | `#F0E6DA` |
| Texto principal | `#2B2340` |
| Texto secundario | `#7C7490` |
| Éxito / Error | `#2FB67C` / `#E5484D` |
| Radios | tarjeta 20px · botón/input 14px · login 28px |
| Sombra | `0 6px 24px rgba(43,35,64,0.07)` |
| Títulos | Fredoka 600 · Cuerpo: Nunito 400/700/800 |

### Modo de color por rol

Clases `.role-*` sobre el contenedor raíz cambian `--accent` y `--accent-soft`:

| Rol | Acento | Mascota |
|---|---|---|
| Administrador | `#6C5CE7` | 🧑‍✈️ |
| Comprador | `#0FA3B1` | 🛒 |
| Bodeguero | `#E08A00` | 📦 |
| Vendedor | `#FF7A59` | 🛍️ |
| Cajero | `#2FB67C` | 💳 |
| Auditor | `#4C6EF5` | 🔍 |

## Librería de componentes (`components.js` + `styles.css`)

| Componente | Variantes |
|---|---|
| Botón | primario · contorno · pequeño (`--sm`) · deshabilitado · bloque |
| Input | normal · foco (anillo de acento) · error |
| Tarjeta | base · `--hover` (se eleva con borde del rol) |
| Tarjeta de producto | media con emoji + nombre + precio + agregar |
| Fila de carrito | nombre/precio + stepper − n + + subtotal |
| Etiqueta | acento · muted (Próximamente) · success (Disponible) |
| Toast | éxito · error |
| Tabla | encabezados en overline, hover de fila |
| Esqueleto | shimmer animado |

## Microinteracciones

- Mascota del login con **rebote** suave (`@keyframes bounce`).
- Botones **presionables**: sombra sólida inferior de 4px que se hunde en `:active`.
- Tarjetas se **elevan** al pasar el cursor con borde del color del rol.
- Error de login con **shake**.
- Toast flotante inferior al confirmar venta.

## Pasar a React

El prototipo ya está organizado para traducirse directo:

- Cada función de `components.js` → un componente React (`<Button>`, `<ProductCard>`, `<CartRow>`, `<Toast>`, `<Table>`…).
- Cada función de `screens.js` → una página (`Login`, `Vendedor`, `Admin`, dashboards por rol, estados).
- Los tokens de `:root` → `theme` / variables CSS o `tailwind.config`.
- El `state` de `app.js` (carrito, loading) → `useState` / contexto.
- Las clases `.role-*` → una prop `rol` que fija el acento (mapea al JWT real del backend).
