import { TuJsHtml, ELEMENT_UTIL } from "../dist/frankjstein.js";

const app = new TuJsHtml(function (tags) {
    const { main, h1, p, button, hr } = tags;
    const { "div.user-card": userCard, "span.badge": badge } = tags;

    main({ style: { padding: "20px", fontFamily: "sans-serif" } });
    h1("Panel de Usuario");
    p("Ejemplo básico de asincronía con Frank J. Stein");
    hr();

    // Fragmento Asíncrono ($f) con Suspense integrado
    tags.$f(async ({ h2, ul, li }) => {

        // Simulamos una petición fetch que tarda 2 segundos
        await new Promise(resolve => setTimeout(resolve, 2000));

        userCard(({ div }) => {
            h2("Frank Stein");
            badge({ style: { backgroundColor: "green", color: "white" } }, "Online");

            ul(({ li }) => {
                li("Rol: Desarrollador Frontend");
                li("Nivel: Dios del DOM");
            });
        });

        const btn = button("Saludar");
        btn[ELEMENT_UTIL].on("click", () => alert("¡Está vivo!"));

    },
        // Fallback: Lo que el usuario ve mientras la promesa se resuelve
        function fallback({ div, p, i }) {
            div({ className: "loading-skeleton" }, ({ p, i }) => {
                p(i("Cargando datos del usuario, por favor espera..."));
            });
        });
});

export default app;