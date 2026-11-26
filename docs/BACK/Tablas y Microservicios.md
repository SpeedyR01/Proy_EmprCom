# Tablas y Microservicios

# Microservicios de Catalogo y Terceros

| **Tabla** | **Attributos Principales** |
| --- | --- |
| **sedes** | id_sede, nombre, ciudad, direccion, tipo_sede, estado |
| **almacenes** | id_almacen, id_sede, nombre, tipo_almacen, estado |
| **categorias** | id_categoria, nombre, descripcion, estado |
| **productos** | id_producto, sku, nombre, id_categoria, unidad_medida, precio_lista, estado |
| **proveedores** | id_proveedor, identificacion, razon_social, ciudad, correo, telefono, estado |
| **producto_proveedor** | id_producto, id_proveedor, costo_referencia, plazo_entrega_dias |
| **clientes** | id_cliente, tipo_documento, num_documento, nombre_completo, correo, telefono, estado |

Las sedes y los almacenes permiten representar las cuatro sedes y las cuatro bodegas exgidas.

# Microservicio de Identidad y Accesos

| **Tabla** | **Atributos Principales** |
| --- | --- |
| **Empleados** | id_empleado, id_sede, num_documento, nombre_completo, id_cargo, correo, estado |
| **Cargos** | id_cargo, nombre, descripcion |
| **Usuarios** | id_usuario, id_empleado, nombre_usuario, password_hash, estado, fecha_creacion |
| **Roles** | id_rol, nombre, descripcion |
| **Usuario_Rol** | id_usuario, id_rol |
| **Auditoria_Accesos** | id_auditoria, id_usuario, fecha_hora, accion, objeto_consultado |

# Microservicios de Compras y Abastecimiento

| **Tabla** | **Atributos Principales** |
| --- | --- |
| **Ordenes_Compra** | id_orden_compra, id_proveedor, id_almacen_destino, id_empleado, fecha_orden, fecha_estimada, estado |
| **Detalle_Orden_Compra** | id_orden_compra, id_producto, cantidad_solicitada, costo_unitario |
| **Recepciones_Compra** | id_recepcion, id_orden_compra, fecha_recepcion, estado |
| **Detalle_Recepcion** | id_recepcion, id_producto, cantidad_recibida |

# Microsericios de Inventarios

| **Tabla** | **Atributos Principales** |
| --- | --- |
| **Inventarios** | id_almacen, id_producto, existencia_actual, stock_minimo, fecha_actualizacion |
| **Movimientos_Inventario** | id_movimiento, id_almacen, id_producto, tipo_movimiento, cantidad, fecha |
| **Ajustes_Inventario** | id_ajuste, id_almacen, id_empleado, fecha, motivo, estado |

Inventarios permite conocer las existencias actuales, mientras que Moviemientos_Inventario registra las entradas y salidas que explican sus cambios.

Ajustes_Inventario permite documentar correciones por diferencias encontradas durante los conteos fisicos. 

# Microservicios de Transferencias

| **Tabla** | **Atributos Principales** |
| --- | --- |
| **Transferencias** | id_transferencia, id_almacen_origen, id_almacen_destino, fecha_solicitud, fecha_despacho, fecha_recepcion, estado |
| **Detalles_Transferencia** | id_transferencia, id_producto, cantidad_enviada, cantidad_recibida |

# Microservicios de Ventas, Pagos y Devoluciones

| **Tabla** | **Atributos Principales** |
| --- | --- |
| **Pedidos_Venta** | id_pedido, id_sede, id_almacen, id_cliente, id_empleado, fecha_pedido, estado, total_registrado |
| **Detalle_Pedido** | id_pedido, id_producto, cantidad, precio_unitario |
| **Ventas** | id_venta, id_pedido, fecha_venta, estado |
| **Pagos** | id_pago, id_venta, fecha_pago, valor, medio_pago, estado |
| **Devoluciones** | id_devolucion, id_venta, fecha_solicitud, motivo, estado |
| **Detalle_Devolucion** | id_devolucion, id_producto, cantidad, condicion_producto |

Ventas permite diferencias los pedidos de las operaciones comerciales confirmadas, tambien se relaciona Pagos con Ventas, porque los pagos corresponden a la operacion comercial que se este cancelando.

Las decoluciones deben referencias la venta original para garantizar que los productos devueltos realmente hayan sido vendidos. No se agregan tablas separadas para reembolsos, facturas ni cuentas por cobrar. 

# Microserivicio Reportes

Este microservicio no necesita tablas de negocio adicionales.Se implementará mediante vistas y consultas SQL de solo lectura.

Las principales consultas serán:

- Inventario consolidado por sede y almacén.
- Productos con existencias inferiores al mínimo.
- Compras por proveedor.
- Cantidades solicitadas y recibidas por orden de compra.
- Ventas por sede y periodo.
- Pagos registrados por venta.
- Transferencias entre almacenes.
- Devoluciones por producto y motivo.
- Historial de movimientos de inventario.

---

> **Nota sobre ajustes al modelo.** Respecto a la primera versión de este documento se aplicaron tres correcciones de consistencia:
> 1. `movimientos_inventario` pasó a tener clave primaria propia (`id_movimiento`) y los atributos `tipo_movimiento`, `cantidad` y `fecha`, ya que antes repetía los campos de `inventarios` y no podía cumplir su función de registrar entradas/salidas.
> 2. `detalle_recepcion` eliminó el atributo redundante `id_orden_compra` (ya se hereda a través de la recepción).
> 3. Se unificó `id_producto` (singular) y `tipo_almacen`.

---

# Modelo Relacional

El modelo relacional se expresa listando cada relación (tabla) con sus atributos. La **clave primaria** se marca con <u>subrayado</u> y las **claves foráneas** con *(FK → tabla.columna)*.

### Catálogo y Terceros

- **sedes**(<u>id_sede</u>, nombre, ciudad, direccion, tipo_sede, estado)
- **almacenes**(<u>id_almacen</u>, id_sede *(FK → sedes)*, nombre, tipo_almacen, estado)
- **categorias**(<u>id_categoria</u>, nombre, descripcion, estado)
- **productos**(<u>id_producto</u>, sku, nombre, id_categoria *(FK → categorias)*, unidad_medida, precio_lista, estado)
- **proveedores**(<u>id_proveedor</u>, identificacion, razon_social, ciudad, correo, telefono, estado)
- **producto_proveedor**(<u>id_producto</u> *(FK → productos)*, <u>id_proveedor</u> *(FK → proveedores)*, costo_referencia, plazo_entrega_dias)
- **clientes**(<u>id_cliente</u>, tipo_documento, num_documento, nombre_completo, correo, telefono, estado)

### Identidad y Accesos

- **cargos**(<u>id_cargo</u>, nombre, descripcion)
- **empleados**(<u>id_empleado</u>, id_sede *(FK → sedes)*, num_documento, nombre_completo, id_cargo *(FK → cargos)*, correo, estado)
- **usuarios**(<u>id_usuario</u>, id_empleado *(FK → empleados, UNIQUE)*, nombre_usuario, password_hash, estado, fecha_creacion)
- **roles**(<u>id_rol</u>, nombre, descripcion)
- **usuario_rol**(<u>id_usuario</u> *(FK → usuarios)*, <u>id_rol</u> *(FK → roles)*)
- **auditoria_accesos**(<u>id_auditoria</u>, id_usuario *(FK → usuarios)*, fecha_hora, accion, objeto_consultado)

### Compras y Abastecimiento

- **ordenes_compra**(<u>id_orden_compra</u>, id_proveedor *(FK → proveedores)*, id_almacen_destino *(FK → almacenes)*, id_empleado *(FK → empleados)*, fecha_orden, fecha_estimada, estado)
- **detalle_orden_compra**(<u>id_orden_compra</u> *(FK → ordenes_compra)*, <u>id_producto</u> *(FK → productos)*, cantidad_solicitada, costo_unitario)
- **recepciones_compra**(<u>id_recepcion</u>, id_orden_compra *(FK → ordenes_compra)*, fecha_recepcion, estado)
- **detalle_recepcion**(<u>id_recepcion</u> *(FK → recepciones_compra)*, <u>id_producto</u> *(FK → productos)*, cantidad_recibida)

### Inventarios

- **inventarios**(<u>id_almacen</u> *(FK → almacenes)*, <u>id_producto</u> *(FK → productos)*, existencia_actual, stock_minimo, fecha_actualizacion)
- **movimientos_inventario**(<u>id_movimiento</u>, id_almacen *(FK → almacenes)*, id_producto *(FK → productos)*, tipo_movimiento, cantidad, fecha)
- **ajustes_inventario**(<u>id_ajuste</u>, id_almacen *(FK → almacenes)*, id_empleado *(FK → empleados)*, fecha, motivo, estado)

### Transferencias

- **transferencias**(<u>id_transferencia</u>, id_almacen_origen *(FK → almacenes)*, id_almacen_destino *(FK → almacenes)*, fecha_solicitud, fecha_despacho, fecha_recepcion, estado)
- **detalles_transferencia**(<u>id_transferencia</u> *(FK → transferencias)*, <u>id_producto</u> *(FK → productos)*, cantidad_enviada, cantidad_recibida)

### Ventas, Pagos y Devoluciones

- **pedidos_venta**(<u>id_pedido</u>, id_sede *(FK → sedes)*, id_almacen *(FK → almacenes)*, id_cliente *(FK → clientes)*, id_empleado *(FK → empleados)*, fecha_pedido, estado, total_registrado)
- **detalle_pedido**(<u>id_pedido</u> *(FK → pedidos_venta)*, <u>id_producto</u> *(FK → productos)*, cantidad, precio_unitario)
- **ventas**(<u>id_venta</u>, id_pedido *(FK → pedidos_venta, UNIQUE)*, fecha_venta, estado)
- **pagos**(<u>id_pago</u>, id_venta *(FK → ventas)*, fecha_pago, valor, medio_pago, estado)
- **devoluciones**(<u>id_devolucion</u>, id_venta *(FK → ventas)*, fecha_solicitud, motivo, estado)
- **detalle_devolucion**(<u>id_devolucion</u> *(FK → devoluciones)*, <u>id_producto</u> *(FK → productos)*, cantidad, condicion_producto)

---

# Normalización hasta Tercera Forma Normal (3FN)

La normalización organiza las columnas y tablas para **reducir la redundancia** y **evitar anomalías** de inserción, actualización y eliminación. A continuación se justifica cómo el modelo cumple cada forma normal.

## Primera Forma Normal (1FN)

> **Regla:** todos los atributos son **atómicos** (un solo valor por celda, sin listas ni grupos repetitivos) y cada tabla tiene **clave primaria** que identifica unívocamente cada fila.

**Por qué cumple:**

1. **Atomicidad.** Ningún atributo guarda listas ni valores compuestos:
   - Un producto con varios proveedores no almacena una lista en `productos`; usa `producto_proveedor` (una fila por par).
   - Un pedido con varios ítems no los guarda en una celda; cada ítem es una fila en `detalle_pedido`.
   - Un usuario con varios roles no guarda `"ADMIN,VENDEDOR"`; se modela en `usuario_rol`.
2. **Clave primaria en todas las tablas.** Simple (`id_sede`, `id_producto`…) o **compuesta** en las tablas puente/detalle (`inventarios` = {id_almacen, id_producto}, `usuario_rol` = {id_usuario, id_rol}).
3. **Sin grupos repetitivos.** No existen columnas `producto_1`, `producto_2`… La relación uno-a-muchos siempre se resuelve con una tabla hija.

✅ **Todas las relaciones cumplen 1FN.**

## Segunda Forma Normal (2FN)

> **Regla:** está en 1FN **y** ningún atributo no clave depende *parcialmente* de la clave. En tablas con clave compuesta, cada atributo no clave debe depender de **toda** la clave. (Las tablas con PK simple la cumplen automáticamente.)

**Análisis de las tablas con clave compuesta:**

| Tabla (PK compuesta) | Atributos no clave | ¿Dependen de TODA la clave? |
|---|---|---|
| `producto_proveedor` {id_producto, id_proveedor} | costo_referencia, plazo_entrega_dias | ✅ Sí, son propios del par producto–proveedor. |
| `detalle_orden_compra` {id_orden_compra, id_producto} | cantidad_solicitada, costo_unitario | ✅ Sí, aplican a ese producto en esa orden. |
| `detalle_recepcion` {id_recepcion, id_producto} | cantidad_recibida | ✅ Sí, de ese producto en esa recepción. |
| `inventarios` {id_almacen, id_producto} | existencia_actual, stock_minimo, fecha_actualizacion | ✅ Sí, de ese producto en ese almacén. |
| `detalles_transferencia` {id_transferencia, id_producto} | cantidad_enviada, cantidad_recibida | ✅ Sí. |
| `detalle_pedido` {id_pedido, id_producto} | cantidad, precio_unitario | ✅ Sí. |
| `detalle_devolucion` {id_devolucion, id_producto} | cantidad, condicion_producto | ✅ Sí. |
| `usuario_rol` {id_usuario, id_rol} | (sin atributos no clave) | ✅ Trivialmente. |

**Punto clave:** `precio_unitario` (en detalle_pedido) y `costo_unitario` (en detalle_orden_compra) se guardan de forma intencional: representan el valor **pactado en ese momento** y dependen del par, no solo del producto. No es redundancia, es dato histórico. Atributos que dependen solo del producto (`nombre`, `sku`) no se repiten en los detalles.

✅ **Todas las relaciones cumplen 2FN.**

## Tercera Forma Normal (3FN)

> **Regla:** está en 2FN **y** no hay *dependencias transitivas*: ningún atributo no clave depende de otro atributo no clave. Todo atributo no clave depende directamente de la clave.

**Por qué cumple:**

1. **Categoría del producto.** `productos` guarda `id_categoria` (FK), no `nombre_categoria`. El nombre vive solo en `categorias` → sin transitividad.
2. **Cargo del empleado.** `empleados` guarda `id_cargo` (FK), no `nombre_cargo`.
3. **Datos de sede, cliente, proveedor, almacén.** En `pedidos_venta`, `ordenes_compra`, etc., solo se guardan las FK, nunca nombres ni direcciones.
4. **Datos de empleado en usuarios.** `usuarios` referencia `id_empleado` y no duplica `nombre_completo` ni `correo`.
5. **Totales calculados.** `pedidos_venta.total_registrado` se conserva como *snapshot* controlado del total al confirmar el pedido (igual criterio que `precio_unitario`); depende de `id_pedido`. En un modelo estrictamente sin derivados se eliminaría y se calcularía con `SUM(cantidad * precio_unitario)`.

**Verificación (ejemplos):**

| Tabla | Atributo no clave | Depende de… | ¿Transitiva? |
|---|---|---|---|
| productos | nombre, sku, precio_lista, unidad_medida | id_producto | ❌ No |
| productos | id_categoria | id_producto | ❌ No (FK; resto en `categorias`) |
| empleados | nombre_completo, num_documento, correo | id_empleado | ❌ No |
| pedidos_venta | fecha_pedido, estado, total_registrado | id_pedido | ❌ No |
| pagos | valor, medio_pago, estado, fecha_pago | id_pago | ❌ No |
| almacenes | nombre, tipo_almacen, estado | id_almacen | ❌ No |

✅ **Todas las relaciones cumplen 3FN.**

## Resumen de normalización

| Forma Normal | Requisito | Estado |
|---|---|---|
| **1FN** | Atributos atómicos + PK en cada tabla + sin grupos repetitivos | ✅ Cumple |
| **2FN** | 1FN + sin dependencias parciales de la clave compuesta | ✅ Cumple |
| **3FN** | 2FN + sin dependencias transitivas entre atributos no clave | ✅ Cumple |

---

# Diccionario de Datos

Convenciones de **restricciones**: `PK` = clave primaria, `FK` = clave foránea, `NN` = NOT NULL, `UQ` = UNIQUE, `AI` = AUTO_INCREMENT, `DEF` = valor por defecto.

## Catálogo y Terceros

### Tabla: `sedes`
| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| id_sede | INT UNSIGNED | PK, AI, NN | Identificador único de la sede. |
| nombre | VARCHAR(100) | NN | Nombre de la sede. |
| ciudad | VARCHAR(80) | NN | Ciudad donde se ubica. |
| direccion | VARCHAR(255) | | Dirección física. |
| tipo_sede | ENUM('PRINCIPAL','SUCURSAL') | NN | Tipo de sede. |
| estado | ENUM('ACTIVO','INACTIVO') | NN, DEF 'ACTIVO' | Estado lógico del registro. |

### Tabla: `almacenes`
| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| id_almacen | INT UNSIGNED | PK, AI, NN | Identificador único del almacén. |
| id_sede | INT UNSIGNED | FK → sedes.id_sede, NN | Sede a la que pertenece el almacén. |
| nombre | VARCHAR(100) | NN | Nombre del almacén/bodega. |
| tipo_almacen | ENUM('PRINCIPAL','SECUNDARIO') | NN | Tipo de almacén. |
| estado | ENUM('ACTIVO','INACTIVO') | NN, DEF 'ACTIVO' | Estado lógico. |

### Tabla: `categorias`
| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| id_categoria | INT UNSIGNED | PK, AI, NN | Identificador de la categoría. |
| nombre | VARCHAR(100) | NN, UQ | Nombre de la categoría. |
| descripcion | VARCHAR(255) | | Descripción de la categoría. |
| estado | ENUM('ACTIVO','INACTIVO') | NN, DEF 'ACTIVO' | Estado lógico. |

### Tabla: `productos`
| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| id_producto | INT UNSIGNED | PK, AI, NN | Identificador del producto. |
| sku | VARCHAR(50) | NN, UQ | Código único de referencia del producto. |
| nombre | VARCHAR(150) | NN | Nombre del producto. |
| id_categoria | INT UNSIGNED | FK → categorias.id_categoria, NN | Categoría a la que pertenece. |
| unidad_medida | VARCHAR(20) | NN | Unidad de medida (UND, KG, LT…). |
| precio_lista | DECIMAL(12,2) | NN, DEF 0 | Precio de lista base. |
| estado | ENUM('ACTIVO','INACTIVO') | NN, DEF 'ACTIVO' | Estado lógico. |

### Tabla: `proveedores`
| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| id_proveedor | INT UNSIGNED | PK, AI, NN | Identificador del proveedor. |
| identificacion | VARCHAR(30) | NN, UQ | NIT/identificación tributaria. |
| razon_social | VARCHAR(150) | NN | Razón social del proveedor. |
| ciudad | VARCHAR(80) | | Ciudad del proveedor. |
| correo | VARCHAR(120) | | Correo de contacto. |
| telefono | VARCHAR(20) | | Teléfono de contacto. |
| estado | ENUM('ACTIVO','INACTIVO') | NN, DEF 'ACTIVO' | Estado lógico. |

### Tabla: `producto_proveedor`
| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| id_producto | INT UNSIGNED | PK, FK → productos.id_producto, NN | Producto suministrado. |
| id_proveedor | INT UNSIGNED | PK, FK → proveedores.id_proveedor, NN | Proveedor que lo suministra. |
| costo_referencia | DECIMAL(12,2) | NN, DEF 0 | Costo de referencia del proveedor. |
| plazo_entrega_dias | INT UNSIGNED | | Días estimados de entrega. |

### Tabla: `clientes`
| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| id_cliente | INT UNSIGNED | PK, AI, NN | Identificador del cliente. |
| tipo_documento | ENUM('CC','NIT','CE','PAS') | NN | Tipo de documento. |
| num_documento | VARCHAR(30) | NN, UQ | Número de documento. |
| nombre_completo | VARCHAR(150) | NN | Nombre o razón social del cliente. |
| correo | VARCHAR(120) | | Correo del cliente. |
| telefono | VARCHAR(20) | | Teléfono del cliente. |
| estado | ENUM('ACTIVO','INACTIVO') | NN, DEF 'ACTIVO' | Estado lógico. |

## Identidad y Accesos

### Tabla: `cargos`
| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| id_cargo | INT UNSIGNED | PK, AI, NN | Identificador del cargo. |
| nombre | VARCHAR(100) | NN, UQ | Nombre del cargo. |
| descripcion | VARCHAR(255) | | Descripción de funciones. |

### Tabla: `empleados`
| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| id_empleado | INT UNSIGNED | PK, AI, NN | Identificador del empleado. |
| id_sede | INT UNSIGNED | FK → sedes.id_sede, NN | Sede de adscripción. |
| num_documento | VARCHAR(30) | NN, UQ | Documento de identidad. |
| nombre_completo | VARCHAR(150) | NN | Nombre completo. |
| id_cargo | INT UNSIGNED | FK → cargos.id_cargo, NN | Cargo que desempeña. |
| correo | VARCHAR(120) | | Correo corporativo. |
| estado | ENUM('ACTIVO','INACTIVO') | NN, DEF 'ACTIVO' | Estado lógico. |

### Tabla: `usuarios`
| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| id_usuario | INT UNSIGNED | PK, AI, NN | Identificador del usuario. |
| id_empleado | INT UNSIGNED | FK → empleados.id_empleado, NN, UQ | Empleado dueño del usuario (1:1). |
| nombre_usuario | VARCHAR(50) | NN, UQ | Nombre de inicio de sesión. |
| password_hash | VARCHAR(255) | NN | Hash de la contraseña. |
| estado | ENUM('ACTIVO','INACTIVO') | NN, DEF 'ACTIVO' | Estado de la cuenta. |
| fecha_creacion | DATETIME | NN, DEF CURRENT_TIMESTAMP | Fecha de creación de la cuenta. |

### Tabla: `roles`
| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| id_rol | INT UNSIGNED | PK, AI, NN | Identificador del rol. |
| nombre | VARCHAR(80) | NN, UQ | Nombre del rol. |
| descripcion | VARCHAR(255) | | Descripción del rol. |

### Tabla: `usuario_rol`
| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| id_usuario | INT UNSIGNED | PK, FK → usuarios.id_usuario, NN | Usuario asignado. |
| id_rol | INT UNSIGNED | PK, FK → roles.id_rol, NN | Rol asignado. |

### Tabla: `auditoria_accesos`
| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| id_auditoria | BIGINT UNSIGNED | PK, AI, NN | Identificador del registro de auditoría. |
| id_usuario | INT UNSIGNED | FK → usuarios.id_usuario, NN | Usuario que ejecutó la acción. |
| fecha_hora | DATETIME | NN, DEF CURRENT_TIMESTAMP | Momento de la acción. |
| accion | VARCHAR(100) | NN | Acción realizada (LOGIN, CONSULTA…). |
| objeto_consultado | VARCHAR(150) | | Recurso u objeto accedido. |

## Compras y Abastecimiento

### Tabla: `ordenes_compra`
| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| id_orden_compra | INT UNSIGNED | PK, AI, NN | Identificador de la orden de compra. |
| id_proveedor | INT UNSIGNED | FK → proveedores.id_proveedor, NN | Proveedor al que se compra. |
| id_almacen_destino | INT UNSIGNED | FK → almacenes.id_almacen, NN | Almacén que recibirá la mercancía. |
| id_empleado | INT UNSIGNED | FK → empleados.id_empleado, NN | Empleado que genera la orden. |
| fecha_orden | DATE | NN | Fecha de emisión de la orden. |
| fecha_estimada | DATE | | Fecha estimada de entrega. |
| estado | ENUM('BORRADOR','ENVIADA','RECIBIDA','ANULADA') | NN, DEF 'BORRADOR' | Estado de la orden. |

### Tabla: `detalle_orden_compra`
| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| id_orden_compra | INT UNSIGNED | PK, FK → ordenes_compra.id_orden_compra, NN | Orden a la que pertenece. |
| id_producto | INT UNSIGNED | PK, FK → productos.id_producto, NN | Producto solicitado. |
| cantidad_solicitada | INT UNSIGNED | NN | Cantidad pedida. |
| costo_unitario | DECIMAL(12,2) | NN | Costo pactado por unidad. |

### Tabla: `recepciones_compra`
| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| id_recepcion | INT UNSIGNED | PK, AI, NN | Identificador de la recepción. |
| id_orden_compra | INT UNSIGNED | FK → ordenes_compra.id_orden_compra, NN | Orden de compra asociada. |
| fecha_recepcion | DATE | NN | Fecha de recepción. |
| estado | ENUM('PARCIAL','COMPLETA','ANULADA') | NN, DEF 'PARCIAL' | Estado de la recepción. |

### Tabla: `detalle_recepcion`
| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| id_recepcion | INT UNSIGNED | PK, FK → recepciones_compra.id_recepcion, NN | Recepción a la que pertenece. |
| id_producto | INT UNSIGNED | PK, FK → productos.id_producto, NN | Producto recibido. |
| cantidad_recibida | INT UNSIGNED | NN | Cantidad efectivamente recibida. |

## Inventarios

### Tabla: `inventarios`
| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| id_almacen | INT UNSIGNED | PK, FK → almacenes.id_almacen, NN | Almacén. |
| id_producto | INT UNSIGNED | PK, FK → productos.id_producto, NN | Producto. |
| existencia_actual | DECIMAL(12,2) | NN, DEF 0 | Cantidad disponible actual. |
| stock_minimo | DECIMAL(12,2) | NN, DEF 0 | Nivel mínimo de reposición. |
| fecha_actualizacion | DATETIME | NN, DEF CURRENT_TIMESTAMP | Última actualización. |

### Tabla: `movimientos_inventario`
| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| id_movimiento | BIGINT UNSIGNED | PK, AI, NN | Identificador del movimiento. |
| id_almacen | INT UNSIGNED | FK → almacenes.id_almacen, NN | Almacén afectado. |
| id_producto | INT UNSIGNED | FK → productos.id_producto, NN | Producto afectado. |
| tipo_movimiento | ENUM('ENTRADA','SALIDA','AJUSTE') | NN | Tipo de movimiento. |
| cantidad | DECIMAL(12,2) | NN | Cantidad movida. |
| fecha | DATETIME | NN, DEF CURRENT_TIMESTAMP | Fecha y hora del movimiento. |

### Tabla: `ajustes_inventario`
| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| id_ajuste | INT UNSIGNED | PK, AI, NN | Identificador del ajuste. |
| id_almacen | INT UNSIGNED | FK → almacenes.id_almacen, NN | Almacén ajustado. |
| id_empleado | INT UNSIGNED | FK → empleados.id_empleado, NN | Empleado que realiza el ajuste. |
| fecha | DATETIME | NN, DEF CURRENT_TIMESTAMP | Fecha del ajuste. |
| motivo | VARCHAR(255) | NN | Motivo del ajuste. |
| estado | ENUM('BORRADOR','APLICADO','ANULADO') | NN, DEF 'BORRADOR' | Estado del ajuste. |

## Transferencias

### Tabla: `transferencias`
| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| id_transferencia | INT UNSIGNED | PK, AI, NN | Identificador de la transferencia. |
| id_almacen_origen | INT UNSIGNED | FK → almacenes.id_almacen, NN | Almacén que despacha. |
| id_almacen_destino | INT UNSIGNED | FK → almacenes.id_almacen, NN | Almacén que recibe. |
| fecha_solicitud | DATE | NN | Fecha de solicitud. |
| fecha_despacho | DATE | | Fecha de despacho. |
| fecha_recepcion | DATE | | Fecha de recepción. |
| estado | ENUM('SOLICITADA','DESPACHADA','RECIBIDA','ANULADA') | NN, DEF 'SOLICITADA' | Estado de la transferencia. |

### Tabla: `detalles_transferencia`
| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| id_transferencia | INT UNSIGNED | PK, FK → transferencias.id_transferencia, NN | Transferencia asociada. |
| id_producto | INT UNSIGNED | PK, FK → productos.id_producto, NN | Producto transferido. |
| cantidad_enviada | DECIMAL(12,2) | NN | Cantidad enviada. |
| cantidad_recibida | DECIMAL(12,2) | DEF 0 | Cantidad recibida en destino. |

## Ventas, Pagos y Devoluciones

### Tabla: `pedidos_venta`
| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| id_pedido | INT UNSIGNED | PK, AI, NN | Identificador del pedido. |
| id_sede | INT UNSIGNED | FK → sedes.id_sede, NN | Sede donde se toma el pedido. |
| id_almacen | INT UNSIGNED | FK → almacenes.id_almacen, NN | Almacén que despachará. |
| id_cliente | INT UNSIGNED | FK → clientes.id_cliente, NN | Cliente del pedido. |
| id_empleado | INT UNSIGNED | FK → empleados.id_empleado, NN | Empleado que registra el pedido. |
| fecha_pedido | DATE | NN | Fecha del pedido. |
| estado | ENUM('CREADO','CONFIRMADO','ANULADO') | NN, DEF 'CREADO' | Estado del pedido. |
| total_registrado | DECIMAL(12,2) | NN, DEF 0 | Total del pedido al confirmarse (snapshot). |

### Tabla: `detalle_pedido`
| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| id_pedido | INT UNSIGNED | PK, FK → pedidos_venta.id_pedido, NN | Pedido al que pertenece. |
| id_producto | INT UNSIGNED | PK, FK → productos.id_producto, NN | Producto solicitado. |
| cantidad | DECIMAL(12,2) | NN | Cantidad pedida. |
| precio_unitario | DECIMAL(12,2) | NN | Precio pactado por unidad (histórico). |

### Tabla: `ventas`
| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| id_venta | INT UNSIGNED | PK, AI, NN | Identificador de la venta. |
| id_pedido | INT UNSIGNED | FK → pedidos_venta.id_pedido, NN, UQ | Pedido confirmado como venta (1:1). |
| fecha_venta | DATE | NN | Fecha de la venta. |
| estado | ENUM('CONFIRMADA','ANULADA') | NN, DEF 'CONFIRMADA' | Estado de la venta. |

### Tabla: `pagos`
| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| id_pago | INT UNSIGNED | PK, AI, NN | Identificador del pago. |
| id_venta | INT UNSIGNED | FK → ventas.id_venta, NN | Venta que se paga. |
| fecha_pago | DATETIME | NN, DEF CURRENT_TIMESTAMP | Fecha y hora del pago. |
| valor | DECIMAL(12,2) | NN | Valor pagado. |
| medio_pago | ENUM('EFECTIVO','TARJETA','TRANSFERENCIA','OTRO') | NN | Medio de pago. |
| estado | ENUM('APROBADO','RECHAZADO','ANULADO') | NN, DEF 'APROBADO' | Estado del pago. |

### Tabla: `devoluciones`
| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| id_devolucion | INT UNSIGNED | PK, AI, NN | Identificador de la devolución. |
| id_venta | INT UNSIGNED | FK → ventas.id_venta, NN | Venta original devuelta. |
| fecha_solicitud | DATE | NN | Fecha de solicitud de devolución. |
| motivo | VARCHAR(255) | NN | Motivo de la devolución. |
| estado | ENUM('SOLICITADA','APROBADA','RECHAZADA') | NN, DEF 'SOLICITADA' | Estado de la devolución. |

### Tabla: `detalle_devolucion`
| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| id_devolucion | INT UNSIGNED | PK, FK → devoluciones.id_devolucion, NN | Devolución a la que pertenece. |
| id_producto | INT UNSIGNED | PK, FK → productos.id_producto, NN | Producto devuelto. |
| cantidad | DECIMAL(12,2) | NN | Cantidad devuelta. |
| condicion_producto | ENUM('BUENO','DAÑADO') | NN | Condición del producto devuelto. |
