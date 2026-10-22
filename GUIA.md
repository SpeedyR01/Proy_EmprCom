# 🧭 Guía de ejecución — Proyecto Final BD (hazlo tú mismo)

Esta guía NO trae el código resuelto. Te da el **orden de trabajo**, **qué** hacer en cada paso,
**por qué**, **pistas** de PostgreSQL y una **lista de verificación** para que compruebes tú mismo.

---

## 🎯 Estrategia general (y el alojamiento)

Vas a construir todo en **archivos `.sql`** numerados y **documentos**. Al final lo alojas en:
- **GitHub** → repositorio con todos los scripts y docs (el profe abre un link y ve todo).
- **Neon** (neon.tech) → PostgreSQL gratis en la nube; cargas tus scripts y el profe se conecta
  con psql/pgAdmin a ver los datos vivos.

> Recomendación de flujo: primero haz y prueba TODO en **Neon** (o PostgreSQL local), y cuando
> funcione, lo subes a GitHub. Trabaja incrementalmente: un script, lo ejecutas, verificas, sigues.

---

## 📅 Plan por fases (orden recomendado)

### FASE 0 — Preparar entorno
- [ ] Crea cuenta en https://neon.tech y un proyecto (te da una *connection string*).
- [ ] Instala el cliente `psql` o **pgAdmin 4** en tu máquina.
- [ ] Prueba la conexión: `psql "tu_connection_string"` y ejecuta `SELECT version();`.
- [ ] Crea la estructura de carpetas: `sql/` y `docs/`.

### FASE 1 — Diseño en papel (antes de tocar SQL)
Esto vale muchos puntos y guía todo lo demás.
- [ ] **Documento del problema**: descripción, alcance, supuestos, reglas de negocio.
- [ ] **Diagrama de arquitectura** de los 6 microservicios (puedes usar draw.io, Mermaid o dibujarlo).
      Marca: entidades de cada servicio, quién es responsable, y las dependencias (líneas) entre servicios.
- [ ] **Modelo ER** con cardinalidades (crow's foot). Herramientas: dbdiagram.io, draw.io, pgAdmin ERD.
- [ ] **Modelo relacional** + **normalización a 3FN** (explica por qué cumple 1FN, 2FN, 3FN) +
      **diccionario de datos** (columna, tipo, restricción, descripción).

> **Los 6 microservicios = 6 esquemas:** `catalogo`, `compras`, `inventarios`, `ventas`,
> `identidad`, `reportes`. Memoriza qué tabla vive en cuál (lo tienes en el enunciado, sección 3).

### FASE 2 — Esquemas y DDL
- [ ] `01_schemas.sql`: crea los 6 esquemas.
      *Pista:* `CREATE SCHEMA nombre;`  y para repetir pruebas, `DROP SCHEMA ... CASCADE;` antes.
- [ ] `02_ddl_catalogo.sql` ... `06_ddl_identidad.sql`: una tabla a la vez.
      Para cada tabla pregúntate:
      - ¿Cuál es la **PK**? (simple o compuesta, p. ej. los detalles usan PK compuesta)
      - ¿Qué columnas llevan **FK**? (solo FK físicas **dentro** del mismo esquema).
      - ¿Qué necesita **UNIQUE**? (SKU de producto, num_documento de cliente/empleado, etc.)
      - ¿Qué **CHECK**? (cantidades > 0, valores >= 0, estados IN ('activo','inactivo'), etc.)
      - ¿Qué columnas son **NOT NULL**?
      *Pista estados:* `estado VARCHAR(10) CHECK (estado IN ('activo','inactivo'))`.
      *Pista fechas coherentes:* un CHECK de tabla como `CHECK (fecha_estimada >= fecha_orden)`.

> **Decisión clave (documéntala):** las relaciones **entre** microservicios NO se hacen con FK
> físicas, sino con "identificadores compartidos" (guardas el id pero sin `REFERENCES` a otro
> esquema). Dentro del mismo esquema sí usas FK. Esto simula bases independientes por servicio.

### FASE 3 — Fragmentación horizontal por sede (lo que más confunde)
Debes fragmentar **inventarios** y **pedidos de venta** por sede (4 sedes → 4 fragmentos cada uno).
- [ ] Crea **4 tablas físicas** por conjunto, p. ej. `inventarios.inv_sede_norte`, `inv_sede_sur`,
      `inv_sede_centro`, `inv_sede_distrib`. Misma estructura en las 4.
- [ ] En cada fragmento añade `CHECK (id_sede = N)` con el N fijo de esa sede.
      *Por qué:* impide que una fila de una sede entre en el fragmento de otra → sin solapamiento.
- [ ] Crea una **vista consolidada** con `UNION ALL` de los 4 fragmentos
      (`CREATE VIEW inventarios.inventarios AS SELECT ... UNION ALL ...`).
- [ ] Repite lo mismo para pedidos (`ventas.pedidos_sede_*` + vista `ventas.pedidos_venta`).

> ⚠️ El enunciado dice: "No basta declarar un filtro WHERE como si fuera fragmentación física".
> Por eso son **tablas separadas**, no un WHERE. Documenta: condición, cobertura, clave y cómo
> evitas duplicación (el CHECK).

### FASE 4 — Datos de prueba (~4 meses)
Metas mínimas: 4 sedes (1 distribución), 4+ almacenes, 80 productos, 5 categorías, 10 proveedores,
100 clientes, 20 empleados, 300 pedidos, 60 compras, 25 transferencias, 20 devoluciones.
- [ ] Inserta primero los **maestros** (sedes, almacenes, categorías, productos, proveedores, clientes, empleados).
- [ ] Para generar muchos registros sin escribirlos a mano, usa `generate_series`:
      *Pista:* `INSERT INTO ... SELECT g, 'SKU-'||g, ... FROM generate_series(1,80) g;`
- [ ] Para fechas repartidas en 4 meses: `CURRENT_DATE - (algo || ' days')::interval`.
- [ ] Incluye a propósito los **casos especiales** (los pide la rúbrica):
      - productos sin inventario en alguna sede (no insertes todos los productos en todas las sedes)
      - existencias en cero o bajo el mínimo (usa `CASE WHEN ... THEN 0 ...`)
      - clientes que compran en ≥2 sedes (reusa los mismos id_cliente en pedidos de distintas sedes)
      - proveedores con retraso (fecha_recepcion > fecha_estimada en algunos)
      - pagos parciales (paga el 50% en algunos pedidos)
      - compras con recepción parcial
      - transferencias en tránsito (despachadas sin fecha de recepción)
      - productos de baja rotación (con stock pero sin ventas en 90 días)
- [ ] Recalcula `total_registrado` de cada pedido desde su detalle con un `UPDATE ... FROM (SELECT ...)`.

### FASE 5 — Roles y permisos
- [ ] `08_roles_permisos.sql`: crea 6 roles (administrador, gerencia, resp_inventario,
      resp_compras, vendedor, auditor).
      *Pistas:* `CREATE ROLE ...;` `GRANT USAGE ON SCHEMA ... TO ...;`
      `GRANT SELECT, INSERT, UPDATE, DELETE ON ... TO ...;` `REVOKE ... FROM ...;`
- [ ] Aplica **mínimo privilegio**: cada rol solo toca su microservicio; reportes es SELECT para todos.
- [ ] Haz una **matriz de permisos** (rol × esquema × operación) en el documento.
- [ ] Crea 1-2 usuarios con LOGIN para demostrar accesos permitidos/denegados.
      *Pista para demostrar denegación:* `SET ROLE rol_vendedor;` luego intenta un UPDATE prohibido
      y verás el error `insufficient_privilege`; vuelve con `RESET ROLE;`.

### FASE 6 — Vistas (mínimo 10)
Crea las 10 vistas con los nombres exactos de la sección 6 del enunciado, en el esquema `reportes`.
- [ ] Empieza por las fáciles (inventario por sede, alertas de reabastecimiento).
- [ ] Las "sin inventario" usan **NOT EXISTS** (producto × sede que no existe en inventarios).
- [ ] Las de saldos/compras usan **LEFT JOIN** + agregación (lo que no pagó/recibió = NULL → COALESCE 0).
- [ ] La `vista_reporte_corporativo` debe **evitar doble conteo**: no juntes ventas e inventario en un
      solo JOIN (relación 1:N infla sumas). Usa **CTE separadas** por métrica y luego únelas por sede.

### FASE 7 — Las 20 consultas
Lee cada una de las 20 (sección 5) y antes de escribirla identifica qué técnica pide. Debes asegurar
en el conjunto: **≥4 CTE**, **≥3 funciones de ventana**, **≥2 operaciones de conjuntos**, además de
JOIN, LEFT JOIN, NOT EXISTS, subconsulta correlacionada, GROUP BY y HAVING.

Mapa de pistas (qué técnica encaja con cada consulta):

| Consulta | Técnica sugerida |
|---|---|
| 4 Top-5 por sede | `DENSE_RANK() OVER (PARTITION BY id_sede ORDER BY unidades DESC)` |
| 5 Variación mensual | `LAG(valor) OVER (PARTITION BY sede ORDER BY mes)` + CTE |
| 6 Clientes multisede | `GROUP BY ... HAVING COUNT(DISTINCT id_sede) >= 2` + `UNION` |
| 3 y 16 | `NOT EXISTS (...)` |
| 10 Demanda vs inventario | subconsulta **correlacionada** (existencia del mismo producto/almacén) |
| 11 Cumplimiento proveedor | varias **CTE** (total / a tiempo / retraso promedio) |
| 18 Comparar surtido | `EXCEPT` y/o `INTERSECT` entre dos sedes |
| 19 Ranking vendedores | `RANK() OVER (PARTITION BY id_sede ORDER BY total DESC)` |
| 20 Consolidado | **CTE** por métrica + LEFT JOIN por sede (evitar duplicar) |

Para cada consulta entrega: **el SQL**, **el resultado** y una **breve interpretación**.

### FASE 8 — Pruebas de verificación (10)
Son las de la sección 11. Para las que "deben fallar" (SKU duplicado, cantidad negativa, FK
inexistente), envuélvelas en un bloque que capture el error y confirme que la restricción actuó:
*Pista:*
```sql
DO $$
BEGIN
    -- intento que debe fallar
    INSERT INTO ...;
    RAISE NOTICE 'FALLO: no debería permitirse';
EXCEPTION WHEN unique_violation THEN   -- o check_violation / foreign_key_violation
    RAISE NOTICE 'OK: la restricción rechazó el intento';
END $$;
```
Para P10 (reporte sin duplicar): compara el `valor_ventas` del reporte con un `SUM` directo; deben coincidir.

### FASE 9 — Alojar y entregar
- [ ] Ejecuta todo de principio a fin en Neon y captura evidencias (resultados de consultas y pruebas).
- [ ] Rellena el documento de análisis con esas evidencias.
- [ ] Sube el repo a GitHub: `git init`, `git add .`, `git commit -m "Proyecto final BD"`,
      crea el repo en github.com y `git push`.
- [ ] En el README pon: integrantes, link/instrucciones de Neon, y cómo ejecutar.

---

## ✅ Checklist final

- [ ] 4 sedes (1 distribución) y 4+ almacenes
- [ ] 6 esquemas/microservicios con responsabilidades separadas
- [ ] PK, FK, UNIQUE, NOT NULL, CHECK presentes
- [ ] Fragmentación por sede en inventarios y pedidos + vistas UNION ALL
- [ ] 6 roles con permisos diferenciados + 2 accesos permitidos y 2 denegados demostrados
- [ ] 10 vistas con nombres exactos
- [ ] 20 consultas (≥4 CTE, ≥3 ventana, ≥2 conjuntos, NOT EXISTS, correlacionada, HAVING)
- [ ] Datos ~4 meses con todos los casos especiales
- [ ] 10 pruebas de verificación con evidencia
- [ ] 15 entregables de la sección 12 (documentos + scripts + evidencias)
