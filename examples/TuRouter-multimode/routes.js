import { TuJsHtml, DI, createGroupUrl } from "./libs.js";
import { IAuthService } from "./contratos.js";

/**
 * Definición de Rutas del Sistema (Single Source of Truth)
 */
export const URL_HOME = () => "/";
export const URL_USERS = () => "/usuarios";
export const URL_USER_DETAIL = ({ id = "{id}" } = {}) => `/usuario/${id}`;
export const URL_POKEMON = ({ name = "{name}" } = {}) => `/pokemon/${name}`;
export const URL_POKEMON_LIST = () => "/pokemons";
export const URL_EJEMPLO = () => "/ejemplo";
export const URL_LOGIN = () => "/login";

// Grupo de páginas estáticas con autocompletado y tipado
export const URL_PAGES = createGroupUrl("/pages", {
    HOME: () => "/home",
    CONTACT: () => "/contacto"
});

/**
 * Configuración del Router
 * @param {import('./libs.js').TuRouterWeb} router
 */
export function setupRoutes(router) {
    // ILUSTRA ESTILO A: Carga diferida manual instanciando TuJsHtml inline directamente en el handler.
    // Útil cuando deseas controlar la instanciación de forma explícita.
    router.add(
        URL_USERS,
        (params) =>
            new TuJsHtml(async (tags) => (await import("./users/List.js")).default(tags, params))
    );

    // ILUSTRA ESTILO B: Importación dinámica pura. El módulo exporta un default que termina en "Tpl".
    // El cargador en app.js detecta este sufijo y lo envuelve automáticamente en TuJsHtml.
    router.add(URL_USER_DETAIL, () => import("./users/User.$id.js"));

    // ILUSTRA ESTILO C (Legacy/Raw HTML): Devuelve un string plano de HTML (ej: Home.js).
    // El cargador renderiza mediante innerHTML.
    router.add("/", () => import("./pages/Home.js"));

    // ILUSTRA ESTILO E (IAsyncPageTpl): Carga asíncrona con fetch remoto y cancelación mediante AbortSignal.
    router.add(URL_POKEMON, () => import("./pages/Pokemon.$name.js"));

    // ILUSTRA ESTILO F: Ejemplo básico que cumple la convención IPageTpl sincronamente.
    router.add(URL_EJEMPLO, () => import("./pages/Ejemplo.js"));

    // ILUSTRA ESTILO G (IPage - Vanilla JS DOM): Listado asíncrono asombroso hecho 100% con puro JS Vanilla.
    // Retorna el contenedor de inmediato de forma síncrona y carga la lista en segundo plano de forma abortable.
    router.add(URL_POKEMON_LIST, () => import("./pages/PokemonList.js"));

    // RUTA DE AUTENTICACIÓN (LOGIN)
    router.add(URL_LOGIN, () => import("./pages/Login.js"));

    // ILUSTRA ESTILO H (Lazy Route Group): Agrupación de rutas que comparten prefijo "/pages".
    // Las rutas se cargan de forma diferida solo cuando el usuario ingresa al grupo.
    router.group(URL_PAGES, (add) => {
        add(URL_PAGES.HOME, () => import("./pages/Home.js"));
        add(URL_PAGES.CONTACT, () => import("./pages/Contact.js"));
    });

    // --- GUARDAS DE NAVEGACIÓN (ROUTE GUARDS) ---

    // Protegemos detalles de Usuarios
    router.beforeEach((to) => {
        if (to.startsWith("/usuario/")) {
            const user = DI.Inject(IAuthService);
            if (user.isLoggedIn) return true;
            return URL_LOGIN();
        }
        return true;
    });

    // Protegemos PokeList y Detalles de Pokémons
    router.beforeEach((to) => {
        if (to.startsWith("/pokemon/")) {
            const user = DI.Inject(IAuthService);
            if (user.isLoggedIn) return true;
            return URL_LOGIN();
        }
        return true;
    });

    // const URL_USER = createGroupUrl("/user/{user_id}", {
    //     SETTINGS: "/config",
    //     POST: "/posts/{post_id}",
    //     POST2: ({ a = 123 }) => "/posts/" + a
    // });
}
