# Documentación: Consultas SQL Avanzadas, Rankings y Auditorías

Este documento detalla los **scripts avanzados** diseñados para análisis de riesgo crediticio, control logístico de órdenes de compra, auditorías de integridad transaccional y validación de particionamiento.

---

## Listado de Consultas Avanzadas

| Código | Nombre / Propósito | Conceptos SQL Utilizados |
|---|---|---|
| **D1** | Análisis de Saldos Pendientes y Clasificación de Riesgo | CTEs (`WITH`), Función de Ventana (`RANK()`), Lógica Condicional (`CASE`) |
| **D2** | Recepciones Acumuladas vs Solicitadas (Atrasos Logísticos) | CTEs, `SUM()`, `NULLIF()`, Función de Ventana (`DENSE_RANK()`) |
| **D3** | Auditoría de Integridad: Devoluciones vs Ventas | CTEs, validación cruzada para detección de anomalías lógicas |
| **D4** | Comprobación de Sincronía de Fragmentación | Consultas correlacionadas, `UNION ALL`, control de conteo de filas |
| **D5** | Resumen Ejecutivo Consolidado por Sede | Subconsultas escalares agrupadas por sede |

---

## Descripción Detallada de Consultas

### D1. Clasificación de Riesgo de Cartera (`RANK`)
Evalúa los saldos pendientes de cada venta confirmada y asigna automáticamente una categoría de riesgo (`Riesgo Alto` si supera $500,000, `Pendiente Normal` o `Pagado`), ordenándolos mediante un ranking descendente de deuda.

### D2. Control de Proveedores y Atrasos (`DENSE_RANK`)
Compara las cantidades solicitadas en órdenes de compra frente a lo efectivamente recibido en recepciones de compra no anuladas, calculando el porcentaje de cumplimiento logístico y generando un ranking de retraso.

### D3. Auditoría de Integridad (`Devoluciones <= Vendido`)
Verifica que ningún detalle de devolución supere la cantidad originalmente vendida en el pedido respectivo, detectando anomalías o inconsistencias de datos en el sistema.

---

