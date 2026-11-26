# Frontend — Arquitectura y estructura

Documentación de la capa de presentación (interfaz web) del sistema.
Stack: **React + Vite**. Cada rol tiene su propia pantalla; el login decide cuál.

---

## 1. Tecnologías

| Herramienta | Uso |
|---|---|
| React + Vite | Librería de UI y arranque del proyecto |
| react-router-dom | Navegación entre pantallas y rutas protegidas |
| axios | Llamadas HTTP a los microservicios del backend |
| localStorage | Guardar la sesión (token + roles) en el navegador |

---

## 2. Estructura de carpetas

```
frontend/
├── index.html
├── vite.config.js
├── package.json
├── .env                     (URLs de los microservicios — NO se sube a git)
└── src/
    ├── main.jsx             (punto de entrada + router con rutas por rol)
    ├── api.js               (clientes axios, uno por microservicio)
    ├── auth.jsx             (contexto de sesión: login/logout/estado)
    ├── theme.js             (colores, tipografías, accent por rol)
    ├── index.css            (estilos globales y animaciones)
    ├── components/
    │   ├── PanelLayout.jsx    (barra superior + encabezado común a todos los paneles)
    │   ├── rutaProtegida.jsx  (bloquea rutas según el rol del usuario)
    │   ├── StateScreens.jsx   (pantallas de carga / error / vacío)
    │   └── ui.jsx             (librería de componentes: Button, Input, Card, Table, Toast…)
    └── pages/
        ├── login/            (inicio de sesión — común a todos)
        ├── dashboard/        (redirige a cada panel según el rol)
        ├── admin/            (panel Administrador)
        ├── comprador/        (panel Comprador)
        ├── bodeguero/        (panel Bodeguero)
        ├── vendedor/         (panel Vendedor)
        ├── cajero/           (panel Cajero)
        └── auditor/          (panel Auditor)
```

---

## 3. Flujo general

```
Usuario entra  →  Login  →  valida contra ms-identidad  →  recibe token + roles
                                                              │
                                   se guardan en localStorage │
                                                              ▼
                              Dashboard lee el rol  →  redirige al panel correcto
                                                              │
                              Cada panel llama a su(s) microservicio(s) con el token
```

- El **token (JWT)** viaja en cada petición (lo adjunta axios automáticamente).
- El **rol** del token decide qué pantalla ve el usuario y qué rutas puede abrir.

---

## 4. Rutas (main.jsx)

| Ruta | Pantalla | Protección |
|---|---|---|
| `/` | Login | pública |
| `/dashboard` | Dashboard (redirige) | requiere sesión |
| `/admin` | Admin | rol ADMINISTRADOR |
| `/comprador` | Comprador | rol COMPRADOR |
| `/bodeguero` | Bodeguero | rol BODEGUERO |
| `/vendedor` | Vendedor | rol VENDEDOR |
| `/cajero` | Cajero | rol CAJERO |
| `/auditor` | Auditor | rol AUDITOR |

Cada ruta de rol está envuelta en `<RutaProtegida rol="...">`, que:
1. Si no hay sesión → redirige al login.
2. Si el rol no coincide → muestra "sin acceso".

---

## 5. Componentes reutilizables (ui.jsx)

| Componente | Para qué |
|---|---|
| `Button` | Botones (primary / outline / small) |
| `Input` | Campos de formulario con label y error |
| `Card` | Tarjetas contenedoras |
| `Table` | Tablas de datos con columnas configurables |
| `Badge` | Etiquetas de estado |
| `Toast` | Notificaciones (éxito / error) |
| `ProductCard` / `CartRow` | Tarjeta de producto y fila de carrito (usados en Vendedor) |
| `ShortcutCard` | Atajos del panel |
| `Skeleton` | Animación de carga |

Usar estos componentes mantiene el estilo consistente en todas las pantallas.

---

## 6. Cómo ejecutar el frontend

```bash
cd frontend
npm install        # instala dependencias (solo la primera vez)
npm run dev        # arranca en http://localhost:5173
```

Requiere que el `.env` tenga las URLs de los microservicios (ver documento
"02 - Conexión con el Backend").