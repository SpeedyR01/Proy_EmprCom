# Frontend — Conexión con el Backend

Cómo el frontend se comunica con los 7 microservicios: variables de entorno,
clientes axios, manejo del token y autenticación.

---

## 1. Variables de entorno (.env del frontend)

El front no tiene URLs fijas en el código: las lee de variables que empiezan
con `VITE_` (requisito de Vite). Archivo `frontend/.env`:

```
VITE_URL_IDENTIDAD=https://ms-identidad-xxxx.onrender.com
VITE_URL_CATALOGO=https://ms-catalogo-xxxx.onrender.com
VITE_URL_COMPRAS=https://ms-compras-xxxx.onrender.com
VITE_URL_INVENTARIOS=https://ms-inventarios-xxxx.onrender.com
VITE_URL_TRANSFERENCIAS=https://ms-transferencias-xxxx.onrender.com
VITE_URL_VENTAS=https://ms-ventas-xxxx.onrender.com
VITE_URL_REPORTES=https://ms-reportes-xxxx.onrender.com
```

> En desarrollo local se pueden usar las URLs `http://localhost:400X`.
> En producción, las URLs públicas de Render. El `.env` NO se sube a git.

---

## 2. Clientes axios (api.js)

Hay un cliente por microservicio. Cada uno adjunta el token automáticamente
en cada petición mediante un interceptor:

```javascript
function crearCliente(baseURL) {
  const cli = axios.create({ baseURL });
  cli.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  return cli;
}

export const apiIdentidad      = crearCliente(import.meta.env.VITE_URL_IDENTIDAD);
export const apiCatalogo       = crearCliente(import.meta.env.VITE_URL_CATALOGO);
export const apiCompras        = crearCliente(import.meta.env.VITE_URL_COMPRAS);
export const apiInventarios    = crearCliente(import.meta.env.VITE_URL_INVENTARIOS);
export const apiTransferencias = crearCliente(import.meta.env.VITE_URL_TRANSFERENCIAS);
export const apiVentas         = crearCliente(import.meta.env.VITE_URL_VENTAS);
export const apiReportes       = crearCliente(import.meta.env.VITE_URL_REPORTES);
```

Ventaja: en cualquier página solo se hace `apiVentas.post('/ventas/pedidos', datos)`
y el token se añade solo.

---

## 3. Autenticación y sesión (auth.jsx)

El contexto `AuthProvider` maneja la sesión:

- **login(data):** guarda `token`, `roles` y `usuario` en localStorage y en el estado.
- **logout():** limpia todo y cierra sesión.
- **useAuth():** hook para leer la sesión desde cualquier componente.

```
Login exitoso → login(data) → localStorage: { token, roles, usuario }
Cada petición → interceptor lee el token → header Authorization: Bearer <token>
Logout        → localStorage.clear()
```

---

## 4. Qué microservicio usa cada pantalla

| Panel | Microservicios que consume |
|---|---|
| Login | apiIdentidad (`/auth/login`) |
| Admin | apiCatalogo (productos), apiIdentidad (usuarios) |
| Comprador | apiCompras (órdenes), apiCatalogo (proveedores) |
| Bodeguero | apiInventarios (existencias, movimientos) |
| Vendedor | apiCatalogo (productos), apiVentas (pedidos, confirmar) |
| Cajero | apiVentas (pagos, devoluciones) |
| Auditor | apiReportes (vistas de reportes) + consultas de lectura |

---

## 5. Puertos locales (referencia)

| Microservicio | Puerto local |
|---|---|
| ms-identidad | 4001 |
| ms-catalogo | 4002 |
| ms-compras | 4003 |
| ms-inventarios | 4004 |
| ms-transferencias | 4005 |
| ms-ventas | 4006 |
| ms-reportes | 4007 |

---

## 6. Puntos clave para que la conexión funcione

1. **CORS:** cada microservicio tiene `app.use(cors())`, así el front (otro origen)
   puede llamarlo.
2. **JWT_SECRET igual en todos:** el token que da ms-identidad debe ser válido en
   los demás; si un servicio tiene otro secreto, da "Token inválido".
3. **Token vigente:** el token expira (8h); si caduca, hay que volver a iniciar sesión.
4. **URLs sin `/` final:** las variables `VITE_URL_*` no deben terminar en `/`.
