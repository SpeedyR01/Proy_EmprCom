# Documentación del MER&#32;

## &#32;Entidades y atributos

| Entidad | Atributos (PK = llave primaria) | Descripción |
| --- | --- | --- |
| PERSONA | num\_documento (PK), nombre\_completo, correo | Supertipo que agrupa lo que comparten clientes y empleados. |
| CLIENTE | id\_cliente (PK), tipo\_documento, telefono, estado | Persona que compra en el sistema. |
| EMPLEADO | id\_empleado (PK), estado | Persona que trabaja en una sede y ejecuta las operaciones. |
| CARGO | id\_cargo (PK), nombre, descripcion | Puesto que ocupa un empleado. |
| USUARIO | id\_usuario (PK), nombre\_usuario, password\_hash, estado, fecha\_creacion | Cuenta de acceso de un empleado. |
| ROL | id\_rol (PK), nombre, descripcion | Perfil de permisos que se asigna a los usuarios. |
| AUDITORIA\_ACCESO | id\_auditoria (PK), fecha\_hora, accion, objeto\_consultado | Registro de lo que hace cada usuario en el sistema. |
| SEDE | id\_sede (PK), nombre, ciudad, direccion, tipo\_sede, estado | Punto físico de la empresa. |
| ALMACEN | id\_almacen (PK), nombre, tipo\_almacen, estado | Bodega que pertenece a una sede. |
| CATEGORIA | id\_categoria (PK), nombre, descripcion, estado | Clasificación de los productos. |
| PRODUCTO | id\_producto (PK), sku, nombre, unidad\_medida, precio\_lista | Artículo que se vende, almacena y compra. |
| PROVEEDOR | id\_proveedor (PK), identificacion, razon\_social, ciudad, correo, telefono, estado | Empresa que abastece productos. |
| PEDIDO\_VENTA | id\_pedido (PK), fecha\_pedido, estado, total\_registrado | Solicitud de compra de un cliente. |
| VENTA | id\_venta (PK), fecha\_venta, estado | Venta concretada a partir de un pedido. |
| PAGO | id\_pago (PK), fecha\_pago, valor, medio\_pago, estado | Pago aplicado a una venta. |
| DEVOLUCION | id\_devolucion (PK), fecha\_solicitud, motivo, estado | Solicitud de devolución sobre una venta. |
| MOVIMIENTO\_INVENTARIO | id\_movimiento (PK), tipo\_movimiento, cantidad, fecha | Entrada o salida de un producto en un almacén. |
| AJUSTE\_INVENTARIO | id\_ajuste (PK), fecha, motivo, estado | Corrección manual del inventario de un almacén. |
| TRANSFERENCIA | id\_transferencia (PK), fecha\_solicitud, fecha\_despacho, fecha\_recepcion, estado | Traslado de productos entre dos almacenes. |
| ORDEN\_COMPRA | id\_orden\_compra (PK), fecha\_orden, fecha\_estimada, estado | Pedido de compra a un proveedor. |
| RECEPCION\_COMPRA | id\_recepcion (PK), fecha\_recepcion, estado | Llegada de mercancía de una orden de compra. |

## Relaciones

Las relaciones con atributos propios corresponden a las tablas de detalle del esquema, y por eso se dibujan como rombos con óvalos.

| Relación | Entidades que conecta | Cardinalidad | Atributos de la relación | Significado |
| --- | --- | --- | --- | --- |
| realiza | CLIENTE – PEDIDO\_VENTA | 1:N | — | Un cliente hace muchos pedidos. |
| registra | EMPLEADO – PEDIDO\_VENTA | 1:N | — | El empleado que registra el pedido. |
| atiende | SEDE – PEDIDO\_VENTA | 1:N | — | Sede donde se atiende el pedido. |
| despacha | ALMACEN – PEDIDO\_VENTA | 1:N | — | Almacén desde el que se despacha el pedido. |
| genera | PEDIDO\_VENTA – VENTA | 1:1 | — | Un pedido da origen a una venta. |
| se paga con | VENTA – PAGO | 1:N | — | Una venta puede pagarse en varios pagos. |
| origina | VENTA – DEVOLUCION | 1:N | — | Una venta puede tener devoluciones. |
| DETALLE\_PEDIDO | PEDIDO\_VENTA – PRODUCTO | N:M | cantidad, precio\_unitario | Productos incluidos en cada pedido. |
| DETALLE\_DEVOLUCION | DEVOLUCION – PRODUCTO | N:M | cantidad, condicion\_producto | Productos devueltos y su estado. |
| clasifica | CATEGORIA – PRODUCTO | 1:N | — | Una categoría agrupa muchos productos. |
| posee | SEDE – ALMACEN | 1:N | — | Una sede tiene varios almacenes. |
| emplea | SEDE – EMPLEADO | 1:N | — | Una sede tiene varios empleados. |
| ocupa | CARGO – EMPLEADO | 1:N | — | Un cargo lo ocupan varios empleados. |
| tiene cuenta | EMPLEADO – USUARIO | 1:1 | — | Cada usuario pertenece a un empleado. |
| USUARIO\_ROL | USUARIO – ROL | N:M | — | Un usuario puede tener varios roles. |
| genera (auditoría) | USUARIO – AUDITORIA\_ACCESO | 1:N | — | Cada acción del usuario deja un registro. |
| INVENTARIO | ALMACEN – PRODUCTO | N:M | existencia\_actual, stock\_minimo, fecha\_actualizacion | Existencias de cada producto en cada almacén. |
| registra (movimiento) | INVENTARIO (agregación) – MOVIMIENTO\_INVENTARIO | 1:N | — | Cada movimiento afecta a un producto en un almacén. |
| tiene (ajuste) | ALMACEN – AJUSTE\_INVENTARIO | 1:N | — | Ajustes hechos sobre un almacén. |
| realiza (ajuste) | EMPLEADO – AJUSTE\_INVENTARIO | 1:N | — | Empleado que hace el ajuste. |
| envía | ALMACEN – TRANSFERENCIA | 1:N | — | Almacén de origen. |
| recibe | ALMACEN – TRANSFERENCIA | 1:N | — | Almacén de destino. |
| DETALLE\_TRANSFERENCIA | TRANSFERENCIA – PRODUCTO | N:M | cantidad\_enviada, cantidad\_recibida | Productos que se trasladan. |
| SUMINISTRA | PROVEEDOR – PRODUCTO | N:M | costo\_referencia, plazo\_entrega\_dias | Productos que ofrece cada proveedor. |
| se emite a | PROVEEDOR – ORDEN\_COMPRA | 1:N | — | Proveedor al que se le compra. |
| llega a | ALMACEN – ORDEN\_COMPRA | 1:N | — | Almacén de destino de la compra. |
| emite | EMPLEADO – ORDEN\_COMPRA | 1:N | — | Empleado que emite la orden. |
| DETALLE\_ORDEN\_COMPRA | ORDEN\_COMPRA – PRODUCTO | N:M | cantidad\_solicitada, costo\_unitario | Productos solicitados en la orden. |
| tiene (recepción) | ORDEN\_COMPRA – RECEPCION\_COMPRA | 1:N | — | Una orden puede recibirse en varias entregas. |
| DETALLE\_RECEPCION | RECEPCION\_COMPRA – PRODUCTO | N:M | cantidad\_recibida | Productos que llegan en cada recepción. |

## Especialización

Se usa una **especialización de PERSONA** en CLIENTE y EMPLEADO. Ambas entidades comparten num\_documento, nombre\_completo y correo, y cada una conserva sus propios atributos.

- **Total:** toda persona del sistema es cliente o empleado, y por eso la línea hacia el triángulo es doble.
- **Solapada (o):** una persona puede ser a la vez cliente y empleado.
- En el triángulo ISA la punta apunta al supertipo (PERSONA), y los subtipos van conectados a la base.

En el esquema de tablas no existe una tabla PERSONA: las columnas comunes se repiten en `clientes` y `empleados`. Por eso la generalización se deduce del esquema.

## Agregación

Hay **una agregación**: la relación **INVENTARIO** (ALMACEN – PRODUCTO) se trata como una entidad de nivel superior que se relaciona con **MOVIMIENTO\_INVENTARIO** mediante la relación *registra*.

- Un movimiento no pertenece a un almacén ni a un producto por separado: pertenece a un producto **en un almacén**, es decir, a un registro de inventario.
- Por la regla de las agregaciones, la relación conectada a la agregación lleva **todas las llaves primarias** de las entidades agregadas. Por eso `movimientos_inventario` incluye `id_almacen` e `id_producto`, además de su propia llave `id_movimiento`.
- Las demás tablas de detalle solo combinan dos llaves y se modelan como relaciones N:M con atributos, sin agregación.

## 
