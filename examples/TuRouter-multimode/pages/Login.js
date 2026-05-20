import { TuLazyInject, ITuRouterWeb } from "../libs.js";
import { IAuthService } from "../contratos.js";

/**
 * Plantilla de Inicio de Sesión (Login) utilizando la sintaxis reactiva y declarativa TuJsHtml.
 * Cumple con el contrato de la convención IPageTpl.
 *
 * @type {import("../convencion.js").IPageTpl}
 */
export default function LoginTpl(tags, params) {
    // IMPORTANTE: Resolvemos el Router y el Servicio de Autenticación
    // vinculándolos al contexto envenenado de params para asegurar la coherencia de Scope.
    const router = TuLazyInject(ITuRouterWeb, { context: params });
    const auth = TuLazyInject(IAuthService);

    tags.div({ className: "login-card" }, (card) => {
        card.h2("🔐 Área Protegida");
        card.p(
            "Para explorar la PokeList, ver detalles de Pokémons o perfiles de usuarios, debés iniciar sesión."
        );

        card.div({ className: "form-group" }, (fg) => {
            fg.label("Nombre del Entrenador:");
            fg.input({
                type: "text",
                id: "page-login-username",
                placeholder: "Ej: Ash Ketchum",
                onkeydown: (e) => {
                    if (e.key === "Enter") {
                        document.getElementById("page-login-btn")?.click();
                    }
                }
            });
        });

        card.button(
            {
                id: "page-login-btn",
                className: "btn-accent",
                "@attrs": {
                    style: "width: 100%; justify-content: center; padding: 0.75rem; font-weight: 600;"
                },
                onclick: () => {
                    const input = document.getElementById("page-login-username");
                    const name = input?.value.trim();
                    if (name) {
                        // Iniciamos sesión en el servicio registrado en el DI
                        auth.login(name);

                        // Si el orquestador tiene guardada una redirección previa (ej: veníamos de /pokemons)
                        // navegamos hacia ella, de lo contrario lo enviamos al listado por defecto
                        const app = window.app;
                        if (app && app.pendingRedirect) {
                            const target = app.pendingRedirect;
                            app.pendingRedirect = null; // Limpiamos estado
                            router.navigate(target);
                        } else {
                            router.navigate("/pokemons");
                        }
                    } else {
                        alert("¡Por favor ingresá un nombre válido para continuar!");
                    }
                }
            },
            "Ingresar de forma Segura"
        );
    });
}
