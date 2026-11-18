# Fase 4 — Guía de pantallas del frontend

Esta guía define **cuántas pantallas** se deben construir, **con qué** contenido
(datos, formularios, acciones) y **cómo** se relacionan entre sí. El estilo visual
(colores, tipografía, espaciado) es **libre**: aquí solo se fija la estructura y los
componentes base para que el desarrollador de front tenga un punto de partida claro.

> Todas las pantallas consumen los 6 microservicios del backend (puertos 4001–4006).
> Cada pantalla de esta guía corresponde a un endpoint que **ya existe** en el backend.
> No diseñar acciones sin endpoint detrás.

---

## 1. Principio de diseño: 4 componentes base, no 20 pantallas

Casi todas las pantallas son la misma plantilla repetida. Si se diseñan **4 componentes
reutilizables**, cada panel es solo una composición de ellos. Esto reduce el trabajo de
"20 pantallas distintas" a "4 piezas + composiciones".

### Componentes base

| Componente | Descripción | Dónde se usa |
|---|---|---|
| **Shell / Layout** | Barra superior con nombre de usuario + botón **Salir**; área de contenido debajo. | Todos los paneles (menos Login). |
| **Tabla** | Lista de filas con encabezados; estados vacío / cargando. | Casi todas las vistas de consulta (`GET`). |
| **Formulario / Modal** | Campos de entrada + botón de guardar + validación. | Toda acción de creación (`POST`). |
| **Banner de mensaje** | Franja de error (rojo) o éxito (verde) con el texto de respuesta del backend. | Todas las pantallas con acciones. |

### Plantilla visual común

```
┌──────────────────────────────────────────────┐
│ [Shell]  Logo · "Panel X (usuario)"    [Salir] │
├──────────────────────────────────────────────┤
│  Título de sección              [ + Nuevo ]    │
│  ┌──────────────────────────────────────────┐ │
│  │  Tabla (datos del GET)                    │ │
│  └──────────────────────────────────────────┘ │
│  [Formulario / modal del POST]                 │
│  [Banner error / éxito]                        │
└──────────────────────────────────────────────┘
```

---

## 2. Tokens visuales sugeridos (base, no obligatorios)

El estilo es libre, pero conviene fijar una base mínima para mantener coherencia:

| Token | Sugerencia base | Nota |
|---|---|---|
| Color primario | 1 color de marca | botones principales, enlaces activos |
| Color éxito / error | verde / rojo | banners de mensaje |
| Fondo | neutro claro | área de contenido |
| Tipografía | 1 sans-serif (sistema o Inter/Roboto) | 2 tamaños: título y cuerpo |
| Espaciado | múltiplos de 4 u 8 px | márgenes y padding consistentes |
| Radio de borde | 1 valor (p. ej. 8 px) | tarjetas, inputs, botones |
| Ancho de contenido | ~1100–1200 px máx. centrado | tablas cómodas |

Un color por rol (opcional) ayuda al usuario a ubicarse: p. ej. Admin azul,
Comprador naranja, Bodeguero verde, Vendedor morado, Cajero teal, Auditor gris.

---

## 3. Inventario de pantallas

### 3.1. Pantallas comunes (2)

| # | Pantalla | Contenido | Endpoint |
|---|---|---|---|
| 1 | **Login** | Campos usuario + contraseña, botón Entrar, banner de error. | `POST /auth/login` (4001) |
| 2 | **Dashboard (redirección)** | Sin UI visible. Lee `roles[0]` y redirige al panel correspondiente. | — |

**Login — detalle de campos**

| Campo | Tipo | Nota |
|---|---|---|
| nombre_usuario | texto | p. ej. `atorres` |
| password | password | demo: `demo1234` |

Respuesta del backend: `{ token, usuario, roles }`. El token se guarda y se envía en
cada petición (`Authorization: Bearer <token>`).

---

### 3.2. Shell / layout común (1)

Un solo componente reutilizable:
- Encabezado: nombre de la app + `Panel X (usuario)` + botón **Salir** (hace `logout`).
- Cuerpo: contenedor donde se montan las vistas de cada rol.
- Opcional: menú lateral o pestañas cuando el rol tiene varias sub-vistas (Admin, Bodeguero).

---

### 3.3. Paneles por rol (6)

#### Rol ADMINISTRADOR — 3 sub-vistas

| Sub-vista | Contenido | Endpoint |
|---|---|---|
| **Productos** | Tabla de productos + formulario de alta. | `GET /catalogo/productos` · `POST /catalogo/productos` |
| **Usuarios** | Tabla de usuarios + alta de usuario + asignar rol. | `GET /usuarios` · `POST /usuarios` · `POST /usuarios/:id/roles` |
| **Supervisión** | Vistas de solo lectura (inventario, ventas, etc.), reutiliza tablas de otros roles. | varios `GET` |

Formulario **crear producto**: `sku`, `nombre`, `id_categoria`, `unidad_medida`, `precio_lista`.
Formulario **crear usuario**: `id_empleado`, `nombre_usuario`, `password`.
Acción **asignar rol**: `id_rol` sobre un usuario existente.

#### Rol COMPRADOR — 2 sub-vistas

| Sub-vista | Contenido | Endpoint |
|---|---|---|
| **Proveedores** | Tabla + formulario de alta. | `GET /catalogo/proveedores` · `POST /catalogo/proveedores` |
| **Órdenes de compra** | Tabla + formulario con **detalle de ítems**. | `GET /compras/ordenes` · `POST /compras/ordenes` |

Formulario **crear proveedor**: `identificacion`, `razon_social`, `ciudad`, `correo`, `telefono`.
Formulario **crear orden**: `id_proveedor`, `id_almacen_destino`, `id_empleado`,
`fecha_estimada`, `items[]` (cada ítem: `id_producto`, `cantidad_solicitada`, `costo_unitario`).

#### Rol BODEGUERO — 3–4 sub-vistas

| Sub-vista | Contenido | Endpoint |
|---|---|---|
| **Inventario** | Tabla de existencias + resaltar bajo mínimo. | `GET /inventarios` · `GET /inventarios/bajo-minimo` |
| **Recepciones** | Formulario sobre una orden de compra. | `POST /compras/recepciones` |
| **Transferencias** | Tabla + crear + botón **Recibir**. | `GET /transferencias` · `POST /transferencias` · `POST /transferencias/:id/recibir` |
| **Movimiento manual** (opcional) | Formulario de entrada/salida. | `POST /inventarios/movimientos` |

Formulario **recepción**: `id_orden_compra`, `estado` (PARCIAL/COMPLETA), `items[]` (`id_producto`, `cantidad_recibida`).
Formulario **transferencia**: `id_almacen_origen`, `id_almacen_destino`, `items[]` (`id_producto`, `cantidad_enviada`).

#### Rol VENDEDOR — 3 sub-vistas

| Sub-vista | Contenido | Endpoint |
|---|---|---|
| **Clientes** | Tabla + formulario de alta. | `GET /catalogo/clientes` · `POST /catalogo/clientes` |
| **Crear pedido** | Selección de productos + cantidades + total. | `POST /ventas/pedidos` |
| **Confirmar venta** | Lista de pedidos + botón **Confirmar** (descuenta stock). | `GET /ventas/pedidos` · `POST /ventas/confirmar/:idPedido` |

Formulario **crear cliente**: `tipo_documento`, `num_documento`, `nombre_completo`, `correo`, `telefono`.
Formulario **crear pedido**: `id_sede`, `id_almacen`, `id_cliente`, `id_empleado`,
`items[]` (`id_producto`, `cantidad`, `precio_unitario`).

#### Rol CAJERO — 2 sub-vistas

| Sub-vista | Contenido | Endpoint |
|---|---|---|
| **Pagos** | Formulario de pago + muestra saldo pendiente devuelto. | `POST /ventas/pagos` |
| **Devoluciones** | Lista + botón **Aprobar**. | `POST /ventas/devoluciones/:id/aprobar` |

Formulario **pago**: `id_venta`, `valor`, `medio_pago` (EFECTIVO / TARJETA / TRANSFERENCIA / OTRO).

> Nota: el backend **no** expone un endpoint para *crear* devoluciones, solo para
> aprobarlas. La pantalla asume que la devolución ya existe en la base de datos.

#### Rol AUDITOR — 1 vista (con pestañas)

| Sub-vista | Contenido | Endpoint |
|---|---|---|
| **Reportes (solo lectura)** | Pestañas: inventario, bajo mínimo, órdenes, pedidos, transferencias. Sin botones de acción. | varios `GET` |

---

### 3.4. Estados transversales (3 frames)

No son pantallas nuevas, pero sí frames que el desarrollador debe diseñar una vez:

| Estado | Cuándo aparece |
|---|---|
| **Sin acceso** | El rol no tiene permiso para la ruta (lo devuelve `RutaProtegida`). |
| **Error** | Banner rojo con `error.response.data.error`. |
| **Vacío / cargando** | Tabla sin datos o en carga. |

---

## 4. Conteo final

| Grupo | Frames |
|---|---|
| Login | 1 |
| Shell / layout común | 1 |
| Admin (3 sub-vistas) | 3 |
| Comprador (2) | 2 |
| Bodeguero (3–4) | 4 |
| Vendedor (3) | 3 |
| Cajero (2) | 2 |
| Auditor (1 con pestañas) | 1 |
| Estados (error / vacío / sin acceso) | 3 |
| **Total** | **~20 frames** |

**MVP imprescindible (8–9 frames):** Login + los 6 paneles + Shell + 1 estado de error.
El resto son sub-vistas que repiten el patrón tabla + formulario.

---

## 5. Mapa de navegación

```
Login
  └─(token + roles)→ Dashboard
        ├─ ADMINISTRADOR → /admin      (Productos · Usuarios · Supervisión)
        ├─ COMPRADOR     → /comprador  (Proveedores · Órdenes)
        ├─ BODEGUERO     → /bodeguero  (Inventario · Recepciones · Transferencias)
        ├─ VENDEDOR      → /vendedor   (Clientes · Crear pedido · Confirmar venta)
        ├─ CAJERO        → /cajero     (Pagos · Devoluciones)
        └─ AUDITOR       → /auditor    (Reportes solo lectura)
```

Cada ruta de rol está protegida por `RutaProtegida rol="..."`: si el usuario no tiene
ese rol, ve el estado **Sin acceso**.

---

## 6. Dos detalles del backend que afectan el diseño

1. **IDs en el cuerpo de las peticiones.** Varios `POST` requieren `id_empleado`,
   `id_sede`, `id_almacen`, `id_cliente`, etc. En vez de pedirlos como texto, se
   recomienda usar **selectores (dropdowns)** que se llenen con los `GET` de catálogo
   (`/catalogo/sedes`, `/catalogo/almacenes`, `/catalogo/clientes`, `/catalogo/productos`).

2. **Devoluciones sin creación.** Solo existe "aprobar". Si se requiere crear
   devoluciones desde el front, ese endpoint tendría que agregarse al backend primero.

---

## 7. Orden sugerido de construcción

1. Componentes base: Shell, Tabla, Formulario, Banner.
2. Login + flujo de autenticación + navegación por rol.
3. Un panel completo de referencia (p. ej. Vendedor) para validar el patrón.
4. Los demás paneles, uno por uno, reutilizando los componentes base.
5. Estados (error, vacío, sin acceso) y refinamiento visual.
