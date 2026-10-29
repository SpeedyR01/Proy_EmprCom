# Tablas y Microservicios

# Microservicios de Catalogo y Terceros

| **Tabla** | **Attributos Principales** |
| --- | --- |
| **sedes** | id_sede, nombre, ciudad, direccion, tipo_sede, estado |
| **almacenes** | id_almacen, id_sede, nombre, tipo_almacen, estado |
| **categorias** | id_categoria, nombre, descripcion, estado |
| **productos** | id_productos, sku, nombre, id_categoria, unidad_medida, precio_lista, estado |
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
| **Detalle_Recepcion** | id_recepcion, id_orden_compra, id_producto, cantidad_recibida |

# Microsericios de Inventarios

| **Tabla** | **Atributos Principales** |
| --- | --- |
| **Inventarios** | id_almacen, id_producto, existencia_actual, stock_minimo, fecha_actualizacion |
| **Movimientos_Inventario** | id_almacen, id_producto, existencia_actual, stock_minimo, fecha_actualizacion |
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
