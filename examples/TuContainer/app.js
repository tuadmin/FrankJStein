// @since 0.1.1-alpha
import {
    ELEMENT_UTIL as $,
    createComputedSignal,
    createSignal,
    TuContainer,
    TuJsHtml
} from "../../dist/frankjstein.js";
import { ApiService, AuthService } from "./services.js";

const app = new TuJsHtml((tags) => {
    const { div, h2, p, button, input } = tags;

    // Resolvemos el Singleton desde la vista para reaccionar a él
    // Como es Singleton, recupera exactamente la misma instancia que inyecta ApiService
    const authService = TuContainer.resolve(AuthService);

    // Signals locales para gobernar la UI
    const isLogged = createSignal(authService.user.isLogged);
    const apiResponse = createSignal("");
    const currentName = createSignal(authService.user.name);

    div(() => {
        h2("Panel de Control");

        // Bloque de Login: Se esconde si está logueado
        div({ "@classToggle": { hidden: isLogged } }, () => {
            p`Inicia sesión para ver tu información.`;
            const userNameInput = input({ type: "text", placeholder: "Tu nombre..." });
            const btnLogin = button`Ingresar`;

            btnLogin[$].on("click", () => {
                if (userNameInput.value.trim() !== "") {
                    // Llamamos al negocio puro
                    authService.login(userNameInput.value);

                    // Actualizamos UI
                    isLogged.value = true;
                    currentName.value = authService.user.name;
                }
            });
        });

        // Dashboard Privado: Se esconde si NO está logueado
        // Usamos una computación al vuelo: si isLogged es false -> oculta esta capa
        const isNotLogged = createComputedSignal(isLogged, (value) => !value);
        div({ "@classToggle": { hidden: isNotLogged } }, () => {
            //p("Bienvenido, ", currentName, "!");
            p`Bienvenido, ${currentName}!`;

            const btnFetch = button`Obtener Datos Secretos`;
            const btnLogout = button("Salir", (_) => (_().style = 'style: "margin-left: 10px;"'));

            p(apiResponse).style = "color: blue;";

            btnFetch[$].on("click", async () => {
                const [, setApiResponse] = apiResponse.asTuple;
                try {
                    //apiResponse.value = "Cargando del servidor...";
                    setApiResponse("Cargando del servidor...");
                    // Resolvemos ApiService recién cuando lo necesitamos.
                    // Como es Transient, acá nace y muere una nueva instancia limpia de ApiService
                    // pero internamente usará la misma instancia Singleton de AuthService.
                    const api = TuContainer.resolve(ApiService);

                    const data = await api.fetchDashboard();
                    //apiResponse.value = data;
                    setApiResponse(data);
                } catch (e) {
                    //apiResponse.value = `Error: ${e.message}`;
                    setApiResponse(`Error: ${e.message}`);
                }
            });

            btnLogout[$].on("click", () => {
                authService.logout();
                isLogged.value = false;
                apiResponse.value = "";
                currentName.value = authService.user.name;
            });
        });
    });
});

document.getElementById("app").appendChild(app);
