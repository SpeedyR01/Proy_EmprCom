# Documentación: Fragmentación Horizontal por Sede

Este documento describe la estrategia de **fragmentación horizontal por lista (`PARTITION BY LIST`)** aplicada a las tablas transaccionales clave del sistema (**Inventarios** y **Pedidos de Venta**) en función de la sede de negocio (`id_sede`).

---

## Objetivo de la Fragmentación
En arquitecturas distribuidas o entornos con múltiples sucursales (Sedes: Bogotá, Medellín, Cali, CEDI, etc.), la fragmentación horizontal permite:
1. **Optimizar consultas analíticas** limitando el escaneo de datos a particiones físicas específicas.
2. **Facilitar el mantenimiento** y la administración local de bases de datos distribuidas.
3. **Reconstruir la vista global** mediante vistas unificadas (`UNION ALL`) transparentes para las capas superiores de la aplicación.

---

## Estructura de Particionamiento

### 1. Tabla `frag_inventarios`
Particionada por el identificador de sede (`id_sede`), obtenida directamente a través del almacén asociado.

* **Particiones físicas creadas:**
  * `frag_inventarios_sede1_bogota` (`FOR VALUES IN (1)`)
  * `frag_inventarios_sede2_medellin` (`FOR VALUES IN (2)`)
  * `frag_inventarios_sede3_cali` (`FOR VALUES IN (3)`)
  * `frag_inventarios_sede4_cedi` (`FOR VALUES IN (4)`)
  * `frag_inventarios_otras` (`DEFAULT`)

### 2. Tabla `frag_pedidos`
Particionada por `id_sede`, almacenando los pedidos de venta correspondientes a cada región operativa.

* **Particiones físicas creadas:**
  * `frag_pedidos_sede1_bogota` (`FOR VALUES IN (1)`)
  * `frag_pedidos_sede2_medellin` (`FOR VALUES IN (2)`)
  * `frag_pedidos_sede3_cali` (`FOR VALUES IN (3)`)
  * `frag_pedidos_sede4_cedi` (`FOR VALUES IN (4)`)
  * `frag_pedidos_otras` (`DEFAULT`)

---

## Vistas Unificadas y Resumen Consolidado

Para que las consultas globales sigan operando sin modificaciones en las capas de software, se proveen vistas de abstracción:

* `reportes.vw_inventarios_unificado`: Une todas las particiones de inventario anexando el nombre de la sede.
* `reportes.vw_pedidos_unificado`: Une todas las particiones de pedidos con su respectiva sede.
* `reportes.vw_resumen_consolidado_por_sede`: Vista ejecututiva que resume referencias, existencias totales, número de pedidos e ingresos confirmados por cada sucursal.

---

## Ciclo de Refresco y Ejecución
Los fragmentos se cargan mediante inserciones basadas en consultas sobre las tablas base. Para refrescar los fragmentos ante cambios remotos:
```bash
psql -U usuario -d nombre_bd -f sql/2_fragmentacion.sql
```