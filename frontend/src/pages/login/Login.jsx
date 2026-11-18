import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiIdentidad } from "../api";
import { useAuth } from "../auth";

export default function Login() {
    const [usuario, setUsuario] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login } = useAuth();
    const nav = useNavigate();

    const entrar = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const { data } = await apiIdentidad.post("/auth/login", {
                nombre_usuario: usuario,
                password,
            });
            login(data);          // guarda token + roles
            nav("/dashboard");    // redirige segun rol
        } catch (err) {
            setError(err.response?.data?.error || "Error al iniciar sesion");
        }
    };

    return (
        <form onSubmit={entrar} style={{ maxWidth: 320, margin: "80px auto" }}>
            <h2>Iniciar sesion</h2>
            <input placeholder="Usuario" value={usuario}
                onChange={(e) => setUsuario(e.target.value)} />
            <input placeholder="Contrasena" type="password" value={password}
                onChange={(e) => setPassword(e.target.value)} />
            <button type="submit">Entrar</button>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
    );
}