import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [auth, setAuth] = useState(() => {
        const token = localStorage.getItem("token");
        const roles = JSON.parse(localStorage.getItem("roles") || "[]");
        const usuario = localStorage.getItem("usuario");
        return token ? { token, roles, usuario } : null;
    });

    const login = (data) => {
        localStorage.setItem("token", data.token);
        localStorage.setItem("roles", JSON.stringify(data.roles));
        localStorage.setItem("usuario", data.usuario);
        setAuth({ token: data.token, roles: data.roles, usuario: data.usuario });
    };
    const logout = () => {
        localStorage.clear();
        setAuth(null);
    };
    return (
        <AuthContext.Provider value={{ auth, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
export const useAuth = () => useContext(AuthContext);