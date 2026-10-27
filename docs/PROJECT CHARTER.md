# PROJECT CHARTER

## 1. Descripción del problema

La empresa comercial objeto de este proyecto cuenta con múltiples sedes de venta y un centro de distribución encargado de apoyar el abastecimiento de los diferentes puntos de operación. Cada sede administra sus almacenes y participa en procesos de compras, ventas, control de existencias, transferencias de productos y devoluciones. Estas operaciones requieren información consistente y actualizada para garantizar la disponibilidad de los productos, controlar los movimientos de inventario y generar reportes confiables sobre el funcionamiento de la empresa.

La administración representa un desafío cuando los datos de las distintas sedes deben consultarse de manera individual y consolidarse para obtener una visión general del negocio. La falta de una estructura de datos bien definida puede ocasionar duplicidad de información, inconsistencias en las existencias, dificultades para hacer seguimiento a las compras y ventas, errores en el registro de pagos y limitaciones para consultar los resultados históricos.

Para atender esta necesidad, se propone diseñar e implementar una solución de bases de datos en PostgreSQL bajo una arquitectura basada en microservicios. El sistema organizará la información en componentes con responsabilidades específicas: catálogo y terceros, identidad y accesos, compras y abastecimiento, inventarios, transferencias, ventas, pagos y devoluciones. Adicionalmente, contará con un componente de reportes e integración que permitirá consultar información consolidada de los diferentes servicios.

El diseño deberá garantizar la integridad y trazabilidad de los datos mediante claves primarias y foráneas cuando correspondan, restricciones de unicidad, obligatoriedad y validación de valores, así como la conservación de los precios y costos históricos de las operaciones. También deberá contemplar la distribución horizontal de los datos de inventarios y pedidos por sede, la administración de permisos de acceso y la construcción de vistas SQL para facilitar las consultas recurrentes.

## 2. Alcance del proyecto

El proyecto comprende el diseño, la documentación y la implementación de la capa de datos necesaria para administrar las operaciones comerciales de la empresa. Se utilizará PostgreSQL como sistema gestor de bases de datos y se organizarán las responsabilidades de acuerdo con los límites definidos para los microservicios.

El alcance incluye las siguientes actividades:

**2.1. Administración de sedes y almacenes.** Registrar las sedes comerciales y el centro de distribución, identificar sus almacenes y establecer las relaciones necesarias para asociar las operaciones con la ubicación correspondiente.

**2.2. Gestión del catálogo y terceros.** Administrar productos, categorías, proveedores y clientes, garantizando la identificación única de los productos mediante su SKU y permitiendo la relación de un producto con uno o varios proveedores.

**2.3. Gestión de identidad y accesos.** Registrar empleados, cargos, usuarios y roles funcionales, así como mantener un historial de auditoría de las acciones de acceso contempladas por el sistema. Se configurarán los permisos de PostgreSQL para diferenciar las operaciones autorizadas de consulta y modificación.

**2.4. Gestión de compras y recepciones.** Registrar órdenes de compra con sus proveedores, almacenes de destino, fechas, productos, cantidades y costos unitarios. El sistema deberá permitir recepciones totales y parciales, conservando la relación entre las cantidades recibidas y los productos solicitados originalmente.

**2.5. Control de inventarios.** Registrar las existencias por almacén y producto, los niveles mínimos y los movimientos de entrada y salida. Se contemplarán los ajustes de inventario y la trazabilidad de los cambios realizados.

**2.6. Gestión de transferencias.** Registrar los traslados de productos entre almacenes, incluyendo origen, destino, fechas, cantidades despachadas, cantidades recibidas y estado de la operación.

**2.7. Gestión de ventas, pagos y devoluciones.** Registrar pedidos asociados a una sede, un cliente y un empleado; almacenar sus productos, cantidades y precios unitarios; diferenciar los pedidos de las ventas confirmadas; registrar varios pagos por venta y gestionar las devoluciones de productos.

**2.8. Reportes e integración.** Crear vistas y consultas SQL que permitan consultar las existencias, detectar productos con niveles de inventario bajos, analizar compras y ventas por periodo, calcular saldos pendientes, consultar transferencias y revisar devoluciones. Se definirán los mecanismos necesarios para integrar información de distintos microservicios.

**2.9. Distribución de datos.** Diseñar y documentar la fragmentación horizontal de inventarios y pedidos por sede, así como el mecanismo para obtener consultas consolidadas. La estrategia física de distribución se ajustará a la arquitectura de PostgreSQL definida para el proyecto.

**2.10. Validación del sistema.** Incorporar datos de prueba suficientes y coherentes para verificar las relaciones, las restricciones, los movimientos operativos, los reportes y las consultas SQL avanzadas requeridas.

## 3. Supuestos

Para realizar el diseño se establecen los siguientes supuestos:

1. La empresa dispone de al menos cuatro sedes operativas, incluyendo un centro de distribución, y cuenta con al menos cuatro almacenes asociados a dichas sedes.
2. Cada sede tiene un identificador único y puede estar asociada con varios almacenes y empleados. Cada almacén pertenece a una única sede.
3. Los productos se identifican mediante un SKU único y pertenecen a una categoría. Un producto puede ser suministrado por varios proveedores y un proveedor puede ofrecer varios productos.
4. Las órdenes de compra se registran antes de recibir los productos. Una orden puede contener varios productos y puede tener múltiples recepciones parciales hasta completar las cantidades solicitadas.
5. Las existencias se controlan por combinación de almacén y producto. La sede correspondiente se determina a partir del almacén al que pertenece el inventario.
6. Los pedidos pueden encontrarse en diferentes estados y no todos se convierten necesariamente en ventas confirmadas. Una venta confirmada corresponde a un pedido y conserva los valores unitarios registrados al momento de la operación.
7. Una venta puede recibir varios pagos. Para el cálculo del saldo pendiente únicamente se consideran los pagos confirmados y válidos.
8. Las devoluciones corresponden a ventas existentes y contienen los productos y las cantidades devueltas. La aceptación de una devolución y su efecto sobre el inventario dependen de su estado y de la condición del producto.
9. Las transferencias se realizan entre almacenes diferentes. Las cantidades despachadas y recibidas se registran por separado para permitir identificar diferencias o incidencias.
10. Los precios de lista de los productos pueden cambiar con el tiempo. Sin embargo, los costos de compra y los precios de venta registrados en los detalles de las operaciones se conservan para mantener la exactitud de los reportes históricos.
11. Cada usuario tiene una identidad registrada y cuenta con los roles funcionales que correspondan a sus responsabilidades. Los permisos efectivos sobre los objetos de PostgreSQL se administran mediante roles y privilegios del gestor de base de datos.
12. Cada microservicio tiene responsabilidades y datos claramente definidos. La implementación podrá utilizar esquemas separados dentro de una misma instancia de PostgreSQL o bases de datos independientes, según la estrategia de despliegue seleccionada y documentada.
13. Los identificadores de entidades administradas por otros microservicios permiten relacionar la información entre servicios. Cuando los datos residan en bases independientes, la integridad de las referencias externas deberá garantizarse mediante mecanismos de aplicación e integración, puesto que no se presupone la existencia de claves foráneas entre bases independientes.
14. Las vistas de reportes se construirán a partir de los datos operativos disponibles y deberán reflejar los estados y criterios de cálculo definidos para cada indicador.
15. Los datos de prueba serán ficticios, pero mantendrán coherencia referencial y operativa para representar escenarios normales y excepcionales.
16. La fragmentación horizontal por sede deberá definirse de manera explícita. La estrategia seleccionada deberá permitir identificar los fragmentos correspondientes a cada sede y realizar consultas consolidadas sobre el conjunto de datos.

## 4. Reglas de negocio

Las reglas de negocio establecen las condiciones que deben cumplir las operaciones para preservar la consistencia de la información y reflejar correctamente los procesos de la empresa.

### 4.1. Sedes, almacenes y empleados

1. Cada sede debe contar con un identificador único.
2. Cada almacén debe pertenecer a una sede existente.
3. Cada empleado debe estar asociado a una sede y a un cargo registrado.
4. Los almacenes de origen y destino de una transferencia deben ser diferentes.
5. Las operaciones deben conservar la identificación de la sede y el almacén que les corresponden.

### 4.2. Productos y proveedores

1. Cada producto debe tener un SKU único, una categoría existente y un estado válido.
2. Un producto puede relacionarse con uno o varios proveedores mediante la entidad de asociación correspondiente.
3. Los costos de referencia de los proveedores no deben reemplazar los costos históricos de las órdenes de compra ya registradas.
4. Los productos inactivos no deben utilizarse en nuevas operaciones que, de acuerdo con las políticas del sistema, requieran productos activos. La desactivación no debe eliminar el historial de operaciones anteriores.

### 4.3. Compras y recepciones

1. Cada orden de compra debe estar asociada a un proveedor existente, un almacén de destino y un empleado responsable.
2. Cada orden debe contener al menos un producto y registrar la cantidad solicitada y el costo unitario correspondiente.
3. Las cantidades solicitadas deben ser mayores que cero y los costos unitarios no pueden ser negativos.
4. Cada recepción debe estar asociada a una orden de compra existente.
5. Cada detalle de recepción debe corresponder a un producto incluido en la orden original.
6. Una orden puede recibirse en una o varias entregas parciales.
7. La cantidad acumulada recibida de un producto no debe superar la cantidad solicitada, salvo que exista una excepción autorizada y documentada.
8. La recepción de productos debe generar los movimientos de entrada de inventario correspondientes, sin duplicar movimientos ante reintentos de una operación.

### 4.4. Inventarios y ajustes

1. La existencia de un producto se controla por almacén, mediante una combinación única de almacén y producto.
2. Las existencias y los stocks mínimos no pueden ser negativos.
3. Las cantidades de los movimientos deben ser positivas; el sentido del movimiento se determina mediante su tipo, por ejemplo, entrada o salida.
4. Todo ajuste de inventario debe identificar el almacén, el producto afectado, la cantidad, el motivo, la fecha y el responsable correspondiente.
5. Los movimientos deben conservarse como historial de las operaciones que afectan las existencias.
6. Los cambios de inventario derivados de compras, ventas, transferencias y devoluciones deben estar vinculados a la operación que los origina.
7. Las operaciones que modifiquen existencias deben controlar la disponibilidad y evitar que dos operaciones concurrentes generen resultados inconsistentes.

### 4.5. Transferencias

1. Cada transferencia debe identificar los almacenes de origen y destino, la fecha de solicitud y el estado de la operación.
2. Cada detalle de transferencia debe identificar un producto y una cantidad enviada mayor que cero.
3. La cantidad recibida no debe superar la cantidad enviada, salvo que se gestione una incidencia autorizada.
4. El despacho debe registrar la salida del almacén de origen y la recepción debe registrar la entrada en el almacén de destino.
5. Las diferencias entre cantidades enviadas y recibidas deben poder identificarse y documentarse.
6. Una transferencia no debe registrarse como completada hasta cumplir las condiciones de recepción definidas por el sistema.

### 4.6. Pedidos, ventas y pagos

1. Cada pedido debe estar asociado a una sede, un cliente, un empleado y un almacén correspondiente.
2. Cada pedido debe contener uno o varios productos con cantidades positivas y precios unitarios no negativos.
3. El total del pedido debe corresponder a la suma de los subtotales de sus detalles, de acuerdo con las reglas de redondeo definidas.
4. Un pedido pendiente o cancelado no debe considerarse automáticamente una venta confirmada.
5. La venta debe conservar los precios unitarios registrados al momento de la operación.
6. Una venta puede tener varios pagos.
7. Los pagos deben registrar su valor, fecha, medio de pago y estado.
8. El saldo pendiente se calcula restando del total de la venta los pagos confirmados y válidos asociados a ella. Los pagos rechazados o anulados no reducen el saldo.
9. El sistema debe impedir o identificar los pagos que excedan el saldo permitido, de acuerdo con las políticas de la empresa.
10. Las ventas y los pagos deben conservar su historial para permitir auditoría y consultas por periodo, sede y estado.

### 4.7. Devoluciones

1. Cada devolución debe asociarse a una venta existente y registrar la fecha de solicitud, el motivo y el estado.
2. Los productos devueltos deben pertenecer a los detalles de la venta original.
3. La cantidad devuelta acumulada de un producto no debe superar la cantidad vendida, descontando las devoluciones anteriores aceptadas.
4. Una devolución solicitada no debe considerarse automáticamente aceptada.
5. Los productos devueltos solo deben reincorporarse a las existencias cuando la devolución haya sido aceptada y su condición permita el reingreso, conforme a las reglas de inventario.
6. Las devoluciones deben conservar la relación con la venta original para mantener la trazabilidad y generar reportes históricos.

### 4.8. Seguridad, auditoría e integridad

1. Cada tabla debe contar con una clave primaria que identifique sus registros.
2. Las relaciones entre tablas deben protegerse mediante claves foráneas cuando se encuentren dentro del mismo ámbito de integridad referencial.
3. Los atributos obligatorios deben definirse como `NOT NULL`, los identificadores únicos mediante `UNIQUE` y las restricciones de dominio mediante `CHECK`, cuando corresponda.
4. Los usuarios deben disponer únicamente de los privilegios de PostgreSQL necesarios para sus funciones.
5. Las acciones de acceso y las operaciones relevantes de auditoría deben registrar el usuario, la fecha y hora, la acción y el objeto afectado o consultado, según corresponda.
6. Los registros históricos de compras, ventas, pagos, transferencias y devoluciones deben conservarse conforme a las políticas de retención que se establezcan.

### 4.9. Reportes e integración

1. Los reportes deben utilizar los estados y criterios de cálculo definidos para cada operación.
2. Las consultas consolidadas deben integrar los datos de las sedes y los almacenes sin duplicar registros.
3. Los inventarios y pedidos deben organizarse de acuerdo con la estrategia de fragmentación horizontal por sede.
4. Los servicios deben tener responsabilidades de datos definidas y no modificar directamente las tablas operativas administradas por otro servicio cuando se utilicen bases de datos independientes.
5. Las vistas de consulta deben proporcionar información consistente con los datos operativos disponibles y permitir verificar los indicadores solicitados.
6. Las consultas de validación y los datos de prueba deben demostrar el cumplimiento de las reglas de integridad, los procesos operativos y los requerimientos de SQL avanzado.

Las reglas que requieren comparar varias filas o tablas, como el control de recepciones acumuladas, los pagos y las devoluciones, deberán implementarse mediante transacciones, restricciones apropiadas, procedimientos o lógica de aplicación, según corresponda. No todas pueden garantizarse mediante una restricción `CHECK` aislada.

## 5. Resultado esperado

Como resultado del proyecto se espera disponer de un modelo de datos relacional documentado e implementado en PostgreSQL, organizado por responsabilidades de microservicio y respaldado por restricciones que garanticen la integridad de la información.

El sistema deberá permitir registrar y consultar las operaciones comerciales de las distintas sedes, mantener la trazabilidad de los movimientos de inventario, gestionar compras y recepciones parciales, registrar ventas y pagos, controlar devoluciones y realizar transferencias entre almacenes. Asimismo, deberá ofrecer reportes mediante vistas SQL, permisos diferenciados, consultas avanzadas y un mecanismo documentado para la distribución horizontal y consolidación de los datos.

La solución deberá validarse mediante datos de prueba coherentes y evidencias de ejecución que demuestren el cumplimiento de los requerimientos establecidos.