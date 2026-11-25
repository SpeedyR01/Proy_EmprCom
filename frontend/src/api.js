import axios from "axios";

// Crea un cliente para cada microservicio
function crearCliente(baseURL) {
    const cli = axios.create({ baseURL });
    // Interceptor: antes de cada peticion, adjunta el token guardado
    cli.interceptors.request.use((config) => {
        const token = localStorage.getItem("token");
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    });
    return cli;
}

export const apiIdentidad = crearCliente(import.meta.env.VITE_URL_IDENTIDAD);
export const apiCatalogo = crearCliente(import.meta.env.VITE_URL_CATALOGO);
export const apiCompras = crearCliente(import.meta.env.VITE_URL_COMPRAS);
export const apiInventarios = crearCliente(import.meta.env.VITE_URL_INVENTARIOS);
export const apiTransferencias = crearCliente(import.meta.env.VITE_URL_TRANSFERENCIAS);
export const apiVentas = crearCliente(import.meta.env.VITE_URL_VENTAS);
export const apiReportes = crearCliente(import.meta.env.VITE_URL_REPORTES);