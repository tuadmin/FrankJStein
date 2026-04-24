// @since 0.1.1-alpha
import { TuContainer, TuInject, TuLazyInject } from "../../dist/frankjstein.js";

// --- Dominio / Lógica pura ---

/**
 * Servicio de Autenticación (Singleton)
 * Representa la sesión del usuario para toda la app.
 */
export class AuthService {
    user = { name: "Invitado", isLogged: false };

    login(username) {
        this.user = { name: username, isLogged: true };
        console.log(`[AuthService] Usuario logueado: ${username}`);
    }

    logout() {
        this.user = { name: "Invitado", isLogged: false };
        console.log(`[AuthService] Sesión cerrada`);
    }
}

/**
 * Servicio de API (Transient)
 * Requiere AuthService para obtener tokens y hacer peticiones.
 */
export class ApiService {
    // Inyección de la dependencia de forma declarativa y sincrónica
    //auth = TuInject(AuthService);
    auth = TuLazyInject(() => AuthService);
    constructor() {
        console.log("[ApiService] Instancia creada.");
    }

    async fetchDashboard() {
        if (!this.auth.user.isLogged) throw new Error("No estás logueado.");

        console.log(`[ApiService] Haciendo petición como: ${this.auth.user.name}`);
        // Simulando delay de red
        await new Promise(r => setTimeout(r, 1000));

        return `Datos súper secretos del servidor para el usuario ${this.auth.user.name}.`;
    }
}

// --- Registro en el Kernel (Contenedor) ---
// Registramos AuthService como Singleton (1 sola instancia en memoria compartida por todos)
TuContainer.addSingleton(AuthService);

// Registramos ApiService como Transient (1 instancia nueva cada vez que se hace TuContainer.resolve)
TuContainer.addTransient(ApiService);
