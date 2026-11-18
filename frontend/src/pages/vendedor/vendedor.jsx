import { useEffect, useState } from "react";
import { apiCatalogo, apiVentas } from "../api";
import { useAuth } from "../auth";

export default function Vendedor() {
    const { auth, logout } = useAuth();
    const [productos, setProductos] = useState([]);
    const [mensaje, setMensaje] = useState("");

    useEffect(() => {
        apiCatalogo.get("/catalogo/productos").then((r) => setProductos(r.data));
    }, []);

    const crearYConfirmar = async () => {
        try {
            // 1. crear pedido con el primer producto
            const p = productos[0];
            const { data: pedido } = await apiVentas.post("/ventas/pedidos", {
                id_sede: 1, id_almacen: 1, id_cliente: 1, id_empleado: 4,
                items: [{ id_producto: p.id_producto, cantidad: 1, precio_unitario: p.precio_lista }],
            });
            // 2. confirmar la venta (descuenta stock)
            const { data: venta } = await apiVentas.post(`/ventas/confirmar/${pedido.id_pedido}`);
            setMensaje(`Venta ${venta.id_venta} creada. ${venta.mensaje}`);
        } catch (e) {
            setMensaje(e.response?.data?.error || "Error");
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Panel Vendedor ({auth.usuario})</h2>
            <button onClick={logout}>Salir</button>
            <h3>Productos</h3>
            <ul>{productos.map((p) => <li key={p.id_producto}>{p.nombre} - ${p.precio_lista}</li>)}</ul>
            <button onClick={crearYConfirmar}>Crear venta de prueba</button>
            {mensaje && <p>{mensaje}</p>}
        </div>
    );
}