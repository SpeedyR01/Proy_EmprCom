# Documentación de Backend y Postman

Este documento describe los archivos creados para la documentación técnica del backend y detalla las pruebas de integración estructuradas en Postman.

## Archivos de Documentación Técnica

La carpeta de documentación del backend incluye archivos diseñados para explicar el funcionamiento del sistema de forma clara y directa:

* **`Reglas_de_Negocio.md`:** Define las restricciones lógicas y de negocio que el backend valida antes de guardar datos. Por ejemplo, asegura que un almacén pertenezca solo a una sede o que los clientes estén activos para poder realizar compras.
* **`Endpoints_API.md`:** Detalla las rutas (URLs) y los métodos HTTP (GET, POST, PUT, DELETE) que el backend expone para cada uno de los microservicios de la plataforma.
* **`Modelos_Payload.md`:** Muestra la estructura exacta (en formato JSON) que el backend espera recibir y enviar al interactuar con la base de datos, sirviendo como contrato para el frontend.

## Estructura de las Carpetas
Todos los microservicios viven dentro de **`backend/`**, con la MISMA estructura que **`ms-identidad`**:
```text
Proy_EmprCom/
└── backend/
    ├── ms-identidad/        (puerto 4001)  
    ├── ms-catalogo/         (puerto 4002)
    ├── ms-compras/          (puerto 4003)
    ├── ms-inventarios/      (puerto 4004)
    ├── ms-transferencias/   (puerto 4005)
    └── ms-ventas/           (puerto 4006)
```
Cada carpeta **`ms-xxx/`** contiene:
```text
ms-xxx/
├── .env
├── .gitignore
├── package.json
└── src/
    ├── server.js
    ├── db.js
    └── <recurso>.routes.js
```

## Pruebas de Postman por Microservicio

A continuación, se describen todas las peticiones preconfiguradas en Postman, organizadas por cada microservicio para cubrir la totalidad de las tablas y entidades del modelo.

### 1. Catálogo y Terceros
| Petición | Método | Descripción |
| :--- | :--- | :--- |
| Listar Sedes | GET | Obtiene todas las sedes registradas. |
| Crear Sede | POST | Registra una nueva sede operativa. |
| Listar Almacenes | GET | Obtiene los almacenes por sede. |
| Crear Almacén | POST | Registra un nuevo almacén asociado a una sede. |
| Listar Categorías | GET | Obtiene las categorías de productos. |
| Crear Categoría | POST | Registra una nueva categoría en el sistema. |
| Listar Productos | GET | Obtiene el catálogo activo de productos. |
| Crear Producto | POST | Registra un nuevo producto con su unidad de medida y precio base. |
| Listar Proveedores | GET | Obtiene la lista de proveedores activos. |
| Crear Proveedor | POST | Registra un nuevo proveedor en el sistema. |
| Listar Clientes | GET | Obtiene el listado de clientes. |
| Crear Cliente | POST | Registra un cliente con su tipo de documento y datos de contacto. |
| Vincular Producto-Proveedor | POST | Asigna el costo de referencia y plazo de entrega entre un producto y un proveedor. |

### 2. Compras y Abastecimiento
| Petición | Método | Descripción |
| :--- | :--- | :--- |
| Listar Órdenes de Compra | GET | Obtiene el historial de órdenes generadas a proveedores. |
| Generar Orden de Compra | POST | Crea una orden de compra con su detalle de productos solicitados y costos unitarios. |
| Aprobar Orden de Compra | PUT | Cambia el estado de una orden a "Aprobada". |
| Listar Recepciones | GET | Obtiene el historial de mercancía recibida en los almacenes. |
| Registrar Recepción | POST | Registra la entrada física de mercancía al almacén destino con su detalle de cantidades. |

### 3. Inventarios y Transferencias
| Petición | Método | Descripción |
| :--- | :--- | :--- |
| Consultar Stock | GET | Verifica la existencia (actual y mínima) de un producto específico en un almacén. |
| Actualizar Inventario | PUT | Actualiza manualmente existencias o el stock mínimo de un producto (Ajuste). |
| Listar Transferencias | GET | Consulta el historial de traslados solicitados entre almacenes. |
| Solicitar Traslado | POST | Crea una solicitud de transferencia (cabecera y detalle) entre un almacén origen y uno destino. |
| Despachar Traslado | PUT | Cambia el estado de la transferencia a "Despachada" y registra la fecha. |
| Confirmar Traslado | PUT | Cambia el estado a "Recibida" y actualiza automáticamente los inventarios (resta origen, suma destino). |

### 4. Ventas y Pagos
| Petición | Método | Descripción |
| :--- | :--- | :--- |
| Listar Pedidos | GET | Obtiene el historial de ventas realizadas a clientes. |
| Registrar Pedido | POST | Crea una venta con su detalle, calculando el total y verificando el stock en el almacén de salida. |
| Listar Pagos | GET | Obtiene los pagos registrados en el sistema. |
| Registrar Pago | POST | Asocia un abono, un valor y un medio de pago a un pedido de venta existente. |
| Listar Devoluciones | GET | Consulta el historial de garantías y devoluciones solicitadas. |
| Crear Devolución | POST | Inicia un proceso de devolución sobre un pedido, indicando motivos, cantidad y condición del producto. |

### 5. Identidad y Accesos
| Petición | Método | Descripción |
| :--- | :--- | :--- |
| Listar Empleados | GET | Obtiene el listado del personal, sus sedes asignadas y cargos. |
| Crear Empleado | POST | Registra a un nuevo trabajador en el sistema. |
| Listar Usuarios | GET | Consulta los usuarios de acceso al sistema, roles y fechas de creación. |
| Crear Usuario | POST | Crea credenciales de acceso para un empleado (encriptando el password_hash y asignando un rol). |
| Login Usuario | POST | Autentica a un usuario registrado y retorna un token de sesión. |
| Consultar Auditoría | GET | Lista el historial detallado de acciones realizadas por un usuario específico (objeto y fecha-hora). |