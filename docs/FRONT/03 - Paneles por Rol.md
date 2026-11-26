# Frontend — Paneles por rol

Qué puede hacer cada rol en su pantalla y qué acciones ejecuta contra el backend.

---

## Login (común a todos)

- Formulario usuario + contraseña → `POST /auth/login` en ms-identidad.
- Devuelve token + roles; se guardan y se redirige al panel según el rol.
- Credenciales de prueba: cualquier usuario del seed con contraseña `demo1234`.

---

## Administrador

**Rol de mayor alcance: configura el sistema y supervisa.**

| Puede hacer | Acción en el back |
|---|---|
| Ver y gestionar el catálogo (productos) | apiCatalogo GET/POST `/catalogo/productos` |
| Gestionar usuarios y roles | apiIdentidad `/usuarios`, `/usuarios/:id/roles` |
| Supervisar (lectura) otras áreas | GET en los microservicios |

Es el único rol con permiso de escritura en Identidad.

---

## Comprador

**Gestiona el abastecimiento.**

| Puede hacer | Acción en el back |
|---|---|
| Ver órdenes de compra | apiCompras GET `/compras/ordenes` |
| Crear órdenes de compra | apiCompras POST `/compras/ordenes` |
| Ver y crear proveedores | apiCatalogo GET/POST `/catalogo/proveedores` |

---

## Bodeguero

**Controla el inventario físico.**

| Puede hacer | Acción en el back |
|---|---|
| Ver existencias por almacén | apiInventarios GET `/inventarios` |
| Ver productos bajo mínimo | filtra existencia < stock_minimo |
| Registrar movimientos (ENTRADA/SALIDA/AJUSTE) | apiInventarios POST `/inventarios/movimientos` |
| Registrar recepciones de compra | apiCompras POST `/compras/recepciones` |

---

## Vendedor

**Registra ventas (pantalla tipo carrito).**

| Puede hacer | Acción en el back |
|---|---|
| Ver productos del catálogo | apiCatalogo GET `/catalogo/productos` |
| Agregar productos al carrito | (estado local) |
| Confirmar la venta | POST `/ventas/pedidos` → POST `/ventas/confirmar/:id` |

**Flujo de la venta:**
```
Arma carrito → crea pedido (estado CREADO) → confirma (estado CONFIRMADO)
→ se crea la venta → se descuenta stock (llamada a inventarios, Fase 3)
```
El vendedor es quien **confirma / da salida a la venta** (no se necesita otro rol).

---

## Cajero

**Maneja el dinero y las devoluciones.**

| Puede hacer | Acción en el back |
|---|---|
| Registrar pagos de ventas | apiVentas POST `/ventas/pagos` |
| Ver el saldo pendiente tras el pago | lo devuelve el endpoint |
| Crear solicitudes de devolución | apiVentas POST `/ventas/devoluciones` |
| Aprobar devoluciones (reingresa stock) | apiVentas POST `/ventas/devoluciones/:id/aprobar` |

---

## Auditor

**Solo lectura: consulta reportes consolidados. No modifica nada.**

| Puede hacer | Acción en el back |
|---|---|
| Ver reportes consolidados (cruzan servidores vía FDW) | apiReportes GET `/reportes/:nombre` |
| Consultar inventario, ventas, compras | GET de lectura |

Reportes disponibles (desde ms-reportes):
inventario-consolidado, productos-bajo-minimo, ventas-sede-periodo,
compras-por-proveedor, clientes-frecuentes, ventas-por-empleado,
movimientos-inventario, productos-mas-vendidos, facturacion-medio-pago,
devoluciones-por-sede, saldos-por-venta, resumen-por-sede.

---

## Resumen de permisos (RBAC en el front)

| Panel | Crea/Modifica | Solo lee |
|---|---|---|
| Administrador | catálogo, usuarios, roles | todo lo demás |
| Comprador | proveedores, órdenes de compra | catálogo |
| Bodeguero | inventario, movimientos, recepciones | catálogo, órdenes |
| Vendedor | clientes, pedidos, ventas | catálogo, existencias |
| Cajero | pagos, devoluciones | ventas, pedidos |
| Auditor | — (nada) | reportes y consultas |

> La seguridad real la impone el backend (`requireRole`). El front solo muestra/oculta
> según el rol; aunque alguien forzara el front, el backend rechaza lo no permitido.
